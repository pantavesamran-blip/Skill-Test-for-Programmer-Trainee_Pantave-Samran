"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";

export type NewExpense = {
  expense_date: string;
  category_id: number;
  description: string;
  amount: number;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function addExpense(input: NewExpense): Promise<{ error?: string }> {
  if (!DATE_RE.test(input.expense_date)) return { error: "กรุณาเลือกวันที่" };
  if (!Number.isInteger(input.category_id) || input.category_id <= 0) {
    return { error: "กรุณาเลือกหมวดหมู่" };
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0 || input.amount >= 1e10) {
    return { error: "จำนวนเงินไม่ถูกต้อง" };
  }

  const description = input.description.trim().slice(0, 200);

  const { error } = await supabase.from("expenses").insert({
    expense_date: input.expense_date,
    category_id: input.category_id,
    description: description || null,
    amount: Math.round(input.amount * 100) / 100,
  });

  if (error) return { error: `บันทึกไม่สำเร็จ: ${error.message}` };

  revalidatePath("/");
  return {};
}