const HIGH_SCORE_KEY = "stickHero_highScore";

export function getHighScore() {
  return parseInt(localStorage.getItem(HIGH_SCORE_KEY) || "0", 10);
}

export function saveHighScore(score) {
  const current = getHighScore();
  if (score > current) {
    localStorage.setItem(HIGH_SCORE_KEY, score.toString());
    return true; // new high score!
  }
  return false;
}
