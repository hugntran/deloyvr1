import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient: Client | null = null;

export const connectWebSocket = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('No authToken found');
    return;
  }

  const socketUrl = `http://18.182.12.54:8082/app-data-service/ws?token=${token}`;

  stompClient = new Client({
    webSocketFactory: () => new SockJS(socketUrl),
    reconnectDelay: 5000, // Tự reconnect sau 5 giây nếu mất kết nối
    heartbeatIncoming: 10000, // Kiểm tra heartbeat để tránh treo kết nối
    heartbeatOutgoing: 10000,
    debug: (str) => {
      console.log('STOMP Debug:', str);
    },
  });

  // Xử lý khi kết nối thành công
  stompClient.onConnect = () => {
    console.log('✅ WebSocket Connected');

    subscribeAllTopics(); // Gọi lại subscribe mỗi lần reconnect
  };

  // Khi server đóng kết nối
  stompClient.onDisconnect = () => {
    console.warn('⚠️ STOMP Disconnected');
  };

  // Khi mất kết nối WebSocket
  stompClient.onWebSocketClose = () => {
    console.warn('⚠️ WebSocket closed');
  };

  // Nếu có lỗi STOMP
  stompClient.onStompError = (frame) => {
    console.error('🔥 STOMP Error:', frame.headers['message'], frame.body);
  };

  stompClient.activate();
};

const subscribeAllTopics = () => {
  if (!stompClient) return;

  stompClient.subscribe('/topic/check-in', (message: IMessage) => {
    console.log('Check-In Event:', JSON.parse(message.body));
  });

  stompClient.subscribe('/topic/check-out', (message: IMessage) => {
    console.log('Check-Out Event:', JSON.parse(message.body));
  });

  stompClient.subscribe('/topic/verify', (message: IMessage) => {
    console.log('Verify Conflict:', JSON.parse(message.body));
  });

  stompClient.subscribe('/topic/overdue', (message: IMessage) => {
    console.log('Overdue Ticket:', JSON.parse(message.body));
  });
};

export const disconnectWebSocket = () => {
  stompClient?.deactivate();
};
