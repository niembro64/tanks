
import { isMobile } from '../../debugOptions';
import { Game } from '../scenes/Game';

const gameCreateFullscreenButton = (scene: Game) => {
  if (isMobile) {
    return;
  }

  const button = scene.add
    .image(scene.cameras.main.width - 20, 20, 'fullscreen', 0)
    .setOrigin(1, 0)
    .setInteractive()
    .setScrollFactor(0)
    .setDepth(100)
    .setAlpha(1);

  button.on('pointerup', () => {
    if (scene.scale.isFullscreen) {
      button.setFrame(0);
      scene.scale.stopFullscreen();
    } else {
      button.setFrame(1);
      scene.scale.startFullscreen();
    }
  });
  return button;
};

export default gameCreateFullscreenButton;
