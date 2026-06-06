import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { exportTableToExcel } from '../../utils/exportTable';

export default function AdminTopRatedStores() {
  const { stores } = useSelector((state) => state.admin);
  const [limit, setLimit] = useState('10');

  const sorted = useMemo(() => {
    return [...stores].sort((a, b) => b.rating - a.rating);
  }, [stores]);

  const visible = useMemo(() => {
    const count = Number(limit);
    return sorted.slice(0, count);
  }, [sorted, limit]);

  const columns = [
    { header: 'Rank', accessor: 'rank' },
    { header: 'Store', accessor: 'name' },
    { header: 'Rating', accessor: 'rating' },
    { header: 'Reviews', accessor: 'totalReviews' },
  ];

  const rows = visible.map((store, index) => ({
    ...store,
    rank: index + 1,
  }));

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Top Rated Stores</h1>
          <p style={styles.sub}>Ranked by rating, review volume, and current store activity.</p>
        </div>
        <div style={styles.actions}>
          <select style={styles.select} value={limit} onChange={(e) => setLimit(e.target.value)}>
            <option value="10">Top 10</option>
            <option value="50">Top 50</option>
            <option value="100">Top 100</option>
          </select>
          <button style={styles.exportBtn} onClick={() => exportTableToExcel(columns, rows, 'top-rated-stores')}>Export Excel</button>
        </div>
      </div>

      <div style={styles.card}>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => <th key={column.header} style={styles.th}>{column.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((store) => (
              <tr key={store.id} style={styles.tr}>
                <td style={styles.td}>{store.rank}</td>
                <td style={styles.td}>{store.name}</td>
                <td style={styles.td}><span style={styles.rating}>{store.rating.toFixed(1)}</span></td>
                <td style={styles.td}>{store.totalReviews}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' },
  title: { fontSize: '28px', fontWeight: '800', color: '#f8fafc', margin: 0 },
  sub: { margin: '6px 0 0', color: '#94a3b8' },
  actions: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' },
  select: { padding: '10px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9' },
  exportBtn: { padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#111827', color: '#e2e8f0', cursor: 'pointer', fontWeight: '600' },
  card: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '14px 20px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #334155' },
  td: { padding: '14px 20px', color: '#e2e8f0', borderBottom: '1px solid #1e293b', fontSize: '14px' },
  tr: { backgroundColor: '#0f172a' },
  rating: { color: '#fbbf24', fontWeight: '700' },
};
