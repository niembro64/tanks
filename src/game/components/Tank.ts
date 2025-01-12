import { GameRow, MovementOptionsType, TankEnemyType, TankMovementType, TankState, TankType } from '../../../types';
import { gameWidth, isMobile, platformHeight, platformWidth } from '../../debugOptions';
import { gameCreateEnemy } from '../helpers/helpers';
import {
  averageRotationRad,
  getCircleOffsetPositionFromPoint,
  getIntersectionPoint,
  isOnScreen,
  isOnScreenPadded,
} from '../helpers/math';
import { getDistanceVolumeMultiplier } from '../helpers/sound';
import { Game } from '../scenes/Game';
import { Bullet, bulletDestroyBullet, duplicateBulletFromPoint, playBulletExplosion } from './Bullet';
import { Gate, gateFlashColor } from './Gate';
import { LineSegment, addLine, updateLineSegments } from './LineSegment';
import StatusBar from './StatusBar';

export class Tank extends Phaser.Physics.Arcade.Sprite {
  scene: Game;
  tankIndex: number | null = null;
  rowIndex!: number | null;
  updateIndexGenerated!: number;
  tankType!: TankType;
  tankEnemyType!: TankEnemyType | null;
  movementType!: TankMovementType;
  state: TankState = 'alive';
  spriteTurret: Phaser.Physics.Arcade.Sprite;
  spriteMuzzle: Phaser.Physics.Arcade.Sprite;
  scale: number = 0.5;
  positionPrev: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  bullets: Phaser.Physics.Arcade.Group;
  tankMaxSpeed!: number;
  bulletMaxSpeed!: number;
  emitter!: any;
  spriteExplosionFront: Phaser.GameObjects.Sprite | null = null;
  spriteExplosionBack: Phaser.GameObjects.Sprite | null = null;
  soundTankExplosion: Phaser.Sound.BaseSound = this.scene.sound.add('explosion', {
    rate: 0.6,
    volume: 0.25,
  });

  soundBulletFireSound: Phaser.Sound.BaseSound[] = [];
  soundBulletFireSoundIndex: number = 0;
  soundBulletFireSoundMinUpdatesBetween: number = 5;
  soundBulletFireSoundUpdateIndex: number = 0;

  statusBarHealth: StatusBar;

  statusBarFire: StatusBar;
  fireReplenishRate!: number;
  fireCost!: number;
  fireLastUpdateIndex: number = 0;
  fireMinUpdatesBetween!: number;

  color: number;
  tankMoveSound: Phaser.Sound.BaseSound | null = null;
  tankFireSounds: Phaser.Sound.BaseSound[] = [];
  tankFinreSoundsIndexCurr: number = 0;

  colliderEnemyWithPlayer: Phaser.Physics.Arcade.Collider | null = null;

  lineSegments: LineSegment[] = [];

