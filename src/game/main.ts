import Phaser from "phaser"
import {
    clientHeight,
    clientWidth,
    debugOptionsInit,
    gameHeightLong,
    gameWidth,
} from "../debugOptions"
import { Boot } from "./scenes/Boot"
import { Game } from "./scenes/Game"
import { GameOver } from "./scenes/GameOver"
import { MainMenu } from "./scenes/MainMenu"
import { Preloader } from "./scenes/Preloader"
import { GameWin } from './scenes/GameWin'

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: clientWidth,
    height: clientHeight,
    parent: "game-container",
    antialias: true,
    backgroundColor: "#028af8",
    physics: {
        default: "arcade",
        arcade: {
            debug: debugOptionsInit.debugMode,
            gravity: { x: 0, y: 0 },
            width: gameWidth,
            height: gameHeightLong,
        },
    },
    input: {
        activePointers: 3,
    },
    scene: [Boot, Preloader, MainMenu, Game, GameWin, GameOver],
}

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent })
}

export default StartGame
