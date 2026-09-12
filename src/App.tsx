// src/App.tsx

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { useStore } from "./store/useStore";
import { SonarGrid } from "./components/SonarGrid";
import { CustomCursor } from "./components/CustomCursor";
import { Sidebar } from "./components/Sidebar";
import { HeroView } from "./components/HeroView";
import { UploadView } from "./components/UploadView";
import { ChatView } from "./components/ChatView";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

function App() {
  const view = useStore((s) => s.view);

  return (
    <QueryClientProvider client={queryClient}>
      <SonarGrid />
      <CustomCursor />

      <div className="app-shell">
        {view !== "landing" && <Sidebar />}
        <main className={`app-main ${view === "landing" ? "app-main--full" : ""}`}>
          {view === "landing" && <HeroView />}
          {view === "upload"  && <UploadView />}
          {view === "chat"    && <ChatView />}
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(16, 13, 7, 0.95)",
            backdropFilter: "blur(16px)",
            color: "#e8dfc8",
            border: "1px solid rgba(245, 158, 11, 0.15)",
            borderRadius: "8px",
            fontSize: "13px",
            fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            boxShadow: "0 4px 24px rgba(0,0,0,0.45)",
          },
          success: {
            iconTheme: { primary: "#F59E0B", secondary: "rgba(16,13,7,0.95)" },
          },
          error: {
            iconTheme: { primary: "#f87171", secondary: "rgba(16,13,7,0.95)" },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
