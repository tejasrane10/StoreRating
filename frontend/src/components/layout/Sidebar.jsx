import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/authSlice';
import { MENU_ITEMS } from '../../constants/menu';
import { getMenuIcon, LogoutIcon } from '../common/NavIcons';

export default function Sidebar({ collapsed, isMobile }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const role = user?.role ?? 'user';
  const items = MENU_ITEMS[role] ?? [];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <aside style={{ ...styles.sidebar, width: collapsed ? '68px' : '240px' }}>
      {/* Brand */}
      <div style={styles.brand}>
        <div style={styles.logoCircle}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        {!collapsed && <span style={styles.brandName}>StoreRating</span>}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div style={styles.roleBadgeWrap}>
          <span style={{ ...styles.roleBadge, ...roleBadgeColor(role) }}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </span>
        </div>
      )}

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navSection}>
          {!collapsed && <span style={styles.navLabel}>MENU</span>}
          {items.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
                justifyContent: collapsed ? 'center' : 'flex-start',
              })}
              title={collapsed ? item.label : ''}
            >
              {({ isActive }) => (
                <>
                  <span style={styles.navIcon}>
                    {getMenuIcon(item.icon, 19, isActive ? '#818cf8' : '#64748b')}
                  </span>
                  {!collapsed && (
                    <>
                      <span style={{ ...styles.navText, ...(isActive ? styles.navTextActive : {}) }}>
                        {item.label}
                      </span>
                      {isActive && <span style={styles.activeBar} />}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* User + Logout */}
      <div style={styles.footer}>
        {!collapsed && (
          <div style={styles.userCard}>
            <div style={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user?.name?.split(' ')[0]}</span>
              <span style={styles.userEmail}>{user?.email}</span>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{ ...styles.logoutBtn, justifyContent: collapsed ? 'center' : 'flex-start' }}
          title={collapsed ? 'Logout' : ''}
        >
          <LogoutIcon size={18} color="#f87171" />
          {!collapsed && <span style={styles.logoutText}>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

function roleBadgeColor(role) {
  if (role === 'admin') return { backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' };
  if (role === 'storeOwner') return { backgroundColor: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' };
  return { backgroundColor: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' };
}

const styles = {
  sidebar: {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    backgroundColor: '#0f172a',
    borderRight: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 100,
    transition: 'width 0.3s ease',
    flexShrink: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '24px 16px 16px',
    borderBottom: '1px solid #1e293b',
  },
  logoCircle: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(99,102,241,0.35)',
  },
  brandName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f1f5f9',
    letterSpacing: '-0.3px',
    whiteSpace: 'nowrap',
  },
  roleBadgeWrap: {
    padding: '10px 16px 4px',
  },
  roleBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '20px',
    letterSpacing: '0.5px',
  },
  nav: {
    flex: 1,
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
  },
  navSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  navLabel: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#334155',
    letterSpacing: '1px',
    padding: '8px 10px 4px',
    textTransform: 'uppercase',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 10px',
    borderRadius: '10px',
    textDecoration: 'none',
    position: 'relative',
    transition: 'background 0.15s',
    cursor: 'pointer',
  },
  navItemActive: {
    backgroundColor: 'rgba(99,102,241,0.12)',
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  navText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  navTextActive: {
    color: '#818cf8',
    fontWeight: '600',
  },
  activeBar: {
    width: '3px',
    height: '18px',
    borderRadius: '2px',
    backgroundColor: '#6366f1',
    marginLeft: 'auto',
  },
  footer: {
    borderTop: '1px solid #1e293b',
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 10px',
    borderRadius: '10px',
    backgroundColor: '#1e293b',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#e2e8f0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userEmail: {
    fontSize: '11px',
    color: '#475569',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 10px',
    borderRadius: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    transition: 'background 0.15s',
  },
  logoutText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#f87171',
  },
};
