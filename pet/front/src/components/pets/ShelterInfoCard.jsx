import Button from '../ui/Button';

export default function ShelterInfoCard({ shelter }) {
  if (!shelter) return null;
  return (
    <div className="bg-teal-dark rounded-3xl p-8 text-white">
      <h3 className="text-xl font-bold mb-4">{shelter.name}</h3>
      <div className="space-y-3 text-sm text-white/80">
        <div className="flex items-start gap-2">
          <span>📍</span>
          <span>{shelter.address || shelter.city || ''}</span>
        </div>
        {shelter.phone && (
          <div className="flex items-center gap-2">
            <span>📞</span>
            <span>{shelter.phone}</span>
          </div>
        )}
        {shelter.email && (
          <div className="flex items-center gap-2">
            <span>✉️</span>
            <span>{shelter.email}</span>
          </div>
        )}
      </div>
      {shelter.hours && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">Opening Hours</p>
          <div className="space-y-1 text-sm text-white/80">
            {Object.entries(shelter.hours).map(([day, time]) => (
              <div key={day} className="flex justify-between">
                <span>{day}</span>
                <span>{time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <Button variant="primary" className="w-full mt-6">
        Visit shelter
      </Button>
    </div>
  );
}
