import { useState } from 'react';
import BookingFlow from './BookingFlow';

function getPills() {
  const t = new Date();
  return [
    { key: 'today', label: 'Today', dt: new Date(t) },
    { key: 'tomorrow', label: 'Tomorrow', dt: new Date(t.getTime() + 86400000) },
    { key: '+2', label: '+2 days', dt: new Date(t.getTime() + 2 * 86400000) },
  ];
}

function fmt(d) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function toYmd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function BookingWidget({ vetId, vetName, price, services, phone, petId, compact }) {
  const [selectedPill, setSelectedPill] = useState(null);
  const [selectedService, setSelectedService] = useState(services?.[0] || '');
  const [flowOpen, setFlowOpen] = useState(false);

  const pills = getPills();
  const pillDateStr = selectedPill
    ? toYmd(pills.find((p) => p.key === selectedPill).dt)
    : null;
  const displayPrice = price == null ? 'Price on request' : `${price} MAD`;

  const handleBook = () => setFlowOpen(true);

  const sharedPills = (
    <div className="flex gap-1.5 flex-wrap">
      {pills.map((p) => (
        <button
          key={p.key}
          onClick={() => setSelectedPill(p.key === selectedPill ? null : p.key)}
          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
            selectedPill === p.key
              ? 'bg-coral text-white border-coral'
              : 'bg-white text-gray-600 border-gray-200 hover:border-coral/50'
          }`}
        >
          {p.label}<br /><span className="font-medium">{fmt(p.dt)}</span>
        </button>
      ))}
    </div>
  );

  if (compact) {
    return (
      <>
        <div className="space-y-3">
          {phone && <p className="text-sm text-muted">📞 {phone}</p>}
          {services && services.length > 0 && (
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
            >
              {services.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Quick pick</p>
            {sharedPills}
          </div>
          <button
            onClick={handleBook}
            className="w-full py-2.5 rounded-xl bg-coral text-white text-sm font-medium hover:bg-coral/90 transition-all"
          >
            Book Appointment {price != null && `- ${displayPrice}`}
          </button>
        </div>
        {flowOpen && (
          <BookingFlow
            vetId={vetId}
            vetName={vetName}
            price={price}
            initialDate={pillDateStr}
            onClose={() => { setFlowOpen(false); setSelectedPill(null); }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="w-full lg:w-[320px] shrink-0">
        <div className="sticky top-24 bg-white rounded-3xl shadow-card p-6 space-y-4">
          <h3 className="font-bold text-gray-900 text-lg">Book Appointment</h3>
          <p className="text-sm text-muted">with <span className="font-medium text-gray-900">{vetName}</span></p>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-coral">{price != null ? price : '—'}</span>
            {price != null && <span className="text-sm text-muted">MAD</span>}
            {price == null && <span className="text-sm text-muted">Price on request</span>}
          </div>

          {phone && (
            <p className="text-sm text-muted flex items-center gap-2">
              <span>📞</span> {phone}
            </p>
          )}

          {services && services.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Service</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full text-sm rounded-xl border border-gray-200 px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-coral/30"
              >
                {services.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Quick pick</label>
            {sharedPills}
          </div>

          <button
            onClick={handleBook}
            className="w-full py-3 rounded-xl bg-coral text-white font-semibold hover:bg-coral/90 transition-all"
          >
            Book Appointment
          </button>
        </div>
      </div>
      {flowOpen && (
        <BookingFlow
          vetId={vetId}
          vetName={vetName}
          price={price}
          initialDate={pillDateStr}
          onClose={() => { setFlowOpen(false); setSelectedPill(null); }}
        />
      )}
    </>
  );
}
