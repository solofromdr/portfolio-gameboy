export class AmmoBar {
  constructor(scene, maxAmmo = 10) {
    this.scene = scene
    this.maxAmmo = maxAmmo
    this.currentAmmo = maxAmmo
    this.reloading = false

    const w = scene.scale.width
    const h = scene.scale.height

    // Fondo del icono
    this.bg = scene.add.rectangle(
      50, h - 40,
      60, 60,
      0x000000, 0.6
    ).setScrollFactor(0).setDepth(90)

    // Un solo icono
    this.icon = scene.add.image(50, h - 40, 'shuriken-active')
      .setScrollFactor(0)
      .setDepth(91)
      .setScale(1.2)

    // Contador de munición
    this.counter = scene.add.text(72, h - 52, `x${maxAmmo}`, {
      fontSize: '14px',
      fill: '#ffffff',
      stroke: '#000000',
      strokeThickness: 3
    }).setScrollFactor(0).setDepth(92)

    this.setVisible(false)
  }

  setVisible(visible) {
    this.bg.setVisible(visible)
    this.icon.setVisible(visible)
    this.counter.setVisible(visible)
  }

  shoot() {
    if (this.currentAmmo <= 0 || this.reloading) return false

    this.currentAmmo--
    this.counter.setText(`x${this.currentAmmo}`)

    if (this.currentAmmo === 0) {
      this.icon.setTexture('shuriken-disabled')
      this.reloading = true
      this._startReload()
    }

    return true
  }

  _startReload() {
    this.scene.tweens.add({
      targets: this.icon,
      alpha: 0.3,
      duration: 300,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        this.currentAmmo = this.maxAmmo
        this.reloading = false
        this.icon.setTexture('shuriken-active')
        this.icon.setAlpha(1)
        this.counter.setText(`x${this.maxAmmo}`)
      }
    })
  }

  canShoot() {
    return this.currentAmmo > 0 && !this.reloading
  }

  getObjects() {
    return [this.bg, this.icon, this.counter]
  }
}