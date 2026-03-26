"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault(); // stop automatic prompt
            setDeferredPrompt(e);
            setShow(true); // show custom button
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () => window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    const installApp = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();

        const choice = await deferredPrompt.userChoice;

        if (choice.outcome === "accepted") {
            console.log("App installed ✅");
        } else {
            console.log("User dismissed ❌");
        }

        setDeferredPrompt(null);
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 bg-black text-white p-4 rounded flex justify-between items-center shadow-lg">
            <span>Install Splitwise App</span>

            <button
                onClick={installApp}
                className="bg-white text-black px-3 py-1 rounded"
            >
                Install
            </button>
        </div>
    );
}