export default function Modal({ open, onClose, title, children, width = '520px' }) {
  if (!open) return null;
  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={{ ...s.modal, maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <h3 style={s.title}>{title}</h3>
          <button style={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div style={s.body}>{children}</div>
      </div>
    </div>
  );
}

const s = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '16px',
  },
  modal: {
    width: '100%', backgroundColor: '#1e293b',
    borderRadius: '16px', border: '1px solid #334155',
    boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 24px', borderBottom: '1px solid #334155',
  },
  title: {
    fontSize: '16px', fontWeight: '700', color: '#f1f5f9', margin: 0,
  },
  closeBtn: {
    background: 'none', border: 'none', color: '#64748b',
    fontSize: '16px', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px',
  },
  body: {
    padding: '24px',
  },
};
