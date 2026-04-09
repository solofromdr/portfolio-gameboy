export class BiomeEffects {
  constructor(scene) {
    this.scene = scene;
    this.current = null;
    this.emitter = null;

    // Crear textura simple para partículas
    const g = scene.add.graphics();
    g.fillStyle(0xffffff);
    g.fillCircle(4, 4, 4);
    g.generateTexture("particle", 8, 8);
    g.destroy();
  }

  update(playerX, playerY) {
    let biome;
    if (playerX > 311) biome = 2;
    else if (playerY > 238) biome = 3;
    else if (playerX > 383 || playerY < 287) biome = 4;
    else biome = 1;

    if (biome !== this.current) {
      this.current = biome;
      this._activate(biome);
    }
  }

  _activate(biome) {
    if (this.emitter) {
      this.emitter.stop();
      this.emitter = null;
    }

    const w = this.scene.scale.width;

    if (biome === 1 || biome === 2) {
      // Nieve
      this.emitter = this.scene.add
        .particles(0, 0, "particle", {
          x: { min: 0, max: w },
          y: -10,
          speedY: { min: 30, max: 60 },
          speedX: { min: -10, max: 10 },
          scale: { min: 1, max: 3 },
          alpha: { min: 0.5, max: 0.9 },
          lifespan: 4000,
          quantity: 3,
          frequency: 80,
          tint: 0xffffff,
        })
        .setScrollFactor(0)
        .setDepth(50);
    } else if (biome === 3) {
      // Arena/polvo
      this.emitter = this.scene.add
        .particles(0, 0, "particle", {
          x: { min: 0, max: w },
          y: { min: 0, max: this.scene.scale.height },
          speedX: { min: 80, max: 150 },
          speedY: { min: -5, max: 5 },
          scale: { min: 1, max: 3 },
          alpha: { min: 0.3, max: 0.6 },
          lifespan: 2000,
          quantity: 4,
          frequency: 50,
          tint: 0xd4a96a,
        })
        .setScrollFactor(0)
        .setDepth(50);
    } else if (biome === 4) {
      // Niebla
      this.emitter = this.scene.add
        .particles(0, 0, "particle", {
          x: { min: 0, max: w },
          y: { min: 0, max: this.scene.scale.height },
          speedX: { min: 5, max: 15 },
          speedY: { min: -5, max: 5 },
          scale: { min: 3, max: 8 },
          alpha: { min: 0.02, max: 0.08 },
          lifespan: 6000,
          quantity: 1,
          frequency: 300,
          tint: 0xaaaaff,
        })
        .setScrollFactor(0)
        .setDepth(50);
    }
  }

  destroy() {
    if (this.emitter) this.emitter.stop();
  }
}
