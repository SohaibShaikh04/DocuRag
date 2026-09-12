// src/api.ts — Centralized API layer

import axios from "axios";
import type { ChatRequest, ChatResponse, HealthResponse, UploadResponse } from "./types";

const RAW_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:8000"
    : "https://docurag-backend-7aty.onrender.com");

// Strip any trailing slashes to avoid double-slash route errors
const BASE_URL = RAW_URL.replace(/\/+$/, "");

console.log("[DocuRag API] Active backend URL:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120_000,
});

// ── Health ──────────────────────────────────────────────────────────────────

export async function checkHealth(): Promise<HealthResponse> {
  const { data } = await api.get<HealthResponse>("/health");
  return data;
}

// ── Upload ──────────────────────────────────────────────────────────────────

export async function uploadPdf(
  file: File,
  onUploadProgress?: (pct: number) => void
): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);

  const { data } = await api.post<UploadResponse>("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (evt) => {
      if (evt.total && onUploadProgress) {
        onUploadProgress(Math.round((evt.loaded / evt.total) * 100));
      }
    },
  });
  return data;
}

// ── Chat (non-streaming) ────────────────────────────────────────────────────

export async function sendChat(request: ChatRequest): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>("/chat", request);
  return data;
}

// ── Chat (streaming SSE) ────────────────────────────────────────────────────

/**
 * Opens an SSE stream for `/stream-chat`.
 *
 * @param collection_id   ChromaDB collection ID
 * @param question        User's question
 * @param onDelta         Called with each text delta
 * @param onSources       Called once with the sources array when the stream ends
 * @param onError         Called on error events
 * @returns A cleanup function that closes the EventSource
 */
export function openStreamChat(
  collection_id: string,
  question: string,
  onDelta: (text: string) => void,
  onSources: (sources: { page: number; text: string }[]) => void,
  onDone: () => void,
  onError: (msg: string) => void
): () => void {
  const params = new URLSearchParams({ collection_id, question });
  const url = `${BASE_URL}/stream-chat?${params.toString()}`;

  const es = new EventSource(url);

  es.addEventListener("data", (e: MessageEvent) => {
    onDelta((e as MessageEvent).data as string);
  });

  es.addEventListener("sources", (e: MessageEvent) => {
    try {
      const sources = JSON.parse((e as MessageEvent).data as string);
      onSources(sources);
    } catch {
      // ignore parse errors
    }
  });

  es.addEventListener("done", () => {
    es.close();
    onDone();
  });

  es.addEventListener("error", (e: Event) => {
    const msgEvt = e as MessageEvent;
    es.close();
    onError(msgEvt.data ?? "Stream error");
  });

  // Generic onerror for connection failures
  es.onerror = () => {
    es.close();
    onError("Connection to server lost.");
  };

  return () => es.close();
}

export { BASE_URL };
