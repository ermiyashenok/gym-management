import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from '@/store/useStore'

// Layout
import AppLayout from '@/components/layout/AppLayout'
import ToastContainer from '@/components/ui/ToastContainer'

// Public pages
import LandingPage from '@/pages/LandingPage'
import LoginPage   from '@/pages/LoginPage'

// App pages
import DashboardPage      from '@/pages/DashboardPage'
import MembersPage        from '@/pages/MembersPage'
import AddMemberPage      from '@/pages/AddMemberPage'
import TrainersPage       from '@/pages/TrainersPage'
import AddTrainerPage     from '@/pages/AddTrainerPage'
import SchedulePage       from '@/pages/SchedulePage'
import PaymentsPage       from '@/pages/PaymentsPage'
import NotificationsPage  from '@/pages/NotificationsPage'
import BranchesPage       from '@/pages/BranchesPage'
import SettingsPage       from '@/pages/SettingsPage'
import AmenitiesPage      from '@/pages/AmenitiesPage'

// Modals (app-wide)
import MemberDetailsDrawer  from '@/components/modals/MemberDetailsDrawer'
import MemberEditModal      from '@/components/modals/MemberEditModal'
import RecordPaymentModal   from '@/components/modals/RecordPaymentModal'

// ── Auth guard ────────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const currentUser = useStore((s) => s.currentUser)
  if (!currentUser) return <Navigate to="/login" replace />
  return children
}

// ── Role guard (optional) ─────────────────────────────────────────────────────
function RequireRole({ roles, children }) {
  const currentUser = useStore((s) => s.currentUser)
  if (!roles.includes(currentUser?.role)) return <Navigate to="/app/dashboard" replace />
  return children
}

export default function App() {
  // App-wide modal state (lifted here so any page can trigger them)
  const [selectedMember,   setSelectedMember]   = useState(null)
  const [editingMember,    setEditingMember]    = useState(null)
  const [paymentModalFor,  setPaymentModalFor]  = useState(null) // member obj | 'select' | null

  const handleEdit = (member) => {
    setSelectedMember(null)
    setEditingMember(member)
  }

  const handleRecordPayment = (member) => {
    setSelectedMember(null)
    setPaymentModalFor(member)
  }

  return (
    <BrowserRouter>
      {/* Global toast stack */}
      <ToastContainer />

      {/* App-wide modals */}
      <MemberDetailsDrawer
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onEdit={handleEdit}
        onRecordPayment={handleRecordPayment}
      />
      <MemberEditModal
        member={editingMember}
        onClose={() => setEditingMember(null)}
      />
      <RecordPaymentModal
        member={paymentModalFor}
        onClose={() => setPaymentModalFor(null)}
      />

      <Routes>
        {/* ── Public ── */}
        <Route path="/"      element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />}   />

        {/* ── Protected App ── */}
        <Route path="/app" element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }>
          {/* Default redirect */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={
            <DashboardPage
              onSelectMember={setSelectedMember}
              onRecordPayment={setPaymentModalFor}
            />
          } />

          {/* Members */}
          <Route path="members" element={
            <MembersPage onSelectMember={setSelectedMember} />
          } />
          <Route path="members/add" element={
            <RequireRole roles={['SuperAdmin', 'Staff']}>
              <AddMemberPage />
            </RequireRole>
          } />

          {/* Trainers */}
          <Route path="trainers" element={<TrainersPage />} />
          <Route path="trainers/add" element={
            <RequireRole roles={['SuperAdmin', 'Staff']}>
              <AddTrainerPage />
            </RequireRole>
          } />

          {/* Schedule */}
          <Route path="schedule" element={<SchedulePage />} />

          {/* Payments */}
          <Route path="payments" element={<PaymentsPage />} />

          {/* Notifications */}
          <Route path="notifications" element={<NotificationsPage />} />

          {/* Branches */}
          <Route path="branches" element={
            <RequireRole roles={['SuperAdmin']}>
              <BranchesPage />
            </RequireRole>
          } />

          {/* Settings */}
          <Route path="settings" element={
            <RequireRole roles={['SuperAdmin']}>
              <SettingsPage />
            </RequireRole>
          } />

          {/* Amenities */}
          <Route path="amenities" element={
            <RequireRole roles={['SuperAdmin', 'Staff']}>
              <AmenitiesPage />
            </RequireRole>
          } />

          {/* Catch-all → dashboard */}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Global catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
