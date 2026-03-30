"use client";

import { useState } from "react";

export default function Toast({ message }: { message: string }) {
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-2 rounded-lg shadow-lg">
            {message}
        </div>
    );
}