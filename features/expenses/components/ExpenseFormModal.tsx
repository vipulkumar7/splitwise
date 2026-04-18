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
import { IExpenseFormData, IExpenseFormModalProps } from "@/types";

const schema = z.object({
  description: z.string().trim().min(1, "Description is required"),
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
  members,
  onSave,
  loading = false,
  editingExpense,
  currentUserId,
}: IExpenseFormModalProps) {
  const {
    register,
    handleSubmit,
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

  // =========================
  // RESET FORM
  // =========================
  useEffect(() => {
    if (!show) return;

    if (editingExpense) {
      reset({
        description: editingExpense.description ?? "",
        amount: String(editingExpense.amount ?? ""),
        payerId: editingExpense.paidById ?? "",
      });
    } else {
      reset({
        description: "",
        amount: "",
        payerId: currentUserId ?? "",
      });
    }
  }, [show, editingExpense, currentUserId, reset]);

  const onSubmit = handleSubmit(async (data) => {
    await onSave(data as IExpenseFormData);
  });

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl p-6 border"
      >
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">
            {editingExpense ? "Edit Expense" : "Add Expense"}
          </h2>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition"
            aria-label="Close"
          >
            <IoClose size={20} />
          </button>
        </div>

        <FormField icon={FiFileText}>
          <Input
            disabled={loading}
            placeholder="Description"
            {...register("description")}
            className={
              errors.description
                ? "border-red-400 focus:ring-red-400"
                : "text-black"
            }
          />
        </FormField>

        {errors.description && (
          <p className="text-sm text-red-500 mb-2 ml-1">
            {errors.description.message}
          </p>
        )}

        <FormField icon={FaRupeeSign}>
          <Input
            disabled={loading}
            type="number"
            placeholder="Amount"
            {...register("amount")}
            className={
              errors.amount ? "border-red-400 focus:ring-red-400" : "text-black"
            }
          />
        </FormField>

        {errors.amount && (
          <p className="text-sm text-red-500 mb-2 ml-1">
            {errors.amount.message}
          </p>
        )}

        <FormField icon={FiUser} rightIcon={<FiChevronDown />}>
          <Select
            disabled={loading}
            {...register("payerId")}
            className={
              errors.payerId ? "border-red-400 focus:ring-red-400" : ""
            }
          >
            <option value="">Select payer</option>
            {members.map((m) => (
              <option key={m.user.id} value={m.user.id as string}>
                {m.user.name || m.user.email || "User"}
              </option>
            ))}
          </Select>
        </FormField>

        {errors.payerId && (
          <p className="text-sm text-red-500 mb-3 ml-1">
            {errors.payerId.message}
          </p>
        )}

        <Button loading={loading} variant="primary" onClick={onSubmit}>
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
