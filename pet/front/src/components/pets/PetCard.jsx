import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

const speciesEmoji = {
  Dog: '🐕', Cat: '🐈', Rabbit: '🐰', Bird: '🐦', Parrot: '🦜',
  Hamster: '🐹', Fish: '🐟', Turtle: '🐢', Horse: '🐴',
};

export default function PetCard({ pet, className }) {
  const navigate = useNavigate();
  const imgSrc = pet.imageUrl || pet.mainImageUrl;
  const isAvailable = pet.status === 'Available' || pet.status === 1;

  return (
    <div
      onClick={() => navigate(`/pets/${pet.id}`)}
      className={cn(
        'bg-white rounded-xl shadow-card overflow-hidden cursor-pointer transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-card-hover group',
        className
      )}
    >
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-coral/10 to-teal/10 flex items-center justify-center overflow-hidden">
        {imgSrc ? (
          <img src={imgSrc} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-6xl select-none">{speciesEmoji[pet.type] || '🐾'}</span>
        )}
        {/* Heart icon */}
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-sm shadow-sm hover:bg-white transition-all"
        >
          ♥
        </button>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base">{pet.name}</h3>
        <p className="text-xs text-muted mt-0.5">📍 {pet.shelterName || pet.city || ''}</p>
        <p className="text-xs text-muted-light mt-1">
          {pet.type}{pet.breed ? ` · ${pet.breed}` : ''}
        </p>

        {/* Bottom row: badge + arrow */}
        <div className="flex items-center justify-between mt-3">
          <span className={cn(
            'inline-block w-2.5 h-2.5 rounded-full',
            isAvailable ? 'bg-coral' : 'bg-gray-400'
          )} />
          <span className="text-muted text-lg group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </div>
  );
}
