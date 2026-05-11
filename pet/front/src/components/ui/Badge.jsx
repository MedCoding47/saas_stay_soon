const styles = {
  Available: 'badge-available',
  Pending: 'badge-pending',
  Adopted: 'badge-adopted',
  Rejected: 'badge-rejected',
  Approved: 'badge-available',
};

export default function Badge({ status, className = '' }) {
  const s = status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
  return (
    <span className={`${styles[s] || 'badge bg-gray-100 text-gray-600 border-gray-200'} ${className}`}>
      {s || status}
    </span>
  );
}
