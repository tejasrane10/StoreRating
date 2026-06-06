import { useState } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'StoreRating',
    siteEmail: 'admin@storerate.com',
    sitePhone: '+1 (555) 123-4567',
    maxStoresPerOwner: 5,
    minRatingLength: 10,
    maxRatingLength: 500,
    autoApproveRatings: false,
    emailNotifications: true,
    maintenanceMode: false,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={ps.page}>
      {/* Header */}
      <div style={ps.header}>
        <div>
          <h1 style={ps.title}>Settings</h1>
          <p style={ps.sub}>Manage platform configuration and preferences.</p>
        </div>
      </div>

      {/* Sections */}
      <div style={ps.grid}>
        {/* General Settings */}
        <Section title="General Settings" icon="⚙️">
          <SettingField label="Site Name" value={settings.siteName} onChange={(v) => handleChange('siteName', v)} />
          <SettingField label="Admin Email" value={settings.siteEmail} onChange={(v) => handleChange('siteEmail', v)} />
          <SettingField label="Support Phone" value={settings.sitePhone} onChange={(v) => handleChange('sitePhone', v)} />
        </Section>

        {/* Platform Rules */}
        <Section title="Platform Rules" icon="📋">
          <SettingField
            label="Max Stores Per Owner"
            type="number"
            value={settings.maxStoresPerOwner}
            onChange={(v) => handleChange('maxStoresPerOwner', Number(v))}
          />
          <SettingField
            label="Min Rating Length"
            type="number"
            value={settings.minRatingLength}
            onChange={(v) => handleChange('minRatingLength', Number(v))}
          />
          <SettingField
            label="Max Rating Length"
            type="number"
            value={settings.maxRatingLength}
            onChange={(v) => handleChange('maxRatingLength', Number(v))}
          />
        </Section>

        {/* Moderation */}
        <Section title="Moderation" icon="🛡️">
          <ToggleSetting
            label="Auto-Approve Ratings"
            description="Automatically approve new ratings without manual review"
            value={settings.autoApproveRatings}
            onChange={(v) => handleChange('autoApproveRatings', v)}
          />
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon="🔔">
          <ToggleSetting
            label="Email Notifications"
            description="Send email alerts for new ratings and user registrations"
            value={settings.emailNotifications}
            onChange={(v) => handleChange('emailNotifications', v)}
          />
        </Section>

        {/* System */}
        <Section title="System" icon="🔧">
          <ToggleSetting
            label="Maintenance Mode"
            description="Temporarily disable platform access for maintenance"
            value={settings.maintenanceMode}
            onChange={(v) => handleChange('maintenanceMode', v)}
          />
        </Section>
      </div>

      {/* Save button */}
      <div style={ps.footer}>
        <button style={{ ...ps.saveBtn, ...(saved ? ps.saveBtnSuccess : {}) }} onClick={handleSave}>
          {saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={ss.section}>
      <div style={ss.sectionHeader}>
        <span style={ss.sectionIcon}>{icon}</span>
        <h2 style={ss.sectionTitle}>{title}</h2>
      </div>
      <div style={ss.sectionBody}>{children}</div>
    </div>
  );
}

function SettingField({ label, type = 'text', value, onChange }) {
  return (
    <div style={ss.field}>
      <label style={ss.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={ss.input}
      />
    </div>
  );
}

function ToggleSetting({ label, description, value, onChange }) {
  return (
    <div style={ss.toggleField}>
      <div style={ss.toggleLeft}>
        <div style={ss.toggleLabel}>{label}</div>
        <div style={ss.toggleDesc}>{description}</div>
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{ ...ss.toggle, backgroundColor: value ? '#4ade80' : '#334155' }}
      >
        <span style={{ ...ss.toggleCircle, left: value ? '22px' : '2px' }} />
      </button>
    </div>
  );
}

// ── Styles ───────────────────────────────────────────────────

const ps = {
  page: { display: 'flex', flexDirection: 'column', gap: '28px', fontFamily: "'Inter', -apple-system, sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 6px 0', letterSpacing: '-0.6px' },
  sub: { fontSize: '15px', color: '#64748b', margin: 0 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
    gap: '20px',
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', paddingTop: '12px',
  },
  saveBtn: {
    padding: '12px 32px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', cursor: 'pointer', fontSize: '15px', fontWeight: '700',
    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
    transition: 'all 0.3s ease',
  },
  saveBtnSuccess: {
    background: 'linear-gradient(135deg, #4ade80, #22c55e)',
    boxShadow: '0 4px 14px rgba(74,222,128,0.35)',
  },
};

const ss = {
  section: {
    backgroundColor: '#1e293b', borderRadius: '14px',
    border: '1px solid #334155', overflow: 'hidden',
  },
  sectionHeader: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '18px 20px', borderBottom: '1px solid #334155',
  },
  sectionIcon: { fontSize: '20px' },
  sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#f1f5f9', margin: 0 },
  sectionBody: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#cbd5e1' },
  input: {
    padding: '11px 14px', backgroundColor: '#0f172a',
    border: '1px solid #334155', borderRadius: '10px',
    fontSize: '14px', color: '#f1f5f9', outline: 'none',
    boxSizing: 'border-box', width: '100%',
  },
  toggleField: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px', backgroundColor: '#0f172a', borderRadius: '10px',
  },
  toggleLeft: { flex: 1 },
  toggleLabel: { fontSize: '14px', fontWeight: '600', color: '#cbd5e1' },
  toggleDesc: { fontSize: '12px', color: '#475569', marginTop: '2px' },
  toggle: {
    width: '48px', height: '28px', borderRadius: '14px',
    border: 'none', cursor: 'pointer', position: 'relative',
    display: 'flex', alignItems: 'center', padding: '2px',
    transition: 'background 0.3s ease',
  },
  toggleOn: {
    backgroundColor: '#4ade80',
  },
  toggleOff: {
    backgroundColor: '#334155',
  },
  toggleCircle: {
    width: '24px', height: '24px', borderRadius: '50%',
    backgroundColor: '#fff', position: 'absolute',
    transition: 'left 0.3s ease',
  },
};
