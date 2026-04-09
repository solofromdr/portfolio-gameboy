export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MenuScene" });
  }

  preload() {
    this.load.image("cursor-interact", "/assets/ui/Interact.png");
    this.load.image("cursor-hit", "/assets/ui/Hit.png");
    this.load.image("guardian", "/assets/cutscenes/guardian.png");

    this.load.audio("music-menu", "/audio/music/menu.ogg");

    this.load.audio("sfx-ui-click", "/audio/sounds/ui-click.wav");
    this.load.audio("sfx-ui-confirm", "/audio/sounds/ui-confirm.wav");
    this.load.audio("sfx-ui-back", "/audio/sounds/ui-back.wav");
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    // Ocultar cursor nativo
    this.input.setDefaultCursor("none");

    // Cursor personalizado
    this.cursor = this.add
      .image(0, 0, "cursor-interact")
      .setDepth(999)
      .setScrollFactor(0)
      .setScale(1);

    // Cursor hit al hacer click
    this.input.on("pointerdown", () => {
      this.cursor.setTexture("cursor-hit");
    });
    this.input.on("pointerup", () => {
      this.cursor.setTexture("cursor-interact");
    });

    // Estrellas
    this.stars = [];
    for (let i = 0; i < 200; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, w),
        Phaser.Math.Between(0, h),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.3, 1),
      );
      const speed = Phaser.Math.FloatBetween(2, 8);
      this.stars.push({ star, speed });
    }

    // Título principal
    this.add
      .text(w / 2, h * 0.35, "✦ REALM OF ORLANDO ✦", {
        fontSize: "32px",
        fill: "#ffffff",
        fontStyle: "bold",
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    // Subtítulo
    this.add
      .text(w / 2, h * 0.35 + 50, "PORTFOLIO_v1.0", {
        fontSize: "14px",
        fill: "#8888ff",
        letterSpacing: 8,
      })
      .setOrigin(0.5);

      // more info

    this.add
      .text(
        w / 2,
        h * 0.5,
        "Este no es solo un juego… es mi portafolio.\nDescubre mis habilidades explorando.",
        {
          fontSize: "11px",
          fill: "#aaaaaa",
          align: "center",
          letterSpacing: 1,
        },
      )
      .setOrigin(0.5);

    this.add
      .text(
        w / 2,
        h * 0.5 + 35,
        "This is not just a game… it's my portfolio.\nDiscover my skills by exploring.",
        {
          fontSize: "11px",
          fill: "#555555",
          align: "center",
          letterSpacing: 1,
        },
      )
      .setOrigin(0.5);

    // Botón comenzar con parpadeo
    const startBtn = this.add
      .text(w / 2, h * 0.65, "[ COMENZAR AVENTURA ]", {
        fontSize: "18px",
        fill: "#ffffff",
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setInteractive();

    // Parpadeo del botón
    this.tweens.add({
      targets: startBtn,
      alpha: 0,
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Hover del botón
    startBtn.on("pointerover", () => {
      startBtn.setStyle({ fill: "#ffff00" });
      this.sound.play("sfx-ui-click");
    });
    startBtn.on("pointerout", () => {
      startBtn.setStyle({ fill: "#ffffff" });
    });

    // Click para iniciar
    startBtn.on("pointerdown", () => {
      this.sound.play("sfx-ui-confirm");
      this.cameras.main.fade(500, 0, 0, 0);
      this.time.delayedCall(500, () => {
        this.music.stop();
        this.scene.start("IntroScene");
      });
    });

    // Texto ESC
    this.add
      .text(w / 2, h * 0.75, "ESC — Ajustes de volumen", {
        fontSize: "12px",
        fill: "#555555",
        letterSpacing: 2,
      })
      .setOrigin(0.5);

    // Tecla ESC
    this.input.keyboard.on("keydown-ESC", () => {
      this.toggleVolume();
    });

    // Panel de volumen oculto
    this.volumePanel = this.add.container(w / 2, h * 0.5);
    this.volumePanel.setVisible(false);

    const panelBg = this.add.rectangle(0, 0, 300, 120, 0x111111, 0.95);
    const panelTitle = this.add
      .text(0, -40, "VOLUMEN", {
        fontSize: "14px",
        fill: "#ffffff",
        letterSpacing: 4,
      })
      .setOrigin(0.5);

    const volDown = this.add
      .text(-60, 10, "[ - ]", {
        fontSize: "18px",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive();

    this.volText = this.add
      .text(0, 10, "100%", {
        fontSize: "16px",
        fill: "#8888ff",
      })
      .setOrigin(0.5);

    const volUp = this.add
      .text(60, 10, "[ + ]", {
        fontSize: "18px",
        fill: "#ffffff",
      })
      .setOrigin(0.5)
      .setInteractive();

    const closePanel = this.add
      .text(0, 45, "[ CERRAR ]", {
        fontSize: "12px",
        fill: "#555555",
      })
      .setOrigin(0.5)
      .setInteractive();

    this.volumePanel.add([
      panelBg,
      panelTitle,
      volDown,
      this.volText,
      volUp,
      closePanel,
    ]);

    this.volume = 100;
    volDown.on("pointerdown", () => {
      this.sound.play("sfx-ui-click"); // click
      this.changeVolume(-10);
    });
    volUp.on("pointerdown", () => {
      this.sound.play("sfx-ui-click"); // click
      this.changeVolume(10);
    });
    closePanel.on("pointerdown", () => {
      this.sound.play("sfx-ui-back"); // atras
      this.volumePanel.setVisible(false);
    });

    this.music = this.sound.add("music-menu", {
      loop: true,
      volume: 0.5,
    });

    this.music.play();
  }

  toggleVolume() {
    this.volumePanel.setVisible(!this.volumePanel.visible);
  }

  changeVolume(amount) {
    this.volume = Phaser.Math.Clamp(this.volume + amount, 0, 100);
    this.volText.setText(this.volume + "%");
    if (this.sound.context) {
      this.sound.volume = this.volume / 100;
    }
  }

  update() {
    // Cursor sigue al mouse
    this.cursor.setPosition(
      this.input.activePointer.x,
      this.input.activePointer.y,
    );

    // Estrellas
    this.stars.forEach(({ star, speed }) => {
      star.x += speed * 0.5;
      star.y += speed * 0.3;
      if (star.x > this.scale.width) star.x = 0;
      if (star.y > this.scale.height) star.y = 0;
    });
  }
}
