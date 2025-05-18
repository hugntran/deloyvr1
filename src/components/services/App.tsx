import { useEffect } from 'react';
import { connectWebSocket, disconnectWebSocket } from './WebSocketService'

function App() {
  useEffect(() => {
    connectWebSocket();

    return () => {
      disconnectWebSocket();
    };
  }, []);

  return (
    <div>
      <h1>WebSocket Client Connected</h1>
    </div>
  );
}

export default App;
