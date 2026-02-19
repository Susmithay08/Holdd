export const state = {
  phase: "waiting", // waiting | stretching | turning | walking | transitioning | falling
  lastTimestamp: undefined,
  heroX: 0,
  heroY: 0,
  sceneOffset: 0,
  platforms: [],
  sticks: [],
  trees: [],
  score: 0,
};
