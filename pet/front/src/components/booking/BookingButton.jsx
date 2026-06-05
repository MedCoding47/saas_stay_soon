import { useState } from 'react';
import BookingFlow from './BookingFlow';

export default function BookingButton({ vetId, vetName, price = 150, className }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`px-5 py-2.5 rounded-xl bg-coral text-white text-sm font-medium hover:bg-coral/90 transition-all ${className || ''}`}
      >
        Book Appointment
      </button>
      {open && (
        <BookingFlow
          vetId={vetId}
          vetName={vetName}
          price={price}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
