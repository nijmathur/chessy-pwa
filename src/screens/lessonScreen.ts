import { Chess } from 'chess.js';
import { navigate } from '../main';
import { ChessBoard, type BoardState } from '../board/ChessBoard';
import { LESSONS } from '../lessons';

export interface LessonParams {
  lessonIndex: number;
}

// ── Variant history (localStorage) ────────────────────────────────────────────
const STORAGE_KEY = 'chessy-variant-history';

function loadVariantHistory(): Map<number, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? new Map(JSON.parse(raw) as [number, number][]) : new Map();
  } catch {
    return new Map();
  }
}

function saveVariantHistory(map: Map<number, number>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...map]));
  } catch { /* storage might be unavailable */ }
}

function pickVariant(lessonIdx: number, count: number): number {
  const history = loadVariantHistory();
  const lastShown = history.get(lessonIdx) ?? -1;
  const candidates = Array.from({ length: count }, (_, i) => i).filter(i => i !== lastShown);
  const pool = candidates.length ? candidates : Array.from({ length: count }, (_, i) => i);
  const picked = pool[Math.floor(Math.random() * pool.length)];
  history.set(lessonIdx, picked);
  saveVariantHistory(history);
  return picked;
}

// ── Screen ────────────────────────────────────────────────────────────────────
export function lessonScreen(root: HTMLElement, params: LessonParams): () => void {
  const { lessonIndex } = params;
  const lesson = LESSONS[lessonIndex];
  if (!lesson) {
    navigate({ to: 'lessons' });
    return () => {};
  }

  // Pick variant (task lessons) or use lesson FEN directly (explore lessons)
  const variantIdx = lesson.kind === 'task' && lesson.variants
    ? pickVariant(lessonIndex, lesson.variants.length)
    : 0;
  const variant  = lesson.kind === 'task' ? lesson.variants?.[variantIdx] : null;
  const startFen = variant?.fen ?? lesson.fen ?? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  const focus    = variant?.focus ?? lesson.focus ?? null;
  const answer   = variant?.answer ?? null;

  root.innerHTML = `
    <div class="lesson-layout">
      <div class="lesson-board-area">
        <canvas id="lesson-canvas"></canvas>
      </div>
      <aside class="lesson-side">
        <div class="lesson-header">
          <div class="lesson-icon-title">
            <span class="lesson-icon">${lesson.icon}</span>
            <span class="lesson-title">${lesson.title}</span>
          </div>
          <span class="lesson-category-tag">${lesson.category} · ${lesson.kind === 'task' ? 'Puzzle' : 'Explore'}</span>
        </div>
        <hr class="sep">
        <div class="lesson-desc" id="lesson-desc">${lesson.desc}</div>
        <div class="lesson-feedback" id="feedback"></div>
        <div class="lesson-nav">
          <button class="btn-secondary" id="prev-btn">← Prev</button>
          <button class="btn-secondary" id="lessons-btn">All Lessons</button>
          <button class="btn-secondary" id="next-btn">Next →</button>
        </div>
      </aside>
    </div>
  `;

  const canvas = root.querySelector('#lesson-canvas') as HTMLCanvasElement;
  const board  = new ChessBoard(canvas);
  const feedbackEl = root.querySelector('#feedback') as HTMLElement;

  // Chess state
  let chess    = new Chess(startFen);
  let selected: string | null = null;
  let targets  = new Set<string>();
  let solved   = false;

  // Auto-select the focus piece to show its moves
  if (focus) {
    const moves = chess.moves({ verbose: true, square: focus as any });
    if (moves.length > 0) {
      selected = focus;
      targets  = new Set(moves.map(m => m.to));
    }
  }

  function getBoardState(): BoardState {
    return {
      fen: chess.fen(),
      playerColor: 'w',
      selectedSquare: selected,
      targetSquares: targets,
      lastMoveFrom: null,
      lastMoveTo: null,
      suggestedFrom: null,
      suggestedTo: null,
    };
  }

  board.render(getBoardState());

  board.onSquareClick = (sq: string) => {
    if (lesson.kind === 'explore') {
      handleExploreClick(sq);
    } else {
      handleTaskClick(sq);
    }
  };

  function handleExploreClick(sq: string) {
    if (targets.has(sq) && selected) {
      const piece = chess.get(selected as any);
      let promotion: 'q' | undefined;
      if (piece && piece.type === 'p' && (sq[1] === '8' || sq[1] === '1')) {
        promotion = 'q';
      }
      const result = chess.move({ from: selected, to: sq, promotion });
      if (result) {
        selected = null;
        targets  = new Set();
      }
    } else {
      const piece = chess.get(sq as any);
      if (piece && piece.color === chess.turn()) {
        selected = sq;
        const moves = chess.moves({ verbose: true, square: sq as any });
        targets = new Set(moves.map(m => m.to));
      } else {
        selected = null;
        targets  = new Set();
      }
    }
    board.render(getBoardState());
  }

  function handleTaskClick(sq: string) {
    if (solved) return;

    if (targets.has(sq) && selected) {
      const uci = selected + sq;
      const isCorrect = answer && (uci === answer || uci === answer.slice(0, 4));

      const piece = chess.get(selected as any);
      let promotion: 'q' | 'r' | 'b' | 'n' | undefined;
      if (piece && piece.type === 'p' && (sq[1] === '8' || sq[1] === '1')) {
        const promo = answer && answer.length === 5 ? answer[4] : 'q';
        promotion = promo as 'q' | 'r' | 'b' | 'n';
      }
      chess.move({ from: selected, to: sq, promotion });

      selected = null;
      targets  = new Set();
      board.render(getBoardState());

      if (isCorrect) {
        solved = true;
        feedbackEl.textContent = '✓ Correct! Well done.';
        feedbackEl.className   = 'lesson-feedback correct';
      } else {
        feedbackEl.textContent = '✗ Not quite — try again!';
        feedbackEl.className   = 'lesson-feedback wrong';
        setTimeout(() => {
          chess    = new Chess(startFen);
          selected = null;
          targets  = new Set();
          feedbackEl.textContent = '';
          feedbackEl.className   = 'lesson-feedback';
          if (focus) {
            const moves = chess.moves({ verbose: true, square: focus as any });
            if (moves.length > 0) {
              selected = focus;
              targets  = new Set(moves.map(m => m.to));
            }
          }
          board.render(getBoardState());
        }, 1200);
      }
    } else {
      const piece = chess.get(sq as any);
      if (piece && piece.color === chess.turn()) {
        selected = sq;
        const moves = chess.moves({ verbose: true, square: sq as any });
        targets = new Set(moves.map(m => m.to));
      } else {
        selected = null;
        targets  = new Set();
      }
      board.render(getBoardState());
    }
  }

  // Navigation buttons
  const prev = lessonIndex > 0;
  const next = lessonIndex < LESSONS.length - 1;
  const prevBtn = root.querySelector('#prev-btn') as HTMLButtonElement;
  const nextBtn = root.querySelector('#next-btn') as HTMLButtonElement;
  prevBtn.disabled = !prev;
  nextBtn.disabled = !next;

  prevBtn.addEventListener('click', () => {
    if (prev) navigate({ to: 'lesson', params: { lessonIndex: lessonIndex - 1 } });
  });
  nextBtn.addEventListener('click', () => {
    if (next) navigate({ to: 'lesson', params: { lessonIndex: lessonIndex + 1 } });
  });
  root.querySelector('#lessons-btn')!.addEventListener('click', () => {
    navigate({ to: 'lessons' });
  });

  return () => {
    board.destroy();
  };
}
