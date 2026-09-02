// src/components/ChatView.tsx — Midnight Ember split-pane chat

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import toast from "react-hot-toast";
import { openStreamChat } from "../api";
import { useStore } from "../store/useStore";

import { ChatBubble } from "./ChatBubble";
import { PdfViewer } from "./PdfViewer";

let msgIdCounter = 0;
const nextId = () => `msg-${++msgIdCounter}`;

export function ChatView() {
  const {
    collectionId, filename, pdfFile,
    messages, addMessage, updateLastAssistantMessage, setLastAssistantSources,
    isStreaming, setIsStreaming,
    rateLimited, setRateLimited,
  } = useStore();

  const [input, setInput] = useState("");
  const [targetPage, setTargetPage] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = textareaRef.current;
    if (ta) { ta.style.height = "auto"; ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`; }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const sendMessage = useCallback(() => {
    if (!input.trim() || isStreaming || rateLimited || !collectionId) return;
    const question = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    addMessage({ id: nextId(), role: "user", content: question });
    addMessage({ id: nextId(), role: "assistant", content: "", isStreaming: true, sources: [] });
    setIsStreaming(true);

    let accumulated = "";
    cleanupRef.current = openStreamChat(
      collectionId, question,
      (delta) => { accumulated += delta; updateLastAssistantMessage(accumulated, false); },
      (sources) => { setLastAssistantSources(sources); },
      () => {
        updateLastAssistantMessage(accumulated, true);
        setIsStreaming(false);
        cleanupRef.current = null;
        setTimeout(() => textareaRef.current?.focus(), 100);
      },
      (errMsg) => {
        setIsStreaming(false);
        cleanupRef.current = null;
        if (errMsg === "rate_limit") {
          setRateLimited(true);
          updateLastAssistantMessage("⚠️ Rate limit reached. Please wait 5 seconds.", true);
          toast.error("Rate limit — please wait…");
          setTimeout(() => { setRateLimited(false); textareaRef.current?.focus(); }, 5000);
        } else {
          updateLastAssistantMessage(`❌ ${errMsg}`, true);
          toast.error(`Error: ${errMsg}`);
        }
      }
    );
  }, [input, isStreaming, rateLimited, collectionId, addMessage, updateLastAssistantMessage, setLastAssistantSources, setIsStreaming, setRateLimited]);

  useEffect(() => () => { cleanupRef.current?.(); }, []);

  const canSend = input.trim().length > 0 && !isStreaming && !rateLimited;

  return (
    <div className="chat-layout">
      {/* ── Messages pane ── */}
      <div className="chat-pane">
        {/* Chat header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M1.5 13.5V1.5h7l4 4v8H1.5z" stroke="#F59E0B" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
              <path d="M8.5 1.5v4h4" stroke="#F59E0B" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
            <span className="chat-header-filename">{filename}</span>
          </div>
          <div className="chat-header-right">
            <span className="status-badge status--ready">
              <span className="status-dot" /> Ready
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="messages-container" role="log" aria-live="polite">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <div className="empty-chat-ember">
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <circle cx="26" cy="26" r="24" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                  <circle cx="26" cy="26" r="16" stroke="#F59E0B" strokeWidth="1" opacity="0.2" />
                  <path d="M26 16v12M26 16l-6 7M26 16l6 7" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="empty-chat-title">Ask anything about your document</p>
              <p className="empty-chat-hint">Try: "Summarize the key points" or "What does page 5 say about…?"</p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} onPageClick={setTargetPage} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Rate limit warning */}
        {rateLimited && (
          <div className="rate-limit-bar" role="status">
            ⏳ Rate limit — input re-enables in 5 seconds…
          </div>
        )}

        {/* Input bar */}
        <div className="input-bar">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder={rateLimited ? "Please wait…" : "Ask a question about your document…"}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={rateLimited}
            rows={1}
            aria-label="Chat input"
          />
          <button
            className="send-btn"
            disabled={!canSend}
            onClick={sendMessage}
            aria-label="Send"
          >
            {isStreaming ? (
              <span className="ember-spinner" />
            ) : (
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                <path d="M2 8.5h13M8.5 2l6.5 6.5-6.5 6.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
        <p className="input-hint">Enter to send · Shift+Enter for new line</p>
      </div>

      {/* ── PDF pane ── */}
      <div className="pdf-pane">
        <div className="pdf-pane-header">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 12V2h5.5L12 6.5V12H2z" stroke="#F59E0B" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
            <path d="M7.5 2v4.5H12" stroke="#F59E0B" strokeWidth="1.2" strokeLinejoin="round" />
          </svg>
          <span>Document Viewer</span>
          {targetPage && (
            <span className="page-badge">Page {targetPage}</span>
          )}
        </div>
        {pdfFile ? (
          <PdfViewer file={pdfFile} targetPage={targetPage} />
        ) : (
          <div className="pdf-loading"><span>No document loaded.</span></div>
        )}
      </div>
    </div>
  );
}
