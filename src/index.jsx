import React from 'react';
import ReactDOM from 'react-dom';
import MainMenu from './main-menu';

async function main() {
  ReactDOM.render(<MainMenu />, document.getElementById('content'));
}

main()
  .then(() => {
  });
