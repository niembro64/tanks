import { LevelType, ScaleFunctionObject, SoundPlayRateFunction, scalesAndFunctions } from '../../../types';
import { gameHeightBox, gameWidth } from '../../debugOptions';
import { Gate, gateAddText, gateDraw } from '../components/Gate';
import { callbackBulletHitTank } from '../components/Tank';
import { Game } from '../scenes/Game';
import { gameCreatePlayer } from './helpers';
import { getVolumeFromMultiplier } from './sound';

export const levelSoundTest = (game: Game, levelType: LevelType) => {
  gameCreatePlayer(game, gameWidth * 0.5, gameHeightBox * 0.75);
  const numGates: number = 12;

  for (let i = 0; i < numGates; i++) {
    const yPosition = gameHeightBox * 0.5 + i * 30 - 160;

    const myFunction: SoundPlayRateFunction = scalesAndFunctions.find(
      (scaleFunction: ScaleFunctionObject) => scaleFunction.scale === levelType,
    )?.function as SoundPlayRateFunction;

    if (!myFunction) {
      throw new Error('No function found');
    }

    const isSakura: boolean = levelType === 'demo-scale-sakura';

    const gate: Gate = new Gate({
      scene: game,
      startX: gameWidth * 0.4,
      startY: yPosition,
      endX: gameWidth * 0.6,
      endY: yPosition,
      multiplier: i,
      gateType: isSakura ? 'normal' : 'refract',
      functionSoundPlayRate: myFunction,
      functionSoundVolume: getVolumeFromMultiplier,
    });

    game.gates.push(gate);
  }

  for (let i = 0; i < game.gates.length; i++) {
    gateDraw(game.gates[i]);
  }
  for (let i = 0; i < game.gates.length; i++) {
    gateAddText(game.gates[i]);
  }

  game.physics.add.collider(game.player, game.enemies);

  for (let i = 0; i < game.enemies.length; i++) {
    for (let j = 0; j < game.enemies.length; j++) {
      if (i !== j) {
        game.physics.add.collider(game.enemies[i], game.enemies[j]);
      }
    }
  }

  for (let i = 0; i < game.enemies.length; i++) {
    game.physics.add.overlap(
      game.enemies[i],
      game.player.bullets,
      callbackBulletHitTank as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      game,
    );
  }

  for (let i = 0; i < game.enemies.length; i++) {
    game.physics.add.overlap(
      game.player,
      game.enemies[i].bullets,
      callbackBulletHitTank as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      game,
    );
  }
};
