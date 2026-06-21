import { EditorApp } from './ui/EditorApp.js';
import { t } from '../utils/lang.js';
import '../styles/editor.css';

// Chapter entry for the Physics Lab. Mirrors the render/init split used by
// the textbook chapters so it plugs straight into main.ts routing.

let app: EditorApp | null = null;

export function renderLab(): string {
  return `
    <article class="chapter lab-chapter">
      <div class="chapter-header">
        <div class="part-label" data-en="Lab" data-it="Laboratorio">${t('Lab', 'Laboratorio')}</div>
        <h1 data-en="Physics Sandbox" data-it="Sandbox di Fisica">${t('Physics Sandbox', 'Sandbox di Fisica')}</h1>
        <p data-en="Build masses, springs and electric charges, set gravity or E/B fields, then press Play. Drop in a GPU engine later — the simulation runs behind a pluggable backend." data-it="Costruisci masse, molle e cariche elettriche, imposta gravità o campi E/B, poi premi Play. Un motore GPU sarà collegabile in seguito — la simulazione gira dietro un backend sostituibile.">${t(
          'Build masses, springs and electric charges, set gravity or E/B fields, then press Play. Drop in a GPU engine later — the simulation runs behind a pluggable backend.',
          'Costruisci masse, molle e cariche elettriche, imposta gravità o campi E/B, poi premi Play. Un motore GPU sarà collegabile in seguito — la simulazione gira dietro un backend sostituibile.',
        )}</p>
      </div>
      <div id="lab-editor" class="lab-editor-host"></div>
      <p class="lab-hint" data-en="Tip: pick a tool on the left, click the canvas to place. With the Spring tool, click two bodies to connect them. Select a body to edit its properties on the right." data-it="Suggerimento: scegli uno strumento a sinistra e clicca sulla tela per posizionare. Con lo strumento Molla, clicca due corpi per collegarli. Seleziona un corpo per modificarne le proprietà a destra.">${t(
        'Tip: pick a tool on the left, click the canvas to place. With the Spring tool, click two bodies to connect them. Select a body to edit its properties on the right.',
        'Suggerimento: scegli uno strumento a sinistra e clicca sulla tela per posizionare. Con lo strumento Molla, clicca due corpi per collegarli. Seleziona un corpo per modificarne le proprietà a destra.',
      )}</p>
    </article>
  `;
}

export function initLabDiagrams(): void {
  // Tear down a previous instance when navigating back into the Lab.
  if (app) { app.dispose(); app = null; }
  const host = document.getElementById('lab-editor');
  if (!host) return;
  app = new EditorApp(host);
}
