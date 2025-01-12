import { Scene } from "phaser"

export class Boot extends Scene {
    constructor() {
        super("Boot")
    }

    preload() {}

    create() {
        // this.scene.start("MainMenu")
              this.scene.start("MainMenu")
        // this.scene.start("Preloader")
    }
}
