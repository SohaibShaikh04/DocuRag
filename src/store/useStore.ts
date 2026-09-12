// src/store/useStore.ts — Zustand global state

import { create } from "zustand";
import type { AppView, ChatMessage } from "../types";

export type UploadStatus = "idle" | "uploading" | "indexing" | "ready" | "error";

interface AppState {
  view: AppView;
  setView: (view: AppView) => void;

  collectionId: string | null;
  filename: string | null;
  pdfFile: File | null;
  uploadStatus: UploadStatus;
  setUploadStatus: (s: UploadStatus) => void;
  setSession: (collectionId: string, filename: string, pdfFile: File) => void;

  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  updateLastAssistantMessage: (content: string, done?: boolean) => void;
  setLastAssistantSources: (sources: { page: number; text: string }[]) => void;
  clearMessages: () => void;

  isStreaming: boolean;
  setIsStreaming: (val: boolean) => void;

  rateLimited: boolean;
  setRateLimited: (val: boolean) => void;

  reset: () => void;
}

export const useStore = create<AppState>((set) => ({
  view: "landing",
  setView: (view) => set({ view }),

  collectionId: null,
  filename: null,
  pdfFile: null,
  uploadStatus: "idle",
  setUploadStatus: (uploadStatus) => set({ uploadStatus }),
  setSession: (collectionId, filename, pdfFile) =>
    set({ collectionId, filename, pdfFile, view: "chat", uploadStatus: "ready" }),

  messages: [],
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  updateLastAssistantMessage: (content, done = false) =>
    set((s) => {
      const msgs = [...s.messages];
      const idx = msgs.map((m) => m.role).lastIndexOf("assistant");
      if (idx !== -1) msgs[idx] = { ...msgs[idx], content, isStreaming: !done };
      return { messages: msgs };
    }),
  setLastAssistantSources: (sources) =>
    set((s) => {
      const msgs = [...s.messages];
      const idx = msgs.map((m) => m.role).lastIndexOf("assistant");
      if (idx !== -1) msgs[idx] = { ...msgs[idx], sources };
      return { messages: msgs };
    }),
  clearMessages: () => set({ messages: [] }),

  isStreaming: false,
  setIsStreaming: (val) => set({ isStreaming: val }),

  rateLimited: false,
  setRateLimited: (val) => set({ rateLimited: val }),

  reset: () =>
    set({
      view: "landing",
      collectionId: null,
      filename: null,
      pdfFile: null,
      messages: [],
      isStreaming: false,
      rateLimited: false,
      uploadStatus: "idle",
    }),
}));
