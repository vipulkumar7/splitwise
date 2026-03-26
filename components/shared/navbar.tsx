"use client";

import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <h1 className="font-bold text-lg">Splitwise</h1>

      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={session?.user?.image || ""} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>

        <Button variant="outline" onClick={() => signOut()}>
          Logout
        </Button>
      </div>
    </div>
  );
}