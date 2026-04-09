export class SlimeBoss {
  constructor(scene, x, y) {
    this.scene = scene;
    this.hp = 40;
    this.maxHp = 40;
    this.dead = false;
    this.invincible = false;
    this.phase = 1;
    this.jumpTimer = 0;
    this.jumpDelay = 2000;
    this.isPhase2 = false;
    this.isSplit = false;
    this.splitMinions = [];

    this.sprite = scene.physics.add.sprite(x, y, "slime-boss-idle");
    this.sprite.setScale(1.5);
    this.sprite.setCollideWorldBounds(true);

    scene.anims.create({
      key: "boss-idle",
      frames: scene.anims.generateFrameNumbers("slime-boss-idle", {
        start: 0,
        end: 4,
      }),
      frameRate: 6,
      repeat: -1,
    });
    scene.anims.create({
      key: "boss-jump",
      frames: scene.anims.generateFrameNumbers("slime-boss-jump", {
        start: 0,
        end: 12,
      }),
      frameRate: 15,
      repeat: 0,
    });
    scene.anims.create({
      key: "boss-hit",
      frames: scene.anims.generateFrameNumbers("slime-boss-hit", {
        start: 0,
        end: 4,
      }),
      frameRate: 10,
      repeat: 0,
    });

    scene.anims.create({
      key: "boss-phase2-idle",
      frames: scene.anims.generateFrameNumbers("slime-boss-phase2-idle", {
        start: 0,
        end: 4,
      }),
      frameRate: 6,
      repeat: -1,
    });
    scene.anims.create({
      key: "boss-phase2-jump",
      frames: scene.anims.generateFrameNumbers("slime-boss-phase2-jump", {
        start: 0,
        end: 12,
      }),
      frameRate: 15,
      repeat: 0,
    });
    scene.anims.create({
      key: "boss-phase2-hit",
      frames: scene.anims.generateFrameNumbers("slime-boss-phase2-hit", {
        start: 0,
        end: 4,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.sprite.anims.play("boss-idle", true);
  }

  takeDamage() {
    if (this.dead || this.invincible) return false;
    if (!this.sprite) return false;

    this.invincible = true;
    this.hp--;

    const hitAnim = this.phase === 2 ? "boss-phase2-hit" : "boss-hit";
    if (this.sprite.anims) this.sprite.anims.play(hitAnim, true);
    this.scene.time.delayedCall(500, () => {
      // ← 500ms para el hit
      if (!this.dead && this.sprite && this.sprite.anims) {
        const idleAnim = this.phase === 2 ? "boss-phase2-idle" : "boss-idle";
        this.sprite.anims.play(idleAnim, true);
        this.invincible = false;
      }
    });

    this.scene.sound.play("sfx-hit-boss");

    // this.scene.tweens.add({
    //   targets: this.sprite,
    //   alpha: 0.3,
    //   duration: 100,
    //   yoyo: true,
    //   repeat: 2,
    //   onComplete: () => {
    //     if (this.sprite) this.sprite.setAlpha(1)
    //   }
    // })

    // Fase 2 al 50% de vida
    if (this.hp <= this.maxHp / 2 && this.phase === 1) {
      this._enterPhase2();
    }

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  _enterPhase2() {
    this.phase = 2;
    this.isPhase2 = true;
    this.jumpDelay = 1000;

    // Flash de transición
    this.scene.cameras.main.shake(500, 0.03);
    this.scene.cameras.main.flash(400, 0, 100, 255);

    // Boss se hace más grande
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 2,
      scaleY: 2,
      duration: 500,
      onComplete: () => {
        // Cambio de textura DESPUÉS del tween
        this.sprite.clearTint();
        this.sprite.setTexture("slime-boss-phase2-idle");
        this.sprite.setFrame(0);
        this.sprite.anims.play("boss-phase2-idle", true);
      },
    });

    // Split inmediato al entrar fase 2
    this.scene.time.delayedCall(1000, () => {
      if (!this.dead) this._doSplit();
    });

    // Luego cada 8 segundos
    this.scene.time.addEvent({
      delay: 8000,
      loop: true,
      callback: () => {
        if (!this.dead && this.isPhase2 && !this.isSplit) {
          this._doSplit();
        }
      },
    });
  }

  _doSplit() {
    if (this.dead || this.isSplit) return;
    this.isSplit = true;

    // Crea 4 mini-slimes temporales
    const offsets = [-60, -20, 20, 60];
    for (let i = 0; i < 4; i++) {
      const offsetX = offsets[i];
      const mini = this.scene.physics.add.sprite(
        this.sprite.x + offsetX,
        this.sprite.y,
        "slime-minion",
      );
      mini.setScale(1.2);
      mini.setTint(0xadbc3a);
      mini.setCollideWorldBounds(true);
      mini.jumpTimer = Phaser.Math.Between(0, 900);
      mini.anims.play("slime-jump-down", true);

      const playerSprite = this.scene.player.getSprite();
      this.scene.physics.add.overlap(mini, playerSprite, () => {
        if (mini.active) {
          this.scene.player.takeDamage(1);
          mini.destroy();
        }
      });

      this.splitMinions.push(mini);
    }

    // Los mini-slimes desaparecen solos a los 5 segundos
    this.scene.time.delayedCall(5000, () => {
      this._clearSplit();
    });
  }

  _clearSplit() {
    this.splitMinions.forEach((m) => {
      if (m && m.active) m.destroy();
    });
    this.splitMinions = [];
    this.isSplit = false;
  }

  die() {
    this.dead = true;
    this._clearSplit();
    this.scene.cameras.main.shake(800, 0.03);

    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      scaleX: 3,
      scaleY: 0,
      duration: 600,
      onComplete: () => {
        this.sprite.destroy();
      },
    });
  }

  update(playerX, playerY, delta) {
    if (this.dead || this.invincible) return;
    if (!this.sprite || !this.sprite.active) return;

    this.jumpTimer += delta;

    if (this.jumpTimer >= this.jumpDelay) {
      this.jumpTimer = 0;
      this._jumpTowardPlayer(playerX, playerY);
    }

    if (this.isPhase2 && this.splitMinions.length > 0) {
      this.splitMinions.forEach((mini) => {
        if (!mini || !mini.active) return;

        if (!mini.jumpTimer) mini.jumpTimer = 0;
        mini.jumpTimer += delta;

        if (mini.jumpTimer >= 600) {
          mini.jumpTimer = 0;

          const angle = Phaser.Math.Angle.Between(
            mini.x,
            mini.y,
            playerX,
            playerY,
          );
          const vx = Math.cos(angle) * 180;
          const vy = Math.sin(angle) * 180;

          mini.setVelocity(vx, vy);

          // Animación direccional igual que SlimeMinion
          if (Math.abs(vx) > Math.abs(vy)) {
            mini.anims.play(
              vx > 0 ? "slime-jump-right" : "slime-jump-left",
              true,
            );
          } else {
            mini.anims.play(vy > 0 ? "slime-jump-down" : "slime-jump-up", true);
          }

          this.scene.time.delayedCall(400, () => {
            if (mini && mini.active) {
              mini.setVelocity(0, 0);
              mini.anims.play("slime-jump-down", true);
            }
          });
        }
      });
    }
  }

  _jumpTowardPlayer(playerX, playerY) {
    if (!this.sprite || !this.sprite.active) return;
    const angle = Phaser.Math.Angle.Between(
      this.sprite.x,
      this.sprite.y,
      playerX,
      playerY,
    );

    const speed = this.phase === 1 ? 120 : 200;
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const jumpAnim = this.phase === 2 ? "boss-phase2-jump" : "boss-jump";
    this.sprite.anims.play(jumpAnim, true);
    this.sprite.setVelocity(vx, vy);

    this.scene.time.delayedCall(867, () => {
      if (!this.dead && this.sprite && this.sprite.active) {
        this.sprite.setVelocity(0, 0);
        const idleAnim = this.phase === 2 ? "boss-phase2-idle" : "boss-idle";
        this.sprite.anims.play(idleAnim, true);
      }
    });
  }

  getSprite() {
    return this.sprite;
  }
}
