import { getNoteDownScaleSakura, getNoteHarmonicSeriesCustom } from './src/game/helpers/sound';
import { Game } from './src/game/scenes/Game';

export type GameState = 'init' | 'playing' | 'win' | 'lose';

export type PillType = 'p-hlth' | 'p-rchg' | 'p-time' | 'p-upgr';

export type TankState = 'alive' | 'dead' | 'gone';

export type TankMovementType = 'move' | 'stationary' | 'controls';

export type TankEnemyType = 'turret-fixed' | 'turret-moving' | 'turret-aiming';

export type TankType =
  | 'tank_turret_circle_single'
  | 'tank_turret_box_single'
  | 'tank_turret_box_double'
  | 'tank_turret_box_triple';

export type GateType = 'normal' | 'refract' | 'mirror';

export type GateOrientationType = 'horizontal' | 'vertical' | 'diagonal-backslash' | 'diagonal-forwardslash';

export type SoundPlayRateFunction = (params: { noteIndex: number; noteOffset: number }) => number;

export const movementOptions = ['force-forward', 'free-roam'] as const;

export type MovementOptionsType = (typeof movementOptions)[number];

export const scalesAndFunctions: ScaleFunctionObject[] = [
  // {
  //   scale: 'demo-scale-pentatonic',
  //   function: getNoteDownScalePentatonic,
  // },
  {
    scale: 'demo-scale-harmonic',
    function: getNoteHarmonicSeriesCustom,
  },
  {
    scale: 'demo-scale-sakura',
    function: getNoteDownScaleSakura,
  },
  // {
  //   scale: 'demo-scale-crystal-4',
  //   function: getNoteDownScaleCrystal4,
  // },
  // {
  //   scale: 'demo-scale-crystal-5',
  //   function: getNoteDownScaleCrystal5,
  // },
];

export const levelType = [
  'demo-scale-harmonic',
  'demo-scale-sakura',
  // 'demo-scale-pentatonic',
  // 'demo-scale-crystal-4',
  // 'demo-scale-crystal-5',
  // 'demo-level-random',
  // 'demo-level-0',
  // 'demo-level-1',
  'demo-level-2',
] as const;

export type LevelType = (typeof levelType)[number];

export type SoundVolumeFunction = (multiplier: number) => number;

export type GateConstructorParams = {
  scene: Game;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  multiplier: number;
  gateType: GateType;
  functionSoundPlayRate: SoundPlayRateFunction;
  functionSoundVolume: SoundVolumeFunction;
};

export const zoomLevels = [1, 0.75, 0.5, 0.40] as const;

export type ZoomLevelType = (typeof zoomLevels)[number];

export const gameControlsMobileArray = [
  'double-circular-relative',
  'double-arc-relative',
  'double-arc-absolute',
  'single-arc-absolute',
] as const;

export type GameControlsMobileType = (typeof gameControlsMobileArray)[number];

export type Controls1DAbsoluteDownPositionObject = {
  left: Phaser.Math.Vector2;
  center: Phaser.Math.Vector2;
  right: Phaser.Math.Vector2;
};

export type ScenePassingData = {
  selectedControl: GameControlsMobileType;
  selectedLevel: LevelType;
  selectedForceForward: boolean;
  selectedZoom: number;
  selectedCameraFollowHorizontal: boolean;
};

export type ScaleFunctionObject = {
  scale: LevelType;
  function: SoundPlayRateFunction;
};

const characterBlock = '█';
const characterBlockAlpha = '▒';
const characterBlockBeta = '░';

export type GameSpotTypePlatformNormal = '██████';
export type GameSpotTypePlatformCollide = '░░░░░░';
export type GameSpotTypeNothing = '      ';
export type GameSpotTypeOther = string;

export type GameSpotType =
  | PillType
  | GameSpotTypeOther
  | GameSpotTypePlatformNormal
  | GameSpotTypeNothing
  | GameSpotTypePlatformCollide;

// Utility type to create a tuple with N elements of type T
type Tuple<T, N extends number, R extends any[] = []> = R['length'] extends N ? R : Tuple<T, N, [T, ...R]>;

// GameRow with exactly 9 GameAddObject elements
export type GameRow = { speed: number; row: Tuple<GameSpotType, 10> };

export type GameMatrix = GameRow[];
