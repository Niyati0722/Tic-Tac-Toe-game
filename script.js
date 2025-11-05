// Tic Tac Toe - Vanilla JS
// - 3x3 grid with X/O turns
// - Detect wins across rows, columns, diagonals
// - Show end message and disable board
// - Restart button
// - Optional: Turn indicator + score tracking via localStorage

(function () {
  /** @type {HTMLDivElement} */
  const boardEl = document.getElementById('board');
  /** @type {HTMLDivElement} */
  const statusEl = document.getElementById('status');
  /** @type {HTMLDivElement} */
  const turnEl = document.getElementById('turn');
  /** @type {HTMLButtonElement} */
  const restartBtn = document.getElementById('restart');
  /** @type {HTMLButtonElement} */
  const resetScoresBtn = document.getElementById('resetScores');
  /** @type {NodeListOf<HTMLButtonElement>} */
  const cells = boardEl.querySelectorAll('.cell');

  /**
   * Internal state
   */
  let board = Array(9).fill('');
  let currentPlayer = 'X';
  let isGameActive = true;
  let movesCount = 0;

  /**
   * Score handling via localStorage
   */
  const SCORE_KEY = 't3_scores';
  const scoreXEl = document.getElementById('scoreX');
  const scoreOEl = document.getElementById('scoreO');

  function loadScores() {
    try {
      const saved = localStorage.getItem(SCORE_KEY);
      if (!saved) return { X: 0, O: 0 };
      const parsed = JSON.parse(saved);
      return { X: Number(parsed.X) || 0, O: Number(parsed.O) || 0 };
    } catch (_) {
      return { X: 0, O: 0 };
    }
  }

  function saveScores(scores) {
    try {
      localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
    } catch (_) {
      // ignore storage errors
    }
  }

  let scores = loadScores();
  updateScoreUI();

  /**
   * All winning combinations (indices on the 3x3 board)
   */
  const WIN_LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  /**
   * Initialize event listeners and UI
   */
  function init() {
    cells.forEach((cell) => {
      cell.addEventListener('click', onCellClick, { once: true });
    });
    restartBtn.addEventListener('click', onRestart);
    resetScoresBtn.addEventListener('click', onResetScores);
    setTurnText();
  }

  /**
   * Handle a cell click
   */
  function onCellClick(e) {
    if (!isGameActive) return;
    const cell = e.currentTarget;
    const index = Number(cell.getAttribute('data-index'));
    if (board[index]) return;

    board[index] = currentPlayer;
    movesCount += 1;
    renderCell(cell, currentPlayer);

    const result = getGameResult();
    if (result.winner) {
      finishGame(`${result.winner} Wins!`, result.line);
      incrementScore(result.winner);
      return;
    }
    if (result.draw) {
      finishGame("It's a Draw!");
      return;
    }

    togglePlayer();
  }

  /**
   * Compute game result: winner or draw
   */
  function getGameResult() {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line };
      }
    }
    if (movesCount === 9) return { draw: true };
    return {};
  }

  /**
   * End the game, show message, disable board
   */
  function finishGame(message, winLine) {
    isGameActive = false;
    boardEl.classList.add('disabled');
    statusEl.textContent = message;
    if (winLine) {
      winLine.forEach((i) => cells[i].classList.add('win'));
    }
  }

  /**
   * Toggle current player and update UI
   */
  function togglePlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    setTurnText();
  }

  function setTurnText() {
    turnEl.textContent = `Player ${currentPlayer}'s Turn`;
  }

  /**
   * Render a move into a cell with styling
   */
  function renderCell(cell, player) {
    cell.textContent = player;
    cell.classList.add(player.toLowerCase());
    // light pop animation
    cell.style.transform = 'scale(0.95)';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        cell.style.transition = 'transform 160ms ease';
        cell.style.transform = 'scale(1)';
      });
    });
    cell.disabled = true;
  }

  /**
   * Restart: clear board but keep scores
   */
  function onRestart() {
    board = Array(9).fill('');
    currentPlayer = 'X';
    isGameActive = true;
    movesCount = 0;
    statusEl.textContent = '';
    boardEl.classList.remove('disabled');
    cells.forEach((cell) => {
      cell.textContent = '';
      cell.disabled = false;
      cell.classList.remove('x', 'o', 'win');
      // rebind to allow single click again
      cell.replaceWith(cell.cloneNode(true));
    });
    // After replaceWith, reselect cells and wire listeners
    rebindCellListeners();
    setTurnText();
  }

  function rebindCellListeners() {
    const freshCells = boardEl.querySelectorAll('.cell');
    freshCells.forEach((cell) => {
      cell.addEventListener('click', onCellClick, { once: true });
    });
  }

  /**
   * Score helpers
   */
  function incrementScore(winner) {
    if (winner !== 'X' && winner !== 'O') return;
    scores[winner] = (scores[winner] || 0) + 1;
    updateScoreUI();
    saveScores(scores);
  }

  function updateScoreUI() {
    scoreXEl.textContent = String(scores.X || 0);
    scoreOEl.textContent = String(scores.O || 0);
  }

  /**
   * Reset scores to zero and clear localStorage
   */
  function onResetScores() {
    scores = { X: 0, O: 0 };
    updateScoreUI();
    saveScores(scores);
  }

  // Kickoff
  init();
})();


