const scoreEl = document.getElementById('score');
const leaderboardEl = document.getElementById('leaderboard');
const resetLeaderboardBtn = document.getElementById('resetLeaderboardBtn');
const leaderboardKey = 'snakeLeaderboard';

let currentScore = 0;

function updateScoreDisplay() {
  scoreEl.textContent = currentScore;
}

function setScore(value) {
  currentScore = value;
  updateScoreDisplay();
}

function addScore(value) {
  currentScore += value;
  updateScoreDisplay();
  return currentScore;
}

function getScore() {
  return currentScore;
}

function getLeaderboardEntries() {
  const stored = localStorage.getItem(leaderboardKey);
  return stored ? JSON.parse(stored) : [];
}

function saveLeaderboard(entries) {
  localStorage.setItem(leaderboardKey, JSON.stringify(entries));
}

function renderLeaderboard() {
  const entries = getLeaderboardEntries();
  leaderboardEl.innerHTML = entries.length
    ? entries.map((entry, index) =>
        `<li><span>${index + 1}. Score</span><span>${entry.score}</span></li>`
      ).join('')
    : '<li class="empty">No scores yet. Start playing!</li>';
}

function resetLeaderboard() {
  localStorage.removeItem(leaderboardKey);
  renderLeaderboard();
}

function updateLeaderboard(newScore) {
  const entries = getLeaderboardEntries();
  entries.push({ score: newScore, date: new Date().toLocaleDateString() });
  entries.sort((a, b) => b.score - a.score);
  saveLeaderboard(entries.slice(0, 5));
  renderLeaderboard();
}

function initLeaderboard() {
  renderLeaderboard();
  resetLeaderboardBtn.addEventListener('click', resetLeaderboard);
}

window.ScoreBoard = {
  setScore,
  addScore,
  getScore,
  updateLeaderboard,
  initLeaderboard,
};
