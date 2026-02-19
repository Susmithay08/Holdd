import { config } from "./config.js";
import { state } from "./state.js";
import { draw } from "./draw.js";
import { getHighScore, saveHighScore } from "./storage.js";

let canvas, ctx;
let introductionElement, perfectElement, restartButton, scoreElement, highScoreElement;

export function initGame(canvasEl, elements) {
  canvas = canvasEl;
  ctx = canvas.getContext("2d");

  introductionElement = elements.introduction;
  perfectElement = elements.perfect;
  restartButton = elements.restart;
  scoreElement = elements.score;
  highScoreElement = elements.highScore;

  updateHighScoreDisplay();
  resetGame();
  setupEvents();
}

function updateHighScoreDisplay() {
  if (highScoreElement) highScoreElement.textContent = getHighScore();
}

export function resetGame() {
  state.phase = "waiting";
  state.lastTimestamp = undefined;
  state.sceneOffset = 0;
  state.score = 0;
  state.heroY = 0;

  introductionElement.style.opacity = 1;
  perfectElement.style.opacity = 0;
  restartButton.style.display = "none";
  scoreElement.innerText = state.score;

  state.platforms = [{ x: 50, w: 50 }];
  generatePlatform();
  generatePlatform();
  generatePlatform();
  generatePlatform();

  state.sticks = [{ x: state.platforms[0].x + state.platforms[0].w, length: 0, rotation: 0 }];

  state.trees = [];
  for (let i = 0; i < 10; i++) generateTree();

  state.heroX = state.platforms[0].x + state.platforms[0].w - config.heroDistanceFromEdge;

  draw(canvas, ctx);
}

function generateTree() {
  const { minimumGap, maximumGap, colors } = config.tree;
  const lastTree = state.trees.at(-1);
  const furthestX = lastTree ? lastTree.x : 0;
  const x = furthestX + minimumGap + Math.floor(Math.random() * (maximumGap - minimumGap));
  const color = colors[Math.floor(Math.random() * colors.length)];
  state.trees.push({ x, color });
}

function generatePlatform() {
  const { minimumGap, maximumGap, minimumWidth, maximumWidth } = config.platform;
  const lastPlatform = state.platforms.at(-1);
  const furthestX = lastPlatform.x + lastPlatform.w;
  const x = furthestX + minimumGap + Math.floor(Math.random() * (maximumGap - minimumGap));
  const w = minimumWidth + Math.floor(Math.random() * (maximumWidth - minimumWidth));
  state.platforms.push({ x, w });
}

function thePlatformTheStickHits() {
  if (state.sticks.at(-1).rotation !== 90)
    throw Error(`Stick is ${state.sticks.at(-1).rotation}°`);

  const stickFarX = state.sticks.at(-1).x + state.sticks.at(-1).length;
  const platformTheStickHits = state.platforms.find(
    (p) => p.x < stickFarX && stickFarX < p.x + p.w
  );

  if (
    platformTheStickHits &&
    platformTheStickHits.x + platformTheStickHits.w / 2 - config.perfectAreaSize / 2 < stickFarX &&
    stickFarX < platformTheStickHits.x + platformTheStickHits.w / 2 + config.perfectAreaSize / 2
  ) {
    return [platformTheStickHits, true];
  }

  return [platformTheStickHits, false];
}

export function animate(timestamp) {
  if (!state.lastTimestamp) {
    state.lastTimestamp = timestamp;
    window.requestAnimationFrame(animate);
    return;
  }

  switch (state.phase) {
    case "waiting":
      return;

    case "stretching": {
      state.sticks.at(-1).length += (timestamp - state.lastTimestamp) / config.stretchingSpeed;
      break;
    }

    case "turning": {
      state.sticks.at(-1).rotation += (timestamp - state.lastTimestamp) / config.turningSpeed;

      if (state.sticks.at(-1).rotation > 90) {
        state.sticks.at(-1).rotation = 90;

        const [nextPlatform, perfectHit] = thePlatformTheStickHits();
        if (nextPlatform) {
          state.score += perfectHit ? 2 : 1;
          scoreElement.innerText = state.score;

          if (perfectHit) {
            perfectElement.style.opacity = 1;
            setTimeout(() => (perfectElement.style.opacity = 0), 1000);
          }

          generatePlatform();
          generateTree();
          generateTree();
        }

        state.phase = "walking";
      }
      break;
    }

    case "walking": {
      state.heroX += (timestamp - state.lastTimestamp) / config.walkingSpeed;

      const [nextPlatform] = thePlatformTheStickHits();
      if (nextPlatform) {
        const maxHeroX = nextPlatform.x + nextPlatform.w - config.heroDistanceFromEdge;
        if (state.heroX > maxHeroX) {
          state.heroX = maxHeroX;
          state.phase = "transitioning";
        }
      } else {
        const maxHeroX = state.sticks.at(-1).x + state.sticks.at(-1).length + config.heroWidth;
        if (state.heroX > maxHeroX) {
          state.heroX = maxHeroX;
          state.phase = "falling";
        }
      }
      break;
    }

    case "transitioning": {
      state.sceneOffset += (timestamp - state.lastTimestamp) / config.transitioningSpeed;

      const [nextPlatform] = thePlatformTheStickHits();
      if (state.sceneOffset > nextPlatform.x + nextPlatform.w - config.paddingX) {
        state.sticks.push({
          x: nextPlatform.x + nextPlatform.w,
          length: 0,
          rotation: 0,
        });
        state.phase = "waiting";
      }
      break;
    }

    case "falling": {
      if (state.sticks.at(-1).rotation < 180) {
        state.sticks.at(-1).rotation += (timestamp - state.lastTimestamp) / config.turningSpeed;
      }

      state.heroY += (timestamp - state.lastTimestamp) / config.fallingSpeed;
      const maxHeroY =
        config.platformHeight + 100 + (window.innerHeight - config.canvasHeight) / 2;

      if (state.heroY > maxHeroY) {
        // Game over
        const isNewHighScore = saveHighScore(state.score);
        updateHighScoreDisplay();

        if (isNewHighScore && state.score > 0) {
          restartButton.dataset.newHighScore = "true";
        } else {
          delete restartButton.dataset.newHighScore;
        }

        restartButton.style.display = "block";
        return;
      }
      break;
    }

    default:
      throw Error("Wrong phase: " + state.phase);
  }

  draw(canvas, ctx);
  window.requestAnimationFrame(animate);
  state.lastTimestamp = timestamp;
}

function startStretching() {
  if (state.phase === "waiting") {
    state.lastTimestamp = undefined;
    introductionElement.style.opacity = 0;
    state.phase = "stretching";
    window.requestAnimationFrame(animate);
  }
}

function stopStretching() {
  if (state.phase === "stretching") {
    state.phase = "turning";
  }
}

function setupEvents() {
  // Mouse
  window.addEventListener("mousedown", startStretching);
  window.addEventListener("mouseup", stopStretching);

  // Touch support
  window.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startStretching();
  }, { passive: false });

  window.addEventListener("touchend", (e) => {
    e.preventDefault();
    stopStretching();
  }, { passive: false });

  // Keyboard: space to restart
  window.addEventListener("keydown", (event) => {
    if (event.key === " ") {
      event.preventDefault();
      resetGame();
    }
  });

  // Resize
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw(canvas, ctx);
  });

  // Restart button
  restartButton.addEventListener("click", (e) => {
    e.preventDefault();
    resetGame();
  });
}
