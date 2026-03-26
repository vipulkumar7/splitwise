"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";

import GroupList from "@/components/groups/GroupList";
import AddMember from "@/components/groups/AddMember";
import ExpenseModal from "@/components/groups/ExpenseModal";
import ExpenseHistory from "@/components/groups/ExpenseHistory";
import Balances from "@/components/groups/Balances";
import SettleList from "@/components/groups/SettleList";

import Filters from "@/components/dashboard/Filters";
import ExpenseSummary from "@/components/dashboard/ExpenseSummary";
import SpendingPieChart from "@/components/dashboard/SpendingPieChart";
import MonthlyTrend from "@/components/dashboard/MonthlyTrend";
import Insights from "@/components/dashboard/Insights";

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [name, setName] = useState("");

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);

  const [balances, setBalances] = useState<any>({});
  const [transactions, setTransactions] = useState<any[]>([]);

  const [memberEmail, setMemberEmail] = useState("");

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);

  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDesc, setExpenseDesc] = useState("");

  const [payerId, setPayerId] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [customSplits, setCustomSplits] = useState<any>({});

  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedMember, setSelectedMember] = useState("");

  // ================= FETCH GROUPS =================
  const fetchGroups = async () => {
    const res = await fetch("/api/groups");
    const data = await res.json();
    setGroups(data || []);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // ================= FETCH BALANCES =================
  const fetchBalances = async (groupId: string) => {
    setSelectedGroupId(groupId);

    const res = await fetch(`/api/expenses?groupId=${groupId}`);
    const data = await res.json();

    setExpenses(data);

    const group = groups.find((g) => g.id === groupId);
    setMembers(group?.members || []);

    const { calculateBalances } = await import("@/lib/balance");
    const { simplifyDebts } = await import("@/lib/settle");

    const result = calculateBalances(data);
    setBalances(result);

    setTransactions(simplifyDebts(result));
  };

  // ================= FILTER =================
  const filteredExpenses = expenses.filter((e: any) => {
    const date = new Date(e.createdAt);

    if (startDate && date < new Date(startDate)) return false;
    if (endDate && date > new Date(endDate)) return false;
    if (selectedMember && e.paidById !== selectedMember) return false;

    return true;
  });

  // ================= CREATE GROUP =================
  const createGroup = async () => {
    if (!name) return;

    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setName("");
    fetchGroups();
  };

  // ================= ADD MEMBER =================
  const addMember = async () => {
    const res = await fetch("/api/groups/add-member", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: memberEmail, groupId: selectedGroupId }),
    });

    const data = await res.json();

    if (!res.ok) return alert(data.error);

    setMemberEmail("");
    fetchGroups();
  };

  // ================= ADD EXPENSE =================
  const submitExpense = async () => {
    if (!expenseAmount || !payerId) return;

    if (splitType === "custom") {
      const total = Object.values(customSplits).reduce(
        (a: any, b: any) => a + b,
        0
      );

      if (total !== Number(expenseAmount)) {
        alert("Split mismatch");
        return;
      }
    }

    await fetch("/api/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: expenseDesc,
        amount: Number(expenseAmount),
        groupId: activeGroupId,
        paidById: payerId,
        splitType,
        splits: customSplits,
      }),
    });

    setShowExpenseModal(false);
    setExpenseAmount("");
    setExpenseDesc("");
    setPayerId("");
    setCustomSplits({});

    fetchBalances(activeGroupId!);
  };

  // ================= EXPORT CSV =================
  const exportCSV = () => {
    if (!filteredExpenses.length) return;

    const rows = filteredExpenses.map((e: any) => ({
      Description: e.description,
      Amount: e.amount,
      PaidBy: e.paidBy?.email,
      Date: new Date(e.createdAt).toLocaleDateString(),
    }));

    const csv =
      Object.keys(rows[0]).join(",") +
      "\n" +
      rows.map((r: any) => Object.values(r).join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
  };

  // ================= EXPORT PDF =================
  const exportPDF = () => {
    if (!filteredExpenses.length) return;

    const doc = new jsPDF();

    doc.text("Expense Report", 10, 10);

    filteredExpenses.forEach((e: any, i: number) => {
      doc.text(
        `${e.description} - ₹${e.amount} - ${e.paidBy?.email}`,
        10,
        20 + i * 10
      );
    });

    doc.save("expenses.pdf");
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Splitwise Dashboard</h1>

      {/* CREATE GROUP */}
      <div className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
          placeholder="Group name"
        />
        <button onClick={createGroup} className="bg-black text-white px-4">
          Create
        </button>
      </div>

      {/* EXPORT */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={exportCSV}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Export CSV
        </button>

        <button
          onClick={exportPDF}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Export PDF
        </button>
      </div>

      {/* GROUP LIST */}
      <GroupList
        groups={groups}
        selectedGroupId={selectedGroupId}
        onSelect={fetchBalances}
        onAddExpense={(id: string) => {
          setActiveGroupId(id);
          setShowExpenseModal(true);
        }}
        onDelete={() => { }}
      />

      {/* ADD MEMBER */}
      <AddMember
        selectedGroupId={selectedGroupId}
        memberEmail={memberEmail}
        setMemberEmail={setMemberEmail}
        onAdd={addMember}
      />

      {/* FILTERS */}
      {selectedGroupId && (
        <Filters
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          members={members}
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
        />
      )}

      {/* DASHBOARD */}
      {selectedGroupId && (
        <>
          <ExpenseSummary expenses={filteredExpenses} />
          <SpendingPieChart expenses={filteredExpenses} />
          <MonthlyTrend expenses={filteredExpenses} />
          <Insights expenses={filteredExpenses} />

          <Balances balances={balances} />
          <SettleList transactions={transactions} />
          <ExpenseHistory expenses={filteredExpenses} />
        </>
      )}

      {/* MODAL */}
      <ExpenseModal
        show={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onSubmit={submitExpense}
        members={members}
        payerId={payerId}
        setPayerId={setPayerId}
        expenseAmount={expenseAmount}
        setExpenseAmount={setExpenseAmount}
        expenseDesc={expenseDesc}
        setExpenseDesc={setExpenseDesc}
        splitType={splitType}
        setSplitType={setSplitType}
        customSplits={customSplits}
        setCustomSplits={setCustomSplits}
      />
    </div>
  );
}