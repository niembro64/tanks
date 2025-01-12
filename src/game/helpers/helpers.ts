import {
  GameState,
  GateConstructorParams,
  GateOrientationType,
  GateType,
  PillType,
  SoundPlayRateFunction,
  TankMovementType,
  TankType,
} from '../../../types';
import { bgDirtHeight, bgDirtWidth, gameHeightBox, gameHeightLong, gameWidth, isMobile } from '../../debugOptions';
import { GameControls } from '../components/GameControls';
import { Gate, gateAddText, gateDraw } from '../components/Gate';
import { Pill } from '../components/Pill';
import { Tank, callbackBulletHitTank, upgradeTank } from '../components/Tank';
import { Game } from '../scenes/Game';
import { levelSoundTest } from './level0';
import { level2 } from './level2';

export const gameCreateEnemy = (params: {
  game: Game;
  x: number;
  y: number;
  index: number;
  rotationRad: number;
  movementType: TankMovementType;
  tankType: TankType;
  rowIndex: number | null;
}) => {
  const { game, x, y, index, rotationRad, movementType, tankType } = params;

  const newEnemy = new Tank({
    scene: game,
    x: x,
    y: y,
    tintColor: game.gameDebugOptions.tankEnemyColorCircleSingle,
    tankIndex: index,
    movementType: movementType,
    tankEnemyType: 'turret-fixed',
    tankType: 'tank_turret_circle_single',
    rowIndex: params.rowIndex,
  })
    .setTint(game.gameDebugOptions.tankEnemyColorCircleSingle)
    .setOrigin(0.5, 0.5)
    .setDepth(game.gameDebugOptions.tankEnemyBodyZIndexDepth);

  switch (tankType) {
    case 'tank_turret_circle_single':
      ///////////////////////////
      // Do nothing
      ///////////////////////////
      break;
    case 'tank_turret_box_single':
      upgradeTank(newEnemy);
      break;
    case 'tank_turret_box_double':
      upgradeTank(newEnemy);
      upgradeTank(newEnemy);
      break;
    case 'tank_turret_box_triple':
      upgradeTank(newEnemy);
      upgradeTank(newEnemy);
      upgradeTank(newEnemy);
      break;
    default:
      throw new Error('Invalid tank type');
  }

  newEnemy.spriteTurret.setRotation(rotationRad);

  gameCreateCollidersTankPlatforms(newEnemy, game);

  game.enemies.push(newEnemy);
};

export const gameCreatePlayer = (game: Game, x: number, y: number) => {
  game.player = new Tank({
    scene: game,
    x: x,
    y: y,
    tintColor: game.gameDebugOptions.tankPlayerColor,
    tankIndex: null,
    movementType: 'controls',
    tankEnemyType: null,
    tankType: 'tank_turret_circle_single',
    rowIndex: null,
  })
    .setTint(game.gameDebugOptions.tankPlayerColor)
    .setOrigin(0.5, 0.5)
    .setDepth(game.gameDebugOptions.tankPlayerBodyZIndexDepth);

  game.playerVerticalPositionCentered = game.physics.add.sprite(x, y, 'tail').setAlpha(0);

  game.cameras.main.startFollow(
    game.gameDebugOptions.cameraFollowHorizontal ? game.player : game.playerVerticalPositionCentered,
    true,
    game.gameDebugOptions.cameraLarping,
    game.gameDebugOptions.cameraLarping,
  );
  const screenHeight: number = game.cameras.main.height;
  const topOfScreen = -1 * screenHeight * 0.5;
  game.cameras.main.followOffset.set(
    0,
    topOfScreen + screenHeight * game.gameDebugOptions.playerOriginPercentageDownScreen,
  );
  game.cameras.main.setZoom(game.gameDebugOptions.defaultCameraZoom);

  gameCreateCollidersTankPlatforms(game.player, game);
};

export const gameCreateControls = (game: Game) => {
  game.gameControls = new GameControls({
    scene: game,
  });

  game.gameControls.create();

  if (game?.input?.mouse) {
    game?.input?.mouse.disableContextMenu();
  }
};

