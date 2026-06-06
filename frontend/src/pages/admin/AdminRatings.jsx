import { useState, useEffect } from 'react';
import CardTable from '../../components/tables/CardTable';
import Modal from '../../components/common/Modal';
import { API_BASE } from '../../services/api';

export default function AdminRatings() {
  const [ratings, setRatings]     = useState([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [viewRating, setViewRating] = useState(null);
  const [actionRating, setActionRating] = useState(null);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/ratings`);
        if (!res.ok) throw new Error('Failed to load ratings');
        const data = await res.json();
        if (!cancelled) {
          // Transform data to match expected format
          const transformed = data.map((r) => ({
            id: r.id,
            storeName: r.store?.name || 'Unknown Store',
            user: r.user || 'Unknown User',
            rating: r.rating,
            comment: r.comment || '',
            date: r.date || r.createdAt,
            status: 'approved', // Default status since backend doesn't have status field
          }));
          setRatings(transformed);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Error loading ratings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleApprove = (id) => {
    setRatings((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r)));
    setActionRating(null);
  };

  const handleReject = (id) => {
    setRatings((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r)));
    setActionRating(null);
  };

  const handleDelete = (id) => {
    setRatings((prev) => prev.filter((r) => r.id !== id));
    setActionRating(null);
  };

  const columns = [
    { header: 'Store',   accessor: 'storeName', sortable: true },
    { header: 'User',    accessor: 'user',      sortable: true },
    { header: 'Rating',  accessor: 'rating',    sortable: true },
    { header: 'Status',  accessor: 'status',    sortable: true, filterable: true, filterOptions: [
      { value: 'approved', label: 'Approved' },
      { value: 'pending',  label: 'Pending'  },
      { value: 'rejected', label: 'Rejected' },
    ]},
  ];

  const renderRatingCard = (rating, actions) => (
    <div style={cs.cardContent}>
      {/* Header */}
      <div style={cs.cardHeader}>
        <div style={cs.headerLeft}>
          <div style={cs.avatar}>{rating.user.charAt(0)}</div>
          <div>
            <div style={cs.userName}>{rating.user}</div>
            <div style={cs.storeName}>{rating.storeName}</div>
          </div>
        </div>
        <StatusBadge status={rating.status} />
      </div>

      {/* Rating */}
      <div style={cs.ratingBar}>
        <div style={cs.ratingStars}>
          {[1,2,3,4,5].map((i) => (
            <span key={i} style={{ color: i <= rating.rating ? '#fbbf24' : '#334155', fontSize: '16px' }}>★</span>
          ))}
        </div>
        <span style={cs.ratingNum}>{rating.rating}.0</span>
      </div>

      {/* Comment */}
      <div style={cs.cardBody}>
        <p style={cs.comment}>{rating.comment}</p>
        <span style={cs.date}>{formatDate(rating.date)}</span>
      </div>

      {/* Footer */}
      <div style={cs.cardFooter}>
        {actions(rating)}
      </div>
    </div>
  );

  const approvedCount = ratings.filter((r) => r.status === 'approved').length;
  const pendingCount  = ratings.filter((r) => r.status === 'pending').length;
  const rejectedCount = ratings.filter((r) => r.status === 'rejected').length;
  const avgRating     = (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1);

  return (
    <div style={ps.page}>
      {/* Header */}
      <div style={ps.header}>
        <div>
          <h1 style={ps.title}>Ratings Management</h1>
          <p style={ps.sub}>Review and moderate all store ratings and reviews.</p>
        </div>
        <div style={ps.stats}>
          <StatPill label="Total"    value={ratings.length}  color="#818cf8" />
          <StatPill label="Approved" value={approvedCount}   color="#4ade80" />
          <StatPill label="Pending"  value={pendingCount}    color="#fb923c" />
          <StatPill label="Rejected" value={rejectedCount}   color="#f87171" />
          <StatPill label="Avg Rating" value={ratings.length ? avgRating : '0.0'}     color="#fbbf24" />
        </div>
      </div>

      <CardTable columns={columns} data={ratings} renderCard={renderRatingCard} actions={(rating) => (
        <>
          <ActionBtn color="#818cf8" onClick={() => setViewRating(rating)}>
            <EyeIcon /> View
          </ActionBtn>
          {rating.status === 'pending' && (
            <>
              <ActionBtn color="#4ade80" onClick={() => { setActionRating(rating); setActionType('approve'); }}>
                <CheckIcon /> Approve
              </ActionBtn>
              <ActionBtn color="#f87171" onClick={() => { setActionRating(rating); setActionType('reject'); }}>
                <XIcon /> Reject
              </ActionBtn>
            </>
          )}
          <ActionBtn color="#f87171" onClick={() => { setActionRating(rating); setActionType('delete'); }}>
            <TrashIcon /> Delete
          </ActionBtn>
        </>
      )} />

      {/* ── View Modal ─────────────────────────────────────── */}
      <Modal open={!!viewRating} onClose={() => setViewRating(null)} title="Rating Details">
        {viewRating && (
          <div style={ms.viewBody}>
            <div style={ms.userSection}>
              <div style={ms.avatar}>{viewRating.user.charAt(0)}</div>
              <div>
                <div style={ms.userName}>{viewRating.user}</div>
                <div style={ms.storeName}>{viewRating.storeName}</div>
              </div>
            </div>

            <div style={ms.ratingSection}>
              <div style={ms.ratingStars}>
                {[1,2,3,4,5].map((i) => (
                  <span key={i} style={{ color: i <= viewRating.rating ? '#fbbf24' : '#334155', fontSize: '20px' }}>★</span>
                ))}
              </div>
              <span style={ms.ratingNum}>{viewRating.rating}.0 out of 5</span>
            </div>

            <div style={ms.divider} />

            <div style={ms.detailRow}>
              <span style={ms.label}>Status</span>
              <StatusBadge status={viewRating.status} />
            </div>

            <div style={ms.detailRow}>
              <span style={ms.label}>Date</span>
              <span style={ms.value}>{formatDate(viewRating.date)}</span>
            </div>

            <div style={ms.commentSection}>
              <span style={ms.label}>Review</span>
              <p style={ms.comment}>{viewRating.comment}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Action Confirm Modal ───────────────────────────── */}
      <Modal open={!!actionRating} onClose={() => setActionRating(null)} title={`${actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Delete'} Rating`} width="400px">
        {actionRating && (
          <div style={ms.actionBody}>
            <div style={ms.actionIcon}>
              {actionType === 'approve' && '✓'}
              {actionType === 'reject' && '✕'}
              {actionType === 'delete' && '🗑️'}
            </div>
            <p style={ms.actionText}>
              {actionType === 'approve' && `Approve this rating from ${actionRating.user}?`}
              {actionType === 'reject' && `Reject this rating from ${actionRating.user}?`}
              {actionType === 'delete' && `Delete this rating from ${actionRating.user}?`}
            </p>
            <div style={ms.formActions}>
              <button style={ms.cancelBtn} onClick={() => setActionRating(null)}>Cancel</button>
              <button
                style={{
                  ...ms.actionBtn,
                  backgroundColor: actionType === 'approve' ? '#4ade80' : actionType === 'reject' ? '#fb923c' : '#ef4444',
                }}
                onClick={() => {
                  if (actionType === 'approve') handleApprove(actionRating.id);
                  else if (actionType === 'reject') handleReject(actionRating.id);
                  else handleDelete(actionRating.id);
                }}
              >
                {actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────

function StatPill({ label, value, color }) {
  return (
    <div style={{ ...ps.statPill, borderColor: color + '44' }}>
      <span style={{ ...ps.statVal, color }}>{value}</span>
      <span style={ps.statLabel}>{label}</span>
    </div>
  );
}

function ActionBtn({ children, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ ...cs.actionBtn, color, borderColor: color + '44' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = color + '18')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const map = {
    approved: { bg: 'rgba(74,222,128,0.12)',  color: '#4ade80' },
    pending:  { bg: 'rgba(251,146,60,0.12)',  color: '#fb923c' },
    rejected: { bg: 'rgba(248,113,113,0.12)', color: '#f87171' },
  };
  const t = map[status] ?? map.pending;
  return (
    <span style={{ ...cs.badge, backgroundColor: t.bg, color: t.color }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: t.color, display: 'inline-block', marginRight: '4px' }} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function EyeIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function CheckIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>; }
function XIcon()     { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>; }
function TrashIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }

// ── Styles ───────────────────────────────────────────────────

const ps = {
  page: { display: 'flex', flexDirection: 'column', gap: '28px', fontFamily: "'Inter', -apple-system, sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 6px 0', letterSpacing: '-0.6px' },
  sub: { fontSize: '15px', color: '#64748b', margin: 0 },
  stats: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  statPill: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '14px 22px', backgroundColor: '#1e293b',
    borderRadius: '12px', border: '1px solid', minWidth: '80px',
  },
  statVal: { fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' },
  statLabel: { fontSize: '11px', color: '#475569', marginTop: '4px', fontWeight: '500' },
};

const cs = {
  cardContent: { display: 'flex', flexDirection: 'column', height: '100%' },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '18px 20px', borderBottom: '1px solid #334155',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 },
  avatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: '700', color: '#fff', flexShrink: 0,
  },
  userName: { fontSize: '14px', fontWeight: '700', color: '#f1f5f9' },
  storeName: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '4px 10px', borderRadius: '20px',
    fontSize: '11px', fontWeight: '600',
  },
  ratingBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px', backgroundColor: '#0f172a', borderBottom: '1px solid #334155',
  },
  ratingStars: { display: 'flex', gap: '2px' },
  ratingNum: { fontSize: '14px', fontWeight: '700', color: '#fbbf24' },
  cardBody: {
    flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px',
  },
  comment: { fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0 },
  date: { fontSize: '11px', color: '#475569' },
  cardFooter: {
    display: 'flex', gap: '6px', padding: '14px 20px',
    borderTop: '1px solid #334155', justifyContent: 'flex-end', flexWrap: 'wrap',
  },
  actionBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '6px 12px', borderRadius: '8px', border: '1px solid',
    background: 'transparent', cursor: 'pointer',
    fontSize: '12px', fontWeight: '500', transition: 'background 0.15s',
  },
};

const ms = {
  viewBody: { display: 'flex', flexDirection: 'column', gap: '16px' },
  userSection: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: {
    width: '48px', height: '48px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: '700', color: '#fff',
  },
  userName: { fontSize: '15px', fontWeight: '700', color: '#f1f5f9' },
  storeName: { fontSize: '13px', color: '#64748b', marginTop: '2px' },
  ratingSection: { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', backgroundColor: '#1e293b', borderRadius: '10px' },
  ratingStars: { display: 'flex', gap: '2px' },
  ratingNum: { fontSize: '14px', fontWeight: '700', color: '#fbbf24' },
  divider: { height: '1px', backgroundColor: '#334155' },
  detailRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: '13px', fontWeight: '600', color: '#cbd5e1' },
  value: { fontSize: '13px', color: '#94a3b8' },
  commentSection: { display: 'flex', flexDirection: 'column', gap: '6px' },
  comment: { fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6', margin: 0, padding: '10px', backgroundColor: '#0f172a', borderRadius: '8px' },
  actionBody: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' },
  actionIcon: { fontSize: '40px' },
  actionText: { fontSize: '15px', color: '#94a3b8', lineHeight: '1.6', margin: 0 },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%', marginTop: '6px' },
  cancelBtn: {
    padding: '10px 22px', borderRadius: '10px', border: '1px solid #334155',
    background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
  },
  actionBtn: {
    padding: '10px 22px', borderRadius: '10px', border: 'none',
    color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
  },
};
