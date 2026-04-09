export class SlimeMinion {
  constructor(scene, x, y) {
    this.scene = scene;
    this.hp = 3;
    this.dead = false;
    this.invincible = false;
    this.jumpTimer = 0;
    this.jumpDelay = Phaser.Math.Between(1000, 2500);
    this.attacked = false;

    this.sprite = scene.physics.add.sprite(x, y, "slime-minion");
    this.sprite.setScale(1.5);
    this.sprite.setCollideWorldBounds(true);

    scene.anims.create({
      key: "slime-jump-down",
      frames: scene.anims.generateFrameNumbers("slime-minion", {
        frames: [0, 4, 8, 12],
      }),
      frameRate: 6,
      repeat: -1,
    });
    scene.anims.create({
      key: "slime-jump-up",
      frames: scene.anims.generateFrameNumbers("slime-minion", {
        frames: [1, 5, 9, 13],
      }),
      frameRate: 6,
      repeat: -1,
    });
    scene.anims.create({
      key: "slime-jump-left",
      frames: scene.anims.generateFrameNumbers("slime-minion", {
        frames: [2, 6, 10, 14],
      }),
      frameRate: 6,
      repeat: -1,
    });
    scene.anims.create({
      key: "slime-jump-right",
      frames: scene.anims.generateFrameNumbers("slime-minion", {
        frames: [3, 7, 11, 15],
      }),
      frameRate: 6,
      repeat: -1,
    });

    this.sprite.anims.play("slime-jump-down", true);
  }

  takeDamage() {
    if (this.dead || this.invincible) return false;

    this.attacked = true;
    this.invincible = true;
    this.hp--;

    // Invencible por 500ms después de recibir daño
    this.scene.time.delayedCall(500, () => {
      this.invincible = false;
    });

    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2,
    });

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  die() {
    this.dead = true;
    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scaleX: 2,
      scaleY: 0,
      duration: 300,
      onComplete: () => this.sprite.destroy(),
    });
  }

  update(playerX, playerY, delta) {
    if (this.dead) return;

    this.jumpTimer += delta;

    if (this.jumpTimer >= this.jumpDelay) {
      this.jumpTimer = 0;
      this.jumpDelay = Phaser.Math.Between(1000, 2500);

      // Random hasta ser golpeado, luego persigue al jugador
      if (this.attacked) {
        this._jumpTowardPlayer(playerX, playerY);
      } else {
        this._jumpRandom();
      }
    }
  }

  _jumpRandom() {
    const directions = ["down", "up", "left", "right"];
    const dir = directions[Phaser.Math.Between(0, 3)];

    const speed = 60;
    let vx = 0;
    let vy = 0;

    if (dir === "down") vy = speed;
    else if (dir === "up") vy = -speed;
    else if (dir === "left") vx = -speed;
    else if (dir === "right") vx = speed;

    this.sprite.setVelocity(vx, vy);
    this.sprite.anims.play(`slime-jump-${dir}`, true);

    this.scene.time.delayedCall(400, () => {
      if (!this.dead) this.sprite.setVelocity(0, 0);
    });
  }

  _jumpTowardPlayer(playerX, playerY) {
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      playerX,
      playerY,
    );

    const speed = 100;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    this.sprite.setVelocity(vx, vy);

    if (Math.abs(vx) > Math.abs(vy)) {
      this.sprite.anims.play(
        vx > 0 ? "slime-jump-right" : "slime-jump-left",
        true,
      );
    } else {
      this.sprite.anims.play(
        vy > 0 ? "slime-jump-down" : "slime-jump-up",
        true,
      );
    }

    this.scene.time.delayedCall(400, () => {
      if (!this.dead) this.sprite.setVelocity(0, 0);
    });
  }
  getSprite() {
    return this.sprite;
  }
}
