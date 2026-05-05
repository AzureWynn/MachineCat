import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { personalityAPI, staticDataAPI } from '../services/api';

function PersonalityPage() {
  const navigate = useNavigate();
  const { currentRobotId, setCurrentRobotId, setPersonality } = useStore();

  const [robotTypes, setRobotTypes] = useState([]);
  const [traits, setTraits] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [formData, setFormData] = useState({
    robotId: currentRobotId || '',
    name: '',
    type: '',
    traits: {},
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
      setPersonality(response.data);
      setMessage('个性设置保存成功！');
      setTimeout(() => navigate('/chat'), 1500);
    } catch (error) {
      setMessage('保存失败：' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div style={styles.container}>
        <p style={{ textAlign: 'center', color: '#666' }}>加载中...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>机器人个性设置</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>机器人 ID</label>
          <input
            type="text"
            name="robotId"
            value={formData.robotId}
            onChange={handleChange}
            placeholder="例如：robot-001"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>名字</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="例如：小喵"
            style={styles.input}
            required
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>种类</label>
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
          <label style={styles.label}>性格特征</label>
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

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? '保存中...' : '保存'}
        </button>

        {message && (
          <div style={{
            ...styles.message,
            color: message.includes('成功') ? '#4caf50' : '#f44336',
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
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '30px',
  },
  form: {
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
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  select: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
  },
  traitRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  traitLabel: {
    width: '60px',
    color: '#666',
    cursor: 'help',
  },
  traitValue: {
    width: '40px',
    textAlign: 'right',
    color: '#1976d2',
    fontWeight: 'bold',
  },
  slider: {
    flex: 1,
  },
  button: {
    padding: '12px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  message: {
    textAlign: 'center',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
  },
};

export default PersonalityPage;