  constructor(params: {
    scene: Game;
    x: number;
    y: number;
    tintColor: number;
    tankIndex: number | null;
    movementType: TankMovementType;
    tankEnemyType: TankEnemyType | null;
    tankType: TankType;
    rowIndex: number | null;
  }) {
    const { scene, x, y, tintColor, tankIndex, movementType, tankEnemyType, tankType, rowIndex } = params;

    super(scene, x, y, 'tank_body');

    this.updateIndexGenerated = scene.updateIndex;

    this.rowIndex = rowIndex;

    this.tankEnemyType = tankEnemyType;
    this.tankType = tankType;

    this.scene = scene;

    this.movementType = movementType;
    this.tankMoveSound =
      tankIndex !== null || !scene.gameDebugOptions.soundMovement
        ? null
        : this.scene.sound.add('tank_moving', {
            rate: 1, // THIS UPDATES ELSEWHERE
            volume: 0.001, // THIS UPDATES ELSEWHERE
            loop: true,
          });

    this.tankMaxSpeed = this.scene.gameDebugOptions.tankMaxSpeed;
    this.bulletMaxSpeed = this.scene.gameDebugOptions.bulletMaxSpeed;
    this.fireReplenishRate = this.scene.gameDebugOptions.tankFireReplenshRate;
    this.fireCost =
      tankIndex === null
        ? this.scene.gameDebugOptions.tankPlayerFireCost
        : this.scene.gameDebugOptions.tankEnemyFireCost;
    this.fireMinUpdatesBetween = this.scene.gameDebugOptions.tankFireMinUpdatesBetween;

    this.tankIndex = tankIndex;

    for (let i = 0; i < this.scene.gameDebugOptions.bulletsNumBulletExplosions; i++) {
      const newExplosionSound: Phaser.Sound.BaseSound = this.scene.sound.add('shot', {
        rate: 0.4,
        volume: 0.15,
      });

      this.soundBulletFireSound.push(newExplosionSound);
    }

    this.color = tintColor;

    for (let i = 0; i < this.scene.gameDebugOptions.numFireSoundsPerTank; i++) {
      const newSound = this.scene.sound.add('laser_tank', {
        rate: 0.2,
        volume: 1, // UPDATES IN REAL TIME
      });

      this.tankFireSounds.push(newSound);
    }

    this.spriteMuzzle = tankCreateSprite(this, scene, x, y, 'tail', 0.5, 0.5).setAlpha(
      this.scene.gameDebugOptions.tankSpriteMuzzleAlpha,
    );

    if (this.scene.gameDebugOptions.soundMovement && this.tankMoveSound !== null) {
      this.tankMoveSound.play();
    }

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const depth: number =
      tankIndex === null
        ? this.scene.gameDebugOptions.tankPlayerTurretZIndexDepth
        : this.scene.gameDebugOptions.tankEnemyTurretZIndexDepth;

    this.spriteTurret = tankCreateSprite(
      this,
      scene,
      x,
      y,
      tankType,
      this.scene.gameDebugOptions.tankPercentageSetOriginXRatio,
      this.scene.gameDebugOptions.tankPercentageSetOriginYRatio,
    )
      .setTint(tintColor)
      .setDepth(depth);

    // phaser 3.80.1
    this.emitter = tankCreateEmitter(this, scene).stop();
    this.emitter.setDepth(depth - 1);

    this.setCollideWorldBounds(true);

    this.bullets = scene.physics.add.group({
      classType: Bullet,
    });

    let healthValueInit: number;
    switch (tankType) {
      case 'tank_turret_circle_single':
        healthValueInit = scene.gameDebugOptions.tankEnemyHealthCircleSingleInit;
        break;
      case 'tank_turret_box_single':
        healthValueInit = scene.gameDebugOptions.tankEnemyHealthBoxSingleInit;
        break;
      case 'tank_turret_box_double':
        healthValueInit = scene.gameDebugOptions.tankEnemyHealthBoxDoubleInit;
        break;
      case 'tank_turret_box_triple':
        healthValueInit = scene.gameDebugOptions.tankEnemyHealthBoxTripleInit;
        break;
      default:
        throw new Error('Invalid tank type');
    }

    this.statusBarHealth = new StatusBar({
      valueInit: tankIndex === null ? scene.gameDebugOptions.tankPlayerHealthInit : healthValueInit,
      game: scene,
      x: x,
      y: y,
      width: 80,
      height: 12,
      borderWidth: 2,
      orientation: 'horizontal',
      offset: {
        x: 0,
        y: this.tankIndex === null ? this.height / 2 : -this.height / 2,
      },
      fillColorHigh: 0x00ff00,
      fillColorLow: 0xff0000,
      fillColorBehind: 0x666666,
      depth: this.scene.gameDebugOptions.statusBarZIndexDepth,
    });

    this.statusBarFire = new StatusBar({
      valueInit: tankType === 'tank_turret_circle_single' ? 50 : 100,
      game: scene,
      x: x,
      y: y,
      width: 8,
      height: 30,
      borderWidth: 2,
      orientation: 'vertical',
      offset: {
        x: this.tankIndex === null ? this.width / 2 : -this.width / 2,
        y: 0,
      },
      fillColorHigh: 0xffffff,
      fillColorLow: 0xffffff,
      fillColorBehind: 0x666666,
      depth: this.scene.gameDebugOptions.statusBarZIndexDepth,
    });

    if (this.scene.gameDebugOptions.bulletsCollidePlatforms) {
      scene.physics.add.collider(this.bullets, scene.platformsCollide);

      scene.physics.add.collider(this.bullets, scene.platformsNormal);
    }
  }
}

export function fireTank(param: { posX: number; posY: number; angleRad: number; tank: Tank; game: Game }) {
  const { posX, posY, angleRad, tank, game } = param;

  const fired: boolean = fire({
    posX: posX,
    posY: posY,
    angleRad: angleRad,
    tank: tank,
    game: game,
  });

  if (!fired) {
    return;
  }

  tank.fireLastUpdateIndex = game.updateIndex;

  tank.statusBarFire.decrease(tank.fireCost);

  const player = game.player;

  const distanceFromPlayer = Math.sqrt((tank.x - player.x) ** 2 + (tank.y - player.y) ** 2);

  const distanceVolumeMultiplier = getDistanceVolumeMultiplier(distanceFromPlayer);

  tank.tankFinreSoundsIndexCurr =
    (tank.tankFinreSoundsIndexCurr + 1) % tank.scene.gameDebugOptions.numFireSoundsPerTank;
  const currFireSound = tank.tankFireSounds[tank.tankFinreSoundsIndexCurr];
  // @ts-ignore
  currFireSound.setVolume(tank.scene.gameDebugOptions.soundFireBaseVolume * distanceVolumeMultiplier * 1.5);

  currFireSound.play();
  tank.emitter.explode(30);
}

