export default function EmptyState({ icon, title, description, action }) {
  return (
    <div style={s.wrapper}>
      <div style={s.icon}>{icon}</div>
      <h3 style={s.title}>{title}</h3>
      <p style={s.description}>{description}</p>
      {action && <button style={s.actionBtn}>{action.label}</button>}
    </div>
  );
}

const s = {
  wrapper: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
    padding: '60px 20px', textAlign: 'center',
  },
  icon: {
    fontSize: '48px', marginBottom: '8px',
  },
  title: {
    fontSize: '18px', fontWeight: '700', color: '#f1f5f9', margin: 0,
  },
  description: {
    fontSize: '14px', color: '#64748b', margin: 0, maxWidth: '300px',
  },
  actionBtn: {
    marginTop: '12px', padding: '10px 22px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
  },
};
