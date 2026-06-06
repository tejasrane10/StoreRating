export function SkeletonCard() {
  return (
    <div style={s.card}>
      <div style={s.header}>
        <div style={s.avatar} />
        <div style={s.textGroup}>
          <div style={s.line} />
          <div style={{ ...s.line, width: '60%' }} />
        </div>
      </div>
      <div style={s.body}>
        <div style={s.line} />
        <div style={{ ...s.line, width: '80%' }} />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div style={s.statCard}>
      <div style={s.line} />
      <div style={{ ...s.line, width: '60%', marginTop: '12px' }} />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div style={s.chart}>
      <div style={s.line} />
      <div style={s.chartBars}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ ...s.bar, height: `${40 + i * 15}px` }} />
        ))}
      </div>
    </div>
  );
}

const s = {
  card: {
    backgroundColor: '#1e293b', borderRadius: '14px',
    padding: '16px', border: '1px solid #334155',
  },
  header: {
    display: 'flex', gap: '12px', marginBottom: '12px',
  },
  avatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    backgroundColor: '#0f172a', animation: 'pulse 2s infinite',
  },
  textGroup: {
    flex: 1, display: 'flex', flexDirection: 'column', gap: '6px',
  },
  line: {
    height: '12px', borderRadius: '6px',
    backgroundColor: '#0f172a', animation: 'pulse 2s infinite',
  },
  body: {
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  statCard: {
    backgroundColor: '#1e293b', borderRadius: '12px',
    padding: '18px', border: '1px solid #334155',
  },
  chart: {
    backgroundColor: '#1e293b', borderRadius: '14px',
    padding: '20px', border: '1px solid #334155',
  },
  chartBars: {
    display: 'flex', gap: '8px', alignItems: 'flex-end', marginTop: '16px',
  },
  bar: {
    flex: 1, borderRadius: '6px',
    backgroundColor: '#0f172a', animation: 'pulse 2s infinite',
  },
};
