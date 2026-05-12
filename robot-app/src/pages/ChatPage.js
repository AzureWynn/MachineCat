import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/store';
import { interactionAPI } from '../services/api';

function ChatPage() {
  const { currentRobotId, personality, messages, addMessage, clearMessages } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMode, setRecordingMode] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput((prev) => prev + transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert('麦克风权限被拒绝，请在浏览器设置中允许麦克风访问');
        }
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      setRecordingMode('browser');
      console.log('[Voice] Using browser SpeechRecognition');
    } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setRecordingMode('media');
      console.log('[Voice] Using MediaRecorder (server STT)');
    } else {
      setRecordingMode('none');
      console.log('[Voice] No voice input support');
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const startMediaRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());

        try {
          const formData = new FormData();
          formData.append('audio', audioBlob, 'recording.webm');

          const response = await fetch('/api/speech-to-text', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            setInput((prev) => prev + data.text);
          }
        } catch (error) {
          console.error('Speech-to-text failed:', error);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('无法访问麦克风，请检查权限设置');
    }
  };

  const toggleRecording = () => {
    if (recordingMode === 'none') {
      alert('您的浏览器不支持语音输入');
      return;
    }

    if (isRecording) {
      if (recordingMode === 'browser') {
        try {
          recognitionRef.current?.stop();
        } catch (e) {
          console.warn('Error stopping recognition:', e);
        }
      } else {
        mediaRecorderRef.current?.stop();
      }
      setIsRecording(false);
    } else {
      if (recordingMode === 'browser') {
        try {
          recognitionRef.current?.start();
          setIsRecording(true);
        } catch (e) {
          console.warn('Error starting recognition:', e);
          setIsRecording(false);
        }
      } else {
        startMediaRecording();
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !currentRobotId || loading) return;

    const userMessage = { role: 'user', content: input, timestamp: new Date() };
    addMessage(userMessage);
    setInput('');
    setLoading(true);

    try {
      const response = await interactionAPI.chat(currentRobotId, input);
      const botMessage = {
        role: 'bot',
        content: response.data.responseText,
        actions: response.data.actions,
        timestamp: new Date(),
      };
      addMessage(botMessage);
    } catch (error) {
      const errorMessage = {
        role: 'system',
        content: '发送失败：' + (error.response?.data?.error || error.message),
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}></span>
          <h3 style={styles.title}>
            {personality ? `${personality.name}` : 'CHAT'}
          </h3>
        </div>
        {messages.length > 0 && (
          <button onClick={clearMessages} style={styles.clearBtn}>
            CLEAR
          </button>
        )}
      </div>

      {!currentRobotId && (
        <div style={styles.warning}>
          [ WARNING ] 请先在"个性设置"页面创建或选择一个机器人
        </div>
      )}

      <div style={styles.messages}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              ...styles.messageBubble,
              ...(msg.role === 'user' ? styles.userMessage : msg.role === 'system' ? styles.systemMessage : styles.botMessage),
            }}
          >
            <div style={styles.messageContent}>
              {msg.content}
            </div>
            {msg.actions && msg.actions.length > 0 && (
              <div style={styles.actions}>
                <span style={styles.actionsLabel}>ACTIONS:</span>
                {msg.actions.map((action, i) => (
                  <span key={i} style={styles.actionTag}>
                    {action.action}({JSON.stringify(action.params)})
                  </span>
                ))}
              </div>
            )}
            <div style={styles.timestamp}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.messageBubble, ...styles.botMessage }}>
            <div style={styles.typing}>[ THINKING... ]</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputArea}>
        {recordingMode !== 'none' && (
          <button
            onClick={toggleRecording}
            style={{
              ...styles.micBtn,
              backgroundColor: isRecording ? '#ef4444' : '#333',
              borderColor: isRecording ? 'rgba(239, 68, 68, 0.5)' : 'rgba(0, 255, 255, 0.3)',
            }}
            title={isRecording ? '停止录音' : '语音输入'}
          >
            {isRecording ? '🔴' : '🎤'}
          </button>
        )}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isRecording ? '[ RECORDING... ]' : '输入消息...'}
          style={styles.input}
          disabled={!currentRobotId || loading}
        />
        <button
          onClick={handleSend}
          style={{
            ...styles.sendBtn,
            opacity: !input.trim() || !currentRobotId || loading ? 0.5 : 1,
          }}
          disabled={!input.trim() || !currentRobotId || loading}
        >
          SEND
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(0, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: '70vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid rgba(0, 255, 255, 0.1)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  headerIcon: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#00ffff',
    boxShadow: '0 0 8px rgba(0, 255, 255, 0.6)',
  },
  title: {
    margin: 0,
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '600',
    letterSpacing: '2px',
  },
  clearBtn: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    color: '#666',
    cursor: 'pointer',
    fontSize: '11px',
    letterSpacing: '2px',
    transition: 'all 0.3s ease',
  },
  warning: {
    padding: '15px 20px',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    border: '1px solid rgba(234, 179, 8, 0.3)',
    color: '#eab308',
    textAlign: 'center',
    fontSize: '12px',
    fontFamily: 'Courier New, monospace',
    letterSpacing: '1px',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: '12px 16px',
    borderRadius: '0',
    wordBreak: 'break-word',
    border: '1px solid',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderColor: 'rgba(0, 255, 255, 0.2)',
    color: '#e0e0e0',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(168, 85, 247, 0.05)',
    borderColor: 'rgba(168, 85, 247, 0.2)',
    color: '#e0e0e0',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    textAlign: 'center',
  },
  messageContent: {
    marginBottom: '5px',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px dashed rgba(0, 255, 255, 0.2)',
  },
  actionsLabel: {
    fontSize: '10px',
    color: '#00ffff',
    letterSpacing: '1px',
    fontWeight: '600',
  },
  actionTag: {
    fontSize: '10px',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    color: '#00ffff',
    padding: '2px 6px',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    fontFamily: 'Courier New, monospace',
  },
  timestamp: {
    fontSize: '10px',
    color: '#555',
    textAlign: 'right',
    marginTop: '5px',
    fontFamily: 'Courier New, monospace',
  },
  typing: {
    color: '#00ffff',
    fontStyle: 'italic',
    fontSize: '13px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  inputArea: {
    display: 'flex',
    padding: '15px',
    borderTop: '1px solid rgba(0, 255, 255, 0.1)',
    gap: '10px',
  },
  micBtn: {
    padding: '10px 15px',
    color: 'white',
    border: '1px solid',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
  },
  input: {
    flex: 1,
    padding: '12px',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    color: '#ffffff',
    fontSize: '14px',
    fontFamily: 'Courier New, monospace',
    outline: 'none',
  },
  sendBtn: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#00ffff',
    border: '1px solid rgba(0, 255, 255, 0.4)',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '2px',
    transition: 'all 0.3s ease',
  },
};

export default ChatPage;
