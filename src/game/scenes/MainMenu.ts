import { Scene } from 'phaser';

import {
  GameControlsMobileType,
  LevelType,
  MovementOptionsType,
  ScenePassingData,
  ZoomLevelType,
  gameControlsMobileArray,
  levelType,
  movementOptions,
  zoomLevels,
} from '../../../types';
import { debugOptionsInit, isMobile } from '../../debugOptions';
import { EventBus } from '../EventBus';

export class MainMenu extends Scene {
  logoTween: Phaser.Tweens.Tween | null = null;
  logo: Phaser.GameObjects.Image | null = null;

  controlButtonStates: boolean[] = [];
  controlButtons: Phaser.GameObjects.Text[] = [];
  levelButtonStates: boolean[] = [];
  levelButtons: Phaser.GameObjects.Text[] = [];
  forceForwardButtonStates: boolean[] = [];
  forceForwardButtons: Phaser.GameObjects.Text[] = [];
  zoomButtonStates: boolean[] = [];
  zoomButtons: Phaser.GameObjects.Text[] = [];
  cameraFollowHorizontalStates: boolean[] = [];
  cameraFollowHorizontalButtons: Phaser.GameObjects.Text[] = [];

  startButton: Phaser.GameObjects.Text;
  buttonSpacing: number = 28;
  listTextSize: number = 20;

  buttonColorTrue: string = '#ffffff';
  buttonColorFalse: string = '#005588';

  constructor() {
    super('MainMenu');
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = 60;

    this.addTitle(centerX, centerY);
    EventBus.emit('current-scene-ready', this);

    this.startButton = this.createStartButton(centerX, centerY + 100);

    this.initializeButtonStates();

    let buttonsOffsetY = centerY + 150;

    this.createLevelButtons(centerX, buttonsOffsetY);
    buttonsOffsetY += this.levelButtonStates.length * this.buttonSpacing + this.buttonSpacing / 2;
    this.createForceForwardButtons(centerX, buttonsOffsetY);
    buttonsOffsetY += this.forceForwardButtonStates.length * this.buttonSpacing + this.buttonSpacing / 2;
    this.createZoomButtons(centerX, buttonsOffsetY);
    buttonsOffsetY += this.zoomButtonStates.length * this.buttonSpacing + this.buttonSpacing / 2;
    this.createCameraFollowButtons(centerX, buttonsOffsetY);

    if (isMobile) {
      buttonsOffsetY += this.cameraFollowHorizontalButtons.length * this.buttonSpacing + this.buttonSpacing / 2;
      this.createControlButtons(centerX, buttonsOffsetY);
    }
  }

  addTitle(centerX: number, centerY: number) {
    this.add
      .text(centerX, centerY, 'Tanks Runner', {
        fontFamily: 'Arial Black',
        fontSize: 38,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      })
      .setDepth(100)
      .setOrigin(0.5);
  }

