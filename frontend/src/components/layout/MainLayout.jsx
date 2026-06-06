import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const updateLayoutMode = (event) => {
      const mobile = event.matches;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };

    updateLayoutMode(mediaQuery);
    mediaQuery.addEventListener('change', updateLayoutMode);

    return () => mediaQuery.removeEventListener('change', updateLayoutMode);
  }, []);

  const sidebarWidth = sidebarCollapsed ? '68px' : '240px';
  const marginLeft = isMobile ? '0' : sidebarWidth;

  return (
    <div style={styles.root}>
      <Sidebar collapsed={sidebarCollapsed} isMobile={isMobile} />
      <div style={{ ...styles.main, marginLeft }}>
        <Navbar onMenuToggle={() => setSidebarCollapsed((current) => !current)} />
        <div style={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#0a0f1e',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
    transition: 'margin-left 0.3s ease',
  },
  content: {
    flex: 1,
    padding: '28px',
    overflowY: 'auto',
  },
};
