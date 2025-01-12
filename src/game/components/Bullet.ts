import { getCircleOffsetPositionFromPoint } from '../helpers/math';
import { Game } from '../scenes/Game';
import { Gate } from './Gate';
import { Tank, fire } from './Tank';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  scene: Game;
  tank: Tank;
  posCurr!: Phaser.Math.Vector2;
  posPrev!: Phaser.Math.Vector2;
  speed!: number;
  emitter!: any;
  numUpdatesSeen: number = 0;
  color: number;
  spriteExplosionBack: Phaser.GameObjects.Sprite | null = null;
  spriteExplosionFront: Phaser.GameObjects.Sprite | null = null;

  constructor(param: {
    scene: Game;
    tank: Tank;
    posCurrX: number;
    posCurrY: number;
    speed: number;
    rotationRad: number;
    color: number;
  }) {
    const { scene, tank, posCurrX, posCurrY, speed, rotationRad: angleRad } = param;
    super(scene, posCurrX, posCurrY, 'bullet');

    this.posCurr = new Phaser.Math.Vector2(posCurrX, posCurrY);
    this.posPrev = new Phaser.Math.Vector2(posCurrX, posCurrY);

    this.scene = scene;
    this.speed = speed;
    this.color = tank.color;
    this.tank = tank;
    this.rotation = angleRad;

    this.setScale(scene.gameDebugOptions.bulletSpriteScale);
    this.setTint(this.color);
    this.setOrigin(0.5, 0.5);

    if (this.scene.gameDebugOptions.bulletsEmitterLifespan !== 0) {
      this.emitter = this.scene.add
        .particles(0, 0, 'tail', {
          speed: {
            min: 0,
            max: this.scene.gameDebugOptions.bulletsEmitterRandomness,
          },
          lifespan: this.scene.gameDebugOptions.bulletsEmitterLifespan,
          alpha: { start: 1, end: 0 },
          scale: {
            start: this.scene.gameDebugOptions.emitterScaleStart,
            end: 0,
          },
          follow: this,
          blendMode: 'SCREEN',
        })
        .start();
    }

    // this.emitter.setDepth(scene.gameDebugOptions.depth

    this.scene.physics.world.enable(this);
    this.tank.bullets.add(this);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }
}

export function calculateBulletRotationRadAllEqual(bullet: Bullet, index: number, numBullets: number): number {
  const isEven = numBullets % 2 === 0;

  switch (isEven) {
    case true:
      return bullet.rotation + (index - numBullets / 2) * bullet.scene.gameDebugOptions.bulletAdditionRotationRad;
    case false:
      return (
        bullet.rotation +
        Math.floor(index / 2) * bullet.scene.gameDebugOptions.bulletAdditionRotationRad * (index % 2 === 0 ? 1 : -1)
      );
  }
}

export function calculateItemRotationRadWithinArc(
  itemRotationRad: number,
  index: number,
  multiplierToUse: number,
  gate: Gate,
): number {
  if (index < 0 || index >= multiplierToUse) {
    throw new Error('Invalid index');
  }

  const gateRotationRad: number = gate.rotationRad;
  const gateNormalRotationRad: number = gateRotationRad + Math.PI / 2;

  let returnRotationRad: number;

  switch (gate.gateType) {
    case 'normal':
      ///////////////////////////////////////
      // BULLETS GO STRAIGHT
      ///////////////////////////////////////

      if (multiplierToUse === 1) {
        returnRotationRad = itemRotationRad;
        break;
      }

      const angleIncrement = (2 * gate.scene.gameDebugOptions.bulletAdditionRotationRad) / (multiplierToUse - 1);

      returnRotationRad =
        itemRotationRad - gate.scene.gameDebugOptions.bulletAdditionRotationRad + index * angleIncrement;
      break;
    case 'mirror':
      ///////////////////////////////////////
      // BULLETS MIRROR OFF GATE
      ///////////////////////////////////////

      // Calculate the angle of incidence
      const angleOfIncidenceMirror = itemRotationRad - gateRotationRad;

      // Calculate the reflection angle
      const reflectedAngleMirror = gateRotationRad - angleOfIncidenceMirror;

      // Normalize the resulting angle to be within 0 to 2π
      const newMirroredRotationRad = Phaser.Math.Angle.Wrap(reflectedAngleMirror);

      if (multiplierToUse === 1) {
        returnRotationRad = newMirroredRotationRad;
        break;
      }

      const angleIncrementMirror = (2 * gate.scene.gameDebugOptions.bulletAdditionRotationRad) / (multiplierToUse - 1);

      returnRotationRad =
        newMirroredRotationRad - gate.scene.gameDebugOptions.bulletAdditionRotationRad + index * angleIncrementMirror;

      break;
    case 'refract':
      ///////////////////////////////////////
      // BULLETS REFRACT OFF GATE
      ///////////////////////////////////////

      // Calculate the angle of incidence
      const angleOfIncidenceRefract = itemRotationRad - gateNormalRotationRad;

      // Calculate the reflection angle
      const reflectedAngleRefract = gateNormalRotationRad - angleOfIncidenceRefract;

      // Normalize the resulting angle to be within 0 to 2π
      const newRefractedRotationRad = Phaser.Math.Angle.Wrap(reflectedAngleRefract);

      if (multiplierToUse === 1) {
        returnRotationRad = newRefractedRotationRad;
        break;
      }

      const angleIncrementRefract = (2 * gate.scene.gameDebugOptions.bulletAdditionRotationRad) / (multiplierToUse - 1);

      returnRotationRad =
        newRefractedRotationRad - gate.scene.gameDebugOptions.bulletAdditionRotationRad + index * angleIncrementRefract;

      break;
    default:
      throw new Error('Invalid gate type');
  }

  return returnRotationRad;
}

