import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.navInner}>
        <div style={styles.brand}>
          <img src="/logo.jpg" alt="bu-zhai" style={styles.logo} />
          <div style={styles.brandText}>
            <span style={styles.brandName}>bu-zhai</span>
            <span style={styles.brandSubtitle}>ON-CHAIN COMPANION</span>
          </div>
        </div>
        <div style={styles.links}>
          <Link
            to="/"
            style={{
              ...styles.link,
              ...(isActive('/') ? styles.activeLink : {}),
            }}
          >
            HOME
          </Link>
          <Link
            to="/personality"
            style={{
              ...styles.link,
              ...(isActive('/personality') ? styles.activeLink : {}),
            }}
          >
            PERSONALITY
          </Link>
          <Link
            to="/chat"
            style={{
              ...styles.link,
              ...(isActive('/chat') ? styles.activeLink : {}),
            }}
          >
            CHAT
          </Link>
          <Link
            to="/control"
            style={{
              ...styles.link,
              ...(isActive('/control') ? styles.activeLink : {}),
            }}
          >
            CONTROL
          </Link>
          <Link
            to="/demo"
            style={{
              ...styles.link,
              ...(isActive('/demo') ? styles.activeLink : {}),
            }}
          >
            DEMO
          </Link>
        </div>
      </div>
      <div style={styles.neonLine} />
    </nav>
  );
}

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backgroundColor: 'rgba(10, 10, 15, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(0, 255, 255, 0.1)',
  },
  navInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    height: '64px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  neonLine: {
    height: '1px',
    background: 'linear-gradient(90deg, transparent, #00ffff, #a855f7, transparent)',
    animation: 'pulse 3s ease-in-out infinite',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    filter: 'drop-shadow(0 0 8px rgba(0, 255, 255, 0.5))',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '3px',
    textShadow: '0 0 10px rgba(0, 255, 255, 0.5)',
  },
  brandSubtitle: {
    fontSize: '9px',
    color: '#00ffff',
    letterSpacing: '3px',
    fontWeight: '600',
  },
  links: {
    display: 'flex',
    gap: '8px',
  },
  link: {
    color: '#666',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '0',
    transition: 'all 0.3s ease',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    border: '1px solid transparent',
    position: 'relative',
  },
  activeLink: {
    color: '#00ffff',
    borderColor: 'rgba(0, 255, 255, 0.3)',
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    textShadow: '0 0 8px rgba(0, 255, 255, 0.5)',
  },
};

export default Navbar;
