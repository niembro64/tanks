import Phaser, { Scene } from 'phaser';

import { GameMatrix, GameState, ScenePassingData } from '../../../types';
import { DebugOptions, debugOptionsInit } from '../../debugOptions';
import { EventBus } from '../EventBus';
import gameCreateFullscreenButton from '../components/FullScreenButton';
import { GameControls } from '../components/GameControls';
import { Gate } from '../components/Gate';
import { Pill } from '../components/Pill';
import { Tank } from '../components/Tank';
import {
  gameCreateBackgroundThemeMusic,
  gameCreateChooseCrosshairsLine,
  gameCreateControls,
  gameCreateExplosionAnimations,
  gameCreateLevel,
} from '../helpers/helpers';
import { updateGame } from './GameUpdate';

// Phaser Version 3.80.1

export class Game extends Scene {
  gameMatrix: GameMatrix | null = null;
  gameState: GameState = 'init';
  player: Tank;
  gameRowIndexCurr: number | null = null;
  gameRowIndexPrev: number | null = null;
  gameCreateRowIndex: number | null = null;

  playerSpeedMultiplier: number = 0;
  playerVerticalPositionCentered: Phaser.Physics.Arcade.Sprite;
  gameDebugOptions: DebugOptions;
  enemies: Tank[] = [];
  pillsHealth: Pill[] = [];
  pillsAmmo: Pill[] = [];
  pillsTime: Pill[] = [];
  gameControls: GameControls;
  gates: Gate[] = [];
  updateIndex: number = 0;
  backgroundMusic!: Phaser.Sound.BaseSound;
  platformsCollide: Phaser.Physics.Arcade.StaticGroup;
  platformsNormal: Phaser.Physics.Arcade.StaticGroup;
  nextTankEnemyIndex: number = 0;

  cursorCurrentPositionInGameWorld!: Phaser.Math.Vector2;

  crossHairsLineCenterCursor: Phaser.GameObjects.Line | null = null;
  crossHairsLinePlayerAngle: Phaser.GameObjects.Line | null = null;
  crossHairsLinePlayerCursor: Phaser.GameObjects.Line | null = null;

  constructor() {
    super('Game');

    this.cursorCurrentPositionInGameWorld = new Phaser.Math.Vector2(0, 0);
  }