export function duplicateBulletFromPoint(
  bullet: Bullet,
  intersectionPoint: Phaser.Math.Vector2,
  gate: Gate,
  game: Game,
) {
  if (!bullet.body) {
    return;
  }

  for (let i = 0; i < gate.multiplier; i++) {
    const newBulletRotationRad: number = calculateItemRotationRadWithinArc(bullet.rotation, i, gate.multiplier, gate);

    const spawnPoint: Phaser.Math.Vector2 = getCircleOffsetPositionFromPoint({
      position: intersectionPoint,
      distance: gate.scene.gameDebugOptions.gateBulletSpawnPointOffset,
      angleDeg: Phaser.Math.RadToDeg(newBulletRotationRad),
    });

    const spriteWidth = bullet.displayWidth;
    const spriteHeight = bullet.displayHeight;

    const spawnOffsetPoint: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
      spawnPoint.x + spriteWidth / 2,
      spawnPoint.y + spriteHeight / 2,
    );

    if (bullet.tank) {
      fire({
        posX: spawnOffsetPoint.x,
        posY: spawnOffsetPoint.y,
        angleRad: newBulletRotationRad,
        tank: bullet.tank,
        game: gate.scene,
      });
    }
  }

  bulletDestroyBullet(bullet, game);
}

export const bulletDestroyBullet = (bullet: Bullet, game: Game) => {
  if (bullet.emitter) {
    bullet.emitter.stop();
  }

  if (bullet) {
    bullet.destroy();
  }

  ///////////////////////////////////////////////////////
  // DESTROY EXPLOSION SPRITES
  ///////////////////////////////////////////////////////

  game.time.delayedCall(3000, () => {
    if (bullet && bullet.emitter) {
      bullet.emitter.destroy();
    }

    if (bullet && bullet.spriteExplosionBack) {
      bullet.spriteExplosionBack.destroy();
    }
    if (bullet && bullet.spriteExplosionFront) {
      bullet.spriteExplosionFront.destroy();
    }
  });
};

export const playBulletExplosion = (params: {
  bullet: Bullet;
  scale: number;
  depthExplosionBack: number;
  depthExplosionFront: number;
  location: Phaser.Math.Vector2;
}) => {
  const { bullet, scale, depthExplosionBack, depthExplosionFront, location } = params;

  ///////////////////////////////////////////////////////
  // BULLET SOUNDS
  ///////////////////////////////////////////////////////
  if (
    bullet &&
    bullet.scene &&
    bullet.tank &&
    bullet.tank.soundBulletFireSoundIndex !== undefined &&
    bullet.tank.soundBulletFireSoundIndex !== null &&
    bullet.scene.updateIndex - bullet.tank.soundBulletFireSoundUpdateIndex >=
      bullet.tank.soundBulletFireSoundMinUpdatesBetween
  ) {
    bullet.tank.soundBulletFireSoundUpdateIndex = bullet.scene.updateIndex;

    bullet.tank.soundBulletFireSoundIndex =
      bullet.tank.soundBulletFireSoundIndex % bullet.scene.gameDebugOptions.bulletsNumBulletExplosions;

    bullet.tank.soundBulletFireSound[bullet.tank.soundBulletFireSoundIndex].play();
  }

  ///////////////////////////////////////////////////////
  // BULLET EXPLOSION ANIMATION
  ///////////////////////////////////////////////////////
  if (!bullet || bullet.spriteExplosionBack === null) {
    bullet.spriteExplosionBack = bullet.scene.add.sprite(location.x, location.y, 'explosion256');
  }

  if (!bullet || bullet.spriteExplosionFront === null) {
    bullet.spriteExplosionFront = bullet.scene.add.sprite(location.x, location.y, 'explosion256');
  }

  bullet.spriteExplosionBack.setPosition(bullet.x, bullet.y);
  bullet.spriteExplosionFront.setPosition(bullet.x, bullet.y);

  const newScale = scale * 2;

  const rotationBack = Math.random() * Math.PI * 2;
  const rotationFront = Math.random() * Math.PI * 2;

  bullet.spriteExplosionBack.setScale(newScale);
  bullet.spriteExplosionBack.setAlpha(bullet.scene.gameDebugOptions.explosiosBackAlpha);
  bullet.spriteExplosionBack.setDepth(depthExplosionBack);
  bullet.spriteExplosionBack.setRotation(rotationBack);
  bullet.spriteExplosionBack.anims.play('explosion_animation_' + bullet.scene.gameDebugOptions.explosionsBackFrameRate);

  bullet.spriteExplosionFront.setScale(newScale + bullet.scene.gameDebugOptions.explosionsFrontSizeAdder);
  bullet.spriteExplosionFront.setAlpha(bullet.scene.gameDebugOptions.explosiosFrontAlpha);
  bullet.spriteExplosionFront.setDepth(depthExplosionFront);
  bullet.spriteExplosionFront.setRotation(rotationFront);
  bullet.spriteExplosionFront.anims.play(
    'explosion_animation_' + bullet.scene.gameDebugOptions.explosionsFrontFrameRate,
  );
};
