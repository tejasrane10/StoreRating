import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { API_BASE } from '../../services/api';
import {
  buildMonthlyTrendData,
  formatDate,
  getRatingBreakdown,
  getStoreMetrics,
} from './storeOwnerData';
import StoreDrawer from '../../components/common/StoreDrawer';

export default function StoreManagementPage() {
  const { user } = useSelector((state) => state.auth);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStoreId, setSelectedStoreId] = useState(null);
  const [drawerStore, setDrawerStore] = useState(null);

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
        if (!cancelled) {
          setStores(Array.isArray(data) ? data : []);
          setSelectedStoreId((Array.isArray(data) && data[0]?.id) || null);
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

  const selectedStore = stores.find((store) => store.id === selectedStoreId) ?? stores[0] ?? null;
  const [selectedReviews, setSelectedReviews] = useState([]);

  useEffect(() => {
    if (!selectedStore) return;
    let cancelled = false;
    async function loadReviews() {
      try {
        const res = await fetch(`${API_BASE}/ratings/store/${selectedStore.id}`);
        if (!res.ok) throw new Error('Failed to load reviews');
        const data = await res.json();
        if (!cancelled) setSelectedReviews(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) console.error('Load reviews failed', err);
      }
    }
    loadReviews();
    return () => { cancelled = true; };
  }, [selectedStore]);

  const selectedMetrics = selectedStore ? getStoreMetrics(selectedStore, selectedReviews) : null;
  const selectedBreakdown = getRatingBreakdown(selectedReviews);
  const selectedTrend = buildMonthlyTrendData(selectedReviews);
  const overviewReviews = selectedReviews;

  const overviewMetrics = useMemo(() => {
    if (!stores.length) return null;
    const averageRating = stores.reduce((sum, store) => sum + Number(store.rating ?? 0), 0) / stores.length;
    const totalReviews = stores.reduce((sum, store) => sum + Number(store.totalReviews ?? 0), 0);
    const uniqueCustomers = new Set(overviewReviews.map((review) => review.user.trim().toLowerCase())).size;
    return { averageRating, totalReviews, uniqueCustomers };
  }, [stores, overviewReviews]);

  if (!stores.length) {
    return (
      <div style={ps.page}>
        <div style={ps.header}>
          <div>
            <h1 style={ps.title}>My Stores</h1>
            <p style={ps.sub}>No stores are assigned to this account yet.</p>
          </div>
        </div>
      </div>
    );
  }

  if (stores.length === 1 && selectedStore) {
    return (
      <div style={ps.page}>
        <div style={ps.header}>
          <div>
            <h1 style={ps.title}>My Stores</h1>
            <p style={ps.sub}>Detailed store profile for {selectedStore.name}.</p>
          </div>
        </div>

        <StoreDetail store={selectedStore} reviews={selectedReviews} metrics={selectedMetrics} breakdown={selectedBreakdown} trend={selectedTrend} />
        <StoreDrawer store={drawerStore} onClose={() => setDrawerStore(null)} />
      </div>
    );
  }

  return (
    <div style={ps.page}>
      <div style={ps.header}>
        <div>
          <h1 style={ps.title}>My Stores</h1>
          <p style={ps.sub}>Manage all stores assigned to your account.</p>
        </div>
        <div style={ps.stats}>
          <StatPill label="Stores" value={stores.length} color="#818cf8" />
          <StatPill label="Avg Rating" value={overviewMetrics?.averageRating.toFixed(1) ?? '0.0'} color="#fbbf24" />
          <StatPill label="Reviews" value={overviewMetrics?.totalReviews ?? 0} color="#4ade80" />
          <StatPill label="Customers" value={overviewMetrics?.uniqueCustomers ?? 0} color="#fb923c" />
        </div>
      </div>

      <div style={ps.storeGrid}>
        {stores.map((store) => {
          const storeMetrics = getStoreMetrics(store, store.reviews || []);

          return (
            <article key={store.id} style={{ ...ps.storeCardCompact }}>
              <div style={ps.compactTop}>
                <div style={ps.compactLeft}>
                  <div style={ps.storeAvatar}>{store.name.charAt(0)}</div>
                  <div>
                    <div style={ps.storeNameCompact}>{store.name}</div>
                    <div style={ps.storeAddressCompact}>{store.address}</div>
                  </div>
                </div>
                <div style={ps.compactRight}>
                  <div style={ps.storeBadgeCompact}>{store.rating.toFixed(1)} ★</div>
                </div>
              </div>

              <div style={ps.compactMeta}>
                <div style={ps.metaItem}>
                  <div style={ps.metaLabel}>Reviews</div>
                  <div style={ps.metaVal}>{storeMetrics.totalReviews}</div>
                </div>
                <div style={ps.metaItem}>
                  <div style={ps.metaLabel}>Status</div>
                  <div style={ps.metaVal}>{store.status}</div>
                </div>
                <div style={ps.metaAction}>
                  <button
                    style={ps.viewBtnPrimary}
                    onClick={() => setDrawerStore(store)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <StoreDrawer store={drawerStore} onClose={() => setDrawerStore(null)} />
    </div>
  );
}

function StoreDetail({ store, reviews, metrics, breakdown, trend }) {
  const topReviews = reviews.slice(0, 3);

  return (
    <div style={ps.detailShell}>
      <div style={ps.detailHeader}>
        <div>
          <div style={ps.detailTitle}>{store.name}</div>
          <div style={ps.detailSub}>{store.address}</div>
        </div>
        <span style={ps.detailRating}>{store.rating.toFixed(1)} ★</span>
      </div>

      <div style={ps.sectionGrid}>
        <Section title="Store Information">
          <InfoRow label="Store Name" value={store.name} />
          <InfoRow label="Store Email" value={store.email} />
          <InfoRow label="Store Address" value={store.address} />
          <InfoRow label="Owner Name" value={store.ownerName} />
          <InfoRow label="Created Date" value={formatDate(store.createdAt)} />
          <InfoRow label="Status" value={store.status} />
        </Section>

        <Section title="Performance Summary">
          <SummaryGrid metrics={metrics} />
        </Section>
      </div>

      <div style={ps.sectionGrid}>
        <Section title="Rating Breakdown">
          <div style={ps.breakdownList}>
            {breakdown.map(({ star, count }) => (
              <div key={star} style={ps.breakdownRow}>
                <span style={ps.breakdownStar}>{'★'.repeat(star)}</span>
                <div style={ps.breakdownTrack}>
                  <div style={{ ...ps.breakdownFill, width: `${Math.max(8, (count / Math.max(...breakdown.map((item) => item.count), 1)) * 100)}%` }} />
                </div>
                <span style={ps.breakdownCount}>{count}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Rating Trends">
          <div style={ps.chartWrap}>
            <TrendBars data={trend} />
          </div>
          <div style={ps.reviewsCardList}>
            {topReviews.map((review) => (
              <div key={review.id} style={ps.reviewCard}>
                <div style={ps.reviewTopRow}>
                  <strong style={ps.reviewUser}>{review.user}</strong>
                  <span style={ps.reviewStars}>{'★'.repeat(review.rating)}</span>
                </div>
                <div style={ps.reviewComment}>{review.comment}</div>
                <div style={ps.reviewDate}>{formatDate(review.date)}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function SummaryGrid({ metrics }) {
  return (
    <div style={ps.summaryGrid}>
      <SummaryCard label="Average Rating" value={metrics?.averageRating.toFixed(1) ?? '0.0'} accent="#fbbf24" suffix="★" />
      <SummaryCard label="Total Reviews" value={metrics?.totalReviews ?? 0} accent="#818cf8" />
      <SummaryCard label="Unique Customers" value={metrics?.uniqueCustomers ?? 0} accent="#4ade80" />
      <SummaryCard label="This Month Reviews" value={metrics?.latestMonthReviews ?? 0} accent="#fb923c" />
    </div>
  );
}

function SummaryCard({ label, value, accent, suffix }) {
  return (
    <div style={{ ...ps.summaryCard, borderColor: `${accent}40` }}>
      <div style={ps.summaryLabel}>{label}</div>
      <div style={{ ...ps.summaryValue, color: accent }}>
        {value}
        {suffix && <span style={ps.summarySuffix}>{suffix}</span>}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={ps.infoRow}>
      <span style={ps.infoLabel}>{label}</span>
      <span style={ps.infoValue}>{value}</span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section style={ps.section}>
      <div style={ps.sectionTitle}>{title}</div>
      <div>{children}</div>
    </section>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div style={{ ...ps.statPill, borderColor: `${color}44` }}>
      <span style={ps.statPillLabel}>{label}</span>
      <strong style={{ ...ps.statPillValue, color }}>{value}</strong>
    </div>
  );
}

function TrendBars({ data }) {
  const max = Math.max(...data.map((item) => item.count), 1);

  return (
    <div style={ps.trendWrap}>
      {data.map((item) => (
        <div key={item.month} style={ps.trendItem}>
          <span style={ps.trendMonth}>{item.month}</span>
          <div style={ps.trendTrack}>
            <div style={{ ...ps.trendFill, height: `${Math.max(16, (item.count / max) * 100)}%` }} />
          </div>
          <span style={ps.trendValue}>{item.count} reviews</span>
        </div>
      ))}
    </div>
  );
}

const ps = {
  page: { display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: "'Inter', -apple-system, sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '18px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 6px 0', letterSpacing: '-0.6px' },
  sub: { fontSize: '15px', color: '#64748b', margin: 0 },
  stats: { display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' },
  statPill: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '12px', border: '1px solid', backgroundColor: '#111827' },
  statPillLabel: { fontSize: '12px', color: '#94a3b8' },
  statPillValue: { fontSize: '14px' },
  storeGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' },
  storeCard: { backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' },
  storeCardActive: { borderColor: '#6366f1', boxShadow: '0 0 0 1px rgba(99,102,241,0.18) inset' },
  storeHeader: { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' },
  storeName: { fontSize: '16px', fontWeight: '700', color: '#f8fafc' },
  storeAddress: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
  storeBadge: { fontSize: '12px', fontWeight: '700', color: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.12)', borderRadius: '999px', padding: '6px 10px', whiteSpace: 'nowrap' },
  storeStats: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' },
  storeStatLabel: { fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' },
  storeStatValue: { fontSize: '18px', fontWeight: '800', color: '#e2e8f0', marginTop: '4px' },
  storeBody: { display: 'flex', flexDirection: 'column', gap: '10px' },
  storeFooter: { display: 'flex', justifyContent: 'flex-end' },
  viewBtn: { padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#f1f5f9', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  detailShell: { display: 'flex', flexDirection: 'column', gap: '18px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '20px' },
  detailHeader: { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' },
  detailTitle: { fontSize: '22px', fontWeight: '800', color: '#f8fafc' },
  detailSub: { fontSize: '14px', color: '#64748b', marginTop: '6px' },
  detailRating: { fontSize: '13px', fontWeight: '700', color: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.12)', borderRadius: '999px', padding: '6px 10px' },
  sectionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' },
  section: { backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' },
  sectionTitle: { fontSize: '15px', fontWeight: '700', color: '#f8fafc' },
  infoRow: { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid #1e293b' },
  infoLabel: { fontSize: '12px', color: '#64748b' },
  infoValue: { fontSize: '13px', color: '#e2e8f0', textAlign: 'right' },
  summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' },
  summaryCard: { border: '1px solid', borderRadius: '14px', padding: '16px', backgroundColor: '#0f172a' },
  summaryLabel: { fontSize: '12px', color: '#64748b', marginBottom: '6px' },
  summaryValue: { fontSize: '24px', fontWeight: '800' },
  summarySuffix: { fontSize: '16px', marginLeft: '4px' },
  breakdownList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  breakdownRow: { display: 'grid', gridTemplateColumns: '72px 1fr 36px', gap: '10px', alignItems: 'center' },
  breakdownStar: { fontSize: '12px', color: '#fbbf24', fontWeight: '700' },
  breakdownTrack: { height: '10px', backgroundColor: '#1e293b', borderRadius: '999px', overflow: 'hidden' },
  breakdownFill: { height: '100%', background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)', borderRadius: '999px' },
  breakdownCount: { fontSize: '12px', color: '#cbd5e1', textAlign: 'right' },
  chartWrap: { padding: '6px 0 12px' },
  trendWrap: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(42px, 1fr))', gap: '10px', alignItems: 'end', minHeight: '180px' },
  trendItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  trendMonth: { fontSize: '11px', color: '#64748b' },
  trendTrack: { width: '100%', minHeight: '120px', display: 'flex', alignItems: 'end', justifyContent: 'center', backgroundColor: '#0f172a', borderRadius: '14px', border: '1px solid #1e293b', padding: '10px' },
  trendFill: { width: '100%', maxWidth: '28px', borderRadius: '999px', background: 'linear-gradient(180deg, #818cf8 0%, #4f46e5 100%)' },
  trendValue: { fontSize: '11px', color: '#cbd5e1', textAlign: 'center' },
  reviewsCardList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  reviewCard: { backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '14px', padding: '14px' },
  reviewTopRow: { display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' },
  reviewUser: { color: '#f8fafc', fontSize: '13px' },
  reviewStars: { color: '#fbbf24', fontSize: '12px' },
  reviewComment: { color: '#cbd5e1', fontSize: '13px', marginTop: '8px', lineHeight: 1.5 },
  reviewDate: { color: '#64748b', fontSize: '11px', marginTop: '8px' },
  /* Compact store card styles */
  storeCardCompact: {
    backgroundColor: '#0b1220',
    border: '1px solid rgba(148,163,184,0.06)',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 6px 18px rgba(2,6,23,0.45)'
  },
  compactTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  compactLeft: { display: 'flex', gap: '12px', alignItems: 'center' },
  storeAvatar: { width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '16px' },
  storeNameCompact: { fontSize: '15px', fontWeight: '700', color: '#e6eef8' },
  storeAddressCompact: { fontSize: '12px', color: '#94a3b8' },
  compactRight: { display: 'flex', alignItems: 'center' },
  storeBadgeCompact: { fontSize: '13px', fontWeight: '700', color: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.12)', borderRadius: '999px', padding: '8px 12px' },
  compactMeta: { display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'space-between' },
  metaItem: { display: 'flex', flexDirection: 'column' },
  metaLabel: { fontSize: '11px', color: '#64748b' },
  metaVal: { fontSize: '16px', fontWeight: '800', color: '#e2e8f0' },
  metaAction: { display: 'flex', alignItems: 'center' },
  viewBtnPrimary: { padding: '10px 14px', borderRadius: '10px', border: 'none', background: 'linear-gradient(90deg,#6366f1,#4f46e5)', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' },
};