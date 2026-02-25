import { Chess } from 'chess.js';
import { minimax } from './minimax';

const PIECE_NAMES: Record<string, string> = {
  p: 'Pawn', n: 'Knight', b: 'Bishop', r: 'Rook', q: 'Queen', k: 'King',
};

/**
 * Return a plain-English explanation of why bestUci is better than playerUci.
 * Port of chessy.py _explain_better_move_text().
 * Uses depth-2 minimax for tactical accuracy (detects forks, etc.).
 */
export function explainBetterMoveText(
  fenBefore: string,
  playerUci: string,
  bestUci: string,
): string {
  const boardBefore = new Chess(fenBefore);
  const isWhite = boardBefore.turn() === 'w';

  // Find verbose Move objects for SAN
  const allMoves = boardBefore.moves({ verbose: true });
  const playerMove = allMoves.find(m =>
    m.from === playerUci.slice(0, 2) && m.to === playerUci.slice(2, 4));
  const bestMove = allMoves.find(m =>
    m.from === bestUci.slice(0, 2) && m.to === bestUci.slice(2, 4));

  const playerSan = playerMove?.san ?? playerUci;
  const bestSan   = bestMove?.san   ?? bestUci;

  const evalDepth = 2;

  function moverScore(uci: string): number {
    const b = new Chess(fenBefore);
    b.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as any });
    const raw = minimax(b, evalDepth, -999_999, 999_999, !isWhite);
    return isWhite ? raw : -raw;
  }

  const pScore = moverScore(playerUci);
  const bScore = moverScore(bestUci);
  const diff   = bScore - pScore;

  const lines: string[] = [
    `Engine suggests: ${bestSan}`,
    `Your move was:   ${playerSan}`,
    '',
  ];

  if (diff <= 30) {
    lines.push("Your move matched the engine's top choice — well played!");
    return lines.join('\n');
  }

  const pawnDiff = diff / 100.0;
  if (pawnDiff > 50) {
    lines.push('This move leads to a decisive advantage.');
  } else {
    lines.push(`This is about ${pawnDiff.toFixed(1)} pawn${pawnDiff !== 1.0 ? 's' : ''} stronger.`);
  }
  lines.push('');

  const bAfter = new Chess(fenBefore);
  bAfter.move({ from: bestUci.slice(0, 2), to: bestUci.slice(2, 4), promotion: bestUci[4] as any });

  const reasons: string[] = [];

  if (bAfter.isCheckmate()) {
    reasons.push('It delivers checkmate immediately!');
  } else if (bAfter.inCheck()) {
    reasons.push('It gives check, forcing the opponent to react.');
  }

  if (bestMove?.captured) {
    const pname = PIECE_NAMES[bestMove.captured] ?? bestMove.captured;
    if (diff > 150) {
      reasons.push(`It wins the ${pname}, gaining significant material.`);
    } else {
      reasons.push(`It captures the ${pname}, improving your position.`);
    }
  }

  if (bestMove?.promotion) {
    reasons.push('The pawn promotes to a queen, gaining a huge material advantage.');
  }

  if (reasons.length === 0) {
    const toFile = bestUci.charCodeAt(2) - 97; // 'a'=0
    const toRank = parseInt(bestUci[3]) - 1;
    if (toFile >= 2 && toFile <= 5 && toRank >= 2 && toRank <= 5) {
      reasons.push('It places a piece in a stronger, more central position.');
    } else if (diff > 150) {
      reasons.push('It avoids a significant material loss or creates a decisive threat.');
    } else {
      reasons.push('It improves piece activity or removes a subtle threat.');
    }
  }

  if (reasons.length > 0) {
    lines.push('Why it\'s better:');
    for (const r of reasons) lines.push(`  • ${r}`);
  }

  return lines.join('\n');
}
