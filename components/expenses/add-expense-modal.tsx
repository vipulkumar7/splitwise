"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddExpenseModal() {
  const [amount, setAmount] = useState("");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Expense</Button>
      </DialogTrigger>

      <DialogContent className="rounded-2xl">
        <h2 className="text-lg font-semibold mb-4">Add Expense</h2>

        <Input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <Button className="mt-4 w-full">Save</Button>
      </DialogContent>
    </Dialog>
  );
}