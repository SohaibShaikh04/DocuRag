// src/types.ts — All shared TypeScript types for the application

export type AppView = "landing" | "upload" | "chat";

export interface SourceChunk {
  page: number;
  text: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceChunk[];
  isStreaming?: boolean;
}

export interface UploadResponse {
  collection_id: string;
  filename: string;
  num_pages?: number;
}

export interface ChatRequest {
  collection_id: string;
  question: string;
}

export interface ChatResponse {
  answer: string;
  sources: SourceChunk[];
}

export interface HealthResponse {
  status: string;
}

export interface StreamChatEvent {
  type: "data" | "sources" | "done" | "error";
  payload: string;
}