export const gameCreateCollidersTankPlatforms = (tank: Tank, game: Game) => {
  game.physics.add.collider(tank, game.platformsCollide, (t, platform) => {
    const p = t as Tank;

    if (isCollidingWithBottom(t as Tank, platform as Phaser.Physics.Arcade.Sprite)) {
      console.log('Collision with game.player and game.platformsCollide');
      p.statusBarHealth.setZero();
    }
  });

  game.physics.add.collider(game.player, game.platformsCollide);
  game.physics.add.collider(game.player, game.platformsNormal);
};

export const gameCreateLevel = (game: Game) => {
  //////////////////////////////////////////////////////
  // LEVELS
  //////////////////////////////////////////////////////
  switch (game.gameDebugOptions.defaultLevel) {
    case 'demo-level-2':
      level2(game);
      break;
    default:
      levelSoundTest(game, game.gameDebugOptions.defaultLevel);
  }
};

export const gameCreateCrosshairsLineCenterCursor = (game: Game) => {
  game.crossHairsLineCenterCursor =
    isMobile && game.gameDebugOptions.defaultControlsTypeMobile === 'single-arc-absolute'
      ? null
      : new Phaser.GameObjects.Line(game, 0, 0, 0, 0, 0, 0, 0xffffff, 0.5);

  if (game.crossHairsLineCenterCursor !== null) {
    game.crossHairsLineCenterCursor.setLineWidth(2, 2);
    game.crossHairsLineCenterCursor.setScrollFactor(0);
    game.crossHairsLineCenterCursor.setDepth(game.gameDebugOptions.shootLineZIndexDepth);
    game.add.existing(game.crossHairsLineCenterCursor);
  }
};

export const gameCreateCrosshairsLinePlayerAngle = (game: Game) => {
  game.crossHairsLinePlayerAngle =
    isMobile && game.gameDebugOptions.defaultControlsTypeMobile === 'single-arc-absolute'
      ? null
      : new Phaser.GameObjects.Line(game, 0, 0, 0, 0, 0, 0, 0xffffff, 0.5);

  if (game.crossHairsLinePlayerAngle !== null) {
    game.crossHairsLinePlayerAngle.setLineWidth(2, 2);
    game.crossHairsLinePlayerAngle.setScrollFactor(1);
    game.crossHairsLinePlayerAngle.setDepth(game.gameDebugOptions.shootLineZIndexDepth);
    game.add.existing(game.crossHairsLinePlayerAngle);
  }
};

export const gameCreateCrosshairsLinePlayerCursor = (game: Game) => {
  game.crossHairsLinePlayerCursor =
    isMobile && game.gameDebugOptions.defaultControlsTypeMobile === 'single-arc-absolute'
      ? null
      : new Phaser.GameObjects.Line(game, 0, 0, 0, 0, 0, 0, 0xffffff, 0.5);

  if (game.crossHairsLinePlayerCursor !== null) {
    game.crossHairsLinePlayerCursor.setLineWidth(2, 2);
    game.crossHairsLinePlayerCursor.setScrollFactor(1);
    game.crossHairsLinePlayerCursor.setDepth(game.gameDebugOptions.shootLineZIndexDepth);
    game.add.existing(game.crossHairsLinePlayerCursor);
  }
};

export const gameCreateBackgroundThemeMusic = (game: Game) => {
  const levelTypeChunks = game.gameDebugOptions.defaultLevel.split('-');

  // if any piece of the level type is 'level' then it is a level
  const isLevel: boolean = levelTypeChunks.some((chunk) => chunk === 'level');

  if (!isLevel) {
    return;
  }

  game.backgroundMusic = game.sound.add('drums', {
    loop: true,
    rate: 1,
    volume: 0.3,
  });

  game.backgroundMusic.play();
};

