// src/components/HeroView.tsx

import { ArrowRight, FileText, MessageSquare, BookOpen } from "lucide-react";
import { useStore } from "../store/useStore";

export function HeroView() {
  const setView = useStore((s) => s.setView);

  return (
    <div className="hero-page">

      {/* ── Badge ───────────────────────────────────────────────────── */}
      <div className="hero-badge">
        <span className="hero-badge-dot" aria-hidden="true" />
        Retrieval-Augmented Generation
      </div>

      {/* ── Headline ────────────────────────────────────────────────── */}
      <div className="hero-headline-group">
        <h1 className="hero-title">
          Chat with any PDF,<br />get exact answers.
        </h1>
        <p className="hero-subtitle">
          Upload a document. Ask anything. DocuRag finds the right pages,
          cites its sources, and gives you a direct answer — no hallucinations,
          no guessing.
        </p>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <div className="hero-actions">
        <button
          className="hero-cta"
          onClick={() => setView("upload")}
          aria-label="Get started — go to upload"
        >
          Get started
          <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      {/* ── How it works ────────────────────────────────────────────── */}
      <div className="hero-steps">
        <div className="hero-step">
          <div className="hero-step-icon">
            <FileText size={16} strokeWidth={1.5} />
          </div>
          <div className="hero-step-text">
            <span className="hero-step-label">Upload</span>
            <span className="hero-step-desc">Any PDF up to 20 MB</span>
          </div>
        </div>

        <div className="hero-step-divider" aria-hidden="true" />

        <div className="hero-step">
          <div className="hero-step-icon">
            <MessageSquare size={16} strokeWidth={1.5} />
          </div>
          <div className="hero-step-text">
            <span className="hero-step-label">Ask</span>
            <span className="hero-step-desc">Any question, naturally</span>
          </div>
        </div>

        <div className="hero-step-divider" aria-hidden="true" />

        <div className="hero-step">
          <div className="hero-step-icon">
            <BookOpen size={16} strokeWidth={1.5} />
          </div>
          <div className="hero-step-text">
            <span className="hero-step-label">Get answers</span>
            <span className="hero-step-desc">Cited to exact pages</span>
          </div>
        </div>
      </div>

    </div>
  );
}
