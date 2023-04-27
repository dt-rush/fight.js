import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';

import ModalContext from './modal-context';
import TextInputModal from './text-input-modal';

function Fight() {
  const { openModal } = useContext(ModalContext);
  const { uuid } = useParams();

  const [ws, setWs] = useState(null);
  const [error, setError] = useState(null);
  const [fightData, setFightData] = useState(null);
  const [player, setPlayer] = useState({});
  const [opponent, setOpponent] = useState({});
  const [username, setUsername] = useState(null);
  const [opponentUsername, setOpponentUsername] = useState(null);

  // TODO: replace with proper federated username injection

  useEffect(() => {
    const initWebSocket = async () => {
      const username = await openModal(TextInputModal, {
        promptText: 'Enter your username',
      });
      setUsername(username);

      const websocket = new WebSocket('ws://localhost:8080');
      setWs(websocket);

      websocket.addEventListener('open', () => {
        console.log('joining fight...');
        websocket.send(JSON.stringify({ type: 'fight/join', username, fightId: uuid }));
      });

      websocket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'fight/start') {
          setFightData(data.fightData);
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

  useEffect(() => {
    if (fightData) {
      const playerUsername = username;
      const opponentUsername = fightData.names.find((name) => name !== playerUsername);
      setOpponentUsername(opponentUsername);

      setPlayer(fightData.states[playerUsername]);
      setOpponent(fightData.states[opponentUsername]);
    }
  }, [fightData, username]);

  return (
    <div>
      {error ? (
        <div>{error}</div>
      ) : fightData ? (
        <>
          <div id="vitals">
            <div className="row name">
              <div className="vital opponentName">{opponentUsername}</div>
              <div className="vital playerName">{username}</div>
            </div>
            <div className="row health">
              <div className="vital opponentHealth">{opponent.health}</div>
              <div className="vital symbol">❤️</div>
              <div className="vital playerHealth">{player.health}</div>
            </div>
            <div className="row acuity">
              <div className="vital opponentAcuity">{Math.round(opponent.acuity)}</div>
              <div className="vital symbol">💡</div>
              <div className="vital playerAcuity">{Math.round(player.acuity)}</div>
            </div>
            <div className="row submission">
              <div className="vital opponentSubmission">
                {Math.round(opponent.submissionProgress)}
              </div>
              <div className="vital symbol">🤼</div>
              <div className="vital playerSubmission">
                {Math.round(player.submissionProgress)}
              </div>
            </div>
          </div>
          <div id="round">{fightData.round}</div>
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
