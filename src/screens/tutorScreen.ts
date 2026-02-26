import { Chess } from 'chess.js';
import { navigate } from '../main';
import { ChessBoard, type BoardState } from '../board/ChessBoard';
import {
  analyzePlayerMove,
  describeBetterMove,
  analyzeAiMove,
  type PlayerMoveAnalysis,
  type MoveQuality,
} from '../engine/tutor';
import { STRATEGIES, type Strategy } from '../strategies';

export interface TutorParams {
  playerColor: 'w' | 'b';
  strategyId?: string;
}

type Phase =
  | 'player_turn'
  | 'analyzing'
  | 'player_feedback'
  | 'showing_correction'
  | 'ai_thinking'
  | 'ai_feedback'
  | 'game_over';

// ── Screen ────────────────────────────────────────────────────────────────────

export function tutorScreen(root: HTMLElement, params: TutorParams): () => void {
  const { playerColor } = params;
  const aiColor: 'w' | 'b' = playerColor === 'w' ? 'b' : 'w';

  // Strategy (optional)
  const strategy: Strategy | null = params.strategyId
    ? (STRATEGIES.find(s => s.id === params.strategyId) ?? null)
    : null;

  root.innerHTML = `
    <div class="game-layout">
      <div class="board-area">
        <canvas id="tutor-canvas"></canvas>
      </div>
      <aside class="side-panel tutor-panel">
        <div class="tutor-status-row">
          <div class="status-lbl" id="t-status">Your turn</div>
          <div class="tutor-badge hidden" id="t-badge"></div>
        </div>
        <div class="ai-lbl" id="t-ai-lbl"></div>

        ${strategy ? `
        <!-- Strategy tip banner -->
        <div class="tutor-tip-banner" id="t-tip-banner">
          <div class="tutor-tip-label">${strategy.icon} ${strategy.title}</div>
          <div class="tutor-tip-text" id="t-tip-text"></div>
        </div>` : ''}

        <hr class="sep">

        <!-- Spinner (analyzing / ai_thinking) -->
        <div class="tutor-spinner hidden" id="t-spinner">
          <div class="t-spin-dot"></div>
          <span id="t-spinner-text">Analyzing…</span>
        </div>

        <!-- Message area (player_feedback, showing_correction, ai_feedback) -->
        <div class="tutor-message-area">
          <div class="tutor-headline" id="t-headline"></div>
          <div class="tutor-detail" id="t-detail">Select a piece and make your move!</div>
        </div>

        <!-- Action buttons -->
        <div class="tutor-actions" id="t-actions">
          <button class="btn-primary"   id="t-continue-btn"    style="display:none">Continue →</button>
          <button class="btn-warn"       id="t-see-better-btn"  style="display:none">See Better Move</button>
          <button class="btn-secondary" id="t-undo-better-btn" style="display:none">Okay, I see it →</button>
        </div>

        <hr class="sep">
        <div class="captured-lbl">Moves:</div>
        <div class="move-history scroll-y" id="t-history"></div>
        <div class="panel-btns">
          <button class="btn-secondary" id="t-new-btn">New Game</button>
          <button class="btn-secondary" id="t-menu-btn">Menu</button>
        </div>
      </aside>
    </div>

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

  // ── Canvas / board ──────────────────────────────────────────────────────────
  const canvas = root.querySelector('#tutor-canvas') as HTMLCanvasElement;
  const board  = new ChessBoard(canvas);

  // ── Strategy tips ───────────────────────────────────────────────────────────
  let tipIndex = 0;
  const tips = strategy?.tips ?? [];

  function advanceTip() {
    if (!strategy || tips.length === 0) return;
    const el = root.querySelector('#t-tip-text');
    if (el) el.textContent = tips[tipIndex % tips.length];
    tipIndex++;
  }

  // ── Game state ──────────────────────────────────────────────────────────────
  let chess = strategy ? new Chess(strategy.thematicFen) : new Chess();
  let phase: Phase  = 'player_turn';
  let selected: string | null = null;
  let targets       = new Set<string>();
  let lastMoveFrom: string | null = null;
  let lastMoveTo:   string | null = null;
  let suggestedFrom: string | null = null;
  let suggestedTo:   string | null = null;
  let moveHistory:  string[] = [];

  // Per-turn snapshots
  let preMoveSnapshot: string | null = null;
  let playerLastUci:   string | null = null;
  let cachedAnalysis:  PlayerMoveAnalysis | null = null;

  // ── UI refs ─────────────────────────────────────────────────────────────────
  const statusEl     = root.querySelector('#t-status')!;
  const aiLblEl      = root.querySelector('#t-ai-lbl')!;
  const badgeEl      = root.querySelector('#t-badge') as HTMLElement;
  const spinnerEl    = root.querySelector('#t-spinner') as HTMLElement;
  const spinnerText  = root.querySelector('#t-spinner-text')!;
  const headlineEl   = root.querySelector('#t-headline')!;
  const detailEl     = root.querySelector('#t-detail')!;
  const continueBtn  = root.querySelector('#t-continue-btn')  as HTMLButtonElement;
  const seeBetterBtn = root.querySelector('#t-see-better-btn') as HTMLButtonElement;
  const undoBetterBtn= root.querySelector('#t-undo-better-btn') as HTMLButtonElement;
  const historyEl    = root.querySelector('#t-history')!;

  // ── Workers ─────────────────────────────────────────────────────────────────
  // evalWorker: finds best move + diff for the player's position
  const evalWorker = new Worker(new URL('../workers/eval.worker.ts', import.meta.url), { type: 'module' });
  // aiWorker: computes the engine's reply
  const aiWorker   = new Worker(new URL('../workers/ai.worker.ts',  import.meta.url), { type: 'module' });

  evalWorker.onmessage = (e: MessageEvent<{ betterMove: string | null; diff: number }>) => {
    if (phase !== 'analyzing') return;
    const { betterMove, diff } = e.data;
    const analysis = analyzePlayerMove(
      preMoveSnapshot!, playerLastUci!, betterMove, diff, playerColor,
    );
    cachedAnalysis = analysis;
    showPlayerFeedback(analysis);
  };

  aiWorker.onmessage = (e: MessageEvent<{ uciMove: string | null }>) => {
    if (phase !== 'ai_thinking') return;
    aiLblEl.textContent = '';
    const { uciMove } = e.data;

    if (!uciMove) {
      transitionGameOver();
      return;
    }

    const priorFen = chess.fen();
    const result = chess.move({
      from:       uciMove.slice(0, 2),
      to:         uciMove.slice(2, 4),
      promotion:  uciMove[4] as any,
    });
    if (!result) { transitionGameOver(); return; }

    lastMoveFrom = uciMove.slice(0, 2);
    lastMoveTo   = uciMove.slice(2, 4);
    suggestedFrom = suggestedTo = null;
    moveHistory.push(result.san);
    updateMoveHistory();

    const narrative = analyzeAiMove(priorFen, uciMove, aiColor);
    showAiFeedback(narrative, chess.isGameOver());
  };

  // ── Render helpers ──────────────────────────────────────────────────────────
  function getBoardState(): BoardState {
    return {
      fen: chess.fen(),
      playerColor,
      selectedSquare: selected,
      targetSquares:  targets,
      lastMoveFrom,
      lastMoveTo,
      suggestedFrom,
      suggestedTo,
    };
  }

  function render() { board.render(getBoardState()); }

  function updateMoveHistory() {
    const pairs: string[] = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      const num = Math.floor(i / 2) + 1;
      const w = moveHistory[i]     ?? '';
      const b = moveHistory[i + 1] ?? '';
      pairs.push(`${num}. ${w.padEnd(7)} ${b}`);
    }
    historyEl.textContent = pairs.join('\n');
    historyEl.scrollTop = historyEl.scrollHeight;
  }

  // ── UI state helpers ────────────────────────────────────────────────────────
  function setBadge(quality: MoveQuality | 'ai' | '') {
    const classes = ['tutor-badge-best','tutor-badge-good','tutor-badge-inaccuracy',
                     'tutor-badge-mistake','tutor-badge-blunder','tutor-badge-ai'];
    badgeEl.classList.remove(...classes, 'hidden');
    if (!quality) { badgeEl.classList.add('hidden'); return; }
    badgeEl.classList.add(`tutor-badge-${quality}`);
    const labels: Record<string, string> = {
      best: 'Best', good: 'Good', inaccuracy: 'Inaccuracy',
      mistake: 'Mistake', blunder: 'Blunder', ai: 'AI',
    };
    badgeEl.textContent = labels[quality] ?? quality;
  }

  function setSpinner(visible: boolean, text = 'Analyzing…') {
    spinnerEl.classList.toggle('hidden', !visible);
    spinnerText.textContent = text;
  }

  function setButtons(opts: { continue?: boolean; seeBetter?: boolean; undoBetter?: boolean }) {
    continueBtn.style.display   = opts.continue   ? 'block' : 'none';
    seeBetterBtn.style.display  = opts.seeBetter  ? 'block' : 'none';
    undoBetterBtn.style.display = opts.undoBetter ? 'block' : 'none';
  }

  // ── Phase transitions ───────────────────────────────────────────────────────

  function showPlayerFeedback(analysis: PlayerMoveAnalysis) {
    phase = 'player_feedback';
    setSpinner(false);
    setBadge(analysis.quality);
    headlineEl.textContent = analysis.headline;
    detailEl.textContent   = analysis.detail;

    if (analysis.betterUci && analysis.quality === 'inaccuracy') {
      // Inaccuracy: offer the option but don't force it
      setButtons({ seeBetter: true, continue: true });
    } else if (analysis.betterUci) {
      // Mistake / blunder: show the better move before continuing
      setButtons({ seeBetter: true });
    } else {
      setButtons({ continue: true });
    }

    statusEl.textContent = 'Your move:';
    render();
  }

  function showAiFeedback(narrative: { headline: string; detail: string }, isGameOver: boolean) {
    phase = 'ai_feedback';
    setBadge('ai');
    headlineEl.textContent = narrative.headline;
    detailEl.textContent   = narrative.detail;
    statusEl.textContent   = "I moved.";

    if (isGameOver) {
      transitionGameOver();
    } else {
      setButtons({ continue: true });
      continueBtn.textContent = 'Got it →';
    }
    render();
  }

  function transitionGameOver() {
    phase = 'game_over';
    setSpinner(false);
    setButtons({});
    setBadge('');

    let msg: string;
    if (chess.isCheckmate()) {
      msg = chess.turn() === playerColor ? 'AI wins — checkmate!' : 'You win — checkmate!';
    } else if (chess.isDraw()) {
      msg = 'Draw!';
    } else {
      msg = 'Game over.';
    }
    statusEl.textContent   = msg;
    headlineEl.textContent = '';
    if (!chess.isCheckmate()) detailEl.textContent = 'Well played — start a new game to keep learning!';
    render();
  }

  // ── Board interaction ───────────────────────────────────────────────────────

  function showPromoDialog(): Promise<string> {
    return new Promise(resolve => {
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

  async function handlePlayerMove(from: string, to: string): Promise<void> {
    if (phase !== 'player_turn') return;
    if (chess.turn() !== playerColor) return;

    const moves = chess.moves({ verbose: true, square: from as any });
    const candidate = moves.find(m => m.to === to);
    if (!candidate) return;

    let promotion: string | undefined;
    if (candidate.flags.includes('p')) {
      promotion = await showPromoDialog();
    }

    preMoveSnapshot = chess.fen();
    playerLastUci   = from + to + (promotion ?? '');
    cachedAnalysis  = null;

    const result = chess.move({ from, to, promotion: promotion as any });
    if (!result) return;

    lastMoveFrom = from;
    lastMoveTo   = to;
    suggestedFrom = suggestedTo = null;
    selected = null;
    targets  = new Set();
    moveHistory.push(result.san);
    updateMoveHistory();

    if (chess.isGameOver()) {
      transitionGameOver();
      render();
      return;
    }

    // Start evaluation
    phase = 'analyzing';
    statusEl.textContent   = 'Analyzing your move…';
    headlineEl.textContent = '';
    detailEl.textContent   = '';
    setBadge('');
    setButtons({});
    setSpinner(true);
    render();

    evalWorker.postMessage({
      fenBeforeMove: preMoveSnapshot,
      playerUciMove: playerLastUci,
      playerColor,
    });
  }

  board.onSquareClick = (sq: string) => {
    if (phase !== 'player_turn') return;
    if (chess.turn() !== playerColor) return;

    if (targets.has(sq)) {
      handlePlayerMove(selected!, sq);
      return;
    }

    const piece = chess.get(sq as any);
    if (piece && piece.color === playerColor) {
      selected = sq;
      targets  = new Set(chess.moves({ verbose: true, square: sq as any }).map(m => m.to));
    } else {
      selected = null;
      targets  = new Set();
    }
    render();
  };

  // ── Button handlers ─────────────────────────────────────────────────────────

  // "Continue →" from player_feedback (good move) or "Got it →" from ai_feedback
  continueBtn.addEventListener('click', () => {
    if (phase === 'player_feedback') {
      // Good/inaccuracy path: proceed to AI move
      triggerAiMove();
    } else if (phase === 'ai_feedback') {
      // Done with AI feedback — back to player
      phase = 'player_turn';
      continueBtn.textContent = 'Continue →';
      setButtons({});
      setBadge('');
      headlineEl.textContent = '';
      statusEl.textContent   = chess.turn() === playerColor ? 'Your turn' : "…";
      if (chess.inCheck() && chess.turn() === playerColor) {
        detailEl.textContent = '⚠️ You are in check! You must move your king, block, or capture the attacker.';
      } else {
        detailEl.textContent = 'Select a piece and make your move!';
      }
      selected = null;
      targets  = new Set();
      render();
    }
  });

  // "See Better Move"
  seeBetterBtn.addEventListener('click', () => {
    if (phase !== 'player_feedback' || !cachedAnalysis?.betterUci || !preMoveSnapshot) return;
    const betterUci = cachedAnalysis.betterUci;

    // Rollback player's move and apply the better move for display
    chess.undo();
    const betterResult = chess.move({
      from:      betterUci.slice(0, 2),
      to:        betterUci.slice(2, 4),
      promotion: betterUci[4] as any,
    });
    if (!betterResult) return;

    lastMoveFrom = betterUci.slice(0, 2);
    lastMoveTo   = betterUci.slice(2, 4);

    const explanation = describeBetterMove(preMoveSnapshot, playerLastUci!, betterUci);
    headlineEl.textContent = 'Here\'s the better move:';
    detailEl.textContent   = explanation;
    statusEl.textContent   = 'Better move shown';
    setBadge('best');
    setButtons({ undoBetter: true });

    phase = 'showing_correction';
    render();
  });

  // "Okay, I see it →"
  undoBetterBtn.addEventListener('click', () => {
    if (phase !== 'showing_correction' || !preMoveSnapshot || !playerLastUci) return;

    // Undo the demonstration move and re-apply the player's original move
    chess.undo(); // back to preMoveSnapshot
    const restored = chess.move({
      from:      playerLastUci.slice(0, 2),
      to:        playerLastUci.slice(2, 4),
      promotion: playerLastUci[4] as any,
    });
    if (!restored) return;

    lastMoveFrom = playerLastUci.slice(0, 2);
    lastMoveTo   = playerLastUci.slice(2, 4);
    triggerAiMove();
  });

  function triggerAiMove() {
    advanceTip();
    phase = 'ai_thinking';
    setBadge('');
    headlineEl.textContent = '';
    detailEl.textContent   = '';
    setButtons({});
    setSpinner(true, 'AI is thinking…');
    statusEl.textContent = 'AI is thinking…';
    aiLblEl.textContent  = '';
    selected = null;
    targets  = new Set();
    render();
    aiWorker.postMessage({ fen: chess.fen(), difficulty: 'Medium', aiColor });
  }

  // ── New game / menu ─────────────────────────────────────────────────────────

  function resetGame() {
    chess = strategy ? new Chess(strategy.thematicFen) : new Chess();
    tipIndex = 0;
    advanceTip();
    phase = 'player_turn';
    selected = null; targets = new Set();
    lastMoveFrom = lastMoveTo = null;
    suggestedFrom = suggestedTo = null;
    preMoveSnapshot = playerLastUci = cachedAnalysis = null;
    moveHistory = [];

    statusEl.textContent   = 'Your turn';
    headlineEl.textContent = '';
    detailEl.textContent   = 'Select a piece and make your move!';
    setBadge('');
    setSpinner(false);
    setButtons({});
    updateMoveHistory();
    render();

    if (chess.turn() === aiColor) triggerAiMove();
  }

  root.querySelector('#t-new-btn')!.addEventListener('click', resetGame);
  root.querySelector('#t-menu-btn')!.addEventListener('click', () => navigate({ to: 'start' }));

  // ── Initial render ──────────────────────────────────────────────────────────
  advanceTip();
  render();

  if (chess.turn() === aiColor) triggerAiMove();

  return () => {
    board.destroy();
    evalWorker.terminate();
    aiWorker.terminate();
  };
}
