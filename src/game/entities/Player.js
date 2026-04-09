export class Player {
  constructor(scene, x, y) {
    this.scene = scene;
    this.hasWeapon = false;
    this.canDash = false;

    this.sprite = scene.physics.add.sprite(x, y, "idle");
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setScale(1.5);

    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.isDashing = false;
    this.dashDuration = 180;
    this.dashCooldown = 1200;
    this.dashSpeed = 460;
    this.dashTimer = 0;
    this.dashCooldownTimer = 0;
    this.hp = 5;
    this.maxHp = 5;
    this.invincible = false;
    this.iframes = 1000;

    this._createAnimations();
    this.sprite.anims.play("idle", true);

    this.isAttacking = false;
  }

  _createAnimations() {
    this.scene.anims.create({
      key: "idle",
      frames: this.scene.anims.generateFrameNumbers("idle", {
        start: 0,
        end: 0,
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.scene.anims.create({
      key: "walk-down",
      frames: this.scene.anims.generateFrameNumbers("walk", {
        frames: [0, 4, 8, 12],
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.scene.anims.create({
      key: "walk-up",
      frames: this.scene.anims.generateFrameNumbers("walk", {
        frames: [1, 5, 9, 13],
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.scene.anims.create({
      key: "walk-left",
      frames: this.scene.anims.generateFrameNumbers("walk", {
        frames: [2, 6, 10, 14],
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.scene.anims.create({
      key: "walk-right",
      frames: this.scene.anims.generateFrameNumbers("walk", {
        frames: [3, 7, 11, 15],
      }),
      frameRate: 8,
      repeat: -1,
    });
    this.scene.anims.create({
      key: "player-attack",
      frames: this.scene.anims.generateFrameNumbers("player-attack", {
        start: 0,
        end: 3,
      }),
      frameRate: 12,
      repeat: 0,
    });
  }

  update(speed = 200) {
    if (this.dashCooldownTimer > 0) {
      this.dashCooldownTimer -= this.scene.game.loop.delta;
      if (this.dashCooldownTimer < 0) this.dashCooldownTimer = 0;
    }

    if (this.isDashing) {
      this.dashTimer -= this.scene.game.loop.delta;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        this.sprite.clearTint();
      }
      return;
    }

    if (this.isAttacking) return;

    const direction = new Phaser.Math.Vector2(0, 0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) direction.x -= 1;
    if (this.cursors.right.isDown || this.wasd.right.isDown) direction.x += 1;
    if (this.cursors.up.isDown || this.wasd.up.isDown) direction.y -= 1;
    if (this.cursors.down.isDown || this.wasd.down.isDown) direction.y += 1;

    const hasDirection = direction.length() > 0;

    if (
      this.canDash &&
      hasDirection &&
      this.wasd.space.isDown &&
      this.dashCooldownTimer === 0
    ) {
      direction.normalize().scale(this.dashSpeed);
      this.sprite.body.setVelocity(direction.x, direction.y);
      this.isDashing = true;
      this.dashTimer = this.dashDuration;
      this.dashCooldownTimer = this.dashCooldown;
      this.sprite.setTint(0x00ffff);
      this.scene.sound.play("sfx-dash");
      return;
    }

    this.sprite.body.setVelocity(0);

    if (direction.x < 0) {
      this.sprite.body.setVelocityX(-speed);
      this.sprite.anims.play("walk-left", true);
    } else if (direction.x > 0) {
      this.sprite.body.setVelocityX(speed);
      this.sprite.anims.play("walk-right", true);
    } else if (direction.y < 0) {
      this.sprite.body.setVelocityY(-speed);
      this.sprite.anims.play("walk-up", true);
    } else if (direction.y > 0) {
      this.sprite.body.setVelocityY(speed);
      this.sprite.anims.play("walk-down", true);
    } else {
      this.sprite.anims.play("idle", true);
    }
  }

  enableDash() {
    this.canDash = true;
    this.scene.tweens.add({
      targets: this.sprite,
      duration: 120,
      repeat: 1,
      yoyo: true,
      alpha: 0.5,
      onComplete: () => {
        this.sprite.alpha = 1;
      },
    });
  }

  takeDamage(amount = 1) {
    if (this.invincible) return;
    this.hp -= amount;
    this.invincible = true;
    this.sprite.setTint(0xff0000);
    this.scene.cameras.main.shake(200, 0.01);
    this.scene.sound.play("sfx-hit-player");
    this.scene.cameras.main.flash(150, 255, 0, 0);
    this.scene.time.delayedCall(this.iframes, () => {
      this.invincible = false;
      this.sprite.clearTint();
    });
  }

  getHp() {
    return { hp: this.hp, maxHp: this.maxHp };
  }

  getSprite() {
    return this.sprite;
  }
}
