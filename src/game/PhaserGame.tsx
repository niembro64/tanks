import PropTypes from 'prop-types';
import React, { Ref, forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef } from 'react';

import { EventBus } from './EventBus';
import StartGame from './main';

const clientWidth = window.innerWidth;
const clientHeight = window.innerHeight;

const isMobile: boolean = clientHeight > clientWidth;
interface PhaserGameProps {
  currentActiveScene?: (currentScene: Phaser.Scene) => void;
  overlayText?: string; // Added a new prop for overlay text
}

export const PhaserGame = forwardRef(function PhaserGame(
  { currentActiveScene, overlayText }: PhaserGameProps,
  ref: Ref<{ game: Phaser.Game | undefined; scene: Phaser.Scene | null }>,
) {
  const game = useRef<Phaser.Game | undefined>();

  useImperativeHandle(
    ref,
    () => ({
      game: game.current,
      scene: null,
    }),
    [],
  );

  useLayoutEffect(() => {
    if (game.current === undefined) {
      game.current = StartGame('game-container');
    }

    return () => {
      if (game.current) {
        game.current.destroy(true);
        game.current = undefined;
      }
    };
  }, []);

  useEffect(() => {
    const onSceneReady = (currentScene: Phaser.Scene) => {
      if (currentActiveScene instanceof Function) {
        currentActiveScene(currentScene);
      }
      if (ref !== null && typeof ref === 'object') {
        ref.current!.scene = currentScene;
      }
    };

    EventBus.on('current-scene-ready', onSceneReady);

    return () => {
      EventBus.removeListener('current-scene-ready', onSceneReady);
    };
  }, [currentActiveScene, ref]);

  return (
    <>
      <div id="game-container" style={{ position: 'relative', zIndex: 0 }}></div>

      {isMobile && (
        <>
          <div style={{ position: 'absolute', top: 85, left: 0, width: '100%', textAlign: 'center', zIndex: 100 }}>
            {<h3>{'Best Experience'}</h3>}
          </div>
          <div style={{ position: 'absolute', top: 103, left: 0, width: '100%', textAlign: 'center', zIndex: 100 }}>
            {<h3>{'On Desktop'}</h3>}
          </div>
        </>
      )}
    </>
  );
});

// Props definitions
PhaserGame.propTypes = {
  currentActiveScene: PropTypes.func,
  overlayText: PropTypes.string, // Added prop type for overlayText
};
