import { config } from "./config.js";
import { state } from "./state.js";

Math.sinus = function (degree) {
  return Math.sin((degree / 180) * Math.PI);
};

export function draw(canvas, ctx) {
  ctx.save();
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  drawBackground(ctx);

  ctx.translate(
    (window.innerWidth - config.canvasWidth) / 2 - state.sceneOffset,
    (window.innerHeight - config.canvasHeight) / 2
  );

  drawPlatforms(ctx);
  drawHero(ctx);
  drawSticks(ctx);

  ctx.restore();
}

function drawBackground(ctx) {
  const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
  gradient.addColorStop(0, "#BBD691");
  gradient.addColorStop(1, "#FEF1E1");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

  drawHill(ctx, config.hill1BaseHeight, config.hill1Amplitude, config.hill1Stretch, "#95C629");
  drawHill(ctx, config.hill2BaseHeight, config.hill2Amplitude, config.hill2Stretch, "#659F1C");

  state.trees.forEach((tree) => drawTree(ctx, tree.x, tree.color));
}

function drawHill(ctx, baseHeight, amplitude, stretch, color) {
  ctx.beginPath();
  ctx.moveTo(0, window.innerHeight);
  ctx.lineTo(0, getHillY(0, baseHeight, amplitude, stretch));
  for (let i = 0; i < window.innerWidth; i++) {
    ctx.lineTo(i, getHillY(i, baseHeight, amplitude, stretch));
  }
  ctx.lineTo(window.innerWidth, window.innerHeight);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawTree(ctx, x, color) {
  ctx.save();
  ctx.translate(
    (-state.sceneOffset * config.backgroundSpeedMultiplier + x) * config.hill1Stretch,
    getTreeY(x, config.hill1BaseHeight, config.hill1Amplitude)
  );

  const treeTrunkHeight = 5;
  const treeTrunkWidth = 2;
  const treeCrownHeight = 25;
  const treeCrownWidth = 10;

  ctx.fillStyle = "#7D833C";
  ctx.fillRect(-treeTrunkWidth / 2, -treeTrunkHeight, treeTrunkWidth, treeTrunkHeight);

  ctx.beginPath();
  ctx.moveTo(-treeCrownWidth / 2, -treeTrunkHeight);
  ctx.lineTo(0, -(treeTrunkHeight + treeCrownHeight));
  ctx.lineTo(treeCrownWidth / 2, -treeTrunkHeight);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}

function drawPlatforms(ctx) {
  state.platforms.forEach(({ x, w }) => {
    ctx.fillStyle = "black";
    ctx.fillRect(
      x,
      config.canvasHeight - config.platformHeight,
      w,
      config.platformHeight + (window.innerHeight - config.canvasHeight) / 2
    );

    if (state.sticks.at(-1).x < x) {
      ctx.fillStyle = "red";
      ctx.fillRect(
        x + w / 2 - config.perfectAreaSize / 2,
        config.canvasHeight - config.platformHeight,
        config.perfectAreaSize,
        config.perfectAreaSize
      );
    }
  });
}

function drawHero(ctx) {
  ctx.save();
  ctx.fillStyle = "black";
  ctx.translate(
    state.heroX - config.heroWidth / 2,
    state.heroY + config.canvasHeight - config.platformHeight - config.heroHeight / 2
  );

  drawRoundedRect(ctx, -config.heroWidth / 2, -config.heroHeight / 2, config.heroWidth, config.heroHeight - 4, 5);

  const legDistance = 5;
  ctx.beginPath();
  ctx.arc(legDistance, 11.5, 3, 0, Math.PI * 2, false);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(-legDistance, 11.5, 3, 0, Math.PI * 2, false);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = "white";
  ctx.arc(5, -7, 3, 0, Math.PI * 2, false);
  ctx.fill();

  ctx.fillStyle = "red";
  ctx.fillRect(-config.heroWidth / 2 - 1, -12, config.heroWidth + 2, 4.5);
  ctx.beginPath();
  ctx.moveTo(-9, -14.5);
  ctx.lineTo(-17, -18.5);
  ctx.lineTo(-14, -8.5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-10, -10.5);
  ctx.lineTo(-15, -3.5);
  ctx.lineTo(-5, -7);
  ctx.fill();

  ctx.restore();
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x, y + radius);
  ctx.lineTo(x, y + height - radius);
  ctx.arcTo(x, y + height, x + radius, y + height, radius);
  ctx.lineTo(x + width - radius, y + height);
  ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
  ctx.lineTo(x + width, y + radius);
  ctx.arcTo(x + width, y, x + width - radius, y, radius);
  ctx.lineTo(x + radius, y);
  ctx.arcTo(x, y, x, y + radius, radius);
  ctx.fill();
}

function drawSticks(ctx) {
  state.sticks.forEach((stick) => {
    ctx.save();
    ctx.translate(stick.x, config.canvasHeight - config.platformHeight);
    ctx.rotate((Math.PI / 180) * stick.rotation);

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -stick.length);
    ctx.stroke();

    ctx.restore();
  });
}

function getHillY(windowX, baseHeight, amplitude, stretch) {
  const sineBaseY = window.innerHeight - baseHeight;
  return (
    Math.sinus((state.sceneOffset * config.backgroundSpeedMultiplier + windowX) * stretch) *
      amplitude +
    sineBaseY
  );
}

function getTreeY(x, baseHeight, amplitude) {
  const sineBaseY = window.innerHeight - baseHeight;
  return Math.sinus(x) * amplitude + sineBaseY;
}
