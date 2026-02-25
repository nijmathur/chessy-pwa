import { Chess } from 'chess.js';
import { colRowToPixel, pixelToSquare } from './coords';

export interface BoardState {
  fen: string;
  playerColor: 'w' | 'b';
  selectedSquare: string | null;
  targetSquares: Set<string>;
  lastMoveFrom: string | null;
  lastMoveTo: string | null;
  suggestedFrom: string | null;
  suggestedTo: string | null;
}

// Unicode piece glyphs — consistent across modern OS/browsers
const GLYPHS: Record<string, Record<string, string>> = {
  w: { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
  b: { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' },
};

// Square colours
const LIGHT_SQ = '#F0D9B5';
const DARK_SQ  = '#B58863';

// Highlight overlay colours
const SEL_CLR    = 'rgba(246,246,105,0.80)';
const LASTFR_CLR = 'rgba(205,210,106,0.65)';
const LASTTO_CLR = 'rgba(205,210,106,0.85)';
const SUGGFR_CLR = 'rgba( 80,160,255,0.65)';
const SUGGTO_CLR = 'rgba( 80,160,255,0.85)';
const DOT_CLR    = 'rgba(  0,  0,  0,0.18)';

export async function preloadPieces(): Promise<void> {
  // Pieces are rendered as Unicode glyphs — no external resources needed.
}

export class ChessBoard {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private sqSize = 60;
  private dpr = 1;
  private state: BoardState | null = null;
  private ro: ResizeObserver;

  onSquareClick: ((sq: string) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    // Prevent native scroll/zoom on touch; handle pointer events instead
    canvas.style.touchAction = 'none';
    canvas.style.userSelect  = 'none';

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (!this.state || !this.onSquareClick) return;
      const rect = canvas.getBoundingClientRect();
      const sq = pixelToSquare(
        e.clientX - rect.left,
        e.clientY - rect.top,
        this.sqSize,
        this.state.playerColor,
      );
      if (sq) this.onSquareClick(sq);
    });

    this.ro = new ResizeObserver(() => this._resize());
    if (canvas.parentElement) this.ro.observe(canvas.parentElement);
    this._resize();
  }

  destroy(): void {
    this.ro.disconnect();
  }

  render(state: BoardState): void {
    this.state = state;
    this._draw();
  }

  private _resize(): void {
    const container = this.canvas.parentElement;
    if (!container) return;

    const { width: w, height: h } = container.getBoundingClientRect();
    // Snap to a multiple of 8 so squares are always whole pixels
    const boardPx = Math.floor(Math.min(w, h, 800) / 8) * 8;
    if (boardPx <= 0) return;

    this.sqSize = boardPx / 8;
    this.dpr = Math.min(window.devicePixelRatio || 1, 3);

    // Setting width/height resets the canvas context (including transforms)
    this.canvas.width  = boardPx * this.dpr;
    this.canvas.height = boardPx * this.dpr;
    this.canvas.style.width  = `${boardPx}px`;
    this.canvas.style.height = `${boardPx}px`;
    this.ctx.scale(this.dpr, this.dpr);

    if (this.state) this._draw();
  }

  private _draw(): void {
    if (!this.state) return;
    const { ctx, sqSize, state } = this;
    const chess = new Chess(state.fen);
    const boardArr = chess.board();

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
      for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
        const col = fileIdx;
        const row = 7 - rankIdx; // rankIdx=0 → rank 8, rankIdx=7 → rank 1
        const sq  = String.fromCharCode(97 + col) + (row + 1);
        const { x, y } = colRowToPixel(col, row, sqSize, state.playerColor);
        const isLight = (col + row) % 2 === 1;

        // ── Base square ──────────────────────────────────────────────────────
        ctx.fillStyle = isLight ? LIGHT_SQ : DARK_SQ;
        ctx.fillRect(x, y, sqSize, sqSize);

        // ── Last-move highlight ───────────────────────────────────────────────
        if (sq === state.lastMoveFrom) {
          ctx.fillStyle = LASTFR_CLR;
          ctx.fillRect(x, y, sqSize, sqSize);
        } else if (sq === state.lastMoveTo) {
          ctx.fillStyle = LASTTO_CLR;
          ctx.fillRect(x, y, sqSize, sqSize);
        }

        // ── Suggested-move highlight ──────────────────────────────────────────
        if (sq === state.suggestedFrom) {
          ctx.fillStyle = SUGGFR_CLR;
          ctx.fillRect(x, y, sqSize, sqSize);
        } else if (sq === state.suggestedTo) {
          ctx.fillStyle = SUGGTO_CLR;
          ctx.fillRect(x, y, sqSize, sqSize);
        }

        // ── Selected highlight ────────────────────────────────────────────────
        if (sq === state.selectedSquare) {
          ctx.fillStyle = SEL_CLR;
          ctx.fillRect(x, y, sqSize, sqSize);
        }

        // ── Piece ─────────────────────────────────────────────────────────────
        const piece = boardArr[rankIdx][fileIdx];
        if (piece) {
          const glyph = GLYPHS[piece.color]?.[piece.type] ?? '?';
          const fontSize = Math.round(sqSize * 0.72);
          const cx = x + sqSize / 2;
          const cy = y + sqSize / 2 + sqSize * 0.04; // slight optical centering

          ctx.textAlign    = 'center';
          ctx.textBaseline = 'middle';

          if (piece.color === 'w') {
            // White: outlined glyph (stroke then fill) for visibility on any square
            ctx.font = `${fontSize}px "Segoe UI Symbol", "Apple Color Emoji", serif`;
            ctx.lineWidth   = Math.max(2, sqSize * 0.05);
            ctx.strokeStyle = 'rgba(0,0,0,0.55)';
            ctx.strokeText(glyph, cx, cy);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(glyph, cx, cy);
          } else {
            // Black: solid dark fill
            ctx.font = `${fontSize}px "Segoe UI Symbol", "Apple Color Emoji", serif`;
            ctx.fillStyle = '#1C1C1C';
            ctx.fillText(glyph, cx, cy);
          }
        }

        // ── Target indicator ──────────────────────────────────────────────────
        if (state.targetSquares.has(sq)) {
          ctx.fillStyle = DOT_CLR;
          if (piece) {
            // Capture: hollow ring
            ctx.lineWidth = sqSize * 0.08;
            ctx.strokeStyle = DOT_CLR;
            ctx.beginPath();
            ctx.arc(x + sqSize / 2, y + sqSize / 2, sqSize * 0.44, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            // Move: small dot
            ctx.beginPath();
            ctx.arc(x + sqSize / 2, y + sqSize / 2, sqSize * 0.15, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // ── Coordinate labels ─────────────────────────────────────────────────────
    const labelSize = Math.max(10, Math.round(sqSize * 0.22));
    ctx.font = `bold ${labelSize}px sans-serif`;
    ctx.shadowBlur = 0;

    for (let i = 0; i < 8; i++) {
      const col = i;
      const row = i;

      // Rank number — top-left corner of the leftmost square in that rank
      {
        const { x, y } = colRowToPixel(0, row, sqSize, state.playerColor);
        const isLight = (0 + row) % 2 === 1;
        ctx.fillStyle = isLight ? DARK_SQ : LIGHT_SQ;
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(String(row + 1), x + 3, y + 2);
      }

      // File letter — bottom-right corner of the bottom square in that file
      {
        const { x, y } = colRowToPixel(col, 0, sqSize, state.playerColor);
        const isLight = (col + 0) % 2 === 1;
        ctx.fillStyle = isLight ? DARK_SQ : LIGHT_SQ;
        ctx.textAlign    = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(String.fromCharCode(97 + col), x + sqSize - 3, y + sqSize - 2);
      }
    }
  }
}
