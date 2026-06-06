import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BellIcon, MenuIcon } from '../common/NavIcons';
import { markAllNotificationsRead } from '../../redux/adminSlice';
import { logout } from '../../redux/authSlice';

export default function Navbar({ onMenuToggle }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { notifications, users, stores } = useSelector((state) => state.admin);

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setNotifOpen(false);
        setProfileOpen(false);
        setSearchOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const unreadCount = notifications.filter((item) => item.unread).length;
  const roleLabel = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Guest';
  const firstName = user?.name?.split(' ')[0] ?? 'Jonathan';

  const searchResults = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];

    const results = [];

    users
      .filter((item) => item.name.toLowerCase().includes(query) || item.email.toLowerCase().includes(query))
      .slice(0, 3)
      .forEach((item) => {
        results.push({
          id: `user-${item.id}`,
          type: 'User',
          title: item.name,
          detail: item.email,
          to: '/admin/users',
          color: '#818cf8',
        });
      });

    stores
      .filter((item) => item.name.toLowerCase().includes(query) || item.email.toLowerCase().includes(query))
      .slice(0, 3)
      .forEach((item) => {
        results.push({
          id: `store-${item.id}`,
          type: 'Store',
          title: item.name,
          detail: item.category,
          to: '/admin/stores',
          color: '#4ade80',
        });
      });

    return results.slice(0, 6);
  }, [searchTerm, stores, users]);

  // Per request: only expose Account Settings and Activity Logs in profile menu
  const profileMenu = [
    { label: 'Account Settings', to: '/admin/settings' },
    { label: 'Activity Logs', to: '/admin/activity' },
  ];

  const openSearchResult = (destination) => {
    navigate(destination);
    setSearchTerm('');
    setSearchOpen(false);
  };

  return (
    <header style={styles.navbar}>
      <button
        onClick={onMenuToggle}
        style={styles.menuBtn}
        aria-label="Toggle sidebar"
        title="Toggle sidebar"
      >
        <MenuIcon size={22} color="#94a3b8" />
      </button>

      <div style={styles.breadcrumb}>
        <div>
          <div style={styles.pageKicker}>Admin Console</div>
          <div style={styles.pageTitle}>Command Center</div>
        </div>
        <span style={styles.breadcrumbRole}>{roleLabel}</span>
      </div>

      <div ref={searchRef} style={styles.searchWrap}>
        <input
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
            setSearchOpen(true);
          }}
          onFocus={() => setSearchOpen(true)}
          placeholder="Search Users, Stores, Ratings..."
          style={styles.searchInput}
        />
        {searchOpen && searchTerm && (
          <div style={styles.searchDropdown}>
            <div style={styles.dropdownHeader}>Search Results</div>
            {searchResults.length === 0 ? (
              <div style={styles.emptyState}>No matches found</div>
            ) : (
              searchResults.map((item) => (
                <button key={item.id} onClick={() => openSearchResult(item.to)} style={styles.resultItem}>
                  <span style={{ ...styles.resultDot, backgroundColor: item.color }} />
                  <span style={styles.resultBody}>
                    <span style={styles.resultType}>{item.type}</span>
                    <span style={styles.resultTitle}>{item.title}</span>
                    <span style={styles.resultDetail}>{item.detail}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div style={styles.right}>
        <div ref={notifRef} style={styles.notifWrap}>
          <button
            style={styles.iconBtn}
            onClick={() => {
              setProfileOpen(false);
              setNotifOpen((current) => !current);
            }}
            aria-label="Notifications"
          >
            <BellIcon size={20} color="#94a3b8" />
            <span style={styles.badge}>{unreadCount}</span>
          </button>

          {notifOpen && (
            <div style={styles.notifDropdown}>
              <div style={styles.notifHeader}>
                <div>
                  <span style={styles.notifTitle}>Notifications</span>
                  <span style={styles.notifCount}>{unreadCount} unread</span>
                </div>
                <button style={styles.markReadBtn} onClick={() => dispatch(markAllNotificationsRead())}>
                  Mark all as read
                </button>
              </div>
              <div style={styles.notifList}>
                {notifications.map((item) => (
                  <div key={item.id} style={{ ...styles.notifItem, opacity: item.unread ? 1 : 0.65 }}>
                    <span style={{ ...styles.notifDot, backgroundColor: item.color }} />
                    <div>
                      <div style={styles.notifText}>{item.title}</div>
                      <div style={styles.notifDetail}>{item.detail}</div>
                      <div style={styles.notifTime}>{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button style={styles.linkFooter} onClick={() => openSearchResult('/admin/activity')}>
                View All Notifications
              </button>
            </div>
          )}
        </div>

        <div ref={profileRef} style={styles.avatarWrap}>
          <button
            style={styles.profileBtn}
            onClick={() => {
              setNotifOpen(false);
              setProfileOpen((current) => !current);
            }}
            aria-label="Open profile menu"
          >
            <div style={styles.avatar}>{firstName.charAt(0).toUpperCase()}</div>
            <div style={styles.userMeta}>
              <span style={styles.userName}>{firstName}</span>
              <span style={styles.userRole}>{roleLabel}</span>
            </div>
          </button>

          {profileOpen && (
            <div style={styles.profileDropdown}>
              <div style={styles.profileHead}>
                <div style={styles.profileName}>{firstName}</div>
                <div style={styles.profileRole}>{roleLabel}</div>
              </div>
              <div style={styles.profileList}>
                {profileMenu.map((item) => (
                  <button key={item.label} style={styles.profileItem} onClick={() => openSearchResult(item.to)}>
                    {item.label}
                  </button>
                ))}
              </div>
              <button style={styles.logoutBtn} onClick={() => {
                dispatch(logout());
                navigate('/login');
              }}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const styles = {
  navbar: {
    height: '72px',
    backgroundColor: '#0f172a',
    borderBottom: '1px solid rgba(148,163,184,0.12)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    gap: '16px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    flexShrink: 0,
  },
  menuBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', padding: '8px',
    borderRadius: '10px',
  },
  breadcrumb: {
    display: 'flex', alignItems: 'center', gap: '16px', flex: '0 0 auto',
  },
  pageKicker: { fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.16em' },
  pageTitle: { fontSize: '16px', color: '#f8fafc', fontWeight: '700' },
  breadcrumbRole: {
    fontSize: '12px', color: '#818cf8', fontWeight: '700',
    backgroundColor: 'rgba(99,102,241,0.12)', padding: '6px 10px', borderRadius: '999px',
  },
  searchWrap: {
    position: 'relative', flex: 1, maxWidth: '520px',
  },
  searchInput: {
    width: '100%', padding: '12px 14px', backgroundColor: '#111827', border: '1px solid #334155', borderRadius: '12px', color: '#f1f5f9', outline: 'none', fontSize: '14px',
  },
  searchDropdown: {
    position: 'absolute', top: '52px', left: 0, right: 0, backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px', boxShadow: '0 20px 40px rgba(0,0,0,0.35)', overflow: 'hidden', zIndex: 200,
  },
  dropdownHeader: { padding: '12px 14px', borderBottom: '1px solid #334155', fontSize: '12px', color: '#64748b', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' },
  emptyState: { padding: '16px 14px', color: '#94a3b8', fontSize: '13px' },
  resultItem: { width: '100%', display: 'flex', gap: '12px', alignItems: 'flex-start', padding: '12px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' },
  resultDot: { width: '10px', height: '10px', borderRadius: '50%', marginTop: '5px', flexShrink: 0 },
  resultBody: { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 },
  resultType: { fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em' },
  resultTitle: { fontSize: '14px', color: '#f8fafc', fontWeight: '600' },
  resultDetail: { fontSize: '12px', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  right: { display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' },
  notifWrap: { position: 'relative' },
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '40px', height: '40px', borderRadius: '12px',
    backgroundColor: '#1e293b', position: 'relative',
  },
  badge: {
    position: 'absolute', top: '4px', right: '4px', minWidth: '18px', height: '18px', borderRadius: '999px',
    backgroundColor: '#f87171', color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', fontWeight: '700',
  },
  notifDropdown: {
    position: 'absolute', right: 0, top: '50px',
    width: '340px', backgroundColor: '#1e293b',
    border: '1px solid #334155', borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    overflow: 'hidden', zIndex: 200,
  },
  notifHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    gap: '12px', padding: '14px 16px', borderBottom: '1px solid #334155',
  },
  notifTitle: { fontSize: '14px', fontWeight: '700', color: '#f8fafc', display: 'block' },
  notifCount: { fontSize: '11px', color: '#818cf8', fontWeight: '700', display: 'inline-block', marginTop: '4px' },
  markReadBtn: { border: 'none', background: 'rgba(99,102,241,0.14)', color: '#c7d2fe', borderRadius: '999px', padding: '6px 10px', fontSize: '12px', cursor: 'pointer', fontWeight: '700' },
  notifList: { maxHeight: '320px', overflowY: 'auto' },
  notifItem: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
    padding: '12px 16px', borderBottom: '1px solid #1e293b',
  },
  notifDot: {
    width: '10px', height: '10px', borderRadius: '50%', marginTop: '5px', flexShrink: 0,
  },
  notifText: { fontSize: '13px', color: '#f8fafc', lineHeight: '1.35', fontWeight: '600' },
  notifDetail: { fontSize: '12px', color: '#94a3b8', marginTop: '3px' },
  notifTime: { fontSize: '11px', color: '#64748b', marginTop: '4px' },
  linkFooter: { width: '100%', padding: '12px 16px', textAlign: 'center', fontSize: '13px', color: '#818cf8', fontWeight: '700', cursor: 'pointer', background: 'none', border: 'none', borderTop: '1px solid #334155' },
  avatarWrap: { position: 'relative' },
  profileBtn: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '6px 10px', borderRadius: '12px',
    backgroundColor: '#1e293b', cursor: 'pointer',
    border: '1px solid rgba(148,163,184,0.08)',
  },
  avatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '12px', fontWeight: '700', color: '#fff',
  },
  userMeta: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  userName: { fontSize: '13px', fontWeight: '700', color: '#e2e8f0', lineHeight: 1.1 },
  userRole: { fontSize: '11px', color: '#64748b', textTransform: 'capitalize' },
  profileDropdown: {
    position: 'absolute', right: 0, top: '50px', width: '230px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', overflow: 'hidden', zIndex: 200,
  },
  profileHead: { padding: '14px 16px', borderBottom: '1px solid #334155' },
  profileName: { color: '#f8fafc', fontSize: '14px', fontWeight: '700' },
  profileRole: { color: '#818cf8', fontSize: '12px', marginTop: '3px', fontWeight: '600' },
  profileList: { display: 'flex', flexDirection: 'column' },
  profileItem: { width: '100%', textAlign: 'left', padding: '11px 16px', background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '13px' },
  logoutBtn: { width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '13px', fontWeight: '700', borderTop: '1px solid #334155' },
};
