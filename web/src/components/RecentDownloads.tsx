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
} from "lucide-react";

interface DownloadedFile {
  name: string;
  size: string;
  size_bytes: number;
  modified: string;
}

interface RecentDownloadsProps {
  refreshTrigger: number;
}

export default function RecentDownloads({
  refreshTrigger,
}: RecentDownloadsProps) {
  const [files, setFiles] = useState<DownloadedFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/downloads");
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching downloads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [refreshTrigger]);

  const handleDownload = (filename: string) => {
    window.open(`/api/download-file/${encodeURIComponent(filename)}`, "_blank");
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["mp3", "m4a", "aac", "wav", "flac"].includes(ext || "")) {
      return <FileAudio className="w-5 h-5 text-purple-400" />;
    }
    return <FileVideo className="w-5 h-5 text-blue-400" />;
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="bg-youtube-gray rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <FolderOpen className="w-5 h-5 text-youtube-red" />
          <h3 className="font-semibold">Descargas Recientes</h3>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-youtube-dark rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-youtube-gray rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-youtube-red" />
          <h3 className="font-semibold">Descargas Recientes</h3>
          <span className="text-sm text-gray-500">({files.length})</span>
        </div>
        <button
          onClick={fetchFiles}
          className="p-2 hover:bg-youtube-dark rounded-lg transition-colors"
          title="Actualizar lista"
        >
          <RefreshCw className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {files.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <HardDrive className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No hay descargas aún</p>
          <p className="text-sm">Los archivos descargados aparecerán aquí</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center gap-3 p-3 bg-youtube-dark rounded-lg hover:bg-gray-800 transition-colors group"
            >
              {getFileIcon(file.name)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {file.size} • {formatDate(file.modified)}
                </p>
              </div>
              <button
                onClick={() => handleDownload(file.name)}
                className="p-2 bg-youtube-red/20 hover:bg-youtube-red text-youtube-red hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Descargar archivo"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
