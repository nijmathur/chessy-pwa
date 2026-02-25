export interface LessonVariant {
  fen: string;
  focus: string;
  answer: string; // UCI string e.g. "a1a8"
}

export interface Lesson {
  category: string;
  icon: string;
  title: string;
  kind: 'explore' | 'task';
  desc: string;
  // Explore lessons have a single position:
  fen?: string;
  focus?: string;
  // Task lessons have randomised variants:
  variants?: LessonVariant[];
}

export const LESSONS: Lesson[] = [
  // ── Piece Movement ─────────────────────────────────────────────────────────
  {
    category: 'Piece Movement', icon: '♙',
    title: 'Pawn: Moving Forward',
    fen: '7k/8/8/8/8/8/4P3/7K w - - 0 1',
    focus: 'e2', kind: 'explore',
    desc: "The pawn is your army's foot soldier — simple but vital.\n\n" +
          "  • A pawn moves straight forward one square at a time.\n" +
          "  • On its very first move it may advance two squares.\n" +
          "  • Pawns can never move backward.\n\n" +
          "The green dots show all the squares the pawn can reach.\n" +
          "Click one to try it!",
  },
  {
    category: 'Piece Movement', icon: '♙',
    title: 'Pawn: Capturing',
    fen: '7k/8/8/8/8/3p1p2/4P3/7K w - - 0 1',
    focus: 'e2', kind: 'explore',
    desc: "Pawns attack differently from how they move.\n\n" +
          "  • A pawn captures one square diagonally forward.\n" +
          "  • It cannot capture straight ahead — that square must be empty.\n" +
          "  • It cannot move diagonally unless there is an enemy to capture.\n\n" +
          "Two enemy pawns sit diagonally ahead. You can capture either one,\n" +
          "or simply advance forward.\n\n" +
          "Click any green square to continue.",
  },
  {
    category: 'Piece Movement', icon: '♘',
    title: 'Knight: The L-Shape',
    fen: '7k/8/8/8/4N3/8/8/7K w - - 0 1',
    focus: 'e4', kind: 'explore',
    desc: "The knight is the trickiest piece — it jumps!\n\n" +
          "  • The knight moves in an 'L': two squares in one direction,\n" +
          "    then one square to the side (or vice-versa).\n" +
          "  • It is the ONLY piece that can jump over other pieces.\n" +
          "  • From the centre it can reach up to 8 squares.\n\n" +
          "Notice the eight green dots forming a ring around the knight.\n" +
          "Click any one to jump there.",
  },
  {
    category: 'Piece Movement', icon: '♗',
    title: 'Bishop: The Diagonal',
    fen: '7k/8/8/8/4B3/8/8/7K w - - 0 1',
    focus: 'e4', kind: 'explore',
    desc: "The bishop glides silently along the diagonals.\n\n" +
          "  • A bishop moves any number of squares diagonally.\n" +
          "  • It can never change the colour of square it stands on.\n" +
          "  • Each side has two bishops — one light-squared, one dark-squared.\n\n" +
          "The bishop on e4 controls both diagonal directions across the whole board.\n" +
          "Click any green square to move it.",
  },
  {
    category: 'Piece Movement', icon: '♖',
    title: 'Rook: Ranks & Files',
    fen: '7k/8/8/8/4R3/8/8/7K w - - 0 1',
    focus: 'e4', kind: 'explore',
    desc: "The rook charges along straight lines.\n\n" +
          "  • A rook moves any number of squares horizontally or vertically.\n" +
          "  • It cannot jump over other pieces.\n" +
          "  • Two rooks working together can be devastating — they cover\n" +
          "    entire ranks and files simultaneously.\n\n" +
          "Click any green square to move the rook.",
  },
  {
    category: 'Piece Movement', icon: '♕',
    title: 'Queen: The Powerhouse',
    fen: '7k/8/8/8/4Q3/8/8/7K w - - 0 1',
    focus: 'e4', kind: 'explore',
    desc: "The queen is the most powerful piece on the board.\n\n" +
          "  • The queen combines the rook and the bishop: it moves any\n" +
          "    number of squares in any direction — straight or diagonal.\n" +
          "  • From e4 on an empty board the queen reaches 27 squares!\n" +
          "  • Despite her power, never rush the queen out early —\n" +
          "    she can be chased and you'll lose time.\n\n" +
          "Click any green square to move the queen.",
  },
  {
    category: 'Piece Movement', icon: '♔',
    title: 'King: One Step at a Time',
    fen: '7k/8/6K1/8/8/8/8/8 w - - 0 1',
    focus: 'g6', kind: 'explore',
    desc: "The king is the most important piece — losing it means losing the game.\n\n" +
          "  • The king moves exactly one square in any direction:\n" +
          "    horizontally, vertically, or diagonally.\n" +
          "  • The king can NEVER move into a square attacked by an enemy piece.\n" +
          "  • Kings may never stand adjacent to each other.\n\n" +
          "Click any green square to move the king.",
  },
  // ── Special Moves ───────────────────────────────────────────────────────────
  {
    category: 'Special Moves', icon: '♙',
    title: 'En Passant',
    fen: '7k/8/8/3pP3/8/8/8/7K w - d6 0 1',
    focus: 'e5', kind: 'explore',
    desc: "En passant is a special pawn capture — use it or lose it!\n\n" +
          "  • When an enemy pawn advances two squares from its starting rank\n" +
          "    and lands beside your pawn, you may capture it as if it had\n" +
          "    moved only one square.\n" +
          "  • The captured pawn is removed even though your pawn moves\n" +
          "    to the empty square behind it.\n" +
          "  • This capture is only legal on the very next move.\n\n" +
          "The black pawn just rushed from d7 to d5.\n" +
          "Click d6 to capture it en passant!",
  },
  {
    category: 'Special Moves', icon: '♙',
    title: 'Pawn Promotion',
    fen: '6k1/4P3/8/8/8/8/8/6K1 w - - 0 1',
    focus: 'e7', kind: 'explore',
    desc: "When a pawn reaches the far end of the board, it is promoted!\n\n" +
          "  • A pawn that reaches rank 8 (White) or rank 1 (Black) must\n" +
          "    immediately be replaced by a queen, rook, bishop, or knight.\n" +
          "  • Promoting to a queen is almost always best — this is called\n" +
          "    'queening' the pawn.\n" +
          "  • You can even promote to a knight to deliver a surprise check!\n\n" +
          "Move the pawn to e8. A dialog will let you choose your new piece.",
  },
  {
    category: 'Special Moves', icon: '♔',
    title: 'Castling',
    fen: '4k3/8/8/8/8/8/8/4K2R w KQ - 0 1',
    focus: 'e1', kind: 'explore',
    desc: "Castling is the only move where two pieces move at once.\n\n" +
          "  • The king moves two squares toward a rook, and that rook leaps\n" +
          "    to the other side of the king.\n" +
          "  • Kingside castling (O-O): king goes e1→g1, rook h1→f1.\n" +
          "  • Castling is only legal when:\n" +
          "    – Neither the king nor rook has previously moved\n" +
          "    – No pieces stand between them\n" +
          "    – The king is not in check, and does not pass through or\n" +
          "      land on an attacked square\n\n" +
          "Click g1 to castle kingside.",
  },
  // ── Tactics ─────────────────────────────────────────────────────────────────
  {
    category: 'Tactics', icon: '⚔',
    title: 'Delivering Check',
    kind: 'task',
    desc: "Check means the king is under direct attack!\n\n" +
          "  • When your piece attacks the enemy king, it is in check.\n" +
          "  • The opponent MUST respond to check — by moving the king,\n" +
          "    blocking with another piece, or capturing the attacker.\n" +
          "  • You cannot make any move that leaves your OWN king in check.\n\n" +
          "Find the move that puts the black king in check!",
    variants: [
      { fen: '4k3/8/8/8/8/8/8/R3K3 w - - 0 1', focus: 'a1', answer: 'a1a8' },
      { fen: 'k7/8/8/8/8/8/8/4K2R w - - 0 1',  focus: 'h1', answer: 'h1h8' },
      { fen: '3k4/8/8/8/8/8/8/4KQ2 w - - 0 1', focus: 'f1', answer: 'f1f8' },
    ],
  },
  {
    category: 'Tactics', icon: '♘',
    title: 'Knight Fork',
    kind: 'task',
    desc: "A fork attacks two enemy pieces at the same time!\n\n" +
          "  • When one piece attacks two (or more) enemy pieces simultaneously,\n" +
          "    the opponent can usually only save one of them.\n" +
          "  • The knight is the best fork piece because its L-shape is\n" +
          "    hard to see coming and it cannot be blocked.\n\n" +
          "Find the knight move that forks two black pieces at once!",
    variants: [
      { fen: '8/2q1k3/8/8/1N6/8/8/4K3 w - - 0 1', focus: 'b4', answer: 'b4d5' },
      { fen: '3r4/4k3/8/8/1N6/8/8/4K3 w - - 0 1', focus: 'b4', answer: 'b4c6' },
      { fen: '8/3k4/8/8/2q5/5N2/8/4K3 w - - 0 1', focus: 'f3', answer: 'f3e5' },
    ],
  },
  {
    category: 'Tactics', icon: '♚',
    title: 'Checkmate in 1',
    kind: 'task',
    desc: "Checkmate ends the game — the king is attacked and cannot escape!\n\n" +
          "  • Checkmate means the king is in check AND has no legal move\n" +
          "    to escape: it cannot move away, block, or capture the attacker.\n" +
          "  • The player who delivers checkmate wins immediately.\n\n" +
          "Find the move that delivers checkmate in one!",
    variants: [
      { fen: '7k/R7/7K/8/8/8/8/8 w - - 0 1',       focus: 'a7', answer: 'a7a8' },
      { fen: '6k1/5ppp/8/8/8/8/8/3QK3 w - - 0 1',  focus: 'd1', answer: 'd1d8' },
      { fen: '6k1/8/6KQ/8/8/8/8/7R w - - 0 1',     focus: 'h6', answer: 'h6h8' },
    ],
  },
  // ── Tactics II ──────────────────────────────────────────────────────────────
  {
    category: 'Tactics II', icon: '📌',
    title: 'Tactics: The Pin',
    kind: 'task',
    desc: "A pin stops a piece from moving — because doing so would expose\n" +
          "something more valuable behind it.\n\n" +
          "  • An absolute pin: the pinned piece is shielding the king.\n" +
          "    It CANNOT legally move at all.\n" +
          "  • A relative pin: the pinned piece shields a valuable piece\n" +
          "    (like the queen). Moving it is legal but very costly.\n\n" +
          "Find the pin — move your bishop to immobilise the knight!",
    variants: [
      { fen: '4k3/8/2n5/8/8/3B4/8/4K3 w - - 0 1', focus: 'd3', answer: 'd3b5' },
      { fen: '1k6/2n5/8/8/8/2B5/8/4K3 w - - 0 1',  focus: 'c3', answer: 'c3e5' },
      { fen: '7k/6n1/8/4B3/8/8/8/4K3 w - - 0 1',   focus: 'e5', answer: 'e5f6' },
    ],
  },
  {
    category: 'Tactics II', icon: '⚡',
    title: 'Tactics: The Skewer',
    kind: 'task',
    desc: "A skewer is like a reversed pin — the more valuable piece is attacked\n" +
          "first and must move, leaving the piece behind it to be captured.\n\n" +
          "  • Attack a high-value piece (king or queen) along a line.\n" +
          "  • When it moves out of danger, the weaker piece behind it is\n" +
          "    left unprotected and can be taken.\n\n" +
          "Find the skewer — attack the king and win the piece behind it!",
    variants: [
      { fen: '3k3q/8/8/8/8/8/8/R3K3 w - - 0 1', focus: 'a1', answer: 'a1a8' },
      { fen: '3k3r/8/8/8/8/8/8/Q3K3 w - - 0 1', focus: 'a1', answer: 'a1a8' },
      { fen: 'q3k3/8/8/8/8/8/8/4K2R w - - 0 1', focus: 'h1', answer: 'h1h8' },
    ],
  },
  {
    category: 'Tactics II', icon: '💡',
    title: 'Tactics: Discovered Check',
    kind: 'task',
    desc: "A discovered check occurs when a piece moves away, uncovering\n" +
          "an attack on the enemy king by the piece behind it.\n\n" +
          "  • The moving piece acts as a 'blocker' — once it steps aside,\n" +
          "    the second piece delivers check automatically.\n" +
          "  • The moving piece can often make a threat of its own at the\n" +
          "    same time, creating a double threat the opponent can't answer.\n\n" +
          "Move the blocking piece off the line to reveal a discovered check!",
    variants: [
      { fen: '3k4/8/8/8/3B4/8/8/3R1K2 w - - 0 1', focus: 'd4', answer: 'd4e5' },
      { fen: '3k4/8/8/8/8/8/3B4/3R1K2 w - - 0 1', focus: 'd2', answer: 'd2e3' },
      { fen: '3k4/8/8/8/3N4/8/8/3R1K2 w - - 0 1', focus: 'd4', answer: 'd4e6' },
    ],
  },
  {
    category: 'Tactics II', icon: '🔍',
    title: 'Tactics: Discovered Attack',
    kind: 'task',
    desc: "A discovered attack is like a discovered check — but instead of\n" +
          "uncovering an attack on the king, it uncovers an attack on any\n" +
          "valuable piece.\n\n" +
          "  • Move one piece out of the way to reveal a hidden attack\n" +
          "    by the piece behind it.\n" +
          "  • The moving piece can threaten something itself, creating\n" +
          "    two threats at once — a powerful double attack.\n\n" +
          "Find the discovered attack — move the blocking piece to reveal the rook!",
    variants: [
      { fen: '3q3k/8/8/8/8/3B4/8/3R1K2 w - - 0 1', focus: 'd3', answer: 'd3e4' },
      { fen: '3q3k/8/8/8/8/8/3B4/3R1K2 w - - 0 1', focus: 'd2', answer: 'd2e3' },
      { fen: '3q3k/8/8/8/3N4/8/8/3R1K2 w - - 0 1', focus: 'd4', answer: 'd4e6' },
    ],
  },
];
