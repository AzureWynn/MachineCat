import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>🤖 机器猫平台</div>
      <div style={styles.links}>
        <Link
          to="/"
          style={{
            ...styles.link,
            ...(isActive('/') ? styles.activeLink : {}),
          }}
        >
          首页
        </Link>
        <Link
          to="/personality"
          style={{
            ...styles.link,
            ...(isActive('/personality') ? styles.activeLink : {}),
          }}
        >
          个性设置
        </Link>
        <Link
          to="/chat"
          style={{
            ...styles.link,
            ...(isActive('/chat') ? styles.activeLink : {}),
          }}
        >
          聊天
        </Link>
        <Link
          to="/control"
          style={{
            ...styles.link,
            ...(isActive('/control') ? styles.activeLink : {}),
          }}
        >
          控制调试
        </Link>
        {/* <Link
          to="/voice-test"
          style={{
            ...styles.link,
            ...(isActive('/voice-test') ? styles.activeLink : {}),
          }}
        >
          语音测试
        </Link> */}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    backgroundColor: '#1976d2',
    color: 'white',
    height: '60px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logo: {
    fontSize: '20px',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '20px',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  activeLink: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
};

export default Navbar;
