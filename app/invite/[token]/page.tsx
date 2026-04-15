"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();

  const token = params?.token as string;

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
          router.replace(`/groups/${data.groupId}`);
        } else {
          router.replace("/groups");
        }
      } catch (err) {
        console.error(err);
        router.replace("/groups");
      }
    };

    joinGroup();
  }, [token, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      Joining group...
    </div>
  );
}
