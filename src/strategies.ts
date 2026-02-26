export type StrategyCategory = 'Opening' | 'Middlegame' | 'Endgame';

export interface Strategy {
  id: string;
  category: StrategyCategory;
  icon: string;
  title: string;
  shortDesc: string;      // one-liner on the selection card
  thematicFen: string;    // starting position for the tutor game
  tips: string[];         // 4 tips cycled during play (one per turn)
}

const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const STRATEGIES: Strategy[] = [

  // ── Opening ──────────────────────────────────────────────────────────────
  {
    id: 'control-center',
    category: 'Opening',
    icon: '🎯',
    title: 'Control the Center',
    shortDesc: 'Open with e4 or d4 and fight for the four central squares.',
    thematicFen: START,
    tips: [
      'Open with 1.e4 or 1.d4 to stake a claim in the center.',
      'The center squares d4, d5, e4, e5 are the most valuable on the board.',
      'A strong pawn center restricts your opponent\'s pieces.',
      'After establishing center pawns, develop your pieces to support them.',
    ],
  },
  {
    id: 'develop-pieces',
    category: 'Opening',
    icon: '⚡',
    title: 'Develop Your Pieces',
    shortDesc: 'Get every piece into play — knights before bishops, no repeats.',
    thematicFen: START,
    tips: [
      'Every opening move should bring a new piece into play.',
      'Develop knights before bishops — knights have fewer good squares.',
      'Don\'t move the same piece twice before all pieces are developed.',
      'Avoid bringing your queen out early — she\'ll be chased and you\'ll lose tempo.',
    ],
  },
  {
    id: 'castle-king-safety',
    category: 'Opening',
    icon: '🛡',
    title: 'Castle for King Safety',
    shortDesc: 'Tuck your king behind the pawn wall and activate a rook.',
    thematicFen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    tips: [
      'Castle within the first 10 moves — the center can open up quickly.',
      'Castling connects your rooks and brings one toward active play.',
      'After castling, keep your king\'s pawn shield intact.',
      'Queenside castling is riskier — the king has fewer pawns in front of it.',
    ],
  },
  {
    id: 'italian-game',
    category: 'Opening',
    icon: '♞',
    title: 'The Italian Game',
    shortDesc: 'Play e4, Nf3, Bc4 — target f7 and build a fast center.',
    thematicFen: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3',
    tips: [
      'Play Bc4 next — it targets the f7 square, defended only by the Black king.',
      'Black\'s best replies are 3…Bc5 (Giuoco Piano) or 3…Nf6 (Two Knights).',
      'After Bc4, plan c3 and d4 to build a strong pawn center.',
      'Castle kingside early, then activate both rooks on the central files.',
    ],
  },
  {
    id: 'queens-gambit',
    category: 'Opening',
    icon: '♟',
    title: "The Queen's Gambit",
    shortDesc: 'Offer a pawn with 1.d4 d5 2.c4 to dominate the center.',
    thematicFen: START,
    tips: [
      'Start with 1.d4, then meet 1…d5 with 2.c4 — offering a pawn.',
      'If Black takes on c4, you recapture later with a strong central pawn.',
      'If Black declines, push e4 to establish a full pawn center.',
      'Develop your bishop to g5 or f4 to pressure the d5 pawn.',
    ],
  },

  // ── Middlegame ────────────────────────────────────────────────────────────
  {
    id: 'outpost-squares',
    category: 'Middlegame',
    icon: '🏇',
    title: 'Outpost Squares',
    shortDesc: 'Plant a knight on a square no enemy pawn can ever attack.',
    thematicFen: 'r2qr1k1/pp3ppp/2p2n2/8/2PP4/2N1B3/PP3PPP/R2QR1K1 w - - 0 1',
    tips: [
      'An outpost is a square that no enemy pawn can attack.',
      'A knight on d5 or e5 controls 6 squares — nearly unbeatable.',
      'First trade away the pawn that guards the target outpost square.',
      'Once your piece reaches the outpost, build all your other threats around it.',
    ],
  },
  {
    id: 'open-files-rooks',
    category: 'Middlegame',
    icon: '🗡',
    title: 'Open Files & Rooks',
    shortDesc: 'Double your rooks on open files to invade enemy territory.',
    thematicFen: 'r4rk1/pp3ppp/2p3b1/3p4/3P4/2PB2B1/PP3PPP/R3R1K1 w - - 0 1',
    tips: [
      'Place rooks on open files — files with no pawns blocking them.',
      'Double your rooks on the same open file — they support each other.',
      'A rook on the 7th rank attacks pawns still on their starting squares.',
      'Connect your rooks by clearing pieces off the back rank after castling.',
    ],
  },
  {
    id: 'weak-squares',
    category: 'Middlegame',
    icon: '⚠',
    title: 'Weak Squares & Holes',
    shortDesc: "Exploit squares the opponent's pawns can never defend again.",
    thematicFen: 'r1bqr1k1/pp3ppp/2pp1n2/4p3/4P3/2NP1N2/PPP2PPP/R1BQR1K1 w - - 0 1',
    tips: [
      'A hole is a square no enemy pawn can ever attack again.',
      'Plant a knight on a hole — it cannot be driven away by pawns.',
      'Holes are created when pawns advance and leave squares unguarded.',
      'Look for your opponent\'s backward pawns — they often sit on weak squares.',
    ],
  },
  {
    id: 'piece-activity',
    category: 'Middlegame',
    icon: '🔄',
    title: 'Piece Activity',
    shortDesc: "Every move, ask: which piece is worst placed and how do I improve it?",
    thematicFen: 'r1bqr1k1/1p3ppp/p1pp1n2/4p3/2B1P3/2N2N2/PPP2PPP/R1BQR1K1 w - - 0 1',
    tips: [
      'Active pieces control more squares and create more threats.',
      '"A knight on the rim is dim" — edge knights are far weaker than central ones.',
      'A "bad bishop" is blocked by its own pawns — trade it or reposition it.',
      'Every move, ask: which of my pieces is least active? How can I improve it?',
    ],
  },
  {
    id: 'pawn-structure',
    category: 'Middlegame',
    icon: '♟',
    title: 'Pawn Structure',
    shortDesc: 'Avoid weak pawns, create passed pawns, and use your structure to plan.',
    thematicFen: 'r1bqr1k1/pp3ppp/2p5/3p4/3P4/2PB4/PP3PPP/R1BQR1K1 w - - 0 1',
    tips: [
      'Every pawn move is permanent — think before you push.',
      'A passed pawn (no enemy pawns in front) must be advanced relentlessly.',
      'Doubled pawns on the same file cannot protect each other.',
      'An isolated pawn has no friendly pawns on adjacent files — it\'s a long-term target.',
    ],
  },

  // ── Endgame ───────────────────────────────────────────────────────────────
  {
    id: 'activate-king',
    category: 'Endgame',
    icon: '👑',
    title: 'Activate Your King',
    shortDesc: 'March your king to the center — in the endgame it is a fighting piece.',
    thematicFen: '8/5pk1/6p1/5P2/8/6K1/8/8 w - - 0 1',
    tips: [
      'In the endgame the king becomes a powerful fighting piece.',
      'Centralise your king as soon as the queens come off the board.',
      'A king on e4 or d4 controls 8 squares and participates actively.',
      'The player who activates their king first usually wins the endgame.',
    ],
  },
  {
    id: 'opposition',
    category: 'Endgame',
    icon: '⚔',
    title: 'The Opposition',
    shortDesc: "Force the opponent's king to give ground with direct opposition.",
    thematicFen: '8/8/4k3/8/8/4K3/8/8 w - - 0 1',
    tips: [
      'Opposition: two kings face each other with one square between them.',
      'The player who does NOT have to move holds the opposition.',
      'The player to move must give ground — a key endgame weapon.',
      'Distant opposition: an even number of squares between kings on the same file.',
    ],
  },
  {
    id: 'advance-passed-pawn',
    category: 'Endgame',
    icon: '🚀',
    title: 'Advance the Passed Pawn',
    shortDesc: 'Push your passed pawn before the opponent can blockade it.',
    thematicFen: '8/8/1k6/4P3/1K6/8/8/8 w - - 0 1',
    tips: [
      '"A passed pawn must be pushed!" — Nimzowitsch.',
      'Use your king to escort the pawn when the enemy king gets close.',
      'The "rule of the square": if the enemy king can\'t enter the pawn\'s diagonal square, it will queen.',
      'Keep your king in front of or beside the pawn to lead it home.',
    ],
  },
  {
    id: 'rook-behind-pawn',
    category: 'Endgame',
    icon: '♜',
    title: 'Rook Behind the Passed Pawn',
    shortDesc: "Tarrasch's Rule: rooks belong behind passed pawns — yours and the enemy's.",
    thematicFen: '8/8/1k6/8/4P3/8/1K6/4R3 w - - 0 1',
    tips: [
      '"Rooks belong behind passed pawns." — Tarrasch.',
      'A rook behind your passed pawn gains power as the pawn advances.',
      'A rook behind the enemy\'s passed pawn attacks and restrains it.',
      'A rook in front of a passed pawn is blocked — always place it behind.',
    ],
  },
  {
    id: 'king-pawn-race',
    category: 'Endgame',
    icon: '🏆',
    title: 'King & Pawn Race',
    shortDesc: 'Count tempos precisely — every single move matters in a pawn race.',
    thematicFen: '8/8/8/8/8/8/1P6/1K2k3 w - - 0 1',
    tips: [
      'Push your pawn early when the enemy king is far away.',
      'Use your king to escort the pawn when the enemy king gets close.',
      'The "rule of the square" tells you whether the enemy king can catch the pawn.',
      'Count tempos: the player who queens first usually wins.',
    ],
  },
];
