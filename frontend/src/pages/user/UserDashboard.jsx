import { useEffect, useState } from 'react';
import RatingModal from '../../components/common/RatingModal';
import { API_BASE } from '../../services/api';

export default function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ratingStore, setRatingStore] = useState(null);
  const [userRatings, setUserRatings] = useState({});

  const handleRatingSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          store_id: ratingStore.id,
          user_id: 1, // TODO: Get from auth context
          rating: data.rating,
          comment: data.comment || '',
        }),
      });
      if (!res.ok) throw new Error('Failed to submit rating');
      setUserRatings((prev) => ({ ...prev, [ratingStore.id]: data.rating }));
      setRatingStore(null);
      // Reload stores to update ratings
      const storesRes = await fetch(`${API_BASE}/stores`);
      if (storesRes.ok) {
        const storesData = await storesRes.json();
        setStores(Array.isArray(storesData) ? storesData : (storesData.data || []));
      }
    } catch (err) {
      console.error('Rating submission failed:', err);
      alert('Failed to submit rating');
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/stores`);
        if (!res.ok) throw new Error('Failed to load stores');
        const data = await res.json();
        if (!cancelled) setStores(Array.isArray(data) ? data : (data.data || []));

        // Load user ratings
        const token = localStorage.getItem('token');
        const ratingsRes = await fetch(`${API_BASE}/ratings/user/1`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (ratingsRes.ok) {
          const ratingsData = await ratingsRes.json();
          if (!cancelled) {
            const ratingsMap = {};
            ratingsData.forEach((r) => {
              ratingsMap[r.store_id] = r.rating;
            });
            setUserRatings(ratingsMap);
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const myRatingsCount = Object.keys(userRatings).length;
  const highestRatedStore = stores.length > 0 ? stores.reduce((max, s) => (s.rating > max.rating ? s : max)) : null;
  const activeStoresCount = stores.filter((s) => s.status === 'active').length;

  return (
    <div style={ps.page}>
      {/* Header */}
      <div style={ps.header}>
        <div>
          <h1 style={ps.title}>Welcome back, Jonathan</h1>
          <p style={ps.sub}>Explore stores and share your ratings.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={ps.statsGrid}>
        <StatCard
          label="Active Stores"
          value={activeStoresCount}
          icon="🏪"
          color="#818cf8"
        />
        <StatCard
          label="My Ratings"
          value={myRatingsCount}
          icon="⭐"
          color="#fbbf24"
        />
        <StatCard
          label="Highest Rated"
          value={highestRatedStore?.name || 'N/A'}
          subValue={highestRatedStore ? `${highestRatedStore.rating.toFixed(1)} ★` : 'No stores'}
          icon="🏆"
          color="#4ade80"
        />
      </div>

      {/* Store Listing */}
      <div style={ps.section}>
        <div style={ps.sectionHeader}>
          <h2 style={ps.sectionTitle}>Browse Stores</h2>
          <p style={ps.sectionSub}>Rate your favorite stores</p>
        </div>

        <div style={ps.storesGrid}>
          {stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              userRating={userRatings[store.id]}
              onRate={() => setRatingStore(store)}
            />
          ))}
        </div>
      </div>

      {/* Rating Modal */}
      <RatingModal
        store={ratingStore}
        open={!!ratingStore}
        onClose={() => setRatingStore(null)}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
}

function StatCard({ label, value, subValue, icon, color }) {
  return (
    <div style={{ ...ps.statCard, borderColor: color + '44' }}>
      <div style={ps.statIcon}>{icon}</div>
      <div style={ps.statContent}>
        <div style={ps.statLabel}>{label}</div>
        <div style={{ ...ps.statValue, color }}>{value}</div>
        {subValue && <div style={ps.statSub}>{subValue}</div>}
      </div>
    </div>
  );
}

function StoreCard({ store, userRating, onRate }) {
  if (!store) return null;

  return (
    <div style={cs.card}>
      {/* Header */}
      <div style={cs.header}>
        <div style={cs.headerLeft}>
          <div style={cs.avatar}>{store.name?.charAt(0) || '?'}</div>
          <div>
            <div style={cs.storeName}>{store.name || 'Unknown Store'}</div>
            <div style={cs.category}>{store.category || 'General'}</div>
          </div>
        </div>
        <StatusBadge status={store.status || 'active'} />
      </div>

      {/* Rating */}
      <div style={cs.ratingSection}>
        <div style={cs.ratingLeft}>
          <div style={cs.ratingBig}>{(store.rating || 0).toFixed(1)}</div>
          <StarRow rating={store.rating || 0} />
          <div style={cs.reviewCount}>{store.totalReviews || 0} reviews</div>
        </div>
        {userRating && (
          <div style={cs.userRatingBadge}>
            <span style={cs.userRatingLabel}>Your rating</span>
            <div style={cs.userRatingStars}>
              {[1,2,3,4,5].map((i) => (
                <span key={i} style={{ color: i <= userRating ? '#fbbf24' : '#334155', fontSize: '14px' }}>★</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Address */}
      <div style={cs.address}>
        <span style={cs.addressIcon}>📍</span>
        <span style={cs.addressText}>{store.address}</span>
      </div>

      {/* Footer */}
      <div style={cs.footer}>
        <button style={cs.rateBtn} onClick={onRate}>
          {userRating ? '✎ Update Rating' : '⭐ Rate Now'}
        </button>
      </div>
    </div>
  );
}

function StarRow({ rating }) {
  return (
    <div style={cs.starRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ color: i <= Math.round(rating) ? '#fbbf24' : '#334155', fontSize: '14px' }}>★</span>
      ))}
    </div>
  );
}

function StatusBadge({ status }) {
  const active = status === 'active';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
      backgroundColor: active ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
      color: active ? '#4ade80' : '#f87171',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: active ? '#4ade80' : '#f87171', display: 'inline-block' }} />
      {active ? 'Open' : 'Closed'}
    </span>
  );
}

// ── Styles ───────────────────────────────────────────────────

const ps = {
  page: {
    display: 'flex', flexDirection: 'column', gap: '32px',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    flexWrap: 'wrap', gap: '20px',
  },
  title: {
    fontSize: '32px', fontWeight: '800', color: '#f1f5f9',
    margin: '0 0 6px 0', letterSpacing: '-0.8px',
  },
  sub: { fontSize: '16px', color: '#64748b', margin: 0 },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
  },
  statCard: {
    display: 'flex', alignItems: 'center', gap: '16px',
    padding: '20px', backgroundColor: '#1e293b',
    borderRadius: '14px', border: '1px solid',
  },
  statIcon: { fontSize: '32px' },
  statContent: { flex: 1 },
  statLabel: { fontSize: '13px', color: '#475569', fontWeight: '500', marginBottom: '4px' },
  statValue: { fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' },
  statSub: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  section: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  sectionTitle: { fontSize: '22px', fontWeight: '800', color: '#f1f5f9', margin: 0, letterSpacing: '-0.4px' },
  sectionSub: { fontSize: '14px', color: '#64748b', margin: 0 },
  storesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },
};

const cs = {
  card: {
    backgroundColor: '#1e293b', borderRadius: '14px',
    border: '1px solid #334155', overflow: 'hidden',
    display: 'flex', flexDirection: 'column', height: '100%',
    transition: 'all 0.2s ease',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '16px 18px', borderBottom: '1px solid #334155',
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '12px', flex: 1 },
  avatar: {
    width: '40px', height: '40px', borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: '700', color: '#fff', flexShrink: 0,
  },
  storeName: { fontSize: '14px', fontWeight: '700', color: '#f1f5f9' },
  category: { fontSize: '11px', color: '#818cf8', marginTop: '2px', fontWeight: '500' },
  ratingSection: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', backgroundColor: '#0f172a', borderBottom: '1px solid #334155',
  },
  ratingLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  ratingBig: { fontSize: '24px', fontWeight: '800', color: '#fbbf24', letterSpacing: '-0.5px' },
  starRow: { display: 'flex', gap: '1px' },
  reviewCount: { fontSize: '11px', color: '#475569' },
  userRatingBadge: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    padding: '6px 10px', backgroundColor: 'rgba(251,191,36,0.1)',
    borderRadius: '8px', border: '1px solid rgba(251,191,36,0.2)',
  },
  userRatingLabel: { fontSize: '10px', color: '#fbbf24', fontWeight: '600' },
  userRatingStars: { display: 'flex', gap: '1px' },
  address: {
    display: 'flex', alignItems: 'flex-start', gap: '8px',
    padding: '14px 18px', flex: 1,
  },
  addressIcon: { fontSize: '14px', marginTop: '1px', flexShrink: 0 },
  addressText: { fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' },
  footer: {
    padding: '14px 18px', borderTop: '1px solid #334155',
  },
  rateBtn: {
    width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    color: '#000', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
    boxShadow: '0 4px 12px rgba(251,191,36,0.25)',
    transition: 'all 0.2s',
  },
};
