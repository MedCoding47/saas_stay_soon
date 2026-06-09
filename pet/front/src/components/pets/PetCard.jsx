import { useNavigate } from 'react-router-dom';
import { Heart, Venus, Mars } from 'lucide-react';
import { cn } from '../../lib/utils';

const speciesEmoji = {
  Dog: '\u{1F415}', Cat: '\u{1F408}', Rabbit: '\u{1F430}', Bird: '\u{1F426}', Parrot: '\u{1F99C}',
  Hamster: '\u{1F439}', Fish: '\u{1F41F}', Turtle: '\u{1F422}', Horse: '\u{1F434}',
};

export default function PetCard({ pet, isFavorited, onToggleFavorite, t, className }) {
  const navigate = useNavigate();
  const imgSrc = pet.imageUrl || pet.mainImageUrl;

  const orgName = pet.shelterName || pet.ownerName || '';
  const subtitle = orgName ? 'Nino - ' + orgName : (pet.breed || '');

  return (
    <div
      onClick={() => navigate('/pets/' + pet.id)}
      className={cn(
        'bg-white rounded-2xl overflow-hidden cursor-pointer group',
        'border border-[#E8E0D8] shadow-sm',
        'hover:-translate-y-1 hover:shadow-lg transition-all duration-300',
        className
      )}
    >
      {/* IMAGE AREA */}
      <div className="relative w-full overflow-hidden bg-[#F5F0E8]">
        <div className="h-64 md:h-72">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={pet.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[100px] group-hover:scale-110 transition-transform duration-500">
              {speciesEmoji[pet.type] || '\u{1F43E}'}
            </div>
          )}
        </div>

        {/* FAVORITE BUTTON */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite && onToggleFavorite(pet); }}
          className={'absolute top-4 right-4 w-11 h-11 rounded-full bg-white shadow-md flex items-center justify-center cursor-pointer border border-[#E8E0D8] hover:border-coral transition-all ' + (isFavorited ? 'text-coral fill-coral' : 'text-[#8c7e74]')}
        >
          <Heart size={18} className={isFavorited ? 'fill-coral text-coral' : ''} />
        </button>

        {/* SOS / URGENT BADGE — bottom-left */}
        {(pet.isSos || pet.isUrgent) && (
          <div className="absolute bottom-4 left-4 flex flex-col gap-1">
            <span className="bg-coral text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wide">SOS</span>
          </div>
        )}

        {/* STATUS BADGE — top-left, only if NOT "Available" */}
        {pet.status && pet.status !== 'Available' && (
          <div className="absolute top-4 left-4">
            {pet.status === 'Adopted' ? (
              <span className="bg-[#8c7e74] text-white text-xs font-bold px-3 py-1 rounded-full">{(t && t('status.Adopted', 'Adopted')) || 'Adopted'}</span>
            ) : pet.status === 'Pending' ? (
              <span className="bg-amber text-white text-xs font-bold px-3 py-1 rounded-full">{(t && t('status.Pending', 'Pending')) || 'Pending'}</span>
            ) : null}
          </div>
        )}
      </div>

      {/* CARD BODY */}
      <div className="px-5 pt-4 pb-5 bg-white">
        {/* Row 1 — Name + Gender */}
        <div className="flex items-center gap-0">
          <span className="font-display font-black text-xl text-[#0D0D0D] uppercase tracking-tight truncate flex-1">
            {pet.name}
          </span>
          <div className="w-px h-5 bg-[#E8E0D8] mx-3 flex-shrink-0" />
          <span className="flex-shrink-0 text-[#8c7e74]">
            {pet.gender === 'Female' ? <Venus size={18} /> : <Mars size={18} />}
          </span>
        </div>

        {/* Row 2 — Organization / Breed */}
        <p className="text-sm text-[#8c7e74] mt-1.5 leading-snug line-clamp-2">{subtitle}</p>
      </div>
    </div>
  );
}
