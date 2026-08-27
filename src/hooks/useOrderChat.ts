import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';

// Extracts the API base url without /mobile/
const getSocketUrl = (apiUrl: string) => {
  try {
    const url = new URL(apiUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    return 'https://api-stage.sewvee.com'; // fallback
  }
};

export function useOrderChat(orderId: string | number, apiUrl: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!orderId || !token) return;

    // Remove 'Bearer ' prefix if present
    const rawToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    
    const socketUrl = getSocketUrl(apiUrl);
    
    console.log(`Connecting to socket at ${socketUrl} for order ${orderId}...`);
    
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      auth: {
        token: rawToken,
        orderId: String(orderId),
      },
    });

    newSocket.on('connect', () => {
      console.log('Order chat socket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Order chat socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Order chat socket connection error:', error);
      setConnected(false);
    });

    newSocket.on('CHAT_MESSAGE_SENT', (data) => {
      console.log('Received CHAT_MESSAGE_SENT event:', data);
      if (data && data.payload) {
        setMessages((prevMessages) => {
          // Avoid duplicates based on ID
          const exists = prevMessages.find(m => m.id === data.payload.id);
          if (exists) return prevMessages;
          
          return [...prevMessages, data.payload];
        });
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [orderId, token, apiUrl]);

  const addMessageLocally = useCallback((message: any) => {
    setMessages((prevMessages) => {
      const exists = prevMessages.find(m => m.id === message.id);
      if (exists) return prevMessages;
      return [...prevMessages, message];
    });
  }, []);

  return {
    socketMessages: messages,
    connected,
    addMessageLocally,
  };
}
