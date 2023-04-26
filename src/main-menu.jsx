import React from 'react';

const options = ['create fighter', 'start fight'];

function MainMenu() {

  const createFighter = function() {
    // TODO
    // 1. switch to page "createFighter"
    //    (this displays a inputs for naming and other variables, on submit
    //    will POST to the API route /fighter/create; after 200 OK, return to main menu page)
  };

  const startFight = function() {
    // TODO
    // 1. open ws connection to server
    // 2. send message with {method: "fight/create"}
    // 3. receive created fight uuid and URL, switch to route "/fight/${uuid}"
    //    (waiting page displays URL with "copy to clipboard" option, and
    //    waits to receive "fight/start", at which point it will display the fight UI)
  };

  const handleClick = (option) => {
    switch (option) {
      case 'create fighter':
        createFighter();
        break;
      case 'start fight':
        startFight();
        break;
    }
  };

  return (
    <div>
      <h1>Main Menu</h1>
      {options.map((option) => (
        <div
          key={option}
          className="option"
          onClick={handleClick.bind(null, option)}
        >
          {option}
        </div>
      ))}
    </div>
  );
}

export default MainMenu;
