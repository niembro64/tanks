import { PillType } from '../../../types';
import { getNoteDownScaleIonian } from '../helpers/sound';
import { Game } from '../scenes/Game';
import { Tank, upgradeTank } from './Tank';

export class Pill extends Phaser.Physics.Arcade.Sprite {
  scene: Game;
  type: PillType;
  pillsArray: Pill[];
  sound!: Phaser.Sound.BaseSound;
  spriteExplosion: Phaser.GameObjects.Sprite | null = null;

  constructor(params: { scene: Game; x: number; y: number; type: PillType; pillArray: Pill[] }) {
    const { scene, x, y, type, pillArray } = params;

    let useImage: string;
    let soundRate: number;
    switch (type) {
      case 'p-hlth':
        useImage = 'health';
        soundRate = getNoteDownScaleIonian({
          noteIndex: 0,
          noteOffset: -6,
        });
        break;
      case 'p-rchg':
        useImage = 'ammo_3';
        soundRate = getNoteDownScaleIonian({
          noteIndex: 1,
          noteOffset: -6,
        });
        break;
      case 'p-time':
        soundRate = getNoteDownScaleIonian({
          noteIndex: 2,
          noteOffset: -6,
        });
        useImage = 'time';
        break;
      case 'p-upgr':
        soundRate = getNoteDownScaleIonian({
          noteIndex: 3,
          noteOffset: -6,
        });
        useImage = 'upgrade';
        break;
      default:
        throw new Error('Invalid pill type');
    }

    super(scene, x, y, useImage);

    this.sound = scene.sound.add('sound_pill_upgrade', { volume: 0.5, rate: soundRate });

    this.setScale(0.5);
    this.setTint(scene.gameDebugOptions.tankPlayerColor);

    this.scene = scene;
    this.type = type;
    this.setOrigin(0.5, 0.3);
    this.scene.physics.add.existing(this);
    this.scene.add.existing(this);

    this.pillsArray = pillArray;
    pillArray.push(this);

    scene.physics.add.overlap(scene.player, this, (player, pill) => {
      const p: Tank = player as Tank;
      const pi: Pill = pill as Pill;

      const { type } = pi;

      this.sound.play();
      this.spriteExplosion = this.scene.add.sprite(this.x, this.y, 'explosion256');
      this.spriteExplosion.setDepth(1000);
      this.spriteExplosion.setPosition(this.x, this.y);
      this.spriteExplosion.setScale(4);
      this.spriteExplosion.setTintFill(this.scene.player.color);

      this.spriteExplosion.anims.play('explosion_animation_60');

      switch (type) {
        case 'p-hlth':
          p.statusBarHealth.increase(p.statusBarHealth.maxValue / 2);
          break;
        case 'p-rchg':
          p.statusBarFire.setFull();
          p.fireReplenishRate = p.fireReplenishRate * 1.5;
          break;
        case 'p-time':
          p.statusBarFire.setFull();
          if (p.fireMinUpdatesBetween > 0) {
            p.fireMinUpdatesBetween = Math.floor(p.fireMinUpdatesBetween / 2);
          }
          break;
        case 'p-upgr':
          upgradeTank(p);
          break;
        default:
      }

      pi.destroy();
    });
  }
}
