import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  initialBranches,
  initialTrainers,
  initialMembers,
  initialPayments,
  initialNotifications,
  initialSchedules,
  TODAY_STR,
  TEST_USERS,
} from '@/data/mockData'
import { getMemberStatus, extendDate, genPaymentId, genMemberId } from '@/utils/helpers'

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──
      currentUser:   null,
      currentBranch: 'b1',   // branch_id or 'all'

      // ── Data ──
      gyms:          [{ id: 'g1', name: 'GYM-SYS Franchise' }],
      branches:      initialBranches,
      trainers:      initialTrainers,
      members:       initialMembers,
      payments:      initialPayments,
      notifications: initialNotifications,
      schedules:     initialSchedules,
      schedules:     initialSchedules,
      amenities:     [],
      expenses:      [],
      actionLogs:    [],
      systemUsers:   TEST_USERS,

      // ── Toasts ──
      toasts: [],

      // ─────────────────────────────────────────────────────────────────────
      // AUTH
      // ─────────────────────────────────────────────────────────────────────
      login: (user) => {
        set({
          currentUser:   user,
          currentBranch: user.branch_id ?? 'all',
        })
        get().addToast('Success', `Logged in as ${user.name} (${user.role})`)
      },

      logout: () => {
        set({ currentUser: null, currentBranch: 'b1' })
      },

      setCurrentBranch: (id) => set({ currentBranch: id }),

      addSystemUser: (user) => {
        set((s) => ({ systemUsers: [...s.systemUsers, user] }))
        get().addToast('Success', `System account created for ${user.name}`)
      },

      // ─────────────────────────────────────────────────────────────────────
      // MEMBERS
      // ─────────────────────────────────────────────────────────────────────
      addMember: (data) => {
        const newId = genMemberId()
        const renewalDate = extendDate(data.start_date, data.plan)

        const newMember = {
          id:           newId,
          branch_id:    data.branch_id,
          trainer_id:   data.trainer_id || null,
          first_name:   data.first_name,
          last_name:    data.last_name,
          phone:        data.phone,
          email:        data.email || null,
          dob:          data.dob || null,
          gender:       data.gender,
          plan:         data.plan,
          join_date:    data.start_date,
          renewal_date: renewalDate,
          notes:        data.notes || '',
        }

        const newPayment = {
          id:          genPaymentId(),
          member_id:   newId,
          amount:      parseFloat(data.payment_amount),
          currency:    'Birr',
          method:      data.payment_method,
          plan_label:  `${data.plan} Plan Registration`,
          recorded_by: get().currentUser?.name ?? 'System',
          paid_at:     new Date().toISOString(),
        }

        const notif = {
          id:         'n_' + Date.now(),
          type:       'Success',
          message:    `New member registered: ${newMember.first_name} ${newMember.last_name}`,
          member_id:  newId,
          branch_id:  data.branch_id,
          is_read:    false,
          created_at: new Date().toISOString(),
        }

        const snapshot = { members: get().members, payments: get().payments, notifications: get().notifications }

        set((s) => ({
          members:       [...s.members, newMember],
          payments:      [newPayment, ...s.payments],
          notifications: [notif, ...s.notifications],
        }))

        if (get().logAction) get().logAction(`Registered member ${newMember.first_name} ${newMember.last_name}`, snapshot)
        get().addToast('Success', `Registered ${newMember.first_name} and logged payment.`)
      },

      updateMember: (updated) => {
        set((s) => ({
          members: s.members.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)),
        }))
        get().addToast('Success', `Updated profile for ${updated.first_name} ${updated.last_name}`)
      },

      deleteMember: (id) => {
        set((s) => ({
          members:  s.members.filter((m) => m.id !== id),
          payments: s.payments.filter((p) => p.member_id !== id),
        }))
        get().addToast('Warning', 'Member deleted from directory.')
      },

      // ─────────────────────────────────────────────────────────────────────
      // TRAINERS
      // ─────────────────────────────────────────────────────────────────────
      addTrainer: (data) => {
        const newTrainer = {
          id:             't_' + Date.now(),
          branch_id:      data.branch_id,
          first_name:     data.first_name,
          last_name:      data.last_name,
          phone:          data.phone,
          email:          data.email || null,
          specialization: data.specialization,
          experience_yrs: parseInt(data.experience_yrs) || 0,
          stipend_per_member: parseFloat(data.stipend_per_member || 0),
          status:         'Active',
        }

        const snapshot = { trainers: get().trainers }

        set((s) => ({
          trainers: [...s.trainers, newTrainer],
        }))

        if (get().logAction) get().logAction(`Added trainer ${newTrainer.first_name} ${newTrainer.last_name}`, snapshot)
        get().addToast('Success', `Added trainer ${newTrainer.first_name} ${newTrainer.last_name}`)
      },

      updateTrainerStatus: (trainerId, status) => {
        set((s) => ({
          trainers: s.trainers.map((t) => (t.id === trainerId ? { ...t, status } : t)),
        }))
        get().addToast('Info', `Trainer status updated to "${status}"`)
      },

      // ─────────────────────────────────────────────────────────────────────
      // PAYMENTS
      // ─────────────────────────────────────────────────────────────────────
      recordPayment: (data) => {
        const { members, currentUser } = get()
        const member = members.find((m) => m.id === data.member_id)
        if (!member) return

        // Extend renewal from today if already overdue, otherwise from current expiry
        const base    = new Date(member.renewal_date) > new Date(TODAY_STR) ? member.renewal_date : TODAY_STR
        const newDate = extendDate(base, data.plan_duration)

        const newPayment = {
          id:          genPaymentId(),
          member_id:   member.id,
          amount:      parseFloat(data.amount),
          currency:    'Birr',
          method:      data.method,
          plan_label:  data.plan_label,
          recorded_by: currentUser?.name ?? 'System',
          paid_at:     new Date().toISOString(),
        }

        const notif = {
          id:         'n_' + Date.now(),
          type:       'Success',
          message:    `Payment of Birr ${data.amount} recorded for ${member.first_name} ${member.last_name}. Plan extended to ${newDate}.`,
          member_id:  member.id,
          branch_id:  member.branch_id,
          is_read:    false,
          created_at: new Date().toISOString(),
        }

        const snapshot = { members: get().members, payments: get().payments, notifications: get().notifications }

        set((s) => ({
          members:       s.members.map((m) => m.id === member.id ? { ...m, renewal_date: newDate } : m),
          payments:      [newPayment, ...s.payments],
          notifications: [notif, ...s.notifications],
        }))

        if (get().logAction) get().logAction(`Recorded Birr ${data.amount} payment for ${member.first_name}`, snapshot)
        get().addToast('Success', `Recorded Birr ${data.amount} payment and extended membership.`)
        return newPayment
      },

      recordDailyEntry: (branchId) => {
        const branch = get().branches.find(b => b.id === branchId)
        if (!branch) return
        const amount = parseFloat(branch.daily_rate || 0)
        
        const newPayment = {
          id:          genPaymentId(),
          member_id:   'Daily_Entry',
          amount,
          currency:    'Birr',
          method:      'Cash',
          plan_label:  `Daily Entry at ${branch.name}`,
          recorded_by: get().currentUser?.name ?? 'System',
          paid_at:     new Date().toISOString(),
        }

        const snapshot = { payments: get().payments }
        set((s) => ({ payments: [newPayment, ...s.payments] }))
        if (get().logAction) get().logAction(`Recorded Daily Entry for Birr ${amount}`, snapshot)
        get().addToast('Success', `Recorded Daily Entry for Birr ${amount}.`)
      },

      // ─────────────────────────────────────────────────────────────────────
      // SCHEDULES
      // ─────────────────────────────────────────────────────────────────────
      scheduleSession: (trainerId, day, time, memberId) => {
        set((s) => {
          const existing = s.schedules.find((sc) => sc.trainer_id === trainerId)
          if (existing) {
            return {
              schedules: s.schedules.map((sc) =>
                sc.trainer_id === trainerId
                  ? { ...sc, sessions: [...sc.sessions, { day, time, member_id: memberId }] }
                  : sc
              ),
            }
          }
          return { schedules: [...s.schedules, { trainer_id: trainerId, sessions: [{ day, time, member_id: memberId }] }] }
        })
        
        const notif = {
          id:         'n_sched_' + Date.now(),
          type:       'Info',
          message:    `New session scheduled on ${day} at ${time}.`,
          member_id:  memberId,
          branch_id:  get().currentBranch,
          is_read:    false,
          created_at: new Date().toISOString(),
        }
        set((s) => ({ notifications: [notif, ...s.notifications] }))
        
        get().addToast('Success', 'Session scheduled successfully.')
      },

      cancelSession: (trainerId, day, time) => {
        set((s) => ({
          schedules: s.schedules.map((sc) =>
            sc.trainer_id === trainerId
              ? { ...sc, sessions: sc.sessions.filter((sess) => !(sess.day === day && sess.time === time)) }
              : sc
          ),
        }))
        get().addToast('Info', 'Session cancelled.')
      },

      // ─────────────────────────────────────────────────────────────────────
      // GYMS & BRANCHES
      // ─────────────────────────────────────────────────────────────────────
      addGym: (name) => {
        const newGym = { id: 'g_' + Date.now(), name }
        set((s) => ({ gyms: [...(s.gyms || [{ id: 'g1', name: 'GYM-SYS Franchise' }]), newGym] }))
        get().addToast('Success', `Gym Profile "${name}" created.`)
      },

      deleteGym: (id) => {
        set((s) => ({ gyms: s.gyms.filter((g) => g.id !== id) }))
        get().addToast('Warning', 'Gym profile removed.')
      },

      addBranch: (data) => {
        const newBranch = {
          id:           'b_' + Date.now(),
          gym_id:       data.gym_id || 'g1',
          name:         data.name,
          address:      data.address,
          phone:        data.phone,
          manager_name: data.manager_name || 'Unassigned',
          opening_time: data.opening_time || '06:00 AM',
          closing_time: data.closing_time || '10:00 PM',
          lunch_start:  data.lunch_start || '12:00 PM',
          lunch_end:    data.lunch_end || '02:00 PM',
          monthly_rate: parseFloat(data.monthly_rate || 0),
          quarterly_rate: parseFloat(data.quarterly_rate || 0),
          daily_rate: parseFloat(data.daily_rate || 0),
        }
        set((s) => ({ branches: [...s.branches, newBranch] }))
        get().addToast('Success', `Branch "${newBranch.name}" created under gym.`)
      },

      updateBranch: (data) => {
        set((s) => ({
          branches: s.branches.map((b) => (b.id === data.id ? { ...b, ...data } : b)),
        }))
        get().addToast('Success', `Branch "${data.name}" updated.`)
      },

      deleteBranch: (id) => {
        set((s) => ({ branches: s.branches.filter((b) => b.id !== id) }))
        get().addToast('Warning', 'Branch deactivated.')
      },

      // ─────────────────────────────────────────────────────────────────────
      // AMENITIES
      // ─────────────────────────────────────────────────────────────────────
      addAmenity: (data) => {
        const newAmenity = {
          id: 'a_' + Date.now(),
          branch_id: data.branch_id || get().currentBranch === 'all' ? (get().branches[0]?.id || 'b1') : get().currentBranch,
          name: data.name,
          category: data.category,
          price: parseFloat(data.price),
          stock: parseInt(data.stock),
          image: data.image || null,
        }
        set((s) => ({ amenities: [...s.amenities, newAmenity] }))
        get().addToast('Success', `Added ${newAmenity.name} to amenities.`)
      },

      sellAmenity: (item) => {
        if (item.stock <= 0) {
          get().addToast('Error', 'Item is out of stock.')
          return
        }

        const newPayment = {
          id:          genPaymentId(),
          member_id:   'Amenity_Sale',
          amount:      parseFloat(item.price),
          currency:    'Birr',
          method:      'Cash',
          plan_label:  `Sold ${item.name}`,
          recorded_by: get().currentUser?.name ?? 'System',
          paid_at:     new Date().toISOString(),
        }

        const snapshot = { amenities: get().amenities, payments: get().payments }

        set((s) => ({
          amenities: s.amenities.map(a => a.id === item.id ? { ...a, stock: a.stock - 1 } : a),
          payments: [newPayment, ...s.payments]
        }))

        if (get().logAction) get().logAction(`Sold ${item.name}`, snapshot)
        get().addToast('Success', `Sold ${item.name} for Birr ${item.price}.`)
      },

      deleteAmenity: (id) => {
        set((s) => ({ amenities: s.amenities.filter((a) => a.id !== id) }))
        get().addToast('Warning', 'Amenity removed.')
      },

      // ─────────────────────────────────────────────────────────────────────
      // EXPENSES
      // ─────────────────────────────────────────────────────────────────────
      addExpense: (data) => {
        const newExpense = {
          id: 'exp_' + Date.now(),
          branch_id: get().currentBranch === 'all' ? (get().branches[0]?.id || 'b1') : get().currentBranch,
          type: data.type,
          reason: data.reason,
          amount: parseFloat(data.amount),
          date: new Date().toISOString(),
          recorded_by: get().currentUser?.name ?? 'System',
        }
        set((s) => ({ expenses: [newExpense, ...(s.expenses || [])] }))
        get().addToast('Success', `Recorded expense of Birr ${newExpense.amount}.`)
      },

      // ─────────────────────────────────────────────────────────────────────
      // NOTIFICATIONS
      // ─────────────────────────────────────────────────────────────────────
      markNotifRead: (id) => {
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        }))
      },

      markAllNotifsRead: () => {
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, is_read: true })) }))
        get().addToast('Info', 'All notifications marked as read.')
      },

      // ─────────────────────────────────────────────────────────────────────
      // CRON: RECALCULATE MEMBERSHIP STATUSES
      // ─────────────────────────────────────────────────────────────────────
      runStatusRecalculation: () => {
        const { members, notifications } = get()
        const newAlerts = []

        members.forEach((m) => {
          const status = getMemberStatus(m.renewal_date)
          if (status === 'Overdue' && !notifications.some((n) => n.member_id === m.id && n.type === 'Overdue')) {
            newAlerts.push({
              id:         'n_cron_' + m.id + '_' + Date.now(),
              type:       'Overdue',
              message:    `Membership overdue: ${m.first_name} ${m.last_name} (since ${m.renewal_date})`,
              member_id:  m.id,
              branch_id:  m.branch_id,
              is_read:    false,
              created_at: new Date().toISOString(),
            })
          } else if (status === 'Expiring' && !notifications.some((n) => n.member_id === m.id && n.type === 'Warning')) {
            newAlerts.push({
              id:         'n_cron_' + m.id + '_' + Date.now(),
              type:       'Warning',
              message:    `Membership expiring soon: ${m.first_name} ${m.last_name} (on ${m.renewal_date})`,
              member_id:  m.id,
              branch_id:  m.branch_id,
              is_read:    false,
              created_at: new Date().toISOString(),
            })
          }
        })

        if (newAlerts.length > 0) {
          set((s) => ({ notifications: [...newAlerts, ...s.notifications] }))
        }

        get().addToast('Success', `Status recalculated. ${newAlerts.length} new alert(s) generated.`)
      },

      // ─────────────────────────────────────────────────────────────────────
      // LOGS / UNDO
      // ─────────────────────────────────────────────────────────────────────
      logAction: (description, undoSnapshot) => {
        const id = 'log_' + Date.now()
        set((s) => ({
          actionLogs: [{ id, description, timestamp: new Date().toISOString(), undoSnapshot }, ...(s.actionLogs || [])].slice(0, 50)
        }))
      },

      undoAction: (logId) => {
        const log = get().actionLogs?.find(l => l.id === logId)
        if (!log || !log.undoSnapshot) return
        set((s) => ({ ...log.undoSnapshot, actionLogs: s.actionLogs.filter(l => l.id !== logId) }))
        get().addToast('Success', `Undid action: ${log.description}`)
      },

      // ─────────────────────────────────────────────────────────────────────
      // TOAST SYSTEM
      // ─────────────────────────────────────────────────────────────────────
      addToast: (type, message) => {
        const id = Date.now()
        set((s) => ({ toasts: [...s.toasts, { id, type, message }] }))
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
        }, 4000)
      },

      dismissToast: (id) => {
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
      },
    }),
    {
      name: 'gymsys-store',
      // Only persist data, not ephemeral state like toasts
      partialize: (s) => ({
        currentUser:   s.currentUser,
        currentBranch: s.currentBranch,
        gyms:          s.gyms || [{ id: 'g1', name: 'GYM-SYS Franchise' }],
        branches:      s.branches,
        trainers:      s.trainers,
        members:       s.members,
        payments:      s.payments,
        notifications: s.notifications,
        schedules:     s.schedules,
        amenities:     s.amenities,
        expenses:      s.expenses || [],
        actionLogs:    s.actionLogs || [],
        systemUsers:   s.systemUsers || TEST_USERS,
      }),
    }
  )
)
