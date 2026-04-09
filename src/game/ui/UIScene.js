export class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: "UIScene" });
  }

  create() {
    this.playerHp = 5;
    this.playerMaxHp = 5;
    this.bossHp = 20;
    this.bossMaxHp = 20;

    const w = this.scale.width;
    const h = this.scale.height;

    // Barra del player — esquina inferior izquierda
    this.playerBg = this.add
      .rectangle(20, h - 30, 124, 16, 0x000000, 0.7)
      .setOrigin(0, 0.5);
    this.playerTrack = this.add
      .rectangle(22, h - 30, 120, 12, 0x333333)
      .setOrigin(0, 0.5);
    this.playerBar = this.add
      .rectangle(22, h - 30, 120, 12, 0x00ff88)
      .setOrigin(0, 0.5);
    this.playerLabel = this.add.text(20, h - 48, "HP", {
      fontSize: "11px",
      fill: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
    });

    // Barra del boss — parte inferior central estilo Elden Ring
    const bw = 300;
    const bx = w / 2 - bw / 2;
    this.bossBg = this.add
      .rectangle(bx, h - 30, bw + 4, 16, 0x000000, 0.7)
      .setOrigin(0, 0.5);
    this.bossTrack = this.add
      .rectangle(bx + 2, h - 30, bw, 12, 0x333333)
      .setOrigin(0, 0.5);
    this.bossBar = this.add
      .rectangle(bx + 2, h - 30, bw, 12, 0xff4444)
      .setOrigin(0, 0.5);
    this.bossLabel = this.add
      .text(w / 2, h - 50, "✦ SLIME PRIMORDIAL ✦", {
        fontSize: "11px",
        fill: "#cc88ff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Esconder barra del boss hasta que aparezca
    this.setBossVisible(false);
  }

  setBossVisible(visible) {
    this.bossBg.setVisible(visible);
    this.bossTrack.setVisible(visible);
    this.bossBar.setVisible(visible);
    this.bossLabel.setVisible(visible);
  }

  updatePlayerHp(hp, maxHp) {
    const pct = Phaser.Math.Clamp(hp / maxHp, 0, 1);
    this.playerBar.width = 120 * pct;
    if (pct > 0.5) this.playerBar.setFillStyle(0x00ff88);
    else if (pct > 0.25) this.playerBar.setFillStyle(0xffaa00);
    else this.playerBar.setFillStyle(0xff3300);
  }

  updateBossHp(hp, maxHp) {
    const pct = Phaser.Math.Clamp(hp / maxHp, 0, 1);
    this.bossBar.width = 300 * pct;
  }
}
