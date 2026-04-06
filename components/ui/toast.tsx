"use client";

import { useEffect, useState } from "react";
import { FiCheckCircle, FiXCircle, FiInfo } from "react-icons/fi";

type ToastType = "success" | "error" | "info";

export default function Toast({
    message,
    type = "success",
    duration = 3000,
}: {
    message: string;
    type?: ToastType;
    duration?: number;
}) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);

        const timer = setTimeout(() => {
            setVisible(false);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    const iconMap = {
        success: <FiCheckCircle className="text-green-400" size={20} />,
        error: <FiXCircle className="text-red-400" size={20} />,
        info: <FiInfo className="text-blue-400" size={20} />,
    };

    return (
        <div
            className={`
        fixed bottom-20 left-1/2 -translate-x-1/2 z-50
        transition-all duration-500
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
      `}
        >
            <div
                className="
          flex items-center gap-3
          px-5 py-3
          rounded-2xl
          backdrop-blur-xl
          bg-white/10
          border border-white/20
          shadow-[0_8px_30px_rgba(0,0,0,0.4)]
          text-white
        "
            >
                {/* ICON */}
                <div>{iconMap[type]}</div>

                {/* MESSAGE */}
                <p className="text-sm text-gray-500 font-medium tracking-wide">{message}</p>
            </div>
        </div>
    );
}