  preload() {
    this.load.setPath('assets');

    ///////////////////////////////
    // FONTS
    ///////////////////////////////
    this.load.bitmapFont('p2', 'PressStart2P.png', 'PressStart2P.xml');

    ///////////////////////////////
    // SPRITESHEETS
    ///////////////////////////////
    this.load.spritesheet({
      key: 'explosion256',
      url: 'explosion_64.png',
      frameConfig: {
        frameWidth: 64,
        frameHeight: 64,
        startFrame: 0,
        endFrame: 47,
        margin: 0,
        spacing: 0,
      },
    });
    // this.load.spritesheet({
    //   key: 'explosion256',
    //   url: 'explosion_128.png',
    //   frameConfig: {
    //     frameWidth: 128,
    //     frameHeight: 128,
    //     startFrame: 0,
    //     endFrame: 47,
    //     margin: 0,
    //     spacing: 0,
    //   },
    // });
    // this.load.spritesheet({
    //   key: 'explosion256',
    //   url: 'explosion_256.png',
    //   frameConfig: {
    //     frameWidth: 256,
    //     frameHeight: 256,
    //     startFrame: 0,
    //     endFrame: 47,
    //     margin: 0,
    //     spacing: 0,
    //   },
    // });
    ///////////////////////////////
    // SPRITESHEETS
    ///////////////////////////////
    this.load.spritesheet('fullscreen', 'fullscreen.png', {
      frameWidth: 64,
      frameHeight: 64,
    });

    ///////////////////////////////
    // PILLS
    ///////////////////////////////
    this.load.audio('sound_pill_upgrade', 'start-reverb.wav');
    this.load.image('upgrade', 'pill_arrow_up.png');
    this.load.image('time', 'time.png');
    this.load.image('ammo', 'ammo.png');
    this.load.image('ammo_3', 'ammo_3.png');
    this.load.image('health', 'health.png');
    ///////////////////////////////
    // IMAGES
    ///////////////////////////////
    this.load.image('arrow', 'arrow_trans.png');
    this.load.image('arrow_double', 'arrow_double_length.png');
    this.load.image('arrow_double_farther', 'arrow_double_length_farther.png');
    this.load.image('checkerboard', 'checkerboard.png');
    this.load.image('dirt_0', 'dirt_0.png');
    this.load.image('thumb_outline', 'circle_trans_white_outline.png');
    this.load.image('tail', 'tail.png');
    this.load.image('tail_tiny', 'tail_tiny.png');
    this.load.image('logo', 'logo.png');
    this.load.image('star', 'star_90.png');
    this.load.image('bullet', 'bullet_tip_isometric.png');
    this.load.image('rocket', 'missile.png');
    this.load.image('player', 'guy_teal.png');
    this.load.image('tank_body', 'tank_body.png');
    this.load.image('bullet', 'bullet_green.png');

    // TANK TURRETS
    this.load.image('tank_turret_box_triple', 'tank_turret_cropped_triple.png');
    this.load.image('tank_turret_box_double', 'tank_turret_cropped_double.png');
    this.load.image('tank_turret_box_single', 'tank_turret_cropped.png');
    this.load.image('tank_turret_circle_single', 'tank turret_circle_smaller_lighter.png');

    // BRICKS
    this.load.image('brick', 'blockcracked.png');
    this.load.image('brickvert', 'brickvert.bmp');
    this.load.image('brickvertshort', 'brickvertshort.bmp');
    this.load.image('brickhoriz', 'brickhoriz.bmp');
    this.load.image('brickhorizshort', 'brickhorizshort.bmp');
    this.load.image('brickhorizshorter', 'brickhorizshorter.bmp');

    // blocks
    this.load.image('platform', 'platform_gray_3_100.png');
    this.load.image('platform_spike', 'platform_gray_3_100_spike.png');

    ///////////////////////////////
    // AUDIO | SOUND EFFECTS
    ///////////////////////////////
    this.load.audio('laser_tank', 'tank_laser_highpass.wav');
    this.load.audio('pluck_square_flat', 'pluck_square_medium.wav');
    this.load.audio('pluck_square_medium', 'pluck_square_medium.wav');
    this.load.audio('pluck_square_wiggle', 'pluck_square_wiggle.wav');
    this.load.audio('pluck_saw_flat', 'pluck_saw_flat.wav');
    this.load.audio('pluck_saw_medium', 'pluck_saw_flat.wav');
    this.load.audio('tank_moving', 'tank_move_2.wav');
    this.load.audio('shot', 'shot.wav');
    this.load.audio('explosion', 'explosion_shorter.wav');

    ///////////////////////////////
    // AUDIO | MUSIC
    ///////////////////////////////
    this.load.audio('song', 'tanksong_reverb.wav');
    this.load.audio('drums', 'drums_tanks_08.wav');
    // this.load.audio('drums', 'drums_tanks.wav');
  }

  init(data: ScenePassingData) {
    let bulletEmitterLifespan: number;
    switch (data.selectedLevel) {
      case 'demo-level-2':
        bulletEmitterLifespan = debugOptionsInit.bulletsEmitterLifespan;
        break;
      default:
        bulletEmitterLifespan = 0;
    }

    const newDebugOptions: DebugOptions = {
      ...debugOptionsInit,
      defaultControlsTypeMobile: data.selectedControl,
      defaultLevel: data.selectedLevel,
      defaultFankForceForward: data.selectedForceForward,
      bulletsEmitterLifespan: bulletEmitterLifespan,
      defaultCameraZoom: data.selectedZoom,
      cameraFollowHorizontal: data.selectedCameraFollowHorizontal,
    };

    this.gameDebugOptions = newDebugOptions;
  }

  create() {
    this.platformsCollide = this.physics.add.staticGroup();
    this.platformsNormal = this.physics.add.staticGroup();

    gameCreateExplosionAnimations(this);
    gameCreateBackgroundThemeMusic(this);
    gameCreateLevel(this);
    gameCreateChooseCrosshairsLine(this);
    gameCreateControls(this);
    gameCreateFullscreenButton(this);

    EventBus.emit('current-scene-ready', this);
  }

  update(time: number, delta: number): void {
    updateGame(this, time, delta);
  }
}
