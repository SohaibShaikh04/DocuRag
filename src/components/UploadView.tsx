// src/components/UploadView.tsx

import { useCallback, useRef, useState } from "react";
import { FileText, Upload, X, AlertCircle, Search, BookOpen, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { uploadPdf } from "../api";
import { useStore } from "../store/useStore";

const MAX_SIZE = 20 * 1024 * 1024;

const fmtSize = (b: number) =>
  b < 1024 ? `${b} B` : b < 1_048_576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1_048_576).toFixed(2)} MB`;

export function UploadView() {
  const { setSession, setUploadStatus } = useStore();
  const [isDragOver, setIsDragOver]     = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError]       = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading]   = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File): string | null => {
    if (!file.name.toLowerCase().endsWith(".pdf")) return "Only PDF files are accepted.";
    if (file.size > MAX_SIZE) return `File is too large (${fmtSize(file.size)} · max 20 MB).`;
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

  return (
    <div className="upload-page">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="upload-header">
        <p className="upload-eyebrow">DocuRag</p>
        <h1 className="upload-title">Chat with your PDF</h1>
        <p className="upload-subtitle">
          Upload any document and ask questions. Answers are cited to exact pages.
        </p>
      </div>

      {/* ── Drop zone ────────────────────────────────────────────────── */}
      <div
        className={`drop-zone ${isDragOver ? "drop-zone--over" : ""} ${selectedFile ? "drop-zone--has-file" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !selectedFile && !isUploading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Click or drag a PDF file to upload"
        onKeyDown={(e) => e.key === "Enter" && !selectedFile && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          style={{ display: "none" }}
          aria-hidden="true"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) pick(f); }}
        />

        {!selectedFile ? (
          <div className="drop-zone-inner">
            <div className={`drop-zone-icon-wrap ${isDragOver ? "drop-zone-icon-wrap--over" : ""}`}>
              <Upload size={22} strokeWidth={1.5} />
            </div>
            <div className="drop-zone-text">
              <p className="drop-primary">
                {isDragOver ? "Release to upload" : "Drop your PDF here"}
              </p>
              <p className="drop-secondary">or click to browse · PDF only · max 20 MB</p>
            </div>
          </div>
        ) : (
          <div className="file-preview-row">
            <div className="file-icon-wrap">
              <FileText size={18} strokeWidth={1.5} />
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
                title="Remove file"
              >
                <X size={13} strokeWidth={2} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Error ────────────────────────────────────────────────────── */}
      {fileError && (
        <div className="upload-error-banner" role="alert">
          <AlertCircle size={14} strokeWidth={1.8} />
          <span>{fileError}</span>
        </div>
      )}

      {/* ── Progress ─────────────────────────────────────────────────── */}
      {isUploading && (
        <div className="upload-progress-wrap">
          <div className="upload-progress-track">
            <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
          </div>
          <span className="upload-progress-label">
            {uploadProgress < 100 ? `Uploading — ${uploadProgress}%` : "Building index…"}
          </span>
        </div>
      )}

      {/* ── Submit ───────────────────────────────────────────────────── */}
      <button
        className="ember-btn"
        disabled={!selectedFile || isUploading || !!fileError}
        onClick={handleUpload}
        aria-busy={isUploading}
      >
        {isUploading ? (
          <><span className="ember-spinner" aria-hidden="true" /> Processing…</>
        ) : (
          <><Upload size={15} strokeWidth={2} aria-hidden="true" /> Upload &amp; Process</>
        )}
      </button>

      {/* ── Capability strip ─────────────────────────────────────────── */}
      <div className="capability-strip">
        <span className="capability-item">
          <Lock size={12} strokeWidth={1.8} />
          Private &amp; local
        </span>
        <span className="capability-sep" aria-hidden="true" />
        <span className="capability-item">
          <BookOpen size={12} strokeWidth={1.8} />
          Page-cited answers
        </span>
        <span className="capability-sep" aria-hidden="true" />
        <span className="capability-item">
          <Search size={12} strokeWidth={1.8} />
          Semantic search
        </span>
      </div>

    </div>
  );
}
