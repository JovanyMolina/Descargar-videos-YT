"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Download,
  FileVideo,
  FileAudio,
  Trash2,
  RefreshCw,
  FolderOpen,
  HardDrive,
  Search,
  Filter,
} from "lucide-react";

interface DownloadedFile {
  name: string;
  size: string;
  size_bytes: number;
  modified: string;
}

export default function DownloadsPage() {
  const [files, setFiles] = useState<DownloadedFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<DownloadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "video" | "audio">("all");

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/downloads");
      const data = await response.json();
      setFiles(data);
      setFilteredFiles(data);
    } catch (error) {
      console.error("Error fetching downloads:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron cargar las descargas",
        background: "#272727",
        color: "#fff",
        confirmButtonColor: "#FF0000",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    let result = files;

    // Filtrar por búsqueda
    if (searchQuery) {
      result = result.filter((file) =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por tipo
    if (filter !== "all") {
      result = result.filter((file) => {
        const ext = file.name.split(".").pop()?.toLowerCase();
        const audioExts = ["mp3", "m4a", "aac", "wav", "flac", "ogg"];
        const isAudio = audioExts.includes(ext || "");
        return filter === "audio" ? isAudio : !isAudio;
      });
    }

    setFilteredFiles(result);
  }, [searchQuery, filter, files]);

  const handleDownload = (filename: string) => {
    window.open(`/api/download-file/${encodeURIComponent(filename)}`, "_blank");
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["mp3", "m4a", "aac", "wav", "flac", "ogg"].includes(ext || "")) {
      return <FileAudio className="w-6 h-6 text-purple-400" />;
    }
    return <FileVideo className="w-6 h-6 text-blue-400" />;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTotalSize = () => {
    const total = filteredFiles.reduce((acc, file) => acc + file.size_bytes, 0);
    if (total >= 1024 * 1024 * 1024) {
      return `${(total / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    if (total >= 1024 * 1024) {
      return `${(total / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(total / 1024).toFixed(2)} KB`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mis Descargas</h1>
          <p className="text-gray-400">
            {filteredFiles.length} archivos • {getTotalSize()} total
          </p>
        </div>
        <button
          onClick={fetchFiles}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-youtube-gray hover:bg-gray-700 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Filters */}
      <div className="bg-youtube-gray rounded-xl p-4 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar archivos..."
              className="w-full bg-youtube-dark border border-gray-700 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-500 focus:outline-none focus:border-youtube-red"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          </div>

          {/* Type Filter */}
          <div className="flex gap-2">
            {(["all", "video", "audio"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === type
                    ? "bg-youtube-red text-white"
                    : "bg-youtube-dark text-gray-400 hover:text-white"
                }`}
              >
                {type === "all"
                  ? "Todos"
                  : type === "video"
                  ? "Videos"
                  : "Audio"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-youtube-gray rounded-xl p-4 animate-shimmer"
            >
              <div className="h-24" />
            </div>
          ))}
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="bg-youtube-gray rounded-xl p-12 text-center">
          <HardDrive className="w-16 h-16 mx-auto mb-4 text-gray-600" />
          <h3 className="text-xl font-semibold mb-2">No hay archivos</h3>
          <p className="text-gray-500">
            {searchQuery || filter !== "all"
              ? "No se encontraron archivos con los filtros aplicados"
              : "Los archivos descargados aparecerán aquí"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.name}
              className="bg-youtube-gray rounded-xl p-4 hover:bg-gray-700/50 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="p-3 bg-youtube-dark rounded-lg">
                  {getFileIcon(file.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-sm line-clamp-2 mb-1"
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">{file.size}</p>
                  <p className="text-xs text-gray-600">
                    {formatDate(file.modified)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDownload(file.name)}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-youtube-red/20 hover:bg-youtube-red text-youtube-red hover:text-white rounded-lg transition-all"
              >
                <Download className="w-4 h-4" />
                Descargar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
