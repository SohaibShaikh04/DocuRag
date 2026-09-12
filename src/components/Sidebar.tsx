// src/components/Sidebar.tsx — Fixed glassmorphism sidebar navigation

import { useStore } from "../store/useStore";

export function Sidebar() {
  const { view, filename, uploadStatus, reset } = useStore();

  const statusLabel: Record<string, { label: string; cls: string }> = {
    idle:     { label: "No file", cls: "status--idle" },
    uploading:{ label: "Uploading…", cls: "status--uploading" },
    indexing: { label: "Indexing…", cls: "status--indexing" },
    ready:    { label: "Ready", cls: "status--ready" },
    error:    { label: "Error", cls: "status--error" },
  };
  const st = statusLabel[uploadStatus] ?? statusLabel.idle;

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              d="M11 2C6.03 2 2 6.03 2 11s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9z"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="1.5"
            />
            <path
              d="M11 6v5l3 3"
              stroke="#F59E0B"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="11" cy="11" r="1.5" fill="#F59E0B" />
          </svg>
        </div>
        <span className="sidebar-brand">DocuRAG</span>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        <button
          className={`sidebar-nav-item ${view === "chat" || view === "upload" ? "sidebar-nav-item--active" : ""}`}
          title="Chat"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M14 10.67A1.33 1.33 0 0112.67 12H4L1.33 14.67V2.67A1.33 1.33 0 012.67 1.33h10A1.33 1.33 0 0114 2.67v8z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
          <span>Chat</span>
        </button>

        <button className="sidebar-nav-item" title="History (coming soon)" disabled>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 4.5V8l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span>History</span>
        </button>

        <button className="sidebar-nav-item" title="Settings (coming soon)" disabled>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
            <path
              d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.05 3.05l1.06 1.06M11.89 11.89l1.06 1.06M3.05 12.95l1.06-1.06M11.89 4.11l1.06-1.06"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
          <span>Settings</span>
        </button>
      </nav>

      <div className="sidebar-divider" />

      {/* File status card */}
      <div className="sidebar-file-card">
        <div className="sidebar-file-header">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M2 11V2h5l3 3v6H2z"
              stroke="#F59E0B"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path d="M7 2v3h3" stroke="#F59E0B" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          <span>Document</span>
        </div>

        <p className="sidebar-file-name">
          {filename ?? "No file loaded"}
        </p>

        <div className={`status-badge ${st.cls}`}>
          <span className="status-dot" />
          {st.label}
        </div>
      </div>

      {/* New chat */}
      {view === "chat" && (
        <button className="sidebar-new-btn" onClick={reset}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          New Chat
        </button>
      )}

      {/* Bottom branding */}
      <div className="sidebar-footer">
        <span>RAG · Made with ❤️ - Sohaib Shaikh</span>
      </div>
    </aside>
  );
}
