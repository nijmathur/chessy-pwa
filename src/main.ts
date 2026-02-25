import './styles/main.css';
import './styles/screens.css';
import { preloadPieces } from './board/ChessBoard';
import { startScreen } from './screens/startScreen';
import { gameScreen, type GameParams } from './screens/gameScreen';
import { lessonsScreen } from './screens/lessonsScreen';
import { lessonScreen, type LessonParams } from './screens/lessonScreen';

export type ScreenName = 'start' | 'game' | 'lessons' | 'lesson';

export interface NavEvent {
  to: ScreenName;
  params?: GameParams | LessonParams;
}

let currentCleanup: (() => void) | null = null;

export function navigate(evt: NavEvent): void {
  currentCleanup?.();
  currentCleanup = null;

  const root = document.getElementById('app')!;
  root.innerHTML = '';

  switch (evt.to) {
    case 'start':
      currentCleanup = startScreen(root);
      break;
    case 'game':
      currentCleanup = gameScreen(root, evt.params as GameParams);
      break;
    case 'lessons':
      currentCleanup = lessonsScreen(root);
      break;
    case 'lesson':
      currentCleanup = lessonScreen(root, evt.params as LessonParams);
      break;
  }

  history.pushState({ screen: evt.to, params: evt.params ?? null }, '', '#' + evt.to);
}

window.addEventListener('popstate', (e) => {
  if (e.state?.screen) {
    navigate({ to: e.state.screen, params: e.state.params ?? undefined });
  } else {
    navigate({ to: 'start' });
  }
});

// Boot
(async () => {
  await preloadPieces();
  navigate({ to: 'start' });
})();
