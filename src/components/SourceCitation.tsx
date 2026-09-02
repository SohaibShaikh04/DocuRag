// src/components/SourceCitation.tsx — Amber-accented collapsible source citations

import { useState } from "react";
import type { SourceChunk } from "../types";

interface SourceCitationProps {
  sources: SourceChunk[];
  onPageClick: (page: number) => void;
}

export function SourceCitation({ sources, onPageClick }: SourceCitationProps) {
  const [open, setOpen] = useState(false);
  if (!sources || sources.length === 0) return null;

  const uniquePages = [...new Set(sources.map((s) => s.page))].sort((a, b) => a - b);

  return (
    <div className="source-citation">
      <button
        className="source-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="source-toggle-label">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1.5 10.5V1.5h5L10 6v4.5H1.5z" stroke="#F59E0B" strokeWidth="1.1" strokeLinejoin="round" fill="none" />
            <path d="M6.5 1.5v4.5H10" stroke="#F59E0B" strokeWidth="1.1" strokeLinejoin="round" />
          </svg>
          Sources · pp. {uniquePages.join(", ")}
        </span>
        <svg
          className={`chevron ${open ? "chevron--open" : ""}`}
          width="11"
          height="11"
          viewBox="0 0 11 11"
          fill="none"
        >
          <path d="M2 4l3.5 3.5L9 4" stroke="#F59E0B" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="source-list">
          {sources.map((s, idx) => (
            <div key={idx} className="source-item">
              <button
                className="source-page-badge"
                onClick={() => onPageClick(s.page)}
                title={`Jump to page ${s.page}`}
              >
                p. {s.page}
              </button>
              <p className="source-text">{s.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
