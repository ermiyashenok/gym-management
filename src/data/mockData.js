// Simulated "today" date for demo purposes
export const TODAY_STR = '2026-06-23'

// ─── Branches ────────────────────────────────────────────────────────────────
export const initialBranches = [
  { id: 'b1', name: 'Downtown Branch',  address: '123 Elite St, Downtown',     phone: '(555) 010-1000', manager_name: 'Alex Rivera', opening_time: '08:00 AM', closing_time: '08:00 PM', lunch_start: '12:00 PM', lunch_end: '02:00 PM', monthly_rate: 1000, quarterly_rate: 2800, daily_rate: 100 },
  { id: 'b2', name: 'Uptown Fitness',   address: '456 Wellness Blvd, Uptown',  phone: '(555) 020-2000', manager_name: 'Sophia Patel', opening_time: '06:00 AM', closing_time: '10:00 PM', lunch_start: '12:00 PM', lunch_end: '01:00 PM', monthly_rate: 1200, quarterly_rate: 3200, daily_rate: 150 },
  { id: 'b3', name: 'West End Arena',   address: '789 Power Rd, West End',     phone: '(555) 030-3000', manager_name: 'Marcus Thorne', opening_time: '08:00 AM', closing_time: '06:00 PM', lunch_start: '01:00 PM', lunch_end: '02:00 PM', monthly_rate: 900, quarterly_rate: 2500, daily_rate: 90 },
]

// ─── Trainers ─────────────────────────────────────────────────────────────────
export const initialTrainers = [
  { id: 't1', branch_id: 'b1', first_name: 'Marcus', last_name: 'Thorne',    phone: '(555) 012-3456', email: 'marcus@gymflow.com',  specialization: 'Weight Training',     experience_yrs: 8, status: 'Active'   },
  { id: 't2', branch_id: 'b1', first_name: 'Elena',  last_name: 'Rodriguez', phone: '(555) 012-9876', email: 'elena@gymflow.com',   specialization: 'Yoga & Mobility',     experience_yrs: 5, status: 'Active'   },
  { id: 't3', branch_id: 'b2', first_name: 'David',  last_name: 'Chen',      phone: '(555) 013-4422', email: 'david@gymflow.com',   specialization: 'Powerlifting',        experience_yrs: 6, status: 'On Break' },
  { id: 't4', branch_id: 'b3', first_name: 'Sarah',  last_name: 'Miller',    phone: '(555) 014-7711', email: 'sarah.m@gymflow.com', specialization: 'Functional Fitness',  experience_yrs: 4, status: 'Active'   },
  { id: 't5', branch_id: 'b1', first_name: 'Julian', last_name: 'Vance',     phone: '(555) 015-8833', email: 'julian@gymflow.com',  specialization: 'Bio-Mechanics',       experience_yrs: 3, status: 'Offline'  },
]

// ─── Members ──────────────────────────────────────────────────────────────────
export const initialMembers = [
  { id: 'GF-10292', branch_id: 'b1', trainer_id: 't1', first_name: 'Sarah',  last_name: 'Jenkins',  phone: '(555) 012-3456', email: 'sarah.j@example.com',  dob: '1995-04-12', gender: 'Female', plan: 'Annual',    join_date: '2025-10-12', renewal_date: '2026-10-12', notes: 'Prefers morning sessions. Focusing on strength.' },
  { id: 'GF-10304', branch_id: 'b1', trainer_id: 't2', first_name: 'David',  last_name: 'Miller',   phone: '(555) 098-7654', email: 'd.miller@example.com', dob: '1982-08-15', gender: 'Male',   plan: 'Monthly',   join_date: '2026-05-15', renewal_date: '2026-06-25', notes: 'Recovering from minor knee strain.'           },
  { id: 'GF-09882', branch_id: 'b1', trainer_id: null, first_name: 'Alex',   last_name: 'Rivera',   phone: '(555) 443-2211', email: 'alex.r@example.com',   dob: '1990-12-01', gender: 'Male',   plan: 'Monthly',   join_date: '2026-03-22', renewal_date: '2026-06-15', notes: 'Lapsed member. Contacted once.'               },
  { id: 'GF-11445', branch_id: 'b1', trainer_id: 't1', first_name: 'Elena',  last_name: 'Rodriguez',phone: '(555) 887-6655', email: 'elena.r@example.com',  dob: '1998-03-24', gender: 'Female', plan: 'Monthly',   join_date: '2025-11-30', renewal_date: '2026-11-30', notes: 'Enjoys high-intensity weight training.'        },
  { id: 'GF-10023', branch_id: 'b1', trainer_id: 't2', first_name: 'James',  last_name: 'Wilson',   phone: '(555) 321-4567', email: 'j.wilson@example.com', dob: '1975-01-20', gender: 'Male',   plan: 'Monthly',   join_date: '2026-05-15', renewal_date: '2026-06-28', notes: 'Prefers stretching routines.'                 },
  { id: 'GF-20192', branch_id: 'b2', trainer_id: 't3', first_name: 'Sophia', last_name: 'Patel',    phone: '(555) 234-5678', email: 'spatel@example.com',   dob: '1992-11-12', gender: 'Female', plan: 'Quarterly', join_date: '2026-04-01', renewal_date: '2026-07-01', notes: 'Wants to improve posture and squat form.'     },
  { id: 'GF-30111', branch_id: 'b3', trainer_id: 't4', first_name: 'Mike',   last_name: 'Olsen',    phone: '(555) 345-6789', email: 'mike.o@example.com',   dob: '1988-06-05', gender: 'Male',   plan: 'Annual',    join_date: '2026-01-10', renewal_date: '2027-01-10', notes: 'Focusing on general conditioning.'            },
]

