import { t } from '../../utils/lang.js';

export interface TimelineCallbacks {
  onPlayPause: (playing: boolean) => void;
  onStep: () => void;
  onReset: () => void;
  onSpeed: (multiplier: number) => void;
}

// Playback controls: play/pause, single-step, reset, and a speed slider.
export class Timeline {
  readonly element: HTMLElement;
  private playBtn: HTMLButtonElement;
  private playing = false;

  constructor(cb: TimelineCallbacks) {
    this.element = document.createElement('div');
    this.element.className = 'editor-timeline';

    this.playBtn = document.createElement('button');
    this.playBtn.className = 'tl-btn tl-play';
    this.updatePlayLabel();
    this.playBtn.addEventListener('click', () => {
      this.playing = !this.playing;
      this.updatePlayLabel();
      cb.onPlayPause(this.playing);
    });

    const stepBtn = document.createElement('button');
    stepBtn.className = 'tl-btn';
    stepBtn.textContent = t('Step ⏭', 'Passo ⏭');
    stepBtn.addEventListener('click', () => cb.onStep());

    const resetBtn = document.createElement('button');
    resetBtn.className = 'tl-btn';
    resetBtn.textContent = t('Reset ↺', 'Reset ↺');
    resetBtn.addEventListener('click', () => {
      this.setPlaying(false);
      cb.onReset();
    });

    const speedWrap = document.createElement('label');
    speedWrap.className = 'tl-speed';
    const speedLabel = document.createElement('span');
    const speedVal = document.createElement('span');
    speedVal.className = 'tl-speed-val';
    speedVal.textContent = '1.0×';
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0.1';
    slider.max = '3';
    slider.step = '0.1';
    slider.value = '1';
    speedLabel.textContent = t('Speed', 'Velocità');
    slider.addEventListener('input', () => {
      const m = parseFloat(slider.value);
      speedVal.textContent = `${m.toFixed(1)}×`;
      cb.onSpeed(m);
    });
    speedWrap.append(speedLabel, slider, speedVal);

    this.element.append(this.playBtn, stepBtn, resetBtn, speedWrap);
  }

  setPlaying(playing: boolean): void {
    this.playing = playing;
    this.updatePlayLabel();
  }

  private updatePlayLabel(): void {
    this.playBtn.textContent = this.playing ? t('Pause ⏸', 'Pausa ⏸') : t('Play ▶', 'Play ▶');
  }
}
