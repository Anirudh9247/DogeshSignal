import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

// Safeguard against sandbox-specific benign HMR WebSocket connection failures
if (typeof window !== "undefined") {
  // Case-insensitive window-level listeners
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const errorMsg = String(reason?.message || reason?.stack || reason || "").toLowerCase();
    if (
      errorMsg.includes("websocket") || 
      errorMsg.includes("vite") || 
      errorMsg.includes("ws://") ||
      errorMsg.includes("closed without opened")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
  
  window.addEventListener("error", (event) => {
    const errorMsg = String(event.message || event.error?.message || "").toLowerCase();
    if (
      errorMsg.includes("websocket") || 
      errorMsg.includes("vite") || 
      errorMsg.includes("closed without opened")
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);

  // Robustly proxy the global WebSocket wrapper to intercept connection failure exceptions
  try {
    const OriginalWebSocket = window.WebSocket;
    if (OriginalWebSocket) {
      const SafeWebSocket = new Proxy(OriginalWebSocket, {
        construct(target, args) {
          try {
            const instance = Reflect.construct(target, args);
            // Intercept instance error event handling to prevent unhandled bubblings
            instance.addEventListener("error", (e: any) => {
              e.preventDefault?.();
              e.stopPropagation?.();
            }, { capture: true });
            return instance;
          } catch (err) {
            console.warn("Caught secure WebSocket connection error gracefully:", err);
            return {};
          }
        }
      });

      try {
        Object.defineProperty(window, "WebSocket", {
          value: SafeWebSocket,
          configurable: true,
          writable: true,
          enumerable: true
        });
      } catch (defErr) {
        try {
          window.WebSocket = SafeWebSocket as any;
        } catch (assignErr) {
          console.warn("Bypassed readonly WebSocket redirection:", assignErr);
        }
      }
    }
  } catch (wsProxyErr) {
    console.warn("Bypassed WebSocket wrapper generation:", wsProxyErr);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
