-- หมวดหมู่ค่าใช้จ่าย
create table categories (
  id serial primary key,
  name text not null unique
);

-- รายการค่าใช้จ่าย
create table expenses (
  id bigint generated always as identity primary key,
  expense_date date not null,
  category_id int not null references categories(id),
  description text,
  amount numeric(12,2) not null check (amount > 0),
  created_at timestamptz default now()
);

create index idx_expenses_date on expenses(expense_date);

-- Row Level Security: ทุกคนอ่านและเพิ่มได้ แก้ไข/ลบไม่ได้
alter table categories enable row level security;
alter table expenses enable row level security;
create policy "public read" on categories for select using (true);
create policy "public read" on expenses for select using (true);
create policy "public insert" on expenses for insert with check (true);

insert into categories(name) values
  ('ค่าเดินทาง'), ('ซอฟต์แวร์'), ('อุปกรณ์สำนักงาน'), ('อบรมสัมมนา'), ('เลี้ยงรับรอง');