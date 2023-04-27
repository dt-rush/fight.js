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
  // TODO: replace with proper federated username injection
  const [username, setUsername] = useState(null);
  const [opponentUsername, setOpponentUsername] = useState(null);
  const [options, setOptions] = useState({ list: [], query: '' });

  const sendWS = (payload) => {
    payload.fightId = fightData.id;
    payload.user = username;
    ws.send(JSON.stringify(payload))
  }

  const handleOptionClick = async (option) => {
    let payload = {
      type: `fight/${options.query}`
    };
    payload[options.query] = option;
    sendWS(payload);
    setOptions({ list: [], query: '' });
  };

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
        switch(data.type) {
          case 'fight/start':
            setFightData(data.fightData);
            break;
          case 'fight/canAttack':
            setOptions({ list: data.options, query: 'attack' });
            break;
          case 'fight/canBlock':
            setOptions({ list: data.options, query: 'block' });
            break;
        }
        if (data.type === 'error') {
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
    <>
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
          <div id="options">
            {options.query && <div className="query">{options.query}</div>}
            <div className="grid">
              <div className="gridList">
                {options.list.map((option, index) => (
                  <div
                    key={index}
                    className="clickable-option"
                    data-value={index + 1}
                    onClick={() => handleOptionClick(option)}
                  >
                    <div className="label">{option}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <p>Waiting for opponent...</p>
      )}
    </>
  );
}

export default Fight;