export function fire(param: { posX: number; posY: number; angleRad: number; tank: Tank; game: Game }): boolean {
  const { posX, posY, angleRad, tank, game } = param;

  const onScreen = isOnScreen(tank.scene, new Phaser.Math.Vector2(posX, posY));

  if (!onScreen) {
    return false;
  }

  const numBulletsCurrently = tank.bullets.children.size;

  const max: number =
    tank.tankIndex === null
      ? tank.scene.gameDebugOptions.bulletMaxPerTankPlayer
      : tank.scene.gameDebugOptions.bulletMaxPerTankEnemy;

  if (numBulletsCurrently >= max) {
    bulletDestroyBullet(tank.bullets.children.entries[0] as Bullet, game);
    return false;
  }

  const newBullet: Bullet = new Bullet({
    scene: tank.scene,
    tank: tank,
    posCurrX: posX,
    posCurrY: posY,
    speed: tank.bulletMaxSpeed,
    rotationRad: angleRad,
    color: tank.color,
  });

  /////////////////////////////////////////////////////////
  // CREATE BULLET COLLISIONS
  /////////////////////////////////////////////////////////
  if (tank.tankIndex === null) {
    /////////////////////////////////////////////////////////
    // PLAYER
    /////////////////////////////////////////////////////////
    for (let i = 0; i < tank.scene.enemies.length; i++) {
      //////////////////////////////////////////
      // PLAYER-BULLET WITH ENEMY-TANK
      //////////////////////////////////////////
      // console.log('player-bullet with enemy-tank', i);
      tank.scene.physics.add.overlap(
        tank.scene.enemies[i],
        newBullet,
        callbackBulletHitTank as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
        undefined,
        game,
      );
      //////////////////////////////////////////
      // PLAYER-BULLET WITH ENEMY-BULLET
      //////////////////////////////////////////
      // tank.scene.physics.add.overlap(
      //   newBullet,
      //   tank.scene.enemies[i].bullets,
      //   callbackBulletHitBullet as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      //   undefined,
      //   game,
      // );
    }
  } else {
    /////////////////////////////////////////////////////////
    // ENEMY-BULLET WITH PLAYER-TANK
    /////////////////////////////////////////////////////////
    tank.scene.physics.add.overlap(
      tank.scene.player,
      newBullet,
      callbackBulletHitTank as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      game,
    );

    /////////////////////////////////////////////////////////
    // ENEMY-BULLET WITH PLAYER-BULLETS
    /////////////////////////////////////////////////////////
    tank.scene.physics.add.overlap(
      newBullet,
      tank.scene.player.bullets,
      callbackBulletHitBullet as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
      undefined,
      game,
    );
  }

  tank.bullets.add(newBullet);
  newBullet.setVelocity(newBullet.speed * Math.cos(angleRad), newBullet.speed * Math.sin(angleRad));

  return true;
}

export function updateTankMuzzlePosition(tank: Tank) {
  const newPos = getCircleOffsetPositionFromPoint({
    position: new Phaser.Math.Vector2(tank.x, tank.y),
    distance: 120 * tank.scale,
    angleDeg: tank.spriteTurret.angle - 90,
  });

  tank.spriteMuzzle.setPosition(newPos.x, newPos.y);
}

export function updateTankBodyRotation(tank: Tank) {
  if (!tank?.body) {
    return;
  }

  const rotationRadNew = Math.atan2(tank.body.velocity.y, tank.body.velocity.x) + Math.PI / 2;

  tank.rotation = averageRotationRad(tank.rotation, rotationRadNew);
}

export function updateTankTurretPosition(tank: Tank) {
  tank.spriteTurret.setPosition(tank.x, tank.y);
}

export function updateTankFriction(tank: Tank) {
  const keep = tank.scene.gameDebugOptions.tankKeepVelocity;
  tank.setVelocity(keep * (tank?.body?.velocity.x || 0), keep * (tank?.body?.velocity.y || 0));
}

export function updateTankMoveWithControls(
  tank: Tank,
  game: Game,
  angleDeg: number | null | undefined,
  radius: number | null,
) {
  if (game.gameRowIndexCurr === null) {
    return;
  }

  if (game.gameDebugOptions.defaultFankForceForward) {
    let newMult: number = 1;

    if (game.gameMatrix !== null) {
      newMult = game.gameMatrix[game.gameRowIndexCurr].speed;
    }

    game.playerSpeedMultiplier = 0.99 * game.playerSpeedMultiplier + 0.01 * newMult;

    tank.setVelocityY(-game.gameDebugOptions.tankForceForwardSpeed * game.playerSpeedMultiplier);
  }

  if (angleDeg === undefined || angleDeg === null || radius === null || radius === 0) {
    return;
  }

  const useAlternateMovementLR: boolean =
    isMobile &&
    (tank.scene.gameDebugOptions.defaultControlsTypeMobile === 'double-arc-relative' ||
      tank.scene.gameDebugOptions.defaultControlsTypeMobile === 'double-arc-absolute' ||
      tank.scene.gameDebugOptions.defaultControlsTypeMobile === 'single-arc-absolute');

  let velocityX: number;
  let velocityY: number;

  if (useAlternateMovementLR) {
    if (angleDeg <= 0 && angleDeg > -90) {
      velocityX = tank.tankMaxSpeed * Math.cos((angleDeg * Math.PI) / 180);
      velocityY = 0;
    } else if (angleDeg > 0 || angleDeg < -90) {
      velocityX = tank.tankMaxSpeed * Math.cos((angleDeg * Math.PI) / 180);
      velocityY = 0;
    } else {
      velocityX = 0;
      velocityY = 0;
    }
  } else {
    velocityX =
      ((game.gameControls.leftRadiusCurr || 0) / game.gameControls.thresholdRadius) *
      tank.tankMaxSpeed *
      Math.cos((angleDeg * Math.PI) / 180);
    velocityY =
      ((game.gameControls.leftRadiusCurr || 0) / game.gameControls.thresholdRadius) *
      tank.tankMaxSpeed *
      Math.sin((angleDeg * Math.PI) / 180);
  }

  const keep: number = tank.scene.gameDebugOptions.tankKeepVelocity;

  if (tank.scene.gameDebugOptions.defaultFankForceForward) {
    tank.setVelocityX(keep * (tank?.body?.velocity.x || 0) + velocityX * (1 - keep));
  } else {
    tank.setVelocity(
      keep * (tank?.body?.velocity.x || 0) + velocityX * (1 - keep),
      keep * (tank?.body?.velocity.y || 0) + velocityY * (1 - keep),
    );
  }
}

export function updateTankMovement(
  tank: Tank,
  time: number,
  angleDeg: number | null | undefined,
  radius: number | null,
  game: Game,
) {
  if (!tank) {
    return;
  }

  switch (tank.movementType) {
    case 'controls':
      updateTankMoveWithControls(tank, game, angleDeg, radius);
      game.playerVerticalPositionCentered.setPosition(gameWidth / 2, game.player.y);
      break;
    case 'move':
      updateTankMoveInEllipse(tank, time);
      break;
    case 'stationary':
      break;
    default:
      throw new Error('Invalid movement type');
  }
}

