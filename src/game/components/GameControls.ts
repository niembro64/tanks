import Phaser from 'phaser';

import { gameHeightBox, gameWidth, isMobile } from '../../debugOptions';
import { Game } from '../scenes/Game';

export class GameControls {
  scene: Game;
  screenDimensions: Phaser.Geom.Point;
  thresholdRadius = 40;

  controlsTouchYOffsetAfterZoom!: number;

  /////////////////////////////
  // LEFT
  /////////////////////////////
  leftPointer: Phaser.Input.Pointer | null;

  leftOrigin: Phaser.GameObjects.Image;
  leftCurrent: Phaser.GameObjects.Image;

  leftAngleCurr: number | null | undefined;
  leftAnglePrev: number | null | undefined;
  leftRadiusCurr: number | null;
  leftRadiusPrev: number | null;

  leftAngleText: Phaser.GameObjects.BitmapText;
  leftRadiusText: Phaser.GameObjects.BitmapText;

  /////////////////////////////
  // RIGHT
  /////////////////////////////
  rightPointer: Phaser.Input.Pointer | null;

  rightOrigin: Phaser.GameObjects.Image;
  rightCurrent: Phaser.GameObjects.Image;

  rightAngleCurr: number | null | undefined;
  rightAnglePrev: number | null | undefined;
  rightRadiusCurr: number | null;
  rightRadiusPrev: number | null;

  rightAngleText: Phaser.GameObjects.BitmapText;
  rightRadiusText: Phaser.GameObjects.BitmapText;

