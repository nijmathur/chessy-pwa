import { Chess, type Move } from 'chess.js';
import { PIECE_VALUES } from './pst';
import { evaluate } from './evaluate';

/**
 * Generate moves in search order:
 *   1. Captures sorted by MVV-LVA (most-valuable victim / least-valuable attacker)
 *   2. Quiet moves
 *
 * Partitioning instead of sorting the whole array avoids unnecessary comparisons
 * for quiet moves and is faster in practice.
 */
export function orderedMoves(chess: Chess): Move[] {
  const moves   = chess.moves({ verbose: true });
  const captures: Move[] = [];
  const quiet:    Move[] = [];

  for (const m of moves) {
    if (m.captured) captures.push(m);
    else            quiet.push(m);
  }

  captures.sort((a, b) =>
    (PIECE_VALUES[b.captured!] - PIECE_VALUES[b.piece]) -
    (PIECE_VALUES[a.captured!] - PIECE_VALUES[a.piece]),
  );

  return captures.length ? [...captures, ...quiet] : quiet;
}

export function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
): number {
  if (depth === 0) return evaluate(chess);

  const moves = orderedMoves(chess);

  if (moves.length === 0) {
    // Terminal: checkmate or stalemate
    // Prefer quicker mates / longer escapes by weighting with remaining depth
    if (chess.inCheck()) return maximizing ? -99_999 - depth : 99_999 + depth;
    return 0; // stalemate / draw
  }

  if (maximizing) {
    let best = -999_999;
    for (const move of moves) {
      chess.move(move);
      best = Math.max(best, minimax(chess, depth - 1, alpha, beta, false));
      chess.undo();
      alpha = Math.max(alpha, best);
      if (alpha >= beta) break;
    }
    return best;
  } else {
    let best = 999_999;
    for (const move of moves) {
      chess.move(move);
      best = Math.min(best, minimax(chess, depth - 1, alpha, beta, true));
      chess.undo();
      beta = Math.min(beta, best);
      if (alpha >= beta) break;
    }
    return best;
  }
}
