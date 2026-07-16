import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";

// Dev-only suppression of sandbox HMR WebSocket warnings
if (import.meta.env.DEV) {
  window.addEventListener("unhandledrejection", (event) => {
    const errorMsg = String(event.reason?.message || event.reason || "").toLowerCase();
    if (errorMsg.includes("websocket") || errorMsg.includes("ws://")) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener("error", (event) => {
    const errorMsg = String(event.message || "").toLowerCase();
    if (errorMsg.includes("websocket") || errorMsg.includes("ws://")) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
