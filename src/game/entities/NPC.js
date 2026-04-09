import { GAME_STATE } from "../config/constants.js";

export class NPC {
  constructor(scene, x, y, dialogBox, onTalk) {
    this.scene = scene;
    this.dialogBox = dialogBox;
    this.hasSpoken = false;
    this.dialogActive = false;
    this.currentLine = 0;
    this.onTalk = onTalk;

    this.sprite = scene.physics.add.sprite(x, y, "npc-idle");
    this.sprite.setScale(1.5);
    this.sprite.setImmovable(true);
    this.sprite.setAlpha(0);

    scene.anims.create({
      key: "npc-idle",
      frames: scene.anims.generateFrameNumbers("npc-idle", { frames: [0] }),
      frameRate: 6,
      repeat: -1,
    });
    this.sprite.anims.play("npc-idle", true);

    // Líneas del diálogo
    this.lines = [
      "✨ ...Viajero...",
      "Este lugar no es solo un mapa.\nEs el alma de su creador hecha mundo.",
      "Cada bioma guarda un fragmento de quien él es.\nPero sus guardianes no dejarán pasar a cualquiera.",
      "Toma esto... lo necesitarás.\n✦ Has obtenido un Shuriken ✦",
    ];

    // Tecla SPACE para avanzar diálogo
    this.spaceKey = scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );
  }

  setupOverlap(player) {
    this.scene.physics.add.overlap(
      player,
      this.sprite,
      () => {
        if (GAME_STATE.hasWeapon) return; // ya habló, ignorar
        if (!this.hasSpoken && !this.dialogActive) {
          this.hasSpoken = true;
          this.dialogActive = true;

          // Fade in del NPC
          this.scene.tweens.add({
            targets: this.sprite,
            alpha: 1,
            duration: 1000,
            onComplete: () => this._showCutscene(),
          });
        }
      },
      null,
      this.scene,
    );
  }

  _showCutscene() {
    const w = this.scene.scale.width;
    const h = this.scene.scale.height;

    // Imagen ocupa toda la pantalla desde el inicio
    this.cutsceneImg = this.scene.add.image(w / 2, h / 2, "guardian");
    this.cutsceneImg.setDisplaySize(w * 1.2, h * 1.2);
    this.cutsceneImg.setDepth(50);
    this.cutsceneImg.setScrollFactor(0);

    // Ken Burns — paneo interno de arriba hacia abajo
    this.scene.tweens.add({
      targets: this.cutsceneImg,
      scaleX: this.cutsceneImg.scaleX * 1.1,
      scaleY: this.cutsceneImg.scaleY * 1.1,
      y: h / 2 - 20,
      duration: 8000,
      ease: "Linear",
    });

    // Overlay oscuro
    this.overlay = this.scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.3);
    this.overlay.setDepth(51);
    this.overlay.setScrollFactor(0);

    // Subir el depth del dialogBox por encima de la imagen
    this.dialogBox.setDepth(60);

    // Ignorar en cámara principal
    this.scene.cameras.main.ignore([this.cutsceneImg, this.overlay]);

    this.scene.time.delayedCall(800, () => {
      this._showLine();
    });
  }

  _showLine() {
    if (this.currentLine >= this.lines.length) {
      this._endDialog();
      return;
    }

    this.dialogBox.typewrite(this.lines[this.currentLine], () => {
      // Texto completado, espera SPACE
      this._waitForSpace();
    });
  }

  _waitForSpace() {
    this.scene.time.delayedCall(300, () => {
      const onSpace = () => {
        this.spaceKey.off("down", onSpace);
        this.currentLine++;
        this._showLine();
      };
      this.spaceKey.on("down", onSpace);
    });
  }

  _endDialog() {
    // Fade out de la cutscene
    this.scene.tweens.add({
      targets: [this.cutsceneImg, this.overlay],
      alpha: 0,
      duration: 800,
      onComplete: () => {
        this.cutsceneImg.destroy();
        this.overlay.destroy();
        this.dialogBox.hide();
        this.dialogActive = false;

        // Desbloquear arma y gate
        GAME_STATE.hasWeapon = true;
        this.scene.gateManager.openGate(2);
        if (this.onTalk) this.onTalk();
      },
    });
    this.scene.ammoBar.setVisible(true);
  }

  update(playerX, playerY) {
    const distance = Phaser.Math.Distance.Between(
      playerX,
      playerY,
      this.sprite.x,
      this.sprite.y,
    );

    if (distance > 60 && this.sprite.alpha > 0 && !this.dialogActive) {
      this.scene.tweens.add({
        targets: this.sprite,
        alpha: 0,
        duration: 800,
      });
      if (!GAME_STATE.hasWeapon) this.hasSpoken = false;
      this.dialogBox.hide();
    }
  }

  getSprite() {
    return this.sprite;
  }
}
