// src/components/ChatBubble.tsx — Midnight Ember message bubbles

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "../types";
import { SourceCitation } from "./SourceCitation";

interface ChatBubbleProps {
  message: ChatMessage;
  onPageClick: (page: number) => void;
}

export function ChatBubble({ message, onPageClick }: ChatBubbleProps) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="bubble-row bubble-row--user">
        <div className="bubble bubble--user">
          <p className="bubble-text">{message.content}</p>
        </div>
        <div className="bubble-avatar bubble-avatar--user" aria-hidden="true">U</div>
      </div>
    );
  }

  return (
    <div className="bubble-row bubble-row--assistant">
      <div className="bubble-avatar bubble-avatar--assistant" aria-hidden="true">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7" stroke="#F59E0B" strokeWidth="1.2" />
          <path d="M5 8.5a3 3 0 006 0" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="5.5" cy="6.5" r="0.7" fill="#F59E0B" />
          <circle cx="10.5" cy="6.5" r="0.7" fill="#F59E0B" />
        </svg>
      </div>
      <div className="bubble bubble--assistant">
        {message.isStreaming && !message.content ? (
          <div className="thinking-dots" aria-label="Thinking">
            <span /><span /><span />
          </div>
        ) : (
          <>
            <div className="bubble-markdown">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {message.content}
              </ReactMarkdown>
              {message.isStreaming && (
                <span className="cursor-blink" aria-hidden="true">▋</span>
              )}
            </div>
            {!message.isStreaming && message.sources && message.sources.length > 0 && (
              <SourceCitation sources={message.sources} onPageClick={onPageClick} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function SkeletonBubble() {
  return (
    <div className="bubble-row bubble-row--assistant">
      <div className="bubble-avatar bubble-avatar--assistant" aria-hidden="true">
        <div style={{ width: 14, height: 14, borderRadius: "50%", background: "rgba(245,158,11,0.3)" }} />
      </div>
      <div className="bubble bubble--assistant skeleton-bubble">
        <div className="skeleton-line skeleton-line--lg" />
        <div className="skeleton-line skeleton-line--md" />
        <div className="skeleton-line skeleton-line--sm" />
      </div>
    </div>
  );
}
