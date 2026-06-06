import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../../components/common/Modal';
import {
  addUserAsync,
  addStoreAsync,
  addAdminAsync,
  fetchAdminUsers,
  fetchAdminDashboardStats,
} from '../../redux/adminThunks';

const userSchema = z.object({
  fullName: z.string().min(3, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  address: z.string().min(8, 'Address is required'),
  password: z.string().min(8, 'Min 8 characters'),
  role: z.enum(['user', 'storeOwner']),
  status: z.enum(['active', 'inactive']),
});

const storeSchema = z.object({
  storeName: z.string().min(3, 'Store name is required'),
  storeEmail: z.string().email('Enter a valid email'),
  storeAddress: z.string().min(8, 'Address is required'),
  ownerId: z.string().min(1, 'Select a store owner'),
  status: z.enum(['active', 'inactive']),
  storeDescription: z.string().optional(),
  storeCategory: z.string().min(2, 'Category is required'),
});

const adminSchema = z.object({
  adminName: z.string().min(3, 'Admin name is required'),
  email: z.string().email('Enter a valid email'),
  address: z.string().min(8, 'Address is required'),
  password: z.string().min(8, 'Min 8 characters'),
  permissions: z.array(z.enum(['users', 'stores', 'ratings', 'reports'])).min(1, 'Select at least one permission'),
});

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const {
    dashboardSummary,
    dashboardLoading,
    dashboardError,
    backendUsers,
    backendUsersLoading,
    backendUsersError,
  } = useSelector((state) => state.admin);
  const [activeModal, setActiveModal] = useState(null);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    dispatch(fetchAdminUsers());
    dispatch(fetchAdminDashboardStats());
  }, [dispatch]);

  const userDefaults = {
    fullName: '',
    email: '',
    address: '',
    password: '',
    role: 'user',
    status: 'active',
  };

  const storeDefaults = {
    storeName: '',
    storeEmail: '',
    storeAddress: '',
    ownerId: '',
    status: 'active',
    storeDescription: '',
    storeCategory: 'Grocery',
  };

  const adminDefaults = {
    adminName: '',
    email: '',
    address: '',
    password: '',
    permissions: ['users', 'stores'],
  };

  const userForm = useForm({ resolver: zodResolver(userSchema), defaultValues: userDefaults });
  const storeForm = useForm({ resolver: zodResolver(storeSchema), defaultValues: storeDefaults });
  const adminForm = useForm({ resolver: zodResolver(adminSchema), defaultValues: adminDefaults });

  const storeOwners = useMemo(
    () => backendUsers.filter((user) => ['ADMIN', 'STORE_OWNER'].includes(String(user.role || '').toUpperCase())),
    [backendUsers]
  );

  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return backendUsers;
    const q = String(searchTerm).toLowerCase().trim();
    return backendUsers.filter((u) => (
      String(u.name || '').toLowerCase().includes(q)
      || String(u.email || '').toLowerCase().includes(q)
      || String(u.role || '').toLowerCase().includes(q)
    ));
  }, [backendUsers, searchTerm]);

  const stats = useMemo(() => ({
    totalUsers: Number(dashboardSummary.totalUsers ?? 0),
    totalStores: Number(dashboardSummary.totalStores ?? 0),
    totalRatings: Number(dashboardSummary.totalRatings ?? 0),
    activeUsers: backendUsers.filter((user) => String(user.status || '').toLowerCase() === 'active').length,
  }), [backendUsers, dashboardSummary]);

  const isLoading = dashboardLoading || backendUsersLoading;

  const refreshDashboard = () => {
    dispatch(fetchAdminUsers());
    dispatch(fetchAdminDashboardStats());
    setBanner({ type: 'success', text: 'Dashboard refreshed from backend' });
    window.setTimeout(() => setBanner(null), 2400);
  };

  const openModal = (type) => {
    setBanner(null);
    if (type === 'user') userForm.reset(userDefaults);
    if (type === 'store') storeForm.reset(storeDefaults);
    if (type === 'admin') adminForm.reset(adminDefaults);
    setActiveModal(type);
  };

  const closeModal = () => {
    userForm.reset(userDefaults);
    storeForm.reset(storeDefaults);
    adminForm.reset(adminDefaults);
    setActiveModal(null);
  };

  const submitUser = async (data) => {
    await dispatch(addUserAsync(data));
    setBanner({ type: 'success', text: 'User created successfully' });
    closeModal();
    window.setTimeout(() => setBanner(null), 2600);
  };

  const submitStore = async (data) => {
    const owner = storeOwners.find((item) => String(item.id) === String(data.ownerId));
    await dispatch(addStoreAsync({ ...data, owner, rating: 0 }));
    setBanner({ type: 'success', text: 'Store created successfully' });
    closeModal();
    window.setTimeout(() => setBanner(null), 2600);
  };

  const submitAdmin = async (data) => {
    await dispatch(addAdminAsync({
      adminName: data.adminName,
      email: data.email,
      address: data.address,
      password: data.password,
      status: 'active',
      permissions: data.permissions,
    }));
    setBanner({ type: 'success', text: 'Admin created successfully' });
    closeModal();
    window.setTimeout(() => setBanner(null), 2600);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.kicker}>Admin Console</div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.sub}>Live backend totals and users only.</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.quickActions}>
            <QuickBtn label="+ Add Store" color="#4ade80" onClick={() => openModal('store')} />
            <QuickBtn label="+ Add User" color="#818cf8" onClick={() => openModal('user')} />
            <QuickBtn label="+ Add Admin" color="#fb923c" onClick={() => openModal('admin')} />
          </div>
          <button style={styles.refreshBtn} onClick={refreshDashboard}>Refresh</button>
        </div>
      </div>

      {banner && (
        <div style={styles.banner}>
          <span style={styles.bannerIcon}>✓</span>
          <span>{banner.text}</span>
        </div>
      )}

      {(dashboardError || backendUsersError) && (
        <div style={styles.errorBanner}>{dashboardError || backendUsersError}</div>
      )}

      <div style={styles.statsGrid}>
        <StatCard label="Total Users" value={isLoading ? '...' : stats.totalUsers} change={`${stats.activeUsers} active users`} color="#6366f1" />
        <StatCard label="Total Stores" value={isLoading ? '...' : stats.totalStores} change="Live backend total" color="#4ade80" />
        <StatCard label="Total Ratings" value={isLoading ? '...' : stats.totalRatings} change="Live backend total" color="#fbbf24" />
      </div>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <div style={styles.cardTitle}>Backend Users</div>
            <div style={styles.cardSub}>Loaded from /admin/users</div>
          </div>
          <div style={styles.headerTool}>
            <input
              style={styles.searchInput}
              placeholder="Search users by name, email or role"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div style={styles.resultCount}>{isLoading ? '...' : `${filteredUsers.length} users`}</div>
            <Link to="/admin/users" style={styles.viewAll}>View all</Link>
          </div>
        </div>
        <div style={styles.userListWrap}>
          <div style={styles.userList}>
            {backendUsersLoading && <div style={styles.empty}>Loading users from backend...</div>}
            {!backendUsersLoading && backendUsers.length === 0 && <div style={styles.empty}>No backend users found.</div>}
            {!backendUsersLoading && filteredUsers.length === 0 && backendUsers.length > 0 && (
              <div style={styles.empty}>No users match your search.</div>
            )}
            {filteredUsers.map((user) => (
              <div key={user.id} style={styles.userRow}>
                <div style={styles.userAvatar}>{String(user.name || '?').charAt(0).toUpperCase()}</div>
                <div style={styles.userBody}>
                  <div style={styles.userName}>{user.name}</div>
                  <div style={styles.userMeta}>{user.email}</div>
                </div>
                <div style={styles.roleBadge}>{String(user.role || '').toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={activeModal === 'user'} onClose={closeModal} title="Add User" width="720px">
        <form onSubmit={userForm.handleSubmit(submitUser)} style={styles.form}>
          <div style={styles.formGrid}>
            <Field label="Full Name" error={userForm.formState.errors.fullName?.message}>
              <input style={styles.input} {...userForm.register('fullName')} placeholder="John Doe" />
            </Field>
            <Field label="Email" error={userForm.formState.errors.email?.message}>
              <input style={styles.input} {...userForm.register('email')} placeholder="john@example.com" />
            </Field>
            <Field label="Address" error={userForm.formState.errors.address?.message} fullWidth>
              <textarea style={styles.textarea} rows={3} {...userForm.register('address')} placeholder="123 Main Street" />
            </Field>
            <Field label="Password" error={userForm.formState.errors.password?.message}>
              <input type="password" style={styles.input} {...userForm.register('password')} placeholder="••••••••" />
            </Field>
            <Field label="Role" error={userForm.formState.errors.role?.message}>
              <select style={styles.input} {...userForm.register('role')}>
                <option value="user">Normal User</option>
                <option value="storeOwner">Store Owner</option>
              </select>
            </Field>
            <Field label="Status" error={userForm.formState.errors.status?.message}>
              <select style={styles.input} {...userForm.register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
          </div>
          <div style={styles.formActions}>
            <button type="button" style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            <button type="submit" style={styles.primaryBtn}>Create User</button>
          </div>
        </form>
      </Modal>

      <Modal open={activeModal === 'store'} onClose={closeModal} title="Add Store" width="760px">
        <form onSubmit={storeForm.handleSubmit(submitStore)} style={styles.form}>
          <div style={styles.formGrid}>
            <Field label="Store Name" error={storeForm.formState.errors.storeName?.message} fullWidth>
              <input style={styles.input} {...storeForm.register('storeName')} placeholder="Store name" />
            </Field>
            <Field label="Store Email" error={storeForm.formState.errors.storeEmail?.message}>
              <input style={styles.input} {...storeForm.register('storeEmail')} placeholder="store@example.com" />
            </Field>
            <Field label="Store Address" error={storeForm.formState.errors.storeAddress?.message} fullWidth>
              <textarea style={styles.textarea} rows={3} {...storeForm.register('storeAddress')} placeholder="Store address" />
            </Field>
            <Field label="Assign Store Owner" error={storeForm.formState.errors.ownerId?.message}>
              <select style={styles.input} {...storeForm.register('ownerId')}>
                <option value="">Select owner</option>
                {storeOwners.map((owner) => (
                  <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
                ))}
              </select>
            </Field>
            <Field label="Status" error={storeForm.formState.errors.status?.message}>
              <select style={styles.input} {...storeForm.register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </Field>
            <div style={styles.advancedBox}>
              <div style={styles.advancedTitle}>Advanced Section</div>
              <Field label="Store Description">
                <textarea style={styles.textarea} rows={3} {...storeForm.register('storeDescription')} placeholder="Short description for the store profile" />
              </Field>
              <Field label="Store Category" error={storeForm.formState.errors.storeCategory?.message}>
                <select style={styles.input} {...storeForm.register('storeCategory')}>
                  <option value="Grocery">Grocery</option>
                  <option value="Supermarket">Supermarket</option>
                  <option value="Convenience">Convenience</option>
                  <option value="Organic">Organic</option>
                  <option value="Discount">Discount</option>
                </select>
              </Field>
            </div>
          </div>
          <div style={styles.formActions}>
            <button type="button" style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            <button type="submit" style={styles.primaryBtn}>Create Store</button>
          </div>
        </form>
      </Modal>

      <Modal open={activeModal === 'admin'} onClose={closeModal} title="Add Admin" width="760px">
        <form onSubmit={adminForm.handleSubmit(submitAdmin)} style={styles.form}>
          <div style={styles.formGrid}>
            <Field label="Admin Name" error={adminForm.formState.errors.adminName?.message} fullWidth>
              <input style={styles.input} {...adminForm.register('adminName')} placeholder="Jonathan Smith" />
            </Field>
            <Field label="Email" error={adminForm.formState.errors.email?.message}>
              <input style={styles.input} {...adminForm.register('email')} placeholder="admin@example.com" />
            </Field>
            <Field label="Address" error={adminForm.formState.errors.address?.message} fullWidth>
              <textarea style={styles.textarea} rows={3} {...adminForm.register('address')} placeholder="123 Admin Street" />
            </Field>
            <Field label="Password" error={adminForm.formState.errors.password?.message}>
              <input type="password" style={styles.input} {...adminForm.register('password')} placeholder="••••••••" />
            </Field>
          </div>
          <div style={styles.permissionsBox}>
            <div style={styles.advancedTitle}>Permissions</div>
            <div style={styles.permissionGrid}>
              {[
                { key: 'users', label: 'Manage Users' },
                { key: 'stores', label: 'Manage Stores' },
                { key: 'ratings', label: 'Manage Ratings' },
                { key: 'reports', label: 'View Reports' },
              ].map((item) => (
                <label key={item.key} style={styles.permissionItem}>
                  <input type="checkbox" value={item.key} {...adminForm.register('permissions')} />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
            {adminForm.formState.errors.permissions?.message && (
              <div style={styles.error}>{adminForm.formState.errors.permissions.message}</div>
            )}
          </div>
          <div style={styles.formActions}>
            <button type="button" style={styles.cancelBtn} onClick={closeModal}>Cancel</button>
            <button type="submit" style={styles.primaryBtn}>Create Admin</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function QuickBtn({ label, color, onClick }) {
  return (
    <button style={{ ...styles.quickBtn, borderColor: color, color }} onClick={onClick}>
      {label}
    </button>
  );
}

function StatCard({ label, value, change, color }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTop}>
        <div>
          <div style={styles.statLabel}>{label}</div>
          <div style={{ ...styles.statValue, color }}>{value}</div>
        </div>
        <div style={{ ...styles.statIconBox, backgroundColor: `${color}18`, color }}>
          <span style={styles.statIcon}>●</span>
        </div>
      </div>
      <div style={styles.statBottom}>{change}</div>
    </div>
  );
}

function Field({ label, error, children, fullWidth = false }) {
  return (
    <div style={{ ...styles.field, ...(fullWidth ? styles.fullWidth : {}) }}>
      <label style={styles.label}>{label}</label>
      {children}
      {error && <span style={styles.error}>{error}</span>}
    </div>
  );
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', gap: '22px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' },
  kicker: { fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#64748b', marginBottom: '8px' },
  title: { fontSize: '30px', fontWeight: '800', color: '#f8fafc', margin: '0 0 6px 0', letterSpacing: '-0.6px' },
  sub: { fontSize: '15px', color: '#94a3b8', margin: 0, maxWidth: '760px' },
  refreshBtn: { padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#111827', color: '#f8fafc', cursor: 'pointer', fontWeight: '700' },
  banner: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.28)', color: '#4ade80', fontWeight: '700' },
  bannerIcon: { width: '20px', height: '20px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(74,222,128,0.18)' },
  errorBanner: { padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.28)', color: '#f87171', fontWeight: '700' },
  quickActions: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  quickBtn: { padding: '10px 16px', borderRadius: '12px', border: '1px solid', backgroundColor: '#111827', cursor: 'pointer', fontSize: '13px', fontWeight: '700' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' },
  statCard: { backgroundColor: '#111827', borderRadius: '16px', padding: '18px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '14px' },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  statLabel: { fontSize: '13px', color: '#94a3b8', fontWeight: '500', marginBottom: '6px' },
  statValue: { fontSize: '28px', fontWeight: '800', letterSpacing: '-0.5px' },
  statIconBox: { width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statIcon: { fontSize: '14px', fontWeight: '900' },
  statBottom: { fontSize: '12px', color: '#64748b', fontWeight: '600' },
  card: { backgroundColor: '#111827', borderRadius: '18px', border: '1px solid #334155', padding: '18px', minWidth: 0 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' },
  cardTitle: { fontSize: '15px', fontWeight: '700', color: '#f8fafc' },
  cardSub: { fontSize: '12px', color: '#64748b', marginTop: '4px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  headerTool: { display: 'flex', alignItems: 'center', gap: '10px' },
  searchInput: { padding: '8px 12px', borderRadius: '10px', border: '1px solid #22303f', backgroundColor: '#071026', color: '#e6eef8', outline: 'none', minWidth: '240px' },
  viewAll: { padding: '8px 12px', borderRadius: '10px', backgroundColor: 'transparent', color: '#93c5fd', textDecoration: 'none', border: '1px solid transparent', fontWeight: 700 },
  resultCount: { fontSize: '13px', color: '#94a3b8', fontWeight: 700, marginLeft: '6px' },
  userList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  userListWrap: { maxHeight: '360px', overflowY: 'auto', paddingRight: '6px' },
  userRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #1e293b' },
  userAvatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1d4ed8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' },
  userBody: { flex: 1, minWidth: 0 },
  userName: { fontSize: '13px', color: '#e2e8f0', fontWeight: '700' },
  userMeta: { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },
  empty: { padding: '12px', borderRadius: '12px', backgroundColor: '#0f172a', border: '1px dashed #334155', color: '#94a3b8', fontSize: '13px' },
  roleBadge: { fontSize: '12px', color: '#93c5fd', fontWeight: '800', padding: '8px 12px', borderRadius: '10px', backgroundColor: 'rgba(147,197,253,0.04)', border: '1px solid rgba(147,197,253,0.06)' },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  fullWidth: { gridColumn: '1 / -1' },
  label: { fontSize: '13px', fontWeight: '700', color: '#cbd5e1' },
  input: { width: '100%', padding: '11px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f8fafc', outline: 'none', fontSize: '14px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '11px 14px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f8fafc', outline: 'none', fontSize: '14px', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' },
  error: { fontSize: '12px', color: '#f87171', fontWeight: '600' },
  advancedBox: { gridColumn: '1 / -1', padding: '16px', borderRadius: '14px', backgroundColor: '#0b1220', border: '1px solid #334155', display: 'grid', gap: '14px' },
  permissionsBox: { padding: '16px', borderRadius: '14px', backgroundColor: '#0b1220', border: '1px solid #334155', display: 'grid', gap: '14px' },
  advancedTitle: { fontSize: '12px', color: '#818cf8', fontWeight: '800', letterSpacing: '0.08em', textTransform: 'uppercase' },
  permissionGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' },
  permissionItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '10px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#e2e8f0', fontSize: '13px', fontWeight: '600' },
  formActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  cancelBtn: { padding: '10px 18px', borderRadius: '10px', border: '1px solid #334155', background: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '14px', fontWeight: '700' },
  primaryBtn: { padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '800', boxShadow: '0 10px 24px rgba(99,102,241,0.25)' },
};