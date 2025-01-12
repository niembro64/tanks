import { Scene } from 'phaser';



import { EventBus } from '../EventBus';


// get screen width from browser
const screenWidth = window.innerWidth;
// get screen height from browser
const screenHeight = window.innerHeight;
export class GameOver extends Scene {
  constructor() {
    super('GameOver');
  }

  create() {
    this.cameras.main.setBackgroundColor(0x660000);

    this.add.image(screenWidth / 2, screenHeight / 2, 'checkerboard').setAlpha(0.5);

    this.add
      .text(screenWidth / 2, screenHeight / 2, 'Game Over', {
        fontFamily: 'Arial Black',
        fontSize: 64,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      })
      .setOrigin(0.5)
      .setDepth(100);

    // button to go back to main menu
    // const button = this.add
    //   .text(screenWidth / 2, screenHeight / 2 + 100, 'Main Menu', {
    //     fontFamily: 'Arial',
    //     fontSize: 32,
    //     color: '#ffffff',
    //     backgroundColor: '#000000',
    //     padding: { left: 10, right: 10, top: 5, bottom: 5 },
    //     align: 'center',
    //   })
    //   .setOrigin(0.5)
    //   .setDepth(100)
    //   .setInteractive();

    // button.on('pointerdown', () => {
    //   this.scene.start('MainMenu');
    // });

    EventBus.emit('current-scene-ready', this);
  }

  changeScene() {
    this.scene.start('MainMenu');
  }
}
