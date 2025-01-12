import { GameControlsMobileType, LevelType } from '../types';

export const bgCheckerboardWidth = 1024;
export const bgCheckerboardHeight = 1024;
export const bgDirtWidth = 200;
export const bgDirtHeight = 200;

export const gameWidth: number = 5 * bgDirtWidth;
export const gameHeightBox: number = 5 * bgDirtHeight;
export const gameHeightLong = 1000 * 6;

export const clientWidth = document.documentElement.clientWidth;
export const clientHeight = document.documentElement.clientHeight;
export const platformWidth = 100;
export const platformHeight = 100;
export const platformScale = 0.5;

export const isMobile: boolean = clientHeight > clientWidth;

export const debugOptionsInit: DebugOptions = {
  debugMode: false,
  fullScreen: false,
  /////////////////
  // GAME
  /////////////////
  defaultCameraZoom: 1,
  defaultLevel: 'demo-level-2',
  defaultControlsTypeMobile: 'double-arc-relative',
  defaultFankForceForward: true,
  // defaultTankStartYRatio: 0.3,
  defaultTankStartYRatio: 0.98,

  tankForceForwardSpeed: 120,
  cameraFollowHorizontal: false,
  cameraLarping: 0.5,
  gameBoundaryExtraPadding: 50,

  /////////////////
  // EXPLOSIONS
  /////////////////
  tankExplosionsBackFrameRate: 30, // 10, 20, 30, 40, 50, 60
  tankExplosionsFrontFrameRate: 20, // 10, 20, 30, 40, 50, 60
  explosionsBackFrameRate: 60, // 10, 20, 30, 40, 50, 60
  explosionsFrontFrameRate: 50, // 10, 20, 30, 40, 50, 60
  explosiosBackAlpha: 1,
  explosiosFrontAlpha: 0.3,
  explosionsFrontSizeAdder: 0.2,

  /////////////////
  // DEPTHS
  /////////////////
  tankEnemyBodyZIndexDepth: 1,
  tankEnemyTurretZIndexDepth: 3,
  bulletEnemyExplosionBackZIndexDepth: 2,
  bulletEnemyExplosionFrontZIndexDepth: 4,

  tankPlayerBodyZIndexDepth: 3,
  tankPlayerTurretZIndexDepth: 5,
  bulletPlayerExplosionBackZIndexDepth: 4,
  bulletPlayerExplosionFrontZIndexDepth: 6,

  controlsZIndexDepth: 7,
  shootLineZIndexDepth: 4,
  statusBarZIndexDepth: 7,
  gateZIndexDepth: 7,

  /////////////////
  // SOUNDS
  /////////////////
  soundsGatesNumGenerate: 10,
  soundMovementBaseVolume: 0.26,
  soundMovement: false,
  soundFireBaseVolume: 0.08,
  numFireSoundsPerTank: 10,

  /////////////////
  // CONTROLS
  /////////////////
  controlsTouchMultplier: 0.1,
  controlsTouchYOffset: -20,
  controlsRightJoysticDeadZone: 10,
  controlsMobileThumbActiveAlpha: 0.5,
  controls1DAbsoluteScreenPositions: {
    left: new Phaser.Math.Vector2(1 / 4, 3 / 4),
    center: new Phaser.Math.Vector2(1 / 2, 3 / 4),
    right: new Phaser.Math.Vector2(3 / 4, 3 / 4),
  },

  /////////////////
  // TANK
  /////////////////
  tankCreateNumRowsAhead: 10,
  tankDestroyNumRowsBehind: 7,
  tankEnemiesFire: true,
  tankMaxSpeed: 500,
  // tankMaxSpeed: 250,
  tankOffScreenOffset: 300,
  playerOriginPercentageDownScreen: isMobile ? 8 / 10 : 9 / 10,
  tankPercentageSetOriginXRatio: 0.5,
  tankPercentageSetOriginYRatio: 0.7,
  tankDeadTintColor: 0x555555,
  tankDeadAlpha: 0.7,
  tankPlayerColor: 0x88ffff,
  tankEnemyColorCircleSingle: 0xccaa88,
  tankEnemyColorBoxSingle: 0xcc6688,
  tankEnemyColorBoxDouble: 0xcc22aa,
  tankEnemyColorBoxTriple: 0xcc55ff,

  tankKeepVelocity: 0.95,
  tankEnemyPercentShooting: 0.02,
  tankSpriteMuzzleAlpha: 0,
  tankFireMinUpdatesBetween: 16,
  tankPlayerFireCost: 10,
  tankEnemyFireCost: 50,
  tankFireReplenshRate: 0.3,
  tankEnemeyEnemyExplodes: false,
  tankPlayerEnemyExplodes: false,
  tankPlayerHealthInit: 50,
  tankEnemyHealthCircleSingleInit: 15,
  tankEnemyHealthBoxSingleInit: 20,
  tankEnemyHealthBoxDoubleInit: 25,
  tankEnemyHealthBoxTripleInit: 30,
  tankDeadGoneDelay: 100_000,

  /////////////////
  // LINE
  /////////////////
  lineSegmentDrawLines: false,
  lineSegmentKeepSegmentFrames: 10,
  lineSegmentWidthLine: 6,

  /////////////////
  // BULLET
  /////////////////
  bulletMaxPerTankPlayer: 500,
  bulletMaxPerTankEnemy: 100,
  bulletNumUpdatesSkip: 3, // 6 is best so far
  bulletMaxSpeed: 400,
  bulletFireRate: 1,
  bulletAdditionRotationRad: Math.PI / 32,
  bulletLineSegmentAlphaChange: true,
  bulletSpriteScale: 0.12,
  // bulletSpriteScale: Number.MIN_VALUE,
  bulletsNumBulletExplosions: 10,
  bulletsEmitterLifespan: 300,
  bulletsEmitterRandomness: 30,
  emitterScaleStart: 0.06,
  bulletsCollidePlatforms: false,

  /////////////////
  // GATE
  /////////////////
  gateStarsAtIntersects: false,
  gateLineWidth: 4,
  gateCircleRadius: 20,
  gateCircleSmallRadius: 7,
  gateFontSize: 20,
  gateDelayedCallDuration: 100,
  gateDurationRepeatPlaySound: 50,
  gateMultiPlaySound: false,
  gateBulletSpawnPointOffset: 0,
  colorMirrorLow: 0x22ccff,
  colorMirrorHigh: 0x2288ff,
  colorNormalLow: 0xff0022,
  colorNormalHigh: 0xff2244,
  colorRefractLow: 0x22aa22,
  colorRefractHigh: 0x44ff44,

  /////////////////
  // BLOCKS
  /////////////////
  blockHeight: 34,
  blockWidth: 34,
  gateArrowAngleUsesTurretAngle: true,
};

