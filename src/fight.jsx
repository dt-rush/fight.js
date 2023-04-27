import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function Fight() {
  const { uuid } = useParams();
  const [ws, setWs] = useState(null);
  const [error, setError] = useState(null);
  const [fightStarted, setFightStarted] = useState(null);

  useEffect(() => {
    const initWebSocket = () => {
      const websocket = new WebSocket('ws://localhost:8080');
      setWs(websocket);

      websocket.addEventListener('open', () => {
        websocket.send(JSON.stringify({ type: 'fight/join', fightId: uuid }));
      });

      websocket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'fight/start') {
          setFightStarted(true);
        }
        else if (data.type === 'error') {
          setError(data.message);
        }
      });

      return () => {
        websocket.close();
      };
    };

    if (!ws) {
      initWebSocket();
    }
  }, [uuid, ws]);

  return (
    <div>
      {error ? (<div>{error}</div>) :
        fightStarted ? (
          <>
            <div id="vitals"></div>
            <div id="round"></div>
            <div id="output"></div>
            <div id="options"></div>
          </>
        ) : (
          <p>Waiting for opponent...</p>
        )}
    </div>
  );
}

export default Fight;
