/**
 * Convert a square name (e.g. "e4") to { col, row }.
 * col: 0=a … 7=h
 * row: 0=rank1 … 7=rank8
 */
export function squareToColRow(sq: string): { col: number; row: number } {
  return {
    col: sq.charCodeAt(0) - 97,
    row: parseInt(sq[1]) - 1,
  };
}

/**
 * Convert { col, row } to the top-left pixel of that square.
 * playerColor determines board orientation: 'w' = white at bottom, 'b' = black at bottom.
 */
export function colRowToPixel(
  col: number,
  row: number,
  sqSize: number,
  playerColor: 'w' | 'b',
): { x: number; y: number } {
  if (playerColor === 'w') {
    return { x: col * sqSize, y: (7 - row) * sqSize };
  }
  return { x: (7 - col) * sqSize, y: row * sqSize };
}

/**
 * Convert a CSS-pixel position (relative to canvas top-left) to a square name.
 * Returns '' if the position is outside the board.
 */
export function pixelToSquare(
  px: number,
  py: number,
  sqSize: number,
  playerColor: 'w' | 'b',
): string {
  let col: number, row: number;
  if (playerColor === 'w') {
    col = Math.floor(px / sqSize);
    row = 7 - Math.floor(py / sqSize);
  } else {
    col = 7 - Math.floor(px / sqSize);
    row = Math.floor(py / sqSize);
  }
  if (col < 0 || col > 7 || row < 0 || row > 7) return '';
  return String.fromCharCode(97 + col) + (row + 1);
}
