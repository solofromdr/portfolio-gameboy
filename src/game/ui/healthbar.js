export class HealthBar {
  constructor(scene, x, y, maxHp, color = 0x00ff88, label = '') {
    this.scene = scene
    this.maxHp = maxHp
    this.currentHp = maxHp

    const barW = 120
    const barH = 12

    // Fondo
    this.bg = scene.add.rectangle(x, y, barW + 4, barH + 4, 0x000000, 0.7)
      .setScrollFactor(0).setDepth(200).setOrigin(0, 0.5)

    // Barra vacía (gris)
    this.track = scene.add.rectangle(x + 2, y, barW, barH, 0x333333, 0.8)
      .setScrollFactor(0).setDepth(201).setOrigin(0, 0.5)

    // Barra de vida
    this.bar = scene.add.rectangle(x + 2, y, barW, barH, color, 1)
      .setScrollFactor(0).setDepth(202).setOrigin(0, 0.5)

    // Label
    if (label) {
      this.label = scene.add.text(x, y - 14, label, {
        fontSize: '11px',
        fill: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3
      }).setScrollFactor(0).setDepth(203)
    }
  }

  update(currentHp) {
    this.currentHp = Phaser.Math.Clamp(currentHp, 0, this.maxHp)
    const pct = this.currentHp / this.maxHp
    const fullW = 120
    this.bar.width = fullW * pct

    // Color cambia según HP
    if (pct > 0.5) this.bar.setFillStyle(0x00ff88)
    else if (pct > 0.25) this.bar.setFillStyle(0xffaa00)
    else this.bar.setFillStyle(0xff3300)
  }

  getObjects() {
  const objs = [this.bg, this.track, this.bar]
  if (this.label) objs.push(this.label)
  return objs
}

  destroy() {
    this.bg.destroy()
    this.track.destroy()
    this.bar.destroy()
    if (this.label) this.label.destroy()
  }
}