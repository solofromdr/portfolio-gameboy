export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: "PauseScene" });
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    this.input.setDefaultCursor("none");
    this.cursor = this.add
      .image(0, 0, "cursor-interact")
      .setDepth(999)
      .setScrollFactor(0)
      .setScale(1);

    this.input.on("pointerdown", () => this.cursor.setTexture("cursor-hit"));
    this.input.on("pointerup", () => this.cursor.setTexture("cursor-interact"));

    // Fondo semitransparente
    this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7);

    // Título
    this.add
      .text(w / 2, h * 0.3, "— PAUSA —", {
        fontSize: "28px",
        fill: "#ffffff",
        letterSpacing: 6,
      })
      .setOrigin(0.5);

    // Volumen
    this.add
      .text(w / 2, h * 0.45, "VOLUMEN", {
        fontSize: "14px",
        fill: "#8888ff",
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    this.volume = this.sound.volume * 100 || 100;

    const volDown = this.add
      .text(w / 2 - 60, h * 0.53, "[ - ]", {
        fontSize: "18px",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive();

    this.volText = this.add
      .text(w / 2, h * 0.53, this.volume + "%", {
        fontSize: "16px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    const volUp = this.add
      .text(w / 2 + 60, h * 0.53, "[ + ]", {
        fontSize: "18px",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive();

    volDown.on("pointerdown", () => this.changeVolume(-10));
    volUp.on("pointerdown", () => this.changeVolume(10));

    // Continuar
    const continueBtn = this.add
      .text(w / 2, h * 0.65, "[ CONTINUAR ]", {
        fontSize: "18px",
        fill: "#ffffff",
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setInteractive();

    continueBtn.on("pointerover", () =>
      continueBtn.setStyle({ fill: "#ffff00" }),
    );
    continueBtn.on("pointerout", () =>
      continueBtn.setStyle({ fill: "#ffffff" }),
    );
    continueBtn.on("pointerdown", () => {
      this.sound.play("sfx-ui-click");
      this.resumeGame();
    });

    // Menú principal
    const menuBtn = this.add
      .text(w / 2, h * 0.73, "[ MENÚ PRINCIPAL ]", {
        fontSize: "14px",
        fill: "#555555",
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setInteractive();

    menuBtn.on("pointerover", () => menuBtn.setStyle({ fill: "#ff5555" }));
    menuBtn.on("pointerout", () => menuBtn.setStyle({ fill: "#555555" }));
    menuBtn.on("pointerdown", () => {
      this.sound.play("sfx-ui-back");
      this.sound.stopByKey("music-game");
      this.scene.stop("GameScene");
      this.scene.stop("PauseScene");
      this.scene.start("MenuScene");
    });

    this.add.sound;

    // ESC para cerrar
    this.input.keyboard.on("keydown-ESC", () => this.resumeGame());
  }

  changeVolume(amount) {
    this.volume = Phaser.Math.Clamp(this.volume + amount, 0, 100);
    this.volText.setText(this.volume + "%");
    this.sound.volume = this.volume / 100;
  }

  resumeGame() {
    this.scene.resume("GameScene");
    this.scene.stop("PauseScene");
  }

  update() {
    this.cursor.setPosition(
      this.input.activePointer.x,
      this.input.activePointer.y,
    );
  }
}
