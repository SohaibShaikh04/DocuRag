// src/components/UploadView.tsx — Midnight Ember upload interface

import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { uploadPdf } from "../api";
import { useStore } from "../store/useStore";

const MAX_SIZE = 20 * 1024 * 1024;

export function UploadView() {
  const { setSession, setUploadStatus } = useStore();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith(".pdf")) return "Only PDF files are accepted.";
    if (file.size > MAX_SIZE)
      return `File exceeds the 20 MB limit (${(file.size / 1_048_576).toFixed(1)} MB).`;
    return null;
  };

  const pick = useCallback((file: File) => {
    const err = validate(file);
    if (err) { setFileError(err); setSelectedFile(null); return; }
    setFileError(null);
    setSelectedFile(file);
    setUploadProgress(0);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) pick(f);
  }, [pick]);

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;
    setIsUploading(true);
    setUploadStatus("uploading");
    setUploadProgress(0);
    try {
      const result = await uploadPdf(selectedFile, (pct) => {
        setUploadProgress(pct);
        if (pct === 100) setUploadStatus("indexing");
      });
      setUploadStatus("ready");
      toast.success("Document indexed successfully!");
      setSession(result.collection_id, result.filename, selectedFile);
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? err?.message ?? "Upload failed.";
      toast.error(detail);
      setFileError(detail);
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  const fmtSize = (b: number) =>
    b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(2)} MB`;

  return (
    <div className="upload-page">
      {/* Hero */}
      <div className="upload-hero" style={{ "--delay": "0ms" } as React.CSSProperties}>
        <div className="ember-icon-wrap">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M20 4C11.16 4 4 11.16 4 20s7.16 16 16 16 16-7.16 16-16S28.84 4 20 4z"
              stroke="#F59E0B"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M20 12v10M20 12l-4 5M20 12l4 5"
              stroke="#F59E0B"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M13 26h14" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="upload-title">Chat with your PDF</h1>
        <p className="upload-subtitle">
          Drop any document. Ask anything. Get answers with source citations.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`drop-zone ${isDragOver ? "drop-zone--over" : ""} ${selectedFile ? "drop-zone--has-file" : ""}`}
        style={{ "--delay": "80ms" } as React.CSSProperties}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !isUploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Click or drag a PDF file here"
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          style={{ display: "none" }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); }}
        />

        {!selectedFile ? (
          <div className="drop-zone-inner">
            <div className="drop-zone-icon">
              <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                <path d="M22 8v20M22 8l-8 8M22 8l8 8" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 36v2a2 2 0 002 2h28a2 2 0 002-2v-2" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="drop-primary">{isDragOver ? "Release to upload" : "Drop your PDF here"}</p>
            <p className="drop-secondary">or click to browse · max 20 MB</p>
          </div>
        ) : (
          <div className="file-preview-row">
            <div className="file-pdf-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="7" fill="rgba(245,158,11,0.12)" />
                <path d="M8 24V8h9l6 6v10H8z" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
                <path d="M17 8v6h6" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round" />
                <text x="10" y="21" fontSize="5" fill="#F59E0B" fontWeight="700" fontFamily="monospace">PDF</text>
              </svg>
            </div>
            <div className="file-meta">
              <span className="file-name">{selectedFile.name}</span>
              <span className="file-size">{fmtSize(selectedFile.size)}</span>
            </div>
            {!isUploading && (
              <button
                className="file-remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setFileError(null);
                  setUploadProgress(0);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                aria-label="Remove file"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {fileError && (
        <div className="upload-error-banner" role="alert" style={{ "--delay": "0ms" } as React.CSSProperties}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="7.5" cy="7.5" r="6.5" stroke="#F87171" strokeWidth="1.2" />
            <path d="M7.5 4.5v3.5M7.5 10v1" stroke="#F87171" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          {fileError}
        </div>
      )}

      {/* Progress */}
      {isUploading && (
        <div className="upload-progress-wrap" style={{ "--delay": "0ms" } as React.CSSProperties}>
          <div className="upload-progress-track">
            <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
          </div>
          <span className="upload-progress-label">
            {uploadProgress < 100 ? `Uploading… ${uploadProgress}%` : "Indexing document…"}
          </span>
        </div>
      )}

      {/* CTA */}
      <button
        className="ember-btn"
        style={{ "--delay": "160ms" } as React.CSSProperties}
        disabled={!selectedFile || isUploading || !!fileError}
        onClick={handleUpload}
      >
        {isUploading ? (
          <><span className="ember-spinner" /> Processing…</>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1.5v9M8 1.5L4 5.5M8 1.5l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M1.5 12.5v1a1 1 0 001 1h11a1 1 0 001-1v-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Upload &amp; Process
          </>
        )}
      </button>

      {/* Feature pills */}
      <div className="feature-pills" style={{ "--delay": "240ms" } as React.CSSProperties}>
        {[
          { icon: "🔒", text: "Private" },
          { icon: "📄", text: "Page Citations" },
          { icon: "⚡", text: "LLM Powered" },
          { icon: "🔍", text: "Semantic Search" },
        ].map((f) => (
          <div className="feature-pill" key={f.text}>
            <span>{f.icon}</span>
            <span>{f.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
