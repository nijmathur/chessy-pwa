import { navigate } from '../main';
import type { Difficulty } from '../engine/ai';

export function startScreen(root: HTMLElement): () => void {
  let playerColor: 'w' | 'b' = 'w';
  let difficulty: Difficulty = 'Medium';

  root.innerHTML = `
    <div class="start-screen">
      <div class="start-title">♛&nbsp;&nbsp;Chessy&nbsp;&nbsp;♛</div>
      <div class="start-subtitle">Play chess against the computer</div>

      <div class="start-section-label">Play as:</div>
      <div class="option-group" id="color-group">
        <button class="option-btn selected" data-color="w">♔ White</button>
        <button class="option-btn" data-color="b">♚ Black</button>
      </div>

      <div class="start-section-label">Difficulty:</div>
      <div class="option-group" id="diff-group">
        <button class="option-btn" data-diff="Beginner">Beginner</button>
        <button class="option-btn" data-diff="Easy">Easy</button>
        <button class="option-btn selected" data-diff="Medium">Medium</button>
        <button class="option-btn" data-diff="Hard">Hard</button>
        <button class="option-btn" data-diff="Expert">Expert</button>
      </div>

      <div class="start-actions">
        <button class="btn-primary" id="start-btn">▶&nbsp; Start Game</button>
        <button class="btn-secondary" id="tutor-btn" style="background:#1565C0;color:#fff;">
          🎓&nbsp; Tutor Mode
        </button>
        <button class="btn-secondary" id="learn-btn" style="background:#27AE60;color:#000;">
          📚&nbsp; Learn Chess
        </button>
      </div>

      <div id="ios-hint" style="display:none;margin-top:20px;font-size:11px;color:#888;text-align:center;max-width:260px;">
        📱 Tip: Tap Share → "Add to Home Screen" to install Chessy and play offline!
      </div>
    </div>
  `;

  // iOS install hint
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = ('standalone' in navigator) && (navigator as any).standalone;
  if (isIos && !isStandalone) {
    (root.querySelector('#ios-hint') as HTMLElement).style.display = 'block';
  }

  // Color selection
  root.querySelectorAll('[data-color]').forEach(btn => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('[data-color]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      playerColor = (btn as HTMLElement).dataset.color as 'w' | 'b';
    });
  });

  // Difficulty selection
  root.querySelectorAll('[data-diff]').forEach(btn => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('[data-diff]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      difficulty = (btn as HTMLElement).dataset.diff as Difficulty;
    });
  });

  root.querySelector('#start-btn')!.addEventListener('click', () => {
    navigate({ to: 'game', params: { playerColor, difficulty } });
  });

  root.querySelector('#tutor-btn')!.addEventListener('click', () => {
    navigate({ to: 'tutor', params: { playerColor } });
  });

  root.querySelector('#learn-btn')!.addEventListener('click', () => {
    navigate({ to: 'lessons' });
  });

  return () => {}; // no cleanup needed
}