  /////////////////////////////
  // KEYBOARD
  /////////////////////////////
  wasd: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  } | null;

  constructor(params: { scene: Game }) {
    const { scene } = params;
    this.screenDimensions = new Phaser.Geom.Point(scene.cameras.main.width, scene.cameras.main.height);
    this.scene = scene;

    this.leftAngleCurr = null;
    this.leftRadiusCurr = null;
    this.rightPointer = null;
    this.rightAngleCurr = null;
    this.rightRadiusCurr = null;

    if (!isMobile && this.scene?.input?.keyboard) {
      this.wasd = {
        up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    } else {
      this.wasd = null;
    }

    const newOffset = scene.gameDebugOptions.controlsTouchYOffset * (1 / scene.gameDebugOptions.defaultCameraZoom);

    this.controlsTouchYOffsetAfterZoom = newOffset;
  }

  create() {
    const viewportWidth = this.scene.cameras.main.width;
    const viewportHeight = this.scene.cameras.main.height;

    const leftSide = 0;
    const leftSideMidpoint = viewportWidth / 4;
    const midPoint = viewportWidth / 2;
    const rightSideMidpoint = (viewportWidth / 4) * 3;

    if (
      this.scene.gameDebugOptions.debugMode &&
      isMobile &&
      this.scene.gameDebugOptions.defaultControlsTypeMobile !== 'single-arc-absolute'
    ) {
      this.scene.add.line(viewportWidth / 2, viewportHeight / 2, 0, viewportHeight, 0, 0, 0xffffff).setScrollFactor(0);
    }

    const textSize = 13;

    const whiteTintColor = 0xffffff;
    const redTintColor = 0xff0000;
    const blueTintColor = 0x0000ff;

    const yOffset = 25;

    if (this.scene.gameDebugOptions.debugMode) {
      this.scene.add
        .bitmapText(leftSideMidpoint, yOffset, 'p2', isMobile ? `Left Thumb` : 'WASD Keys', textSize)
        .setOrigin(0.5, 0.5)
        .setTint(whiteTintColor)
        .setScrollFactor(0)
        .setDepth(this.scene.gameDebugOptions.controlsZIndexDepth);
      this.leftAngleText = this.scene.add
        .bitmapText(leftSide, yOffset * 2, 'p2', `Angle:`, textSize)
        .setOrigin(0, 0.5)
        .setTint(whiteTintColor)
        .setScrollFactor(0)
        .setDepth(this.scene.gameDebugOptions.controlsZIndexDepth);
      this.leftRadiusText = this.scene.add
        .bitmapText(leftSide, yOffset * 3, 'p2', `Distance:`, textSize)
        .setOrigin(0, 0.5)
        .setTint(whiteTintColor)
        .setScrollFactor(0)
        .setDepth(this.scene.gameDebugOptions.controlsZIndexDepth);
    }
    this.leftOrigin = this.scene.add
      .image(0, 0, 'thumb_outline')
      .setOrigin(0.5, 0.5)
      .setScale(0.38)
      .setTintFill(blueTintColor)
      // .setScale(joystickSize)
      .setScrollFactor(0)
      .setDepth(this.scene.gameDebugOptions.controlsZIndexDepth);
    this.leftCurrent = this.scene.add
      .image(0, 0, 'tail_tiny')
      .setTintFill(blueTintColor)
      .setScrollFactor(0)
      .setDepth(this.scene.gameDebugOptions.controlsZIndexDepth);

    this.leftOrigin.alpha = 0;
    this.leftCurrent.alpha = 0;

    if (this.scene.gameDebugOptions.debugMode) {
      this.scene.add
        .bitmapText(rightSideMidpoint, yOffset, 'p2', isMobile ? `Right Thumb` : 'Mouse', textSize)
        .setOrigin(0.5, 0.5)
        .setTint(whiteTintColor)
        .setScrollFactor(0)
        .setDepth(this.scene.gameDebugOptions.controlsZIndexDepth);
      this.rightAngleText = this.scene.add
        .bitmapText(midPoint, yOffset * 2, 'p2', `Angle:`, textSize)
        .setOrigin(0, 0.5)
        .setTint(whiteTintColor)
        .setScrollFactor(0)
        .setDepth(this.scene.gameDebugOptions.controlsZIndexDepth);
      this.rightRadiusText = this.scene.add
        .bitmapText(midPoint, yOffset * 3, 'p2', `Distance:`, textSize)
        .setOrigin(0, 0.5)
        .setTint(whiteTintColor)
        .setScrollFactor(0)
        .setDepth(this.scene.gameDebugOptions.controlsZIndexDepth);
    }

    this.rightOrigin = this.scene.add
      .image(0, 0, 'thumb_outline')
      .setTintFill(redTintColor)
      .setScale(0.38)
      .setScrollFactor(0)
      .setDepth(this.scene.gameDebugOptions.controlsZIndexDepth);
    this.rightCurrent = this.scene.add
      .image(0, 0, 'tail_tiny')
      .setTintFill(redTintColor)
      .setScrollFactor(0)
      .setDepth(this.scene.gameDebugOptions.controlsZIndexDepth);

    this.rightOrigin.alpha = 0;
    this.rightCurrent.alpha = 0;
  }

  assignLeftRightPointers(params: { onePointer: boolean }) {
    const { onePointer } = params;
    const pointers = this.scene.input.manager.pointers;

    // Reset pointers
    this.leftPointer = null;
    this.rightPointer = null;

    for (let i = 0; i < pointers.length; i++) {
      const pointer = pointers[i];

      if (pointer.isDown) {
        if (isMobile) {
          const centerPoint: number = onePointer ? this.scene.cameras.main.width : this.scene.cameras.main.width / 2;

          if (pointer.x < centerPoint) {
            if (!this.leftPointer) {
              this.leftPointer = pointer;
            }
          } else {
            if (!this.rightPointer) {
              this.rightPointer = pointer;
            }
          }
        } else {
          if (!this.rightPointer) {
            this.rightPointer = pointer;
          }
        }
      }
    }
  }

  updateText() {
    if (!this.scene.gameDebugOptions.debugMode) {
      return;
    }
    // Round the values before setting the text
    this.leftAngleText.setText(
      'Angle: ' +
        (this.leftAngleCurr === null
          ? 'null'
          : this.leftAngleCurr === undefined
            ? 'undefined'
            : Math.round(this.leftAngleCurr * 10 || 0) / 10),
    ); // UI updates
    this.leftRadiusText.setText(
      'Radius: ' + (this.leftRadiusCurr !== null ? Math.round((this.leftRadiusCurr || 0) * 10) / 10 : 'null'),
    );

    this.rightAngleText.setText(
      'Angle: ' +
        (this.rightAngleCurr === null
          ? 'null'
          : this.rightAngleCurr === undefined
            ? 'undefined'
            : Math.round(this.rightAngleCurr * 10 || 0) / 10),
    ); // UI updates
    this.rightRadiusText.setText(
      'Radius: ' + (this.rightRadiusCurr !== null ? Math.round(this.rightRadiusCurr) : 'null'),
    );
  }

  updateSpriteThumbsOffsets() {
    this.leftOrigin.setPosition(this.leftOrigin.x, this.leftOrigin.y + this.controlsTouchYOffsetAfterZoom);

    this.leftCurrent.setPosition(this.leftCurrent.x, this.leftCurrent.y + this.controlsTouchYOffsetAfterZoom);

    this.rightOrigin.setPosition(this.rightOrigin.x, this.rightOrigin.y + this.controlsTouchYOffsetAfterZoom);

    this.rightCurrent.setPosition(this.rightCurrent.x, this.rightCurrent.y + this.controlsTouchYOffsetAfterZoom);
  }

  updatePre() {
    this.assignLeftRightPointers({
      onePointer: this.scene.gameDebugOptions.defaultControlsTypeMobile === 'single-arc-absolute',
    });
    this.updateText();

    /////////////////////////////
    // UPDATE MOVEMENT (LEFT)
    /////////////////////////////
    if (isMobile) {
      ///////////////////////////////////
      // MOBILE
      ///////////////////////////////////
      if (this.leftPointer?.active) {
        ///////////////////////////////////
        // LEFT THUMB ACTIVE
        ///////////////////////////////////
        this.leftOrigin.alpha = this.scene.gameDebugOptions.controlsMobileThumbActiveAlpha;
        this.leftCurrent.alpha = this.scene.gameDebugOptions.controlsMobileThumbActiveAlpha;

        switch (this.scene.gameDebugOptions.defaultControlsTypeMobile) {
          case 'double-circular-relative':
            this.leftOrigin.setPosition(this.leftPointer.downX, this.leftPointer.downY);

            this.leftCurrent.setPosition(this.leftPointer.x, this.leftPointer.y);

            const samePoint2D: boolean =
              this.leftOrigin.x === this.leftCurrent.x && this.leftOrigin.y === this.leftCurrent.y;

            if (samePoint2D) {
              this.leftAngleCurr = undefined;
            } else {
              this.leftAngleCurr = Phaser.Math.RadToDeg(
                Phaser.Math.Angle.Between(this.leftOrigin.x, this.leftOrigin.y, this.leftCurrent.x, this.leftCurrent.y),
              );
            }

            const distance2D: number = Phaser.Math.Distance.Between(
              this.leftOrigin.x,
              this.leftOrigin.y,
              this.leftCurrent.x,
              this.leftCurrent.y,
            );

            this.leftRadiusCurr = Phaser.Math.Clamp(distance2D, 0, this.thresholdRadius);
            break;
          case 'double-arc-relative':
            this.leftOrigin.setPosition(this.leftPointer.downX, this.leftPointer.downY);

            const leftCurrentX: number = Phaser.Math.Clamp(
              this.leftPointer.x,
              this.leftPointer.downX - this.thresholdRadius,
              this.leftPointer.downX + this.thresholdRadius,
            );

            // equation of a circle
            const leftCurrentOffsetY: number = -Math.sqrt(
              this.thresholdRadius * this.thresholdRadius -
                (leftCurrentX - this.leftPointer.downX) * (leftCurrentX - this.leftPointer.downX),
            );

            this.leftCurrent.setPosition(leftCurrentX, this.leftPointer.downY + leftCurrentOffsetY);

            const hasMoved: boolean =
              this.leftPointer.x !== this.leftPointer.downX || this.leftPointer.y !== this.leftPointer.downY;

            if (hasMoved) {
              this.leftAngleCurr = Phaser.Math.RadToDeg(
                Phaser.Math.Angle.Between(this.leftOrigin.x, this.leftOrigin.y, this.leftCurrent.x, this.leftCurrent.y),
              );
            } else {
              this.leftAngleCurr = undefined;
            }

            this.leftRadiusCurr = this.thresholdRadius;
            break;
          case 'double-arc-absolute':
            const screenWidth = this.scene.cameras.main.width;
            const screenHeight = this.scene.cameras.main.height;

            const leftOriginX: number =
              screenWidth * this.scene.gameDebugOptions.controls1DAbsoluteScreenPositions.left.x;
            const leftOriginY: number =
              screenHeight * this.scene.gameDebugOptions.controls1DAbsoluteScreenPositions.left.y;

            this.leftOrigin.setPosition(leftOriginX, leftOriginY);

            const leftCurrX: number = Phaser.Math.Clamp(
              this.leftPointer.x,
              leftOriginX - this.thresholdRadius,
              leftOriginX + this.thresholdRadius,
            );

            // equation of a circle
            const leftCurrentOffY: number = -Math.sqrt(
              this.thresholdRadius * this.thresholdRadius - (leftCurrX - leftOriginX) * (leftCurrX - leftOriginX),
            );

            this.leftCurrent.setPosition(leftCurrX, leftOriginY + leftCurrentOffY);

            const hasMovedAbs: boolean = this.leftPointer.x !== leftOriginX || this.leftPointer.y !== leftOriginY;

            if (hasMovedAbs) {
              this.leftAngleCurr = Phaser.Math.RadToDeg(
                Phaser.Math.Angle.Between(this.leftOrigin.x, this.leftOrigin.y, this.leftCurrent.x, this.leftCurrent.y),
              );
            } else {
              this.leftAngleCurr = undefined;
            }

            this.leftRadiusCurr = this.thresholdRadius;
            break;
          case 'single-arc-absolute':
            const sWidth = this.scene.cameras.main.width;
            const sHeight = this.scene.cameras.main.height;

            const leftOX: number = sWidth * this.scene.gameDebugOptions.controls1DAbsoluteScreenPositions.center.x;
            const leftOY: number = sHeight * this.scene.gameDebugOptions.controls1DAbsoluteScreenPositions.center.y;

            this.leftOrigin.setPosition(leftOX, leftOY);

            const leftCX: number = Phaser.Math.Clamp(
              this.leftPointer.x,
              leftOX - this.thresholdRadius,
              leftOX + this.thresholdRadius,
            );

            // equation of a circle
            const leftCurrentOY: number = -Math.sqrt(
              this.thresholdRadius * this.thresholdRadius - (leftCX - leftOX) * (leftCX - leftOX),
            );

            this.leftCurrent.setPosition(leftCX, leftOY + leftCurrentOY);

            const hasMovedAbsSingle: boolean = this.leftPointer.x !== leftOX || this.leftPointer.y !== leftOY;

            if (hasMovedAbsSingle) {
              const newAngleCurr = Phaser.Math.RadToDeg(
                Phaser.Math.Angle.Between(this.leftOrigin.x, this.leftOrigin.y, this.leftCurrent.x, this.leftCurrent.y),
              );

              this.leftAngleCurr = newAngleCurr;
              this.rightAngleCurr = -90;
            } else {
              this.leftAngleCurr = undefined;
              this.rightAngleCurr = undefined;
            }

            this.leftRadiusCurr = this.thresholdRadius;
            this.rightRadiusCurr = this.thresholdRadius;
            break;
          default:
            throw new Error(`Invalid mobile controls type: ${this.scene.gameDebugOptions.defaultControlsTypeMobile}`);
        }

        if (this.leftRadiusCurr === this.thresholdRadius) {
          Phaser.Math.RotateAroundDistance(
            this.leftCurrent,
            this.leftOrigin.x,
            this.leftOrigin.y,
            0,
            this.thresholdRadius,
          );
        }
      } else {
        ///////////////////////////////////
        // LEFT THUMB INACTIVE
        //////////////////////////////////
        this.leftOrigin.alpha = 0;
        this.leftCurrent.alpha = 0;
        this.leftAngleCurr = null;
        this.leftRadiusCurr = null;

        if (this.scene.gameDebugOptions.defaultControlsTypeMobile === 'single-arc-absolute') {
          this.rightOrigin.alpha = 0;
          this.rightCurrent.alpha = 0;
          this.rightAngleCurr = null;
          this.rightRadiusCurr = null;
        }
      }
    } else {
      ///////////////////////////////////
      // DESKTOP
      ///////////////////////////////////
      this.leftAngleCurr = null;

      if (this.wasd === null) {
        console.log('no wasd keys');
        return;
      }
      let dx = 0;
      let dy = 0;
      let somethingPressed: boolean = false;

      if (this.wasd.left.isDown) {
        somethingPressed = true;
        dx += -1;
      }
      if (this.wasd.right.isDown) {
        somethingPressed = true;
        dx += 1;
      }
      if (this.wasd.up.isDown) {
        somethingPressed = true;
        dy += -1;
      }
      if (this.wasd.down.isDown) {
        somethingPressed = true;
        dy += 1;
      }

      const newAngle = Phaser.Math.RadToDeg(Math.atan2(dy, dx));

      if (dx === 0 && dy === 0) {
        if (somethingPressed) {
          this.leftAngleCurr = undefined;
          this.leftRadiusCurr = 0;
        } else {
          this.leftAngleCurr = null;
          this.leftRadiusCurr = null;
        }
      } else {
        this.leftAngleCurr = newAngle;
        this.leftRadiusCurr = this.thresholdRadius;
      }
    }

    /////////////////////////////
    // UPDATE AIMING (RIGHT)
    /////////////////////////////
    if (isMobile) {
      ///////////////////////////////////
      // MOBILE
      //////////////////////////////////
      if (this.rightPointer?.active) {
        ///////////////////////////////////
        // RIGHT THUMB ACTIVE
        //////////////////////////////////
        this.rightOrigin.alpha = this.scene.gameDebugOptions.controlsMobileThumbActiveAlpha;
        this.rightCurrent.alpha = this.scene.gameDebugOptions.controlsMobileThumbActiveAlpha;

        switch (this.scene.gameDebugOptions.defaultControlsTypeMobile) {
          case 'double-circular-relative':
            this.rightOrigin.setPosition(this.rightPointer.downX, this.rightPointer.downY);

            this.rightCurrent.setPosition(this.rightPointer.x, this.rightPointer.y);

            const samePoint2D: boolean =
              this.rightOrigin.x === this.rightCurrent.x && this.rightOrigin.y === this.rightCurrent.y;

            if (samePoint2D) {
              this.rightAngleCurr = undefined;
            } else {
              this.rightAngleCurr = Phaser.Math.RadToDeg(
                Phaser.Math.Angle.Between(
                  this.rightOrigin.x,
                  this.rightOrigin.y,
                  this.rightCurrent.x,
                  this.rightCurrent.y,
                ),
              );
            }

            const distance2D: number = Phaser.Math.Distance.Between(
              this.rightOrigin.x,
              this.rightOrigin.y,
              this.rightCurrent.x,
              this.rightCurrent.y,
            );

            this.rightRadiusCurr = Phaser.Math.Clamp(distance2D, 0, this.thresholdRadius);
            break;
          case 'double-arc-relative':
            this.rightOrigin.setPosition(this.rightPointer.downX, this.rightPointer.downY);

            const rightCurrentX: number = Phaser.Math.Clamp(
              this.rightPointer.x,
              this.rightPointer.downX - this.thresholdRadius,
              this.rightPointer.downX + this.thresholdRadius,
            );

            // equation of a circle
            const rightCurrentOffsetY: number = -Math.sqrt(
              this.thresholdRadius * this.thresholdRadius -
                (rightCurrentX - this.rightPointer.downX) * (rightCurrentX - this.rightPointer.downX),
            );

            this.rightCurrent.setPosition(rightCurrentX, this.rightPointer.downY + rightCurrentOffsetY);

            const hasMoved: boolean =
              this.rightPointer.x !== this.rightPointer.downX || this.rightPointer.y !== this.rightPointer.downY;

            if (hasMoved) {
              this.rightAngleCurr = Phaser.Math.RadToDeg(
                Phaser.Math.Angle.Between(
                  this.rightOrigin.x,
                  this.rightOrigin.y,
                  this.rightCurrent.x,
                  this.rightCurrent.y,
                ),
              );
            } else {
              this.rightAngleCurr = undefined;
            }

            this.rightRadiusCurr = this.thresholdRadius;
            break;
          case 'double-arc-absolute':
            const screenWidth = this.scene.cameras.main.width;
            const screenHeight = this.scene.cameras.main.height;

            const rightOriginX: number =
              screenWidth * this.scene.gameDebugOptions.controls1DAbsoluteScreenPositions.right.x;
            const rightOriginY: number =
              screenHeight * this.scene.gameDebugOptions.controls1DAbsoluteScreenPositions.right.y;

            this.rightOrigin.setPosition(rightOriginX, rightOriginY);

            const rightCurrX: number = Phaser.Math.Clamp(
              this.rightPointer.x,
              rightOriginX - this.thresholdRadius,
              rightOriginX + this.thresholdRadius,
            );

            // equation of a circle
            const rightCurrentOffY: number = -Math.sqrt(
              this.thresholdRadius * this.thresholdRadius - (rightCurrX - rightOriginX) * (rightCurrX - rightOriginX),
            );

            this.rightCurrent.setPosition(rightCurrX, rightOriginY + rightCurrentOffY);

            const hasMovedAbs: boolean = this.rightPointer.x !== rightOriginX || this.rightPointer.y !== rightOriginY;

            if (hasMovedAbs) {
              this.rightAngleCurr = Phaser.Math.RadToDeg(
                Phaser.Math.Angle.Between(
                  this.rightOrigin.x,
                  this.rightOrigin.y,
                  this.rightCurrent.x,
                  this.rightCurrent.y,
                ),
              );
            } else {
              this.rightAngleCurr = undefined;
            }

            this.rightRadiusCurr = this.thresholdRadius;
            break;
          case 'single-arc-absolute':
            /////////////////////////////////////////
            // Everything controlled with left side
            /////////////////////////////////////////
            break;
          default:
            throw new Error(`Invalid mobile controls type: ${this.scene.gameDebugOptions.defaultControlsTypeMobile}`);
        }
      } else {
        ///////////////////////////////////
        // RIGHT THUMB INACTIVE
        //////////////////////////////////
        if (this.scene.gameDebugOptions.defaultControlsTypeMobile !== 'single-arc-absolute') {
          this.rightAngleCurr = null;
          this.rightRadiusCurr = null;
          this.rightOrigin.alpha = 0;
          this.rightCurrent.alpha = 0;
        }
      }

      if (this.rightRadiusCurr === this.thresholdRadius) {
        Phaser.Math.RotateAroundDistance(
          this.rightCurrent,
          this.rightOrigin.x,
          this.rightOrigin.y,
          0,
          this.thresholdRadius,
        );
      }
    } else {
      ///////////////////////////////////
      // DESKTOP
      //////////////////////////////////
      const tankPosition = {
        x: this.scene.cameras.main.width * 0.5,
        y: this.scene.cameras.main.height * this.scene.gameDebugOptions.playerOriginPercentageDownScreen,
      };

      const cursorPosition = {
        x: this.rightPointer ? this.rightPointer.x : this.scene.input.activePointer.x,
        y: this.rightPointer ? this.rightPointer.y : this.scene.input.activePointer.y,
      };
      const angleRad = Phaser.Math.Angle.Between(tankPosition.x, tankPosition.y, cursorPosition.x, cursorPosition.y);
      const newAngle = Phaser.Math.RadToDeg(angleRad);

      this.rightAngleCurr = newAngle;

      this.rightRadiusCurr = !this.rightPointer?.active ? null : this.thresholdRadius;
    }

    this.updateSpriteThumbsOffsets();

    updateCrosshairsLineCenterCursor(this.scene);

    updateCrosshairsLinePlayerAngle(this.scene);

    updateCrosshairsLinePlayerCursor(this.scene);

    updateCursorCurrentPositionInGameWorld(this.scene);
  }

  updatePost() {
    this.rightAnglePrev = this.rightAngleCurr;
    this.rightRadiusPrev = this.rightRadiusCurr;
    this.leftAnglePrev = this.leftAngleCurr;
    this.leftRadiusPrev = this.leftRadiusCurr;
  }
}

