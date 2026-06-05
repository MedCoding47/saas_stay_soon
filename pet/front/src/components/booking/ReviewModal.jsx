import { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import RatingStars from '../ui/RatingStars';

export default function ReviewModal({ bookingId, vetName, veterinaireProfileId, companyProfileId, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const overlayRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && !success) onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, success]);

  const handleSubmit = async () => {
    if (rating < 1) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.post('/reviews', {
        bookingId,
        rating,
        comment: comment.trim() || null,
        veterinaireProfileId: veterinaireProfileId || null,
        companyProfileId: companyProfileId || null,
      });
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error;
      if (status === 409) setError('You\'ve already reviewed this booking.');
      else if (status === 403) setError('Only completed, paid bookings can be reviewed.');
      else setError(msg || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === overlayRef.current && !success) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 p-6">
        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">&#10003;</div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">Thank you for your review!</h2>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Rate your experience</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all">&times;</button>
            </div>

            <p className="text-sm text-muted mb-5">with <span className="font-medium text-gray-900">{vetName}</span></p>

            <div className="flex justify-center mb-5">
              <RatingStars rating={rating} size="lg" interactive onChange={setRating} showValue={false} />
            </div>
            {rating === 0 && (
              <p className="text-xs text-red-500 text-center -mt-3 mb-3">Please select a rating</p>
            )}

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Share your experience (optional)"
              rows={4}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-coral/30 focus:border-coral transition-all resize-none mb-1"
            />
            <p className="text-xs text-muted text-right mb-4">{comment.length}/500</p>

            {error && (
              <p className="text-sm text-red-500 mb-3 text-center">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={rating < 1 || submitting}
              className="w-full py-3 rounded-xl bg-coral text-white font-semibold disabled:opacity-40 hover:bg-coral/90 transition-all"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>

            <button
              onClick={onClose}
              className="w-full text-center text-sm text-muted mt-3 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
