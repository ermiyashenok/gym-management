import { useStore } from '@/store/useStore'
import { GhostButton } from '@/components/ui'

export default function ReceiptModal({ payment, onClose }) {
  const members  = useStore((s) => s.members)
  const branches = useStore((s) => s.branches)

  if (!payment) return null

  const member = members.find((m) => m.id === payment.member_id)
  const branch = member ? branches.find((b) => b.id === member.branch_id) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden page-enter">
        {/* Receipt body */}
        <div id="receipt-print" className="p-6 space-y-5">
          {/* Header */}
          <div className="text-center">
            <h3 className="font-headline text-xl font-bold uppercase tracking-wider">GymFlow Pro</h3>
            <p className="text-sm text-gray-500 mt-0.5">{branch?.name ?? 'GymFlow Downtown'}</p>
            <p className="text-xs text-gray-400">{branch?.address}</p>
            <div className="border-b border-dashed border-gray-300 my-4" />
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-600">Official Payment Receipt</h4>
          </div>

          {/* Fields */}
          <div className="space-y-2 text-sm">
            <ReceiptRow label="Receipt ID" value={`#${payment.id}`} mono />
            <ReceiptRow label="Date" value={new Date(payment.paid_at).toLocaleString()} />
            <ReceiptRow label="Member" value={member ? `${member.first_name} ${member.last_name}` : 'Unknown'} />
            <ReceiptRow label="Member ID" value={payment.member_id} mono />
            <ReceiptRow label="Method" value={payment.method} />
            <ReceiptRow label="Recorded By" value={payment.recorded_by} />
            <div className="border-t border-gray-100 pt-2">
              <ReceiptRow label="Plan Covered" value={payment.plan_label} />
            </div>
          </div>

          <div className="border-b border-dashed border-gray-300" />

          {/* Total */}
          <div className="flex justify-between items-baseline">
            <span className="text-sm font-bold uppercase text-gray-700">Total Paid</span>
            <span className="text-2xl font-bold font-mono">
              ${payment.amount.toFixed(2)} <span className="text-sm font-normal text-gray-500">Birr</span>
            </span>
          </div>

          <div className="text-center text-xs text-gray-400 pt-2">
            Thank you for your commitment. Keep pushing! 💪
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 px-6 pb-5">
          <GhostButton onClick={onClose} className="flex-1 text-gray-700 border-gray-200 hover:bg-gray-50">
            Close
          </GhostButton>
          <button
            onClick={() => window.print()}
            className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  )
}

function ReceiptRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-gray-500 shrink-0">{label}:</span>
      <span className={`text-right font-medium text-gray-800 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  )
}
