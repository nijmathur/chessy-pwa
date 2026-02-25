import { Chess } from 'chess.js';
import { minimax } from './minimax';

/**
 * Time budget per difficulty level (milliseconds).
 * Iterative deepening runs depth 1→2→3→… until the budget is exhausted,
 * so response time is always bounded regardless of position complexity.
 */
export const DIFFICULTY = {
  Beginner: { timeLimitMs:  200, random: 0.75 },
  Easy:     { timeLimitMs:  400, random: 0.25 },
  Medium:   { timeLimitMs:  700, random: 0.00 },
  Hard:     { timeLimitMs: 1500, random: 0.00 },
  Expert:   { timeLimitMs: 3000, random: 0.00 },
} as const;

export type Difficulty = keyof typeof DIFFICULTY;

/**
 * Compute the best AI move for the given position using iterative deepening.
 * Accepts a FEN string (not a Chess instance) so it is safe to call from Web Workers.
 * Returns a UCI string ("e2e4", "e7e8q") or null if no moves available.
 */
export function computeAiMove(
  fen: string,
  difficulty: Difficulty,
  aiColor: 'w' | 'b',
): string | null {
  const chess = new Chess(fen);
  const cfg   = DIFFICULTY[difficulty];
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Random move at lower difficulties
  if (Math.random() < cfg.random) {
    const m = moves[Math.floor(Math.random() * moves.length)];
    return m.from + m.to + (m.promotion ?? '');
  }

  const maximizingAi = aiColor === 'w';
  const deadline     = Date.now() + cfg.timeLimitMs;

  // Shuffle root moves for variety among equal-score moves
  let rootMoves = [...moves].sort(() => Math.random() - 0.5);
  let bestUci   = rootMoves[0].from + rootMoves[0].to + (rootMoves[0].promotion ?? '');

  // Iterative deepening: search depth 1, 2, 3, … until time runs out.
  // After each completed depth, move the best move to the front of rootMoves.
  // This improves alpha-beta pruning on the next iteration.
  for (let depth = 1; depth <= 10; depth++) {
    if (Date.now() >= deadline) break;

    let bestVal  = maximizingAi ? -999_999 : 999_999;
    let bestMove = rootMoves[0]; // fallback
    let complete = true;

    for (const move of rootMoves) {
      if (Date.now() >= deadline) { complete = false; break; }

      chess.move(move);
      const val = minimax(chess, depth - 1, -999_999, 999_999, !maximizingAi);
      chess.undo();

      if ((maximizingAi && val > bestVal) || (!maximizingAi && val < bestVal)) {
        bestVal  = val;
        bestMove = move;
      }
    }

    // Only commit result if this depth finished without a time cut
    if (complete) {
      bestUci   = bestMove.from + bestMove.to + (bestMove.promotion ?? '');
      // Move the best move to front — gives better ordering on the next depth
      rootMoves = [bestMove, ...rootMoves.filter(m => m !== bestMove)];
    }
  }

  return bestUci;
}
