import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { exportTableToExcel } from '../../utils/exportTable';

export default function AdminActivity() {
  const { activities } = useSelector((state) => state.admin);
  const [dateRange, setDateRange] = useState('7d');
  const [activityType, setActivityType] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  const columns = [
    { header: 'Time', accessor: 'time' },
    { header: 'Action', accessor: 'title' },
    { header: 'User', accessor: 'detail' },
    { header: 'Type', accessor: 'type' },
  ];

  const rows = useMemo(() => {
    return activities.filter((activity) => {
      const matchesType = activityType === 'all' || activity.type === activityType;
      const matchesUser = userFilter === 'all' || activity.detail.toLowerCase().includes(userFilter.toLowerCase());
      return matchesType && matchesUser;
    });
  }, [activities, activityType, userFilter]);

  const timeline = useMemo(() => {
    return rows.reduce((acc, item) => {
      const group = item.dayGroup || 'Today';
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});
  }, [rows]);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Recent Activity</h1>
          <p style={styles.sub}>Track platform events, registrations, store changes, and moderation actions.</p>
        </div>
        <div style={styles.actions}>
          <button style={styles.exportBtn} onClick={() => exportTableToExcel(columns, rows, 'admin-activity')}>Export Excel</button>
        </div>
      </div>

      <div style={styles.filters}>
        <Field label="Date Range">
          <select style={styles.select} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </Field>
        <Field label="Activity Type">
          <select style={styles.select} value={activityType} onChange={(e) => setActivityType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="user">User</option>
            <option value="store">Store</option>
            <option value="rating">Rating</option>
            <option value="security">Security</option>
            <option value="admin">Admin</option>
          </select>
        </Field>
        <Field label="User">
          <input style={styles.input} value={userFilter} onChange={(e) => setUserFilter(e.target.value)} placeholder="Search user or email" />
        </Field>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>Activity Table</div>
        <table style={styles.table}>
          <thead>
            <tr>
              {columns.map((column) => <th key={column.header} style={styles.th}>{column.header}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}>{item.time}</td>
                <td style={styles.td}>{item.title}</td>
                <td style={styles.td}>{item.detail}</td>
                <td style={styles.td}>{item.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={styles.timelineCard}>
        <div style={styles.tableHeader}>Timeline View</div>
        <div style={styles.timeline}>
          {Object.entries(timeline).map(([group, items]) => (
            <div key={group} style={styles.timelineGroup}>
              <div style={styles.timelineLabel}>{group}</div>
              {items.map((item) => (
                <div key={item.id} style={styles.timelineItem}>
                  <div style={styles.timelineDot} />
                  <div>
                    <div style={styles.timelineTitle}>{item.title}</div>
                    <div style={styles.timelineMeta}>{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={styles.field}>
      <label style={styles.label}>{label}</label>
      {children}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' },
  title: { fontSize: '28px', fontWeight: '800', color: '#f8fafc', margin: 0 },
  sub: { margin: '6px 0 0', color: '#94a3b8' },
  actions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  exportBtn: { padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#111827', color: '#e2e8f0', cursor: 'pointer', fontWeight: '600' },
  filters: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#cbd5e1' },
  select: { padding: '11px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9' },
  input: { padding: '11px 14px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#f1f5f9' },
  tableCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', overflow: 'hidden' },
  tableHeader: { padding: '16px 20px', borderBottom: '1px solid #334155', fontWeight: '700', color: '#f8fafc' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '14px 20px', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', borderBottom: '1px solid #334155' },
  td: { padding: '14px 20px', color: '#e2e8f0', borderBottom: '1px solid #1e293b', fontSize: '14px' },
  tr: { backgroundColor: '#0f172a' },
  timelineCard: { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', overflow: 'hidden' },
  timeline: { display: 'grid', gap: '18px', padding: '20px' },
  timelineGroup: { display: 'grid', gap: '12px' },
  timelineLabel: { fontSize: '12px', fontWeight: '800', color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em' },
  timelineItem: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  timelineDot: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#818cf8', marginTop: '6px', flexShrink: 0 },
  timelineTitle: { color: '#f8fafc', fontWeight: '600' },
  timelineMeta: { color: '#94a3b8', fontSize: '13px', marginTop: '2px' },
};