// make type from object keys
export type DebugOptions = {
  debugMode: boolean;
  bulletNumUpdatesSkip: number;
  fullScreen: boolean;
  cameraFollowHorizontal: boolean;
  tankExplosionsBackFrameRate: number;
  tankExplosionsFrontFrameRate: number;
  explosionsBackFrameRate: number;
  bulletsEmitterRandomness: number;
  emitterScaleStart: number;
  explosionsFrontFrameRate: number;

  explosiosBackAlpha: number;
  explosiosFrontAlpha: number;
  explosionsFrontSizeAdder: number;
  tankEnemyBodyZIndexDepth: number;
  tankPlayerFireCost: number;
  tankCreateNumRowsAhead: number;
  tankDestroyNumRowsBehind: number;
  defaultTankStartYRatio: number;
  tankEnemyFireCost: number;
  tankEnemyTurretZIndexDepth: number;
  bulletMaxSpeed: number;
  bulletEnemyExplosionBackZIndexDepth: number;
  bulletEnemyExplosionFrontZIndexDepth: number;
  tankPlayerBodyZIndexDepth: number;
  tankPlayerTurretZIndexDepth: number;
  bulletPlayerExplosionBackZIndexDepth: number;
  bulletPlayerExplosionFrontZIndexDepth: number;
  controlsZIndexDepth: number;
  shootLineZIndexDepth: number;
  bulletSpriteScale: number;
  lineSegmentKeepSegmentFrames: number;
  tankEnemeyEnemyExplodes: boolean;
  tankPlayerEnemyExplodes: boolean;
  tankEnemyHealthBoxSingleInit: number;
  tankEnemyHealthBoxDoubleInit: number;
  tankEnemyHealthBoxTripleInit: number;
  bulletsEmitterLifespan: number;
  statusBarZIndexDepth: number;
  gateZIndexDepth: number;
  tankEnemyColorBoxSingle: number;
  tankEnemyColorBoxDouble: number;
  tankEnemyColorBoxTriple: number;
  bulletsCollidePlatforms: boolean;
  gameBoundaryExtraPadding: number;
  defaultLevel: LevelType;
  soundsGatesNumGenerate: number;
  soundMovementBaseVolume: number;
  tankFireReplenshRate: number;
  soundFireBaseVolume: number;
  soundMovement: boolean;
  numFireSoundsPerTank: number;
  controlsTouchMultplier: number;
  tankPlayerHealthInit: number;
  tankEnemyHealthCircleSingleInit: number;
  controlsTouchYOffset: number;
  controlsRightJoysticDeadZone: number;
  controlsMobileThumbActiveAlpha: number;

  defaultControlsTypeMobile: GameControlsMobileType;
  controls1DAbsoluteScreenPositions: {
    left: Phaser.Math.Vector2;
    center: Phaser.Math.Vector2;
    right: Phaser.Math.Vector2;
  };
  cameraLarping: number;
  defaultCameraZoom: number;
  tankEnemiesFire: boolean;
  tankMaxSpeed: number;
  lineSegmentWidthLine: number;
  tankOffScreenOffset: number;
  playerOriginPercentageDownScreen: number;
  tankPercentageSetOriginXRatio: number;
  lineSegmentDrawLines: boolean;
  tankPercentageSetOriginYRatio: number;
  tankDeadTintColor: number;
  tankDeadAlpha: number;
  tankPlayerColor: number;
  tankEnemyColorCircleSingle: number;
  tankKeepVelocity: number;
  tankEnemyPercentShooting: number;
  tankSpriteMuzzleAlpha: number;
  bulletsNumBulletExplosions: number;
  tankFireMinUpdatesBetween: number;
  tankDeadGoneDelay: number;
  bulletMaxPerTankPlayer: number;
  bulletMaxPerTankEnemy: number;
  bulletFireRate: number;
  bulletAdditionRotationRad: number;
  bulletLineSegmentAlphaChange: boolean;
  gateStarsAtIntersects: boolean;
  gateLineWidth: number;
  gateCircleRadius: number;
  gateCircleSmallRadius: number;
  gateFontSize: number;
  gateArrowAngleUsesTurretAngle: boolean;
  gateDelayedCallDuration: number;
  gateDurationRepeatPlaySound: number;
  gateMultiPlaySound: boolean;
  gateBulletSpawnPointOffset: number;
  colorMirrorLow: number;
  colorMirrorHigh: number;
  colorNormalLow: number;
  colorNormalHigh: number;
  colorRefractLow: number;
  colorRefractHigh: number;
  blockHeight: number;
  blockWidth: number;
  defaultFankForceForward: boolean;
  tankForceForwardSpeed: number;
};
