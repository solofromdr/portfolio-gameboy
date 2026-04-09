export class DialogBox {
  constructor(scene, faceset = null) {
    this.scene = scene;
    this.visible = false;

    const w = scene.scale.width;
    const h = scene.scale.height;

    // Dialog box PNG en vez de rectángulo
    this.box = scene.add.image(w / 2, h - 60, "dialogbox");
    this.box.setScrollFactor(0);
    this.box.setVisible(false);
    this.box.setDisplaySize(w - 20, 110);

    // Faceset (opcional)
    this.faceImage = null;
    if (faceset) {
      this.faceImage = scene.add.image(90, h - 52, faceset);
      this.faceImage.setScrollFactor(0);
      this.faceImage.setVisible(false);
      this.faceImage.setDisplaySize(72, 72);
      this.faceImage.setDepth(101);
    }

    // Texto
    this.text = scene.add.text(faceset ? 170 : w / 2, h - 85, "", {
      fontSize: "12px",
      fill: "#1a1a1a",
      wordWrap: { width: faceset ? w - 140 : w - 40 },
      align: faceset ? "left" : "center",
    });
    this.text.setOrigin(faceset ? 0 : 0.5, 0);
    this.text.setScrollFactor(0);
    this.text.setVisible(false);
    this.text.setDepth(102);
  }

  show(message) {
    this.box.setVisible(true);
    this.text.setVisible(true);
    if (this.faceImage) this.faceImage.setVisible(true);
    this.text.setText(message);
    this.visible = true;
  }

  hide() {
    this.box.setVisible(false);
    this.text.setVisible(false);
    if (this.faceImage) this.faceImage.setVisible(false);
    this.visible = false;
  }

  typewrite(fullText, onComplete) {
    this.show("...");
    this.scene.time.delayedCall(1000, () => {
      let index = 0;
      this.text.setText("");
      this.scene.time.addEvent({
        delay: 40,
        repeat: fullText.length - 1,
        callback: () => {
          this.text.setText(this.text.text + fullText[index]);
          if (fullText[index] !== " " && fullText[index] !== "\n") {
            this.scene.sound.play("sfx-dialog", { volume: 0.4 });
          }
          index++;
          if (index === fullText.length && onComplete) {
            onComplete();
          }
        },
      });
    });
  }

  getObjects() {
    const objs = [this.box, this.text];
    if (this.faceImage) objs.push(this.faceImage);
    return objs;
  }

  setDepth(depth) {
    this.box.setDepth(depth);
    this.text.setDepth(depth + 1);
    if (this.faceImage) this.faceImage.setDepth(depth + 2);
  }
}
