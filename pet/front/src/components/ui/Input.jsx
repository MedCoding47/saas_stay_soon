export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <input className={`input ${error ? 'input-error' : ''} ${className}`} {...props} />
      {error && <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1"><span>•</span>{error}</p>}
    </div>
  );
}
