# DocuRag — Frontend

The frontend for DocuRag. Built with React, TypeScript, and Vite. It has a dark mode UI called "Midnight Ember" — deep charcoal background with amber accents, a WebGL animated background, and a custom cursor. You upload a PDF, it gets processed by the backend, and then you can chat with it and get answers with page citations.

---

## What it looks like

- Animated liquid-metal WebGL background that reacts to your mouse
- A sidebar showing your document status (uploading → indexing → ready)
- Drop zone to upload your PDF
- Chat panel where you type questions and get streamed answers
- PDF viewer on the right so you can follow along with citations
- Custom amber ring cursor

---

## Tech used

- **React 18** with **TypeScript**
- **Vite** for bundling
- **Tailwind CSS** + custom CSS (the Midnight Ember design system lives in `index.css`)
- **Zustand** for state management
- **React Query** for API calls
- **react-hot-toast** for notifications
- **react-markdown** for rendering the AI's answers
- **@react-pdf-viewer/core** for the in-browser PDF viewer
- **axios** for HTTP requests
- **sse-starlette** compatible SSE client (streaming answers token by token)
- WebGL fragment shader written from scratch (no library)

---

## Folder structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── WebGLBackground.tsx   # The animated shader background
│   │   ├── CustomCursor.tsx      # Amber ring cursor
│   │   ├── Sidebar.tsx           # Left nav with file status
│   │   ├── UploadView.tsx        # The drag-and-drop upload screen
│   │   ├── ChatView.tsx          # Main chat + PDF split view
│   │   ├── ChatBubble.tsx        # Individual message bubbles
│   │   ├── SourceCitation.tsx    # Collapsible source citations per answer
│   │   └── PdfViewer.tsx         # In-browser PDF viewer
│   ├── store/
│   │   └── useStore.ts           # Global state (Zustand)
│   ├── api.ts                    # All API calls + SSE streaming logic
│   ├── types.ts                  # Shared TypeScript types
│   ├── App.tsx                   # Root component
│   └── index.css                 # Complete Midnight Ember design system
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## Getting started

You need **Node.js 18+** installed.

**1. Install dependencies**

```bash
cd frontend
npm install
```

**2. Start the dev server**

```bash
npm run dev
```

Opens at `http://localhost:5173`

> Make sure the backend is also running on port 8000, otherwise uploads and chat won't work.

**3. Build for production**

```bash
npm run build
```

Output goes into the `dist/` folder.

---

## How the app flows

1. You land on the upload screen
2. Drop or click to select a PDF (max 20 MB)
3. Hit "Upload & Process" — the sidebar shows "Uploading…" then "Indexing…"
4. Once it says "Ready" the chat screen opens automatically
5. Type a question, hit Enter
6. The answer streams in token by token with page citations at the bottom
7. Click a page badge to jump to that page in the PDF viewer
8. Hit "New Chat" in the sidebar to start over with a new document

---

## Environment

The frontend doesn't need any environment variables. It points to `http://localhost:8000` by default for all API calls. If you want to change the backend URL, update it in `src/api.ts`.

---

## Notes

- The WebGL background runs at ~60fps and uses your GPU. If it causes issues on a low-end machine, you can remove the `<WebGLBackground />` line from `App.tsx` and set a solid background color in `index.css`.
- The custom cursor only works on desktop. On mobile it falls back to the default cursor.
- The PDF viewer works for most standard PDFs. Scanned image-only PDFs will upload but the AI won't find much to answer from since there's no extractable text.
- Streaming answers use the browser's native `EventSource` API (SSE). No WebSockets needed.

---

## Acknowledgements

- Design inspired by the "Midnight Ember" concept — charcoal + amber, glassmorphism, and procedural animation
- AI answers powered by [Groq](https://groq.com) and the RAG backend
- PDF rendering by [react-pdf-viewer](https://react-pdf-viewer.dev)
