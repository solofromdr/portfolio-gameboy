export const GAME_CONFIG = {
  width: 960,
  height: 540,
  backgroundColor: "#1a0a2e",
  zoom: 1.5,
};

export const PLAYER_CONFIG = {
  startX: 270,
  startY: 175,
  scale: 1.5,
  speed: 200,
};

export const NPC_CONFIG = {
  x: 135,
  y: 125,
  scale: 1.5,
  detectionRange: 60,
};

export const PROJECTILE_CONFIG = {
  speed: 400,
  scale: 0.75,
  lifetime: 1000,
};

export const GAME_STATE = {
  hasWeapon: false,
  boss2Defeated: false,
  boss3Defeated: false,
  boss4Defeated: false,
  inventory: [],
};

export const GATES = {
  bioma2: { x: 311, y: 120, width: 20, height: 60 },
  bioma3: { x: 153, y: 238, width: 60, height: 20 },
  bioma4south: { x: 383, y: 408, width: 20, height: 80 },
  bioma4north: { x: 418, y: 287, width: 80, height: 20 },
};
