const styles = {
  Available: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Adopted: 'bg-blue-50 text-blue-700 border-blue-200',
  Rejected: 'bg-red-50 text-red-700 border-red-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ApplicationReceived: 'bg-purple-50 text-purple-700 border-purple-200',
  UnderReview: 'bg-amber-50 text-amber-700 border-amber-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function Badge({ status, className = '' }) {
  if (!status) return null;
  const s = String(status).replace(/([A-Z])/g, ' $1').trim();
  const key = String(status).charAt(0).toUpperCase() + String(status).slice(1);
  return (
    <span className={`badge border ${styles[key] || 'bg-gray-50 text-gray-600 border-gray-200'} ${className}`}>
      {s}
    </span>
  );
}
