import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getMemberStatus } from '@/utils/helpers'
import {
  authApi, gymsApi, branchesApi, trainersApi, membersApi,
  paymentsApi, schedulesApi, amenitiesApi, expensesApi, notificationsApi,
} from '@/api/api'

// ─── Store ────────────────────────────────────────────────────────────────────
export const useStore = create(
  persist(
    (set, get) => ({
      // ── Auth ──
      currentUser:   null,
      currentBranch: 'all',   // branch_id or 'all'

      // ── Data (cached from API) ──
      gyms:          [],
      branches:      [],
      trainers:      [],
      members:       [],
      payments:      [],
      notifications: [],
      schedules:     [],
      amenities:     [],
      expenses:      [],
      actionLogs:    [],
      systemUsers:   [],

      // ── Loading ──
      loading: {},

      // ── Toasts ──
      toasts: [],

      // ─────────────────────────────────────────────────────────────────────
      // INTERNAL HELPERS
      // ─────────────────────────────────────────────────────────────────────
      _setLoading: (key, val) =>
        set((s) => ({ loading: { ...s.loading, [key]: val } })),

      // ─────────────────────────────────────────────────────────────────────
      // AUTH
      // ─────────────────────────────────────────────────────────────────────
      login: async (email, password) => {
        get()._setLoading('login', true)
        try {
          const res = await authApi.login(email, password)
          // res = { access_token, user: { id, email, name, role, branchId, trainerId } }
          const userWithToken = {
            ...res.user,
            access_token: res.access_token,
            branch_id:    res.user.branchId ?? null,
            trainer_id:   res.user.trainerId ?? null,
          }
          set({
            currentUser:   userWithToken,
            currentBranch: userWithToken.branch_id ?? 'all',
          })
          get().addToast('Success', `Logged in as ${userWithToken.name} (${userWithToken.role})`)
          // Kick off initial data load
          await get().loadInitialData()
          return userWithToken
        } finally {
          get()._setLoading('login', false)
        }
      },

      logout: () => {
        set({
          currentUser:   null,
          currentBranch: 'all',
          members:       [],
          payments:      [],
          trainers:      [],
          branches:      [],
          notifications: [],
          schedules:     [],
          amenities:     [],
          expenses:      [],
        })
      },

      setCurrentBranch: async (id) => {
        set({ currentBranch: id })
        await get().refreshAll()
      },

      // ─────────────────────────────────────────────────────────────────────
      // INITIAL DATA LOAD
      // ─────────────────────────────────────────────────────────────────────
      loadInitialData: async () => {
        await get().refreshAll()
      },

      refreshAll: async () => {
        const branchId = get().currentBranch
        try {
          const [branches, trainers, members, payments, notifications, schedules, amenities, expenses] =
            await Promise.all([
              branchesApi.list().catch(() => []),
              trainersApi.list(branchId !== 'all' ? branchId : undefined).catch(() => []),
              membersApi.list(branchId).catch(() => []),
              paymentsApi.list(branchId).catch(() => []),
              notificationsApi.list(branchId).catch(() => []),
              schedulesApi.list().catch(() => []),
              amenitiesApi.list(branchId).catch(() => []),
              expensesApi.list(branchId).catch(() => []),
            ])
          set({ branches, trainers, members, payments, notifications, schedules, amenities, expenses })
        } catch (err) {
          get().addToast('Error', 'Failed to refresh data from server.')
        }
      },

      // ─────────────────────────────────────────────────────────────────────
      // MEMBERS
      // ─────────────────────────────────────────────────────────────────────
      addMember: async (data) => {
        try {
          const member = await membersApi.create(data)
          // Refresh members + payments + notifications after transaction
          const [members, payments, notifications] = await Promise.all([
            membersApi.list(get().currentBranch).catch(() => get().members),
            paymentsApi.list(get().currentBranch).catch(() => get().payments),
            notificationsApi.list(get().currentBranch).catch(() => get().notifications),
          ])
          set({ members, payments, notifications })
          get().addToast('Success', `Registered ${member.firstName} and logged payment.`)
          return member
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      updateMember: async (data) => {
        // data has id + changed fields (snake_case from UI forms)
        const payload = {
          first_name: data.first_name,
          last_name:  data.last_name,
          phone:      data.phone,
          email:      data.email,
          dob:        data.dob,
          gender:     data.gender,
          plan:       data.plan,
          trainer_id: data.trainer_id,
          notes:      data.notes,
        }
        try {
          const updated = await membersApi.update(data.id, payload)
          set((s) => ({
            members: s.members.map((m) => m.id === data.id ? { ...m, ...updated } : m),
          }))
          get().addToast('Success', `Updated profile for ${updated.firstName ?? data.first_name}`)
          return updated
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      deleteMember: async (id) => {
        try {
          await membersApi.delete(id)
          set((s) => ({
            members:  s.members.filter((m) => m.id !== id),
            payments: s.payments.filter((p) => p.memberId !== id && p.member_id !== id),
          }))
          get().addToast('Warning', 'Member deleted from directory.')
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      // ─────────────────────────────────────────────────────────────────────
      // TRAINERS
      // ─────────────────────────────────────────────────────────────────────
      addTrainer: async (data) => {
        try {
          const trainer = await trainersApi.create({
            branch_id:          data.branch_id,
            first_name:         data.first_name,
            last_name:          data.last_name,
            phone:              data.phone,
            email:              data.email,
            specialization:     data.specialization,
            experience_yrs:     parseInt(data.experience_yrs) || 0,
            stipend_per_member: parseFloat(data.stipend_per_member || 0),
          })
          set((s) => ({ trainers: [...s.trainers, trainer] }))
          get().addToast('Success', `Added trainer ${trainer.firstName} ${trainer.lastName}`)
          return trainer
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      updateTrainerStatus: async (trainerId, status, unavailableUntil = null, unavailableDuration = null) => {
        try {
          const updated = await trainersApi.updateStatus(trainerId, status, unavailableUntil, unavailableDuration)
          set((s) => ({
            trainers: s.trainers.map((t) => t.id === trainerId ? { ...t, ...updated } : t),
          }))
          get().addToast('Info', `Trainer status updated to "${status}"`)
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      // ─────────────────────────────────────────────────────────────────────
      // PAYMENTS
      // ─────────────────────────────────────────────────────────────────────
      recordPayment: async (data) => {
        // data: { member_id, plan_duration ('Monthly'|'Quarterly'|'Annual'), amount, method }
        try {
          const result = await paymentsApi.renew({
            member_id:      data.member_id,
            plan:           data.plan_duration,
            payment_amount: parseFloat(data.amount),
            payment_method: data.method,
          })
          // Update local member renewal date + add payment
          set((s) => ({
            members: s.members.map((m) =>
              m.id === data.member_id
                ? { ...m, renewalDate: result.newRenewalDate, renewal_date: result.newRenewalDate }
                : m
            ),
            payments:      [result.payment, ...s.payments],
          }))
          // Refresh notifications
          const notifications = await notificationsApi.list(get().currentBranch).catch(() => get().notifications)
          set({ notifications })
          get().addToast('Success', `Recorded Birr ${data.amount} payment and extended membership.`)
          return result.payment
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      recordDailyEntry: async (branchId) => {
        const branch = get().branches.find((b) => b.id === branchId)
        try {
          const payment = await paymentsApi.dailyEntry({
            branch_id:      branchId,
            payment_method: 'Cash',
          })
          set((s) => ({ payments: [payment, ...s.payments] }))
          get().addToast('Success', `Recorded Daily Entry for Birr ${branch?.dailyRate ?? branch?.daily_rate ?? '?'}.`)
          return payment
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      // ─────────────────────────────────────────────────────────────────────
      // SCHEDULES
      // ─────────────────────────────────────────────────────────────────────
      scheduleSession: async (trainerId, day, time, memberId) => {
        try {
          const schedule = await schedulesApi.book({
            trainer_id: trainerId,
            day:        parseInt(day),
            time,
            member_id:  memberId,
          })
          const schedules = await schedulesApi.list().catch(() => get().schedules)
          const notifications = await notificationsApi.list(get().currentBranch).catch(() => get().notifications)
          set({ schedules, notifications })
          get().addToast('Success', 'Session scheduled successfully.')
          return schedule
        } catch (err) {
          // Surface 409 conflict as a toast
          get().addToast('Error', err.message)
          throw err
        }
      },

      cancelSession: async (trainerId, day, time) => {
        try {
          await schedulesApi.cancel(trainerId, day, time)
          const schedules = await schedulesApi.list().catch(() => get().schedules)
          set({ schedules })
          get().addToast('Info', 'Session cancelled.')
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      // ─────────────────────────────────────────────────────────────────────
      // GYMS & BRANCHES
      // ─────────────────────────────────────────────────────────────────────
      addGym: async (name) => {
        try {
          const gym = await gymsApi.create({ name })
          set((s) => ({ gyms: [...(s.gyms || []), gym] }))
          get().addToast('Success', `Gym Profile "${name}" created.`)
          return gym
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      deleteGym: async (id) => {
        try {
          await gymsApi.delete(id)
          set((s) => ({ gyms: s.gyms.filter((g) => g.id !== id) }))
          get().addToast('Warning', 'Gym profile removed.')
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      addBranch: async (data) => {
        try {
          const branch = await branchesApi.create(data)
          set((s) => ({ branches: [...s.branches, branch] }))
          get().addToast('Success', `Branch "${branch.name}" created.`)
          return branch
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      updateBranch: async (data) => {
        try {
          const updated = await branchesApi.update(data.id, data)
          set((s) => ({
            branches: s.branches.map((b) => b.id === data.id ? { ...b, ...updated } : b),
          }))
          get().addToast('Success', `Branch "${updated.name ?? data.name}" updated.`)
          return updated
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      deleteBranch: async (id) => {
        try {
          await branchesApi.delete(id)
          set((s) => ({ branches: s.branches.filter((b) => b.id !== id) }))
          get().addToast('Warning', 'Branch deactivated.')
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      // ─────────────────────────────────────────────────────────────────────
      // AMENITIES
      // ─────────────────────────────────────────────────────────────────────
      addAmenity: async (data) => {
        const branchId = get().currentBranch === 'all'
          ? get().branches[0]?.id
          : get().currentBranch
        try {
          const amenity = await amenitiesApi.create({ ...data, branch_id: data.branch_id || branchId })
          set((s) => ({ amenities: [...s.amenities, amenity] }))
          get().addToast('Success', `Added ${amenity.name} to amenities.`)
          return amenity
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      sellAmenity: async (item) => {
        try {
          const result = await amenitiesApi.sell(item.id)
          set((s) => ({
            amenities: s.amenities.map((a) =>
              a.id === item.id ? { ...a, stock: result.remainingStock } : a
            ),
            payments: [result.payment, ...s.payments],
          }))
          get().addToast('Success', `Sold ${item.name} for Birr ${item.price}.`)
          return result
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      deleteAmenity: async (id) => {
        // No backend DELETE endpoint in Step 3; keep local for now
        set((s) => ({ amenities: s.amenities.filter((a) => a.id !== id) }))
        get().addToast('Warning', 'Amenity removed.')
      },

      // ─────────────────────────────────────────────────────────────────────
      // EXPENSES
      // ─────────────────────────────────────────────────────────────────────
      addExpense: async (data) => {
        const branchId = get().currentBranch === 'all'
          ? get().branches[0]?.id
          : get().currentBranch
        try {
          const expense = await expensesApi.create({ ...data, branch_id: data.branch_id || branchId })
          set((s) => ({ expenses: [expense, ...(s.expenses || [])] }))
          get().addToast('Success', `Recorded expense of Birr ${expense.amount}.`)
          return expense
        } catch (err) {
          get().addToast('Error', err.message)
          throw err
        }
      },

      // ─────────────────────────────────────────────────────────────────────
      // NOTIFICATIONS
      // ─────────────────────────────────────────────────────────────────────
      markNotifRead: async (id) => {
        try {
          await notificationsApi.markRead(id)
          set((s) => ({
            notifications: s.notifications.map((n) => n.id === id ? { ...n, isRead: true, is_read: true } : n),
          }))
        } catch {
          // Optimistic update already done locally — ignore error
        }
      },

      markAllNotifsRead: async () => {
        const branchId = get().currentBranch
        try {
          await notificationsApi.markAllRead(branchId)
          set((s) => ({
            notifications: s.notifications.map((n) => ({ ...n, isRead: true, is_read: true })),
          }))
          get().addToast('Info', 'All notifications marked as read.')
        } catch (err) {
          get().addToast('Error', err.message)
        }
      },

      // ─────────────────────────────────────────────────────────────────────
      // CRON: RECALCULATE MEMBERSHIP STATUSES (local only — UI helper)
      // ─────────────────────────────────────────────────────────────────────
      runStatusRecalculation: async () => {
        // Re-fetch fresh members from the server
        try {
          const members = await membersApi.list(get().currentBranch)
          set({ members })
          get().addToast('Success', 'Member statuses refreshed from server.')
        } catch {
          get().addToast('Error', 'Failed to refresh member statuses.')
        }
      },

      // ─────────────────────────────────────────────────────────────────────
      // LOGS (local only)
      // ─────────────────────────────────────────────────────────────────────
      logAction: (description, undoSnapshot) => {
        const id = 'log_' + Date.now()
        set((s) => ({
          actionLogs: [
            { id, description, timestamp: new Date().toISOString(), undoSnapshot },
            ...(s.actionLogs || []),
          ].slice(0, 50),
        }))
      },

      undoAction: (logId) => {
        const log = get().actionLogs?.find((l) => l.id === logId)
        if (!log || !log.undoSnapshot) return
        set((s) => ({ ...log.undoSnapshot, actionLogs: s.actionLogs.filter((l) => l.id !== logId) }))
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

      // ─────────────────────────────────────────────────────────────────────
      // COMPAT: addSystemUser kept for Admin Portal page
      // ─────────────────────────────────────────────────────────────────────
      addSystemUser: (user) => {
        set((s) => ({ systemUsers: [...(s.systemUsers || []), user] }))
        get().addToast('Success', `System account created for ${user.name}`)
      },
    }),
    {
      name: 'gymsys-store',
      partialize: (s) => ({
        currentUser:   s.currentUser,
        currentBranch: s.currentBranch,
        gyms:          s.gyms,
        branches:      s.branches,
        trainers:      s.trainers,
        members:       s.members,
        payments:      s.payments,
        notifications: s.notifications,
        schedules:     s.schedules,
        amenities:     s.amenities,
        expenses:      s.expenses || [],
        actionLogs:    s.actionLogs || [],
        systemUsers:   s.systemUsers || [],
      }),
    }
  )
)
