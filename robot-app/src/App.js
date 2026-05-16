import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './store/store';
import Navbar from './components/Navbar';
import RobotStatus from './components/RobotStatus';
import Home from './pages/Home';
import PersonalityPage from './pages/PersonalityPage';
import ChatPage from './pages/ChatPage';
import ControlPage from './pages/ControlPage';
import DemoPage from './pages/DemoPage';
import DeFiPage from './pages/DeFiPage';
import LoginPage from './pages/LoginPage';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Layout() {
  return (
    <>
      <Navbar />
      <main style={styles.main}>
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div style={styles.app}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="personality" element={<PersonalityPage />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="control" element={<ControlPage />} />
            <Route path="demo" element={<DemoPage />} />
            <Route path="defi" element={<DeFiPage />} />
          </Route>
        </Routes>
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
