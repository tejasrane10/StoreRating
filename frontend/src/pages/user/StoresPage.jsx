import { useEffect, useMemo, useState } from 'react';
import RatingModal from '../../components/common/RatingModal';
import { API_BASE } from '../../services/api';

export default function StoresPage() {
  const [queryName, setQueryName] = useState('');
  const [queryAddress, setQueryAddress] = useState('');
  const [filter, setFilter] = useState('all');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ratingStore, setRatingStore] = useState(null);

  const filtered = useMemo(() => {
    let out = [...stores];
    if (queryName) out = out.filter((s) => s.name.toLowerCase().includes(queryName.toLowerCase()));
    if (queryAddress) out = out.filter((s) => s.address.toLowerCase().includes(queryAddress.toLowerCase()));
    if (filter === 'highest') out.sort((a, b) => b.rating - a.rating);
    if (filter === 'lowest') out.sort((a, b) => a.rating - b.rating);
    if (filter === 'recent') out.sort((a, b) => new Date(b.added) - new Date(a.added));
    return out;
  }, [stores, queryName, queryAddress, filter]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/stores`);
        if (!res.ok) throw new Error('Failed to load stores');
        const data = await res.json();
        if (!cancelled) setStores(Array.isArray(data) ? data : (data.data || []));
      } catch (err) {
        if (!cancelled) setError(err.message || 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={ps.page}>
      <div style={ps.header}>
        <div>
          <h1 style={ps.title}>Stores</h1>
          <p style={ps.sub}>Search and browse available stores.</p>
        </div>
      </div>

      <div style={ps.controls}>
        <input
          placeholder="Search by Store Name"
          value={queryName}
          onChange={(e) => setQueryName(e.target.value)}
          style={ps.input}
        />
        <input
          placeholder="Search by Address"
          value={queryAddress}
          onChange={(e) => setQueryAddress(e.target.value)}
          style={ps.input}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={ps.select}>
          <option value="all">All Stores</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
          <option value="recent">Recently Added</option>
        </select>
      </div>

      <div style={ps.grid}>
        {filtered.map((store) => (
          <div key={store.id} style={cs.card}>
            <div style={cs.header}>
              <div style={cs.name}>{store.name}</div>
              <div style={cs.rating}>{store.rating.toFixed(1)} ★</div>
            </div>
            <div style={cs.address}><span style={{ marginRight: 8 }}>📍</span>{store.address}</div>
            <div style={cs.footer}>
              <button style={cs.rateBtn} onClick={() => setRatingStore(store)}>
                ⭐ Rate
              </button>
            </div>
          </div>
        ))}
      </div>

      <RatingModal
        store={ratingStore}
        open={!!ratingStore}
        onClose={() => setRatingStore(null)}
        onSubmit={async (data) => {
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
        }}
      />
    </div>
  );
}

const ps = {
  page: { display: 'flex', flexDirection: 'column', gap: 24, fontFamily: "'Inter', -apple-system, sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 28, fontWeight: 800, color: '#f1f5f9', margin: 0 },
  sub: { color: '#64748b', margin: 0 },
  controls: { display: 'flex', gap: 12, alignItems: 'center', marginTop: 8 },
  input: { padding: '10px 12px', borderRadius: 10, background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' },
  select: { padding: '10px 12px', borderRadius: 10, background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginTop: 12 },
};

const cs = {
  card: { background: '#0f172a', borderRadius: 12, padding: 12, border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: 8 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 15, fontWeight: 700, color: '#f1f5f9' },
  rating: { fontSize: 14, fontWeight: 700, color: '#fbbf24' },
  address: { color: '#94a3b8', fontSize: 13 },
  footer: { marginTop: 'auto' },
  rateBtn: { padding: '8px 12px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#fbbf24,#f59e0b)', cursor: 'pointer', fontWeight: 700 },
};
