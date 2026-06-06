import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSelector } from 'react-redux';
import { API_BASE } from '../../services/api';
import {
  buildMonthlyTrendData,
  formatDate,
  getStoreMetrics,
} from './storeOwnerData';

export default function StoreOwnerDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/store-owner/mystores`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Failed to load stores');
        const data = await res.json();
        console.log('Stores loaded:', data);
        if (!cancelled) setStores(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const overviewStore = stores[0] ?? null;
  const [storeReviews, setStoreReviews] = useState([]);

  useEffect(() => {
    if (!overviewStore) return;
    let cancelled = false;
    async function loadReviews() {
      try {
        const res = await fetch(`${API_BASE}/ratings/store/${overviewStore.id}`);
        if (!res.ok) throw new Error('Failed to load reviews');
        const data = await res.json();
        console.log('Reviews loaded:', data);
        if (!cancelled) setStoreReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) console.error('Load reviews failed', err);
      }
    }
    loadReviews();
    return () => { cancelled = true; };
  }, [overviewStore]);

  const metrics = overviewStore ? getStoreMetrics(overviewStore, storeReviews) : null;
  const uniqueRaters = new Set(storeReviews.map((r) => r.user)).size;
  const topReviewer = storeReviews.reduce((max, r) => (r.rating > (max?.rating ?? 0) ? r : max), storeReviews[0] ?? null);
  const monthlyTrend = buildMonthlyTrendData(storeReviews);

  return (
    <div style={ps.page}>
      {/* Header */}
      <div style={ps.header}>
        <div>
          <h1 style={ps.title}>Store Dashboard</h1>
          <p style={ps.sub}>{user?.name} • {stores.length} store{stores.length === 1 ? '' : 's'} under management</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={ps.statsGrid}>
        <StatCard label="Stores Managed" value={stores.length} color="#818cf8" />
        <StatCard label="Average Rating" value={metrics ? metrics.averageRating.toFixed(1) : '0.0'} unit="★" color="#fbbf24" />
        <StatCard label="Total Reviews" value={metrics?.totalReviews ?? 0} color="#818cf8" />
        <StatCard label="Unique Raters" value={uniqueRaters} color="#4ade80" />
        <StatCard label="This Month" value={metrics?.latestMonthReviews ?? 0} color="#fb923c" />
      </div>

      {stores.length > 1 && (
        <div style={ps.storeGrid}>
          {stores.map((store) => (
            <div key={store.id} style={ps.storeCard}>
              <div style={ps.storeCardTop}>
                <div>
                  <div style={ps.storeName}>{store.name}</div>
                  <div style={ps.storeAddress}>{store.address}</div>
                </div>
                <span style={ps.storeRating}>{store.rating.toFixed(1)} ★</span>
              </div>
              <div style={ps.storeMeta}>
                <span>{store.totalReviews} reviews</span>
                <span>{store.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div style={ps.chartsRow}>
        {/* Ratings Trend */}
        <div style={{ ...ps.chartCard, flex: '2 1 400px' }}>
          <div style={ps.chartHeader}>
            <span style={ps.chartTitle}>Ratings Trend</span>
            <span style={ps.chartSub}>Last 7 months</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} domain={[3.5, 5]} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px' }} />
              <Line type="monotone" dataKey="avg" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#818cf8', r: 5 }} name="Avg Rating" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Reviews */}
        <div style={{ ...ps.chartCard, flex: '1 1 280px' }}>
          <div style={ps.chartHeader}>
            <span style={ps.chartTitle}>Monthly Reviews</span>
            <span style={ps.chartSub}>Count by month</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px' }} />
              <Bar dataKey="count" name="Reviews" radius={[6, 6, 0, 0]} fill="url(#barGrad)">
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Reviewer & Recent Reviews */}
      <div style={ps.bottomRow}>
        {/* Top Reviewer */}
        <div style={{ ...ps.panel, flex: '1 1 280px' }}>
          <div style={ps.panelHeader}>
            <span style={ps.panelTitle}>Top Reviewer</span>
            <span style={ps.panelIcon}>👑</span>
          </div>
          {topReviewer && (
            <div style={ps.topReviewerCard}>
              <div style={ps.reviewerAvatar}>{topReviewer.user.charAt(0)}</div>
              <div style={ps.reviewerInfo}>
                <div style={ps.reviewerName}>{topReviewer.user}</div>
                <div style={ps.reviewerRating}>
                  {[1,2,3,4,5].map((i) => (
                    <span key={i} style={{ color: i <= topReviewer.rating ? '#fbbf24' : '#334155', fontSize: '14px' }}>★</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div style={{ ...ps.panel, flex: '2 1 400px' }}>
          <div style={ps.panelHeader}>
            <span style={ps.panelTitle}>Recent Reviews</span>
            <span style={ps.panelCount}>{storeReviews.length}</span>
          </div>
          <div style={ps.reviewsList}>
            {storeReviews.slice(0, 5).map((r) => (
              <div key={r.id} style={ps.reviewItem}>
                <div style={ps.reviewItemLeft}>
                  <div style={ps.reviewItemAvatar}>{r.user.charAt(0)}</div>
                  <div>
                    <div style={ps.reviewItemName}>{r.user}</div>
                    <div style={ps.reviewItemDate}>{formatDate(r.date)}</div>
                  </div>
                </div>
                <div style={ps.reviewItemRating}>
                  {[1,2,3,4,5].map((i) => (
                    <span key={i} style={{ color: i <= r.rating ? '#fbbf24' : '#334155', fontSize: '12px' }}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, color }) {
  return (
    <div style={{ ...ps.statCard, borderColor: color + '44' }}>
      <div style={ps.statLabel}>{label}</div>
      <div style={{ ...ps.statValue, color }}>
        {value}
        {unit && <span style={ps.statUnit}>{unit}</span>}
      </div>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────

const ps = {
  page: { display: 'flex', flexDirection: 'column', gap: '28px', fontFamily: "'Inter', -apple-system, sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 6px 0', letterSpacing: '-0.6px' },
  sub: { fontSize: '15px', color: '#64748b', margin: 0 },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
  },
  storeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '14px',
  },
  storeCard: {
    backgroundColor: '#111827',
    border: '1px solid #334155',
    borderRadius: '14px',
    padding: '16px',
  },
  storeCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '12px',
    alignItems: 'flex-start',
  },
  storeName: { fontSize: '15px', fontWeight: '700', color: '#f8fafc' },
  storeAddress: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
  storeRating: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#fbbf24',
    backgroundColor: 'rgba(251,191,36,0.12)',
    borderRadius: '999px',
    padding: '6px 10px',
    whiteSpace: 'nowrap',
  },
  storeMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '12px',
    color: '#94a3b8',
    fontSize: '12px',
  },
  statCard: {
    backgroundColor: '#1e293b', borderRadius: '12px',
    padding: '18px', border: '1px solid',
  },
  statLabel: { fontSize: '12px', color: '#475569', fontWeight: '500', marginBottom: '8px' },
  statValue: { fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' },
  statUnit: { fontSize: '18px', marginLeft: '4px' },
  chartsRow: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  chartCard: {
    backgroundColor: '#1e293b', borderRadius: '14px',
    padding: '20px', border: '1px solid #334155',
    minWidth: '0',
  },
  chartHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px',
  },
  chartTitle: { fontSize: '15px', fontWeight: '600', color: '#f1f5f9' },
  chartSub: { fontSize: '12px', color: '#475569' },
  bottomRow: { display: 'flex', gap: '16px', flexWrap: 'wrap' },
  panel: {
    backgroundColor: '#1e293b', borderRadius: '14px',
    padding: '20px', border: '1px solid #334155',
    minWidth: '0',
  },
  panelHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px',
  },
  panelTitle: { fontSize: '15px', fontWeight: '600', color: '#f1f5f9' },
  panelIcon: { fontSize: '18px' },
  panelCount: { fontSize: '12px', color: '#818cf8', fontWeight: '600', backgroundColor: 'rgba(99,102,241,0.15)', padding: '2px 8px', borderRadius: '20px' },
  topReviewerCard: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '14px', backgroundColor: '#0f172a', borderRadius: '10px',
  },
  reviewerAvatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: '700', color: '#000', flexShrink: 0,
  },
  reviewerInfo: { flex: 1 },
  reviewerName: { fontSize: '13px', fontWeight: '600', color: '#e2e8f0' },
  reviewerRating: { display: 'flex', gap: '1px', marginTop: '4px' },
  reviewsList: { display: 'flex', flexDirection: 'column', gap: '0' },
  reviewItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid #1e293b',
  },
  reviewItemLeft: { display: 'flex', alignItems: 'center', gap: '10px', flex: 1 },
  reviewItemAvatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: '700', color: '#fff', flexShrink: 0,
  },
  reviewItemName: { fontSize: '13px', fontWeight: '600', color: '#cbd5e1' },
  reviewItemDate: { fontSize: '11px', color: '#475569', marginTop: '2px' },
  reviewItemRating: { display: 'flex', gap: '1px' },
};
