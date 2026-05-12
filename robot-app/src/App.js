import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './store/store';
import Navbar from './components/Navbar';
import RobotStatus from './components/RobotStatus';
import Home from './pages/Home';
import PersonalityPage from './pages/PersonalityPage';
import ChatPage from './pages/ChatPage';
import ControlPage from './pages/ControlPage';
import DemoPage from './pages/DemoPage';
// import VoiceTestPage from './pages/VoiceTestPage';

function App() {
  // const initWebSocket = useStore((state) => state.initWebSocket);

  // useEffect(() => {
  //   initWebSocket();
  //   return () => {
  //     const disconnect = useStore.getState().disconnectWebSocket;
  //     disconnect();
  //   };
  // }, [initWebSocket]);

  return (
    <BrowserRouter>
      <div style={styles.app}>
        <Navbar />
        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/personality" element={<PersonalityPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/control" element={<ControlPage />} />
            <Route path="/demo" element={<DemoPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0f',
    position: 'relative',
    overflow: 'hidden',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    position: 'relative',
    zIndex: 1,
  },
};

export default App;
