import { useState } from 'react';

export default function RatingModal({ store, open, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({ rating, comment });
      setRating(0);
      setComment('');
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  if (!open || !store) return null;

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerContent}>
            <div style={s.storeAvatar}>{store.name.charAt(0)}</div>
            <div>
              <h3 style={s.title}>Rate {store.name}</h3>
              <p style={s.subtitle}>{store.category}</p>
            </div>
          </div>
          <button style={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Body */}
        <div style={s.body}>
          {/* Star Rating */}
          <div style={s.ratingSection}>
            <p style={s.ratingLabel}>How would you rate this store?</p>
            <div style={s.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={s.starBtn}
                  aria-label={`Rate ${star} stars`}
                >
                  <span
                    style={{
                      ...s.star,
                      color: star <= (hoverRating || rating) ? '#fbbf24' : '#cbd5e1',
                      transform: star <= (hoverRating || rating) ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p style={s.ratingText}>
                You're rating this store <strong style={{ color: '#fbbf24' }}>{rating} out of 5 stars</strong>
              </p>
            )}
          </div>

          {/* Comment */}
          <div style={s.commentSection}>
            <label style={s.commentLabel}>Share your experience (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell other customers about your experience..."
              maxLength={500}
              style={s.textarea}
            />
            <span style={s.charCount}>{comment.length}/500</span>
          </div>

          {/* Store Info */}
          <div style={s.storeInfo}>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Current Rating</span>
              <div style={s.infoValue}>
                <span style={s.starSmall}>★</span>
                <span>{store.rating.toFixed(1)}</span>
              </div>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>Total Reviews</span>
              <span style={s.infoValue}>{store.totalReviews}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <button style={s.cancelBtn} onClick={onClose} disabled={isSubmitting}>
            Cancel
          </button>
          <button
            style={{ ...s.submitBtn, ...(rating === 0 ? s.submitBtnDisabled : {}), ...(isSubmitting ? s.submitBtnLoading : {}) }}
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
          >
            {isSubmitting ? (
              <span style={s.spinnerWrap}>
                <span style={s.spinner} />
                Submitting...
              </span>
            ) : (
              'Submit Rating'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '16px',
  },
  modal: {
    width: '100%', maxWidth: '480px',
    backgroundColor: '#1e293b', borderRadius: '16px',
    border: '1px solid #334155', boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '24px', borderBottom: '1px solid #334155',
  },
  headerContent: {
    display: 'flex', alignItems: 'center', gap: '14px', flex: 1,
  },
  storeAvatar: {
    width: '48px', height: '48px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', fontWeight: '700', color: '#fff', flexShrink: 0,
  },
  title: {
    fontSize: '16px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 2px 0',
  },
  subtitle: {
    fontSize: '12px', color: '#64748b', margin: 0,
  },
  closeBtn: {
    background: 'none', border: 'none', color: '#64748b',
    fontSize: '20px', cursor: 'pointer', padding: '4px 8px',
    borderRadius: '6px', flexShrink: 0,
  },
  body: {
    flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px',
    overflowY: 'auto',
  },
  ratingSection: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
  },
  ratingLabel: {
    fontSize: '14px', fontWeight: '600', color: '#cbd5e1', margin: 0,
  },
  starsContainer: {
    display: 'flex', gap: '8px', justifyContent: 'center',
  },
  starBtn: {
    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  star: {
    fontSize: '40px', transition: 'all 0.15s ease',
  },
  ratingText: {
    fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0', textAlign: 'center',
  },
  commentSection: {
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  commentLabel: {
    fontSize: '13px', fontWeight: '600', color: '#cbd5e1',
  },
  textarea: {
    padding: '12px 14px', backgroundColor: '#0f172a',
    border: '1px solid #334155', borderRadius: '10px',
    fontSize: '13px', color: '#f1f5f9', outline: 'none',
    resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box',
    minHeight: '80px',
  },
  charCount: {
    fontSize: '11px', color: '#475569', textAlign: 'right',
  },
  storeInfo: {
    padding: '12px', backgroundColor: '#0f172a', borderRadius: '10px',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  infoRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  infoLabel: {
    fontSize: '12px', color: '#475569', fontWeight: '500',
  },
  infoValue: {
    fontSize: '13px', color: '#cbd5e1', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px',
  },
  starSmall: {
    color: '#fbbf24', fontSize: '14px',
  },
  footer: {
    display: 'flex', gap: '12px', padding: '20px 24px',
    borderTop: '1px solid #334155', justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '10px 22px', borderRadius: '10px', border: '1px solid #334155',
    background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
  },
  submitBtn: {
    padding: '10px 22px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    color: '#000', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
    boxShadow: '0 4px 14px rgba(251,191,36,0.35)',
    transition: 'all 0.2s',
  },
  submitBtnDisabled: {
    opacity: 0.5, cursor: 'not-allowed',
  },
  submitBtnLoading: {
    opacity: 0.8,
  },
  spinnerWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
  },
  spinner: {
    width: '14px', height: '14px', border: '2px solid rgba(0,0,0,0.2)',
    borderTopColor: '#000', borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
};
