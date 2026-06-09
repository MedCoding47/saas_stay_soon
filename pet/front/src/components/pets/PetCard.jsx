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
        'border border-[#E8E0D8]',
        'hover:-translate-y-1 hover:shadow-card-hover transition-all duration-300',
        className
      )}
    >
      {/* IMAGE AREA */}
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-[#F5F0E8]">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={pet.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[80px] group-hover:scale-110 transition-transform duration-500">
            {speciesEmoji[pet.type] || '\u{1F43E}'}
          </div>
        )}

        {/* FAVORITE BUTTON */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite && onToggleFavorite(pet); }}
          className={'absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center cursor-pointer border border-[#E8E0D8] hover:border-coral transition-colors ' + (isFavorited ? 'text-coral fill-coral' : 'text-[#8c7e74]')}
        >
          <Heart size={16} className={isFavorited ? 'fill-coral text-coral' : ''} />
        </button>

        {/* STATUS BADGE — only if NOT "Available" */}
        {pet.status && pet.status !== 'Available' && (
          <div className="absolute top-3 left-3">
            {pet.status === 'Adopted' ? (
              <span className="bg-[#8c7e74] text-white text-xs font-bold px-3 py-1 rounded-full">{(t && t('status.Adopted', 'Adopted')) || 'Adopted'}</span>
            ) : pet.status === 'Pending' ? (
              <span className="bg-amber text-white text-xs font-bold px-3 py-1 rounded-full">{(t && t('status.Pending', 'Pending')) || 'Pending'}</span>
            ) : null}
          </div>
        )}
      </div>

      {/* CARD BODY */}
      <div className="px-4 pt-4 pb-5">
        {/* Row 1 — Name + Gender */}
        <div className="flex items-center justify-between">
          <span className="font-display font-black text-xl tracking-tight text-[#0D0D0D] uppercase truncate flex-1">
            {pet.name}
          </span>
          <div className="w-px h-4 bg-[#E8E0D8] mx-2 flex-shrink-0" />
          <span className="flex-shrink-0 text-[#8c7e74]">
            {pet.gender === 'Female' ? <Venus size={16} /> : <Mars size={16} />}
          </span>
        </div>

        {/* Row 2 — Organization / Breed */}
        <p className="text-sm text-[#8c7e74] mt-1 truncate">{subtitle}</p>
      </div>
    </div>
  );
}
