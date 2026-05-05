class WSClient {
  constructor(url) {
    const host = window.location.hostname;
    const port = process.env.REACT_APP_WS_PORT || '3002';
    this.url = url || `wss://${host}:${port}`;
    this.ws = null;
    this.reconnectTimer = null;
    this.messageHandlers = [];
    this.statusHandlers = [];
  }

  connect() {
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('[WSClient] Connected to server');
      this.updateStatus('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.messageHandlers.forEach(handler => handler(data));
      } catch (error) {
        console.error('[WSClient] Error parsing message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('[WSClient] Disconnected, reconnecting in 5s...');
      this.updateStatus('disconnected');
      this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    };

    this.ws.onerror = (error) => {
      console.error('[WSClient] WebSocket error:', error);
    };
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    if (this.ws) {
      this.ws.close();
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[WSClient] Not connected, cannot send message');
    }
  }

  onMessage(handler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onStatusChange(handler) {
    this.statusHandlers.push(handler);
    return () => {
      this.statusHandlers = this.statusHandlers.filter(h => h !== handler);
    };
  }

  updateStatus(status) {
    this.statusHandlers.forEach(handler => handler(status));
  }

  getStatus() {
    if (!this.ws) return 'disconnected';
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }
}

export default WSClient;