export function tankSetTurretAngle(tank: Tank, angleDeg: number | null | undefined, radius: number | null) {
  const isDesktop: boolean = !isMobile;
  const isNoHorizontalMovement: boolean = !tank.scene.gameDebugOptions.cameraFollowHorizontal;

  if (isDesktop && isNoHorizontalMovement) {
    const angleOfCrosshairsLinePlayerCursor: number = Math.atan2(
      tank.scene.cursorCurrentPositionInGameWorld.y - tank.y,
      tank.scene.cursorCurrentPositionInGameWorld.x - tank.x,
    );

    tank.spriteTurret.rotation = angleOfCrosshairsLinePlayerCursor + Math.PI / 2;
    return;
  }

  const mobileIsOk: boolean =
    radius !== null &&
    (tank.scene.gameDebugOptions.defaultControlsTypeMobile === 'double-arc-relative' ||
      radius > tank.scene.gameDebugOptions.controlsRightJoysticDeadZone);

  if (angleDeg !== null && angleDeg !== undefined && (isMobile ? mobileIsOk : true)) {
    tank.spriteTurret.rotation = Phaser.Math.DegToRad(angleDeg + 90);
  }
}

export function tankTakeDamage(tank: Tank) {
  if (!tank || !tank.statusBarHealth) {
    return;
  }

  const damage = 5;

  tank.statusBarHealth.decrease(damage);
}

export function tankUpdateFireBullet(tank: Tank) {
  const canFire: boolean = tank.statusBarFire.hasAmount(tank.fireCost) && tank.state === 'alive';

  const pressingFire: boolean =
    ///////////////////////////
    // IF IS ENEMY AND RANDOM
    ///////////////////////////
    (tank.tankIndex !== null &&
      tank.scene.gameDebugOptions.tankEnemiesFire &&
      Math.random() < tank.scene.gameDebugOptions.tankEnemyPercentShooting) ||
    ///////////////////////////
    // IF IS PLAYER AND PRESSING
    ///////////////////////////
    (tank.tankIndex === null && tank.scene.gameControls.rightRadiusCurr !== null);

  if (tank.scene.updateIndex - tank.fireLastUpdateIndex < tank.fireMinUpdatesBetween) {
    return;
  }

  const rotationRad = tank.spriteTurret.rotation - Math.PI / 2;
  const rotationRadNormal = rotationRad + Math.PI / 2;

  let firePositions: Phaser.Math.Vector2[] = [];
  switch (tank.tankType) {
    case 'tank_turret_circle_single':
      firePositions = [new Phaser.Math.Vector2(tank.spriteMuzzle.x, tank.spriteMuzzle.y)];
      break;
    case 'tank_turret_box_single':
      firePositions = [new Phaser.Math.Vector2(tank.spriteMuzzle.x, tank.spriteMuzzle.y)];
      break;
    case 'tank_turret_box_double':
      const firePositionLeft = getCircleOffsetPositionFromPoint({
        position: new Phaser.Math.Vector2(tank.spriteMuzzle.x, tank.spriteMuzzle.y),
        distance: 7,
        angleDeg: Phaser.Math.RadToDeg(rotationRadNormal) - 180,
      });

      const firePositionRight = getCircleOffsetPositionFromPoint({
        position: new Phaser.Math.Vector2(tank.spriteMuzzle.x, tank.spriteMuzzle.y),
        distance: 7,
        angleDeg: Phaser.Math.RadToDeg(rotationRadNormal),
      });

      firePositions = [
        new Phaser.Math.Vector2(firePositionLeft.x, firePositionLeft.y),
        new Phaser.Math.Vector2(firePositionRight.x, firePositionRight.y),
      ];
      break;
    case 'tank_turret_box_triple':
      const firePositionTriLeft = getCircleOffsetPositionFromPoint({
        position: new Phaser.Math.Vector2(tank.spriteMuzzle.x, tank.spriteMuzzle.y),
        distance: 12,
        angleDeg: Phaser.Math.RadToDeg(rotationRadNormal) - 180,
      });

      const firePositionTriRight = getCircleOffsetPositionFromPoint({
        position: new Phaser.Math.Vector2(tank.spriteMuzzle.x, tank.spriteMuzzle.y),
        distance: 12,
        angleDeg: Phaser.Math.RadToDeg(rotationRadNormal),
      });

      firePositions = [
        new Phaser.Math.Vector2(firePositionTriLeft.x, firePositionTriLeft.y),
        new Phaser.Math.Vector2(tank.spriteMuzzle.x, tank.spriteMuzzle.y),
        new Phaser.Math.Vector2(firePositionTriRight.x, firePositionTriRight.y),
      ];
      break;
    default:
      throw new Error('Invalid tank type');
  }

  for (let i = 0; i < firePositions.length; i++) {
    if (canFire && pressingFire) {
      fireTank({
        posX: firePositions[i].x,
        posY: firePositions[i].y,
        angleRad: rotationRad,
        tank: tank,
        game: tank.scene,
      });
    }
  }
}

