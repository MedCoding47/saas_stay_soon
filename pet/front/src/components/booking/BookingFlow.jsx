import { useState, useEffect, useCallback } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import api from '../../api/client';
import ReviewModal from './ReviewModal';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function isPastDate(year, month, day) {
  const d = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function Calendar({ selectedDate, onSelect, currentMonth, currentYear, setCurrentMonth, setCurrentYear }) {
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const next = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const disabled = isPastDate(currentYear, currentMonth, d);
    const selected = selectedDate === dateStr;
    cells.push(
      <button
        key={d}
        disabled={disabled}
        onClick={() => !disabled && onSelect(dateStr)}
        className={`w-full aspect-square rounded-full text-sm font-medium transition-all
          ${disabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-coral/10 hover:text-coral'}
          ${selected ? 'bg-coral text-white hover:bg-coral' : 'text-gray-700'}
        `}
      >
        {d}
      </button>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={prev} className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-600">&lsaquo;</button>
        <span className="font-semibold text-gray-900">{MONTHS[currentMonth]} {currentYear}</span>
        <button onClick={next} className="w-8 h-8 rounded-full hover:bg-gray-100 text-gray-600">&rsaquo;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {DAYS.map(d => <div key={d} className="text-xs font-medium text-muted py-1">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells}
      </div>
    </div>
  );
}

function PaymentForm({ amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: 'if_required',
    });
    setLoading(false);
    if (error) {
      onError(error.message);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button
        type="submit"
        disabled={!stripe || loading}
        className="mt-6 w-full py-3 rounded-xl bg-coral text-white font-semibold text-base hover:bg-coral/90 disabled:opacity-50 transition-all"
      >
        {loading ? 'Processing...' : `Pay ${amount} MAD`}
      </button>
    </form>
  );
}

export default function BookingFlow({ vetId, vetName, price, onClose, initialDate }) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(initialDate || null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [reviewableBookings, setReviewableBookings] = useState([]);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const handleClose = useCallback(() => {
    if (step >= 2 && !paymentConfirmed) {
      if (!confirmExit) {
        setConfirmExit(true);
        return;
      }
    }
    onClose();
  }, [step, paymentConfirmed, confirmExit, onClose]);

  useEffect(() => {
    if (confirmExit) setConfirmExit(false);
  }, [step]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

  useEffect(() => {
    if (!paymentConfirmed) return;
    let cancelled = false;
    api.get('/reviews/reviewable').then(({ data }) => {
      if (!cancelled) setReviewableBookings(data || []);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [paymentConfirmed]);

  const handleConfirmAndPay = async () => {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      const bookingDate = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
      const { data: booking } = await api.post('/bookings', {
        veterinaireProfileId: vetId,
        bookingDate,
        notes: notes || null,
      });

      const { data: intent } = await api.post('/payments/create-intent', {
        bookingId: booking.id,
        amount: price,
        currency: 'mad',
      });

      setClientSecret(intent.clientSecret);
      setStep(3);
    } catch (err) {
      setPaymentError(err.response?.data?.error || err.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentConfirmed(true);
  };

  const handlePaymentError = (msg) => {
    setPaymentError(msg);
  };

  const bookingDateObj = selectedDate && selectedTime
    ? new Date(`${selectedDate}T${selectedTime}:00`)
    : null;

  const canProceedStep1 = selectedDate && selectedTime;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className={step >= 1 ? 'text-coral' : 'text-gray-300'}>1</span>
            <span className="text-gray-300">&middot;</span>
            <span className={step >= 2 ? 'text-coral' : 'text-gray-300'}>2</span>
            <span className="text-gray-300">&middot;</span>
            <span className={step >= 3 ? 'text-coral' : 'text-gray-300'}>3</span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all"
          >
            &times;
          </button>
        </div>

        {confirmExit && (
          <div className="mx-6 mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <p className="text-sm text-amber-800 mb-2">Are you sure? Your progress will be lost.</p>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-3 py-1 rounded-lg bg-amber-200 text-amber-900 text-xs font-medium">Yes, close</button>
              <button onClick={() => setConfirmExit(false)} className="px-3 py-1 rounded-lg bg-white text-gray-600 text-xs font-medium border">Stay</button>
            </div>
          </div>
        )}

        <div className="px-6 pb-6 pt-4">
          {/* Step 1 */}
          {step === 1 && (
            <div className="transition-opacity duration-300">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Pick a date & time</h2>
              <p className="text-sm text-muted mb-5">Select your preferred appointment slot with {vetName}</p>

              <Calendar
                selectedDate={selectedDate}
                onSelect={setSelectedDate}
                currentMonth={currentMonth}
                currentYear={currentYear}
                setCurrentMonth={setCurrentMonth}
                setCurrentYear={setCurrentYear}
              />

              {selectedDate && (
                <div className="mt-5">
                  <p className="text-sm font-medium text-gray-700 mb-2">Available times</p>
                  <div className="flex flex-wrap gap-2">
                    {TIME_SLOTS.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all
                          ${selectedTime === t
                            ? 'bg-coral text-white border-coral'
                            : 'bg-white text-gray-600 border-warm-dark hover:border-coral/50'
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button
                disabled={!canProceedStep1}
                onClick={() => setStep(2)}
                className="mt-6 w-full py-3 rounded-xl bg-coral text-white font-semibold text-base disabled:opacity-40 hover:bg-coral/90 transition-all"
              >
                Next &rarr;
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="transition-opacity duration-300">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Confirm details</h2>
              <p className="text-sm text-muted mb-5">Review your appointment information</p>

              <div className="bg-warm rounded-xl p-4 space-y-3 mb-5">
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Veterinaire</span>
                  <span className="text-sm font-medium text-gray-900">{vetName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Date</span>
                  <span className="text-sm font-medium text-gray-900">
                    {bookingDateObj?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Time</span>
                  <span className="text-sm font-medium text-gray-900">{selectedTime}</span>
                </div>
                <div className="border-t border-warm-dark pt-3 flex justify-between">
                  <span className="text-sm font-semibold text-gray-900">Total</span>
                  <span className="text-sm font-bold text-coral">{price} MAD</span>
                </div>
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special requests? (optional)"
                rows={3}
                className="w-full px-3 py-2.5 rounded-xl border border-warm-dark bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all resize-none mb-5"
              />

              {paymentError && (
                <p className="text-sm text-red-500 mb-3">{paymentError}</p>
              )}

              <button
                onClick={handleConfirmAndPay}
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-coral text-white font-semibold text-base disabled:opacity-50 hover:bg-coral/90 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Confirm & Pay \u2192'
                )}
              </button>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="transition-opacity duration-300">
              {paymentConfirmed ? (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4">&#10003;</div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Booking confirmed!</h2>
                  <p className="text-sm text-muted mb-6">You'll receive a confirmation shortly.</p>
                  {reviewableBookings.length > 0 && (
                    <button
                      onClick={() => setReviewModalOpen(true)}
                      className="text-sm text-coral font-medium hover:underline mb-4 block w-full"
                    >
                      Enjoyed a previous visit? Leave a review &rarr;
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-xl bg-coral text-white font-medium hover:bg-coral/90 transition-all"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Payment</h2>
                  <p className="text-sm text-muted mb-5">Enter your card details to complete payment</p>

                  {clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                      <PaymentForm amount={price} onSuccess={handlePaymentSuccess} onError={handlePaymentError} />
                    </Elements>
                  )}

                  {paymentError && (
                    <p className="text-sm text-red-500 mt-3">{paymentError}</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {reviewModalOpen && reviewableBookings.length > 0 && (
        <ReviewModal
          bookingId={reviewableBookings[0].bookingId}
          vetName={reviewableBookings[0].vetName}
          veterinaireProfileId={reviewableBookings[0].veterinaireProfileId}
          onClose={() => setReviewModalOpen(false)}
        />
      )}
    </div>
  );
}
