"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TStatus, IInviteProps } from "@/types";

export default function InviteClient({ token }: IInviteProps) {
  const router = useRouter();
  const [status, setStatus] = useState<TStatus>("loading");
  const [redirecting, setRedirecting] = useState(false);

  const joinGroup = useCallback(async () => {
    try {
      const res = await fetch("/api/groups/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data?.success) {
        setStatus("success");
        setRedirecting(true);

        setTimeout(() => {
          router.replace(`/groups/${data.groupId}`);
        }, 1200);
      } else {
        throw new Error("Invalid token");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
      setRedirecting(true);

      setTimeout(() => {
        router.replace("/groups");
      }, 1500);
    }
  }, [token, router]);

  // 🚀 Run once
  useEffect(() => {
    if (!token) return;
    joinGroup();
  }, [token, joinGroup]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-zinc-950 to-black px-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold text-white mb-6">Splitwise</h1>

        <StatusUI status={status} />

        {redirecting && (
          <p className="text-xs text-gray-500 mt-4">Redirecting...</p>
        )}
      </div>
    </div>
  );
}

function StatusUI({ status }: { status: TStatus }) {
  if (status === "loading") {
    return (
      <>
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-gray-400 text-sm">Joining group...</p>
      </>
    );
  }

  if (status === "success") {
    return (
      <>
        <div className="text-green-400 text-3xl mb-4">✅</div>
        <p className="text-white font-medium">Joined successfully!</p>
      </>
    );
  }

  return (
    <>
      <div className="text-red-400 text-3xl mb-4">❌</div>
      <p className="text-white font-medium">Invalid or expired invite</p>
    </>
  );
}
