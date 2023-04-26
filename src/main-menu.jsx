import React from 'react';

const options = ['create fighter', 'start fight'];

function MainMenu() {
  const handleClick = (option) => {
    switch (option) {
      case 'create fighter':
        console.log('Creating fighter...');
        // Your code for creating a fighter goes here
        break;
      case 'start fight':
        console.log('Starting fight...');
        // Your code for starting a fight goes here
        break;
      default:
        console.log('Unknown option:', option);
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
