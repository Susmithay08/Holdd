export const config = {
  canvasWidth: 375,
  canvasHeight: 375,
  platformHeight: 100,
  heroDistanceFromEdge: 10,
  paddingX: 100,
  perfectAreaSize: 10,
  backgroundSpeedMultiplier: 0.2,

  hill1BaseHeight: 100,
  hill1Amplitude: 10,
  hill1Stretch: 1,
  hill2BaseHeight: 70,
  hill2Amplitude: 20,
  hill2Stretch: 0.5,

  stretchingSpeed: 4,
  turningSpeed: 4,
  walkingSpeed: 4,
  transitioningSpeed: 2,
  fallingSpeed: 2,

  heroWidth: 17,
  heroHeight: 30,

  platform: {
    minimumGap: 40,
    maximumGap: 200,
    minimumWidth: 20,
    maximumWidth: 100,
  },

  tree: {
    minimumGap: 30,
    maximumGap: 150,
    colors: ["#6D8821", "#8FAC34", "#98B333"],
  },
};
