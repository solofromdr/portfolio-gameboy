import { Player } from "../entities/Player.js";
import { NPC } from "../entities/NPC.js";
import { ProjectileManager } from "../entities/Projectile.js";
import { DialogBox } from "../ui/DialogBox.js";
import {
  PLAYER_CONFIG,
  NPC_CONFIG,
  GAME_CONFIG,
  GAME_STATE,
} from "../config/constants.js";
import { GateManager } from "../entities/GateManager.js";
import { AmmoBar } from "../ui/AmmoBar.js";
import { SlimeMinion } from "../entities/SlimeMinion.js";
import { BiomeEffects } from "../entities/BiomeEffects.js";

export class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.tilemapTiledJSON("mapa", "/map/map.json");

    this.load.image("floor", "/map/floor.png");
    this.load.image("floor2", "/map/floor-v2.png");
    this.load.image("floordetail", "/map/floordetails.png");
    this.load.image("nature", "/map/nature.png");
    this.load.image("relief", "/map/relief.png");
    this.load.image("water", "/map/TilesetWater.png");

    this.load.spritesheet("idle", "/assets/idle/Idle.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("walk", "/assets/walk/Walk.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("npc-idle", "/assets/cavegirl/SpriteSheet.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    this.load.spritesheet("lance", "/assets/weapon/Shuriken.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.spritesheet("player-attack", "/assets/player/PlayerAttack.png", {
      frameWidth: 16,
      frameHeight: 16,
    });

    this.load.image("guardian", "/assets/cutscenes/2da.png");

    this.load.image("shuriken-active", "/assets/ui/Shuriken.png");
    this.load.image("shuriken-disabled", "/assets/ui/ShurikenDisabled.png");

    this.load.spritesheet("slime-minion", "/assets/enemies/Slime3.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
    // Música
    this.load.audio("music-game", "/audio/music/game.ogg");
    // Sonidos
    this.load.audio("sfx-shoot", "/audio/sounds/shoot.wav");
    this.load.audio("sfx-dash", "/audio/sounds/dash.wav");
    this.load.audio("sfx-hit-player", "/audio/sounds/hit-player.wav");
    this.load.audio("sfx-hit-minions", "/audio/sounds/hit-minions.wav");
    this.load.audio("sfx-death-player", "/audio/sounds/death-player.wav");
    this.load.audio("sfx-dialog", "/audio/sounds/dialog.wav");
    this.load.audio("sfx-pause", "/audio/sounds/pause.wav");
    this.load.audio("sfx-alert", "/audio/sounds/alert.wav");

    //UI
    this.load.image("dialogbox", "/assets/ui/DialogBoxFaceset.png");
    this.load.image("faceset-npc", "/assets/ui/faceset-npc.png");
    this.load.image("faceset-boss", "/assets/ui/faceset-boss.png");
    this.load.font("NormalFont", "/assets/ui/NormalFont.ttf");

    this.load.spritesheet("portfolio-items", "/assets/ui/items.png", {
      frameWidth: 16,
      frameHeight: 16,
    });
  }

  create() {
    // Mapa
    const map = this.make.tilemap({ key: "mapa" });
    const floorTiles = map.addTilesetImage("floor");
    const floorV2Tiles = map.addTilesetImage("floor2", "floor2");
    const floorDetailTiles = map.addTilesetImage("floordetails", "floordetail");
    const natureTiles = map.addTilesetImage("nature");
    const reliefTiles = map.addTilesetImage("relief");
    const waterTiles = map.addTilesetImage("water");

    const floorLayer = map.createLayer("floor", [
      floorTiles,
      floorV2Tiles,
      floorDetailTiles,
      waterTiles,
    ]);
    const detailsLayer = map.createLayer("details", [
      floorDetailTiles,
      natureTiles,
      reliefTiles,
    ]);
    const objectsLayer = map.createLayer("objects", [
      natureTiles,
      reliefTiles,
      floorV2Tiles,
    ]);
    const wallsLayer = map.createLayer("wall", [
      floorTiles,
      floorV2Tiles,
      natureTiles,
      reliefTiles,
    ]);
    wallsLayer.setCollisionByExclusion([-1]);

    // Cámara principal
    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.setZoom(GAME_CONFIG.zoom);

    // Cámara UI — debe crearse antes del cursor
    this.uiCamera = this.cameras.add(0, 0, this.scale.width, this.scale.height);
    this.uiCamera.setScroll(0, 0);

    this.uiCamera.ignore([floorLayer, detailsLayer, objectsLayer, wallsLayer]);

    // Barra de munición
    this.ammoBar = new AmmoBar(this);
    this.cameras.main.ignore(this.ammoBar.getObjects());

    // Cursor personalizado
    this.input.setDefaultCursor("default");
   // this.cursor = this.add
      //.image(0, 0, "cursor-interact")
      //.setDepth(999)
      //.setScrollFactor(0)
     // .setScale(1);
    //this.uiCamera.ignore(this.cursor);
    //this.input.on("pointerdown", () => this.cursor.setTexture("cursor-hit"));
    //this.input.on("pointerup", () => this.cursor.setTexture("cursor-interact"));

    // Diálogo
    const dialogBox = new DialogBox(this, "faceset-npc");
    this.cameras.main.ignore(dialogBox.getObjects());

    // Jugador
    this.player = new Player(this, PLAYER_CONFIG.startX, PLAYER_CONFIG.startY);
    const playerSprite = this.player.getSprite();
    this.physics.add.collider(playerSprite, wallsLayer);
    this.cameras.main.startFollow(playerSprite);
    this.uiCamera.ignore(playerSprite);

    // Efectos de bioma
    this.biomeEffects = new BiomeEffects(this);

    // NPC
    this.npc = new NPC(this, NPC_CONFIG.x, NPC_CONFIG.y, dialogBox, () => {
      this.projectiles.enable();
    });
    this.npc.setupOverlap(playerSprite);
    this.uiCamera.ignore(this.npc.getSprite());

    // Proyectiles
    this.projectiles = new ProjectileManager(this, wallsLayer, this.uiCamera);

    // Gate system
    this.gateManager = new GateManager(this, playerSprite, dialogBox);

    if (GAME_STATE.boss2Defeated) this.gateManager.openGate(3);
    if (GAME_STATE.boss3Defeated) this.gateManager.openGate(4);

    this.uiCamera.ignore([
      this.gateManager.gate2,
      this.gateManager.gate3,
      this.gateManager.gate4south,
      this.gateManager.gate4north,
    ]);

    // Pausa con ESC
    this.input.keyboard.on("keydown-ESC", () => {
      this.scene.pause("GameScene");
      this.sound.play("sfx-pause");
      this.scene.launch("PauseScene");
    });

    // Slimes del bioma 2
    this.slimes = [];
    this.slimesDefeated = 0;
    this.slimeGroup = this.physics.add.group();

    const slimePositions = [
      { x: 439, y: 122 },
      { x: 486, y: 83 },
      { x: 505, y: 145 },
    ];

    if (!GAME_STATE.boss2Defeated) {
      const slimePositions = [
        { x: 439, y: 122 },
        { x: 486, y: 83 },
        { x: 505, y: 145 },
      ];

      slimePositions.forEach((pos) => {
        const slime = new SlimeMinion(this, pos.x, pos.y);
        this.uiCamera.ignore(slime.getSprite());
        slime.getSprite().slimeRef = slime;
        this.slimeGroup.add(slime.getSprite());
        this.slimes.push(slime);
      });
    }

    // Aquí va el collider
    this.physics.add.collider(this.slimeGroup, wallsLayer);

    this.physics.add.collider(this.slimeGroup, this.gateManager.wall2);
    this.physics.add.collider(this.slimeGroup, this.gateManager.wall3);
    this.physics.add.collider(this.slimeGroup, this.gateManager.wall4south);
    this.physics.add.collider(this.slimeGroup, this.gateManager.wall4north);

    // Colisión shuriken con slimes
    this.physics.add.overlap(
      this.projectiles.getGroup(),
      this.slimeGroup,
      (lance, slimeSprite) => {
        if (!lance.active) return;
        lance.destroy();
        const slime = slimeSprite.slimeRef;
        if (slime && !slime.dead && !slime.invincible) {
          const died = slime.takeDamage();
          if (died) {
            this.slimesDefeated++;
            if (this.slimesDefeated >= 3) {
              this._triggerBossFight();
            }
          }
        }
      },
    );

    // Colisión player con slimes
    this.physics.add.overlap(this.player.getSprite(), this.slimeGroup, () => {
      this.cameras.main.shake(200, 0.01);
      this.cameras.main.flash(100, 255, 0, 0);
      this.sound.play("sfx-hit-player");
    });

    // Restaurar estado si ya se habló con la guardiana
    if (GAME_STATE.hasWeapon) {
      this.projectiles.enable();
      this.ammoBar.setVisible(true);
      this.gateManager.openGate(2);
    }

    if (GAME_STATE.boss2Defeated) {
      // Portal místico donde estaban los slimes
      const px = 480;
      const py = 110;

      const portalBg = this.add.circle(px, py, 20, 0x9900ff, 0.4).setDepth(5);
      const portalRing = this.add.circle(px, py, 20, 0x9900ff, 0).setDepth(5);
      portalRing.setStrokeStyle(2, 0xcc88ff);

      // Pulso
      this.tweens.add({
        targets: portalBg,
        alpha: 0.8,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 800,
        yoyo: true,
        repeat: -1,
      });

      // Partículas girando
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const dot = this.add
          .circle(
            px + Math.cos(angle) * 24,
            py + Math.sin(angle) * 24,
            3,
            0xcc88ff,
            1,
          )
          .setDepth(6);
        this.uiCamera.ignore(dot);

        this.tweens.add({
          targets: dot,
          angle: 360,
          duration: 2000,
          repeat: -1,
          onUpdate: () => {
            const a = angle + (this.time.now / 2000) * Math.PI * 2;
            dot.x = px + Math.cos(a) * 24;
            dot.y = py + Math.sin(a) * 24;
          },
        });
      }

      // Texto flotante
      const portalText = this.add
        .text(px, py - 36, "Presiona E", {
          fontSize: "8px",
          fill: "#cc88ff",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(6);

      this.tweens.add({
        targets: portalText,
        y: py - 40,
        alpha: 0.6,
        duration: 1000,
        yoyo: true,
        repeat: -1,
      });

      this.uiCamera.ignore([portalBg, portalRing, portalText]);

      // Tecla E para entrar al boss
      this.portalKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.E,
      );
      this.portalActive = true;
      this.portalX = px;
      this.portalY = py;

      // Atajo para abrir el inventario (solo para testing)
      this.input.keyboard.on("keydown-I", () => {
        if (GAME_STATE.inventory && GAME_STATE.inventory.length > 0) {
          this._toggleInventory();
        }
      });
    }

    this.sound.stopAll();
    this.music = this.sound.add("music-game", { loop: true, volume: 0.5 });
    this.music.play();
  }

  _triggerBossFight() {
    GAME_STATE.boss2Defeated = false; //reset
    this.cameras.main.shake(500, 0.02);
    this.cameras.main.flash(300, 255, 0, 0);
    this.time.delayedCall(1000, () => {
      this.cameras.main.fade(600, 0, 0, 0);
      this.time.delayedCall(600, () => {
        this.scene.start("BattleScene");
      });
    });
  }

  _toggleInventory() {
    if (this.inventoryOpen) {
      this.inventoryContainer.destroy();
      this.inventoryOpen = false;
      return;
    }

    this.inventoryOpen = true;
    const w = this.scale.width;
    const h = this.scale.height;

    this.inventoryContainer = this.add
      .container(0, 0)
      .setDepth(300)
      .setScrollFactor(0);

    const bg = this.add.rectangle(w / 2, h / 2, 300, 200, 0x000000, 0.9);
    const title = this.add
      .text(w / 2, h / 2 - 80, "— INVENTARIO —", {
        fontSize: "14px",
        fill: "#ffffff",
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    this.inventoryContainer.add([bg, title]);

    // Items
    const itemLabels = { book: "📖 Skills" };
    let y = h / 2 - 40;

    GAME_STATE.inventory.forEach((item) => {
      const btn = this.add
        .text(w / 2, y, itemLabels[item] || item, {
          fontSize: "13px",
          fill: "#ffff00",
        })
        .setOrigin(0.5)
        .setInteractive();

      btn.on("pointerdown", () => this._openItem(item));
      this.inventoryContainer.add(btn);
      y += 30;
    });

    this.cameras.main.ignore(this.inventoryContainer.getAll());
  }

  _openItem(item) {
    const w = this.scale.width;
    const h = this.scale.height;

    const content = {
      book: "⚔️ SKILLS\n\nPhaser.js · JavaScript\nHTML/CSS · Vite\nCiberseguridad · Godot",
    };

    // Limpiar inventario y mostrar contenido
    this.inventoryContainer.destroy();
    this.inventoryOpen = false;

    this.itemContainer = this.add
      .container(0, 0)
      .setDepth(300)
      .setScrollFactor(0);

    const bg = this.add.rectangle(w / 2, h / 2, 400, 250, 0x000000, 0.95);
    const text = this.add
      .text(w / 2, h / 2, content[item] || item, {
        fontSize: "12px",
        fill: "#ffffff",
        align: "center",
        lineSpacing: 8,
      })
      .setOrigin(0.5);

    const close = this.add
      .text(w / 2, h / 2 + 100, "[ CERRAR - I ]", {
        fontSize: "11px",
        fill: "#888888",
      })
      .setOrigin(0.5)
      .setInteractive();

    close.on("pointerdown", () => {
      this.itemContainer.destroy();
    });

    this.itemContainer.add([bg, text, close]);
    this.cameras.main.ignore(this.itemContainer.getAll());
  }

  update(time, delta) {
    const playerSprite = this.player.getSprite();
    this.player.update(PLAYER_CONFIG.speed);
    this.npc.update(playerSprite.x, playerSprite.y);
    this.slimes.forEach((slime) =>
      slime.update(playerSprite.x, playerSprite.y, delta),
    );
    //this.cursor.setPosition(
     // this.input.activePointer.x,
      //this.input.activePointer.y,
   // );
    this.biomeEffects.update(playerSprite.x, playerSprite.y);
    if (this.portalActive && this.portalKey.isDown) {
      const dist = Phaser.Math.Distance.Between(
        playerSprite.x,
        playerSprite.y,
        this.portalX,
        this.portalY,
      );
      if (dist < 40) {
        this.portalActive = false;
        this.music.stop();
        this.scene.start("BattleScene");
      }
    }
  }
}
