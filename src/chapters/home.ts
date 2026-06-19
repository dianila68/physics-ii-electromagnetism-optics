import { t } from '../utils/lang.js';
import { CHAPTERS } from '../utils/nav.js';
import { navigate } from '../utils/nav.js';

export function renderHome(): string {
  const chapters = CHAPTERS.filter(c => c.id !== 'home');

  const cards = chapters.map(ch => `
    <a class="chapter-card" href="#${ch.id}" data-chapter="${ch.id}">
      <div class="card-part">${t(ch.part, ch.partIt)}</div>
      <h3>${t(ch.titleEn, ch.titleIt)}</h3>
      <p>${t(ch.subtitleEn, ch.subtitleIt)}</p>
    </a>
  `).join('');

  return `
<div class="home-hero">
  <div class="part-label" style="font-size:0.85rem">${t('An Interactive Textbook', 'Un Libro di Testo Interattivo')}</div>
  <h1>${t('Physics II', 'Fisica II')}</h1>
  <p class="subtitle">${t(
    'Electromagnetism &amp; Optics — built from first principles, with interactive 3D diagrams.',
    'Elettromagnetismo &amp; Ottica — costruito dai principi fondamentali, con diagrammi 3D interattivi.'
  )}</p>
</div>

<div class="callout note">
  <div class="callout-title">${t('How to use this book', 'Come usare questo libro')}</div>
  <p>${t(
    'Chapters build on each other sequentially. Start from Part 0 if you\'re new to the subject. Each chapter shows its prerequisites. Use the sidebar to navigate. Toggle EN/IT for your preferred language.',
    'I capitoli si costruiscono sequenzialmente l\'uno sull\'altro. Inizia dalla Parte 0 se sei nuovo all\'argomento. Ogni capitolo mostra i prerequisiti. Usa la barra laterale per navigare. Attiva EN/IT per la lingua preferita.'
  )}</p>
</div>

<div class="chapter-grid">${cards}</div>
`;
}

export function initHomeDiagrams() {
  document.querySelectorAll<HTMLElement>('.chapter-card[data-chapter]').forEach(card => {
    card.addEventListener('click', e => {
      e.preventDefault();
      const id = card.dataset.chapter!;
      navigate(id);
    });
  });
}
