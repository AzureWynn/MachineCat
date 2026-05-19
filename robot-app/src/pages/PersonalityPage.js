import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { personalityAPI, staticDataAPI } from '../services/api';

function PersonalityPage() {
  const navigate = useNavigate();
  const { currentRobotId, setCurrentRobotId, currentRobotName, setCurrentRobotName, setPersonality } = useStore();

  const [robotTypes, setRobotTypes] = useState([]);
  const [traits, setTraits] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [formData, setFormData] = useState({
    robotId: currentRobotId || '',
    name: currentRobotName || '',
    type: '',
    traits: {},
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    loadStaticData();
  }, []);

  const loadStaticData = async () => {
    try {
      const [typesRes, traitsRes] = await Promise.all([
        staticDataAPI.getRobotTypes(),
        staticDataAPI.getTraits(),
      ]);
      setRobotTypes(typesRes.data);
      setTraits(traitsRes.data);

      const defaultTraits = {};
      traitsRes.data.forEach(t => {
        defaultTraits[t.name] = t.defaultValue;
      });

      setFormData(prev => ({
        ...prev,
        type: typesRes.data[0]?.code || '',
        traits: defaultTraits,
      }));
    } catch (error) {
      console.error('Failed to load static data:', error);
      setMessage('加载数据失败');
    } finally {
      setDataLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTraitChange = (traitCode, value) => {
    setFormData((prev) => ({
      ...prev,
      traits: {
        ...prev.traits,
        [traitCode]: parseInt(value),
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { robotId, ...data } = formData;
      const response = await personalityAPI.createOrUpdate(robotId, data);
      setCurrentRobotId(robotId);
      setCurrentRobotName(formData.name);
      setPersonality(response.data);
      setMessage('个性设置保存成功！');
      setRedirecting(true);
      setTimeout(() => navigate('/defi'), 1500);
    } catch (error) {
      setMessage('保存失败：' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>[ LOADING... ]</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>PERSONALITY</h2>
        <p style={styles.subtitle}>配置机器猫个性参数</p>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>ROBOT ID</label>
          <input
            type="text"
            name="robotId"
            value={formData.robotId}
            onChange={handleChange}
            placeholder="robot-001"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>NAME</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="小喵"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>TYPE</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            style={styles.select}
          >
            {robotTypes.map(type => (
              <option key={type.code} value={type.code}>
                {type.icon} {type.name}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>TRAITS</label>
          {traits.map(trait => (
            <div key={trait.code} style={styles.traitRow}>
              <span style={styles.traitLabel} title={trait.description}>
                {trait.name}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.traits[trait.name] || trait.defaultValue}
                onChange={(e) => handleTraitChange(trait.name, e.target.value)}
                style={styles.slider}
              />
              <span style={styles.traitValue}>
                {formData.traits[trait.name] || trait.defaultValue}%
              </span>
            </div>
          ))}
        </div>

        <button type="submit" style={styles.button} disabled={loading || redirecting}>
          {redirecting ? '[ REDIRECTING... ]' : loading ? '[ SAVING... ]' : '[ SAVE ]'}
        </button>

        {message && (
          <div style={{
            ...styles.message,
            color: message.includes('成功') ? '#22c55e' : '#ef4444',
            borderColor: message.includes('成功') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
          }}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '30px 20px',
  },
  loadingText: {
    textAlign: 'center',
    color: '#00ffff',
    fontFamily: 'Courier New, monospace',
    letterSpacing: '2px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '4px',
    marginBottom: '8px',
    textShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
  },
  subtitle: {
    fontSize: '13px',
    color: '#666',
    letterSpacing: '2px',
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(0, 255, 255, 0.1)',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: '600',
    color: '#00ffff',
    fontSize: '11px',
    letterSpacing: '2px',
  },
  input: {
    padding: '12px',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'Courier New, monospace',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  select: {
    padding: '12px',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'Courier New, monospace',
    outline: 'none',
    cursor: 'pointer',
  },
  traitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  traitLabel: {
    width: '60px',
    color: '#888',
    fontSize: '12px',
    cursor: 'help',
  },
  traitValue: {
    width: '40px',
    textAlign: 'right',
    color: '#00ffff',
    fontWeight: '600',
    fontSize: '12px',
    fontFamily: 'Courier New, monospace',
  },
  slider: {
    flex: 1,
    height: '4px',
    backgroundColor: 'rgba(0, 255, 255, 0.2)',
    borderRadius: '2px',
    outline: 'none',
    appearance: 'none',
  },
  button: {
    padding: '14px',
    backgroundColor: 'transparent',
    color: '#00ffff',
    border: '1px solid rgba(0, 255, 255, 0.4)',
    fontSize: '14px',
    fontWeight: '600',
    letterSpacing: '3px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'Courier New, monospace',
  },
  message: {
    textAlign: 'center',
    padding: '12px',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    border: '1px solid',
    fontSize: '13px',
    fontFamily: 'Courier New, monospace',
  },
};

export default PersonalityPage;
