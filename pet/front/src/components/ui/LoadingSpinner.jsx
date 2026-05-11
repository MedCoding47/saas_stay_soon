export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 border-4 border-coral/20 border-t-coral rounded-full animate-spin" />
      <p className="mt-4 text-gray-400 text-sm">{text}</p>
    </div>
  );
}