export function updateBullets(tank: Tank, game: Game) {
  tank.bullets.children.each((b: Phaser.GameObjects.GameObject, index: number) => {
    const bullet = b as Bullet;

    bullet.numUpdatesSeen++;

    if (!bullet || !bullet.body || !bullet.body.position) {
      return false;
    }

    const pointCurr = new Phaser.Math.Vector2(bullet.body.position.x, bullet.body.position.y);

    const pointPrev = bullet.posPrev.clone();

    if (tank.scene.gameDebugOptions.lineSegmentDrawLines) {
      addLine(tank.scene, tank, pointPrev, pointCurr, tank.color);
    }

    for (let i = 0; i < tank.scene.gates.length; i++) {
      const gate: Gate = tank.scene.gates[i];

      const line2start = new Phaser.Math.Vector2(gate.pointStart.x, gate.pointStart.y);
      const line2end = new Phaser.Math.Vector2(gate.pointEnd.x, gate.pointEnd.y);

      const spriteWidth: number = bullet.displayWidth;
      const spriteHeight: number = bullet.displayHeight;

      const intersectionPointOffset = getIntersectionPoint({
        line1start: new Phaser.Math.Vector2(pointPrev.x + spriteWidth / 2, pointPrev.y + spriteHeight / 2),
        line1end: new Phaser.Math.Vector2(pointCurr.x + spriteWidth / 2, pointCurr.y + spriteHeight / 2),
        line2start: line2start,
        line2end: line2end,
      });

      if (intersectionPointOffset !== null) {
        const intersectionPoint = new Phaser.Math.Vector2(
          intersectionPointOffset.x - spriteWidth / 2,
          intersectionPointOffset.y - spriteHeight / 2,
        );

        if (tank.scene.gameDebugOptions.gateStarsAtIntersects) {
          tank.scene.add
            .sprite(
              intersectionPoint.x,
              intersectionPoint.y,

              'star',
            )
            .setScale(0.3)
            .setOrigin(0.5, 0.5);
        }

        const numBulletsCurrently = tank.scene.player.bullets.children.size;

        const bulletsOk: boolean =
          numBulletsCurrently <
          (tank.tankIndex === null
            ? tank.scene.gameDebugOptions.bulletMaxPerTankPlayer
            : tank.scene.gameDebugOptions.bulletMaxPerTankEnemy);

        const bulletHasSeenEnoughUpdates: boolean =
          bullet.numUpdatesSeen >= tank.scene.gameDebugOptions.bulletNumUpdatesSkip;

        const bulletHasSeenatLeastOneUpdate: boolean = bullet.numUpdatesSeen > 0;

        if (bulletHasSeenEnoughUpdates) {
          if (bulletsOk) {
            duplicateBulletFromPoint(bullet, intersectionPoint, gate, game);
            gateFlashColor(gate, '#ffffff');
          } else {
            gateFlashColor(gate, '#000000');

            bulletDestroyBullet(bullet, game);
          }
        }
      }

      if (bullet) {
        if (!isOnScreenPadded(tank.scene, pointCurr)) {
          bulletDestroyBullet(bullet, game);
        } else {
          bullet.posPrev.copy(pointCurr);
        }
      }
    }

    return true;
  });
}

export function tankCreateEmitter(tank: Tank, game: Game) {
  return game.add.particles(0, 0, 'tail', {
    speed: { min: 0, max: 100 },
    lifespan: 500,
    alpha: { start: 1, end: 0 },
    scale: { start: game.gameDebugOptions.emitterScaleStart, end: 0 },
    follow: tank.spriteMuzzle,
    blendMode: 'SCREEN',
  });
}

export function tankCreateSprite(
  tank: Tank,
  game: Game,
  x: number,
  y: number,
  texture: string,
  originX: number,
  originY: number,
) {
  return game.physics.add.sprite(x, y, texture).setOrigin(originX, originY).setScale(tank.scale);
}

export function updateBarLocation(bar: StatusBar, tank: Tank) {
  bar.setPosition(tank.x - bar.width * 0.5, tank.y - bar.height * 0.5);
}

export function callbackBulletHitTank(tank: Tank, bullet: Bullet) {
  if (tank.state !== 'alive') {
    return;
  }

  const collisionPointMidpoint: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
    (bullet.x + bullet.displayWidth / 2 + tank.x) / 2,
    (bullet.y + bullet.displayHeight / 2 + tank.y) / 2,
  );

  if (tank.tankIndex === null) {
    playBulletExplosion({
      bullet: bullet,
      scale: 0.5,
      depthExplosionBack: tank.scene.gameDebugOptions.bulletPlayerExplosionBackZIndexDepth,
      depthExplosionFront: tank.scene.gameDebugOptions.bulletPlayerExplosionFrontZIndexDepth,
      location: collisionPointMidpoint,
    });
  } else {
    playBulletExplosion({
      bullet: bullet,
      scale: 0.5,
      depthExplosionBack: tank.scene.gameDebugOptions.bulletEnemyExplosionBackZIndexDepth,
      depthExplosionFront: tank.scene.gameDebugOptions.bulletEnemyExplosionFrontZIndexDepth,
      location: collisionPointMidpoint,
    });
  }

  bulletDestroyBullet(bullet, tank.scene);

  tankTakeDamage(tank);
}

export function callbackBulletHitBullet(bullet1: Bullet, bullet2: Bullet) {
  console.log('bullet hit bullet');

  const collisionPoint: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
    (bullet1.x + bullet1.displayWidth / 2 + bullet2.x + bullet2.displayWidth / 2) / 2,
    (bullet1.y + bullet1.displayHeight / 2 + bullet2.y + bullet2.displayHeight / 2) / 2,
  );

  playBulletExplosion({
    bullet: bullet1,
    scale: 0.3,
    depthExplosionBack: bullet1.scene.gameDebugOptions.bulletEnemyExplosionBackZIndexDepth,
    depthExplosionFront: bullet1.scene.gameDebugOptions.bulletEnemyExplosionFrontZIndexDepth,
    location: collisionPoint,
  });

  bulletDestroyBullet(bullet1, bullet2.scene);
  setTimeout(() => {
    bulletDestroyBullet(bullet2, bullet2.scene);
  }, 0);
}

