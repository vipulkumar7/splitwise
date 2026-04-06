"use client";

import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FiChevronDown, FiDollarSign } from "react-icons/fi";
import { FiFileText } from "react-icons/fi";
import { FiUser } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

export default function AddExpenseModal({
    show,
    onClose,
    members = [],
    payerId,
    setPayerId = () => { },
    amount,
    setAmount = () => { },
    description,
    setDescription = () => { },
    onAdd,
    loading,
    editingExpense,
}: any) {

    useEffect(() => {
        if (members?.length && !payerId) {
            setPayerId(String(members[0].user.id));
        }
    }, [members]);
    if (!show) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
            onClick={onClose}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-[360px] rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl p-6 border border-white/40"
            >
                {/* HEADER */}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {editingExpense ? "Edit" : "Add"} Expense
                    </h2>

                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-gray-200 transition"
                    >
                        <IoClose size={20} />
                    </button>
                </div>

                {/* DESCRIPTION */}
                <div className="relative mb-4">
                    <FiFileText className="absolute left-3 top-3 text-gray-400" />

                    <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Description"
                        className="w-full pl-10 pr-3 py-3 mb-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none transition"
                    />
                </div>

                {/* AMOUNT */}
                <div className="relative mb-4">
                    <FaRupeeSign className="absolute left-3 top-3 text-gray-400" />

                    <input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount"
                        type="number"
                        className="w-full pl-10 pr-3 py-3 mb-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-400 outline-none transition"
                    />
                </div>

                {/* CUSTOM SELECT */}
                <div className="relative mb-4">
                    {/* Icon */}
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                    {/* Select */}
                    <select
                        value={payerId || ""}
                        onChange={(e) => setPayerId(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-gray-700 focus:ring-2 focus:ring-green-400 outline-none transition appearance-none"
                    >
                        <option value="">Select payer</option>
                        {members.map((m: any) => (
                            <option key={m?.user?.id} value={String(m?.user?.id)}>
                                {m?.user?.name || m?.user?.email}
                            </option>
                        ))}
                    </select>

                    {/* Custom arrow */}
                    <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* BUTTON */}
                <button
                    type="button"
                    disabled={loading}
                    onClick={onAdd}
                    className={`w-full py-3 rounded-xl text-white font-semibold transition flex items-center justify-center gap-2
                        ${loading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            {editingExpense ? "Updating..." : "Adding..."}
                        </>
                    ) : (
                        editingExpense ? "Update Expense" : "Add Expense"
                    )}
                </button>
            </div>
        </div>
    );
}