export const gameCreateExplosionAnimations = (game: Game) => {
  for (let i = 0; i < 6; i++) {
    const amount: number = (i + 1) * 10;

    const config = {
      key: 'explosion_animation_' + amount,
      frames: game.anims.generateFrameNumbers('explosion256', {
        start: 0,
        end: 47,
        first: 0,
      }),
      frameRate: amount,
      repeat: 0,
    };

    game.anims.create(config);
  }
};

export function isCollidingWithBottom(player: Tank, platform: Phaser.Physics.Arcade.Sprite) {
  if (!player.body || !platform.body) {
    return false;
  }

  const playerTop = player.body.top;
  const platformBottom = platform.body.bottom;

  // Check if player is moving upward and colliding with the bottom of the platform
  return playerTop >= platformBottom;
}

export function gameCreateChooseCrosshairsLine(game: Game) {
  if (game.gameDebugOptions.debugMode) {
    gameCreateCrosshairsLineCenterCursor(game);
    gameCreateCrosshairsLinePlayerAngle(game);
    gameCreateCrosshairsLinePlayerCursor(game);

    return;
  }

  const mobile: boolean = isMobile;
  const horizFollow: boolean = game.gameDebugOptions.cameraFollowHorizontal;

  if (mobile && horizFollow) {
    gameCreateCrosshairsLineCenterCursor(game);
  } else if (mobile && !horizFollow) {
    gameCreateCrosshairsLinePlayerAngle(game);
  } else if (!mobile && horizFollow) {
    gameCreateCrosshairsLineCenterCursor(game);
  } else if (!mobile && !horizFollow) {
    gameCreateCrosshairsLinePlayerCursor(game);
  } else {
    throw new Error('Invalid camera follow type');
  }
}

