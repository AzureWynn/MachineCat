import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <img src="/logo1.png" alt="bu-zhai" style={styles.logo} />
        <div style={styles.brandText}>
          <span style={styles.brandName}>bu-zhai</span>
          <span style={styles.brandSubtitle}>ON-CHAIN COMPANION</span>
        </div>
      </div>
      <div style={styles.links}>
        <Link
          to="/demo"
          style={{
            ...styles.link,
            ...(isActive('/demo') ? styles.activeLink : {}),
          }}
        >
          Demo
        </Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 24px',
    backgroundColor: '#1a1a1a',
    height: '64px',
    borderBottom: '2px solid #00D4FF',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    width: '36px',
    height: '36px',
    borderRadius: '0',
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
    letterSpacing: '2px',
  },
  brandSubtitle: {
    fontSize: '9px',
    color: '#00D4FF',
    letterSpacing: '3px',
    fontWeight: '600',
  },
  links: {
    display: 'flex',
    gap: '20px',
  },
  link: {
    color: '#888',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '0',
    transition: 'all 0.2s',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '2px',
  },
  activeLink: {
    backgroundColor: '#00D4FF',
    color: '#1a1a1a',
  },
};

export default Navbar;
