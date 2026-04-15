"use client";

import { useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { FiChevronDown, FiFileText, FiUser } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import FormField from "@/components/ui/form/FormField";
import Input from "@/components/ui/form/Input";
import Select from "@/components/ui/form/Select";
import Button from "@/components/ui/form/Button";

// =========================
// ✅ ZOD SCHEMA
// =========================
const schema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => Number(val) > 0, "Amount must be greater than 0"),
  payerId: z.string().min(1, "Select a payer"),
});

type FormData = z.infer<typeof schema>;

export default function ExpenseFormModal({
  show,
  onClose,
  members = [],
  onSave,
  loading,
  editingExpense,
  currentUserId,
}: any) {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: "",
      amount: "",
      payerId: "",
    },
  });

  useEffect(() => {
    if (!show) return;

    if (editingExpense) {
      // ✅ EDIT MODE (full reset)
      reset({
        description: editingExpense.description || "",
        amount: String(editingExpense.amount || ""),
        payerId: String(editingExpense.paidById || ""),
      });
    } else {
      // ✅ ADD MODE (FULL RESET — FIX)
      reset({
        description: "",
        amount: "",
        payerId: currentUserId || "",
      });
    }
  }, [show, editingExpense, currentUserId, reset]);

  // =========================
  // SUBMIT
  // =========================
  const onSubmit = async (data: FormData) => {
    await onSave(data);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-[360px] rounded-3xl bg-white/95 shadow-2xl p-6 border"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            {editingExpense ? "Edit Expense" : "Add Expense"}
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* ========================= */}
        {/* DESCRIPTION */}
        {/* ========================= */}
        <FormField icon={FiFileText}>
          <Input
            disabled={loading}
            placeholder="Description"
            {...register("description")}
            className={
              errors.description ? "border-red-400 focus:ring-red-400" : "text-black"
            }
          />
        </FormField>

        {errors.description && (
          <p className="text-sm text-red-500 mb-2 ml-1">
            {errors.description.message}
          </p>
        )}

        {/* ========================= */}
        {/* AMOUNT */}
        {/* ========================= */}
        <FormField icon={FaRupeeSign}>
          <Input
            disabled={loading}
            type="number"
            placeholder="Amount"
            {...register("amount")}
            className={errors.amount ? "border-red-400 focus:ring-red-400" : "text-black"}
          />
        </FormField>

        {errors.amount && (
          <p className="text-sm text-red-500 mb-2 ml-1">
            {errors.amount.message}
          </p>
        )}

        {/* ========================= */}
        {/* PAYER */}
        {/* ========================= */}
        <FormField icon={FiUser} rightIcon={<FiChevronDown />}>
          <Select
            {...register("payerId")}
            className={
              errors.payerId ? "border-red-400 focus:ring-red-400" : ""
            }
          >
            <option value="">Select payer</option>
            {members.map((m: any) => (
              <option key={m.user.id} value={String(m.user.id)}>
                {m.user.name || m.user.email}
              </option>
            ))}
          </Select>
        </FormField>

        {errors.payerId && (
          <p className="text-sm text-red-500 mb-3 ml-1">
            {errors.payerId.message}
          </p>
        )}

        {/* ========================= */}
        {/* BUTTON */}
        {/* ========================= */}
        <Button loading={loading} onClick={handleSubmit(onSubmit)}>
          {loading
            ? editingExpense
              ? "Updating..."
              : "Adding..."
            : editingExpense
              ? "Update Expense"
              : "Add Expense"}
        </Button>
      </div>
    </div>
  );
}
