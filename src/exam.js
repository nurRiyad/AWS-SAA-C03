import { marked } from 'marked';
import DOMPurify from 'dompurify';

const params = new URLSearchParams(location.search);
const examId = params.get('id') || document.querySelector('#revision-content')?.dataset.exam || '1';
const content = document.querySelector('#revision-content');

marked.setOptions({ breaks: false, gfm: true });

function parsePointDetails(item) {
  const details = [];
  for (const paragraph of [...item.querySelectorAll(':scope > p')]) {
    const text = paragraph.innerHTML.trim();
    const match = text.match(/^(?:<strong>)?(Logic|Remember|Trap|Important trap):(?:<\/strong>)?\s*/i);
    if (match) {
      const firstLabel = match[1].toLowerCase().startsWith('important') ? 'Trap' : match[1];
      const remainder = text.slice(match[0].length);
      const inlineParts = remainder.split(/\s+(?:<strong>)?(Remember|Trap):(?:<\/strong>)?\s*/i);
      details.push({ label: firstLabel, text: inlineParts[0] });
      for (let index = 1; index < inlineParts.length; index += 2) {
        details.push({ label: inlineParts[index][0].toUpperCase() + inlineParts[index].slice(1).toLowerCase(), text: inlineParts[index + 1] || '' });
      }
      paragraph.remove();
      continue;
    }
    const previous = details.at(-1);
    if (previous?.label === 'Logic') {
      details.push({ label: 'Remember', text });
      paragraph.remove();
    }
  }
  return details;
}

function makeCard(item, index) {
  const titleParagraph = item.querySelector(':scope > p');
  const title = titleParagraph?.innerHTML || '';
  const detailSource = item.cloneNode(true);
  detailSource.querySelector(':scope > p')?.remove();
  item.replaceChildren(...detailSource.children);
  const details = parsePointDetails(item);
  const detailHtml = details.map(({ label, text }) => `<div class="point-detail detail-${label.toLowerCase()}"><span class="detail-label">${label}</span><p>${text}</p></div>`).join('');
  const article = document.createElement('article');
  article.className = 'point-card';
  article.innerHTML = `<span class="point-number">${String(index + 1).padStart(2, '0')}</span><div class="point-main"><h3>${title}</h3>${detailHtml}</div><label class="check-control"><input class="point-checkbox" type="checkbox" aria-label="Mark revision point ${index + 1} complete"><span class="checkmark" aria-hidden="true"></span></label>`;
  return article;
}

function renderExam(markdown) {
  const frontMatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  const title = frontMatter?.[1].match(/^title:\s*(.+)$/m)?.[1] || `Exam ${examId}`;
  const number = Number(frontMatter?.[1].match(/^number:\s*(\d+)$/m)?.[1] || examId);
  const html = DOMPurify.sanitize(marked.parse(markdown.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')));
  const template = document.createElement('template');
  template.innerHTML = html;
  const headings = [...template.content.querySelectorAll('h2')];
  const guideHeading = headings.find((heading) => /question revision guide/i.test(heading.textContent));
  const patternsHeading = headings.find((heading) => /patterns .* memorize/i.test(heading.textContent));
  if (!guideHeading || !patternsHeading) throw new Error('Could not find the revision sections in this Markdown file.');

  const pointsList = guideHeading.nextElementSibling;
  const points = pointsList?.tagName === 'OL' ? [...pointsList.children] : [];
  document.title = `${title} · AWS Exam Revision`;
  document.querySelector('#exam-label').textContent = `Exam ${String(number).padStart(2, '0')}`;
  document.querySelector('#exam-title').textContent = title;
  const intro = [];
  for (const node of [...template.content.children]) {
    if (node === guideHeading) break;
    if (node.tagName === 'P') intro.push(node);
  }
  const summaryHeading = guideHeading.cloneNode(true);
  content.replaceChildren(...intro, summaryHeading);
  summaryHeading.textContent = 'Revision points';
  const pointSection = document.createElement('section');
  pointSection.className = 'point-list';
  pointSection.setAttribute('aria-label', 'Revision questions');
  points.forEach((point, index) => pointSection.append(makeCard(point, index)));
  content.append(pointSection);
  if (pointsList) pointsList.remove();

  const patterns = document.createElement('section');
  patterns.className = 'patterns-section';
  patternsHeading.textContent = 'The patterns to memorize';
  patterns.append(patternsHeading);
  let currentGroup = null;
  const patternsIndex = [...template.content.children].indexOf(patternsHeading);
  const patternChildren = [];
  for (const element of [...template.content.children].slice(patternsIndex + 1)) {
    if (element.tagName === 'HR') break;
    if (element.tagName === 'P' && /recognizing the/i.test(element.textContent)) break;
    patternChildren.push(element);
  }
  for (const element of patternChildren) {
    if (element.tagName === 'P' && element.querySelector('strong')) {
      currentGroup = document.createElement('div');
      currentGroup.className = 'pattern-group';
      const heading = document.createElement('h3');
      heading.innerHTML = element.innerHTML;
      currentGroup.append(heading);
      patterns.append(currentGroup);
    } else if (element.tagName === 'P') {
      if (!currentGroup) { currentGroup = document.createElement('div'); currentGroup.className = 'pattern-group'; patterns.append(currentGroup); }
      const row = document.createElement('div');
      row.className = 'pattern-row';
      row.innerHTML = element.innerHTML;
      currentGroup.append(row);
    }
  }
  const finalParagraph = [...template.content.children].find((element) => element.tagName === 'P' && /recognizing the/i.test(element.textContent));
  if (finalParagraph) patterns.append(finalParagraph.cloneNode(true));
  content.append(patterns);
  return points.length;
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
