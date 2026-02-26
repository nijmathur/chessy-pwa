import { navigate } from '../main';
import { STRATEGIES, type StrategyCategory } from '../strategies';

export function tutorStrategyScreen(root: HTMLElement): () => void {
  // Group strategies by category preserving insertion order
  const groups = new Map<StrategyCategory, typeof STRATEGIES>();
  for (const s of STRATEGIES) {
    const arr = groups.get(s.category) ?? [];
    arr.push(s);
    groups.set(s.category, arr);
  }

  let html = `
    <div class="lessons-screen">
      <div class="lessons-title">🎓 Tutor Mode</div>
      <p class="start-subtitle" style="text-align:center;margin-bottom:4px;">
        Choose a strategy to practise, or jump straight in.
      </p>
      <button class="lessons-back" id="ts-back-btn">← Back to Menu</button>

      <div class="ts-free-row">
        <button class="btn-primary  ts-free-btn" data-color="w">▶&nbsp; Free Play (White)</button>
        <button class="btn-secondary ts-free-btn" data-color="b">▶&nbsp; Free Play (Black)</button>
      </div>

      <div class="lesson-category" style="margin-top:16px;">— or choose a strategy —</div>
  `;

  const categoryLabels: Record<StrategyCategory, string> = {
    Opening:    '♟ Opening Strategy',
    Middlegame: '⚔ Middlegame Strategy',
    Endgame:    '👑 Endgame Strategy',
  };

  for (const [cat, strategies] of groups) {
    html += `<div class="lesson-category">${categoryLabels[cat]}</div>`;
    html += `<div class="lessons-grid">`;
    for (const s of strategies) {
      html += `
        <button class="lesson-card ts-strategy-card" data-id="${s.id}">
          <span class="lesson-card-icon">${s.icon}</span>
          <span class="lesson-card-title">${s.title}</span>
          <span class="lesson-card-kind ts-short-desc">${s.shortDesc}</span>
        </button>`;
    }
    html += `</div>`;
  }

  html += `</div>`;
  root.innerHTML = html;

  root.querySelector('#ts-back-btn')!.addEventListener('click', () => {
    navigate({ to: 'start' });
  });

  root.querySelectorAll('.ts-free-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = (btn as HTMLElement).dataset.color as 'w' | 'b';
      navigate({ to: 'tutor', params: { playerColor: color } });
    });
  });

  root.querySelectorAll('.ts-strategy-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = (card as HTMLElement).dataset.id!;
      navigate({ to: 'tutor', params: { playerColor: 'w', strategyId: id } });
    });
  });

  return () => {};
}
