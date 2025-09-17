import os
from pathlib import Path
from typing import Dict, List, Tuple, Any

import yt_dlp


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


def progress_hook(d: Dict[str, Any]) -> None:
    if d.get("status") == "downloading":
        pct = d.get("_percent_str", "").strip()
        spd = d.get("_speed_str", "").strip()
        eta = d.get("_eta_str", "").strip()
        print(f"\rDescargando: {pct}  Vel: {spd}  ETA: {eta}", end="")
    elif d.get("status") == "finished":
        print("\nDescarga terminada. Procesando...")


def gather_resolutions(info: Dict[str, Any]) -> List[Tuple[str, str]]:
    """
    Devuelve una lista de opciones [(label, selector)], ordenadas de mayor a menor.
    - Si hay stream progresivo (video+audio en un solo formato), usa el format_id directo.
    - Si solo hay video, crea un selector que mezcle bestvideo[height=H]+bestaudio.
    """
    formats = info.get("formats", [])
    by_height: Dict[int, Dict[str, Any]] = {}

    for f in formats:
        vcodec = f.get("vcodec")
        height = f.get("height")
        if not vcodec or vcodec == "none" or not height:
            continue

        # Progresivo si trae audio
        is_progressive = f.get("acodec") not in (None, "none")
        tbr = f.get("tbr") or 0

        if height not in by_height:
            by_height[height] = {"progressive": None, "video_only": None}

        key = "progressive" if is_progressive else "video_only"
        current = by_height[height][key]
        if current is None or (tbr and tbr > (current.get("tbr") or 0)):
            by_height[height][key] = f

    options: List[Tuple[str, str]] = []
    for h in sorted(by_height.keys(), reverse=True):
        prog = by_height[h]["progressive"]
        vo = by_height[h]["video_only"]

        if prog:
            size = human_size((prog.get("filesize") or prog.get("filesize_approx") or 0))
            ext = prog.get("ext", "?")
            label = f"{h}p (progresivo, {ext}, ~{size})"
            selector = prog.get("format_id")
            options.append((label, selector))
        elif vo:
            # Mezcla: bestvideo con esa altura + bestaudio
            # Intentamos mp4+m4a; si no, yt-dlp hace fallback automático.
            label = f"{h}p (mezcla video+audio)"
            selector = f"bestvideo[height={h}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height={h}]+bestaudio"
            options.append((label, selector))

    return options


def choose_from_menu(title: str, items: List[str]) -> int:
    print(f"\n{title}\n" + "-" * len(title))
    for i, it in enumerate(items, start=1):
        print(f"{i}) {it}")
    while True:
        raw = input("Elige una opción (número): ").strip()
        if raw.isdigit():
            n = int(raw)
            if 1 <= n <= len(items):
                return n - 1
        print("Opción inválida, intenta nuevamente.")


def ensure_downloads_dir() -> str:
    out = Path("downloads")
    out.mkdir(exist_ok=True)
    return str(out)


def cookie_options() -> Dict[str, Any]:
    """
    Devuelve las opciones de cookies para yt-dlp:
    - Si existe cookies.txt (junto al script o en downloads/), usa cookiefile.
    - Si no, usa cookies del navegador Firefox.
    """
    script_dir = Path(__file__).parent
    candidates = [
        script_dir / "cookies.txt",
        script_dir / "downloads" / "cookies.txt",
    ]
    for p in candidates:
        if p.exists() and p.stat().st_size > 10:
            return {"cookiefile": str(p)}
    # Fallback a Firefox (evita problemas DPAPI de Chrome/Edge)
    return {"cookiesfrombrowser": ("firefox",)}


# ----------------------------
# Flujo principal
# ----------------------------
def main():
    print("=== YouTube descargador (yt-dlp + ffmpeg) ===")
    url = input("Pega la URL del video de YouTube: ").strip()

    base_out = ensure_downloads_dir()

    common_opts: Dict[str, Any] = {
        "noplaylist": True,
        "outtmpl": os.path.join(base_out, "%(title).200B [%(id)s].%(ext)s"),
        "progress_hooks": [progress_hook],
        # "restrictfilenames": True,  # opcional
        **cookie_options(),
    }

    # Primero extraemos info para listar formatos (¡con cookies!)
    with yt_dlp.YoutubeDL({**common_opts, "quiet": True, "skip_download": True}) as ydl:
        try:
            info = ydl.extract_info(url, download=False)
        except yt_dlp.utils.DownloadError as e:
            print(f"\nError al obtener info del video: {e}")
            return

    title = info.get("title", "(sin título)")
    duration = info.get("duration")
    dur_str = f"{duration // 60}m {duration % 60}s" if isinstance(duration, int) else "?"
    print(f"\nTítulo: {title}\nDuración: {dur_str}")

    # ¿Qué desea descargar?
    mode_idx = choose_from_menu(
        "¿Qué deseas descargar?",
        ["Video (elige resolución)", "Solo audio (MP3/M4A)"],
    )

    if mode_idx == 0:
        # VIDEO
        video_options = gather_resolutions(info)
        if not video_options:
            print("No se encontraron calidades de video. Intentando 'best'...")
            video_options = [("Automático (best)", "best")]

        choice_idx = choose_from_menu(
            "Elige la calidad de video",
            [lbl for (lbl, _) in video_options],
        )
        label, selector = video_options[choice_idx]

        # Forzar salida a MP4 al mezclar
        ydl_opts = {
            **common_opts,
            "merge_output_format": "mp4",
            "format": selector,  # puede ser format_id o un selector con '+'
        }

        print(f"\nDescargando: {label}")
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            print(f"\n✔ Listo. Archivo guardado en: {base_out}")
        except yt_dlp.utils.DownloadError as e:
            print(f"\nError en la descarga: {e}")

    else:
        # AUDIO
        # Elegir códec
        codec_idx = choose_from_menu("Elige códec de audio", ["MP3", "M4A (AAC)"])
        codec = "mp3" if codec_idx == 0 else "m4a"

        # Elegir bitrate
        br_options = ["128", "192", "256", "320"]
        br_idx = choose_from_menu("Elige bitrate (kbps)", br_options)
        bitrate = br_options[br_idx]

        ydl_opts = {
            **common_opts,
            "format": "bestaudio/best",
            "postprocessors": [
                {
                    "key": "FFmpegExtractAudio",
                    "preferredcodec": codec,
                    "preferredquality": bitrate,
                }
            ],
            # Alternativa (remux a .m4a sin reconvertir):
            # "postprocessors": [{"key": "FFmpegAudioRemuxer", "preferredcodec": "m4a"}]
        }

        print(f"\nDescargando audio: {codec.upper()} a {bitrate} kbps")
        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            print(f"\n✔ Listo. Archivo guardado en: {base_out}")
        except yt_dlp.utils.DownloadError as e:
            print(f"\nError en la descarga de audio: {e}")


if __name__ == "__main__":
    main()
