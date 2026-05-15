import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

const speciesEmoji = {
  Dog: '\u{1F415}', Cat: '\u{1F408}', Rabbit: '\u{1F430}', Bird: '\u{1F426}', Parrot: '\u{1F99C}',
  Hamster: '\u{1F439}', Fish: '\u{1F41F}', Turtle: '\u{1F422}', Horse: '\u{1F434}',
};

export default function PetCard({ pet, className }) {
  const navigate = useNavigate();
  const imgSrc = pet.imageUrl || pet.mainImageUrl;
  const isAvailable = pet.status === 'Available' || pet.status === 1;

  return (
    <div
      onClick={() => navigate(`/pets/${pet.id}`)}
      className={cn(
        'bg-white dark:bg-zinc-900 rounded-3xl shadow-lg dark:shadow-2xl dark:shadow-black/80 overflow-hidden cursor-pointer mx-auto',
        'transition-transform duration-700 ease-out hover:scale-[1.02]',
        className
      )}
    >
      {/* Image */}
      <div className="relative overflow-hidden group">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={pet.name}
            className="w-full aspect-square object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-coral/10 to-teal/10 flex items-center justify-center">
            <span className="text-6xl select-none">{speciesEmoji[pet.type] || '\u{1F43E}'}</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/30 dark:from-black/60 to-transparent pointer-events-none"></div>
        <div className="absolute top-6 left-6">
          <h2 className="text-2xl font-medium text-white drop-shadow-lg">{pet.name}</h2>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="absolute top-6 right-6 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-sm shadow-sm hover:bg-white transition-all duration-500 ease-out hover:scale-110"
        >
          {'\u2665'}
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 flex items-center justify-between group">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-zinc-700 flex-shrink-0 bg-warm-dark transition-transform duration-500 ease-out group-hover:scale-110">
            {imgSrc ? (
              <img src={imgSrc} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted">
                {pet.name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className="transition-transform duration-500 ease-out group-hover:translate-x-1">
            <div className="text-sm text-gray-700 dark:text-zinc-200">
              {pet.type}{pet.breed ? ` \u00B7 ${pet.breed}` : ''}
            </div>
            <div className="text-xs text-gray-500 dark:text-zinc-500">{pet.location || pet.shelterName || pet.city || ''}</div>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/pets/${pet.id}`); }}
          className="bg-gray-900 dark:bg-zinc-800 text-white dark:text-zinc-100 rounded-lg px-4 py-2 text-sm font-medium
                   transition-all duration-500 ease-out hover:scale-105
                   hover:bg-gray-800 dark:hover:bg-zinc-700
                   active:scale-95 hover:shadow-md dark:hover:shadow-lg dark:hover:shadow-black/50"
        >
          {isAvailable ? 'Adopt' : 'Details'}
        </button>
      </div>
    </div>
  );
}
