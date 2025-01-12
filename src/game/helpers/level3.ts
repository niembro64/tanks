import { GameSpotType, GateConstructorParams, GateType, PillType } from '../../../types';
import { bgDirtHeight, bgDirtWidth, gameHeightLong, gameWidth, platformHeight, platformWidth } from '../../debugOptions';
import { Game } from '../scenes/Game';
import { gameCreateBackgrounds, gameCreateGate, gameCreateOverlapsAndColliders, gameCreatePill, gameCreatePlayer } from './helpers';
import { getNoteDownScaleSakura, getVolumeFromMultiplier } from './sound';


export const level2 = (game: Game) => {
  game.gameMatrix = [
    // 0
    {
      speed: 0,
      row: ['      ', '      ', '      ', 'tkb3|m', 'tkb3|m', 'tkb3|m', 'tkb3|m', '      ', '      ', '      '],
    },
    // 1
    {
      speed: 0,
      row: ['      ', 'gsm/2.', '      ', 'tkb3|m', 'tkb3|m', 'tkb3|m', 'tkb3|m', '      ', '      ', 'gsm\\2.'],
    },
    // 2
    {
      speed: 0,
      row: ['      ', '      ', '      ', 'tkb3|m', 'tkb3|m', 'tkb3|m', 'tkb3|m', '      ', '      ', '      '],
    },
    //3
    {
      speed: 0,
      row: ['      ', '      ', '      ', '░░░░░░', '░░░░░░', '░░░░░░', '░░░░░░', '      ', '      ', '      '],
    },
    // 4
    {
      speed: 0,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    // 5
    {
      speed: 0,
      row: ['gxm|4r', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    // 6
    {
      speed: 0,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    // 7
    {
      speed: 0,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    // 8
    {
      speed: 0.1,
      row: ['      ', 'p-rchg', '      ', '      ', '      ', '      ', '      ', '      ', 'p-time', '      '],
    },
    // 9
    {
      speed: 0.2,
      row: ['██████', '██████', '      ', 'gxn-0l', '      ', '      ', '      ', 'gxn-0r', '██████', '██████'],
    },
    // 10
    {
      speed: 0.8,
      row: ['██████', '░░░░░░', '      ', 'p-hlth', 'p-hlth', '      ', '      ', '      ', '░░░░░░', '██████'],
    },
    // 11
    {
      speed: 0.8,
      row: ['██████', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '██████'],
    },
    // 12
    {
      speed: 0.8,
      row: ['░░░░░░', '      ', '      ', '██████', '      ', '      ', '      ', '      ', '      ', '░░░░░░'],
    },
    // 13
    {
      speed: 1,
      row: ['      ', 'tkb3|s', '      ', '      ', '██████', '██████', '      ', 'tkb2|m', '      ', '      '],
    },
    // 14
    {
      speed: 1,
      row: ['glm|1r', 'tkb3|s', 'glm|1r', '      ', '██████', '██████', '      ', '      ', '      ', '      '],
    },
    // 15
    {
      speed: 1,
      row: ['      ', '      ', '      ', '      ', '██████', '██████', '      ', 'tkc1|m', '      ', '      '],
    },
    // 16
    {
      speed: 1,
      row: ['glm|1r', '      ', 'glm|1r', '██████', '██████', '██████', '      ', '      ', '      ', '      '],
    },
    // 17
    {
      speed: 1,
      row: ['      ', '      ', '      ', '██████', '░░░░░░', '░░░░░░', '      ', '      ', '      ', '      '],
    },
    // 18
    {
      speed: 1,
      row: ['glm|1r', '      ', 'glm|1r', '██████', 'tkc1|s', '      ', '      ', '      ', '      ', '      '],
    },
    // 19
    {
      speed: 0.5,
      row: ['      ', '      ', '      ', '██████', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    // 20
    {
      speed: 0.7,
      row: ['glm|1r', '      ', 'glm|1r', '░░░░░░', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    // 21
    {
      speed: 0.7,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    // 22
    {
      speed: 0.7,
      row: ['glm|1r', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    // 23
    {
      speed: 0.7,
      row: ['      ', '      ', '      ', '      ', '      ', 'tkc1|m', '      ', '      ', '      ', '      '],
    },
    // 24
    {
      speed: 0.7,
      row: ['      ', '      ', 'p-upgr', '      ', '      ', '      ', '      ', '      ', 'tkc1/s', 'tkc1/s'],
    },
    // 25
    {
      speed: 0.7,
      row: ['      ', '      ', '      ', '      ', 'glm/9.', '      ', '      ', '      ', 'tkc1/s', 'tkc1/s'],
    },
    // 26
    {
      speed: 0.7,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', 'tkc1/s', 'tkc1/s'],
    },
    // 27
    {
      speed: 0.2,
      row: ['      ', '      ', '      ', 'glm|3.', '      ', 'tkb3|m', '      ', '      ', 'tkc1/s', 'tkc1/s'],
    },
    // 28
    {
      speed: 0.4,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', 'tkc1|m', '      ', 'tkc1/s', 'tkc1/s'],
    },
    // 29
    {
      speed: 1,
      row: ['      ', '      ', '      ', 'glm|3.', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    // 30
    {
      speed: 0.4,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '██████', '      '],
    },
    // 31
    {
      speed: 0.5,
      row: ['      ', '      ', '      ', 'glm|3.', '      ', '      ', '      ', '██████', '██████', '      '],
    },
    // 32
    {
      speed: 0.2,
      row: ['      ', '      ', '      ', '      ', '      ', 'p-hlth', '      ', '░░░░░░', '██████', '      '],
    },
    // 33
    {
      speed: 0.2,
      row: ['      ', '░░░░░░', '██████', '██████', 'tkc1|m', '      ', '      ', '      ', '░░░░░░', '      '],
    },
    // 34
    {
      speed: 1,
      row: ['p-time', 'p-rchg', '██████', '██████', '      ', 'tkc1|m', '      ', 'tkb1|m', '      ', '      '],
    },
    // 35
    {
      speed: 1,
      row: ['p-rchg', 'p-time', '██████', '░░░░░░', '      ', '      ', 'tkc1|m', '      ', '      ', '      '],
    },
    // 36
    {
      speed: 1,
      row: ['      ', 'p-upgr', '░░░░░░', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    // 37
    {
      speed: 1,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    // 38
    {
      speed: 0.8,
      row: ['gsm\\3r', 'gsr/1r', 'gsm\\3r', 'gsr/1r', 'gsm\\3r', 'gsr/1r', 'gsm\\3r', 'gsr/1r', 'gsm\\3r', 'gsr/1r'],
    },
    // 39
    {
      speed: 0.3,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', 'p-hlth', 'tkc1/s', '██████'],
    },
    // 40
    {
      speed: 0.3,
      row: ['      ', '      ', '      ', '      ', 'tkb1|m', '      ', 'tkb1/m', '      ', 'tkc1/s', '██████'],
    },
    // 41
    {
      speed: 0.5,
      row: ['      ', '      ', 'gxr\\2u', '      ', '      ', '      ', '      ', '      ', 'tkc1/s', '██████'],
    },
    // 42
    {
      speed: 0.3,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '██████', '██████', '██████'],
    },
    // 43
    {
      speed: 0.5,
      row: ['tkc1\\s', 'tkc1\\s', 'tkc1\\s', '      ', '      ', '      ', '░░░░░░', '░░░░░░', '██████', '██████'],
    },
    // 44
    {
      speed: 0.2,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '░░░░░░', '░░░░░░'],
    },
    // 45
    {
      speed: 0.2,
      row: ['      ', '      ', '      ', '      ', '      ', 'p-rchg', 'p-time', '      ', '      ', '      '],
    },
    // 46
    {
      speed: 1,
      row: ['      ', '      ', '      ', '      ', '      ', '░░░░░░', '░░░░░░', '      ', '      ', '      '],
    },
    // 47
    {
      speed: 0.7,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    // 48
    {
      speed: 0.7,
      row: ['      ', 'glm\\3.', 'tkc1\\m', '      ', 'glm\\3r', '      ', '      ', '      ', '██████', 'p-upgr'],
    },
    // 49
    {
      speed: 0.7,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '██████', '██████', 'p-rchg'],
    },
    // 50
    {
      speed: 0.7,
      row: ['      ', '      ', 'gxm-1u', '      ', '      ', '      ', '      ', '░░░░░░', '██████', 'p-rchg'],
    },
    // 51
    {
      speed: 0.7,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '░░░░░░', '      '],
    },
    // 52
    {
      speed: 0.7,
      row: ['      ', '      ', '      ', '      ', 'p-hlth', 'p-time', '      ', '      ', '      ', '      '],
    },
    // 53
    {
      speed: 0.7,
      row: ['      ', 'tkb1\\s', '      ', '      ', '      ', '      ', '      ', '      ', 'tkc1/s', '      '],
    },
    // 54
    {
      speed: 0.7,
      row: ['      ', '      ', '      ', '      ', 'p-upgr', '      ', '      ', '      ', '      ', '      '],
    },
    // 55
    {
      speed: 0.7,
      row: ['██████', '      ', '      ', 'gln/2d', '      ', '      ', '      ', 'glr\\2d', '      ', '██████'],
    },
    // 56
    {
      speed: 0.5,
      row: ['██████', '██████', '      ', '      ', 'gsn/2l', '      ', 'gsr\\2r', '      ', '██████', '██████'],
    },
    {
      speed: 0.5,
      row: ['██████', '██████', '░░░░░░', '      ', '      ', '      ', '      ', '░░░░░░', '██████', '██████'],
    },
    {
      speed: 0.5,
      row: ['██████', '░░░░░░', '      ', '      ', '      ', '      ', '      ', '      ', '░░░░░░', '██████'],
    },
    {
      speed: 0.5,
      row: ['░░░░░░', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '░░░░░░'],
    },
    {
      speed: 0.5,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    {
      speed: 0.5,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    {
      speed: 0.3,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    {
      speed: 0.3,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    {
      speed: 0.3,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    {
      speed: 0.3,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    {
      speed: 0.3,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    {
      speed: 0.3,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    {
      speed: 0.3,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    {
      speed: 0.3,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    {
      speed: 0.7,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    {
      speed: 1,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
    {
      speed: 1,
      row: ['      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      ', '      '],
    },
  ];

  const gameHeightLongPlayerInit = gameHeightLong * game.gameDebugOptions.defaultTankStartYRatio;
  const gameHeightLongStuffInit = gameHeightLong - 500;

  gameCreatePlayer(game, gameWidth * 0.5, gameHeightLongPlayerInit);

  const numBackgroundsVert = Math.floor(gameHeightLong / bgDirtHeight);
  const numBackgroundsHoriz = Math.floor(gameWidth / bgDirtWidth);

  // let tankEnemyIndex = 0;

  for (let i = 0; i < game.gameMatrix.length; i++) {
    for (let j = 0; j < game.gameMatrix[i].row.length; j++) {
      const gameSpotCurrent: GameSpotType = game.gameMatrix[i].row[j];

      const strLength = gameSpotCurrent.length;
      if (strLength !== 6) {
        throw new Error('game.gameMatrix[i].row[j].length !== 6: ' + strLength + ' row:' + i + ' column:' + j);
      }

      const gameObjectPieces: string[] = gameSpotCurrent.split('');

      switch (gameObjectPieces[0]) {
        case ' ':
          ///////////////////
          // ADD NOTHING
          ///////////////////
          break;
        case '░':
          game.platformsCollide.create(
            j * platformWidth + platformWidth / 2,
            i * platformHeight + platformHeight / 2,
            'platform_spike',
          );
          break;
        case '█':
          game.platformsNormal.create(
            j * platformWidth + platformWidth / 2,
            i * platformHeight + platformHeight / 2,
            'platform',
          );
          break;
        case 'p':
          gameCreatePill({
            game: game,
            x: j * platformWidth + platformWidth / 2,
            y: i * platformHeight + platformHeight / 2,
            type: gameSpotCurrent as PillType,
          });
          break;
        case 't':
          /////////////////////////////////////////
          // ENEMY TANKS ARE CREATED IN REAL TIME
          /////////////////////////////////////////
          break;
        case 'g':
          const centerX = j * platformWidth + platformWidth / 2;
          const centerY = i * platformHeight + platformHeight / 2;

          let startX: number;
          let startY: number;
          let endX: number;
          let endY: number;

          let lenMultiplier: number;

          switch (gameObjectPieces[1]) {
            case 's':
              lenMultiplier = 0.5;
              break;
            case 'm':
              lenMultiplier = 1 / Math.sqrt(2);
              break;
            case 'l':
              lenMultiplier = 1;
              break;
            case 'x':
              lenMultiplier = 2;
              break;
            default:
              throw new Error(`splitType[1] not recognized: ${gameObjectPieces[1]}`);
          }

          let xOffset = 0;
          let yOffset = 0;

          switch (gameObjectPieces[5]) {
            case '.':
              /////////////////
              // Do Nothing
              /////////////////
              break;
            case 'l':
              xOffset = -platformWidth / 2;
              break;
            case 'r':
              xOffset = platformWidth / 2;
              break;
            case 'u':
              yOffset = -platformHeight / 2;
              break;
            case 'd':
              yOffset = platformHeight / 2;
              break;
            default:
              throw new Error(`splitType[4] not recognized: ${gameObjectPieces[4]}`);
          }

          switch (gameObjectPieces[3]) {
            case '-':
              startX = centerX - platformWidth * lenMultiplier;
              startY = centerY;
              endX = centerX + platformWidth * lenMultiplier;
              endY = centerY;
              break;
            case '|':
              startX = centerX;
              startY = centerY - platformHeight * lenMultiplier;
              endX = centerX;
              endY = centerY + platformHeight * lenMultiplier;
              break;
            case '/':
              startX = centerX + platformWidth * lenMultiplier;
              startY = centerY - platformHeight * lenMultiplier;
              endX = centerX - platformWidth * lenMultiplier;
              endY = centerY + platformHeight * lenMultiplier;
              break;
            case '\\':
              startX = centerX - platformWidth * lenMultiplier;
              startY = centerY - platformHeight * lenMultiplier;
              endX = centerX + platformWidth * lenMultiplier;
              endY = centerY + platformHeight * lenMultiplier;
              break;
            default:
              throw new Error(`splitType[1] not recognized: ${gameObjectPieces[3]}`);
          }

          startX += xOffset;
          startY += yOffset;
          endX += xOffset;
          endY += yOffset;

          startX -= platformWidth / 2;
          startY -= platformHeight / 2;
          endX -= platformWidth / 2;
          endY -= platformHeight / 2;

          let gateType: GateType;
          switch (gameObjectPieces[2]) {
            case 'n':
              gateType = 'normal';
              break;
            case 'm':
              gateType = 'mirror';
              break;
            case 'r':
              gateType = 'refract';
              break;
            default:
              throw new Error(`splitType[2] not recognized: ${gameObjectPieces[2]}`);
          }

          const gateConstructorParams: GateConstructorParams = {
            scene: game,
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY,
            multiplier: JSON.parse(gameObjectPieces[4]),
            gateType: gateType,
            functionSoundPlayRate: getNoteDownScaleSakura,
            functionSoundVolume: getVolumeFromMultiplier,
          };

          gameCreateGate({
            game: game,
            gateConstructorParams: gateConstructorParams,
          });
          break;
        default:
          throw new Error(`gameObjectPieces[0] not recognized: ${gameObjectPieces[0]}`);
      }
    }
  }

  gameCreateBackgrounds({
    game: game,
    numBackgroundsVert: numBackgroundsVert,
    numBackgroundsHoriz: numBackgroundsHoriz,
    gameHeightLongStuffInit: gameHeightLongStuffInit,
  });

  gameCreateOverlapsAndColliders(game);
};