// Figure links also work as ordinary image links when JavaScript is unavailable.
const figureDialog = document.querySelector('#figure-dialog');
const figureTitle = document.querySelector('#figure-title');
const enlargedFigure = figureDialog.querySelector('.enlarged-figure');
const figureViewport = figureDialog.querySelector('.figure-viewport');
const figureZoomIn = figureDialog.querySelector('.figure-zoom-in');
const figureZoomOut = figureDialog.querySelector('.figure-zoom-out');
const figureFit = figureDialog.querySelector('.figure-fit');
const figureOriginal = figureDialog.querySelector('.figure-original');
const figureHint = figureDialog.querySelector('#figure-hint');
let figureScale = 1;

function sizeFigure() {
  if (!figureDialog.open || !enlargedFigure.complete || !enlargedFigure.naturalWidth) return;
  figureViewport.style.height = '';
  const fitScale = Math.min(1, figureViewport.clientWidth / enlargedFigure.naturalWidth, figureViewport.clientHeight / enlargedFigure.naturalHeight);
  figureScale = Math.max(1, Math.min(figureScale, 1 / fitScale));
  const zoomed = figureScale > 1.001;
  figureViewport.classList.toggle('is-zoomed', zoomed);
  enlargedFigure.style.width = `${enlargedFigure.naturalWidth * fitScale * figureScale}px`;
  figureViewport.style.height = `${Math.min(figureViewport.clientHeight + 2, Math.ceil(enlargedFigure.naturalHeight * fitScale * figureScale) + 2)}px`;
  figureZoomIn.disabled = fitScale * figureScale >= .999;
  figureZoomOut.disabled = figureFit.disabled = !zoomed;
  figureHint.textContent = zoomed ? `${Number(figureScale.toFixed(1))}× view · swipe or scroll to explore` : 'Full figure · use + for detail';
  figureViewport.scrollTo(0, 0);
}

if (typeof figureDialog.showModal === 'function') {
  enlargedFigure.addEventListener('load', sizeFigure);
  enlargedFigure.addEventListener('error', () => {
    figureZoomIn.disabled = figureZoomOut.disabled = figureFit.disabled = true;
    figureHint.textContent = 'Image unavailable. Try opening the original.';
  });
  figureZoomIn.addEventListener('click', () => {
    figureScale *= 2;
    sizeFigure();
  });
  figureZoomOut.addEventListener('click', () => {
    figureScale /= 2;
    sizeFigure();
  });
  figureFit.addEventListener('click', () => {
    figureScale = 1;
    sizeFigure();
  });
  window.addEventListener('resize', sizeFigure);
  document.querySelectorAll('.paper-figure').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      figureScale = 1;
      figureViewport.classList.remove('is-zoomed');
      figureZoomIn.disabled = figureZoomOut.disabled = figureFit.disabled = true;
      figureHint.textContent = 'Loading figure…';
      enlargedFigure.style.width = '100%';
      figureViewport.style.height = '';
      enlargedFigure.src = link.href;
      figureOriginal.href = link.href;
      enlargedFigure.alt = link.querySelector('img').alt;
      figureTitle.textContent = link.dataset.figureTitle;
      figureDialog.showModal();
      document.documentElement.classList.add('figure-open');
      sizeFigure();
    });
  });
  figureDialog.querySelector('.dialog-close').addEventListener('click', () => figureDialog.close());
  figureDialog.addEventListener('close', () => document.documentElement.classList.remove('figure-open'));
  figureDialog.addEventListener('click', event => {
    if (event.target !== figureDialog) return;
    const bounds = figureDialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) figureDialog.close();
  });
}

// Keep the sticky navigation in sync with the section being read.
const sectionLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const sections = sectionLinks.map(link => document.querySelector(link.hash));
const header = document.querySelector('.site-header');
let navigationFrame = 0;

function updateNavigation() {
  navigationFrame = 0;
  const readingLine = header.getBoundingClientRect().bottom + 48;
  let current = -1;
  sections.forEach((section, index) => {
    if (section.getBoundingClientRect().top <= readingLine) current = index;
  });
  if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sections.length - 1;
  sectionLinks.forEach((link, index) => {
    if (index === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function scheduleNavigationUpdate() {
  if (!navigationFrame) navigationFrame = requestAnimationFrame(updateNavigation);
}

window.addEventListener('scroll', scheduleNavigationUpdate, { passive: true });
window.addEventListener('resize', scheduleNavigationUpdate);
window.addEventListener('pageshow', scheduleNavigationUpdate);
updateNavigation();
