"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Download,
  Music,
  Video,
  Loader2,
  Search,
  Clock,
  Eye,
  User,
} from "lucide-react";
import DownloadCard from "@/components/DownloadCard";
/* import RecentDownloads from "@/components/RecentDownloads"; */

interface Resolution {
  label: string;
  selector: string;
  height: string;
}

interface VideoInfo {
  title: string;
  duration: number | null;
  duration_str: string;
  thumbnail: string | null;
  channel: string | null;
  view_count: number | null;
  resolutions: Resolution[];
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [downloadType, setDownloadType] = useState<"video" | "audio">("video");
  const [selectedResolution, setSelectedResolution] = useState<string>("");
  const [audioCodec, setAudioCodec] = useState<"mp3" | "m4a">("mp3");
  const [audioBitrate, setAudioBitrate] = useState<string>("192");
  const [downloading, setDownloading] = useState(false);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [refreshDownloads, setRefreshDownloads] = useState(0);

  const fetchVideoInfo = async () => {
    if (!url.trim()) {
      Swal.fire({
        icon: "warning",
        title: "URL vacía",
        text: "Por favor, ingresa una URL de YouTube",
        background: "#272727",
        color: "#fff",
        confirmButtonColor: "#FF0000",
      });
      return;
    }

    setLoading(true);
    setVideoInfo(null);

    try {
      const response = await fetch("/api/video-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.detail || "Error al obtener información del video"
        );
      }

      const data: VideoInfo = await response.json();
      setVideoInfo(data);

      if (data.resolutions.length > 0) {
        setSelectedResolution(data.resolutions[0].selector);
      }

      Swal.fire({
        icon: "success",
        title: "¡Video encontrado!",
        text: data.title,
        background: "#272727",
        color: "#fff",
        confirmButtonColor: "#FF0000",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Error desconocido",
        background: "#272727",
        color: "#fff",
        confirmButtonColor: "#FF0000",
      });
    } finally {
      setLoading(false);
    }
  };

  const startDownload = async () => {
    if (!videoInfo) return;

    setDownloading(true);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          format_selector: selectedResolution,
          download_type: downloadType,
          audio_codec: audioCodec,
          audio_bitrate: audioBitrate,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al iniciar la descarga");
      }

      const data = await response.json();
      setDownloadId(data.download_id);

      Swal.fire({
        icon: "info",
        title: "Descarga iniciada",
        text: "El video se está descargando...",
        background: "#272727",
        color: "#fff",
        confirmButtonColor: "#FF0000",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      setDownloading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error instanceof Error ? error.message : "Error al iniciar descarga",
        background: "#272727",
        color: "#fff",
        confirmButtonColor: "#FF0000",
      });
    }
  };

  // Polling para el estado de la descarga
  useEffect(() => {
    if (!downloadId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/download/${downloadId}/status`);
        const status = await response.json();

        if (status.status === "completed") {
          clearInterval(interval);
          setDownloading(false);
          setDownloadId(null);
          setRefreshDownloads((prev) => prev + 1);

          Swal.fire({
            icon: "success",
            title: "¡Descarga completada!",
            text: "El archivo se ha guardado correctamente",
            background: "#272727",
            color: "#fff",
            confirmButtonColor: "#FF0000",
          });
        } else if (status.status === "error") {
          clearInterval(interval);
          setDownloading(false);
          setDownloadId(null);

          Swal.fire({
            icon: "error",
            title: "Error en la descarga",
            text: status.error || "Error desconocido",
            background: "#272727",
            color: "#fff",
            confirmButtonColor: "#FF0000",
          });
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [downloadId]);

  const formatViewCount = (count: number | null) => {
    if (!count) return "?";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-youtube-red to-red-400 bg-clip-text text-transparent">
          YouTube Downloader
        </h1>
        <p className="text-gray-400 text-lg">
          Descarga videos y audio de YouTube en alta calidad
        </p>
      </div>

      {/* URL Input */}
      <div className="bg-youtube-gray rounded-xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchVideoInfo()}
              placeholder="Pega la URL del video de YouTube aquí..."
              className="w-full bg-youtube-dark border border-gray-700 rounded-lg px-4 py-3 pl-12 text-white placeholder-gray-500 focus:outline-none focus:border-youtube-red focus:ring-1 focus:ring-youtube-red transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
          </div>
          <button
            onClick={fetchVideoInfo}
            disabled={loading}
            className="bg-youtube-red hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-all flex items-center justify-center gap-2 min-w-[140px]"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Buscar
              </>
            )}
          </button>
        </div>
      </div>

      {/* Video Info Card */}
      {videoInfo && (
        <div className="bg-youtube-gray rounded-xl overflow-hidden shadow-xl animate-in fade-in duration-500">
          <div className="md:flex">
            {/* Thumbnail */}
            <div className="md:w-2/5 relative">
              {videoInfo.thumbnail ? (
                <img
                  src={videoInfo.thumbnail}
                  alt={videoInfo.title}
                  className="w-full h-48 md:h-full object-cover"
                />
              ) : (
                <div className="w-full h-48 md:h-full bg-gray-800 flex items-center justify-center">
                  <Video className="w-16 h-16 text-gray-600" />
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-sm">
                {videoInfo.duration_str}
              </div>
            </div>

            {/* Info */}
            <div className="md:w-3/5 p-6 space-y-4">
              <h2 className="text-xl font-semibold line-clamp-2">
                {videoInfo.title}
              </h2>

              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                {videoInfo.channel && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {videoInfo.channel}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {videoInfo.duration_str}
                </div>
                {videoInfo.view_count && (
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {formatViewCount(videoInfo.view_count)} vistas
                  </div>
                )}
              </div>

              {/* Download Type Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setDownloadType("video")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    downloadType === "video"
                      ? "bg-youtube-red text-white"
                      : "bg-youtube-dark text-gray-400 hover:text-white"
                  }`}
                >
                  <Video className="w-4 h-4" />
                  Video
                </button>
                <button
                  onClick={() => setDownloadType("audio")}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    downloadType === "audio"
                      ? "bg-youtube-red text-white"
                      : "bg-youtube-dark text-gray-400 hover:text-white"
                  }`}
                >
                  <Music className="w-4 h-4" />
                  Audio
                </button>
              </div>

              {/* Video Options */}
              {downloadType === "video" && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Resolución:</label>
                  <select
                    value={selectedResolution}
                    onChange={(e) => setSelectedResolution(e.target.value)}
                    className="w-full bg-youtube-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-youtube-red"
                  >
                    {videoInfo.resolutions.map((res) => (
                      <option key={res.selector} value={res.selector}>
                        {res.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Audio Options */}
              {downloadType === "audio" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Formato:</label>
                    <select
                      value={audioCodec}
                      onChange={(e) =>
                        setAudioCodec(e.target.value as "mp3" | "m4a")
                      }
                      className="w-full bg-youtube-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-youtube-red"
                    >
                      <option value="mp3">MP3</option>
                      <option value="m4a">M4A (AAC)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Bitrate:</label>
                    <select
                      value={audioBitrate}
                      onChange={(e) => setAudioBitrate(e.target.value)}
                      className="w-full bg-youtube-dark border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-youtube-red"
                    >
                      <option value="128">128 kbps</option>
                      <option value="192">192 kbps</option>
                      <option value="256">256 kbps</option>
                      <option value="320">320 kbps</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Download Button */}
              <button
                onClick={startDownload}
                disabled={downloading}
                className="w-full bg-gradient-to-r from-youtube-red to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Descargando...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Descargar {downloadType === "video" ? "Video" : "Audio"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Progress Card */}
      {downloadId && <DownloadCard downloadId={downloadId} />}

      {/* Recent Downloads */}
      {/*  <RecentDownloads refreshTrigger={refreshDownloads} /> */}
    </div>
  );
}
