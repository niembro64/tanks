import { GameRow, GameState } from '../../../types';
import { platformHeight } from '../../debugOptions';
import { gateUpdateSpriteArrowRotation } from '../components/Gate';
import {
  createTankFromRowItem,
  tankDestroyTank,
  updateCheckCreateTank,
  updateCheckDestroyTanks,
  updateStateTank,
} from '../components/Tank';
import { updateCheckPlayerWinsGame } from '../helpers/helpers';
import { Game } from './Game';

export function setGameState(game: Game, newState: GameState) {
  switch (newState) {
    case 'init':
      break;
    case 'playing':
      break;
    case 'win':
      game.time.delayedCall(4000, () => {
        game.scene.start('GameWin');
      });

      break;
    case 'lose':
      game.time.delayedCall(4000, () => {
        game.scene.start('GameOver');
      });
      break;
    default:
      break;
  }

  game.gameState = newState;
}

export function updateGame(game: Game, time: number, delta: number) {
  game.updateIndex++;
  game.gameRowIndexCurr = Math.floor(game.player.y / platformHeight);
  game.gameCreateRowIndex = game.gameRowIndexCurr + game.gameDebugOptions.tankCreateNumRowsAhead;
  game.gameControls.updatePre();

  for (let i = 0; i < game.enemies.length; i++) {
    updateStateTank(game.enemies[i], time, game);
  }

  updateStateTank(game.player, time, game);

  for (let i = 0; i < game.gates.length; i++) {
    gateUpdateSpriteArrowRotation(game.gates[i], game);
  }

  switch (game.gameState) {
    case 'init':
      setGameState(game, 'playing');
      break;
    case 'playing':
      updateCheckCreateTank(game);
      updateCheckDestroyTanks(game);

      const nextGameState: GameState = updateCheckPlayerWinsGame(game);

      if (nextGameState === 'win') {
        setGameState(game, nextGameState);
      }

      if (nextGameState === 'lose') {
        setGameState(game, nextGameState);
      }

      break;
    case 'win':
      break;
    case 'lose':
      break;
    default:
      throw new Error('Invalid game state');
  }

  game.gameControls.updatePost();
  game.gameRowIndexPrev = game.gameRowIndexCurr;
}
