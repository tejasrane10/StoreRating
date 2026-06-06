import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../components/common/Modal';

const profileSchema = z.object({
  name: z.string().min(3, 'Min 3 characters'),
  email: z.string().email('Invalid email'),
  address: z.string().min(1, 'Required'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function SettingsPage() {
  const { user } = useSelector((s) => s.auth);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    address: '123 Maple Street, New York, NY 10001',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saved, setSaved] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: profileData,
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const handleProfileSave = (data) => {
    setProfileData(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePasswordChange = (data) => {
    console.log('Password changed:', data);
    setShowPasswordModal(false);
    passwordForm.reset();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={ps.page}>
      {/* Header */}
      <div style={ps.header}>
        <h1 style={ps.title}>Settings</h1>
        <p style={ps.sub}>Manage your account and preferences.</p>
      </div>

      {/* Success message */}
      {saved && (
        <div style={ps.successBanner}>
          <span style={ps.successIcon}>✓</span>
          <span>Changes saved successfully</span>
        </div>
      )}

      {/* Sections */}
      <div style={ps.grid}>
        {/* Profile Settings */}
        <Section title="Profile Settings" icon="👤">
          <form onSubmit={profileForm.handleSubmit(handleProfileSave)} style={ss.form}>
            <FormField label="Full Name" error={profileForm.formState.errors.name?.message}>
              <input
                style={{ ...ss.input, ...(profileForm.formState.errors.name ? ss.inputErr : {}) }}
                {...profileForm.register('name')}
                onFocus={(e) => (e.target.style.boxShadow = '0 8px 30px rgba(2,6,23,0.55)')}
                onBlur={(e) => (e.target.style.boxShadow = 'none')}
              />
            </FormField>
            <FormField label="Email Address" error={profileForm.formState.errors.email?.message}>
              <input
                style={{ ...ss.input, ...(profileForm.formState.errors.email ? ss.inputErr : {}) }}
                {...profileForm.register('email')}
                onFocus={(e) => (e.target.style.boxShadow = '0 8px 30px rgba(2,6,23,0.55)')}
                onBlur={(e) => (e.target.style.boxShadow = 'none')}
              />
            </FormField>
            <FormField label="Address" error={profileForm.formState.errors.address?.message}>
              <textarea
                rows={3}
                style={{ ...ss.textarea, ...(profileForm.formState.errors.address ? ss.inputErr : {}) }}
                {...profileForm.register('address')}
                onFocus={(e) => (e.target.style.boxShadow = '0 8px 30px rgba(2,6,23,0.55)')}
                onBlur={(e) => (e.target.style.boxShadow = 'none')}
              />
            </FormField>
            <div style={ss.formActions}>
              <button
                type="button"
                style={ss.cancelBtn}
                onClick={() => profileForm.reset(profileData)}
              >
                Reset
              </button>
              <button type="submit" style={ss.submitBtn}>Save Profile</button>
            </div>
          </form>
        </Section>

        {/* Security Settings */}
        <Section title="Security Settings" icon="🔒">
          <div style={ss.securityBody}>
            <div style={ss.securityItem}>
              <div>
                <div style={ss.securityLabel}>Password</div>
                <div style={ss.securityDesc}>Change your password regularly to keep your account secure.</div>
              </div>
              <button style={ss.changeBtn} onClick={() => setShowPasswordModal(true)}>
                Change Password
              </button>
            </div>
            <div style={ss.divider} />
            <div style={ss.securityItem}>
              <div>
                <div style={ss.securityLabel}>Two-Factor Authentication</div>
                <div style={ss.securityDesc}>Add an extra layer of security to your account.</div>
              </div>
              <button style={ss.disabledBtn} disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </Section>

        {/* Preferences */}
        <Section title="Preferences" icon="⚙️">
          <div style={ss.preferencesBody}>
            <ToggleSetting
              label="Email Notifications"
              description="Receive email updates about ratings and reviews"
              defaultValue={true}
            />
            <div style={ss.divider} />
            <ToggleSetting
              label="Marketing Emails"
              description="Receive promotional offers and updates"
              defaultValue={false}
            />
          </div>
        </Section>

        {/* Account */}
        <Section title="Account" icon="⚠️">
          <div style={ss.accountBody}>
            <div style={ss.accountItem}>
              <div>
                <div style={ss.accountLabel}>Delete Account</div>
                <div style={ss.accountDesc}>Permanently delete your account and all associated data.</div>
              </div>
              <button style={ss.disabledBtn} disabled>Delete Account</button>
            </div>
          </div>
        </Section>
      </div>

      {/* Password Change Modal */}
      <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} style={ss.form}>
          <FormField label="Current Password" error={passwordForm.formState.errors.currentPassword?.message}>
            <input
              type="password"
              style={{ ...ss.input, ...(passwordForm.formState.errors.currentPassword ? ss.inputErr : {}) }}
              {...passwordForm.register('currentPassword')}
            />
          </FormField>
          <FormField label="New Password" error={passwordForm.formState.errors.newPassword?.message}>
            <input
              type="password"
              style={{ ...ss.input, ...(passwordForm.formState.errors.newPassword ? ss.inputErr : {}) }}
              {...passwordForm.register('newPassword')}
            />
          </FormField>
          <FormField label="Confirm Password" error={passwordForm.formState.errors.confirmPassword?.message}>
            <input
              type="password"
              style={{ ...ss.input, ...(passwordForm.formState.errors.confirmPassword ? ss.inputErr : {}) }}
              {...passwordForm.register('confirmPassword')}
            />
          </FormField>
          <div style={ss.formActions}>
            <button type="button" style={ss.cancelBtn} onClick={() => setShowPasswordModal(false)}>
              Cancel
            </button>
            <button type="submit" style={ss.submitBtn}>Change Password</button>
          </div>
        </form>
      </Modal>
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

function FormField({ label, error, children }) {
  return (
    <div style={ss.field}>
      <label style={ss.label}>{label}</label>
      {children}
      {error && <span style={ss.error}>{error}</span>}
    </div>
  );
}

function ToggleSetting({ label, description, defaultValue }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div style={ss.toggleField}>
      <div>
        <div style={ss.toggleLabel}>{label}</div>
        <div style={ss.toggleDesc}>{description}</div>
      </div>
      <button
        onClick={() => setValue(!value)}
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
  successBanner: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '12px 16px', backgroundColor: 'rgba(74,222,128,0.12)',
    border: '1px solid rgba(74,222,128,0.3)', borderRadius: '10px',
    color: '#4ade80', fontSize: '14px', fontWeight: '500',
  },
  successIcon: { fontSize: '16px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr',
    gap: '24px',
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
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#cbd5e1' },
  input: {
    padding: '11px 14px', backgroundColor: '#0f172a',
    border: '1px solid #334155', borderRadius: '10px',
    fontSize: '14px', color: '#f1f5f9', outline: 'none',
    boxSizing: 'border-box', width: '100%',
  },
  textarea: {
    padding: '11px 14px', backgroundColor: '#0f172a',
    border: '1px solid #334155', borderRadius: '10px',
    fontSize: '14px', color: '#f1f5f9', outline: 'none',
    resize: 'vertical', fontFamily: 'inherit',
    width: '100%', boxSizing: 'border-box',
  },
  inputErr: { borderColor: '#f87171' },
  error: { fontSize: '12px', color: '#f87171' },
  submitBtn: {
    padding: '10px 22px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    boxShadow: '0 6px 20px rgba(79,70,229,0.22)',
  },
  cancelBtn: {
    padding: '10px 22px', borderRadius: '10px', border: '1px solid #334155',
    background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
  },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' },
  securityBody: { display: 'flex', flexDirection: 'column', gap: '0' },
  securityItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0',
  },
  securityLabel: { fontSize: '14px', fontWeight: '600', color: '#cbd5e1' },
  securityDesc: { fontSize: '12px', color: '#475569', marginTop: '2px' },
  changeBtn: {
    padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155',
    background: 'none', color: '#818cf8', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
  },
  disabledBtn: {
    padding: '8px 16px', borderRadius: '8px', border: '1px solid #334155',
    background: 'none', color: '#475569', cursor: 'not-allowed', fontSize: '13px', fontWeight: '600',
    opacity: 0.5,
  },
  preferencesBody: { display: 'flex', flexDirection: 'column', gap: '0' },
  toggleField: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0',
  },
  toggleLabel: { fontSize: '14px', fontWeight: '600', color: '#cbd5e1' },
  toggleDesc: { fontSize: '12px', color: '#475569', marginTop: '2px' },
  toggle: {
    width: '48px', height: '28px', borderRadius: '14px',
    border: 'none', cursor: 'pointer', position: 'relative',
    display: 'flex', alignItems: 'center', padding: '2px',
    transition: 'background 0.3s ease',
  },
  toggleCircle: {
    width: '24px', height: '24px', borderRadius: '50%',
    backgroundColor: '#fff', position: 'absolute',
    transition: 'left 0.3s ease',
  },
  divider: { height: '1px', backgroundColor: '#1e293b', margin: '8px 0' },
  accountBody: { display: 'flex', flexDirection: 'column', gap: '0' },
  accountItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0',
  },
  accountLabel: { fontSize: '14px', fontWeight: '600', color: '#cbd5e1' },
  accountDesc: { fontSize: '12px', color: '#475569', marginTop: '2px' },
  dangerBtn: {
    padding: '8px 16px', borderRadius: '8px', border: '1px solid #f87171',
    background: 'none', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
  },
};