export function tankUpdateMovementSound(tank: Tank, game: Game) {
  if (!game.gameDebugOptions.soundMovement || tank.tankMoveSound === null) {
    return;
  }

  const currentSpeed =
    Math.sqrt((tank?.body?.velocity.x || 0) ** 2 + (tank?.body?.velocity.y || 0) ** 2) / tank.tankMaxSpeed;

  const distanceFromPlayer = Math.sqrt((tank.x - game.player.x) ** 2 + (tank.y - game.player.y) ** 2);

  const distanceVolumeMultiplier = getDistanceVolumeMultiplier(distanceFromPlayer);

  // @ts-ignore
  tank.tankMoveSound.setRate(0.1 + currentSpeed * 0.9);

  // @ts-ignore
  tank.tankMoveSound.setVolume(
    currentSpeed * tank.scene.gameDebugOptions.soundMovementBaseVolume * distanceVolumeMultiplier * 3,
  );
}

export function updateTankMoveInEllipse(tank: Tank, time: number) {
  if (!tank?.body) {
    return;
  }

  const amtKeep = tank.scene.gameDebugOptions.tankKeepVelocity;

  const tankIndex: number = tank.tankIndex || 0;

  const newVelX = Math.sin(time / 1000 + tankIndex) * 200 * (1 - amtKeep) + tank.body.velocity.x * amtKeep;

  const newVelY = Math.cos(time / 1000 + tankIndex) * 30 * (1 - amtKeep) + tank.body.velocity.y * amtKeep;

  tank.setVelocity(newVelX, newVelY);
}

export function tankUpgradeFireSoundsPitch(tank: Tank) {
  for (let i = 0; i < tank.tankFireSounds.length; i++) {
    // @ts-ignore
    tank.tankFireSounds[i].setRate(tank.tankFireSounds[i].rate * 0.95);
  }
}

export function upgradeTank(tank: Tank) {
  tank.statusBarHealth.maxValue += 10;

  const isPlayer: boolean = tank.tankIndex === null;

  const tankTypeCurr: TankType = tank.tankType;

  switch (tankTypeCurr) {
    case 'tank_turret_circle_single':
      tank.tankType = 'tank_turret_box_single';
      tank.color = isPlayer
        ? tank.scene.gameDebugOptions.tankPlayerColor
        : tank.scene.gameDebugOptions.tankEnemyColorBoxSingle;

      tankUpgradeFireSoundsPitch(tank);
      break;
    case 'tank_turret_box_single':
      tank.tankType = 'tank_turret_box_double';
      tank.color = isPlayer
        ? tank.scene.gameDebugOptions.tankPlayerColor
        : tank.scene.gameDebugOptions.tankEnemyColorBoxDouble;

      tankUpgradeFireSoundsPitch(tank);
      break;
    case 'tank_turret_box_double':
      tank.tankType = 'tank_turret_box_triple';
      tank.color = isPlayer
        ? tank.scene.gameDebugOptions.tankPlayerColor
        : tank.scene.gameDebugOptions.tankEnemyColorBoxTriple;

      tankUpgradeFireSoundsPitch(tank);
      break;
    case 'tank_turret_box_triple':
      tank.tankType = 'tank_turret_box_triple';
      tank.color = isPlayer
        ? tank.scene.gameDebugOptions.tankPlayerColor
        : tank.scene.gameDebugOptions.tankEnemyColorBoxTriple;

      tankUpgradeFireSoundsPitch(tank);
      break;
    default:
      throw new Error('Invalid tank type' + tank.tankType);
  }

  tank.spriteTurret.setActive(false).setVisible(false);

  const depth: number =
    tank.tankIndex === null
      ? tank.scene.gameDebugOptions.tankPlayerTurretZIndexDepth
      : tank.scene.gameDebugOptions.tankEnemyTurretZIndexDepth;

  tank.spriteTurret = tankCreateSprite(
    tank,
    tank.scene,
    tank.x,
    tank.y,
    tank.tankType,
    tank.scene.gameDebugOptions.tankPercentageSetOriginXRatio,
    tank.scene.gameDebugOptions.tankPercentageSetOriginYRatio,
  )
    .setTint(tank.color)
    .setDepth(depth);

  tank.setTint(tank.color);

  tank.statusBarHealth.setFull();
  tank.statusBarFire.setFull();
}

