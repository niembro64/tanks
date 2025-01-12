import { GateConstructorParams, GateType } from '../../../types';
import { debugOptionsInit } from '../../debugOptions';
import { getColorHexNumberFromColorString, getColorStringFromHexNumber, interpolateColor } from '../helpers/color';
import { Game } from '../scenes/Game';
import { calculateItemRotationRadWithinArc } from './Bullet';

export class Gate {
  scene: Game;
  gateType!: GateType;
  graphics: Phaser.GameObjects.Graphics;
  pointStart: Phaser.Math.Vector2;
  pointEnd: Phaser.Math.Vector2;
  multiplier: number;
  text: Phaser.GameObjects.Text | null = null;
  originalColor: number = 0xffffff;
  flashingFlag: boolean = false;
  gateSounds: Phaser.Sound.BaseSound[] = [];
  gateSoundsIndex: number = 0;
  rotationRad!: number;
  soundPlayRate!: number;
  soundVolumeBase!: number;
  spriteArrow: Phaser.GameObjects.Sprite | null = null;

  constructor(params: GateConstructorParams) {
    const { scene, startX, startY, endX, endY, multiplier, gateType, functionSoundPlayRate, functionSoundVolume } =
      params;

    this.scene = scene;
    this.gateType = gateType;
    this.multiplier = multiplier;

    let lowColor: number;
    let highColor: number;
    switch (gateType) {
      case 'mirror':
        lowColor = debugOptionsInit.colorMirrorLow;
        highColor = debugOptionsInit.colorMirrorHigh;
        break;
      case 'normal':
        lowColor = debugOptionsInit.colorNormalLow;
        highColor = debugOptionsInit.colorNormalHigh;
        break;
      case 'refract':
        lowColor = debugOptionsInit.colorRefractLow;
        highColor = debugOptionsInit.colorRefractHigh;
        break;
      default:
        throw new Error(`Invalid gate type: ${gateType}`);
    }

    if (multiplier === 0) {
      this.originalColor = 0x888888;
    } else {
      this.originalColor = interpolateColor(lowColor, highColor, 1 / (multiplier + 1));
    }

    const arrowX = (startX + endX) / 2;
    const arrowY = (startY + endY) / 2;

    if (multiplier > 0) {
      this.spriteArrow = this.scene.add
        .sprite(arrowX, arrowY, 'arrow_double_farther')
        .setOrigin(0.5, 0.5)
        .setScale(0.05)
        .setTintFill(this.originalColor)
        .setAlpha(1)
        .setDepth(0);
    }

    this.soundPlayRate = functionSoundPlayRate({
      noteIndex: multiplier,
      noteOffset: -8,
    });
    this.soundVolumeBase = functionSoundVolume(multiplier);

    this.graphics = this.scene.add.graphics({
      lineStyle: {
        width: debugOptionsInit.gateLineWidth,
        color: this.originalColor,
      },
    });
    this.pointStart = new Phaser.Math.Vector2(startX, startY);
    this.pointEnd = new Phaser.Math.Vector2(endX, endY);

    this.rotationRad = Phaser.Math.Angle.Between(
      this.pointStart.x,
      this.pointStart.y,
      this.pointEnd.x,
      this.pointEnd.y,
    );

    for (let i = 0; i < debugOptionsInit.soundsGatesNumGenerate; i++) {
      let soundKey: string;
      switch (gateType) {
        case 'normal':
          soundKey = 'pluck_saw_medium';
          break;
        case 'mirror':
          soundKey = 'pluck_square_flat';
          break;
        case 'refract':
          soundKey = 'pluck_square_wiggle';
          break;
        default:
          throw new Error(`Invalid gate type: ${gateType}`);
      }

      const newSound = this.scene.sound.add(soundKey, {
        rate: this.soundPlayRate,
        volume: this.soundVolumeBase,
      });

      this.gateSounds.push(newSound);
    }
  }
}

export function gateUpdateSpriteArrowRotation(gate: Gate, game: Game) {
  if (!gate.spriteArrow) {
    return;
  }

  if (game.gameDebugOptions.gateArrowAngleUsesTurretAngle) {
    const turretRotation = game.player.spriteTurret.rotation - Math.PI / 2;

    gate.spriteArrow.rotation = calculateItemRotationRadWithinArc(turretRotation, 0, 1, gate);
  } else {
    const playerX = game.player.spriteTurret.x;
    const playerY = game.player.spriteTurret.y;

    const gateX = (gate.pointStart.x + gate.pointEnd.x) / 2;
    const gateY = (gate.pointStart.y + gate.pointEnd.y) / 2;

    const playerGateRotationRad = Phaser.Math.Angle.Between(playerX, playerY, gateX, gateY);

    gate.spriteArrow.rotation = calculateItemRotationRadWithinArc(playerGateRotationRad, 0, 1, gate);
  }
}

