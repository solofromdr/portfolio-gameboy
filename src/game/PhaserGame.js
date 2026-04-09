import Phaser from "phaser";
import { MenuScene } from "./scenes/MenuScene.js";
import { GameScene } from "./scenes/GameScene.js";
import { GAME_CONFIG } from "./config/constants.js";
import { PauseScene } from "./scenes/PauseScene.js";
import { IntroScene } from "./scenes/IntroScene.js";
import { BattleScene } from "./scenes/BattleScene.js";
import { UIScene } from "./ui/UIScene.js";

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.width,
  height: GAME_CONFIG.height,
  backgroundColor: GAME_CONFIG.backgroundColor,
  parent: "phaser-container",
  input: {
    keyboard: {
      target: window
    }
  },
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [MenuScene, IntroScene, GameScene, PauseScene, BattleScene, UIScene],
};

// Redirigir eventos de teclado del window al juego siempre
window.__fireKey = (key) => {
  console.log('__fireKey recibido:', key)
  const keyCode = key === ' ' ? 32 : key === 'Enter' ? 13 : key === 'Escape' ? 27 : key === 'Z' ? 90 : key === 'X' ? 88 : key === 'w' ? 87 : key === 's' ? 83 : key === 'a' ? 65 : key === 'd' ? 68 : key.toUpperCase().charCodeAt(0)
  const code = key === ' ' ? 'Space' : key === 'Enter' ? 'Enter' : key === 'Escape' ? 'Escape' : key === 'w' ? 'KeyW' : key === 's' ? 'KeyS' : key === 'a' ? 'KeyA' : key === 'd' ? 'KeyD' : 'Key' + key.toUpperCase()
  const event = new KeyboardEvent('keydown', { 
    key, 
    keyCode, 
    which: keyCode,
    code,
    bubbles: true, 
    cancelable: true 
  })
  window.dispatchEvent(event)
}

window.__releaseKey = (key) => {
  const keyCode = key === ' ' ? 32 : key === 'Enter' ? 13 : key === 'Z' ? 90 : key === 'X' ? 88 : key.toUpperCase().charCodeAt(0)
  const event = new KeyboardEvent('keyup', { 
    key, 
    keyCode, 
    which: keyCode,
    code: key === ' ' ? 'Space' : key === 'Enter' ? 'Enter' : 'Key' + key.toUpperCase(),
    bubbles: true, 
    cancelable: true 
  })
  window.dispatchEvent(event)
}

window.__phaserGame = new Phaser.Game(config);

window.__phaserGame.events.on('ready', () => {
  const canvas = document.querySelector('#phaser-container canvas')
  if (canvas) {
    canvas.setAttribute('tabindex', '0')
    canvas.focus()
  }
})

// Escucha botones del GBA
window.addEventListener('message', (event) => {
  if (event.data?.type === 'keydown' || event.data?.type === 'keyup') {
    window.dispatchEvent(new KeyboardEvent(event.data.type, {
      key: event.data.key,
      bubbles: true
    }))
  }
})