export function setTankState(tank: Tank, state: TankState) {
  tank.state = state;
  switch (state) {
    case 'alive':
      break;
    case 'dead':
      //////////////////////////////////
      // EXPLOSIONS
      //////////////////////////////////
      if (tank.spriteExplosionFront === null) {
        tank.spriteExplosionFront = tank.scene.add.sprite(tank.x, tank.y, 'explosion256');
      }

      if (tank.spriteExplosionBack === null) {
        tank.spriteExplosionBack = tank.scene.add.sprite(tank.x, tank.y, 'explosion256');
      }

      tank.spriteExplosionFront.setPosition(tank.x, tank.y);
      tank.spriteExplosionBack.setPosition(tank.x, tank.y);

      const newScale = Phaser.Math.FloatBetween(3, 4);

      const rotationFront = Math.random() * Math.PI * 2;
      const rotationBack = Math.random() * Math.PI * 2;

      tank.spriteExplosionFront.setScale(newScale + tank.scene.gameDebugOptions.explosionsFrontSizeAdder);
      tank.spriteExplosionBack.setScale(newScale);

      tank.spriteExplosionFront.setRotation(rotationFront);
      tank.spriteExplosionBack.setRotation(rotationBack);

      tank.spriteExplosionFront.setAlpha(1);
      tank.spriteExplosionBack.setAlpha(1);

      tank.spriteExplosionFront.setDepth(
        (tank.tankIndex === null
          ? tank.scene.gameDebugOptions.bulletPlayerExplosionFrontZIndexDepth
          : tank.scene.gameDebugOptions.bulletEnemyExplosionFrontZIndexDepth) + 1,
      );
      tank.spriteExplosionBack.setDepth(
        (tank.tankIndex === null
          ? tank.scene.gameDebugOptions.bulletPlayerExplosionBackZIndexDepth
          : tank.scene.gameDebugOptions.bulletEnemyExplosionBackZIndexDepth) + 1,
      );

      tank.spriteExplosionFront.anims.play(
        'explosion_animation_' + tank.scene.gameDebugOptions.tankExplosionsFrontFrameRate,
      );
      tank.spriteExplosionBack.anims.play(
        'explosion_animation_' + tank.scene.gameDebugOptions.tankExplosionsBackFrameRate,
      );

      // remove the collision between the tank and the player
      if (tank.colliderEnemyWithPlayer !== null) {
        tank.scene.physics.world.removeCollider(tank.colliderEnemyWithPlayer);
      }

      tank.spriteTurret.setDepth(tank.spriteTurret.depth - 1);

      tank.soundTankExplosion.play();

      //////////////////////////////////
      // VISUALS
      //////////////////////////////////
      tank.setTint(tank.scene.gameDebugOptions.tankDeadTintColor);
      tank.spriteTurret.setTint(tank.scene.gameDebugOptions.tankDeadTintColor);

      tank.setAlpha(tank.scene.gameDebugOptions.tankDeadAlpha);
      tank.spriteTurret.setAlpha(tank.scene.gameDebugOptions.tankDeadAlpha);

      if (tank.tankIndex !== null) {
        //////////////////////////////////
        // SOUNDS
        //////////////////////////////////
        if (tank.tankMoveSound !== null) {
          tank.tankMoveSound.stop();
        }
        tank.scene.time.delayedCall(tank.scene.gameDebugOptions.tankDeadGoneDelay, () => {
          setTankState(tank, 'gone');
        });
      }

      //////////////////////////////////
      // BARS
      //////////////////////////////////
      tank.statusBarHealth.destroy();
      tank.statusBarFire.destroy();
      break;
    case 'gone':
      if (tank.spriteExplosionFront !== null) {
        tank.spriteExplosionFront.destroy();
      }
      if (tank.spriteExplosionBack !== null) {
        tank.spriteExplosionBack.destroy();
      }

      tank.spriteTurret.destroy();
      tank.destroy();

      break;
    default:
      throw new Error('Invalid state');
  }
}

export function updateStateTank(tank: Tank, time: number, game: Game) {
  if (!tank?.body) {
    return;
  }

  updateTankBodyRotation(tank);
  updateTankTurretPosition(tank);
  updateTankMuzzlePosition(tank);
  updateBullets(tank, game);
  updateTankFriction(tank);

  // console.log('tank.state', tank.state);

  switch (tank.state) {
    case 'alive':
      tank.statusBarFire.increase(tank.fireReplenishRate);
      tankUpdateMovementSound(tank, game);
      updateLineSegments(tank);
      updateTankMovement(tank, time, game.gameControls.leftAngleCurr, game.gameControls.leftRadiusCurr, game);
      tankUpdateFireBullet(tank);

      updateBarLocation(tank.statusBarHealth, tank);
      updateBarLocation(tank.statusBarFire, tank);

      if (tank.tankIndex === null) {
        tankSetTurretAngle(tank, game.gameControls.rightAngleCurr, game.gameControls.rightRadiusCurr);
      }

      if (tank.statusBarHealth.isEmpty) {
        setTankState(tank, 'dead');
      }
      break;
    case 'dead':
      break;
    case 'gone':
      break;
    default:
      throw new Error('Invalid state');
  }
}

export function createTankFromRowItem(params: { gameObjectPieces: string[]; game: Game; i: number; j: number }) {
  const { i, j, gameObjectPieces, game } = params;

  let newRotationRad: number;
  switch (gameObjectPieces[4]) {
    case '|':
      newRotationRad = Math.PI;
      break;
    case '/':
      newRotationRad = Math.PI * 1.25;
      break;
    case '\\':
      newRotationRad = Math.PI * 0.75;
      break;
    case 'l':
      newRotationRad = 0;
      break;
    case 'r':
      newRotationRad = Math.PI * 0.5;
      break;
    default:
      throw new Error(`splitType[4] not recognized: ${gameObjectPieces[4]}`);
  }

  let movementType: TankMovementType;
  switch (gameObjectPieces[5]) {
    case 'm':
      movementType = 'move';
      break;
    case 's':
      movementType = 'stationary';
      break;
    default:
      throw new Error(`splitType[5] not recognized: ${gameObjectPieces[5]}`);
  }

  const gameObjectPieces23 = gameObjectPieces[2] + gameObjectPieces[3];
  let tankType: TankType;

  switch (gameObjectPieces23) {
    case 'c1':
      tankType = 'tank_turret_circle_single';
      break;
    case 'b1':
      tankType = 'tank_turret_box_single';
      break;
    case 'b2':
      tankType = 'tank_turret_box_double';
      break;
    case 'b3':
      tankType = 'tank_turret_box_triple';
      break;
    default:
      throw new Error(`splitType[1] + splitType[2] not recognized: ${gameObjectPieces23}`);
  }

  gameCreateEnemy({
    game: game,
    x: j * platformWidth + platformWidth / 2,
    y: i * platformHeight + platformHeight / 2,
    index: game.nextTankEnemyIndex,
    rotationRad: newRotationRad,
    movementType: movementType,
    tankType: tankType,
    rowIndex: i,
  });
  game.nextTankEnemyIndex++;
}

