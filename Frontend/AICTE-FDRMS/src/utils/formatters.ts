export const formatInr = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatInrCompact = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }
  return formatInr(amount);
};

export const formatInrCompactShort = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  if (amount >= 10000000) {
    const val = amount / 10000000;
    return `₹${Number.isInteger(val) ? val.toFixed(0) : val.toFixed(1)} Cr`;
  } else if (amount >= 100000) {
    const val = amount / 100000;
    return `₹${Number.isInteger(val) ? val.toFixed(0) : val.toFixed(0)} L`;
  }
  return formatInr(amount);
};

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const getInstrumentStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return { label: 'Active', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'EXPIRING_SOON':
      return { label: 'Expiring Soon', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' };
    case 'MATURED':
      return { label: 'Matured', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' };
    case 'OVERDUE':
      return { label: 'Overdue Renewal', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' };
    case 'RENEWAL_PENDING':
      return { label: 'Renewal Pending', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' };
    case 'RENEWED':
      return { label: 'Renewed', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'REPLACED':
      return { label: 'Replaced', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'RELEASE_PENDING':
      return { label: 'Release Scrutiny', bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-300' };
    case 'RELEASED':
      return { label: 'Discharged / Released', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' };
    case 'CLOSED':
      return { label: 'Closed', bg: 'bg-zinc-100', text: 'text-zinc-600', border: 'border-zinc-200' };
    default:
      return { label: status, bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  }
};

export const getVerificationStatusBadge = (status: string) => {
  switch (status) {
    case 'VERIFIED':
      return { label: 'Bank Verified', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' };
    case 'DISCREPANCY_FOUND':
      return { label: 'Discrepancy Flagged', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' };
    case 'PENDING_SCRUTINY':
      return { label: 'Pending Scrutiny', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'UNDER_REVIEW':
      return { label: 'Under Review', bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    case 'UNABLE_TO_VERIFY':
      return { label: 'Unable to Verify', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' };
    default:
      return { label: status, bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  }
};

export const getCaseStatusBadge = (status: string) => {
  switch (status) {
    case 'AWAITING_SCRUTINY':
      return { label: 'Awaiting Scrutiny', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
    case 'SCRUTINY_IN_PROGRESS':
      return { label: 'Scrutiny In Progress', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' };
    case 'DISCREPANCY_NOTED':
      return { label: 'Discrepancy Noted', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' };
    case 'RECOMMENDED_FOR_APPROVAL':
    case 'AWAITING_APPROVAL':
      return { label: 'Awaiting Sanction', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300' };
    case 'APPROVED':
      return { label: 'Sanction Approved', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' };
    case 'REJECTED':
      return { label: 'Rejected', bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-300' };
    case 'COMPLETED':
      return { label: 'Discharge Completed', bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' };
    default:
      return { label: status, bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
  }
};
