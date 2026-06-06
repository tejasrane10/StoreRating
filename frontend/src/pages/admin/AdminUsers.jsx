import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CardTable from '../../components/tables/CardTable';
import Modal from '../../components/common/Modal';
import { deleteUser as deleteUserAction, updateUser as updateUserAction } from '../../redux/adminSlice';
import { fetchAdminUsers } from '../../redux/adminThunks';

const editSchema = z.object({
  name:    z.string().min(20, 'Min 20 chars').max(60, 'Max 60 chars'),
  email:   z.string().email('Invalid email'),
  address: z.string().max(400, 'Max 400 chars').min(1, 'Required'),
  role:    z.enum(['admin', 'storeOwner', 'user']),
  status:  z.enum(['active', 'inactive']),
});

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { backendUsers, backendUsersLoading } = useSelector((state) => state.admin);
  const [viewUser, setViewUser]     = useState(null);
  const [editUser, setEditUser]     = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editSchema),
  });

  const openEdit = (user) => {
    setEditUser(user);
    reset(user);
  };

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const onEditSubmit = (data) => {
    dispatch(updateUserAction({ id: editUser.id, updates: data }));
    setEditUser(null);
  };

  const confirmDelete = () => {
    dispatch(deleteUserAction(deleteUser.id));
    setDeleteUser(null);
  };

  const columns = [
    { header: 'Name',    accessor: 'name',    sortable: true },
    { header: 'Email',   accessor: 'email',   sortable: true },
    { header: 'Role',    accessor: 'role',    sortable: true, filterable: true, filterOptions: [
      { value: 'admin',      label: 'Admin'       },
      { value: 'storeOwner', label: 'Store Owner' },
      { value: 'user',       label: 'User'        },
    ]},
    { header: 'Status',  accessor: 'status',  sortable: true, filterable: true, filterOptions: [
      { value: 'active',   label: 'Active'   },
      { value: 'inactive', label: 'Inactive' },
    ]},
  ];

  const renderUserCard = (user, actions) => (
    <div style={cs.cardContent}>
      {/* Header */}
      <div style={cs.cardHeader}>
        <div style={cs.headerLeft}>
          <div style={cs.avatar}>{user.name.charAt(0)}</div>
          <div>
            <div style={cs.userName}>{user.name}</div>
            <div style={cs.userEmail}>{user.email}</div>
          </div>
        </div>
        <div style={cs.badges}>
          <RoleBadge role={user.role} />
          <StatusBadge status={user.status} />
        </div>
      </div>

      {/* Body */}
      <div style={cs.cardBody}>
        <InfoRow label="Address" value={user.address} />
        <InfoRow label="Joined" value={formatDate(user.createdAt)} />
      </div>

      {/* Footer */}
      <div style={cs.cardFooter}>
        {actions(user)}
      </div>
    </div>
  );

  const activeCount   = backendUsers.filter((u) => String(u.status || '').toLowerCase() === 'active').length;
  const inactiveCount = backendUsers.filter((u) => String(u.status || '').toLowerCase() === 'inactive').length;

  return (
    <div style={ps.page}>
      {/* Header */}
      <div style={ps.header}>
        <div>
          <h1 style={ps.title}>User Management</h1>
          <p style={ps.sub}>Manage all registered users, roles and statuses.</p>
        </div>
        <div style={ps.stats}>
          <StatPill label="Total"    value={backendUsers.length}  color="#818cf8" />
          <StatPill label="Active"   value={activeCount}   color="#4ade80" />
          <StatPill label="Inactive" value={inactiveCount} color="#f87171" />
        </div>
      </div>

      <CardTable columns={columns} data={backendUsers} loading={backendUsersLoading} renderCard={renderUserCard} actions={(user) => (
        <>
          <ActionBtn color="#818cf8" onClick={() => setViewUser(user)}>
            <EyeIcon /> View
          </ActionBtn>
          <ActionBtn color="#4ade80" onClick={() => openEdit(user)}>
            <EditIcon /> Edit
          </ActionBtn>
          <ActionBtn color="#f87171" onClick={() => setDeleteUser(user)}>
            <TrashIcon /> Delete
          </ActionBtn>
        </>
      )} />

      {/* ── View Modal ─────────────────────────────────────── */}
      <Modal open={!!viewUser} onClose={() => setViewUser(null)} title="User Details">
        {viewUser && (
          <div style={ms.viewGrid}>
            <div style={ms.avatarLarge}>{viewUser.name.charAt(0)}</div>
            <div style={ms.viewName}>{viewUser.name}</div>
            <div style={ms.viewEmail}>{viewUser.email}</div>
            <div style={ms.badgeRow}>
              <RoleBadge role={viewUser.role} />
              <StatusBadge status={viewUser.status} />
            </div>
            <div style={ms.divider} />
            {[
              ['Email',   viewUser.email],
              ['Address', viewUser.address],
              ['Role',    viewUser.role],
              ['Status',  viewUser.status],
              ['Joined',  formatDate(viewUser.createdAt || viewUser.created_at || viewUser.created)],
            ].map(([label, val]) => (
              <div key={label} style={ms.detailRow}>
                <span style={ms.detailLabel}>{label}</span>
                <span style={ms.detailVal}>{val}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* ── Edit Modal ─────────────────────────────────────── */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <form onSubmit={handleSubmit(onEditSubmit)} style={ms.form}>
            <FormField label="Full Name" error={errors.name?.message}>
              <input style={{ ...ms.input, ...(errors.name ? ms.inputErr : {}) }} {...register('name')} />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <input style={{ ...ms.input, ...(errors.email ? ms.inputErr : {}) }} {...register('email')} />
            </FormField>
            <FormField label="Address" error={errors.address?.message}>
              <textarea rows={3} style={{ ...ms.textarea, ...(errors.address ? ms.inputErr : {}) }} {...register('address')} />
            </FormField>
            <div style={ms.row2}>
              <FormField label="Role" error={errors.role?.message}>
                <select style={ms.select} {...register('role')}>
                  <option value="admin">Admin</option>
                  <option value="storeOwner">Store Owner</option>
                  <option value="user">User</option>
                </select>
              </FormField>
              <FormField label="Status" error={errors.status?.message}>
                <select style={ms.select} {...register('status')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </FormField>
            </div>
            <div style={ms.formActions}>
              <button type="button" style={ms.cancelBtn} onClick={() => setEditUser(null)}>Cancel</button>
              <button type="submit" style={ms.saveBtn}>Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Delete Confirm Modal ───────────────────────────── */}
      <Modal open={!!deleteUser} onClose={() => setDeleteUser(null)} title="Delete User" width="400px">
        {deleteUser && (
          <div style={ms.deleteBody}>
            <div style={ms.deleteIcon}>🗑️</div>
            <p style={ms.deleteText}>
              Are you sure you want to delete <strong style={{ color: '#f1f5f9' }}>{deleteUser.name}</strong>?
              This action cannot be undone.
            </p>
            <div style={ms.formActions}>
              <button style={ms.cancelBtn} onClick={() => setDeleteUser(null)}>Cancel</button>
              <button style={ms.deleteBtn} onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────

function StatPill({ label, value, color }) {
  return (
    <div style={{ ...ps.statPill, borderColor: color + '44' }}>
      <span style={{ ...ps.statVal, color }}>{value}</span>
      <span style={ps.statLabel}>{label}</span>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={cs.infoRow}>
      <span style={cs.infoLabel}>{label}</span>
      <span style={cs.infoValue}>{value}</span>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div style={ms.field}>
      <label style={ms.label}>{label}</label>
      {children}
      {error && <span style={ms.error}>{error}</span>}
    </div>
  );
}

function ActionBtn({ children, color, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{ ...cs.actionBtn, color, borderColor: color + '44' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = color + '18')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {children}
    </button>
  );
}

function RoleBadge({ role }) {
  const map = {
    admin:      { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8',  label: 'Admin'       },
    storeOwner: { bg: 'rgba(251,146,60,0.15)',  color: '#fb923c',  label: 'Store Owner' },
    user:       { bg: 'rgba(74,222,128,0.15)',  color: '#4ade80',  label: 'User'        },
  };
  const t = map[role] ?? map.user;
  return (
    <span style={{ ...cs.badge, backgroundColor: t.bg, color: t.color }}>{t.label}</span>
  );
}

function StatusBadge({ status }) {
  const active = status === 'active';
  return (
    <span style={{
      ...cs.badge,
      backgroundColor: active ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
      color: active ? '#4ade80' : '#f87171',
    }}>
      <span style={{ ...cs.statusDot, backgroundColor: active ? '#4ade80' : '#f87171' }} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function EyeIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EditIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }

// ── Styles ───────────────────────────────────────────────────

const ps = {
  page: {
    display: 'flex', flexDirection: 'column', gap: '28px',
    fontFamily: "'Inter', -apple-system, sans-serif",
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    flexWrap: 'wrap', gap: '20px',
  },
  title: {
    fontSize: '28px', fontWeight: '800', color: '#f1f5f9',
    margin: '0 0 6px 0', letterSpacing: '-0.6px',
  },
  sub: { fontSize: '15px', color: '#64748b', margin: 0 },
  stats: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  statPill: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '14px 22px', backgroundColor: '#1e293b',
    borderRadius: '12px', border: '1px solid',
    minWidth: '80px',
  },
  statVal:   { fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' },
  statLabel: { fontSize: '11px', color: '#475569', marginTop: '4px', fontWeight: '500' },
};

const cs = {
  cardContent: {
    display: 'flex', flexDirection: 'column', height: '100%',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '18px 20px', borderBottom: '1px solid #334155',
  },
  headerLeft: {
    display: 'flex', alignItems: 'center', gap: '12px', flex: 1,
  },
  avatar: {
    width: '44px', height: '44px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: '700', color: '#fff', flexShrink: 0,
    boxShadow: '0 4px 12px rgba(99,102,241,0.25)',
  },
  userName: { fontSize: '14px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.2px' },
  userEmail: { fontSize: '12px', color: '#64748b', marginTop: '2px' },
  badges: { display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' },
  badge: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    padding: '4px 10px', borderRadius: '20px',
    fontSize: '11px', fontWeight: '600',
  },
  statusDot: {
    width: '6px', height: '6px', borderRadius: '50%',
  },
  cardBody: {
    flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px',
  },
  infoRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px',
  },
  infoLabel: { fontSize: '12px', color: '#475569', fontWeight: '500', flexShrink: 0 },
  infoValue: { fontSize: '13px', color: '#cbd5e1', textAlign: 'right', flex: 1 },
  cardFooter: {
    display: 'flex', gap: '6px', padding: '14px 20px',
    borderTop: '1px solid #334155', justifyContent: 'flex-end',
  },
  actionBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    padding: '6px 12px', borderRadius: '8px', border: '1px solid',
    background: 'transparent', cursor: 'pointer',
    fontSize: '12px', fontWeight: '500', transition: 'background 0.15s',
  },
};

const ms = {
  viewGrid: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
  },
  avatarLarge: {
    width: '72px', height: '72px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', fontWeight: '700', color: '#fff',
    boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
  },
  viewName:  { fontSize: '20px', fontWeight: '800', color: '#f1f5f9', letterSpacing: '-0.3px' },
  viewEmail: { fontSize: '14px', color: '#64748b' },
  badgeRow:  { display: 'flex', gap: '8px', marginTop: '6px' },
  divider:   { width: '100%', height: '1px', backgroundColor: '#334155', margin: '12px 0' },
  detailRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    width: '100%', padding: '8px 0', borderBottom: '1px solid #1e293b', gap: '16px',
  },
  detailLabel: { fontSize: '13px', color: '#475569', fontWeight: '500', flexShrink: 0 },
  detailVal:   { fontSize: '14px', color: '#cbd5e1', textAlign: 'right' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#cbd5e1' },
  input: {
    padding: '11px 14px', backgroundColor: '#0f172a',
    border: '1px solid #334155', borderRadius: '10px',
    fontSize: '14px', color: '#f1f5f9', outline: 'none', boxSizing: 'border-box', width: '100%',
  },
  textarea: {
    padding: '11px 14px', backgroundColor: '#0f172a',
    border: '1px solid #334155', borderRadius: '10px',
    fontSize: '14px', color: '#f1f5f9', outline: 'none',
    resize: 'vertical', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
  },
  select: {
    padding: '11px 14px', backgroundColor: '#0f172a',
    border: '1px solid #334155', borderRadius: '10px',
    fontSize: '14px', color: '#f1f5f9', outline: 'none', width: '100%',
  },
  inputErr: { borderColor: '#f87171' },
  error:    { fontSize: '12px', color: '#f87171' },
  row2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' },
  cancelBtn: {
    padding: '10px 22px', borderRadius: '10px', border: '1px solid #334155',
    background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
  },
  saveBtn: {
    padding: '10px 22px', borderRadius: '10px', border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
  },
  deleteBody: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', textAlign: 'center' },
  deleteIcon: { fontSize: '40px' },
  deleteText: { fontSize: '15px', color: '#94a3b8', lineHeight: '1.6', margin: 0 },
  deleteBtn: {
    padding: '10px 22px', borderRadius: '10px', border: 'none',
    backgroundColor: '#ef4444', color: '#fff',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600',
  },
};
