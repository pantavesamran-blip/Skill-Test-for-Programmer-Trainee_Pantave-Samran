"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { addExpense } from "@/app/add/actions";

export type Category = { id: number; name: string };

type Props = {
  categories: Category[];
  onSuccess?: () => void;
  onCancel?: () => void;
};

function todayISO() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

const inputClass = "border rounded px-3 py-2 bg-white text-black w-full";
const smallButton = "border rounded px-3 py-2 text-sm whitespace-nowrap hover:bg-gray-500/20";

export default function ExpenseForm({ categories, onSuccess, onCancel }: Props) {
  const router = useRouter();

  const [expenseDate, setExpenseDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const result = await addExpense({
      expense_date: expenseDate,
      category_id: Number(categoryId),
      description,
      amount: Number(amount),
    });

    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }

    router.refresh(); // โหลดข้อมูลใหม่ในหน้า dashboard
    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm mb-1">วันที่ *</label>
        <div className="flex gap-2">
          <input
            type="date"
            required
            className={inputClass}
            value={expenseDate}
            onChange={(e) => setExpenseDate(e.target.value)}
          />
          <button type="button" className={smallButton} onClick={() => setExpenseDate(todayISO())}>
            วันนี้
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">หมวดหมู่ *</label>
        <select
          required
          className={inputClass}
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">-- เลือกหมวดหมู่ --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm mb-1">รายละเอียด</label>
        <input
          type="text"
          maxLength={200}
          className={inputClass}
          placeholder="เช่น ค่าแท็กซี่ไปพบลูกค้า"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm mb-1">จำนวนเงิน (บาท) *</label>
        <input
          type="number"
          required
          min="0.01"
          step="0.01"
          className={inputClass}
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="border rounded px-5 py-2 font-medium hover:bg-gray-500/20 disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : "บันทึกรายการ"}
        </button>
        {onCancel && (
          <button
            type="button"
            className="border rounded px-5 py-2 hover:bg-gray-500/20"
            onClick={onCancel}
          >
            ยกเลิก
          </button>
        )}
      </div>
    </form>
  );
}