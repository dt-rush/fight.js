import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainMenu from './main-menu';
import CreateFighter from './create-fighter';
import StartFight from './start-fight';

async function main() {
  ReactDOM.render(
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu/>} />
        <Route path="/fighter/create" element={<CreateFighter/>} />
        <Route path="/fight/start" element={<StartFight/>} />
      </Routes>
    </Router>,
    document.getElementById('content')
  );
}



main()
  .then(() => {
  });
