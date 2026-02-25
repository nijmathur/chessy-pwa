import { Chess } from 'chess.js';
import { computeAiMove } from '../engine/ai';
import { minimax } from '../engine/minimax';

interface EvalRequest {
  fenBeforeMove: string;
  playerUciMove: string;
  playerColor: 'w' | 'b';
}

interface EvalResponse {
  betterMove: string | null;
  diff: number;
}

self.onmessage = (e: MessageEvent<EvalRequest>) => {
  const { fenBeforeMove, playerUciMove, playerColor } = e.data;

  const bestUci = computeAiMove(fenBeforeMove, 'Medium', playerColor);
  if (!bestUci) {
    self.postMessage({ betterMove: null, diff: 0 } as EvalResponse);
    return;
  }

  // Same move?
  if (bestUci.slice(0, 2) === playerUciMove.slice(0, 2) &&
      bestUci.slice(2, 4) === playerUciMove.slice(2, 4)) {
    self.postMessage({ betterMove: null, diff: 0 } as EvalResponse);
    return;
  }

  const isWhite = playerColor === 'w';
  const evalDepth = 2;

  function mmScore(uci: string): number {
    const b = new Chess(fenBeforeMove);
    b.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] as any });
    const raw = minimax(b, evalDepth, -999_999, 999_999, !isWhite);
    return isWhite ? raw : -raw;
  }

  const pScore = mmScore(playerUciMove);
  const bScore = mmScore(bestUci);
  const diff   = bScore - pScore;

  self.postMessage({ betterMove: diff > 30 ? bestUci : null, diff } as EvalResponse);
};
