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

  // ── Opening Strategy ────────────────────────────────────────────────────────
  {
    category: 'Opening Strategy', icon: '🎯',
    title: 'Control the Center',
    fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
    focus: 'e4', kind: 'explore',
    desc: "The center — squares d4, d5, e4, e5 — is the most important part of\n" +
          "the board. Pieces placed in or near the center control more squares\n" +
          "and have more options than pieces stuck on the edge.\n\n" +
          "  • Open with 1.e4 or 1.d4 to stake a claim in the center.\n" +
          "  • Central pawns give your pieces room to develop and attack.\n" +
          "  • A strong center restricts your opponent's pieces.\n\n" +
          "White has played 1.e4 — one of the most popular first moves in chess.\n" +
          "The pawn on e4 controls d5 and f5, and opens lines for the bishop\n" +
          "and queen. Click the pawn to see its reach!",
  },
  {
    category: 'Opening Strategy', icon: '⚡',
    title: 'Develop Your Pieces',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    focus: 'f3', kind: 'explore',
    desc: "Development means getting your pieces off the back rank and into\n" +
          "active positions early in the game. Every move that brings a new\n" +
          "piece into play is a good opening move.\n\n" +
          "Golden development rules:\n" +
          "  • Develop knights before bishops (knights have fewer good squares).\n" +
          "  • Don't move the same piece twice before all pieces are developed.\n" +
          "  • Don't bring your queen out too early — she'll be chased away,\n" +
          "    wasting tempo.\n" +
          "  • Aim to castle within the first 10 moves.\n\n" +
          "After 1.e4 e5 2.Nf3 Nc6, both sides have developed a knight and\n" +
          "fought for the center. White's knight on f3 attacks e5 and controls\n" +
          "key central squares. Click it to see its reach.",
  },
  {
    category: 'Opening Strategy', icon: '🛡',
    title: 'Castle for King Safety',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 2 5',
    focus: 'e1', kind: 'explore',
    desc: "The king is vulnerable in the center — open files and diagonals make\n" +
          "it an easy target during the middlegame. Castling solves both problems\n" +
          "in a single move.\n\n" +
          "Why castle early?\n" +
          "  • Tucks the king safely behind a wall of pawns.\n" +
          "  • Connects your rooks so they can work together.\n" +
          "  • Brings the rook toward the center where it's most active.\n\n" +
          "Castling rules to remember:\n" +
          "  • Neither the king nor the chosen rook may have moved before.\n" +
          "  • No pieces can stand between them.\n" +
          "  • The king cannot be in check, pass through, or land on an\n" +
          "    attacked square.\n\n" +
          "White's king on e1 is still exposed — click g1 to see where it\n" +
          "would go after kingside castling.",
  },
  {
    category: 'Opening Strategy', icon: '♞',
    title: 'The Italian Game',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    focus: 'c4', kind: 'explore',
    desc: "The Italian Game (1.e4 e5 2.Nf3 Nc6 3.Bc4) is one of the oldest and\n" +
          "most popular openings — it has been played for over 500 years!\n\n" +
          "Why it works:\n" +
          "  • White controls the center with a pawn and a knight.\n" +
          "  • The bishop on c4 targets the weak f7 square (defended only by\n" +
          "    the black king).\n" +
          "  • White is ready to castle kingside next move.\n" +
          "  • Every piece developed so far has a clear purpose.\n\n" +
          "From c4, the bishop eyes f7 diagonally and is well placed for\n" +
          "middlegame play. Click it to see all the squares it controls.\n\n" +
          "Best reply for Black: 3…Bc5 (Giuoco Piano) or 3…Nf6 (Two Knights).",
  },
  {
    category: 'Opening Strategy', icon: '♟',
    title: "The Queen's Gambit",
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2',
    focus: 'c4', kind: 'explore',
    desc: "The Queen's Gambit (1.d4 d5 2.c4) is the most famous opening in\n" +
          "chess and has been played at the top level for over 200 years.\n\n" +
          "The idea:\n" +
          "  • White offers a pawn (c4) to lure Black's d5 pawn away from\n" +
          "    the center.\n" +
          "  • If Black captures (2…dxc4), White gets a strong center with\n" +
          "    an unopposed d4 pawn and can recapture later.\n" +
          "  • If Black declines (2…e6 or 2…c6), White keeps central pressure.\n\n" +
          "Key plans for White:\n" +
          "  • Develop bishops and knights rapidly.\n" +
          "  • Aim for e2-e4 to establish a full pawn center.\n" +
          "  • Use the c-file once the c-pawn moves.\n\n" +
          "Click the c4 pawn to see how it challenges Black's center.",
  },

  // ── Middlegame Strategy ─────────────────────────────────────────────────────
  {
    category: 'Middlegame Strategy', icon: '🏇',
    title: 'Outpost Squares',
    fen: 'r2qr1k1/pp3ppp/2p2n2/3N4/3PP3/2N5/PP3PPP/R1BQR1K1 w - - 0 1',
    focus: 'd5', kind: 'explore',
    desc: "An outpost is a square that cannot be attacked by any enemy pawn.\n" +
          "A piece — especially a knight — planted on an outpost becomes\n" +
          "an immovable thorn in your opponent's position.\n\n" +
          "Why outposts matter:\n" +
          "  • A knight on d5 or e5 controls huge amounts of space.\n" +
          "  • The opponent cannot use pawns to drive it away.\n" +
          "  • From d5 a knight attacks c7, e7, b4, f4, b6, and f6 — six squares!\n\n" +
          "How to create an outpost:\n" +
          "  • Advance a pawn to eliminate the enemy pawn that would normally\n" +
          "    guard the target square (e.g. trade away the c-pawn to remove\n" +
          "    the guard of d5).\n" +
          "  • Then manoeuvre your knight to that square.\n\n" +
          "The white knight on d5 is a model outpost — click it to see its reach.",
  },
  {
    category: 'Middlegame Strategy', icon: '🗡',
    title: 'Open Files & Rooks',
    fen: 'r4rk1/pp3ppp/2p3b1/3p4/3P4/2PB2B1/PP3PPP/R3R1K1 w - - 0 1',
    focus: 'e1', kind: 'explore',
    desc: "Rooks are powerful on open files — files with no pawns blocking them.\n" +
          "A rook on an open file controls every square along that file and can\n" +
          "invade deep into enemy territory.\n\n" +
          "Key rook principles:\n" +
          "  • Place rooks on open or half-open files (only one side's pawn missing).\n" +
          "  • Double your rooks on the same open file — they support each other.\n" +
          "  • Rooks belong on the 7th rank in the endgame (attacking pawns\n" +
          "    still on their starting squares).\n" +
          "  • Connect your rooks by castling and clearing the back rank.\n\n" +
          "The Tarrasch Rule: 'Rooks belong behind passed pawns' — your own\n" +
          "to help push them, the opponent's to slow them down.\n\n" +
          "The white rook on e1 controls the open e-file. Click it to see its power.",
  },
  {
    category: 'Middlegame Strategy', icon: '⚠',
    title: 'Weak Squares & Holes',
    fen: 'r1bqr1k1/pp3ppp/2pp1n2/4p3/4P3/2NP1N2/PPP2PPP/R1BQR1K1 w - - 0 1',
    focus: 'd5', kind: 'explore',
    desc: "A 'hole' or weak square is one that can never again be defended\n" +
          "by a pawn. Once a square becomes a hole, enemy pieces can occupy\n" +
          "it permanently.\n\n" +
          "How holes are created:\n" +
          "  • When you advance a pawn, it can no longer guard the squares\n" +
          "    it left behind.\n" +
          "  • If you push both the c-pawn and e-pawn, the d5 square becomes\n" +
          "    a permanent hole — no pawn can ever attack it again.\n\n" +
          "How to exploit holes:\n" +
          "  • Plant a knight on the hole — it cannot be driven away by pawns.\n" +
          "  • Use the hole as a base for launching attacks.\n\n" +
          "How to avoid creating holes:\n" +
          "  • Think carefully before advancing flank pawns.\n" +
          "  • Don't push pawns that leave important squares undefended.\n\n" +
          "The d5 square here is a hole for Black — no Black pawn can attack it.\n" +
          "White's knight would love to settle there permanently.",
  },
  {
    category: 'Middlegame Strategy', icon: '🔄',
    title: 'Piece Activity',
    fen: 'r1bqr1k1/1p3ppp/p1pp1n2/4p3/2B1P3/2N2N2/PPP2PPP/R1BQR1K1 w - - 0 1',
    focus: 'c4', kind: 'explore',
    desc: "Active pieces control more squares, create more threats, and win games.\n" +
          "A passive piece does nothing useful and is effectively fighting at a\n" +
          "disadvantage.\n\n" +
          "Ask yourself every move:\n" +
          "  • Which of my pieces is worst placed? How can I improve it?\n" +
          "  • Does this move put my piece on a square where it has future?\n" +
          "  • Am I creating threats, or just reacting to my opponent's?\n\n" +
          "Signs of passive pieces:\n" +
          "  • Pieces stuck behind your own pawns (especially the 'bad bishop').\n" +
          "  • Knights on the edge of the board ('a knight on the rim is dim').\n" +
          "  • Rooks with no open file to use.\n\n" +
          "Signs of active pieces:\n" +
          "  • Knights on central outposts.\n" +
          "  • Bishops on long open diagonals.\n" +
          "  • Rooks on open files or the 7th rank.\n\n" +
          "Click the bishop on c4 — it sits on an active diagonal aimed at f7.",
  },
  {
    category: 'Middlegame Strategy', icon: '♟',
    title: 'Pawn Structure',
    fen: 'r1bqr1k1/pp3ppp/2p5/3p4/3P4/2PB4/PP3PPP/R1BQR1K1 w - - 0 1',
    focus: 'd4', kind: 'explore',
    desc: "Pawns cannot move backward — every pawn move is permanent. Your\n" +
          "pawn structure shapes the entire game and determines which plans\n" +
          "are available to each side.\n\n" +
          "Key pawn structure concepts:\n" +
          "  • Passed pawn: no enemy pawn can block or capture it. Must be\n" +
          "    pushed — it's a potential queen!\n" +
          "  • Doubled pawns: two pawns on the same file. They can't protect\n" +
          "    each other and block one another.\n" +
          "  • Isolated pawn: no friendly pawns on adjacent files. Hard to\n" +
          "    defend because no pawn can guard it.\n" +
          "  • Backward pawn: can't advance because a pawn beside it hasn't\n" +
          "    advanced, leaving it vulnerable on its current square.\n" +
          "  • Pawn chain: pawns protecting each other diagonally. Attack\n" +
          "    the base of the chain to undermine it.\n\n" +
          "Think of your pawn structure as your long-term strategy — it tells\n" +
          "you where to put your pieces and what plans to follow.",
  },

  // ── Endgame Strategy ────────────────────────────────────────────────────────
  {
    category: 'Endgame Strategy', icon: '👑',
    title: 'Activate Your King',
    fen: '8/5pk1/6p1/5P2/8/6K1/8/8 w - - 0 1',
    focus: 'g3', kind: 'explore',
    desc: "In the middlegame the king hides. In the endgame the king fights!\n\n" +
          "Once most pieces are traded off, the king becomes a powerful piece.\n" +
          "You must march it toward the center to support your pawns and\n" +
          "attack the opponent's.\n\n" +
          "Key endgame king principles:\n" +
          "  • Centralise your king as soon as queens come off the board.\n" +
          "  • The king on e4 or d4 controls 8 squares and participates actively.\n" +
          "  • Use your king to escort passed pawns to promotion.\n" +
          "  • A king on the 6th rank in a pawn endgame is very powerful.\n\n" +
          "Common mistake: keeping the king passive on g1/g8 when pawns\n" +
          "are the only material left. The player who activates their king\n" +
          "first usually wins.\n\n" +
          "In this position, White's king on g3 needs to march toward the\n" +
          "center. Click it to see where it can go.",
  },
  {
    category: 'Endgame Strategy', icon: '⚔',
    title: 'The Opposition',
    fen: '8/8/8/4k3/8/4K3/8/8 w - - 0 1',
    focus: 'e3', kind: 'explore',
    desc: "The opposition is one of the most important concepts in king-and-pawn\n" +
          "endgames. Two kings are 'in opposition' when they face each other\n" +
          "with exactly one square between them.\n\n" +
          "  • The player who does NOT have to move has the opposition — a\n" +
          "    key positional advantage.\n" +
          "  • The player TO move must give ground, because stepping next to\n" +
          "    the enemy king is illegal.\n\n" +
          "Types of opposition:\n" +
          "  • Direct opposition: kings face each other on the same file or rank\n" +
          "    with one square between them.\n" +
          "  • Distant opposition: same idea but further apart (always an even\n" +
          "    number of squares between them).\n\n" +
          "Here the kings are on e3 and e5, two squares apart on the e-file.\n" +
          "It is White's turn — Black has the opposition. White must step aside.\n" +
          "Click the white king to see its limited options.",
  },
  {
    category: 'Endgame Strategy', icon: '🚀',
    title: 'Advance the Passed Pawn',
    kind: 'task',
    desc: "A passed pawn is a pawn with no enemy pawns in front of it on its\n" +
          "own file or the adjacent files. It can advance all the way to\n" +
          "promotion if left unopposed.\n\n" +
          "  • 'A passed pawn must be pushed!' — Nimzowitsch\n" +
          "  • Use your king to escort it — walk beside or in front of it.\n" +
          "  • The opponent must use their king to stop it, tying them down.\n\n" +
          "In this position White has a powerful passed pawn on e5 and the\n" +
          "Black king is far away on b6. Advance the pawn to increase the\n" +
          "threat and march toward queening!",
    variants: [
      { fen: '8/8/1k6/4P3/1K6/8/8/8 w - - 0 1', focus: 'e5', answer: 'e5e6' },
    ],
  },
  {
    category: 'Endgame Strategy', icon: '♜',
    title: 'Rook Behind the Passed Pawn',
    fen: '8/8/1k6/8/4P3/8/1K6/4R3 w - - 0 1',
    focus: 'e1', kind: 'explore',
    desc: "Tarrasch's Rule: 'Rooks belong behind passed pawns.'\n\n" +
          "This applies to both your own passed pawns and your opponent's:\n\n" +
          "  • Your own passed pawn: put your rook behind it. As the pawn\n" +
          "    advances, the rook's scope increases — it guards every square\n" +
          "    the pawn has left behind.\n" +
          "  • Enemy passed pawn: put your rook behind it. The rook attacks\n" +
          "    the pawn from the rear and becomes more active as the pawn moves.\n\n" +
          "Why this matters:\n" +
          "  • A rook in FRONT of a passed pawn is blocked by it.\n" +
          "  • A rook to the SIDE of a passed pawn loses effectiveness as the\n" +
          "    pawn advances and blocks the file.\n" +
          "  • A rook BEHIND a passed pawn gains power with every advance.\n\n" +
          "Here White's rook on e1 is correctly placed behind the e4 pawn.\n" +
          "Click the rook to see the entire e-file it commands.",
  },
  {
    category: 'Endgame Strategy', icon: '🏆',
    title: 'King & Pawn: Race to Queen',
    kind: 'task',
    desc: "King-and-pawn endgames are decided by tempo — every move counts.\n\n" +
          "Key principles:\n" +
          "  • Push your pawn early when the enemy king is far away.\n" +
          "  • Use your king to escort the pawn when the enemy king is close.\n" +
          "  • The 'rule of the square': if the enemy king cannot enter the\n" +
          "    square in front of the pawn (drawn diagonally from pawn to\n" +
          "    promotion square), the pawn will queen.\n\n" +
          "In this position the Black king is on e1, far from the b-pawn.\n" +
          "White's king is on b1 and the pawn is on b2. Advance the pawn\n" +
          "two squares immediately — the Black king cannot catch it in time!",
    variants: [
      { fen: '8/8/8/8/8/8/1P6/1K2k3 w - - 0 1', focus: 'b2', answer: 'b2b4' },
    ],
  },
];
