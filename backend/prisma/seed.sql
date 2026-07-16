-- ============================================================
-- GYM-SYS  – Supabase / PostgreSQL DDL + Seed
-- Paste the entire script into the Supabase SQL Editor and run.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ── Clean-up (safe re-run) ───────────────────────────────────
drop table if exists action_logs      cascade;
drop table if exists notifications    cascade;
drop table if exists expenses         cascade;
drop table if exists amenities        cascade;
drop table if exists schedules        cascade;
drop table if exists payments         cascade;
drop table if exists members          cascade;
drop table if exists users            cascade;
drop table if exists trainers         cascade;
drop table if exists branches         cascade;
drop table if exists gyms             cascade;

-- ── Tables ───────────────────────────────────────────────────

create table gyms (
    id         uuid primary key default uuid_generate_v4(),
    name       text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table branches (
    id             uuid primary key default uuid_generate_v4(),
    gym_id         uuid not null references gyms(id) on delete cascade,
    name           text not null,
    address        text,
    phone          text,
    manager_name   text,
    opening_time   text default '06:00 AM',
    closing_time   text default '10:00 PM',
    lunch_start    text default '12:00 PM',
    lunch_end      text default '02:00 PM',
    monthly_rate   numeric(10,2) default 0.00 not null,
    quarterly_rate numeric(10,2) default 0.00 not null,
    daily_rate     numeric(10,2) default 0.00 not null,
    created_at     timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at     timestamp with time zone default timezone('utc'::text, now()) not null
);

create table trainers (
    id                   uuid primary key default uuid_generate_v4(),
    branch_id            uuid not null references branches(id) on delete cascade,
    first_name           text not null,
    last_name            text not null,
    phone                text,
    email                text unique,
    specialization       text,
    experience_yrs       integer default 0 not null,
    stipend_per_member   numeric(10,2) default 0.00 not null,
    status               text default 'Active' check (status in ('Active', 'On Break', 'Offline')),
    unavailable_until    date,
    unavailable_duration text,
    created_at           timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at           timestamp with time zone default timezone('utc'::text, now()) not null
);

create table users (
    id            uuid primary key default uuid_generate_v4(),
    email         text unique not null,
    password_hash text not null,
    name          text not null,
    role          text not null check (role in ('SuperAdmin','Owner','Manager','Staff','Trainer')),
    branch_id     uuid references branches(id) on delete set null,
    trainer_id    uuid references trainers(id) on delete set null,
    created_at    timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at    timestamp with time zone default timezone('utc'::text, now()) not null
);

create table members (
    id           text primary key,  -- GF-XXXXX format
    branch_id    uuid not null references branches(id) on delete cascade,
    trainer_id   uuid references trainers(id) on delete set null,
    first_name   text not null,
    last_name    text not null,
    phone        text,
    email        text,
    dob          date,
    gender       text check (gender in ('Male','Female','Other')),
    plan         text not null,
    join_date    date not null,
    renewal_date date not null,
    notes        text,
    created_at   timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at   timestamp with time zone default timezone('utc'::text, now()) not null
);

create table payments (
    id           uuid primary key default uuid_generate_v4(),
    member_id    text references members(id) on delete set null,
    payment_type text default 'Membership' check (payment_type in ('Membership','Daily_Entry','Amenity_Sale')),
    amount       numeric(10,2) not null,
    currency     text default 'Birr' not null,
    method       text default 'Cash' check (method in ('Cash','Card','Transfer')),
    plan_label   text not null,
    recorded_by  text not null,
    paid_at      timestamp with time zone default timezone('utc'::text, now()) not null,
    created_at   timestamp with time zone default timezone('utc'::text, now()) not null
);

create table schedules (
    id         uuid primary key default uuid_generate_v4(),
    trainer_id uuid not null references trainers(id) on delete cascade,
    day        integer not null check (day >= 0 and day <= 6),
    time       text not null,
    member_id  text not null references members(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint unique_trainer_time_slot unique (trainer_id, day, time)
);

create table amenities (
    id         uuid primary key default uuid_generate_v4(),
    branch_id  uuid not null references branches(id) on delete cascade,
    name       text not null,
    category   text,
    price      numeric(10,2) not null,
    stock      integer default 0 not null check (stock >= 0),
    image_url  text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table expenses (
    id          uuid primary key default uuid_generate_v4(),
    branch_id   uuid not null references branches(id) on delete cascade,
    type        text not null,
    reason      text,
    amount      numeric(10,2) not null,
    date        timestamp with time zone default timezone('utc'::text, now()) not null,
    recorded_by text not null,
    created_at  timestamp with time zone default timezone('utc'::text, now()) not null
);

create table notifications (
    id         uuid primary key default uuid_generate_v4(),
    type       text not null check (type in ('Overdue','Warning','Success','Info')),
    message    text not null,
    member_id  text references members(id) on delete set null,
    branch_id  uuid references branches(id) on delete cascade,
    is_read    boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table action_logs (
    id         uuid primary key default uuid_generate_v4(),
    user_email text not null,
    action     text not null,
    snapshot   jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ── Indexes ──────────────────────────────────────────────────
create index idx_members_branch       on members(branch_id);
create index idx_members_trainer      on members(trainer_id);
create index idx_payments_member      on payments(member_id);
create index idx_payments_paid_at     on payments(paid_at);
create index idx_trainers_branch      on trainers(branch_id);
create index idx_schedules_trainer    on schedules(trainer_id);
create index idx_notifications_branch on notifications(branch_id);
create index idx_notifications_unread on notifications(is_read);

-- ── auto-update updated_at trigger ───────────────────────────
create or replace function update_modified_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger update_gyms_modtime       before update on gyms       for each row execute procedure update_modified_column();
create trigger update_branches_modtime   before update on branches   for each row execute procedure update_modified_column();
create trigger update_trainers_modtime   before update on trainers   for each row execute procedure update_modified_column();
create trigger update_users_modtime      before update on users      for each row execute procedure update_modified_column();
create trigger update_members_modtime    before update on members    for each row execute procedure update_modified_column();
create trigger update_amenities_modtime  before update on amenities  for each row execute procedure update_modified_column();

-- ── Seed Data ────────────────────────────────────────────────

insert into gyms (id, name)
values ('6c8b93bb-1f63-47e0-b6bb-f88ef05b4528', 'GYM-SYS Franchise');

insert into branches (id, gym_id, name, address, phone, manager_name, opening_time, closing_time, lunch_start, lunch_end, monthly_rate, quarterly_rate, daily_rate)
values
('b1000000-0000-0000-0000-000000000001','6c8b93bb-1f63-47e0-b6bb-f88ef05b4528','Downtown Branch','123 Elite St, Downtown','(555) 010-1000','Alex Rivera','08:00 AM','08:00 PM','12:00 PM','02:00 PM',1000.00,2800.00,100.00),
('b2000000-0000-0000-0000-000000000002','6c8b93bb-1f63-47e0-b6bb-f88ef05b4528','Uptown Fitness','456 Wellness Blvd, Uptown','(555) 020-2000','Sophia Patel','06:00 AM','10:00 PM','12:00 PM','01:00 PM',1200.00,3200.00,150.00),
('b3000000-0000-0000-0000-000000000003','6c8b93bb-1f63-47e0-b6bb-f88ef05b4528','West End Arena','789 Power Rd, West End','(555) 030-3000','Marcus Thorne','08:00 AM','06:00 PM','01:00 PM','02:00 PM',900.00,2500.00,90.00);

-- Password hash below = bcrypt('123', 10)
insert into trainers (id, branch_id, first_name, last_name, phone, email, specialization, experience_yrs, stipend_per_member, status)
values
('f-0000-0000-0000-000000000001','b1000000-0000-0000-0000-000000000001','Marcus','Thorne','(555) 012-3456','marcus@gym-sys.com','Weight Training',8,150.00,'Active'),
('f-0000-0000-0000-000000000002','b1000000-0000-0000-0000-000000000001','Elena','Rodriguez','(555) 012-9876','elena@gym-sys.com','Yoga & Mobility',5,120.00,'Active'),
('f-0000-0000-0000-000000000003','b2000000-0000-0000-0000-000000000002','David','Chen','(555) 013-4422','david@gym-sys.com','Powerlifting',6,200.00,'On Break'),
('f-0000-0000-0000-000000000004','b3000000-0000-0000-0000-000000000003','Sarah','Miller','(555) 014-7711','sarah.m@gym-sys.com','Functional Fitness',4,100.00,'Active'),
('f-0000-0000-0000-000000000005','b1000000-0000-0000-0000-000000000001','Julian','Vance','(555) 015-8833','julian@gym-sys.com','Bio-Mechanics',3,80.00,'Offline');

insert into users (email, password_hash, name, role, branch_id, trainer_id)
values
('admin@gym-sys.com',  '$2b$10$w81o96z2q5y.0b/T84fO9eL5D5x323X.6mJ1Kx6xXb2yv0c0N8s4W','Alex Rivera',  'SuperAdmin',null,null),
('owner@gym-sys.com',  '$2b$10$w81o96z2q5y.0b/T84fO9eL5D5x323X.6mJ1Kx6xXb2yv0c0N8s4W','Omar Keita',   'Owner',      null,null),
('manager@gym-sys.com','$2b$10$w81o96z2q5y.0b/T84fO9eL5D5x323X.6mJ1Kx6xXb2yv0c0N8s4W','Sophia Patel', 'Manager',    'b1000000-0000-0000-0000-000000000001',null),
('staff@gym-sys.com',  '$2b$10$w81o96z2q5y.0b/T84fO9eL5D5x323X.6mJ1Kx6xXb2yv0c0N8s4W','Sarah Chen',   'Staff',      'b1000000-0000-0000-0000-000000000001',null),
('trainer@gym-sys.com','$2b$10$w81o96z2q5y.0b/T84fO9eL5D5x323X.6mJ1Kx6xXb2yv0c0N8s4W','Marcus Thorne','Trainer',    'b1000000-0000-0000-0000-000000000001','f-0000-0000-0000-000000000001');

insert into members (id, branch_id, trainer_id, first_name, last_name, phone, email, dob, gender, plan, join_date, renewal_date, notes)
values
('GF-10292','b1000000-0000-0000-0000-000000000001','f-0000-0000-0000-000000000001','Sarah','Jenkins','(555) 012-3456','sarah.j@example.com','1995-04-12','Female','Annual','2025-10-12','2026-10-12','Prefers morning sessions. Focusing on strength.'),
('GF-10304','b1000000-0000-0000-0000-000000000001','f-0000-0000-0000-000000000002','David','Miller','(555) 098-7654','d.miller@example.com','1982-08-15','Male','Monthly','2026-05-15','2026-06-25','Recovering from minor knee strain.'),
('GF-09882','b1000000-0000-0000-0000-000000000001',null,'Alex','Rivera','(555) 443-2211','alex.r@example.com','1990-12-01','Male','Monthly','2026-03-22','2026-06-15','Lapsed member. Contacted once.'),
('GF-11445','b1000000-0000-0000-0000-000000000001','f-0000-0000-0000-000000000001','Elena','Rodriguez','(555) 887-6655','elena.r@example.com','1998-03-24','Female','Monthly','2025-11-30','2026-11-30','Enjoys high-intensity weight training.'),
('GF-10023','b1000000-0000-0000-0000-000000000001','f-0000-0000-0000-000000000002','James','Wilson','(555) 321-4567','j.wilson@example.com','1975-01-20','Male','Monthly','2026-05-15','2026-06-28','Prefers stretching routines.'),
('GF-20192','b2000000-0000-0000-0000-000000000002','f-0000-0000-0000-000000000003','Sophia','Patel','(555) 234-5678','spatel@example.com','1992-11-12','Female','Quarterly','2026-04-01','2026-07-01','Wants to improve posture and squat form.'),
('GF-30111','b3000000-0000-0000-0000-000000000003','f-0000-0000-0000-000000000004','Mike','Olsen','(555) 345-6789','mike.o@example.com','1988-06-05','Male','Annual','2026-01-10','2027-01-10','Focusing on general conditioning.');

insert into payments (member_id, payment_type, amount, currency, method, plan_label, recorded_by, paid_at)
values
('GF-10292','Membership',1200.00,'Birr','Card', 'Elite Annual — Oct 2025','Super Admin','2025-10-12 10:30:00+00'),
('GF-10304','Membership', 99.00, 'Birr','Cash', 'Pro Monthly — May 2026', 'Front Desk', '2026-05-15 14:22:00+00'),
('GF-09882','Membership', 99.00, 'Birr','Transfer','Standard Monthly — May 2026','Super Admin','2026-05-15 09:11:00+00'),
('GF-11445','Membership', 99.00, 'Birr','Card', 'Monthly — Nov 2025',    'Front Desk', '2025-11-30 17:45:00+00'),
('GF-20192','Membership',280.00, 'Birr','Card', 'Uptown Quarterly — Apr 2026','Sophia Patel','2026-04-01 11:00:00+00');

insert into notifications (type, message, member_id, branch_id, is_read, created_at)
values
('Overdue','Alex Rivera''s membership is overdue since June 15','GF-09882','b1000000-0000-0000-0000-000000000001',false,'2026-06-15 00:00:00+00'),
('Warning','David Miller''s membership expires in 2 days',      'GF-10304','b1000000-0000-0000-0000-000000000001',false,'2026-06-23 08:00:00+00'),
('Success','Payment of Birr 1,200 recorded for Sarah Jenkins',  'GF-10292','b1000000-0000-0000-0000-000000000001',true, '2026-06-22 10:30:00+00'),
('Info',   'New member registered: James Wilson',               'GF-10023','b1000000-0000-0000-0000-000000000001',false,'2026-06-15 14:22:00+00');

insert into schedules (trainer_id, day, time, member_id)
values
('f-0000-0000-0000-000000000001',0,'08:00 AM','GF-10292'),
('f-0000-0000-0000-000000000001',2,'10:00 AM','GF-11445'),
('f-0000-0000-0000-000000000002',1,'12:00 PM','GF-10304'),
('f-0000-0000-0000-000000000002',4,'02:00 PM','GF-10023');
