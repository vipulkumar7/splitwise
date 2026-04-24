"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload, FiX } from "react-icons/fi";
import { BeforeInstallPromptEvent } from "@/types";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [show, setShow] = useState(true);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIOS(ios);

    // ✅ check dismissed
    if (localStorage.getItem("pwa-dismissed")) return;

    const handler = (e: Event) => {
      e.preventDefault();

      const event = e as BeforeInstallPromptEvent;

      setDeferredPrompt(event);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (ios) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();

      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "accepted") {
        localStorage.setItem("pwa-dismissed", "true");
      }

      setDeferredPrompt(null);
      setShow(false);
    } catch (err) {
      console.error("Install failed:", err);
    }
  };

  const handleClose = () => {
    setShow(false);
    localStorage.setItem("pwa-dismissed", "true");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-0 bottom-20 z-50 flex justify-center px-4"
        >
          <div className="relative w-full max-w-md bg-zinc-950 border border-white/20 shadow-xl rounded-2xl p-4 flex items-center gap-3">
            <div className="flex items-center gap-3 w-full">
              {/* ICON */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                💸
              </div>

              {/* TEXT */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">
                  Install Splitwise
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {isIOS
                    ? "Tap Share → Add to Home Screen"
                    : "Get faster access & app-like experience"}
                </p>
              </div>

              {/* INSTALL BUTTON */}
              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="hidden sm:flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition"
                >
                  <FiDownload size={16} />
                  Install
                </button>
              )}

              {/* CLOSE */}
              <button
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <FiX size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
