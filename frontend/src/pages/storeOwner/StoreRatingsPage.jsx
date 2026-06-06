import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { API_BASE } from '../../services/api';
import { getRatingBreakdown } from './storeOwnerData';
import StoreDrawer from '../../components/common/StoreDrawer';

export default function StoreRatingsPage() {
  const { user } = useSelector((state) => state.auth);
  const [stores, setStores] = useState([]);
  const [activeStoreId, setActiveStoreId] = useState(null);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [drawerStore, setDrawerStore] = useState(null);
  const [drawerHighlightId, setDrawerHighlightId] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/store-owner/mystores`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to load stores');
        const data = await res.json();
        if (!cancelled) {
          setStores(Array.isArray(data) ? data : []);
          setActiveStoreId((Array.isArray(data) && data[0]?.id) || null);
        }
      } catch (err) {
        if (!cancelled) console.error('Load stores failed', err);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const activeStore = stores.find((store) => store.id === activeStoreId) ?? stores[0] ?? null;

  useEffect(() => {
    if (!activeStore) return;
    let cancelled = false;
    async function loadReviews() {
      try {
        const res = await fetch(`${API_BASE}/ratings/store/${activeStore.id}`);
        if (!res.ok) throw new Error('Failed to load reviews');
        const data = await res.json();
        if (!cancelled) setReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) console.error('Load reviews failed', err);
      }
    }
    loadReviews();
    return () => { cancelled = true; };
  }, [activeStore]);

  const filteredReviews = useMemo(() => {
    let rows = [...reviews];

    if (ratingFilter !== 'all') {
      rows = rows.filter((review) => review.rating === Number(ratingFilter));
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      rows = rows.filter((review) => review.user.toLowerCase().includes(query));
    }

    return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [reviews, ratingFilter, search]);

  const summary = useMemo(() => {
    const totalReviews = reviews.length;
    const averageRating = totalReviews ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0;
    const highestRating = totalReviews ? Math.max(...reviews.map((review) => review.rating)) : 0;
    const lowestRating = totalReviews ? Math.min(...reviews.map((review) => review.rating)) : 0;
    return { totalReviews, averageRating, highestRating, lowestRating };
  }, [reviews]);

  const recentReviews = filteredReviews.slice(0, 3);

  return (
    <div style={ps.page}>
      <div style={ps.header}>
        <div>
          <h1 style={ps.title}>Ratings</h1>
          <p style={ps.sub}>All ratings received by your selected store.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={ps.storeSwitch}>
          {stores.map((store) => (
            <button
              key={store.id}
              type="button"
              onClick={() => setActiveStoreId(store.id)}
              style={{ ...ps.storeChip, ...(store.id === activeStore?.id ? ps.storeChipActive : {}) }}
            >
              {store.name}
            </button>
          ))}
          </div>
          <button
            type="button"
            style={{ ...ps.viewBtnPrimary, opacity: activeStore ? 1 : 0.6 }}
            onClick={() => activeStore && (setDrawerStore(activeStore), setDrawerHighlightId(null))}
            aria-label="View store details"
            disabled={!activeStore}
          >
            View Details
          </button>
        </div>
      </div>

      <div style={ps.statsGrid}>
        <StatCard label="Total Reviews" value={summary.totalReviews} accent="#818cf8" />
        <StatCard label="Average Rating" value={summary.averageRating.toFixed(1)} accent="#fbbf24" suffix="★" />
        <StatCard label="Highest Rating" value={summary.highestRating || '0'} accent="#4ade80" suffix="★" />
        <StatCard label="Lowest Rating" value={summary.lowestRating || '0'} accent="#fb923c" suffix="★" />
      </div>

      <div style={ps.layout}>
        <div style={ps.tableCard}>
          <div style={ps.toolbar}>
            <div style={ps.searchWrap}>
              <SearchIcon />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search User"
                style={ps.searchInput}
              />
            </div>
            <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} style={ps.select}>
              <option value="all">Filter by Rating</option>
              <option value="5">★★★★★</option>
              <option value="4">★★★★☆</option>
              <option value="3">★★★☆☆</option>
              <option value="2">★★☆☆☆</option>
              <option value="1">★☆☆☆☆</option>
            </select>
          </div>

          <div style={ps.tableWrap}>
            <table style={ps.table}>
              <thead>
                <tr>
                    <th style={ps.th}>User</th>
                    <th style={ps.th}>Rating</th>
                    <th style={ps.th}>Date</th>
                    <th style={ps.th}>Comment</th>
                    <th style={ps.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.length ? (
                  filteredReviews.map((review) => (
                    <tr key={review.id} style={ps.tr}>
                      <td style={ps.td}>{review.user}</td>
                      <td style={ps.td}><span style={ps.rating}>{'★'.repeat(review.rating)}</span></td>
                      <td style={ps.td}>{formatDate(review.date)}</td>
                      <td style={ps.td}>{review.comment}</td>
                      <td style={ps.td}>
                        <button
                          type="button"
                          style={ps.viewBtnSmall}
                          onClick={() => {
                            setDrawerStore(activeStore);
                            setDrawerHighlightId(review.id);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={ps.emptyCell}>No ratings found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={ps.recentCard}>
          <div style={ps.cardHeader}>
            <div>
              <div style={ps.cardTitle}>Latest Reviews</div>
              <div style={ps.cardSub}>{activeStore?.name}</div>
            </div>
          </div>
          <div style={ps.reviewList}>
            {recentReviews.length ? recentReviews.map((review) => (
              <div key={review.id} style={ps.reviewItem}>
                <div style={ps.reviewHead}>
                  <div style={ps.reviewUser}>{review.user}</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={ps.reviewStars}>{'★'.repeat(review.rating)}</div>
                    <button
                      type="button"
                      style={ps.viewBtnTiny}
                      onClick={() => {
                        setDrawerStore(activeStore);
                        setDrawerHighlightId(review.id);
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
                <div style={ps.reviewComment}>{review.comment}</div>
                <div style={ps.reviewDate}>{formatDate(review.date)}</div>
              </div>
            )) : (
              <div style={ps.emptyReviews}>No recent reviews.</div>
            )}
          </div>
        </div>
      </div>
      <StoreDrawer store={drawerStore} highlightReviewId={drawerHighlightId} onClose={() => { setDrawerStore(null); setDrawerHighlightId(null); }} />
    </div>
  );
}

function StatCard({ label, value, accent, suffix }) {
  return (
    <div style={{ ...ps.statCard, borderColor: `${accent}44` }}>
      <div style={ps.statLabel}>{label}</div>
      <div style={{ ...ps.statValue, color: accent }}>
        {value}
        {suffix && <span style={ps.statSuffix}>{suffix}</span>}
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
}

const ps = {
  page: { display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Inter', -apple-system, sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap', alignItems: 'flex-start' },
  title: { fontSize: '28px', fontWeight: '800', color: '#f8fafc', margin: 0 },
  sub: { margin: '6px 0 0', color: '#94a3b8' },
  storeSwitch: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  storeChip: { padding: '10px 12px', borderRadius: '999px', border: '1px solid #334155', backgroundColor: '#111827', color: '#cbd5e1', cursor: 'pointer', fontSize: '12px', fontWeight: '600' },
  storeChipActive: { backgroundColor: 'rgba(99,102,241,0.16)', color: '#e0e7ff', borderColor: '#6366f1' },
  viewBtnPrimary: { padding: '10px 14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(90deg,#6366f1,#4f46e5)', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
  viewBtnSmall: { padding: '8px 10px', borderRadius: '8px', border: '1px solid #334155', background: '#0b1220', color: '#e2e8f0', fontSize: '13px', cursor: 'pointer', fontWeight: '700' },
  viewBtnTiny: { padding: '6px 8px', borderRadius: '8px', border: '1px solid #334155', background: '#071126', color: '#cbd5e1', fontSize: '12px', cursor: 'pointer', fontWeight: '700' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' },
  statCard: { backgroundColor: '#111827', borderRadius: '14px', border: '1px solid', padding: '18px' },
  statLabel: { fontSize: '12px', color: '#64748b', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: '800' },
  statSuffix: { fontSize: '16px', marginLeft: '4px' },
  layout: { display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(300px, 1fr)', gap: '16px', alignItems: 'start' },
  tableCard: { backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '16px', overflow: 'hidden' },
  toolbar: { display: 'flex', gap: '12px', padding: '16px', flexWrap: 'wrap', borderBottom: '1px solid #1e293b' },
  searchWrap: { position: 'relative', flex: '1 1 260px', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '0 12px' },
  searchInput: { width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#f1f5f9', padding: '12px 0', fontSize: '14px' },
  select: { padding: '12px 14px', borderRadius: '12px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#e2e8f0', fontSize: '13px' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '14px 16px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', borderBottom: '1px solid #1e293b' },
  tr: { borderBottom: '1px solid #1e293b' },
  td: { padding: '14px 16px', color: '#e2e8f0', fontSize: '14px', verticalAlign: 'top' },
  rating: { color: '#fbbf24', fontWeight: '700', letterSpacing: '1px' },
  emptyCell: { padding: '22px 16px', color: '#64748b', textAlign: 'center' },
  recentCard: { backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '16px', padding: '16px' },
  cardHeader: { marginBottom: '14px' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#f8fafc' },
  cardSub: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
  reviewList: { display: 'flex', flexDirection: 'column', gap: '12px' },
  reviewItem: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '14px' },
  reviewHead: { display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' },
  reviewUser: { color: '#f8fafc', fontSize: '13px', fontWeight: '600' },
  reviewStars: { color: '#fbbf24', fontSize: '12px' },
  reviewComment: { color: '#cbd5e1', fontSize: '13px', marginTop: '8px', lineHeight: 1.5 },
  reviewDate: { color: '#64748b', fontSize: '11px', marginTop: '8px' },
  emptyReviews: { color: '#64748b', fontSize: '13px', padding: '8px 0' },
};