function updateCursorCurrentPositionInGameWorld(game: Game) {
  const nextPosition = game.input.activePointer.positionToCamera(game.cameras.main);

  // @ts-ignore
  game.cursorCurrentPositionInGameWorld = new Phaser.Math.Vector2(nextPosition.x, nextPosition.y);
}

function updateCrosshairsLineCenterCursor(game: Game) {
  const crossHairsLine = game.crossHairsLineCenterCursor;
  if (crossHairsLine === null) {
    return;
  }

  const cameras = game.cameras;
  const angle: number | null = game.player.spriteTurret.angle - 90;

  const length = Math.sqrt(gameWidth * gameWidth + gameHeightBox * gameHeightBox);

  const startX = cameras.main.width * 0.5;
  const startY = cameras.main.height * game.gameDebugOptions.playerOriginPercentageDownScreen;

  const endOffsetX = length * Math.cos((angle * Math.PI) / 180);
  const endOffsetY = length * Math.sin((angle * Math.PI) / 180);

  const endX = cameras.main.width * 0.5 + endOffsetX;
  const endY = cameras.main.height * game.gameDebugOptions.playerOriginPercentageDownScreen + endOffsetY;

  crossHairsLine.setTo(startX, startY, endX, endY);
}

function updateCrosshairsLinePlayerAngle(game: Game) {
  const crossHairsLine = game.crossHairsLinePlayerAngle;
  if (crossHairsLine === null) {
    return;
  }

  const angle: number | null = game.player.spriteTurret.angle - 90;

  const length = Math.sqrt(gameWidth * gameWidth + gameHeightBox * gameHeightBox);

  const startX = game.player.spriteTurret.x;
  const startY = game.player.spriteTurret.y;

  const endOffsetX = length * Math.cos((angle * Math.PI) / 180);
  const endOffsetY = length * Math.sin((angle * Math.PI) / 180);

  const endX = game.player.spriteTurret.x + endOffsetX;
  const endY = game.player.spriteTurret.y + endOffsetY;

  crossHairsLine.setTo(startX, startY, endX, endY);
}

function updateCrosshairsLinePlayerCursor(game: Game) {
  const crossHairsLine = game.crossHairsLinePlayerCursor;
  if (crossHairsLine === null || game.player.state !== 'alive') {
    return;
  }

  const length = Math.sqrt(gameWidth * gameWidth + gameHeightBox * gameHeightBox);

  const startX = game.player.spriteTurret.x;
  const startY = game.player.spriteTurret.y;

  const cursorX = game.cursorCurrentPositionInGameWorld.x;
  const cursorY = game.cursorCurrentPositionInGameWorld.y;

  const newAngle = Phaser.Math.RadToDeg(Phaser.Math.Angle.Between(startX, startY, cursorX, cursorY));

  const endOffsetX = length * Math.cos((newAngle * Math.PI) / 180);
  const endOffsetY = length * Math.sin((newAngle * Math.PI) / 180);

  const endX = startX + endOffsetX;
  const endY = startY + endOffsetY;

  crossHairsLine.setTo(startX, startY, endX, endY);
}
