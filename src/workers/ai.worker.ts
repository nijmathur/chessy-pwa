import { computeAiMove, type Difficulty } from '../engine/ai';

interface AiRequest {
  fen: string;
  difficulty: Difficulty;
  aiColor: 'w' | 'b';
}

self.onmessage = (e: MessageEvent<AiRequest>) => {
  const { fen, difficulty, aiColor } = e.data;
  const uciMove = computeAiMove(fen, difficulty, aiColor);
  self.postMessage({ uciMove });
};
