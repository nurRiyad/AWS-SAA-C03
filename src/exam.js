import DOMPurify from 'dompurify';

const params = new URLSearchParams(location.search);
const examId = params.get('id') || document.querySelector('#revision-content')?.dataset.exam || '1';
const content = document.querySelector('#revision-content');

function renderRevisionSource(markdown) {
  const source = markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
  const lines = source.split(/\r?\n/);
  const guideStart = lines.findIndex((line) => /^##\s+.+Question Revision Guide/.test(line));
  const patternsStart = lines.findIndex((line) => /^##\s+The patterns .*memorize/.test(line));
  if (guideStart < 0 || patternsStart < 0) throw new Error('Could not find the revision sections in this Markdown file.');

  const items = [];
  let current = null;
  for (const line of lines.slice(guideStart + 1, patternsStart)) {
    const numbered = line.match(/^(\d+)\.\s+(.+)$/);
    if (numbered) {
      if (current) items.push(current);
      current = { number: Number(numbered[1]), title: numbered[2], details: [] };
      continue;
    }
    if (!current || !line.trim()) continue;
    const detail = line.trim();
    const label = detail.match(/^\*\*(Remember|Trap|Important trap):\*\*\s*(.*)$/);
    if (label) {
      current.details.push({ label: label[1].toLowerCase().startsWith('important') ? 'Trap' : label[1], text: label[2] });
    } else if (/^Logic:/.test(detail)) {
      const body = detail.replace(/^Logic:\s*/, '');
      const parts = body.split(/\s+\*\*(Remember|Trap):\*\*\s*/);
      current.details.push({ label: 'Logic', text: parts[0] });
      for (let index = 1; index < parts.length; index += 2) current.details.push({ label: parts[index], text: parts[index + 1] || '' });
    } else if (current.details.at(-1)?.label === 'Logic') {
      current.details.at(-1).text += ` ${detail}`;
    } else {
      current.details.push({ label: 'Remember', text: detail });
    }
  }
  if (current) items.push(current);

  const inline = (text) => text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/`([^`]+)`/g, '<code>$1</code>');
  const cards = items.map((item) => {
    const detailHtml = item.details.map(({ label, text }) => `<div class="point-detail detail-${label.toLowerCase()}"><span class="detail-label">${label}</span><p>${inline(text)}</p></div>`).join('');
    return `<article class="point-card"><span class="point-number">${String(item.number).padStart(2, '0')}</span><div class="point-main"><h3>${inline(item.title)}</h3>${detailHtml}</div><label class="check-control"><input class="point-checkbox" type="checkbox" aria-label="Mark revision point ${item.number} complete"><span class="checkmark" aria-hidden="true"></span></label></article>`;
  }).join('');

  const patterns = lines.slice(patternsStart + 1).filter((line) => line.trim() && line.trim() !== '---').map((line) => {
    const text = line.trim();
    if (/^\*\*[^*]+\*\*$/.test(text)) return `<div class="pattern-row">${text}</div>`;
    return `<p class="pattern-note">${text}</p>`;
  }).join('');
  return `<h2>Revision points</h2><section class="point-list" aria-label="Revision questions">${cards}</section><section class="patterns-section"><h2>The patterns to memorize</h2>${patterns}</section>`;
}

function renderExam(markdown) {
  const frontMatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const title = frontMatter?.[1].match(/^title:\s*(.+)$/m)?.[1] || `Exam ${examId}`;
  const number = Number(frontMatter?.[1].match(/^number:\s*(\d+)$/m)?.[1] || examId);
  document.title = `${title} · AWS Exam Revision`;
  document.querySelector('#exam-label').textContent = `Exam ${String(number).padStart(2, '0')}`;
  document.querySelector('#exam-title').textContent = title;
  content.innerHTML = DOMPurify.sanitize(renderRevisionSource(markdown));
  return content.querySelectorAll('.point-card').length;
}

try {
  const fileName = __EXAM_FILES__.find((file) => file === `${examId}.exam.md`);
  if (!fileName) throw new Error('This exam could not be found.');
  const markdown = __EXAM_DATA__[examId];
  const total = renderExam(markdown);
  const points = [...content.querySelectorAll('.point-card')];
  const startedAt = Date.now();
  const timer = document.querySelector('#elapsed-time');
  const updateTimer = () => {
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    timer.textContent = hours ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };
  updateTimer();
  window.setInterval(updateTimer, 1000);
  document.querySelector('#total-count').textContent = total;
  const bar = document.querySelector('#progress-bar');
  bar.setAttribute('aria-valuemax', total);
  content.addEventListener('change', () => {
    const done = points.filter((point) => point.querySelector('input').checked).length;
    const percent = total ? Math.round(done / total * 100) : 0;
    document.querySelector('#completed-count').textContent = done;
    document.querySelector('#progress-percent').textContent = `${percent}%`;
    document.querySelector('#progress-fill').style.width = `${percent}%`;
    bar.setAttribute('aria-valuenow', done);
  });
} catch (error) {
  document.querySelector('#exam-title').textContent = 'Unable to load this revision guide';
  content.innerHTML = `<p class="empty-state">${error.message}</p>`;
}
