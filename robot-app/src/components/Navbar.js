import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

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
        <button
          className="navbar-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="navbar-hamburger-line" />
          <span className="navbar-hamburger-line" />
          <span className="navbar-hamburger-line" />
        </button>
        <div className={`navbar-links ${mobileMenuOpen ? 'open' : ''}`} style={styles.navLinks}>
          <Link
            to="/"
            className="navbar-link"
            style={{
              ...styles.link,
              ...(isActive('/') ? styles.activeLink : {}),
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            HOME
          </Link>
          <Link
            to="/personality"
            className="navbar-link"
            style={{
              ...styles.link,
              ...(isActive('/personality') ? styles.activeLink : {}),
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            PERSONALITY
          </Link>
          <Link
            to="/chat"
            className="navbar-link"
            style={{
              ...styles.link,
              ...(isActive('/chat') ? styles.activeLink : {}),
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            CHAT
          </Link>
          <Link
            to="/control"
            className="navbar-link"
            style={{
              ...styles.link,
              ...(isActive('/control') ? styles.activeLink : {}),
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            CONTROL
          </Link>
          <Link
            to="/demo"
            className="navbar-link"
            style={{
              ...styles.link,
              ...(isActive('/demo') ? styles.activeLink : {}),
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            DEMO
          </Link>
          <Link
            to="/defi"
            className="navbar-link"
            style={{
              ...styles.link,
              ...(isActive('/defi') ? styles.activeLink : {}),
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            DeFi
          </Link>
        </div>
        {user && (
          <div
            className={`navbar-user-section ${mobileMenuOpen ? 'mobile-visible' : ''}`}
            style={styles.userSection}
          >
            <span style={styles.userName}>{user.nickname || user.email}</span>
            <button style={styles.logoutBtn} onClick={handleLogout}>
              LOGOUT
            </button>
          </div>
        )}
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
    padding: '0 16px',
    height: '64px',
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    gap: '16px',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: '1',
    justifyContent: 'center',
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
  userSection: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginLeft: '16px',
    paddingLeft: '16px',
    borderLeft: '1px solid rgba(0, 255, 255, 0.2)',
  },
  userName: {
    color: '#00ffff',
    fontSize: '11px',
    fontWeight: '600',
    fontFamily: 'Courier New, monospace',
    letterSpacing: '1px',
  },
  logoutBtn: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    color: '#FF6B6B',
    fontSize: '10px',
    fontWeight: '600',
    fontFamily: 'Courier New, monospace',
    cursor: 'pointer',
    letterSpacing: '2px',
    transition: 'all 0.2s ease',
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
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    position: 'relative',
    whiteSpace: 'nowrap',
  },
  activeLink: {
    color: '#00ffff',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'rgba(0, 255, 255, 0.3)',
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    textShadow: '0 0 8px rgba(0, 255, 255, 0.5)',
  },
};

export default Navbar;
