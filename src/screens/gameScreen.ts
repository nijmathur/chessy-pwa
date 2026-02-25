import { Chess } from 'chess.js';
import { navigate } from '../main';
import { ChessBoard, type BoardState } from '../board/ChessBoard';
import { explainBetterMoveText } from '../engine/explain';
import type { Difficulty } from '../engine/ai';

export interface GameParams {
  playerColor: 'w' | 'b';
  difficulty: Difficulty;
}

const PIECE_NAMES: Record<string, string> = {
  p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔',
};

export function gameScreen(root: HTMLElement, params: GameParams): () => void {
  const { playerColor, difficulty } = params;
  const aiColor: 'w' | 'b' = playerColor === 'w' ? 'b' : 'w';

  root.innerHTML = `
    <div class="game-layout">
      <div class="board-area">
        <canvas id="board-canvas"></canvas>
      </div>
      <aside class="side-panel">
        <div class="status-lbl" id="status-lbl">Your turn</div>
        <div class="ai-lbl" id="ai-lbl"></div>
        <hr class="sep">

        <!-- Move feedback panel (hidden initially) -->
        <div class="feedback-panel" id="feedback-panel" style="display:none">
          <div class="feedback-header">Rate your move:</div>
          <div class="rate-btns">
            <button class="rate-btn good"   data-key="good">Good</button>
            <button class="rate-btn ok"     data-key="ok">OK</button>
            <button class="rate-btn better" data-key="better">Better?</button>
          </div>
          <button class="show-better-btn" id="show-better-btn" style="display:none">
            Show Better Move
          </button>
          <div class="better-txt" id="better-txt" style="display:none"></div>
        </div>
        <hr class="sep">

        <div class="captured-lbl">Captured by White:</div>
        <div class="captured-pieces" id="cap-white"></div>
        <div class="captured-lbl">Captured by Black:</div>
        <div class="captured-pieces" id="cap-black"></div>
        <hr class="sep">

        <div class="captured-lbl">Moves:</div>
        <div class="move-history scroll-y" id="move-history"></div>

        <div class="panel-btns">
          <button class="btn-secondary" id="new-game-btn">New Game</button>
          <button class="btn-secondary" id="menu-btn">Main Menu</button>
        </div>
      </aside>
    </div>

    <!-- Promotion dialog -->
    <dialog class="promo-dialog" id="promo-dialog">
      <h3>Promote pawn to:</h3>
      <div class="promo-options">
        <button data-piece="q">♕ Queen</button>
        <button data-piece="r">♖ Rook</button>
        <button data-piece="b">♗ Bishop</button>
        <button data-piece="n">♘ Knight</button>
      </div>
    </dialog>
  `;

  const canvas = root.querySelector('#board-canvas') as HTMLCanvasElement;
  const board = new ChessBoard(canvas);

  // Game state
  let chess = new Chess();
  let selected: string | null = null;
  let targets = new Set<string>();
  let lastMoveFrom: string | null = null;
  let lastMoveTo: string | null = null;
  let suggestedFrom: string | null = null;
  let suggestedTo: string | null = null;
  let cachedBetterMove: string | null = null;
  let preMoveSnapshot: string | null = null;
  let playerLastUci: string | null = null;
  let thinking = false;
  let over = false;
  let moveHistory: string[] = [];
  let annotations: Record<number, string> = {};

  const statusLbl   = root.querySelector('#status-lbl')!;
  const aiLbl       = root.querySelector('#ai-lbl')!;
  const feedbackPanel = root.querySelector('#feedback-panel') as HTMLElement;
  const showBetterBtn = root.querySelector('#show-better-btn') as HTMLElement;
  const betterTxt     = root.querySelector('#better-txt') as HTMLElement;
  const moveHistoryEl = root.querySelector('#move-history')!;

  // Workers
  const aiWorker   = new Worker(new URL('../workers/ai.worker.ts', import.meta.url), { type: 'module' });
  let evalWorker: Worker | null = null;

  function getBoardState(): BoardState {
    return {
      fen: chess.fen(),
      playerColor,
      selectedSquare: selected,
      targetSquares: targets,
      lastMoveFrom,
      lastMoveTo,
      suggestedFrom,
      suggestedTo,
    };
  }

  function render() {
    board.render(getBoardState());
  }

  function updateStatus() {
    if (over) {
      if (chess.isCheckmate()) {
        const winner = chess.turn() === playerColor ? 'AI wins' : 'You win!';
        statusLbl.textContent = `Checkmate — ${winner}`;
      } else if (chess.isDraw()) {
        statusLbl.textContent = 'Draw!';
      } else {
        statusLbl.textContent = 'Game over';
      }
      return;
    }
    if (thinking) {
      statusLbl.textContent = 'AI is thinking…';
      return;
    }
    statusLbl.textContent = chess.turn() === playerColor ? 'Your turn' : "AI's turn";
    if (chess.inCheck() && chess.turn() === playerColor) {
      statusLbl.textContent = '⚠️ You are in check!';
    }
  }

  function updateMoveHistory() {
    const pairs: string[] = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      const num = Math.floor(i / 2) + 1;
      const w = moveHistory[i] ?? '';
      const b = moveHistory[i + 1] ?? '';
      pairs.push(`${num}. ${w.padEnd(7)} ${b}`);
    }
    moveHistoryEl.textContent = pairs.join('\n');
    moveHistoryEl.scrollTop = moveHistoryEl.scrollHeight;
  }

  function updateCaptured() {
    const board2 = chess.board();
    const counts: Record<string, Record<string, number>> = {
      w: { p:8,n:2,b:2,r:2,q:1 },
      b: { p:8,n:2,b:2,r:2,q:1 },
    };
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const pc = board2[r][f];
        if (pc && pc.type !== 'k') {
          counts[pc.color][pc.type]--;
        }
      }
    }
    const wCap = root.querySelector('#cap-white')!;
    const bCap = root.querySelector('#cap-black')!;
    // White captured = black pieces missing
    wCap.textContent = Object.entries(counts.b).flatMap(([t, n]) =>
      Array(Math.max(0, n)).fill(PIECE_NAMES[t] ?? t)).join('');
    bCap.textContent = Object.entries(counts.w).flatMap(([t, n]) =>
      Array(Math.max(0, n)).fill({ p:'♟',n:'♞',b:'♝',r:'♜',q:'♛' }[t] ?? t)).join('');
  }

  function showPromoDialog(): Promise<string> {
    return new Promise((resolve) => {
      const dialog = root.querySelector('#promo-dialog') as HTMLDialogElement;
      dialog.showModal();
      const handler = (e: Event) => {
        const btn = (e.target as HTMLElement).closest('[data-piece]') as HTMLElement;
        if (!btn) return;
        dialog.removeEventListener('click', handler);
        dialog.close();
        resolve(btn.dataset.piece!);
      };
      dialog.addEventListener('click', handler);
    });
  }

  async function makePlayerMove(from: string, to: string): Promise<void> {
    if (thinking || over) return;
    if (chess.turn() !== playerColor) return;

    // Check for promotion
    const moves = chess.moves({ verbose: true, square: from as any });
    const candidate = moves.find(m => m.to === to);
    if (!candidate) return;

    let promotion: string | undefined;
    if (candidate.flags.includes('p')) {
      promotion = await showPromoDialog();
    }

    // Snapshot board before move
    preMoveSnapshot = chess.fen();
    playerLastUci = from + to + (promotion ?? '');

    // Clear previous suggestion
    suggestedFrom = suggestedTo = null;
    cachedBetterMove = null;
    feedbackPanel.style.display = 'none';
    resetRateButtons();

    const result = chess.move({ from, to, promotion: promotion as any });
    if (!result) return;

    lastMoveFrom = from;
    lastMoveTo   = to;
    moveHistory.push(result.san);
    selected = null;
    targets  = new Set();

    over = chess.isGameOver();
    updateStatus();
    updateMoveHistory();
    updateCaptured();
    render();

    if (over) return;

    // Background move evaluation
    runMoveEval(preMoveSnapshot, playerLastUci, playerColor);

    // Trigger AI
    thinking = true;
    aiLbl.textContent = 'Thinking…';
    updateStatus();
    aiWorker.postMessage({ fen: chess.fen(), difficulty, aiColor });
  }

  aiWorker.onmessage = (e) => {
    const { uciMove } = e.data;
    thinking = false;
    aiLbl.textContent = '';

    if (!uciMove || over) {
      updateStatus();
      return;
    }

    const from = uciMove.slice(0, 2);
    const to   = uciMove.slice(2, 4);
    const promo = uciMove[4] as any;
    const result = chess.move({ from, to, promotion: promo });
    if (!result) { updateStatus(); return; }

    lastMoveFrom = from;
    lastMoveTo   = to;
    moveHistory.push(result.san);
    selected = null;
    targets  = new Set();

    over = chess.isGameOver();
    updateStatus();
    updateMoveHistory();
    updateCaptured();
    render();
  };

  function runMoveEval(fenBefore: string, playerUci: string, pColor: 'w' | 'b') {
    evalWorker?.terminate();
    evalWorker = new Worker(new URL('../workers/eval.worker.ts', import.meta.url), { type: 'module' });
    evalWorker.postMessage({ fenBeforeMove: fenBefore, playerUciMove: playerUci, playerColor: pColor });
    evalWorker.onmessage = (e) => {
      const { betterMove } = e.data;
      evalWorker?.terminate();
      evalWorker = null;
      showFeedbackPanel(betterMove);
    };
  }

  function showFeedbackPanel(betterMove: string | null) {
    cachedBetterMove = betterMove;
    resetRateButtons();
    betterTxt.style.display = 'none';
    betterTxt.textContent = '';
    if (betterMove) {
      showBetterBtn.style.display = 'block';
      showBetterBtn.textContent = 'Show Better Move';
      suggestedFrom = suggestedTo = null;
    } else {
      showBetterBtn.style.display = 'none';
    }
    feedbackPanel.style.display = 'flex';
    feedbackPanel.style.flexDirection = 'column';
    render();
  }

  function resetRateButtons() {
    root.querySelectorAll('.rate-btn').forEach(btn => btn.classList.remove('active'));
  }

  // Rate buttons
  root.querySelectorAll('.rate-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      resetRateButtons();
      btn.classList.add('active');
      const key = (btn as HTMLElement).dataset.key!;
      const ply = moveHistory.length - (chess.turn() === playerColor ? 2 : 1);
      annotations[ply] = key;
    });
  });

  // Show/hide better move
  let showingBetter = false;
  showBetterBtn.addEventListener('click', () => {
    if (showingBetter) {
      showingBetter = false;
      suggestedFrom = suggestedTo = null;
      betterTxt.style.display = 'none';
      showBetterBtn.textContent = 'Show Better Move';
      render();
    } else {
      if (!cachedBetterMove || !preMoveSnapshot || !playerLastUci) return;
      showingBetter = true;
      suggestedFrom = cachedBetterMove.slice(0, 2);
      suggestedTo   = cachedBetterMove.slice(2, 4);
      const explanation = explainBetterMoveText(preMoveSnapshot, playerLastUci, cachedBetterMove);
      betterTxt.textContent = explanation;
      betterTxt.style.display = 'block';
      showBetterBtn.textContent = 'Hide Suggestion';
      render();
    }
  });

  // Board click handler
  board.onSquareClick = (sq: string) => {
    if (over || thinking || chess.turn() !== playerColor) return;

    if (targets.has(sq)) {
      makePlayerMove(selected!, sq);
      return;
    }

    const piece = chess.get(sq as any);
    if (piece && piece.color === playerColor) {
      selected = sq;
      const moves = chess.moves({ verbose: true, square: sq as any });
      targets = new Set(moves.map(m => m.to));
    } else {
      selected = null;
      targets  = new Set();
    }
    render();
  };

  // New Game
  root.querySelector('#new-game-btn')!.addEventListener('click', () => {
    chess = new Chess();
    selected = null;
    targets  = new Set();
    lastMoveFrom = lastMoveTo = null;
    suggestedFrom = suggestedTo = null;
    cachedBetterMove = null;
    preMoveSnapshot = playerLastUci = null;
    thinking = false;
    over = false;
    moveHistory = [];
    annotations = {};
    showingBetter = false;
    feedbackPanel.style.display = 'none';
    evalWorker?.terminate();
    evalWorker = null;
    updateStatus();
    updateMoveHistory();
    updateCaptured();
    render();

    // If AI plays first (player is black)
    if (chess.turn() === aiColor) {
      thinking = true;
      aiLbl.textContent = 'Thinking…';
      updateStatus();
      aiWorker.postMessage({ fen: chess.fen(), difficulty, aiColor });
    }
  });

  root.querySelector('#menu-btn')!.addEventListener('click', () => {
    navigate({ to: 'start' });
  });

  // Initial render
  updateStatus();
  updateMoveHistory();
  updateCaptured();
  render();

  // AI goes first if player is Black
  if (chess.turn() === aiColor) {
    thinking = true;
    aiLbl.textContent = 'Thinking…';
    updateStatus();
    aiWorker.postMessage({ fen: chess.fen(), difficulty, aiColor });
  }

  return () => {
    aiWorker.terminate();
    evalWorker?.terminate();
  };
}
