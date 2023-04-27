import React from 'react';
import { useParams } from 'react-router-dom';

function Fight() {
  const { uuid } = useParams();

  return (
    <div>
      <h1>Fight</h1>
      <p>UUID: {uuid}</p>
    </div>
  );
}

export default Fight;
