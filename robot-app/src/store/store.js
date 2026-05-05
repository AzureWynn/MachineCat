import { create } from 'zustand';
import WSClient from '../services/ws-client';

const wsClient = new WSClient();

export const useStore = create((set, get) => ({
  wsStatus: 'disconnected',
  batteryLevel: null,
  currentRobotId: localStorage.getItem('currentRobotId') || '',
  messages: [],
  personality: null,

  initWebSocket: () => {
    wsClient.connect();

    wsClient.onStatusChange((status) => {
      set({ wsStatus: status });
    });

    wsClient.onMessage((data) => {
      if (data.type === 'pong' && data.payload?.battery) {
        set({ batteryLevel: data.payload.battery });
      }
    });
  },

  disconnectWebSocket: () => {
    wsClient.disconnect();
  },

  setCurrentRobotId: (robotId) => {
    localStorage.setItem('currentRobotId', robotId);
    set({ currentRobotId: robotId });
  },

  setPersonality: (personality) => {
    set({ personality });
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  getWSClient: () => wsClient,
}));
