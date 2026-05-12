import { useEffect, useRef } from 'react';
import { useWsStore } from '../store/wsStore';
import { useAlertStore } from '../store/alertStore';

export const useWebSocket = () => {
  const ws = useRef<WebSocket | null>(null);
  const { setConnected, setSystemStats } = useWsStore();
  const { addAlert } = useAlertStore();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    let reconnectTimer: any;

    const connect = () => {
      ws.current = new WebSocket(`ws://localhost:8000/ws?token=${token}`);

      ws.current.onopen = () => {
        setConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'NEW_ALERT') {
            addAlert(msg.data);
          } else if (msg.type === 'SYSTEM_STATS') {
            setSystemStats(msg.data);
          }
        } catch (e) {
          console.error("WS Parse error", e);
        }
      };

      ws.current.onclose = () => {
        setConnected(false);
        reconnectTimer = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws.current) {
        ws.current.onclose = null; // Prevent reconnect on unmount
        ws.current.close();
      }
    };
  }, [setConnected, setSystemStats, addAlert]);

  return ws;
};
