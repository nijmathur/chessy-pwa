import { Chess, type Move } from 'chess.js';

// ── Types ─────────────────────────────────────────────────────────────────────

export type MoveQuality = 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

export interface PlayerMoveAnalysis {
  quality: MoveQuality;
  headline: string;
  detail: string;
  /** Non-null only for mistake/blunder — pass to describeBetterMove. */
  betterUci: string | null;
}

export interface AiMoveNarrative {
  headline: string;
  detail: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const PIECE: Record<string, string> = {
  p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king',
};

const VAL: Record<string, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function pn(type: string): string { return PIECE[type] ?? type; }

function countAttackedPieces(chess: Chess, square: string): number {
  return chess.moves({ verbose: true, square: square as any })
    .filter(m => m.captured).length;
}

function isOnBackRank(square: string, color: 'w' | 'b'): boolean {
  return color === 'w' ? square[1] === '1' : square[1] === '8';
}

function isCentralish(square: string): boolean {
  return 'cdef'.includes(square[0]) && '3456'.includes(square[1]);
}

function hasUndevelopedMinors(chess: Chess, color: 'w' | 'b'): boolean {
  const squares = color === 'w'
    ? ['b1', 'g1', 'c1', 'f1']
    : ['b8', 'g8', 'c8', 'f8'];
  return squares.some(sq => {
    const p = chess.get(sq as any);
    return p && p.color === color && (p.type === 'n' || p.type === 'b');
  });
}

function openingTip(chess: Chess, move: Move, playerColor: 'w' | 'b'): string | null {
  // chess.history() already includes the current move
  if (chess.history().length > 20) return null;

  if (move.piece === 'q' && chess.history().length <= 8) {
    return 'Opening tip: avoid bringing your queen out early — it becomes a target and you lose time retreating it.';
  }
  if (move.piece === 'n' && (move.to[0] === 'a' || move.to[0] === 'h')) {
    return '"A knight on the rim is dim" — edge squares limit the knight to 2–4 moves. Central files (c–f) are far stronger.';
  }
  if (move.piece === 'p'
    && move.to[0] !== 'e' && move.to[0] !== 'd'
    && hasUndevelopedMinors(chess, playerColor)) {
    return 'Opening tip: develop your knights and bishops before pushing flank pawns.';
  }
  return null;
}

// ── Player move analysis ──────────────────────────────────────────────────────

/**
 * Analyse the player's move given eval-worker output (betterUci + diff).
 * Called in the main thread after the eval worker responds — no minimax here.
 */
export function analyzePlayerMove(
  fenBefore: string,
  playerUci: string,
  betterUci: string | null,  // null when diff ≤ 30 (eval.worker threshold)
  diff: number,              // centipawn loss (always ≥ 0), from eval.worker
  playerColor: 'w' | 'b',
): PlayerMoveAnalysis {
  // Classify quality from the centipawn loss
  const quality: MoveQuality =
    diff <= 5   ? 'best'        :
    diff <= 30  ? 'good'        :
    diff <= 100 ? 'inaccuracy'  :
    diff <= 300 ? 'mistake'     :
                  'blunder';

  const shouldCorrect = quality === 'mistake' || quality === 'blunder';

  // Inspect the move with chess.js
  const chess = new Chess(fenBefore);
  const moveObj = chess.moves({ verbose: true })
    .find(m => m.from === playerUci.slice(0, 2) && m.to === playerUci.slice(2, 4));

  if (!moveObj) {
    return { quality: 'good', headline: 'Move played.', detail: '', betterUci: null };
  }

  chess.move(moveObj);

  const pieceName = pn(moveObj.piece);
  const isCastle  = moveObj.flags.includes('k') || moveObj.flags.includes('q');
  const isMate    = chess.isCheckmate();
  const isCheck   = chess.inCheck();
  const isCap     = !!moveObj.captured;

  // What the move does
  let whatItDoes: string;
  if (isMate) {
    whatItDoes = `Your ${pieceName} delivers checkmate!`;
  } else if (isCastle) {
    const side = moveObj.flags.includes('k') ? 'kingside' : 'queenside';
    whatItDoes = `You castle ${side}, tucking your king to safety.`;
  } else if (moveObj.promotion) {
    whatItDoes = `Your pawn promotes to a ${pn(moveObj.promotion)}!`;
  } else if (moveObj.flags.includes('e')) {
    whatItDoes = `En passant — you capture the pawn diagonally even though the target square looked empty.`;
  } else if (isCap && isCheck) {
    whatItDoes = `You capture the ${pn(moveObj.captured!)} on ${moveObj.to} and give check!`;
  } else if (isCap) {
    const capturedVal = VAL[moveObj.captured!] ?? 0;
    const myVal = VAL[moveObj.piece] ?? 0;
    const tradeTerm = capturedVal > myVal ? 'winning material' :
                      capturedVal === myVal ? 'an equal trade' : 'taking a less-valuable piece';
    whatItDoes = `You capture the ${pn(moveObj.captured!)} on ${moveObj.to} (${tradeTerm}).`;
  } else if (isCheck) {
    whatItDoes = `Your ${pieceName} moves to ${moveObj.to}, giving check!`;
  } else if ((moveObj.piece === 'n' || moveObj.piece === 'b') && isOnBackRank(moveObj.from, playerColor)) {
    whatItDoes = `You develop your ${pieceName} off the back rank.`;
  } else if (moveObj.piece === 'p' && isCentralish(moveObj.to)) {
    whatItDoes = `You advance your pawn to ${moveObj.to}, contesting the center.`;
  } else if (isCastle) {
    whatItDoes = `You castle.`;
  } else {
    whatItDoes = `You move your ${pieceName} to ${moveObj.to}.`;
  }

  // Check for fork potential (moved piece attacks 2+ opponents)
  const forked = countAttackedPieces(chess, moveObj.to);
  if (forked >= 2 && !isCap && !isMate && !isCheck) {
    whatItDoes += ` Your ${pieceName} now threatens ${forked} opponent pieces at once — a fork!`;
  }

  // Quality assessment sentence
  const HEADLINE: Record<MoveQuality, string> = {
    best:       '★ Best move!',
    good:       '✓ Good move!',
    inaccuracy: '△ Slight inaccuracy',
    mistake:    '✗ Mistake',
    blunder:    '✗✗ Blunder!',
  };

  const pawnDiff = (diff / 100).toFixed(1);
  let assessment: string;
  if (quality === 'best') {
    assessment = 'This is the engine\'s top choice — excellent!';
  } else if (quality === 'good') {
    assessment = 'Strong play!';
  } else if (quality === 'inaccuracy') {
    assessment = `There was a slightly better option (about ${pawnDiff} pawn${diff === 100 ? '' : 's'} stronger), but your move is still reasonable.`;
  } else if (quality === 'mistake') {
    assessment = `This loses about ${pawnDiff} pawns of advantage. Let's see what was better.`;
  } else {
    assessment = `This is a serious error — about ${pawnDiff} pawns lost. Let's look at the right move.`;
  }

  const tip = !isMate ? openingTip(chess, moveObj, playerColor) : null;

  let detail = `${whatItDoes} ${assessment}`;
  if (tip) detail += `\n\n💡 ${tip}`;

  return {
    quality,
    headline: HEADLINE[quality],
    detail,
    betterUci: shouldCorrect ? betterUci : null,
  };
}

// ── Better-move explanation ───────────────────────────────────────────────────

/**
 * Return a multi-line string explaining why betterUci is stronger than playerUci.
 * Called synchronously after the user clicks "See Better Move".
 */
export function describeBetterMove(
  fenBefore: string,
  playerUci: string,
  betterUci: string,
): string {
  const before = new Chess(fenBefore);
  const allMoves = before.moves({ verbose: true });
  const betterSan = allMoves.find(
    m => m.from === betterUci.slice(0, 2) && m.to === betterUci.slice(2, 4))?.san ?? betterUci;
  const playerSan = allMoves.find(
    m => m.from === playerUci.slice(0, 2) && m.to === playerUci.slice(2, 4))?.san ?? playerUci;

  const after = new Chess(fenBefore);
  const bestObj = after.move({
    from: betterUci.slice(0, 2),
    to:   betterUci.slice(2, 4),
    promotion: betterUci[4] as any,
  });
  if (!bestObj) return `Better was ${betterSan} instead of ${playerSan}.`;

  const myPiece = pn(bestObj.piece);
  const lines: string[] = [`Better move: ${betterSan}  (you played: ${playerSan})`, ''];

  if (after.isCheckmate()) {
    lines.push(`${betterSan} delivers checkmate immediately — the game would have been won on the spot!`);
  } else if (bestObj.flags.includes('k') || bestObj.flags.includes('q')) {
    lines.push(`Castling here would have sheltered the king and activated the rook — two goals in one move.`);
  } else if (after.inCheck()) {
    lines.push(`${betterSan} gives check, forcing your opponent to react rather than make their own threats.`);
    const fork = countAttackedPieces(after, bestObj.to);
    if (fork >= 2) lines.push(`It simultaneously attacks ${fork} pieces — a check combined with a fork!`);
  } else if (bestObj.captured) {
    const capturedName = pn(bestObj.captured);
    const myVal   = VAL[bestObj.piece] ?? 0;
    const theirVal = VAL[bestObj.captured] ?? 0;
    if (theirVal > myVal) {
      lines.push(`${betterSan} wins the ${capturedName} (${theirVal} pts) with your ${myPiece} (${myVal} pts) — free material!`);
    } else if (theirVal === myVal) {
      lines.push(`${betterSan} makes an equal trade that was favorable in this specific position.`);
    } else {
      lines.push(`${betterSan} captures the ${capturedName} to clear an important square.`);
    }
  } else {
    const fork = countAttackedPieces(after, bestObj.to);
    if (fork >= 2) {
      lines.push(`${betterSan} creates a fork — the ${myPiece} attacks ${fork} of your opponent's pieces at once!`);
    } else if (fork === 1) {
      lines.push(`${betterSan} improves the ${myPiece}'s activity while threatening an opponent piece.`);
    } else {
      lines.push(`${betterSan} places the ${myPiece} on a more active square, controlling key areas of the board.`);
    }
  }

  return lines.join('\n');
}

// ── AI move narrative ─────────────────────────────────────────────────────────

/**
 * Generate a brief tutor explanation of the AI's move, written from the
 * student's perspective ("notice that…").
 */
export function analyzeAiMove(
  fenBeforeAiMove: string,
  aiUci: string,
  _aiColor: 'w' | 'b',
): AiMoveNarrative {
  const chess = new Chess(fenBeforeAiMove);
  const moveObj = chess.move({
    from: aiUci.slice(0, 2),
    to:   aiUci.slice(2, 4),
    promotion: aiUci[4] as any,
  });
  if (!moveObj) return { headline: 'I made a move.', detail: '' };

  const myPiece = pn(moveObj.piece);

  if (chess.isCheckmate()) {
    return {
      headline: `I played ${moveObj.san} — checkmate.`,
      detail: 'The king is in check with no way to escape. Game over.',
    };
  }

  if (moveObj.flags.includes('k') || moveObj.flags.includes('q')) {
    const side = moveObj.flags.includes('k') ? 'kingside' : 'queenside';
    return {
      headline: `I castled ${side}.`,
      detail: `Notice: castling puts the king behind a wall of pawns and brings the rook toward the center. Try to castle within the first 10–15 moves.`,
    };
  }

  if (chess.inCheck()) {
    const fork = countAttackedPieces(chess, moveObj.to);
    let detail = `Notice: your king is now in check — you must respond by moving the king, blocking, or capturing my ${myPiece}.`;
    if (fork >= 2) {
      detail += ` My ${myPiece} also attacks ${fork - 1} other piece${fork > 2 ? 's' : ''} — a fork combined with check is very hard to defend!`;
    }
    return { headline: `I played ${moveObj.san}, giving check!`, detail };
  }

  if (moveObj.captured) {
    const capturedName = pn(moveObj.captured);
    const myVal    = VAL[moveObj.piece] ?? 0;
    const theirVal = VAL[moveObj.captured] ?? 0;
    let detail: string;
    if (theirVal > myVal) {
      detail = `Notice: I won material — I traded my ${myPiece} (${myVal} pt${myVal === 1 ? '' : 's'}) for your ${capturedName} (${theirVal} pt${theirVal === 1 ? '' : 's'}). When a piece is unprotected, it can be captured for a gain.`;
    } else if (theirVal === myVal) {
      detail = `I made an equal exchange. Equal trades are often fine, but consider which player's remaining pieces are better placed.`;
    } else {
      detail = `I captured your ${capturedName} for a positional reason even though it's a less-valuable piece.`;
    }
    const fork = countAttackedPieces(chess, moveObj.to);
    if (fork >= 2) detail += ` Notice also: my ${myPiece} on ${moveObj.to} now threatens ${fork} of your pieces — a fork!`;
    return { headline: `I captured your ${capturedName} with ${moveObj.san}.`, detail };
  }

  // Quiet move
  const fork = countAttackedPieces(chess, moveObj.to);
  if (fork >= 2) {
    return {
      headline: `I played ${moveObj.san}, creating a fork!`,
      detail: `Notice: my ${myPiece} on ${moveObj.to} now attacks ${fork} of your pieces simultaneously. When facing a fork you can usually save only one — try to spot forks before they happen.`,
    };
  }
  if (fork === 1) {
    return {
      headline: `I played ${moveObj.san}.`,
      detail: `My ${myPiece} now threatens one of your pieces. Make sure it's protected or move it to safety.`,
    };
  }
  if ((moveObj.piece === 'n' || moveObj.piece === 'b') && chess.history().length <= 20) {
    return {
      headline: `I developed my ${myPiece} to ${moveObj.to}.`,
      detail: `In the opening, developing pieces quickly gives them more influence over the board. Central squares — d and e files — are especially valuable.`,
    };
  }
  return {
    headline: `I played ${moveObj.san}.`,
    detail: `I'm improving my ${myPiece}'s position, giving it more scope over the board.`,
  };
}
