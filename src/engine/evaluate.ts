import { Chess } from 'chess.js';
import { PIECE_VALUES, PST } from './pst';

/**
 * Static evaluation: positive = good for White, negative = good for Black.
 *
 * NOTE: does NOT handle terminal positions (checkmate/stalemate).
 * Callers (minimax) are responsible for detecting terminals via moves.length === 0.
 *
 * Index math:
 *   chess.board()[rankIdx][fileIdx]: rankIdx=0 is rank 8, rankIdx=7 is rank 1
 *   sq (0-63, rank1=bottom) = (7 - rankIdx)*8 + fileIdx
 *   White pst_index = sq ^ 56 = rankIdx*8 + fileIdx
 *   Black pst_index = sq
 */
export function evaluate(chess: Chess): number {
  let score = 0;
  const board = chess.board();

  for (let rankIdx = 0; rankIdx < 8; rankIdx++) {
    for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
      const piece = board[rankIdx][fileIdx];
      if (!piece) continue;

      const val = PIECE_VALUES[piece.type];
      const pst = PST[piece.type];
      const sq  = (7 - rankIdx) * 8 + fileIdx;

      if (piece.color === 'w') score += val + pst[sq ^ 56];
      else                     score -= val + pst[sq];
    }
  }

  return score;
}
