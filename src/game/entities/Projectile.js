export class ProjectileManager {
  constructor(scene, wallsLayer, uiCamera) {
    this.scene = scene;
    this.group = scene.physics.add.group();

    if (!scene.anims.exists("shuriken-spin")) {
      scene.anims.create({
        key: "shuriken-spin",
        frames: scene.anims.generateFrameNumbers("lance", { start: 0, end: 1 }),
        frameRate: 12,
        repeat: -1,
      });
    }

    scene.physics.add.collider(this.group, wallsLayer, (lance) => {
      lance.destroy();
    });

    scene.input.on("pointerdown", () => {
      if (!this.enabled) return;
      const now = this.scene.time.now;
      if (now - this.shootCooldown < this.shootDelay) return;
      this.shootCooldown = now;
      if (this.scene.ammoBar && !this.scene.ammoBar.canShoot()) return;
      if (this.scene.ammoBar) this.scene.ammoBar.shoot();
      this.shoot();
    });

    scene.input.keyboard.on("keydown-Z", () => {
      if (!this.enabled) return;
      const now = this.scene.time.now;
      if (now - this.shootCooldown < this.shootDelay) return;
      this.shootCooldown = now;
      if (this.scene.ammoBar && !this.scene.ammoBar.canShoot()) return;
      if (this.scene.ammoBar) this.scene.ammoBar.shoot();
      this.shoot();
    });

    this.shootCooldown = 0;
    this.shootDelay = 1000;
    this.enabled = false;
    if (uiCamera) {
      uiCamera.ignore(this.group);
    }
  }

  shoot() {
    const player = this.scene.player.getSprite();
    const lance = this.group.create(player.x, player.y, "lance");
    lance.setScale(1);
    lance.anims.play("shuriken-spin", true);
    this.scene.sound.play("sfx-shoot");
    if (this.scene.uiCamera) this.scene.uiCamera.ignore(lance);

    const pointer = this.scene.input.activePointer.positionToCamera(
      this.scene.cameras.main,
    );

    const angle = Phaser.Math.Angle.Between(
      player.x,
      player.y,
      pointer.x,
      pointer.y,
    );

    // Reproduce animación de ataque en el player
    const playerSprite = this.scene.player.getSprite();
    this.scene.player.isAttacking = true;
    playerSprite.anims.play("player-attack", true);
    playerSprite.once("animationcomplete", () => {
      this.scene.player.isAttacking = false;
      playerSprite.anims.play("idle", true);
    });

    lance.setVelocity(Math.cos(angle) * 400, Math.sin(angle) * 400);

    this.scene.time.delayedCall(1000, () => {
      if (lance && lance.active) lance.destroy();
    });
  }
  enable() {
    this.enabled = true;
  }

  disable() {
  this.enabled = false;
}

  getGroup() {
    return this.group;
  }
}
