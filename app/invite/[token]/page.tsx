"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

type TStatus = "loading" | "success" | "error";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();

  const token = params?.token as string;

  const [status, setStatus] = useState<TStatus>("loading");

  useEffect(() => {
    if (!token) return;

    const joinGroup = async () => {
      try {
        const res = await fetch("/api/groups/join", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();

        if (data.success) {
          setStatus("success");

          setTimeout(() => {
            router.replace(`/groups/${data.groupId}`);
          }, 1200);
        } else {
          setStatus("error");

          setTimeout(() => {
            router.replace("/groups");
          }, 1500);
        }
      } catch (err) {
        console.error(err);
        setStatus("error");

        setTimeout(() => {
          router.replace("/groups");
        }, 1500);
      }
    };

    joinGroup();
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="bg-white/10 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 w-[90%] max-w-sm text-center mb-[140px]">
        <h1 className="text-2xl font-bold text-white mb-4">Splitwise</h1>

        {status === "loading" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-300 text-sm">Joining group...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-400 text-3xl mb-4">✅</div>
            <p className="text-white font-semibold">Joined successfully!</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-red-400 text-3xl mb-4">❌</div>
            <p className="text-white font-semibold">
              Invalid or expired invite
            </p>
          </>
        )}
      </div>
    </div>
  );
}
