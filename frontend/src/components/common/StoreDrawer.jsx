import { useEffect, useState } from 'react';

export default function StoreDrawer({ store, onClose, highlightReviewId }) {
  const open = !!store;
  const [tempHighlight, setTempHighlight] = useState(null);

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // scroll to and temporarily highlight a review when requested
  useEffect(() => {
    if (!open || !highlightReviewId) return;
    const id = `review-${highlightReviewId}`;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTempHighlight(highlightReviewId);
      const t = setTimeout(() => setTempHighlight(null), 2600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [highlightReviewId, open]);

  return (
    <>
      {/* Backdrop */}
      <div
        style={{ ...s.backdrop, opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside style={{ ...s.drawer, transform: open ? 'translateX(0)' : 'translateX(100%)' }}>
        {!store ? null : (
          <>
            {/* Header */}
            <div style={s.header}>
              <div style={s.headerLeft}>
                <div style={s.storeAvatar}>
                  {store.name.charAt(0)}
                </div>
                <div>
                  <h2 style={s.storeName}>{store.name}</h2>
                  <span style={s.categoryBadge}>{store.category}</span>
                </div>
              </div>
              <button style={s.closeBtn} onClick={onClose} aria-label="Close drawer">
                <CloseIcon />
              </button>
            </div>

            {/* Scrollable body */}
            <div style={s.body}>

              {/* Rating hero */}
              <div style={s.ratingHero}>
                <div style={s.ratingBig}>{store.rating.toFixed(1)}</div>
                <div>
                  <StarRow rating={store.rating} />
                  <div style={s.reviewCount}>{store.totalReviews} reviews</div>
                </div>
                <StatusPill status={store.status} />
              </div>

              {/* Store Information */}
              <Section title="Store Information">
                <InfoRow icon={<MailIcon />}  label="Email"   value={store.email}   />
                <InfoRow icon={<PhoneIcon />} label="Phone"   value={store.phone}   />
                <InfoRow icon={<PinIcon />}   label="Address" value={store.address} />
                <InfoRow icon={<CalIcon />}   label="Listed"  value={formatDate(store.createdAt)} />
              </Section>

              {/* Owner Information */}
              <Section title="Owner Information">
                <div style={s.ownerCard}>
                  <div style={s.ownerAvatar}>{store.ownerName.charAt(0)}</div>
                  <div>
                    <div style={s.ownerName}>{store.ownerName}</div>
                    <div style={s.ownerEmail}>{store.ownerEmail}</div>
                  </div>
                </div>
              </Section>

              {/* Rating breakdown */}
              <Section title="Rating Breakdown">
                <RatingBreakdown reviews={store.reviews || []} overall={store.rating} />
              </Section>

              {/* Recent Reviews */}
                <Section title={`Recent Reviews (${store.reviews?.length || 0})`}>
                  {(store.reviews || []).map((r) => (
                    <div id={`review-${r.id}`} key={r.id} style={{ ...s.reviewCard, ...(tempHighlight === r.id ? s.highlightedReview : {}) }}>
                      <div style={s.reviewHeader}>
                        <div style={s.reviewAvatar}>{r.user.charAt(0)}</div>
                        <div style={s.reviewMeta}>
                          <span style={s.reviewUser}>{r.user}</span>
                          <span style={s.reviewDate}>{formatDate(r.date)}</span>
                        </div>
                        <div style={s.reviewStars}>
                          {[1,2,3,4,5].map((i) => (
                            <span key={i} style={{ color: i <= r.rating ? '#fbbf24' : '#334155', fontSize: '13px' }}>★</span>
                          ))}
                        </div>
                      </div>
                      <p style={s.reviewComment}>{r.comment}</p>
                    </div>
                  ))}
                </Section>

            </div>
          </>
        )}
      </aside>
    </>
  );
}

// ── Sub-components ───────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div style={s.section}>
      <div style={s.sectionTitle}>{title}</div>
      <div style={s.sectionBody}>{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div style={s.infoRow}>
      <span style={s.infoIcon}>{icon}</span>
      <div style={s.infoContent}>
        <span style={s.infoLabel}>{label}</span>
        <span style={s.infoValue}>{value}</span>
      </div>
    </div>
  );
}

function StarRow({ rating }) {
  return (
    <div style={s.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#fbbf24' : '#334155', fontSize: '16px' }}>★</span>
      ))}
    </div>
  );
}

function StatusPill({ status }) {
  const active = status === 'active';
  return (
    <span style={{
      ...s.statusPill,
      backgroundColor: active ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
      color: active ? '#4ade80' : '#f87171',
      border: `1px solid ${active ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: active ? '#4ade80' : '#f87171', display: 'inline-block' }} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function RatingBreakdown({ reviews, overall }) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const max = Math.max(...counts.map((c) => c.count), 1);

  return (
    <div style={s.breakdown}>
      {counts.map(({ star, count }) => (
        <div key={star} style={s.breakdownRow}>
          <span style={s.breakdownStar}>{star} ★</span>
          <div style={s.breakdownTrack}>
            <div style={{
              ...s.breakdownFill,
              width: `${(count / max) * 100}%`,
              backgroundColor: star >= 4 ? '#4ade80' : star === 3 ? '#fbbf24' : '#f87171',
            }} />
          </div>
          <span style={s.breakdownCount}>{count}</span>
        </div>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div style={s.reviewCard}>
      <div style={s.reviewHeader}>
        <div style={s.reviewAvatar}>{review.user.charAt(0)}</div>
        <div style={s.reviewMeta}>
          <span style={s.reviewUser}>{review.user}</span>
          <span style={s.reviewDate}>{formatDate(review.date)}</span>
        </div>
        <div style={s.reviewStars}>
          {[1,2,3,4,5].map((i) => (
            <span key={i} style={{ color: i <= review.rating ? '#fbbf24' : '#334155', fontSize: '13px' }}>★</span>
          ))}
        </div>
      </div>
      <p style={s.reviewComment}>{review.comment}</p>
    </div>
  );
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ── Icons ────────────────────────────────────────────────────
function CloseIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function MailIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
function PhoneIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
}
function PinIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>;
}
function CalIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}

// ── Styles ───────────────────────────────────────────────────
const s = {
  backdrop: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 200, transition: 'opacity 0.3s ease',
  },
  drawer: {
    position: 'fixed', top: 0, right: 0, bottom: 0,
    width: '100%', maxWidth: '480px',
    backgroundColor: '#0f172a', borderLeft: '1px solid #1e293b',
    zIndex: 201, display: 'flex', flexDirection: 'column',
    transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
    fontFamily: "'Inter', -apple-system, sans-serif",
    boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px', borderBottom: '1px solid #1e293b', flexShrink: 0,
  },
  headerLeft: {
    display: 'flex', alignItems: 'center', gap: '14px',
  },
  storeAvatar: {
    width: '48px', height: '48px', borderRadius: '14px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', fontWeight: '700', color: '#fff',
    boxShadow: '0 4px 12px rgba(99,102,241,0.35)', flexShrink: 0,
  },
  storeName: {
    fontSize: '16px', fontWeight: '700', color: '#f1f5f9',
    margin: '0 0 4px 0', letterSpacing: '-0.3px',
  },
  categoryBadge: {
    fontSize: '11px', fontWeight: '600', color: '#818cf8',
    backgroundColor: 'rgba(99,102,241,0.15)', padding: '2px 8px',
    borderRadius: '20px', border: '1px solid rgba(99,102,241,0.25)',
  },
  closeBtn: {
    background: 'none', border: 'none', color: '#64748b',
    cursor: 'pointer', padding: '8px', borderRadius: '8px',
    display: 'flex', alignItems: 'center',
    flexShrink: 0,
  },
  body: {
    flex: 1, overflowY: 'auto', padding: '0 0 32px 0',
  },
  ratingHero: {
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '20px 24px', backgroundColor: '#1e293b',
    borderBottom: '1px solid #334155', flexWrap: 'wrap',
  },
  ratingBig: {
    fontSize: '40px', fontWeight: '800', color: '#fbbf24',
    letterSpacing: '-1px', lineHeight: 1,
  },
  starRow: { display: 'flex', gap: '2px', marginBottom: '4px' },
  reviewCount: { fontSize: '12px', color: '#475569' },
  statusPill: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600', marginLeft: 'auto',
  },
  section: {
    padding: '20px 24px', borderBottom: '1px solid #1e293b',
  },
  sectionTitle: {
    fontSize: '11px', fontWeight: '700', color: '#475569',
    letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '14px',
  },
  sectionBody: { display: 'flex', flexDirection: 'column', gap: '10px' },
  infoRow: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
  },
  infoIcon: {
    marginTop: '2px', flexShrink: 0,
  },
  infoContent: {
    display: 'flex', flexDirection: 'column', gap: '1px',
  },
  infoLabel: { fontSize: '11px', color: '#475569', fontWeight: '500' },
  infoValue: { fontSize: '13px', color: '#cbd5e1' },
  ownerCard: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px', backgroundColor: '#1e293b',
    borderRadius: '10px', border: '1px solid #334155',
  },
  ownerAvatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #fb923c, #f59e0b)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: '700', color: '#fff', flexShrink: 0,
  },
  ownerName:  { fontSize: '14px', fontWeight: '600', color: '#e2e8f0' },
  ownerEmail: { fontSize: '12px', color: '#475569', marginTop: '2px' },
  breakdown: { display: 'flex', flexDirection: 'column', gap: '8px' },
  breakdownRow: {
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  breakdownStar: { fontSize: '12px', color: '#64748b', width: '28px', flexShrink: 0 },
  breakdownTrack: {
    flex: 1, height: '6px', backgroundColor: '#1e293b',
    borderRadius: '4px', overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%', borderRadius: '4px', transition: 'width 0.4s ease',
  },
  breakdownCount: { fontSize: '12px', color: '#475569', width: '20px', textAlign: 'right', flexShrink: 0 },
  reviewCard: {
    padding: '14px', backgroundColor: '#1e293b',
    borderRadius: '10px', border: '1px solid #334155',
  },
  highlightedReview: {
    border: '1px solid rgba(96,165,250,0.9)',
    boxShadow: '0 10px 30px rgba(96,165,250,0.12)',
    transform: 'translateY(-2px) scale(1.002)'
  },
  reviewHeader: {
    display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px',
  },
  reviewAvatar: {
    width: '30px', height: '30px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '700', color: '#fff', flexShrink: 0,
  },
  reviewMeta: { flex: 1, display: 'flex', flexDirection: 'column' },
  reviewUser: { fontSize: '13px', fontWeight: '600', color: '#e2e8f0' },
  reviewDate: { fontSize: '11px', color: '#475569' },
  reviewStars: { display: 'flex', gap: '1px' },
  reviewComment: {
    fontSize: '13px', color: '#94a3b8', lineHeight: '1.6', margin: 0,
  },
};
