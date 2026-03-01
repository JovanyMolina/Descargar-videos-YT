"""
API Backend para el descargador de YouTube
Usando FastAPI para servir la interfaz web
"""

import os
import asyncio
import uuid
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import yt_dlp


# ----------------------------
# Modelos Pydantic
# ----------------------------
class VideoInfoRequest(BaseModel):
    url: str


class DownloadRequest(BaseModel):
    url: str
    format_selector: str
    download_type: str  # "video" o "audio"
    audio_codec: Optional[str] = None  # "mp3" o "m4a"
    audio_bitrate: Optional[str] = None  # "128", "192", "256", "320"


class VideoInfo(BaseModel):
    title: str
    duration: Optional[int]
    duration_str: str
    thumbnail: Optional[str]
    channel: Optional[str]
    view_count: Optional[int]
    resolutions: List[Dict[str, str]]


class DownloadStatus(BaseModel):
    id: str
    status: str  # "pending", "downloading", "processing", "completed", "error"
    progress: float
    speed: Optional[str]
    eta: Optional[str]
    filename: Optional[str]
    error: Optional[str]


# ----------------------------
# Almacén de descargas en memoria
# ----------------------------
downloads_status: Dict[str, DownloadStatus] = {}


# ----------------------------
# FastAPI App
# ----------------------------
app = FastAPI(
    title="YouTube Downloader API",
    description="API para descargar videos de YouTube",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ----------------------------
# Utilidades
# ----------------------------
def human_size(n: float) -> str:
    if n is None:
        return "?"
    units = ["B", "KB", "MB", "GB"]
    i = 0
    while n >= 1024 and i < len(units) - 1:
        n /= 1024
        i += 1
    return f"{n:.1f} {units[i]}"


def ensure_downloads_dir() -> str:
    out = Path(__file__).parent.parent / "downloads"
    out.mkdir(exist_ok=True)
    return str(out)


def cookie_options() -> Dict[str, Any]:
    """
    Devuelve las opciones de cookies para yt-dlp
    """
    script_dir = Path(__file__).parent.parent
    candidates = [
        script_dir / "cookies.txt",
        script_dir / "downloads" / "cookies.txt",
    ]
    for p in candidates:
        if p.exists() and p.stat().st_size > 10:
            return {"cookiefile": str(p)}
    return {}


def gather_resolutions(info: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Devuelve una lista de opciones de resolución
    """
    formats = info.get("formats", [])
    duration = info.get("duration", 0) or 0
    by_height: Dict[int, Dict[str, Any]] = {}

    for f in formats:
        vcodec = f.get("vcodec")
        height = f.get("height")
        if not vcodec or vcodec == "none" or not height:
            continue

        is_progressive = f.get("acodec") not in (None, "none")
        tbr = f.get("tbr") or 0

        if height not in by_height:
            by_height[height] = {"progressive": None, "video_only": None}

        key = "progressive" if is_progressive else "video_only"
        current = by_height[height][key]
        if current is None or (tbr and tbr > (current.get("tbr") or 0)):
            by_height[height][key] = f

    options: List[Dict[str, str]] = []
    for h in sorted(by_height.keys(), reverse=True):
        prog = by_height[h]["progressive"]
        vo = by_height[h]["video_only"]

        if prog:
            filesize = prog.get("filesize") or prog.get("filesize_approx")
            if not filesize and duration > 0:
                tbr = prog.get("tbr") or 0
                if tbr > 0:
                    filesize = (tbr * 1000 / 8) * duration

            size_str = f"~{human_size(filesize)}" if filesize else ""
            ext = prog.get("ext", "mp4")
            fps = prog.get("fps")
            fps_str = f" {fps}fps" if fps and fps > 30 else ""

            label = f"{h}p{fps_str} ({ext}){' ' + size_str if size_str else ''}"
            # Selector con fallbacks robustos usando la altura conocida
            selector = f"bestvideo[height<={h}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<={h}]+bestaudio/best[height<={h}]/best"
            options.append({"label": label, "selector": selector, "height": str(h)})
        elif vo:
            filesize = vo.get("filesize") or vo.get("filesize_approx")
            if not filesize and duration > 0:
                tbr = vo.get("tbr") or 0
                if tbr > 0:
                    filesize = ((tbr + 128) * 1000 / 8) * duration

            size_str = f"~{human_size(filesize)}" if filesize else ""
            fps = vo.get("fps")
            fps_str = f" {fps}fps" if fps and fps > 30 else ""

            label = f"{h}p{fps_str} (video+audio){' ' + size_str if size_str else ''}"
            selector = f"bestvideo[height<={h}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<={h}]+bestaudio/best[height<={h}]/best"
            options.append({"label": label, "selector": selector, "height": str(h)})

    if not any(opt["height"] == "best" for opt in options):
        options.append({"label": "Mejor calidad disponible", "selector": "bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best", "height": "best"})

    return options


import re

def strip_ansi(text: str) -> str:
    """Elimina códigos de escape ANSI de un string"""
    if not text:
        return ""
    ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
    return ansi_escape.sub('', text).strip()


def create_progress_hook(download_id: str):
    """Crea un hook de progreso para una descarga específica"""
    def progress_hook(d: Dict[str, Any]) -> None:
        if download_id not in downloads_status:
            return

        if d.get("status") == "downloading":
            pct = 0
            downloaded = d.get("downloaded_bytes", 0)
            total = d.get("total_bytes") or d.get("total_bytes_estimate", 0)
            if downloaded and total and total > 0:
                pct = (downloaded / total) * 100
            else:
                pct_str = strip_ansi(d.get("_percent_str", "0%"))
                try:
                    pct = float(pct_str.replace("%", "").strip())
                except:
                    pct = 0

            speed = strip_ansi(d.get("_speed_str", ""))
            eta = strip_ansi(d.get("_eta_str", ""))

            downloads_status[download_id].status = "downloading"
            downloads_status[download_id].progress = round(pct, 1)
            downloads_status[download_id].speed = speed if speed else None
            downloads_status[download_id].eta = eta if eta else None

        elif d.get("status") == "finished":
            downloads_status[download_id].status = "processing"
            downloads_status[download_id].progress = 100
            downloads_status[download_id].filename = d.get("filename")

    return progress_hook


# ----------------------------
# Endpoints
# ----------------------------
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


@app.post("/api/video-info", response_model=VideoInfo)
async def get_video_info(request: VideoInfoRequest):
    """Obtiene información del video sin descargarlo"""
    common_opts: Dict[str, Any] = {
        "noplaylist": True,
        "quiet": True,
        "skip_download": True,
        "no_warnings": True,
        "ignoreerrors": False,
        "extract_flat": False,
        "format": None,
    }

    try:
        with yt_dlp.YoutubeDL(common_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)
            if info is None:
                raise HTTPException(status_code=400, detail="No se pudo obtener información del video")
    except yt_dlp.utils.DownloadError as e:
        error_msg = str(e)
        error_msg = re.sub(r'\x1b\[[0-9;]*m', '', error_msg)
        raise HTTPException(status_code=400, detail=f"Error al obtener info: {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inesperado: {str(e)}")

    title = info.get("title", "(sin título)")
    duration = info.get("duration")
    dur_str = f"{duration // 60}m {duration % 60}s" if isinstance(duration, int) else "?"

    resolutions = gather_resolutions(info)
    if not resolutions:
        resolutions = [{"label": "Automático (best)", "selector": "best", "height": "auto"}]

    return VideoInfo(
        title=title,
        duration=duration,
        duration_str=dur_str,
        thumbnail=info.get("thumbnail"),
        channel=info.get("channel") or info.get("uploader"),
        view_count=info.get("view_count"),
        resolutions=resolutions
    )


@app.post("/api/download")
async def start_download(request: DownloadRequest, background_tasks: BackgroundTasks):
    """Inicia una descarga en segundo plano"""
    download_id = str(uuid.uuid4())

    downloads_status[download_id] = DownloadStatus(
        id=download_id,
        status="pending",
        progress=0,
        speed=None,
        eta=None,
        filename=None,
        error=None
    )

    background_tasks.add_task(
        perform_download,
        download_id,
        request.url,
        request.format_selector,
        request.download_type,
        request.audio_codec,
        request.audio_bitrate
    )

    return {"download_id": download_id}


async def perform_download(
    download_id: str,
    url: str,
    format_selector: str,
    download_type: str,
    audio_codec: Optional[str],
    audio_bitrate: Optional[str]
):
    """Ejecuta la descarga en segundo plano"""
    base_out = ensure_downloads_dir()

    common_opts: Dict[str, Any] = {
        "noplaylist": True,
        "outtmpl": os.path.join(base_out, "%(title).200B [%(id)s].%(ext)s"),
        "progress_hooks": [create_progress_hook(download_id)],
        **cookie_options(),
        "http_headers": {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
        },
        "extractor_args": {
            "youtube": {
                # android evita muchos errores 403 en streams
                "player_client": ["android", "web"],
            }
        },
        "retries": 5,
        "fragment_retries": 5,
    }

    try:
        if download_type == "video":
            ydl_opts = {
                **common_opts,
                "merge_output_format": "mp4",
                # ✅ CORREGIDO: ya no usa la variable `h` inexistente
                # format_selector ya viene con fallbacks desde gather_resolutions
                "format": format_selector,
                "format_sort": ["res", "ext:mp4:m4a"],
                "ignoreerrors": False,
            }
        else:  # audio
            ydl_opts = {
                **common_opts,
                "format": "bestaudio/best",
                "postprocessors": [
                    {
                        "key": "FFmpegExtractAudio",
                        "preferredcodec": audio_codec or "mp3",
                        "preferredquality": audio_bitrate or "192",
                    }
                ],
            }

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: download_with_ytdlp(ydl_opts, url, download_id))

    except Exception as e:
        downloads_status[download_id].status = "error"
        downloads_status[download_id].error = str(e)


def download_with_ytdlp(ydl_opts: Dict[str, Any], url: str, download_id: str):
    """Descarga el video usando yt-dlp"""
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        downloads_status[download_id].status = "completed"
        downloads_status[download_id].progress = 100
    except yt_dlp.utils.DownloadError as e:
        downloads_status[download_id].status = "error"
        downloads_status[download_id].error = str(e)
    except Exception as e:
        downloads_status[download_id].status = "error"
        downloads_status[download_id].error = str(e)


@app.get("/api/download/{download_id}/status", response_model=DownloadStatus)
async def get_download_status(download_id: str):
    """Obtiene el estado de una descarga"""
    if download_id not in downloads_status:
        raise HTTPException(status_code=404, detail="Descarga no encontrada")
    return downloads_status[download_id]


@app.get("/api/downloads")
async def list_downloads():
    """Lista todos los archivos descargados"""
    downloads_dir = ensure_downloads_dir()
    files = []

    for f in Path(downloads_dir).iterdir():
        if f.is_file() and not f.name.endswith('.part'):
            stat = f.stat()
            files.append({
                "name": f.name,
                "size": human_size(stat.st_size),
                "size_bytes": stat.st_size,
                "modified": datetime.fromtimestamp(stat.st_mtime).isoformat(),
            })

    files.sort(key=lambda x: x["modified"], reverse=True)
    return files


@app.get("/api/download-file/{filename}")
async def download_file(filename: str):
    """Descarga un archivo específico"""
    downloads_dir = ensure_downloads_dir()
    file_path = Path(downloads_dir) / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type="application/octet-stream"
    )


# ----------------------------
# Main
# ----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)