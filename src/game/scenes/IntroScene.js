export class IntroScene extends Phaser.Scene {
  constructor() {
    super({ key: "IntroScene" });
  }

  preload() {
    this.load.image("intro", "/assets/cutscenes/1ra.png");
    this.load.audio("music-intro", "/audio/music/intro.ogg");
  }

  create() {
    const w = this.scale.width;
    const h = this.scale.height;

    const img = this.add.image(w / 2, h / 2, "intro");
    img.setDisplaySize(w, h);

    // Ken Burns
    this.tweens.add({
      targets: img,
      scaleX: img.scaleX * 1.15,
      scaleY: img.scaleY * 1.15,
      duration: 6000,
      ease: "Linear",
    });

    // Texto narrativo
    const narrative = this.add
      .text(w / 2, h * 0.82, "", {
        fontSize: "16px",
        fill: "#ffffff",
        align: "center",
        wordWrap: { width: w - 100 },
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(10);

    // Texto SPACE oculto al inicio
    const pressSpace = this.add
      .text(w / 2, h * 0.92, "[ SPACE para continuar ]", {
        fontSize: "13px",
        fill: "#aaaaaa",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(10)
      .setVisible(false);

    this.tweens.add({
      targets: pressSpace,
      alpha: 0,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    const fullText =
      "Un mundo olvidado aguarda...\nSus secretos solo se revelan a quienes se atrevan a explorar.";
    let index = 0;
    let textComplete = false;

    this.time.addEvent({
      delay: 50,
      repeat: fullText.length - 1,
      callback: () => {
        narrative.setText(narrative.text + fullText[index]);
        index++;
        if (index === fullText.length) {
          textComplete = true;
          pressSpace.setVisible(true);
        }
      },
    });

    // SPACE solo funciona cuando el texto terminó
    this.input.keyboard.on("keydown-SPACE", () => {
      if (textComplete) this.goToGame();
    });

    this.music = this.sound.add("music-intro", { loop: true, volume: 0.5 });
    this.music.play();
  }

  goToGame() {
    this.cameras.main.fade(600, 0, 0, 0);
    this.time.delayedCall(600, () => {
      this.music.stop();
      this.scene.start("GameScene");
    });
  }
}