export function tankDestroyTank(tank: Tank, game: Game) {
  // Stop and destroy any associated sounds
  if (tank.tankMoveSound) {
    tank.tankMoveSound.stop();
    tank.tankMoveSound.destroy();
  }

  for (let sound of tank.tankFireSounds) {
    sound.stop();
    sound.destroy();
  }

  tank.soundTankExplosion.stop();
  tank.soundTankExplosion.destroy();

  for (let sound of tank.soundBulletFireSound) {
    sound.stop();
    sound.destroy();
  }

  // Destroy all bullets associated with the tank
  // @ts-ignore
  tank.bullets.children.each((bullet: Phaser.GameObjects.GameObject) => {
    bulletDestroyBullet(bullet as Bullet, game);
  });

  // Destroy any line segments associated with the tank
  for (let lineSegment of tank.lineSegments) {
    lineSegment.destroy();
  }

  // Destroy status bars
  if (tank.statusBarHealth) {
    tank.statusBarHealth.destroy();
  }

  if (tank.statusBarFire) {
    tank.statusBarFire.destroy();
  }

  // Destroy tank explosion sprites
  if (tank.spriteExplosionFront) {
    tank.spriteExplosionFront.destroy();
  }

  if (tank.spriteExplosionBack) {
    tank.spriteExplosionBack.destroy();
  }

  // Destroy tank turret and muzzle sprites
  if (tank.spriteTurret) {
    tank.spriteTurret.destroy();
  }

  if (tank.spriteMuzzle) {
    tank.spriteMuzzle.destroy();
  }

  // Remove tank's collider with player (if any)
  if (tank.colliderEnemyWithPlayer) {
    game.physics.world.removeCollider(tank.colliderEnemyWithPlayer);
  }

  // Remove tank from the enemies array in the game
  game.enemies = game.enemies.filter((enemy) => enemy !== tank);

  // Finally, destroy the tank itself
  tank.destroy();

  // remove tank from array
  game.enemies = game.enemies.filter((enemy) => enemy.tankIndex !== tank.tankIndex);
}

export function updateCheckCreateTank(game: Game) {
  if (
    !game.gameMatrix ||
    game.gameRowIndexCurr === null ||
    game.gameCreateRowIndex === null ||
    game.gameCreateRowIndex === null
  ) {
    return;
  }
  ///////////////////////////////////////////////////
  // GENERATE INITIAL TANKS QUICKLY IN FIRST FRAMES
  // USES UPDATE INDEX TO CREATE FIRST TANKS
  ///////////////////////////////////////////////////
  const generateTankUsingUpdateIndex: boolean =
    game.updateIndex < game.gameMatrix.length &&
    game.updateIndex >= game.gameRowIndexCurr - game.gameDebugOptions.tankCreateNumRowsAhead;

  if (generateTankUsingUpdateIndex) {
    const index = game.updateIndex;

    const gameChunkToGenerate: GameRow = game.gameMatrix[index];

    for (let j = 0; j < gameChunkToGenerate.row.length; j++) {
      const gameObjectString: string = gameChunkToGenerate.row[j];
      const gameObjectPieces: string[] = gameObjectString.split('');

      if (gameObjectPieces[0] === 't') {
        createTankFromRowItem({
          gameObjectPieces: gameObjectPieces,
          game: game,
          i: index,
          j: j,
        });
      }
    }
  }

  ///////////////////////////////////////////////////
  // GENERATE OTHER TANKS AS PLAYER MOVES
  // USES GAME ROW INDEX TO CREATE TANKS
  ///////////////////////////////////////////////////
  const generateTankUsingRowIndex: boolean = game.gameRowIndexCurr !== game.gameRowIndexPrev;

  if (generateTankUsingRowIndex) {
    const index = game.gameRowIndexCurr - game.gameDebugOptions.tankCreateNumRowsAhead;

    if (index < 0) {
      return;
    }

    const gameChunkToGenerate: GameRow = game.gameMatrix[index];

    for (let j = 0; j < gameChunkToGenerate.row.length; j++) {
      const gameObjectString: string = gameChunkToGenerate.row[j];
      const gameObjectPieces: string[] = gameObjectString.split('');

      if (gameObjectPieces[0] === 't') {
        createTankFromRowItem({
          gameObjectPieces: gameObjectPieces,
          game: game,
          i: index,
          j: j,
        });
      }
    }
  }
}

export const updateCheckDestroyTanks = (game: Game) => {
  for (let i = 0; i < game.enemies.length; i++) {
    const tank = game.enemies[i];

    if (tank.y > game.player.y + platformHeight * game.gameDebugOptions.tankDestroyNumRowsBehind) {
      tankDestroyTank(tank, game);
    }
  }
};
