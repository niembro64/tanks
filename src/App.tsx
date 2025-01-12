import React, { useRef } from 'react';

import { PhaserGame } from './game/PhaserGame';

function App() {
  const phaserRef = useRef();

  return (
    <div id="app">
      <PhaserGame ref={phaserRef} />
    </div>
  );
}

export default App;
