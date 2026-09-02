// src/components/PdfViewer.tsx — react-pdf-viewer wrapper with page navigation

import { useEffect, useState } from "react";
import { Worker, Viewer, SpecialZoomLevel } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

interface PdfViewerProps {
  file: File;
  targetPage: number | null;
}

const WORKER_URL = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

export function PdfViewer({ file, targetPage }: PdfViewerProps) {
  const [fileUrl, setFileUrl] = useState<string>("");

  // Page navigation plugin gives us the jumpToPage API
  const pageNavPlugin = pageNavigationPlugin();
  const { jumpToPage } = pageNavPlugin;

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  // Create an object URL for the file
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Jump to target page when it changes (0-indexed internally)
  useEffect(() => {
    if (targetPage !== null && targetPage > 0) {
      // Delay slightly to let the viewer render
      const timer = setTimeout(() => {
        jumpToPage(targetPage - 1);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [targetPage, jumpToPage]);

  if (!fileUrl) {
    return (
      <div className="pdf-loading">
        <div className="spinner" />
        <span>Loading PDF…</span>
      </div>
    );
  }

  return (
    <div className="pdf-viewer-wrap">
      <Worker workerUrl={WORKER_URL}>
        <Viewer
          fileUrl={fileUrl}
          plugins={[defaultLayoutPluginInstance, pageNavPlugin]}
          defaultScale={SpecialZoomLevel.PageWidth}
        />
      </Worker>
    </div>
  );
}
