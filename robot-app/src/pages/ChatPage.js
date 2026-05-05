import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/store';
import { interactionAPI } from '../services/api';

function ChatPage() {
  const { currentRobotId, personality, messages, addMessage, clearMessages } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMode, setRecordingMode] = useState(null);
  // const [isSpeaking, setIsSpeaking] = useState(false);
  // const [voiceEnabled, setVoiceEnabled] = useState(true);
  // const [voiceIndex, setVoiceIndex] = useState(0);
  // const [availableVoices, setAvailableVoices] = useState([]);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  // const speechSynthRef = useRef(window.speechSynthesis);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // const loadVoices = () => {
    //   const voices = speechSynthRef.current.getVoices();
    //   const zhVoices = voices.filter(v => v.lang.startsWith('zh'));
    //   setAvailableVoices(zhVoices);
    //   console.log('[Voice] Available Chinese voices:', zhVoices.map(v => `${v.name} (${v.lang})`));
    // };

    // loadVoices();
    // speechSynthRef.current.onvoiceschanged = loadVoices;

    // return () => {
    //   speechSynthRef.current.onvoiceschanged = null;
    // };
  }, []);

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
      // speechSynthRef.current?.cancel();
    };
  }, []);

  // const speakText = (text) => {
  //   if (!voiceEnabled || !text) return;

  //   speechSynthRef.current.cancel();

  //   const utterance = new SpeechSynthesisUtterance(text);
  //   utterance.lang = 'zh-CN';
  //   utterance.rate = 1.0;
  //   utterance.pitch = 1.2;
  //   utterance.volume = 1.0;

  //   if (availableVoices.length > 0 && availableVoices[voiceIndex]) {
  //     utterance.voice = availableVoices[voiceIndex];
  //     console.log(`[Voice] Using voice: ${availableVoices[voiceIndex].name}`);
  //   }

  //   utterance.onstart = () => setIsSpeaking(true);
  //   utterance.onend = () => setIsSpeaking(false);
  //   utterance.onerror = () => setIsSpeaking(false);

  //   speechSynthRef.current.speak(utterance);
  // };

  // const switchVoice = () => {
  //   if (availableVoices.length <= 1) return;
  //   setVoiceIndex((prev) => (prev + 1) % availableVoices.length);
  // };

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
      
      // speakText(response.data.responseText);
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
        <h3 style={styles.title}>
          {personality ? `与 ${personality.name} 聊天` : '聊天'}
        </h3>
        {messages.length > 0 && (
          <button onClick={clearMessages} style={styles.clearBtn}>
            清空聊天
          </button>
        )}
      </div>

      {!currentRobotId && (
        <div style={styles.warning}>
          请先在"个性设置"页面创建或选择一个机器人
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
            <div
              style={styles.messageContent}
              // onClick={() => msg.role === 'bot' && speakText(msg.content)}
              // title={msg.role === 'bot' ? '点击重新播放语音' : ''}
            >
              {msg.content}
            </div>
            {msg.actions && msg.actions.length > 0 && (
              <div style={styles.actions}>
                <span style={styles.actionsLabel}>执行动作:</span>
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
            <div style={styles.typing}>思考中...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={styles.inputArea}>
        {/* <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          style={{
            ...styles.voiceToggleBtn,
            backgroundColor: voiceEnabled ? '#4caf50' : '#757575',
          }}
          title={voiceEnabled ? '关闭语音播报' : '开启语音播报'}
        >
          {voiceEnabled ? '' : '🔇'}
        </button>
        {voiceEnabled && availableVoices.length > 1 && (
          <button
            onClick={switchVoice}
            style={styles.voiceSwitchBtn}
            title={`切换声线: ${availableVoices[voiceIndex]?.name || '默认'}`}
          >
            🎵
          </button>
        )} */}
        {recordingMode !== 'none' && (
          <button
            onClick={toggleRecording}
            style={{
              ...styles.micBtn,
              backgroundColor: isRecording ? '#f44336' : '#757575',
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
          placeholder={isRecording ? '正在录音...' : '输入消息...'}
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
          发送
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    height: '70vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid #eee',
  },
  title: {
    margin: 0,
    color: '#333',
  },
  clearBtn: {
    padding: '5px 10px',
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    color: '#666',
  },
  warning: {
    padding: '15px 20px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    textAlign: 'center',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: '10px 15px',
    borderRadius: '12px',
    wordBreak: 'break-word',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1976d2',
    color: 'white',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    color: '#333',
  },
  systemMessage: {
    alignSelf: 'center',
    backgroundColor: '#ffebee',
    color: '#c62828',
    textAlign: 'center',
  },
  messageContent: {
    marginBottom: '5px',
  },
  botMessageContent: {
    marginBottom: '5px',
    cursor: 'pointer',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px dashed #ccc',
  },
  actionsLabel: {
    fontSize: '12px',
    color: '#666',
  },
  actionTag: {
    fontSize: '11px',
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  timestamp: {
    fontSize: '10px',
    opacity: 0.7,
    textAlign: 'right',
    marginTop: '5px',
  },
  typing: {
    color: '#999',
    fontStyle: 'italic',
  },
  inputArea: {
    display: 'flex',
    padding: '15px',
    borderTop: '1px solid #eee',
    gap: '10px',
  },
  voiceToggleBtn: {
    padding: '10px 15px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '18px',
    minWidth: '45px',
  },
  voiceSwitchBtn: {
    padding: '10px 15px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '18px',
    minWidth: '45px',
    backgroundColor: '#2196f3',
  },
  micBtn: {
    padding: '10px 15px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '18px',
  },
  input: {
    flex: 1,
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
  },
  sendBtn: {
    padding: '10px 20px',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
};

export default ChatPage;
