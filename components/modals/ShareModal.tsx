"use client";

import { useState, useCallback } from "react";
import { FaWhatsapp, FaCopy } from "react-icons/fa";
import { SiGmail } from "react-icons/si";
import { IoClose } from "react-icons/io5";

interface IShareModalProps {
  show: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  setToast: (data: {
    message: string;
    type: "success" | "error";
    id: number;
  }) => void;
}

export default function ShareModal({
  show,
  onClose,
  groupId,
  groupName,
  setToast,
}: IShareModalProps) {
  const [loadingCopy, setLoadingCopy] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  // =========================
  // 🔥 GET LINK (CACHED)
  // =========================
  const getLink = useCallback(async (): Promise<string | null> => {
    if (inviteLink) return inviteLink;

    try {
      const res = await fetch(`/api/groups/${groupId}/invite`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to generate link");

      const data: { inviteLink: string } = await res.json();

      setInviteLink(data.inviteLink);
      return data.inviteLink;
    } catch (error) {
      console.error(error);
      setToast({
        message: "Failed to generate invite link",
        type: "error",
        id: Date.now(),
      });
      return null;
    }
  }, [groupId, inviteLink]);

  // =========================
  // ACTIONS
  // =========================

  const handleCopy = async () => {
    try {
      setLoadingCopy(true);

      const link = await getLink();
      if (!link) throw new Error("No link");

      await navigator.clipboard.writeText(link);

      setToast({
        message: "Link copied",
        type: "success",
        id: Date.now(),
      });

      onClose();
    } catch {
      setToast({
        message: "Failed to copy link",
        type: "error",
        id: Date.now(),
      });
    } finally {
      setLoadingCopy(false);
    }
  };

  const handleWhatsApp = async () => {
    try {
      const link = await getLink();
      if (!link) throw new Error("No link");

      const message = `Join my group "${groupName}" 👇\n${link}`;

      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank",
      );

      onClose();
    } catch {
      setToast({
        message: "Failed to share",
        type: "error",
        id: Date.now(),
      });
    }
  };

  const handleEmail = async () => {
    if (!email || loadingEmail) return;

    try {
      setLoadingEmail(true);

      const link = await getLink(); // ✅ IMPORTANT

      const res = await fetch("/api/groups/invite/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          inviteLink: link,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to send invite");
      }

      setToast({
        message: "Invite sent",
        type: "success",
        id: Date.now(),
      });

      setEmail("");
      onClose();
    } catch (err) {
      setToast({
        message: "Failed to send invite",
        type: "error",
        id: Date.now(),
      });
    } finally {
      setLoadingEmail(false);
    }
  };

  if (!show) return null;

  // =========================
  // UI
  // =========================
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-black">Share Group</h2>

          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 active:scale-95 transition"
            aria-label="Close"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* OPTIONS */}
        <div className="space-y-3">
          {/* WHATSAPP */}
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-3 w-full p-3 rounded-xl border hover:bg-green-50 active:scale-95 transition"
          >
            <FaWhatsapp className="text-green-500 text-xl" />
            <span className="font-medium text-black">Share on WhatsApp</span>
          </button>

          {/* COPY */}
          <button
            onClick={handleCopy}
            disabled={loadingCopy}
            className={`flex items-center gap-3 w-full p-3 rounded-xl border hover:bg-gray-100 active:scale-95 transition disabled:opacity-60 ${loadingCopy && "cursor-not-allowed"}`}
          >
            <FaCopy className="text-gray-700 text-lg" />
            <span className="font-medium text-black">
              {loadingCopy ? "Copying..." : "Copy Link"}
            </span>
          </button>

          {/* EMAIL */}
          <div className="flex gap-2 mt-2">
            <input
              name={email}
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 text-black"
            />

            <button
              onClick={handleEmail}
              disabled={loadingEmail}
              className={`bg-gray-500 hover:bg-gray-600 text-white px-4 rounded-xl flex items-center justify-center disabled:opacity-60 ${loadingEmail && "cursor-not-allowed"}`}
            >
              {loadingEmail ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <SiGmail />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
