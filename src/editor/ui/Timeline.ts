import { t } from '../../utils/lang.js';
import { makeFigureSlider } from '../../ui/components.js';

export interface TimelineCallbacks {
  onPlayPause: (playing: boolean) => void;
  onStep: () => void;
  onReset: () => void;
  onSpeed: (multiplier: number) => void;
}

// Playback controls styled with the Principia design system: Play/Step/Reset
// as .btn buttons and a FigureSlider for speed.
export class Timeline {
  readonly element: HTMLElement;
  private playBtn: HTMLButtonElement;
  private playing = false;

  constructor(cb: TimelineCallbacks) {
    this.element = document.createElement('div');
    this.element.className = 'editor-timeline';

    const eyebrow = document.createElement('div');
    eyebrow.className = 'eyebrow';
    eyebrow.textContent = t('Playback', 'Riproduzione');

    const row = document.createElement('div');
    row.className = 'editor-timeline-row';

    this.playBtn = document.createElement('button');
    this.playBtn.type = 'button';
    this.playBtn.className = 'btn btn-primary btn-sm';
    this.updatePlayLabel();
    this.playBtn.addEventListener('click', () => {
      this.playing = !this.playing;
      this.updatePlayLabel();
      cb.onPlayPause(this.playing);
    });

    const stepBtn = document.createElement('button');
    stepBtn.type = 'button';
    stepBtn.className = 'btn btn-secondary btn-sm';
    stepBtn.textContent = t('Step', 'Passo');
    stepBtn.addEventListener('click', () => cb.onStep());

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'btn btn-secondary btn-sm';
    resetBtn.textContent = t('Reset', 'Reset');
    resetBtn.addEventListener('click', () => {
      this.setPlaying(false);
      cb.onReset();
    });

    row.append(this.playBtn, stepBtn, resetBtn);

    const speed = makeFigureSlider({
      label: t('Speed', 'Velocità'),
      value: 1,
      min: 0.1,
      max: 3,
      step: 0.1,
      unit: '×',
      accent: 'blue',
      onChange: m => cb.onSpeed(m),
    });

    this.element.append(eyebrow, row, speed);
  }

  setPlaying(playing: boolean): void {
    this.playing = playing;
    this.updatePlayLabel();
  }

  private updatePlayLabel(): void {
    this.playBtn.textContent = this.playing ? t('Pause', 'Pausa') : t('Play', 'Play');
  }
}
