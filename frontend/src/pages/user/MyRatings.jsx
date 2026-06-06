import { useEffect, useMemo, useState } from 'react';
import RatingModal from '../../components/common/RatingModal';
import { API_BASE } from '../../services/api';

export default function MyRatings() {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        // Load stores
        const storesRes = await fetch(`${API_BASE}/stores`);
        if (!storesRes.ok) throw new Error('Failed to load stores');
        const storesData = await storesRes.json();
        if (!cancelled) setStores(Array.isArray(storesData) ? storesData : (storesData.data || []));

        // Load user ratings
        const token = localStorage.getItem('token');
        const ratingsRes = await fetch(`${API_BASE}/ratings/user/1`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (ratingsRes.ok) {
          const ratingsData = await ratingsRes.json();
          if (!cancelled) setItems(Array.isArray(ratingsData) ? ratingsData : []);
        }
      } catch (err) {
        console.error('Load failed', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const rows = useMemo(() => {
    return items.map((r) => ({ ...r, store: stores.find((s) => s.id === r.store_id) }));
  }, [items, stores]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/ratings/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to delete rating');
      setItems((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete rating');
    }
  };

  const handleEditOpen = (row) => setEditing(row);

  const handleSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/ratings/${editing.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          rating: data.rating,
          comment: data.comment || '',
        }),
      });
      if (!res.ok) throw new Error('Failed to update rating');
      setItems((prev) => prev.map((it) => (it.id === editing.id ? { ...it, rating: data.rating, date: new Date().toISOString().slice(0,10) } : it)));
      setEditing(null);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update rating');
    }
  };

  return (
    <div style={ps.page}>
      <div style={ps.header}>
        <div>
          <h1 style={ps.title}>My Ratings</h1>
          <p style={ps.sub}>All ratings you submitted. Edit or delete them anytime.</p>
        </div>
      </div>

      <div style={ps.grid}>
        {rows.map((r) => (
          <div key={r.id} style={ps.card}>
            <div style={ps.cardHeader}>
              <div style={ps.headerLeft}>
                <div style={ps.avatar}>{(r.store?.name || 'U').charAt(0)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={ps.storeName}>{r.store?.name || '—'}</div>
                  <div style={ps.storeEmail}>{r.store?.email || ''}</div>
                </div>
              </div>
              <div style={ps.metaRight}>
                <span style={ps.roleBadge}>{r.store?.status === 'active' ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            <div style={ps.cardBody}>
              <div style={ps.infoRow}>
                <div style={ps.infoLabel}>Address</div>
                <div style={ps.infoValue}>{r.store?.address || '—'}</div>
              </div>
              <div style={ps.infoRow}>
                <div style={ps.infoLabel}>Joined</div>
                <div style={ps.infoValue}>{r.createdAt || r.date}</div>
              </div>
            </div>

            <div style={ps.cardFooter}>
              <div style={ps.ratingWrap}>
                <div style={ps.ratingBig}>{'★'.repeat(r.rating)}</div>
              </div>
              <div style={ps.actions}>
                <button style={ps.viewBtn} onClick={() => handleEditOpen(r)}>Edit</button>
                <button style={ps.deleteBtn} onClick={() => handleDelete(r.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <RatingModal
        store={editing?.store}
        open={!!editing}
        onClose={() => setEditing(null)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

const ps = {
  page: { display: 'flex', flexDirection: 'column', gap: 20, fontFamily: "'Inter', -apple-system, sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 28, fontWeight: 800, color: '#f1f5f9', margin: 0 },
  sub: { color: '#64748b', margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 16 },
  card: { background: '#0f172a', borderRadius: 12, padding: 0, border: '1px solid #334155', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', borderBottom: '1px solid #334155' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 },
  avatar: { width: 46, height: 46, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, flexShrink: 0 },
  storeName: { fontSize: 15, fontWeight: 700, color: '#f1f5f9' },
  storeEmail: { fontSize: 13, color: '#94a3b8' },
  metaRight: { display: 'flex', alignItems: 'center', gap: 8 },
  roleBadge: { padding: '6px 10px', borderRadius: 14, fontSize: 12, fontWeight: 700, background: 'rgba(147,197,253,0.04)', color: '#93c5fd', border: '1px solid rgba(147,197,253,0.06)' },
  cardBody: { padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 8 },
  infoRow: { display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  infoLabel: { fontSize: 12, color: '#64748b' },
  infoValue: { fontSize: 13, color: '#cbd5e1' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 18px', borderTop: '1px solid #334155' },
  ratingWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  ratingBig: { fontSize: 18, fontWeight: 800, color: '#fbbf24' },
  actions: { display: 'flex', gap: 8 },
  viewBtn: { padding: '8px 12px', borderRadius: 10, border: '1px solid #334155', background: 'transparent', color: '#93c5fd', cursor: 'pointer', fontWeight: 700 },
  deleteBtn: { padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.18)', background: 'transparent', color: '#f87171', cursor: 'pointer', fontWeight: 700 },
};
