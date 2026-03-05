"use client";

import { useEffect } from "react";

export default function ChunkErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Detectar errores de carga de chunks
      if (
        event.message?.includes("ChunkLoadError") ||
        event.message?.includes("Loading chunk") ||
        event.error?.name === "ChunkLoadError"
      ) {
        console.warn("Chunk load error detected, reloading page...");
        window.location.reload();
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (
        reason?.name === "ChunkLoadError" ||
        reason?.message?.includes("Loading chunk")
      ) {
        console.warn("Chunk load error detected, reloading page...");
        window.location.reload();
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, []);

  return null;
}
