import { Suspense } from "react";
import { connection } from "next/server";
import { supabase } from "@/lib/supabase";
import ExpenseTable, { Expense } from "@/components/ExpenseTable";
import type { Category } from "@/components/ExpenseForm";

type Row = {
  id: number;
  expense_date: string;
  description: string | null;
  amount: number;
  categories: { name: string } | null;
};

async function ExpenseData() {
  await connection(); // ดึงข้อมูลตอนมีคนเปิดเว็บ ไม่ใช่ตอน build

  const [expensesRes, categoriesRes] = await Promise.all([
    supabase
      .from("expenses")
      .select("id, expense_date, description, amount, categories(name)")
      .order("expense_date", { ascending: false })
      .order("id", { ascending: false })
      .limit(1000),
    supabase.from("categories").select("id, name").order("id"),
  ]);

  if (expensesRes.error) {
    return <p className="text-red-600">เกิดข้อผิดพลาด: {expensesRes.error.message}</p>;
  }
  if (categoriesRes.error) {
    return <p className="text-red-600">เกิดข้อผิดพลาด: {categoriesRes.error.message}</p>;
  }

  const rows: Expense[] = ((expensesRes.data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    expense_date: r.expense_date,
    category: r.categories?.name ?? "-",
    description: r.description ?? "",
    amount: Number(r.amount),
  }));

  return (
    <ExpenseTable
      data={rows}
      categoryRows={(categoriesRes.data ?? []) as Category[]}
    />
  );
}

export default function Home() {
  return (
    <main className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Expense Dashboard</h1>
      <Suspense fallback={<p>กำลังโหลดข้อมูล...</p>}>
        <ExpenseData />
      </Suspense>
    </main>
  );
}