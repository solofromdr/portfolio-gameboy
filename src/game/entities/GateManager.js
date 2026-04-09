import { GAME_STATE } from "../config/constants.js";

export class GateManager {
  constructor(scene, player, dialogBox) {
    this.scene = scene;
    this.player = player;
    this.dialogBox = dialogBox;
    this.blocked = false;

    this._createGates();
  }

  _createGates() {
    // Zona bioma 2
    this.gate2 = this.scene.add.zone(311, 120, 20, 60);
    this.scene.physics.add.existing(this.gate2, true);

    // Zona bioma 3
    this.gate3 = this.scene.add.zone(153, 238, 60, 20);
    this.scene.physics.add.existing(this.gate3, true);

    // Zona bioma 4 sur
    this.gate4south = this.scene.add.zone(383, 408, 20, 80);
    this.scene.physics.add.existing(this.gate4south, true);

    // Zona bioma 4 norte
    this.gate4north = this.scene.add.zone(418, 287, 80, 20);
    this.scene.physics.add.existing(this.gate4north, true);

    // Overlap con cada zona
    this.scene.physics.add.overlap(this.player, this.gate2, () =>
      this._checkGate(2),
    );
    this.scene.physics.add.overlap(this.player, this.gate3, () =>
      this._checkGate(3),
    );
    this.scene.physics.add.overlap(this.player, this.gate4south, () =>
      this._checkGate(4),
    );
    this.scene.physics.add.overlap(this.player, this.gate4north, () =>
      this._checkGate(4),
    );

    // Paredes invisibles
    this.wall2 = this.scene.physics.add.staticImage(311, 120, null);
    this.wall2.setSize(20, 60);
    this.wall2.setVisible(false);
    this.scene.physics.add.collider(this.player, this.wall2);

    this.wall3 = this.scene.physics.add.staticImage(153, 238, null);
    this.wall3.setSize(60, 20);
    this.wall3.setVisible(false);
    this.scene.physics.add.collider(this.player, this.wall3);

    this.wall4south = this.scene.physics.add.staticImage(383, 408, null);
    this.wall4south.setSize(20, 100);
    this.wall4south.setVisible(false);
    this.scene.physics.add.collider(this.player, this.wall4south);

    this.wall4north = this.scene.physics.add.staticImage(418, 287, null);
    this.wall4north.setSize(80, 20);
    this.wall4north.setVisible(false);
    this.scene.physics.add.collider(this.player, this.wall4north);
  }

  _checkGate(bioma) {
    if (this.blocked) return;

    let canPass = false;
    let message = "";

    if (bioma === 2) {
      canPass = GAME_STATE.hasWeapon;
      message = "⚠️ Habla con el espíritu del bosque\nantes de aventurarte.";
    } else if (bioma === 3) {
      canPass = GAME_STATE.boss2Defeated;
      message =
        "⚠️ Debes derrotar al guardián del bioma 2\nantes de continuar.";
    } else if (bioma === 4) {
      canPass = GAME_STATE.boss3Defeated;
      message =
        "⚠️ Debes derrotar al guardián del bioma 3\nantes de continuar.";
    }

    if (!canPass) {
      this._blockPlayer(message);
    }
  }

  _blockPlayer(message) {
    this.blocked = true;

    // Empuja al jugador hacia atrás
    const playerSprite = this.player;
    const angle = Phaser.Math.Angle.Between(
      playerSprite.x,
      playerSprite.y,
      this.scene.cameras.main.centerX,
      this.scene.cameras.main.centerY,
    );
    playerSprite.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);

    // Muestra mensaje
    this._showMessage(message);

    // Flash rojo en pantalla
    this.scene.cameras.main.flash(300, 255, 0, 0);

    // Desbloquea después de 1.5 segundos
    this.scene.time.delayedCall(1500, () => {
      this.blocked = false;
      this.dialogBox.hide();
      playerSprite.setVelocity(0, 0);
    });
  }

  _showMessage(message) {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;

    if (this.messageText) this.messageText.destroy();
    if (this.messageBg) this.messageBg.destroy();

    this.messageBg = this.scene.add
      .rectangle(w / 2, h / 2, 400, 80, 0x000000, 0.85)
      .setScrollFactor(0)
      .setDepth(100);

    this.messageText = this.scene.add
      .text(w / 2, h / 2, message, {
        fontSize: "13px",
        fill: "#ff4444",
        align: "center",
        wordWrap: { width: 360 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    // Ignorar en cámara principal
    this.scene.cameras.main.ignore([this.messageBg, this.messageText]);

    this.scene.time.delayedCall(1500, () => {
      if (this.messageBg) this.messageBg.destroy();
      if (this.messageText) this.messageText.destroy();
    });
  }

  openGate(bioma) {
    if (bioma === 2) this.wall2.destroy();
    if (bioma === 3) this.wall3.destroy();
    if (bioma === 4) {
      this.wall4south.destroy();
      this.wall4north.destroy();
    }
  }
}
