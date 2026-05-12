import { cn } from '../../lib/utils';

const statusStyles = {
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Adopted: 'bg-blue-50 text-blue-700 border-blue-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ApplicationReceived: 'bg-purple-50 text-purple-700 border-purple-200',
  UnderReview: 'bg-amber-50 text-amber-700 border-amber-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const variantStyles = {
  Urgent: 'bg-urgent text-white border-urgent animate-pulse-urgent',
  Nouveau: 'bg-nouveau text-white border-nouveau',
  SOS: 'bg-sos text-white border-sos',
};

export default function Badge({ status, variant, className = '' }) {
  if (!status && !variant) return null;

  if (variant) {
    const style = variantStyles[variant];
    if (!style) return null;
    return (
      <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', style, className)}>
        {variant}
      </span>
    );
  }

  const s = String(status).replace(/([A-Z])/g, ' $1').trim();
  const key = String(status).charAt(0).toUpperCase() + String(status).slice(1);
  return (
    <span className={cn('badge border', statusStyles[key] || 'bg-gray-50 text-gray-600 border-gray-200', className)}>
      {s}
    </span>
  );
}
