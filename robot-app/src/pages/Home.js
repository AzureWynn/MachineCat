import { Link } from 'react-router-dom';
import { useStore } from '../store/store';

function Home() {
  const { wsStatus, currentRobotId, personality } = useStore();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>欢迎使用机器猫平台</h1>
      <p style={styles.subtitle}>个性化智能交互平台</p>

      <div style={styles.cards}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>1. 设置个性</h3>
          <p style={styles.cardDesc}>
            为你的机器猫创建独特的个性，包括名字、种类和性格特征。
          </p>
          <Link to="/personality" style={styles.button}>
            开始设置
          </Link>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>2. 开始聊天</h3>
          <p style={styles.cardDesc}>
            与你的机器猫进行对话，它会根据个性给出独特的回复和动作。
          </p>
          <Link to="/chat" style={styles.button}>
            进入聊天
          </Link>
        </div>
      </div>

      {currentRobotId && (
        <div style={styles.currentRobot}>
          <h3>当前机器人</h3>
          <p>ID: {currentRobotId}</p>
          {personality && (
            <>
              <p>名字: {personality.name}</p>
              <p>种类: {personality.type}</p>
              {/* <p>品种: {personality.breed}</p> */}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  title: {
    fontSize: '36px',
    color: '#333',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '40px',
  },
  cards: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    flexWrap: 'wrap',
    marginBottom: '40px',
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    width: '300px',
    textAlign: 'center',
  },
  cardTitle: {
    fontSize: '24px',
    color: '#1976d2',
    marginBottom: '15px',
  },
  cardDesc: {
    color: '#666',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  button: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#1976d2',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  currentRobot: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    maxWidth: '400px',
    margin: '0 auto',
  },
};

export default Home;

