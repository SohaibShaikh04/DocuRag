// src/App.tsx — Midnight Ember app shell with WebGL background, sidebar, and custom cursor

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useStore } from "./store/useStore";
import { WebGLBackground } from "./components/WebGLBackground";
import { CustomCursor } from "./components/CustomCursor";
import { Sidebar } from "./components/Sidebar";
import { UploadView } from "./components/UploadView";
import { ChatView } from "./components/ChatView";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

function App() {
  const view = useStore((s) => s.view);

  return (
    <QueryClientProvider client={queryClient}>
      {/* WebGL liquid-metal background */}
      <WebGLBackground />

      {/* Custom amber ring cursor */}
      <CustomCursor />

      {/* App shell */}
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          {view === "upload" && <UploadView />}
          {view === "chat" && <ChatView />}
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(22, 18, 10, 0.92)",
            backdropFilter: "blur(16px)",
            color: "#e8e0d0",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            borderRadius: "10px",
            fontSize: "13.5px",
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(245,158,11,0.08)",
          },
          success: {
            iconTheme: { primary: "#F59E0B", secondary: "rgba(22,18,10,0.9)" },
          },
          error: {
            iconTheme: { primary: "#f87171", secondary: "rgba(22,18,10,0.9)" },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
