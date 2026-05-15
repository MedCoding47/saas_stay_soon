export default function ProfileCard({
  imageUrl,
  name,
  subtitle,
  meta,
  badge,
  buttonLabel,
  buttonAction,
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-lg dark:shadow-2xl dark:shadow-black/80 overflow-hidden mx-auto group">
      {/* Image */}
      <div className="relative overflow-hidden group">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full aspect-square object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-coral/20 to-teal/20 flex items-center justify-center">
            <span className="text-6xl text-muted/30">?</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/30 dark:from-black/60 to-transparent pointer-events-none"></div>
        <div className="absolute top-6 left-6">
          <h2 className="text-2xl font-medium text-white drop-shadow-lg">{name}</h2>
        </div>
        {badge && (
          <div className="absolute top-6 right-6">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-800 shadow-sm">
              {badge}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-zinc-700 flex-shrink-0 transition-transform duration-500 ease-out group-hover:scale-110">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-warm-dark flex items-center justify-center text-xs font-bold text-muted">
                {name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className="transition-transform duration-500 ease-out group-hover:translate-x-1">
            <div className="text-sm text-gray-700 dark:text-zinc-200">{subtitle || name}</div>
            {meta && <div className="text-xs text-gray-500 dark:text-zinc-500">{meta}</div>}
          </div>
        </div>
        {buttonLabel && (
          <button
            onClick={(e) => { e.stopPropagation(); if (buttonAction) buttonAction(); }}
            className="bg-gray-900 dark:bg-zinc-800 text-white dark:text-zinc-100 rounded-lg px-4 py-2 text-sm font-medium
                     transition-all duration-500 ease-out hover:scale-105
                     hover:bg-gray-800 dark:hover:bg-zinc-700
                     active:scale-95 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/50"
          >
            {buttonLabel}
          </button>
        )}
      </div>
    </div>
  );
}
