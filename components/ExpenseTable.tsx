"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import ExpenseCharts from "@/components/ExpenseCharts";
import AddExpenseModal from "@/components/AddExpenseModal";
import type { Category } from "@/components/ExpenseForm";

export type Expense = {
  id: number;
  expense_date: string; // รูปแบบ "2026-10-12"
  category: string;
  description: string;
  amount: number;
};

// "2026-10-12" -> "12 ต.ค. 2569"
function formatThaiDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Date -> "2026-10-12" (ตามเวลาเครื่อง)
function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: "expense_date",
    header: "วันที่",
    sortingFn: "text",
    cell: (info) => formatThaiDate(info.getValue<string>()),
  },
  { accessorKey: "category", header: "หมวดหมู่" },
  { accessorKey: "description", header: "รายละเอียด" },
  {
    accessorKey: "amount",
    header: "จำนวนเงิน (บาท)",
    cell: (info) =>
      Number(info.getValue()).toLocaleString("th-TH", {
        minimumFractionDigits: 2,
      }),
  },
];

const inputClass = "border rounded px-3 py-2 bg-white text-black";
const buttonClass = "border rounded px-3 py-2 text-sm hover:bg-gray-500/20";

export default function ExpenseTable({
  data,
  categoryRows,
}: {
  data: Expense[];
  categoryRows: Category[];
})  {
  // ตัวกรองต่างๆ
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  // การเรียงและการค้นหาให้ TanStack Table จัดการ
  const [sorting, setSorting] = useState<SortingState>([
    { id: "expense_date", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = useState("");

  const categories = useMemo(
    () => Array.from(new Set(data.map((r) => r.category))).sort(),
    [data]
  );

  // กรองตามหมวดหมู่และช่วงวันที่ก่อน แล้วค่อยส่งเข้าตาราง
  // (วันที่รูปแบบ yyyy-mm-dd เทียบด้วย < > ได้เลย)
  const filteredData = useMemo(
    () =>
      data.filter((r) => {
        if (category && r.category !== category) return false;
        if (from && r.expense_date < from) return false;
        if (to && r.expense_date > to) return false;
        return true;
      }),
    [data, category, from, to]
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  // แถวที่ผ่านทั้งตัวกรองและช่องค้นหา (ใช้ทำการ์ดและกราฟ)
  const matchedRows = table.getFilteredRowModel().rows;

  function setPreset(preset: "all" | "month" | "30" | "90") {
    const now = new Date();
    if (preset === "all") {
      setFrom("");
      setTo("");
      return;
    }
    if (preset === "month") {
      setFrom(toISO(new Date(now.getFullYear(), now.getMonth(), 1)));
      setTo(toISO(now));
      return;
    }
    const start = new Date(now);
    start.setDate(now.getDate() - Number(preset));
    setFrom(toISO(start));
    setTo(toISO(now));
  }

  function resetAll() {
    setCategory("");
    setFrom("");
    setTo("");
    setGlobalFilter("");
  }

  return (
    <div className="space-y-4">
            {/* แถวตัวกรอง */}
      <div className="flex flex-wrap gap-3 items-end">
        <input
          className={`${inputClass} w-56`}
          placeholder="ค้นหา..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        <select
          className={inputClass}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">ทุกหมวดหมู่</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="ml-auto">
          <AddExpenseModal categories={categoryRows} />
        </div>
      </div>

      {/* แถวกรองวันที่ */}
      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-sm">
          ตั้งแต่
          <input
            type="date"
            className={`${inputClass} block mt-1`}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-sm">
          ถึง
          <input
            type="date"
            className={`${inputClass} block mt-1`}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <button className={buttonClass} onClick={() => setPreset("month")}>
          เดือนนี้
        </button>
        <button className={buttonClass} onClick={() => setPreset("30")}>
          30 วันล่าสุด
        </button>
        <button className={buttonClass} onClick={() => setPreset("90")}>
          90 วันล่าสุด
        </button>
        <button className={buttonClass} onClick={() => setPreset("all")}>
          ทุกช่วงเวลา
        </button>
        <button className={buttonClass} onClick={resetAll}>
          ล้างตัวกรองทั้งหมด
        </button>
      </div>

      {/* การ์ดสรุปและกราฟ (ตามตัวกรองและคำค้นหาที่ใช้อยู่) */}
      <ExpenseCharts rows={matchedRows.map((r) => r.original)} />

      {/* ตาราง */}
      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead className="bg-gray-100 text-black">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="p-2 text-left cursor-pointer select-none whitespace-nowrap"
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {{ asc: " ▲", desc: " ▼" }[h.column.getIsSorted() as string] ?? ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-6 text-center">
                  ไม่พบข้อมูลที่ตรงกับเงื่อนไข
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-t">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* แบ่งหน้า */}
      <div className="flex items-center gap-3">
        <button
          className={buttonClass}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          ก่อนหน้า
        </button>
        <span className="text-sm">
          หน้า {table.getState().pagination.pageIndex + 1} /{" "}
          {Math.max(table.getPageCount(), 1)}
        </span>
        <button
          className={buttonClass}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          ถัดไป
        </button>
      </div>
    </div>
  );
}