import { Link } from 'react-router-dom';
import { useStore } from '../store/store';

function Home() {
  const { wsStatus, currentRobotId, personality } = useStore();

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>MACHINECAT</h1>
        <p style={styles.subtitle}>Cross-Chain Privacy Payment Smart Robot Cat Platform</p>
        <p style={styles.tagline}>&lt;Giving each physical robot cat a unique "soul" /&gt;</p>
      </div>

      <div style={styles.cards}>
        <div style={styles.card}>
          <div style={styles.cardIcon}>🎨</div>
          <h3 style={styles.cardTitle}>Personality</h3>
          <p style={styles.cardDesc}>
            Create unique personality
          </p>
          <Link to="/personality" style={styles.cardButton}>
            Setup →
          </Link>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>🔗</div>
          <h3 style={styles.cardTitle}>Cross-Chain Demo</h3>
          <p style={styles.cardDesc}>
            AI tasks & cross-chain payment
          </p>
          <Link to="/demo" style={styles.cardButton}>
            Enter Demo →
          </Link>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>💬</div>
          <h3 style={styles.cardTitle}>AI Chat</h3>
          <p style={styles.cardDesc}>
            Natural language chat
          </p>
          <Link to="/chat" style={styles.cardButton}>
            Start Chat →
          </Link>
        </div>

        <div style={styles.card}>
          <div style={styles.cardIcon}>🎮</div>
          <h3 style={styles.cardTitle}>Robot Control</h3>
          <p style={styles.cardDesc}>
            Send commands to control
          </p>
          <Link to="/control" style={styles.cardButton}>
            Control Panel →
          </Link>
        </div>
      </div>

      {currentRobotId && (
        <div style={styles.currentRobot}>
          <div style={styles.robotHeader}>
            <span style={styles.robotDot} />
            <span style={styles.robotLabel}>CURRENT ROBOT</span>
          </div>
          <div style={styles.robotInfo}>
            <p style={styles.robotId}>ID: {currentRobotId}</p>
            {personality && (
              <>
                <p style={styles.robotName}>🤖 {personality.name}</p>
                <p style={styles.robotType}>TYPE: {personality.type}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '40px 20px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  hero: {
    marginBottom: '50px',
  },
  title: {
    fontSize: 'clamp(36px, 8vw, 72px)',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '8px',
    marginBottom: '15px',
    textShadow: '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.2)',
  },
  subtitle: {
    fontSize: 'clamp(14px, 3vw, 20px)',
    color: '#00ffff',
    letterSpacing: '4px',
    marginBottom: '10px',
    textShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
  },
  tagline: {
    fontSize: '13px',
    color: '#555',
    fontFamily: 'Courier New, monospace',
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '40px',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(0, 255, 255, 0.1)',
    padding: '30px 20px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '220px',
  },
  cardIcon: {
    fontSize: '36px',
    marginBottom: '15px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#00ffff',
    marginBottom: '12px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  cardDesc: {
    color: '#888',
    marginBottom: '20px',
    lineHeight: '1.6',
    fontSize: '13px',
  },
  cardButton: {
    display: 'inline-block',
    padding: '8px 20px',
    color: '#00ffff',
    textDecoration: 'none',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    border: '1px solid rgba(0, 255, 255, 0.3)',
    transition: 'all 0.3s ease',
  },
  currentRobot: {
    backgroundColor: 'rgba(0, 255, 255, 0.03)',
    border: '1px solid rgba(0, 255, 255, 0.15)',
    padding: '20px',
    maxWidth: '400px',
    margin: '0 auto',
  },
  robotHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  robotDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#22c55e',
    boxShadow: '0 0 8px rgba(34, 197, 94, 0.6)',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  robotLabel: {
    fontSize: '11px',
    color: '#22c55e',
    letterSpacing: '2px',
    fontWeight: '600',
  },
  robotInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  robotId: {
    fontSize: '12px',
    color: '#666',
    fontFamily: 'Courier New, monospace',
    margin: 0,
  },
  robotName: {
    fontSize: '18px',
    color: '#ffffff',
    margin: 0,
  },
  robotType: {
    fontSize: '12px',
    color: '#a855f7',
    letterSpacing: '2px',
    margin: 0,
  },
};

export default Home;