  createStartButton(centerX: number, centerY: number) {
    return this.add
      .text(centerX, centerY, 'Start Game', {
        fontFamily: 'Arial',
        fontSize: 32,
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
        align: 'center',
      })
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => this.changeScene());
  }

  initializeButtonStates() {
    this.controlButtonStates = this.createButtonStates(
      [...gameControlsMobileArray] as string[], // Making a mutable copy
      debugOptionsInit.defaultControlsTypeMobile,
    );
    this.levelButtonStates = this.createButtonStates([...levelType], debugOptionsInit.defaultLevel);
    this.forceForwardButtonStates = debugOptionsInit.defaultFankForceForward ? [true, false] : [false, true];
    this.zoomButtonStates = isMobile ? [true, false, false, false] : [true, false, false, false];
    this.cameraFollowHorizontalStates = isMobile ? [true, false] : [false, true];
  }

  createButtonStates(array: string[], activeValue: string): boolean[] {
    return array.map((value) => value === activeValue);
  }

  createControlButtons(centerX: number, startY: number) {
    this.createButtons<GameControlsMobileType>(
      [...gameControlsMobileArray],
      this.controlButtonStates,
      this.controlButtons,
      centerX,
      startY,
      'control',
    );
  }

  createLevelButtons(centerX: number, startY: number) {
    this.createButtons<LevelType>([...levelType], this.levelButtonStates, this.levelButtons, centerX, startY, 'level');
  }

  createForceForwardButtons(centerX: number, startY: number) {
    this.createButtons<MovementOptionsType>(
      [...movementOptions],
      this.forceForwardButtonStates,
      this.forceForwardButtons,
      centerX,
      startY,
      'force',
    );
  }

  createZoomButtons(centerX: number, startY: number) {
    const titles = zoomLevels.map((level) => `zoom-${level * 100}%`);
    this.createButtons(titles, this.zoomButtonStates, this.zoomButtons, centerX, startY, 'zoom');
  }

  createCameraFollowButtons(centerX: number, startY: number) {
    const titles = ['follow-horizontal', 'no-horizontal'];
    this.createButtons(
      titles,
      this.cameraFollowHorizontalStates,
      this.cameraFollowHorizontalButtons,
      centerX,
      startY,
      'camera',
    );
  }

  createButtons<T>(
    titles: T[],
    states: boolean[],
    buttons: Phaser.GameObjects.Text[],
    centerX: number,
    startY: number,
    type: 'control' | 'level' | 'force' | 'zoom' | 'camera',
  ) {
    for (let i = 0; i < titles.length; i++) {
      const button = this.add
        .text(centerX, startY + i * this.buttonSpacing, String(titles[i]), {
          fontFamily: 'Arial',
          fontSize: this.listTextSize,
          color: states[i] ? this.buttonColorTrue : this.buttonColorFalse,
          padding: { left: 10, right: 10, top: 5, bottom: 5 },
          align: 'center',
        })
        .setOrigin(0.5)
        .setInteractive()
        .on('pointerdown', () => this.toggleButtonState(i, type));

      buttons.push(button);
    }
  }

  toggleButtonState(index: number, type: 'control' | 'level' | 'force' | 'zoom' | 'camera') {
    let buttonStates, buttons;

    switch (type) {
      case 'control':
        buttonStates = this.controlButtonStates;
        buttons = this.controlButtons;
        break;
      case 'level':
        buttonStates = this.levelButtonStates;
        buttons = this.levelButtons;
        break;
      case 'force':
        buttonStates = this.forceForwardButtonStates;
        buttons = this.forceForwardButtons;
        break;
      case 'zoom':
        buttonStates = this.zoomButtonStates;
        buttons = this.zoomButtons;
        break;
      case 'camera':
        buttonStates = this.cameraFollowHorizontalStates;
        buttons = this.cameraFollowHorizontalButtons;
        break;
      default:
        throw new Error('Invalid button type');
    }

    for (let i = 0; i < buttonStates.length; i++) {
      buttonStates[i] = i === index;
      buttons[i].setColor(buttonStates[i] ? this.buttonColorTrue : this.buttonColorFalse);
    }

    const anyControlSelected = this.controlButtonStates.some((state) => state);
    const anyLevelSelected = this.levelButtonStates.some((state) => state);
    this.startButton.setVisible(anyControlSelected && anyLevelSelected);
  }

  changeScene() {
    if (this.logoTween) {
      this.logoTween.stop();
      this.logoTween = null;
    }

    const selectedControl = gameControlsMobileArray[this.controlButtonStates.indexOf(true)];
    const selectedLevel = levelType[this.levelButtonStates.indexOf(true)];
    const selectedZoomIndex = this.zoomButtonStates.indexOf(true);
    const selectedZoomAmount: ZoomLevelType = zoomLevels[selectedZoomIndex];
    const selectedLevelChunks = selectedLevel.split('-');
    const isForceForwardLevel: boolean = selectedLevelChunks.some((chunk) => chunk === 'level');
    const isForceForwardSelection = this.forceForwardButtonStates[0];
    const actualForceForward = isForceForwardLevel ? isForceForwardSelection : false;

    const selectedCameraFollowHorizontal = this.cameraFollowHorizontalStates[0];

    const params: ScenePassingData = {
      selectedControl,
      selectedLevel,
      selectedForceForward: actualForceForward,
      selectedZoom: selectedZoomAmount,
      selectedCameraFollowHorizontal: selectedCameraFollowHorizontal,
    };

    this.scene.start('Game', params);
  }

  moveLogo(reactCallback) {
    if (this.logoTween) {
      if (this.logoTween.isPlaying()) {
        this.logoTween.pause();
      } else {
        this.logoTween.play();
      }
    } else {
      this.logoTween = this.tweens.add({
        targets: this.logo,
        x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
        y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
        yoyo: true,
        repeat: -1,
        onUpdate: () => {
          if (reactCallback && this.logo) {
            reactCallback({
              x: Math.floor(this.logo.x),
              y: Math.floor(this.logo.y),
            });
          }
        },
      });
    }
  }
}