// ─── Payments ─────────────────────────────────────────────────────────────────
export const initialPayments = [
  { id: 'P-901', member_id: 'GF-10292', amount: 1200, currency: 'Birr', method: 'Card',     plan_label: 'Elite Annual — Oct 2025',      recorded_by: 'Super Admin',  paid_at: '2025-10-12T10:30:00Z' },
  { id: 'P-902', member_id: 'GF-10304', amount: 99,   currency: 'Birr', method: 'Cash',     plan_label: 'Pro Monthly — May 2026',       recorded_by: 'Front Desk',   paid_at: '2026-05-15T14:22:00Z' },
  { id: 'P-903', member_id: 'GF-09882', amount: 99,   currency: 'Birr', method: 'Transfer', plan_label: 'Standard Monthly — May 2026',  recorded_by: 'Super Admin',  paid_at: '2026-05-15T09:11:00Z' },
  { id: 'P-904', member_id: 'GF-11445', amount: 99,   currency: 'Birr', method: 'Card',     plan_label: 'Monthly — Nov 2025',           recorded_by: 'Front Desk',   paid_at: '2025-11-30T17:45:00Z' },
  { id: 'P-905', member_id: 'GF-20192', amount: 280,  currency: 'Birr', method: 'Card',     plan_label: 'Uptown Quarterly — Apr 2026',  recorded_by: 'Sophia Patel', paid_at: '2026-04-01T11:00:00Z' },
]

// ─── Notifications ────────────────────────────────────────────────────────────
export const initialNotifications = [
  { id: 'n1', type: 'Overdue', message: "Alex Rivera's membership is overdue since June 15",   member_id: 'GF-09882', branch_id: 'b1', is_read: false, created_at: '2026-06-15T00:00:00Z' },
  { id: 'n2', type: 'Warning', message: "David Miller's membership expires in 2 days",         member_id: 'GF-10304', branch_id: 'b1', is_read: false, created_at: '2026-06-23T08:00:00Z' },
  { id: 'n3', type: 'Success', message: "Payment of Birr 1,200 recorded for Sarah Jenkins",        member_id: 'GF-10292', branch_id: 'b1', is_read: true,  created_at: '2026-06-22T10:30:00Z' },
  { id: 'n4', type: 'Info',    message: "New member registered: James Wilson",                 member_id: 'GF-10023', branch_id: 'b1', is_read: false, created_at: '2026-06-15T14:22:00Z' },
]

// ─── Schedules ────────────────────────────────────────────────────────────────
export const initialSchedules = [
  { trainer_id: 't1', sessions: [
    { day: 0, time: '08:00 AM', member_id: 'GF-10292' },
    { day: 2, time: '10:00 AM', member_id: 'GF-11445' },
  ]},
  { trainer_id: 't2', sessions: [
    { day: 1, time: '12:00 PM', member_id: 'GF-10304' },
    { day: 4, time: '02:00 PM', member_id: 'GF-10023' },
  ]},
]

// ─── Auth Users ───────────────────────────────────────────────────────────────
export const TEST_USERS = [
  { email: 'admin@gymflow.com',   password: '123', name: 'Alex Rivera',   role: 'SuperAdmin', branch_id: null, trainer_id: null },
  { email: 'manager@gymflow.com', password: '123', name: 'Sophia Patel',  role: 'Manager',    branch_id: 'b1', trainer_id: null },
  { email: 'staff@gymflow.com',   password: '123', name: 'Sarah Chen',    role: 'Staff',      branch_id: 'b1', trainer_id: null },
  { email: 'trainer@gymflow.com', password: '123', name: 'Marcus Thorne', role: 'Trainer',    branch_id: 'b1', trainer_id: 't1' },
]
