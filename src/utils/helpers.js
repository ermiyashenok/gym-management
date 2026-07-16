/** Today's date string in YYYY-MM-DD format */
export const TODAY_STR = new Date().toISOString().split('T')[0]


/**
 * Compute a member's membership status from their renewal date.
 * Active   → renewal > 7 days away
 * Expiring → renewal within 7 days (inclusive)
 * Overdue  → renewal date is in the past
 */
export function getMemberStatus(renewalDateStr) {
  const today   = new Date(TODAY_STR)
  const renewal = new Date(renewalDateStr)
  const diffMs  = renewal.getTime() - today.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays > 7)  return 'Active'
  if (diffDays > 0)  return 'Expiring'
  return 'Overdue'
}

/**
 * Extend a date string by a given plan duration.
 * Plan values: 'Monthly' | 'Quarterly' | 'Annual'
 */
export function extendDate(dateStr, plan) {
  const d = new Date(dateStr)
  if (plan === 'Quarterly') d.setMonth(d.getMonth() + 3)
  else if (plan === 'Annual') d.setFullYear(d.getFullYear() + 1)
  else d.setMonth(d.getMonth() + 1) // Monthly is default
  return d.toISOString().split('T')[0]
}

/** Generate a random payment ID string */
export function genPaymentId() {
  return 'P-' + Math.floor(1000 + Math.random() * 9000)
}

/** Generate a random member ID string */
export function genMemberId() {
  return 'GF-' + Math.floor(10000 + Math.random() * 90000)
}

/** Map a plan name to its default price */
export const PLAN_PRICES = {
  Monthly:   99,
  Quarterly: 280,
  Annual:    999,
}

/** Days of the week labels */
export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export const ALL_TIMES = ['06:00 AM', '08:00 AM', '10:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM', '10:00 PM']

/** Time slots shown on the timetable */
export const TIME_SLOTS = ['08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM']

export function parseTime(timeStr) {
  if (!timeStr) return 0;
  const [time, period] = timeStr.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function isSlotClosed(slot, branch) {
  if (!branch) return false;
  const slotTime = parseTime(slot);
  const openTime = parseTime(branch.opening_time || '06:00 AM');
  const closeTime = parseTime(branch.closing_time || '10:00 PM');
  const lunchStart = parseTime(branch.lunch_start || '12:00 PM');
  const lunchEnd = parseTime(branch.lunch_end || '12:00 PM');

  if (slotTime < openTime || slotTime >= closeTime) return true;
  if (lunchStart !== lunchEnd && slotTime >= lunchStart && slotTime < lunchEnd) return true;
  return false;
}

/**
 * Return badge CSS classes for a given status string.
 * Works for both member statuses and trainer statuses.
 */
export function statusClasses(status) {
  switch (status) {
    case 'Active':   return 'bg-success-emerald/10 text-success-emerald border-success-emerald/20'
    case 'Expiring': return 'bg-warning-orange/10  text-warning-orange  border-warning-orange/20'
    case 'Overdue':  return 'bg-danger-red/10      text-danger-red      border-danger-red/20'
    case 'On Break': return 'bg-warning-orange/10  text-warning-orange  border-warning-orange/20'
    case 'Offline':  return 'bg-surface-variant/50 text-on-surface-variant border-outline-variant/30'
    default:         return 'bg-surface-variant/50 text-on-surface-variant border-outline-variant/30'
  }
}

/**
 * Return the Material Symbol icon name for a notification type.
 */
export function notifIcon(type) {
  switch (type) {
    case 'Overdue': return 'error'
    case 'Warning': return 'warning'
    case 'Success': return 'check_circle'
    default:        return 'info'
  }
}

/**
 * Return colour CSS classes for a notification type.
 */
export function notifColor(type) {
  switch (type) {
    case 'Overdue': return 'text-danger-red'
    case 'Warning': return 'text-warning-orange'
    case 'Success': return 'text-success-emerald'
    default:        return 'text-primary'
  }
}

/** Download a CSV string as a file */
export function downloadCSV(filename, rows) {
  const blob = new Blob([rows], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
