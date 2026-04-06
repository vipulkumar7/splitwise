"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiDownload, FiX } from "react-icons/fi";

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [show, setShow] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        const ua = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(ua);
        setIsIOS(ios);

        // prevent showing again if dismissed
        const dismissed = localStorage.getItem("pwa-dismissed");
        if (dismissed) return;

        // Android install event
        const handler = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShow(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        // iOS → show manually
        if (ios) {
            setTimeout(() => setShow(true), 2000);
        }

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        await deferredPrompt.userChoice;

        setShow(false);
        localStorage.setItem("pwa-dismissed", "true");
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
                    transition={{ duration: 0.4 }}
                    className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4"
                >
                    <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-4 flex items-center gap-4 mb-16">
                        {/* ICON */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                            💸
                        </div>

                        {/* TEXT */}
                        <div className="flex-1">
                            <p className="text-white font-semibold text-sm">
                                Install Splitwise
                            </p>

                            <p className="text-gray-300 text-xs">
                                {isIOS
                                    ? "Tap Share → Add to Home Screen"
                                    : "Get faster access & app-like experience"}
                            </p>
                        </div>

                        {/* ACTION */}
                        {!isIOS && (
                            <button
                                onClick={handleInstall}
                                className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition"
                            >
                                <FiDownload size={16} />
                                Install
                            </button>
                        )}

                        {/* CLOSE */}
                        <button
                            onClick={handleClose}
                            className="absolute top-2 right-2 text-gray-300 hover:text-white -mt-4"
                        >
                            <FiX size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}