export const gameCreateOverlapsAndColliders = (game: Game) => {
  for (let i = 0; i < game.enemies.length; i++) {
    if (game.gameDebugOptions.tankPlayerEnemyExplodes) {
      game.enemies[i].colliderEnemyWithPlayer = game.physics.add.collider(
        game.player,
        game.enemies[i],
        (player, enemy) => {
          const p: Tank = player as Tank;
          const e: Tank = enemy as Tank;

          e.statusBarHealth.decrease(e.statusBarHealth.maxValue);

          game.time.delayedCall(300, () => {
            p.statusBarHealth.decrease(p.statusBarHealth.maxValue);
          });
        },
      );
    } else {
      game.enemies[i].colliderEnemyWithPlayer = game.physics.add.collider(game.player, game.enemies[i]);
    }

    for (let i = 0; i < game.enemies.length; i++) {
      for (let j = 0; j < game.enemies.length; j++) {
        if (i !== j) {
          if (game.gameDebugOptions.tankEnemeyEnemyExplodes) {
            game.physics.add.collider(game.enemies[i], game.enemies[j], (enemy1, enemy2) => {
              const e1: Tank = enemy1 as Tank;
              const e2: Tank = enemy2 as Tank;

              e1.statusBarHealth.setZero();

              game.time.delayedCall(300, () => {
                e2.statusBarHealth.setZero();
              });
            });
          } else {
            game.physics.add.collider(game.enemies[i], game.enemies[j]);
          }
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
  }
};

export const gameCreatePillsRandom = (game: Game, numberPerType: number) => {
  const numPillsPerType = Math.floor(numberPerType / 3);

  for (let i = 0; i < numPillsPerType; i++) {
    const newPill: Pill = new Pill({
      scene: game,
      x: Math.random() * gameWidth,
      y: Math.random() * gameHeightLong,
      type: 'p-hlth',
      pillArray: game.pillsHealth,
    });
  }

  for (let i = 0; i < numPillsPerType; i++) {
    const newPill: Pill = new Pill({
      scene: game,
      x: Math.random() * gameWidth,
      y: Math.random() * gameHeightLong,
      type: 'p-rchg',
      pillArray: game.pillsAmmo,
    });
  }

  for (let i = 0; i < numPillsPerType; i++) {
    const newPill: Pill = new Pill({
      scene: game,
      x: Math.random() * gameWidth,
      y: Math.random() * gameHeightLong,
      type: 'p-time',
      pillArray: game.pillsTime,
    });
  }
};

export const gameCreateEnemiesRandom = (params: {
  game: Game;
  numEnemies: number;
  gameHeightLongStuffInit: number;
}) => {
  const { game, numEnemies, gameHeightLongStuffInit } = params;

  for (let i = 0; i < numEnemies; i++) {
    const newRotationRad = Math.PI * 0.75 + Math.random() * Math.PI * 0.5;

    const tankType: TankType = Math.random() < 0.5 ? 'tank_turret_circle_single' : 'tank_turret_box_single';

    let color: number;
    switch (tankType) {
      case 'tank_turret_circle_single':
        color = game.gameDebugOptions.tankEnemyColorCircleSingle;
        break;
      case 'tank_turret_box_single':
        color = game.gameDebugOptions.tankEnemyColorBoxSingle;
        break;
      default:
        throw new Error('Invalid tank type');
    }

    const newEnemy = new Tank({
      scene: game,
      x: gameWidth * Math.random(),
      y: gameHeightLongStuffInit * Math.random(),
      tintColor: color,
      tankIndex: i,
      movementType: 'move',
      tankEnemyType: 'turret-fixed',
      tankType: tankType,
      rowIndex: null,
    })
      .setTint(color)
      .setOrigin(0.5, 0.5)
      .setDepth(game.gameDebugOptions.tankEnemyBodyZIndexDepth);
    newEnemy.spriteTurret.setRotation(newRotationRad);

    game.enemies.push(newEnemy);
  }
};

export const gameCreateBackgrounds = (params: {
  game: Game;
  numBackgroundsVert: number;
  numBackgroundsHoriz: number;
  gameHeightLongStuffInit: number;
}) => {
  const { game, numBackgroundsVert, numBackgroundsHoriz, gameHeightLongStuffInit } = params;

  for (let i = 0; i < numBackgroundsVert; i++) {
    for (let j = 0; j < numBackgroundsHoriz; j++) {
      game.add
        .image(bgDirtWidth / 2 + j * bgDirtWidth, bgDirtHeight / 2 + i * bgDirtHeight, 'dirt_0')
        // .setTint(0x336633)
        .setOrigin(0.5, 0.5)
        .setDepth(-2);
    }
  }

  const farDirt0Width = bgDirtWidth / 2;
  const farDirt0Height = bgDirtHeight / 2;

  const numBackgroundsFarVert = Math.floor(gameHeightLongStuffInit / farDirt0Width);
  const numBackgroundsFarHoriz = Math.floor(gameWidth / farDirt0Height) * 2;

  for (let i = -10; i < numBackgroundsFarVert; i++) {
    for (let j = -10; j < numBackgroundsFarHoriz; j++) {
      game.add
        .image(bgDirtWidth / 2 + j * farDirt0Width, bgDirtHeight / 2 + i * farDirt0Height, 'dirt_0')
        .setTint(0x888888)
        .setOrigin(0.5, 0.5)
        .setScale(0.5)
        .setDepth(-3)
        .setScrollFactor(0.5);
    }
  }
};

export const gameCreateGatesRandom = (params: {
  game: Game;
  numGates: number;
  maxGateMultiplier: number;
  gameHeightLongStuffInit: number;
  soundRateFunctionToUse: SoundPlayRateFunction;
  getVolumeFromMultiplier: (multiplier: number) => number;
}) => {
  const {
    game,
    numGates,
    maxGateMultiplier,
    gameHeightLongStuffInit,
    soundRateFunctionToUse,
    getVolumeFromMultiplier,
  } = params;

  const myGates: GateConstructorParams[] = [];

  for (let i = 0; i < numGates; i++) {
    const newMultiplier = Math.floor(Math.random() * (maxGateMultiplier + 1));
    const newType: GateType = Math.random() < 0.3333 ? 'mirror' : Math.random() < 0.5 ? 'refract' : 'normal';

    const randomX = Math.random() * gameWidth;
    const randomY = Math.random() * gameHeightLongStuffInit;

    let gateOrientation: GateOrientationType;

    const randomOrientation = Math.random();

    switch (true) {
      case randomOrientation < 0.25:
        gateOrientation = 'horizontal';
        break;
      case randomOrientation < 0.5:
        gateOrientation = 'vertical';
        break;
      case randomOrientation < 0.75:
        gateOrientation = 'diagonal-backslash';
        break;
      default:
        gateOrientation = 'diagonal-forwardslash';
    }

    let randomX2: number;
    let randomY2: number;
    const newLength = Math.random() * gameWidth * 0.25 + 100;

    switch (gateOrientation) {
      case 'horizontal': {
        randomX2 = randomX + newLength;
        randomY2 = randomY;
        break;
      }

      case 'vertical': {
        randomX2 = randomX;
        randomY2 = randomY + newLength;
        break;
      }

      case 'diagonal-backslash': {
        randomX2 = randomX + newLength;
        randomY2 = randomY + newLength;
        break;
      }

      case 'diagonal-forwardslash': {
        randomX2 = randomX - newLength;
        randomY2 = randomY + newLength;
        break;
      }

      default:
        throw new Error('Invalid gate orientation');
    }

    const newGate: GateConstructorParams = {
      scene: game,
      startX: randomX,
      startY: randomY,
      endX: randomX2,
      endY: randomY2,
      multiplier: newMultiplier,
      gateType: newType,
      functionSoundPlayRate: soundRateFunctionToUse,
      functionSoundVolume: getVolumeFromMultiplier,
    };

    myGates.push(newGate);
  }

  for (let i = 0; i < myGates.length; i++) {
    const newGate: Gate = new Gate(myGates[i]);
    game.gates.push(newGate);
  }

  for (let i = 0; i < game.gates.length; i++) {
    gateDraw(game.gates[i]);
  }
  for (let i = 0; i < game.gates.length; i++) {
    gateAddText(game.gates[i]);
  }
};

export const updateCheckPlayerWinsGame = (game: Game): GameState => {
  if (!game || !game.player || !game.gameMatrix || !game.gameRowIndexCurr) {
    return 'playing';
  }

  // console.log('player.state', game.player.state);
  // console.log('game.gameMatrix[game.gameRowIndexCurr].speed', game.gameMatrix[game.gameRowIndexCurr].speed);
  // for (let i = 0; i < game.enemies.length; i++) {
  //   console.log('game.enemies[i].state', game.enemies[i].state);
  // }

  ///////////////////////////////////////////////////////
  // If player is dead, lose the game
  ///////////////////////////////////////////////////////
  if (game.player.state !== 'alive') {
    return 'lose';
  }

  ///////////////////////////////////////////////////////
  // If player has not reached the end, keep playing
  ///////////////////////////////////////////////////////
  if (game.gameMatrix[game.gameRowIndexCurr].speed !== 0) {
    return 'playing';
  }

  ///////////////////////////////////////////////////////
  // If any enemies are alive, keep playing
  //////////////////////////////////////////////////////
  for (let i = 0; i < game.enemies.length; i++) {
    if (game.enemies[i].state === 'alive') {
      return 'playing';
    }
  }

  ///////////////////////////////////////////////////////
  // If no enemies are alive, and player has
  // reached the end, win the game
  ///////////////////////////////////////////////////////
  return 'win';
};

export const gameCreateGate = (params: { game: Game; gateConstructorParams: GateConstructorParams }) => {
  const { game, gateConstructorParams } = params;

  const gate: Gate = new Gate(gateConstructorParams);

  gateDraw(gate);

  gateAddText(gate);

  game.gates.push(gate);
};

export const gameCreatePill = (params: { game: Game; x: number; y: number; type: PillType }) => {
  const { game, x, y, type } = params;

  const newPill: Pill = new Pill({
    scene: game,
    x,
    y,
    type,
    pillArray: game.pillsHealth,
  });
};
