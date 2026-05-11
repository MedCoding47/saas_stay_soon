export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-[3px] border-coral/10 rounded-full" />
        <div className="absolute inset-0 border-[3px] border-transparent border-t-coral rounded-full animate-spin" />
      </div>
      {text && <p className="mt-5 text-muted text-sm font-medium tracking-wide">{text}</p>}
    </div>
  );
}
