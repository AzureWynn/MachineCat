import { useState, useEffect, useRef } from 'react';

function VoiceTestPage() {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [testText, setTestText] = useState('你好，我是机器猫，很高兴认识你！');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.2);
  const [volume, setVolume] = useState(1.0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthRef = useRef(window.speechSynthesis);

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = speechSynthRef.current.getVoices();
      const zhVoices = allVoices.filter(v => v.lang.startsWith('zh'));
      setVoices(zhVoices);
      if (zhVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(zhVoices[0]);
      }
      console.log('[VoiceTest] Available voices:', allVoices.map(v => `${v.name} (${v.lang})`));
      console.log('[VoiceTest] Chinese voices:', zhVoices.map(v => `${v.name} (${v.lang})`));
    };

    loadVoices();
    speechSynthRef.current.onvoiceschanged = loadVoices;

    return () => {
      speechSynthRef.current.onvoiceschanged = null;
    };
  }, []);

  const speak = () => {
    if (!selectedVoice || !testText) return;

    speechSynthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(testText);
    utterance.voice = selectedVoice;
    utterance.lang = selectedVoice.lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechSynthRef.current.speak(utterance);
  };

  const stop = () => {
    speechSynthRef.current.cancel();
    setIsSpeaking(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}> 语音测试</h2>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>选择声线 ({voices.length} 个可用)</h3>
        <div style={styles.voiceList}>
          {voices.map((voice, index) => (
            <button
              key={index}
              onClick={() => setSelectedVoice(voice)}
              style={{
                ...styles.voiceBtn,
                backgroundColor: selectedVoice === voice ? '#1976d2' : '#f5f5f5',
                color: selectedVoice === voice ? 'white' : '#333',
              }}
            >
              <div style={styles.voiceName}>{voice.name}</div>
              <div style={styles.voiceLang}>{voice.lang}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>测试文本</h3>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          style={styles.textarea}
          rows={3}
        />
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>参数调节</h3>
        
        <div style={styles.paramRow}>
          <label style={styles.paramLabel}>语速: {rate.toFixed(1)}</label>
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            style={styles.slider}
          />
        </div>

        <div style={styles.paramRow}>
          <label style={styles.paramLabel}>音调: {pitch.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            value={pitch}
            onChange={(e) => setPitch(parseFloat(e.target.value))}
            style={styles.slider}
          />
        </div>

        <div style={styles.paramRow}>
          <label style={styles.paramLabel}>音量: {volume.toFixed(1)}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={styles.slider}
          />
        </div>
      </div>

      <div style={styles.buttonGroup}>
        <button
          onClick={speak}
          disabled={isSpeaking || !selectedVoice}
          style={{
            ...styles.playBtn,
            opacity: isSpeaking || !selectedVoice ? 0.5 : 1,
          }}
        >
          {isSpeaking ? '🔊 播放中...' : '▶️ 试听'}
        </button>
        <button
          onClick={stop}
          style={styles.stopBtn}
        >
          ️ 停止
        </button>
      </div>

      {selectedVoice && (
        <div style={styles.info}>
          <strong>当前声线:</strong> {selectedVoice.name} ({selectedVoice.lang})
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
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
  section: {
    marginBottom: '25px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
  },
  sectionTitle: {
    margin: '0 0 15px 0',
    color: '#555',
    fontSize: '16px',
  },
  voiceList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '10px',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  voiceBtn: {
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s',
  },
  voiceName: {
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '4px',
  },
  voiceLang: {
    fontSize: '12px',
    opacity: 0.7,
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  paramRow: {
    marginBottom: '15px',
  },
  paramLabel: {
    display: 'block',
    marginBottom: '5px',
    fontSize: '14px',
    color: '#555',
  },
  slider: {
    width: '100%',
    cursor: 'pointer',
  },
  buttonGroup: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  playBtn: {
    padding: '12px 30px',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  stopBtn: {
    padding: '12px 30px',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  info: {
    padding: '10px',
    backgroundColor: '#e3f2fd',
    borderRadius: '4px',
    textAlign: 'center',
    color: '#1976d2',
  },
};

export default VoiceTestPage;
