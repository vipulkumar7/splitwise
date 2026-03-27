"use client";

import { useEffect, useState } from "react";

export default function InstallPrompt() {
    const [prompt, setPrompt] = useState<any>(null);

    useEffect(() => {
        const handler = (e: any) => {
            e.preventDefault();
            setPrompt(e);
        };

        window.addEventListener("beforeinstallprompt", handler);

        return () =>
            window.removeEventListener("beforeinstallprompt", handler);
    }, []);

    if (!prompt) return null;

    return (
        <button
            onClick={() => prompt.prompt()}
            className="fixed bottom-20 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
            Install App
        </button>
    );
}