export function gateRepeatSoundPlay(gate: Gate) {
  for (let i = 0; i < gate.multiplier; i++) {
    gate.scene.time.delayedCall(debugOptionsInit.gateDurationRepeatPlaySound * i, () => {
      gatePlayNextSound(gate);
    });
  }
}

export function gateDraw(gate: Gate) {
  gateDrawLine(gate);
  gateDrawFilledCircles(gate);
}

export function gateDrawLine(gate: Gate) {
  gate.graphics.clear();
  gate.graphics.lineStyle(debugOptionsInit.gateLineWidth, gate.originalColor);
  gate.graphics.lineBetween(gate.pointStart.x, gate.pointStart.y, gate.pointEnd.x, gate.pointEnd.y);
}

export function gateDrawFilledCircles(gate: Gate) {
  const midpointX = (gate.pointStart.x + gate.pointEnd.x) / 2;
  const midpointY = (gate.pointStart.y + gate.pointEnd.y) / 2;

  gate.graphics.fillStyle(0x000000, 1);
  gate.graphics.fillCircle(midpointX, midpointY, debugOptionsInit.gateCircleRadius);
  gate.graphics.strokeCircle(midpointX, midpointY, debugOptionsInit.gateCircleRadius);

  gateDrawFilledCircleAtPoint(gate, gate.pointStart.x, gate.pointStart.y);
  gateDrawFilledCircleAtPoint(gate, gate.pointEnd.x, gate.pointEnd.y);
}

export function gateDrawFilledCircleAtPoint(gate: Gate, x: number, y: number) {
  gate.graphics.fillStyle(gate.originalColor, 1);
  gate.graphics.fillCircle(x, y, debugOptionsInit.gateCircleSmallRadius);
  gate.graphics.fillStyle(gate.originalColor, 1);
  gate.graphics.strokeCircle(x, y, debugOptionsInit.gateCircleSmallRadius);
}

export function gateAddText(gate: Gate) {
  const midpointX = (gate.pointStart.x + gate.pointEnd.x) / 2;
  const midpointY = (gate.pointStart.y + gate.pointEnd.y) / 2;

  gate.text = gate.scene.add.text(0, 0, 'x' + gate.multiplier, {
    fontSize: `${debugOptionsInit.gateFontSize}px`,
    color: getColorStringFromHexNumber(gate.originalColor),
    align: 'center',

    fontFamily: 'Impact',

    stroke: '#000000',
  });
  gate.text.setOrigin(0.5, 0.5);
  gate.text.setPosition(midpointX, midpointY);
}

export function gateSetPosition(gate: Gate, x1: number, y1: number, x2: number, y2: number) {
  gate.pointStart.set(x1, y1);
  gate.pointEnd.set(x2, y2);
  gateDraw(gate);
}

export function gateDrawWithColor(gate: Gate, color: number) {
  gate.graphics.clear();
  gate.graphics.lineStyle(debugOptionsInit.gateLineWidth, color);
  gate.graphics.lineBetween(gate.pointStart.x, gate.pointStart.y, gate.pointEnd.x, gate.pointEnd.y);

  gateDrawFilledCircles(gate);
}

export function gatePlayNextSound(gate: Gate) {
  if (!gate.gateSounds.length) {
    return;
  }

  gate.gateSoundsIndex = (gate.gateSoundsIndex + 1) % debugOptionsInit.soundsGatesNumGenerate;

  gate.gateSounds[gate.gateSoundsIndex].play();
}

export function gateFlashColor(gate: Gate, color: string) {
  if (gate.flashingFlag) return;

  if (!gate.text) {
    return;
  }

  if (debugOptionsInit.gateMultiPlaySound) {
    gateRepeatSoundPlay(gate);
  } else {
    gatePlayNextSound(gate);
  }

  const colorNumber = getColorHexNumberFromColorString(color);

  gate.flashingFlag = true;

  if (gate.spriteArrow) {
    gate.spriteArrow.setTintFill(colorNumber);
  }
  gate.text.setColor(color); // Set the text to white
  gateRemoveLine(gate); // Remove the line
  gateDrawWithColor(gate, colorNumber); // Draw the white gate

  gate.scene.time.delayedCall(debugOptionsInit.gateDelayedCallDuration, () => {
    if (!gate.text) {
      return;
    }

    gate.flashingFlag = false;

    if (gate.spriteArrow) {
      gate.spriteArrow.setTintFill(gate.originalColor);
    }

    gateRemoveLine(gate);
    gateDraw(gate);
    gate.text.setColor(getColorStringFromHexNumber(gate.originalColor));
  });
}

export function gateRemoveLine(gate: Gate) {
  gate.graphics.clear();
}
