import { navigate } from '../main';
import { LESSONS } from '../lessons';

export function lessonsScreen(root: HTMLElement): () => void {
  // Group lessons by category
  const categories: Map<string, number[]> = new Map();
  LESSONS.forEach((lesson, i) => {
    const arr = categories.get(lesson.category) ?? [];
    arr.push(i);
    categories.set(lesson.category, arr);
  });

  let html = `
    <div class="lessons-screen">
      <div class="lessons-title">📚 Learn Chess</div>
      <button class="lessons-back" id="back-btn">← Back to Menu</button>
  `;

  for (const [category, indices] of categories) {
    html += `<div class="lesson-category">${category}</div>`;
    html += `<div class="lessons-grid">`;
    for (const i of indices) {
      const lesson = LESSONS[i];
      const kindLabel = lesson.kind === 'task' ? 'Puzzle' : 'Explore';
      html += `
        <button class="lesson-card" data-index="${i}">
          <span class="lesson-card-icon">${lesson.icon}</span>
          <span class="lesson-card-title">${lesson.title}</span>
          <span class="lesson-card-kind">${kindLabel}</span>
        </button>
      `;
    }
    html += `</div>`;
  }

  html += `</div>`;
  root.innerHTML = html;

  root.querySelector('#back-btn')!.addEventListener('click', () => {
    navigate({ to: 'start' });
  });

  root.querySelectorAll('.lesson-card').forEach(card => {
    card.addEventListener('click', () => {
      const idx = parseInt((card as HTMLElement).dataset.index ?? '0', 10);
      navigate({ to: 'lesson', params: { lessonIndex: idx } });
    });
  });

  return () => {};
}
