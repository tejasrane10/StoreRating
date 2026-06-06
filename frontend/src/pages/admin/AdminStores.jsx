import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CardTable from '../../components/tables/CardTable';
import Modal from '../../components/common/Modal';
import StoreDrawer from '../../components/common/StoreDrawer';
import { deleteStore as deleteStoreAction, updateStore as updateStoreAction } from '../../redux/adminSlice';
import { fetchAdminStores } from '../../redux/adminThunks';

const editSchema = z.object({
  name:    z.string().min(3, 'Min 3 characters').max(100, 'Max 100 characters'),
  email:   z.string().email('Invalid email'),
  address: z.string().min(1, 'Required').max(400, 'Max 400 characters'),
  status:  z.enum(['active', 'inactive']),
  category: z.string().min(1, 'Required'),
});

export default function AdminStores() {
  const dispatch = useDispatch();
  const { stores }                 = useSelector((state) => state.admin);
  const { storesLoading }         = useSelector((state) => state.admin);
  const [drawerStore, setDrawerStore] = useState(null);
  const [editStore, setEditStore]   = useState(null);
  const [deleteStore, setDeleteStore] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(editSchema),
  });

  const openEdit = (store) => {
    setEditStore(store);
    reset(store);
  };

  useEffect(() => {
    dispatch(fetchAdminStores());
  }, [dispatch]);

  const onEditSubmit = (data) => {
    dispatch(updateStoreAction({ id: editStore.id, updates: data }));
    setEditStore(null);
  };

  const confirmDelete = () => {
    dispatch(deleteStoreAction(deleteStore.id));
    setDeleteStore(null);
  };

  const columns = [
    { header: 'Store',   accessor: 'name',   sortable: true },
    { header: 'Email',   accessor: 'email',  sortable: true },
    { header: 'Rating',  accessor: 'rating', sortable: true },
    { header: 'Status',  accessor: 'status', sortable: true, filterable: true, filterOptions: [
      { value: 'active',   label: 'Active'   },
      { value: 'inactive', label: 'Inactive' },
    ]},
  ];

  const renderStoreCard = (store, actions) => (
    <div style={cs.cardContent}>
      {/* Header */}
      <div style={cs.cardHeader}>
        <div style={cs.headerLeft}>
          <div style={cs.storeAvatar}>{store.name.charAt(0)}</div>
          <div style={cs.storeInfo}>
            <div style={cs.storeName}>{store.name}</div>
            <div style={cs.storeCategory}>{store.category}</div>
          </div>
        </div>
        <StatusBadge status={store.status} />
      </div>

      {/* Rating section */}
      <div style={cs.ratingSection}>
        <div style={cs.ratingLeft}>
          <div style={cs.ratingBig}>{store.rating.toFixed(1)}</div>
          <div style={cs.starRow}>
            {[1,2,3,4,5].map((i) => (
              <span key={i} style={{ color: i <= Math.round(store.rating) ? '#fbbf24' : '#334155', fontSize: '12px' }}>★</span>
            ))}
          </div>
        </div>
        <div style={cs.ratingRight}>
          <div style={cs.reviewCount}>{store.totalReviews}</div>
          <div style={cs.reviewLabel}>reviews</div>
        </div>
      </div>

      {/* Body */}
      <div style={cs.cardBody}>
        <InfoRow icon={<MailIcon />} label="Email" value={store.email} />
        <InfoRow icon={<PinIcon />}  label="Address" value={store.address} />
        <InfoRow icon={<UserIcon />} label="Owner" value={store.ownerName.split(' ').slice(0, 2).join(' ')} />
      </div>

      {/* Footer */}
      <div style={cs.cardFooter}>
        {actions(store)}
      </div>
    </div>
  );

  const activeCount   = stores.filter((s) => s.status === 'active').length;
  const inactiveCount = stores.filter((s) => s.status === 'inactive').length;
  const avgRating     = stores.length > 0 ? (stores.reduce((a, s) => a + (Number(s.rating) || 0), 0) / stores.length).toFixed(1) : '0.0';

  return (
    <div style={ps.page}>
      {/* Header */}
      <div style={ps.header}>
        <div>
          <h1 style={ps.title}>Store Management</h1>
          <p style={ps.sub}>Manage all registered stores, owners and ratings.</p>
        </div>
        <div style={ps.stats}>
          <StatPill label="Total"    value={stores.length}  color="#818cf8" />
          <StatPill label="Active"   value={activeCount}    color="#4ade80" />
          <StatPill label="Inactive" value={inactiveCount}  color="#f87171" />
          <StatPill label="Avg Rating" value={avgRating}    color="#fbbf24" />
        </div>
      </div>

      <CardTable columns={columns} data={stores} renderCard={renderStoreCard} actions={(store) => (
        <>
          <ActionBtn color="#818cf8" onClick={() => setDrawerStore(store)}>
            <EyeIcon /> View
          </ActionBtn>
          <ActionBtn color="#4ade80" onClick={() => openEdit(store)}>
            <EditIcon /> Edit
          </ActionBtn>
          <ActionBtn color="#f87171" onClick={() => setDeleteStore(store)}>
            <TrashIcon /> Delete
          </ActionBtn>
        </>
      )} />

      {/* ── Store Profile Drawer ───────────────────────────── */}
      <StoreDrawer store={drawerStore} onClose={() => setDrawerStore(null)} />

      {/* ── Edit Modal ─────────────────────────────────────── */}
      <Modal open={!!editStore} onClose={() => setEditStore(null)} title="Edit Store">
        {editStore && (
          <form onSubmit={handleSubmit(onEditSubmit)} style={ms.form}>
            <FormField label="Store Name" error={errors.name?.message}>
              <input style={{ ...ms.input, ...(errors.name ? ms.inputErr : {}) }} {...register('name')} />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <input style={{ ...ms.input, ...(errors.email ? ms.inputErr : {}) }} {...register('email')} />
            </FormField>
            <FormField label="Address" error={errors.address?.message}>
              <textarea rows={3} style={{ ...ms.textarea, ...(errors.address ? ms.inputErr : {}) }} {...register('address')} />
            </FormField>
            <div style={ms.row2}>
              <FormField label="Category" error={errors.category?.message}>
                <select style={ms.select} {...register('category')}>
                  {['Grocery','Supermarket','Convenience','Organic','Discount'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
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
              <button type="button" style={ms.cancelBtn} onClick={() => setEditStore(null)}>Cancel</button>
              <button type="submit" style={ms.saveBtn}>Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Delete Confirm ─────────────────────────────────── */}
      <Modal open={!!deleteStore} onClose={() => setDeleteStore(null)} title="Delete Store" width="400px">
        {deleteStore && (
          <div style={ms.deleteBody}>
            <div style={ms.deleteIcon}>🗑️</div>
            <p style={ms.deleteText}>
              Are you sure you want to delete{' '}
              <strong style={{ color: '#f1f5f9' }}>{deleteStore.name}</strong>?
              This action cannot be undone.
            </p>
            <div style={ms.formActions}>
              <button style={ms.cancelBtn} onClick={() => setDeleteStore(null)}>Cancel</button>
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

function InfoRow({ icon, label, value }) {
  return (
    <div style={cs.infoRow}>
      <span style={cs.infoIcon}>{icon}</span>
      <div style={cs.infoContent}>
        <span style={cs.infoLabel}>{label}</span>
        <span style={cs.infoValue}>{value}</span>
      </div>
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

function StatusBadge({ status }) {
  const active = status === 'active';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
      backgroundColor: active ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
      color: active ? '#4ade80' : '#f87171',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: active ? '#4ade80' : '#f87171', display: 'inline-block' }} />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

function EyeIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EditIcon()  { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>; }
function TrashIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>; }
function MailIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>; }
function PinIcon()   { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function UserIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }

// ── Styles ───────────────────────────────────────────────────

const ps = {
  page:  { display: 'flex', flexDirection: 'column', gap: '28px', fontFamily: "'Inter', -apple-system, sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' },
  title: { fontSize: '28px', fontWeight: '800', color: '#f1f5f9', margin: '0 0 6px 0', letterSpacing: '-0.6px' },
  sub:   { fontSize: '15px', color: '#64748b', margin: 0 },
  stats: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  statPill: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '14px 22px', backgroundColor: '#1e293b',
    borderRadius: '12px', border: '1px solid', minWidth: '80px',
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
  storeAvatar: {
    width: '44px', height: '44px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', fontWeight: '700', color: '#fff', flexShrink: 0,
    boxShadow: '0 4px 12px rgba(99,102,241,0.25)',
  },
  storeInfo: { flex: 1, minWidth: 0 },
  storeName: { fontSize: '14px', fontWeight: '700', color: '#f1f5f9', letterSpacing: '-0.2px' },
  storeCategory: { fontSize: '12px', color: '#818cf8', marginTop: '2px', fontWeight: '500' },
  ratingSection: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 20px', backgroundColor: '#0f172a', borderBottom: '1px solid #334155',
  },
  ratingLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  ratingBig: { fontSize: '28px', fontWeight: '800', color: '#fbbf24', letterSpacing: '-0.5px' },
  starRow: { display: 'flex', gap: '1px' },
  ratingRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
  reviewCount: { fontSize: '16px', fontWeight: '700', color: '#f1f5f9' },
  reviewLabel: { fontSize: '11px', color: '#475569' },
  cardBody: {
    flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px',
  },
  infoRow: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
  },
  infoIcon: { marginTop: '2px', flexShrink: 0 },
  infoContent: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, minWidth: 0 },
  infoLabel: { fontSize: '11px', color: '#475569', fontWeight: '500' },
  infoValue: { fontSize: '13px', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
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
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
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
  select: {
    padding: '11px 14px', backgroundColor: '#0f172a',
    border: '1px solid #334155', borderRadius: '10px',
    fontSize: '14px', color: '#f1f5f9', outline: 'none', width: '100%',
  },
  inputErr:    { borderColor: '#f87171' },
  error:       { fontSize: '12px', color: '#f87171' },
  row2:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
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
