"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, XCircle, Zap } from "lucide-react";

interface DownloadStatus {
  id: string;
  status: string;
  progress: number;
  speed: string | null;
  eta: string | null;
  filename: string | null;
  error: string | null;
}

interface DownloadCardProps {
  downloadId: string;
}

export default function DownloadCard({ downloadId }: DownloadCardProps) {
  const [status, setStatus] = useState<DownloadStatus | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/download/${downloadId}/status`);
        const data = await response.json();
        setStatus(data);
      } catch (error) {
        console.error("Error fetching status:", error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 500);

    return () => clearInterval(interval);
  }, [downloadId]);

  if (!status) return null;

  const getStatusIcon = () => {
    switch (status.status) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "error":
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Loader2 className="w-6 h-6 text-youtube-red animate-spin" />;
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case "pending":
        return "Preparando descarga...";
      case "downloading":
        return "Descargando...";
      case "processing":
        return "Procesando video...";
      case "completed":
        return "¡Descarga completada!";
      case "error":
        return "Error en la descarga";
      default:
        return status.status;
    }
  };

  return (
    <div className="bg-youtube-gray rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-4 mb-4">
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className="font-semibold">{getStatusText()}</h3>
          {status.error && (
            <p className="text-sm text-red-400 mt-1">{status.error}</p>
          )}
        </div>
        {status.speed && status.status === "downloading" && (
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Zap className="w-4 h-4 text-yellow-500" />
            {status.speed}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      {(status.status === "downloading" || status.status === "processing") && (
        <div className="space-y-2">
          <div className="h-3 bg-youtube-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-youtube-red to-red-400 progress-bar rounded-full"
              style={{ width: `${status.progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-400">
            <span>{status.progress.toFixed(1)}%</span>
            {status.eta && <span>ETA: {status.eta}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
