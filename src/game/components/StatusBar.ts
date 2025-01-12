import { interpolateColor, saturateColor } from '../helpers/color';
import { Game } from '../scenes/Game';

class StatusBar {
  orientation: 'horizontal' | 'vertical';
  offset: { x: number; y: number };
  bar: Phaser.GameObjects.Graphics;
  value: number;
  maxValue: number;
  isFull: boolean;
  isEmpty: boolean;
  width: number;
  height: number;
  borderWidth: number;
  x: number;
  y: number;
  fillColorHigh: number;
  fillColorLow: number;
  fillColorBehind: number;
  depth: number;

  constructor(params: {
    game: Game;
    x: number;
    y: number;
    width: number;
    height: number;
    borderWidth: number;
    orientation: 'horizontal' | 'vertical';
    offset: { x: number; y: number };
    fillColorHigh: number;
    fillColorLow: number;
    fillColorBehind: number;
    depth: number;
    valueInit: number;
  }) {
    const {
      game,
      x,
      y,
      width,
      height,
      borderWidth,
      orientation,
      fillColorBehind,
      fillColorHigh,
      fillColorLow,
      offset,
      depth,
      valueInit,
    } = params;

    this.bar = new Phaser.GameObjects.Graphics(game);
    this.depth = depth;
    this.bar.setDepth(depth);

    this.x = x + width / 2;
    this.y = y + height / 2;
    this.borderWidth = borderWidth;
    this.offset = offset;
    this.width = width;
    this.height = height;
    this.value = valueInit;
    this.maxValue = valueInit;
    this.orientation = orientation;

    this.fillColorBehind = fillColorBehind;
    this.fillColorHigh = fillColorHigh;
    this.fillColorLow = fillColorLow;
    this.draw();

    game.add.existing(this.bar);
  }

  destroy() {
    this.bar.destroy();
  }

  decrease(amount: number) {
    this.value -= amount;

    if (this.value < 0) {
      this.value = 0;
    }

    this.draw();
  }

  increase(amount: number) {
    this.value += amount;

    if (this.value > this.maxValue) {
      this.value = this.maxValue;
    }

    this.draw();
  }

  setZero() {
    this.value = 0;
    this.draw();
  }

  setFull() {
    this.value = this.maxValue;
    this.draw;
  }

  draw() {
    this.bar.clear();

    ////////////////////////////////
    // BLACK OUTLINE
    ////////////////////////////////
    this.bar.fillStyle(0x000000);
    this.bar.fillRect(this.x, this.y, this.width, this.height);

    ////////////////////////////////
    // BEHIND FILL
    ////////////////////////////////
    this.bar.fillStyle(this.fillColorBehind);
    this.bar.fillRect(
      this.x + this.borderWidth,
      this.y + this.borderWidth,
      this.width - this.borderWidth - this.borderWidth,
      this.height - this.borderWidth - this.borderWidth,
    );

    ////////////////////////////////
    // COLOR OVERLAY
    ////////////////////////////////
    const newColor = interpolateColor(this.fillColorLow, this.fillColorHigh, this.value / this.maxValue);

    const newSaturated = saturateColor(newColor);

    this.bar.fillStyle(newSaturated);

    if (this.orientation === 'horizontal') {
      const d = Math.floor((this.value / this.maxValue) * (this.width - this.borderWidth - this.borderWidth));
      this.bar.fillRect(
        this.x + this.borderWidth,
        this.y + this.borderWidth,
        d,
        this.height - this.borderWidth - this.borderWidth,
      );
    } else {
      const d = Math.floor((this.value / this.maxValue) * (this.height - this.borderWidth - this.borderWidth));

      this.bar.fillRect(
        this.x + this.borderWidth,
        this.y - this.borderWidth - d + this.height,
        this.width - this.borderWidth - this.borderWidth,
        d,
      );
    }

    this.isFull = this.value === this.maxValue;
    this.isEmpty = this.value === 0;
  }

  hasAmount(amount: number) {
    return this.value >= amount;
  }

  setPosition(x: number, y: number) {
    this.x = x - this.offset.x / 2;
    this.y = y + this.offset.y / 2;
    this.draw();
  }
}

export default StatusBar;
