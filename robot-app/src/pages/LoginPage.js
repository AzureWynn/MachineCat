import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Connection } from '@solana/web3.js';

const API_BASE = '/api';
const SOLANA_RPC_URL = 'https://api.devnet.solana.com';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

function LoginPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('wallet');
  const [walletAddress, setWalletAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google login is not configured. Please use wallet or email login.');
      return;
    }

    const redirectUri = window.location.origin + '/login';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=token&scope=openid%20email%20profile`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        handleGoogleCallback(accessToken);
      }
    }
  }, []);

  const handleGoogleCallback = async (token) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleToken: token }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        navigate('/', { replace: true });
      } else {
        setError(result.error || 'Google login failed');
      }
    } catch (err) {
      setError('Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getWalletProvider = () => {
    if (window.okxwallet?.solana) return { provider: window.okxwallet.solana, name: 'OKX Wallet' };
    if (window.okxwallet) return { provider: window.okxwallet, name: 'OKX Wallet' };
    if (window.solana && window.solana.isPhantom) return { provider: window.solana, name: 'Phantom' };
    if (window.solana) return { provider: window.solana, name: 'Solana' };
    return { provider: null, name: null };
  };

  const connectWallet = async () => {
    setLoading(true);
    setError('');

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const currentUrl = window.location.href;

    const { provider, name } = getWalletProvider();

    if (provider) {
      try {
        const response = await provider.connect();
        const address = response.publicKey.toString();
        setWalletAddress(address);
        await handleWalletLogin(address, provider);
      } catch (err) {
        setError('Wallet connection cancelled');
        setLoading(false);
      }
    } else if (isMobile && !isLocalhost) {
      const encodedUrl = encodeURIComponent(currentUrl);
      window.location.href = `https://www.okx.com/download?deeplink=${encodedUrl}`;
    } else {
      window.open('https://www.okx.com/download', '_blank');
      setError('Please install OKX Wallet or Phantom');
      setLoading(false);
    }
  };

  const handleWalletLogin = async (address, provider) => {
    try {
      const nonceResponse = await fetch(`${API_BASE}/auth/nonce`);
      const nonceResult = await nonceResponse.json();

      if (!nonceResult.success) {
        throw new Error('Failed to get nonce');
      }

      const message = nonceResult.data.message;
      const messageBytes = new TextEncoder().encode(message);
      const signed = await provider.signMessage(messageBytes, 'utf8');

      const bs58 = await import('bs58');
      const signature = bs58.default.encode(signed.signature);

      const loginResponse = await fetch(`${API_BASE}/auth/solana`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          signature,
          message,
        }),
      });

      const loginResult = await loginResponse.json();

      if (loginResult.success) {
        localStorage.setItem('token', loginResult.data.token);
        localStorage.setItem('user', JSON.stringify(loginResult.data.user));
        navigate('/', { replace: true });
      } else {
        setError(loginResult.error || 'Wallet login failed');
      }
    } catch (err) {
      setError(err.message || 'Wallet login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (isRegister && !nickname) {
      setError('Please enter a nickname');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/auth/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          nickname: isRegister ? nickname : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        navigate('/', { replace: true });
      } else {
        setError(result.error || 'Email login failed');
      }
    } catch (err) {
      setError('Email login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>[ LOGIN ]</h1>

        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'wallet' ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab('wallet')}
          >
            WALLET
          </button>
          <button
            style={{
              ...styles.tab,
              ...(activeTab === 'email' ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab('email')}
          >
            EMAIL
          </button>
          {GOOGLE_CLIENT_ID && (
            <button
              style={{
                ...styles.tab,
                ...(activeTab === 'google' ? styles.tabActive : {}),
              }}
              onClick={() => setActiveTab('google')}
            >
              GOOGLE
            </button>
          )}
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {activeTab === 'wallet' && (
          <div style={styles.section}>
            <p style={styles.description}>Connect your Solana wallet to login</p>
            <button
              style={styles.primaryBtn}
              onClick={connectWallet}
              disabled={loading}
            >
              {loading ? '[ CONNECTING... ]' : '[ CONNECT WALLET ]'}
            </button>
          </div>
        )}

        {activeTab === 'google' && (
          <div style={styles.section}>
            <p style={styles.description}>Login with your Google account</p>
            <button
              style={styles.primaryBtn}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? '[ REDIRECTING... ]' : '[ LOGIN WITH GOOGLE ]'}
            </button>
          </div>
        )}

        {activeTab === 'email' && (
          <form style={styles.section} onSubmit={handleEmailLogin}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="your@email.com"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                placeholder="Enter password"
                required
              />
            </div>

            {isRegister && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Nickname</label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  style={styles.input}
                  placeholder="Your nickname"
                />
              </div>
            )}

            <button
              type="submit"
              style={styles.primaryBtn}
              disabled={loading}
            >
              {loading ? '[ PROCESSING... ]' : isRegister ? '[ REGISTER ]' : '[ LOGIN ]'}
            </button>

            <button
              type="button"
              style={styles.switchBtn}
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a0a0f',
    padding: '20px',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    padding: '40px',
    maxWidth: '450px',
    width: '100%',
  },
  title: {
    color: '#00ffff',
    fontSize: '24px',
    fontWeight: '700',
    fontFamily: 'Courier New, monospace',
    letterSpacing: '4px',
    textAlign: 'center',
    marginBottom: '32px',
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  },
  tab: {
    flex: 1,
    padding: '10px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    color: '#666',
    fontSize: '12px',
    fontWeight: '600',
    fontFamily: 'Courier New, monospace',
    cursor: 'pointer',
    letterSpacing: '2px',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    borderColor: 'rgba(0, 255, 255, 0.5)',
    color: '#00ffff',
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
  },
  error: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    border: '1px solid rgba(255, 107, 107, 0.3)',
    color: '#FF6B6B',
    padding: '12px',
    fontSize: '12px',
    marginBottom: '16px',
    fontFamily: 'Courier New, monospace',
  },
  section: {
    textAlign: 'center',
  },
  description: {
    color: '#888',
    fontSize: '14px',
    marginBottom: '24px',
    fontFamily: 'Courier New, monospace',
  },
  primaryBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    border: '1px solid rgba(0, 255, 255, 0.5)',
    color: '#00ffff',
    fontSize: '14px',
    fontWeight: '700',
    fontFamily: 'Courier New, monospace',
    cursor: 'pointer',
    letterSpacing: '2px',
    transition: 'all 0.2s ease',
  },
  formGroup: {
    marginBottom: '16px',
    textAlign: 'left',
  },
  label: {
    display: 'block',
    color: '#00ffff',
    fontSize: '10px',
    fontWeight: '700',
    fontFamily: 'Courier New, monospace',
    letterSpacing: '2px',
    marginBottom: '8px',
    textTransform: 'uppercase',
  },
  input: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(0, 255, 255, 0.2)',
    color: '#e0e0e0',
    fontSize: '14px',
    fontFamily: 'Courier New, monospace',
    outline: 'none',
    boxSizing: 'border-box',
  },
  switchBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#888',
    fontSize: '12px',
    fontFamily: 'Courier New, monospace',
    cursor: 'pointer',
    marginTop: '16px',
    textDecoration: 'underline',
  },
};

export default LoginPage;
