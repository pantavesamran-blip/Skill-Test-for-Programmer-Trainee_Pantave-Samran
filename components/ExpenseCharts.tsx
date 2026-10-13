"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { Expense } from "@/components/ExpenseTable";

const MONTHS = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

const TICK = "#9ca3af"; 
const GRID = "rgba(128,128,128,0.3)";

// "2026-10" -> "ต.ค. 69"
function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return `${MONTHS[m - 1]} ${String((y + 543) % 100).padStart(2, "0")}`;
}

function money(n: number) {
  return n.toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


function shortMoney(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} ล.`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

function Card({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border rounded-lg p-4">
      <p className="text-sm opacity-70">{label}</p>
      <p className="text-2xl font-bold mt-1 break-words">{value}</p>
      {note && <p className="text-xs opacity-70 mt-1">{note}</p>}
    </div>
  );
}

export default function ExpenseCharts({ rows }: { rows: Expense[] }) {
  // --- การ์ดสรุป ---
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  const count = rows.length;
  const average = count > 0 ? total / count : 0;

  // --- รวมยอดตามหมวดหมู่ ---
  const categoryMap = new Map<string, number>();
  for (const r of rows) {
    categoryMap.set(r.category, (categoryMap.get(r.category) ?? 0) + r.amount);
  }
  const byCategory = Array.from(categoryMap, ([name, sum]) => ({ name, total: sum })).sort(
    (a, b) => b.total - a.total
  );
  const topCategory = byCategory[0];

  // --- รวมยอดตามเดือน (เติมเดือนที่ไม่มีข้อมูลให้เป็น 0 เพื่อให้เส้นต่อเนื่อง) ---
  const monthMap = new Map<string, number>();
  for (const r of rows) {
    const key = r.expense_date.slice(0, 7); // "2026-10"
    monthMap.set(key, (monthMap.get(key) ?? 0) + r.amount);
  }
  const keys = Array.from(monthMap.keys()).sort();
  const byMonth: { month: string; total: number }[] = [];
  if (keys.length > 0) {
    let [y, m] = keys[0].split("-").map(Number);
    const [endY, endM] = keys[keys.length - 1].split("-").map(Number);
    while (y < endY || (y === endY && m <= endM)) {
      const key = `${y}-${String(m).padStart(2, "0")}`;
      byMonth.push({ month: monthLabel(key), total: monthMap.get(key) ?? 0 });
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* การ์ดสรุป */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card label="ยอดรวม (บาท)" value={money(total)} />
        <Card label="จำนวนรายการ" value={count.toLocaleString("th-TH")} />
        <Card label="เฉลี่ยต่อรายการ (บาท)" value={money(average)} />
        <Card
          label="หมวดที่ใช้จ่ายสูงสุด"
          value={topCategory ? topCategory.name : "-"}
          note={topCategory ? `${money(topCategory.total)} บาท` : undefined}
        />
      </div>

      {count === 0 ? (
        <p className="text-sm opacity-70">ไม่มีข้อมูลสำหรับแสดงกราฟ</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* กราฟแท่ง: ตามหมวดหมู่ */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">ยอดใช้จ่ายแยกตามหมวดหมู่</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                  <XAxis
                    type="number"
                    tick={{ fill: TICK, fontSize: 12 }}
                    tickFormatter={shortMoney}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fill: TICK, fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(v) => `${money(Number(v))} บาท`}
                    cursor={{ fill: "rgba(128,128,128,0.15)" }}
                  />
                  <Bar dataKey="total" name="ยอดรวม" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* กราฟเส้น: รายเดือน */}
          <div className="border rounded-lg p-4">
            <h2 className="font-semibold mb-3">ยอดใช้จ่ายรายเดือน</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={byMonth} margin={{ left: 0, right: 16, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                  <XAxis dataKey="month" tick={{ fill: TICK, fontSize: 12 }} />
                  <YAxis tick={{ fill: TICK, fontSize: 12 }} tickFormatter={shortMoney} />
                  <Tooltip formatter={(v) => `${money(Number(v))} บาท`} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="ยอดรวม"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}