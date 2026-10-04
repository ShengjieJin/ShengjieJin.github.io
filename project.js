document.querySelector('#copy-citation').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try {
    await navigator.clipboard.writeText(document.querySelector('#bibtex').textContent);
    status.textContent = 'BibTeX copied.';
  } catch {
    status.textContent = 'Please select the citation text to copy it, or download the .bib file.';
  }
});

// Show table guidance only when columns extend beyond the available width.
const tableObserver = new ResizeObserver(entries => {
  for (const { target } of entries) {
    const hint = target.previousElementSibling;
    const overflow = target.scrollWidth > target.clientWidth + 1;
    hint.hidden = !overflow;
    target.classList.toggle('is-scrollable', overflow);
    target.style.setProperty('--table-view-width', `${target.clientWidth}px`);
  }
});
document.querySelectorAll('.table-wrap').forEach(table => tableObserver.observe(table));

let enlargeTrigger;
document.querySelectorAll('.figure-enlarge').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    enlargeTrigger = link;
    link.closest('figure').querySelector('.paper-figure').click();
  });
});

document.querySelector('#figure-dialog').addEventListener('close', () => {
  if (enlargeTrigger) {
    enlargeTrigger.focus();
    enlargeTrigger = undefined;
  }
});
