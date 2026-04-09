import { GAME_CONFIG, PLAYER_CONFIG, GAME_STATE } from "../config/constants.js";
import { SlimeBoss } from "../entities/SlimeBoss.js";
import { Player } from "../entities/Player.js";
import { HealthBar } from "../ui/healthbar.js";
import { ProjectileManager } from "../entities/Projectile.js";
import { DialogBox } from "../ui/DialogBox.js";

export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
  }

  preload() {
    this.load.tilemapTiledJSON("battle", "/map/battle.json");
    this.load.image("floordungeon", "/map/floordungeon.png");
    this.load.image("wallsdungeon", "/map/wallsdungeon.png");

    this.load.spritesheet(
      "slime-boss-idle",
      "/assets/enemies/SlimeBossIdle.png",
      {
        frameWidth: 62,
        frameHeight: 52,
      },
    );
    this.load.spritesheet(
      "slime-boss-jump",
      "/assets/enemies/SlimeBossJump.png",
      {
        frameWidth: 62,
        frameHeight: 52,
      },
    );
    this.load.spritesheet(
      "slime-boss-hit",
      "/assets/enemies/SlimeBossHit.png",
      {
        frameWidth: 62,
        frameHeight: 52,
      },
    );

    this.load.spritesheet(
      "slime-boss-phase2-idle",
      "/assets/enemies/slime-boss-phase2-idle.png",
      { frameWidth: 62, frameHeight: 52 },
    );
    this.load.spritesheet(
      "slime-boss-phase2-jump",
      "/assets/enemies/slime-boss-phase2-jump.png",
      { frameWidth: 62, frameHeight: 52 },
    );
    this.load.spritesheet(
      "slime-boss-phase2-hit",
      "/assets/enemies/slime-boss-phase2-hit.png",
      { frameWidth: 62, frameHeight: 52 },
    );

    this.load.audio("music-battle", "/audio/music/battle.ogg");

    this.load.audio("sfx-shoot", "/audio/sounds/shoot.wav");
    this.load.audio("sfx-hit-boss", "/audio/sounds/hit-boss.wav");
    this.load.audio("sfx-death-boss", "/audio/sounds/death-boss.wav");
    this.load.audio("sfx-hit-minions", "/audio/sounds/hit-minions.wav");
    // UI
    this.load.image("dialogbox", "/assets/ui/DialogBox.png");
    this.load.image("faceset-npc", "/assets/ui/DialogBoxFaceset.png");
    this.load.image("faceset-boss", "/assets/ui/faceset-boss.png");

    this.load.spritesheet("portfolio-items", "/assets/ui/Items.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    window.game = this.game; // para debug en consola
    this.victoryTriggered = false;
    this.boss = null;
    this.deathTriggered = false;
    this.input.keyboard.enabled = true;

    const w = this.scale.width;
    const h = this.scale.height;

    this.input.setDefaultCursor("crosshair");

    // Fondo negro
    this.add.rectangle(w / 2, h / 2, w, h, 0x000000);
    this.add.rectangle(w / 2, h / 2, w, h, 0x000000).setScrollFactor(0);

    // Nebulosas
    this._createNebula(w * 0.2, h * 0.3, 0x4400aa, 200);
    this._createNebula(w * 0.8, h * 0.6, 0x0033aa, 180);
    this._createNebula(w * 0.5, h * 0.2, 0x660044, 150);

    // Estrellas
    for (let i = 0; i < 150; i++) {
      const star = this.add
        .circle(
          Phaser.Math.Between(0, w),
          Phaser.Math.Between(0, h),
          Phaser.Math.Between(1, 2),
          0xffffff,
          Phaser.Math.FloatBetween(0.2, 0.8),
        )
        .setScrollFactor(0);
      this.tweens.add({
        targets: star,
        alpha: 0.1,
        duration: Phaser.Math.Between(800, 2000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1000),
      });
    }

    // Partículas de energía
    this._createEnergyParticles(w, h);

    // Mapa de batalla
    this.map = this.make.tilemap({ key: "battle" });
    const map = this.map;
    const floorTiles = map.addTilesetImage("floordungeon", "floordungeon");
    const wallsTiles = map.addTilesetImage("wallsdungeon", "wallsdungeon");

    const floorLayer = map.createLayer("floor", [floorTiles]);
    const wallsLayer = map.createLayer("walls", [wallsTiles]);
    wallsLayer.setCollisionByExclusion([-1]);
    this.wallsLayer = wallsLayer;

    // Centrar mapa en pantalla
    const mapWidth = map.widthInPixels;
    const mapHeight = map.heightInPixels;
    const offsetX = (w - mapWidth) / 2;
    const offsetY = (h - mapHeight) / 2;

    floorLayer.setPosition(offsetX, offsetY);
    wallsLayer.setPosition(offsetX, offsetY);

    // Calcular zoom para que el mapa quepa en pantalla
    const scaleX = w / map.widthInPixels;
    const scaleY = h / map.heightInPixels;
    const zoom = Math.min(scaleX, scaleY) * 0.9;

    this.cameras.main.setZoom(zoom);
    this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);

    floorLayer.setPosition(0, 0);
    wallsLayer.setPosition(0, 0);

    // Fade in
    this.cameras.main.fadeIn(800);

    this.player = new Player(
      this,
      this.map.widthInPixels / 2,
      this.map.heightInPixels * 0.75,
    );
    const playerSprite = this.player.getSprite();
    this.physics.add.collider(playerSprite, this.wallsLayer);
    // No seguir al player: cámara fija en BattleScene
    this.cameras.main.centerOn(map.widthInPixels / 2, map.heightInPixels / 2);
    this.player.enableDash(); // habilita dash directo en BattleScene

    this.projectiles = new ProjectileManager(this, this.wallsLayer, null);
    this.projectiles.enable();

    // Intro del boss
    this.time.delayedCall(1000, () => {
      this._showBossIntro();
    });

    this.scene.launch("UIScene");
    this.ui = this.scene.get("UIScene");

    this.sound.stopAll();
    this.music = this.sound.add("music-battle", { loop: true, volume: 0.5 });
    this.music.play();

    this.input.keyboard.on("keydown-K", () => {
      if (this.boss) {
        this.boss.hp = 0;
        this.boss.die();
      }
    });
  }

  _createNebula(x, y, color, size) {
    for (let i = 0; i < 8; i++) {
      const circle = this.add
        .circle(
          x + Phaser.Math.Between(-size, size),
          y + Phaser.Math.Between(-size, size),
          Phaser.Math.Between(30, 80),
          color,
          Phaser.Math.FloatBetween(0.05, 0.15),
        )
        .setScrollFactor(0);
      this.tweens.add({
        targets: circle,
        x: circle.x + Phaser.Math.Between(-20, 20),
        y: circle.y + Phaser.Math.Between(-20, 20),
        alpha: circle.alpha * 0.5,
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
      });
    }
  }

  _createEnergyParticles(w, h) {
    for (let i = 0; i < 30; i++) {
      const colors = [0x9900ff, 0x0066ff, 0xff3300, 0x00ffcc];
      const color = colors[Phaser.Math.Between(0, 3)];
      const particle = this.add
        .circle(
          Phaser.Math.Between(0, w),
          Phaser.Math.Between(0, h),
          Phaser.Math.Between(1, 3),
          color,
          0.8,
        )
        .setScrollFactor(0);
      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-100, 100),
        y: particle.y + Phaser.Math.Between(-100, 100),
        alpha: 0,
        duration: Phaser.Math.Between(1500, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  _showBossIntro() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.player.getSprite().body.enable = false;
    this.projectiles.disable();

    const npcLines = [
      "Viajero... el guardián despierta.",
      "Recuerda: usa SPACE para hacer dash\ny esquivar sus ataques.",
    ];

    let lineIndex = 0;

    const dialogBg = this.add
      .rectangle(
        this.map.widthInPixels / 2,
        this.map.heightInPixels * 0.9,
        220,
        40,
        0x000000,
        0.8,
      )
      .setDepth(199);

    const dialogText = this.add
      .text(
        this.map.widthInPixels / 2,
        this.map.heightInPixels * 0.9,
        npcLines[0],
        {
          fontSize: "13px",
          fill: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
          align: "center",
          wordWrap: { width: 200 },
        },
      )
      .setOrigin(0.5)
      .setDepth(200);

    const spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
    spaceKey.on("down", () => {
      lineIndex++;
      if (lineIndex < npcLines.length) {
        dialogText.setText(npcLines[lineIndex]);
      } else {
        dialogText.destroy();
        dialogBg.destroy();
        spaceKey.removeAllListeners();
        this._startBossIntro();
      }
    });
  }

  _startBossIntro() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.cameras.main.shake(600, 0.02);
    this.cameras.main.flash(300, 100, 0, 150);

    const bossName = this.add
      .text(w / 2, h * 0.3, "GUARDIÁN DEL BIOMA", {
        fontSize: "14px",
        fill: "#9900ff",
        letterSpacing: 6,
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(100)
      .setScrollFactor(0);

    const bossTitle = this.add
      .text(w / 2, h * 0.4, "✦ SLIME PRIMORDIAL ✦", {
        fontSize: "24px",
        fill: "#ffffff",
        letterSpacing: 4,
        stroke: "#9900ff",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(100)
      .setScrollFactor(0);

    this.tweens.add({
      targets: [bossName, bossTitle],
      alpha: 1,
      duration: 800,
      onComplete: () => {
        this.time.delayedCall(2000, () => {
          this.tweens.add({
            targets: [bossName, bossTitle],
            alpha: 0,
            duration: 600,
            onComplete: () => {
              this.player.getSprite().body.enable = true;
              this.projectiles.enable();
              this.boss = new SlimeBoss(
                this,
                this.map.widthInPixels / 2,
                this.map.heightInPixels / 2,
              );
              this.physics.add.collider(this.boss.getSprite(), this.wallsLayer);
              this.physics.add.overlap(
                this.player.getSprite(),
                this.boss.getSprite(),
                () => this.player.takeDamage(1),
              );
              this.physics.add.overlap(
                this.projectiles.getGroup(),
                this.boss.getSprite(),
                () => {
                  this.boss.takeDamage();
                  this.ui?.updateBossHp(this.boss.hp, this.boss.maxHp);
                },
                null,
                this,
              );
              this.ui.setBossVisible(true);
            },
          });
        });
      },
    });
  }

  _triggerVictory() {
    const w = this.scale.width;
    const h = this.scale.height;

    // Detener movimiento del player
    this.player.getSprite().setVelocity(0, 0);

    // Shake y flash épico
    this.cameras.main.shake(1000, 0.04);
    this.cameras.main.flash(500, 150, 0, 255);

    // Lluvia de partículas — viaje astral
    for (let i = 0; i < 80; i++) {
      const colors = [0x9900ff, 0x00ffff, 0xff00ff, 0xffffff, 0x0066ff];
      const color = colors[Phaser.Math.Between(0, 4)];
      const particle = this.add
        .circle(
          Phaser.Math.Between(0, w),
          Phaser.Math.Between(0, h),
          Phaser.Math.Between(2, 5),
          color,
          1,
        )
        .setScrollFactor(0)
        .setDepth(150);

      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-200, 200),
        y: particle.y + Phaser.Math.Between(-200, 200),
        alpha: 0,
        scaleX: 3,
        scaleY: 3,
        duration: Phaser.Math.Between(800, 2000),
        delay: Phaser.Math.Between(0, 600),
        onComplete: () => particle.destroy(),
      });
    }

    // Texto de victoria
    this.time.delayedCall(800, () => {
      const line1 = this.add
        .text(w / 2, h * 0.35, "BIOMA LIBERADO", {
          fontSize: "14px",
          fill: "#cc88ff",
          letterSpacing: 8,
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setDepth(200)
        .setScrollFactor(0);

      const line2 = this.add
        .text(w / 2, h * 0.45, "✦ VICTORIA ✦", {
          fontSize: "32px",
          fill: "#ffffff",
          letterSpacing: 6,
          stroke: "#9900ff",
          strokeThickness: 8,
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setDepth(200)
        .setScrollFactor(0);

      this.tweens.add({
        targets: [line1, line2],
        alpha: 1,
        duration: 1000,
        onComplete: () => {
          this.time.delayedCall(2500, () => {
            this.cameras.main.once("camerafadeoutcomplete", () => {
              GAME_STATE.boss2Defeated = true;
              this.scene.stop("UIScene");
              this.scene.stop("BattleScene");
              this.scene.start("GameScene", { bossDefeated: true });
            });
            this.cameras.main.fadeOut(1000);
          });
        },
      });
    });
  }

  _dropItem() {
    const book = this.physics.add.sprite(
      this.map.widthInPixels / 2,
      this.map.heightInPixels / 2,
      "portfolio-items",
      1,
    );

    book.setScale(1);

    this.tweens.add({
      targets: book,
      y: book.y - 8,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    this.physics.add.overlap(this.player.getSprite(), book, () => {
      book.destroy();
      GAME_STATE.inventory = GAME_STATE.inventory || [];
      GAME_STATE.inventory.push("book");
      this._triggerVictory(); // ← victoria después de recoger
    });
  }

  _triggerDeath() {
    this.player.getSprite().setVelocity(0, 0);
    this.cameras.main.shake(600, 0.03);
    this.cameras.main.flash(400, 255, 0, 0);
    this.player.getSprite().setTint(0xff0000);
    // Deshabilitar input
    this.player.cursors.left.enabled = false;
    this.player.cursors.right.enabled = false;
    this.player.cursors.up.enabled = false;
    this.player.cursors.down.enabled = false;
    this.input.keyboard.enabled = false;
    this.projectiles.enabled = false;

    this.time.delayedCall(800, () => {
      const w = this.scale.width;
      const h = this.scale.height;

      const line1 = this.add
        .text(w / 2, h * 0.4, "✦ HAS CAÍDO ✦", {
          fontSize: "28px",
          fill: "#ff3300",
          stroke: "#000000",
          strokeThickness: 6,
        })
        .setOrigin(0.5)
        .setAlpha(0)
        .setDepth(200)
        .setScrollFactor(0);

      this.tweens.add({
        targets: line1,
        alpha: 1,
        duration: 1000,
        onComplete: () => {
          this.time.delayedCall(2000, () => {
            this.cameras.main.once("camerafadeoutcomplete", () => {
              this.deathTriggered = false;
              this.scene.stop("UIScene");
              this.scene.stop("BattleScene");
              this.music.stop();
              this.scene.start("GameScene", { bossDefeated: false });
            });
            this.cameras.main.fadeOut(1000);
          });
        },
      });
    });
  }

  update(time, delta) {
    if (this.player) {
      this.player.update(PLAYER_CONFIG.speed);
      this.ui?.updatePlayerHp(
        this.player.getHp().hp,
        this.player.getHp().maxHp,
      );
      if (this.player.getHp().hp <= 0 && !this.deathTriggered) {
        this.deathTriggered = true;
        this._triggerDeath();
      }
    }
    if (this.boss) {
      const px = this.player
        ? this.player.getSprite().x
        : this.cameras.main.centerX;
      const py = this.player
        ? this.player.getSprite().y
        : this.cameras.main.centerY;
      this.boss.update(px, py, delta);
      this.ui?.updateBossHp(this.boss.hp, this.boss.maxHp);

      if (this.boss.dead && !this.victoryTriggered) {
        this.victoryTriggered = true;
        this._dropItem(); // ← drop primero
      }
    }
  }
}
