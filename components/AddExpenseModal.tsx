"use client";

import { useRef, useState } from "react";
import ExpenseForm, { Category } from "@/components/ExpenseForm";

export default function AddExpenseModal({ categories }: { categories: Category[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  function openModal() {
    setOpen(true);
    dialogRef.current?.showModal();
  }

  function closeModal() {
    dialogRef.current?.close();
  }

  return (
    <>
      <button
        type="button"
        className="border rounded px-4 py-2 text-sm hover:bg-gray-500/20"
        onClick={openModal}
      >
        + เพิ่มรายการ
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg border bg-white p-0 text-black shadow-xl backdrop:bg-black/60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
      >
        {/* แสดงฟอร์มเฉพาะตอนเปิด เพื่อให้ฟอร์มว่างใหม่ทุกครั้ง */}
        {open && (
          <div className="p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">เพิ่มรายการค่าใช้จ่าย</h2>
              <button
                type="button"
                aria-label="ปิด"
                className="px-2 text-xl leading-none opacity-70 hover:opacity-100"
                onClick={closeModal}
              >
                ×
              </button>
            </div>
            <ExpenseForm
              categories={categories}
              onSuccess={closeModal}
              onCancel={closeModal}
            />
          </div>
        )}
      </dialog>
    </>
  );
}