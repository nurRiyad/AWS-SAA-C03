const list = document.querySelector('#exam-list');

function parseExam(file, markdown) {
  const number = Number(file.match(/^(\d+)\.exam\.md$/)?.[1]);
  return {
    id: String(number),
    number,
    title: markdown.match(/^title:\s*(.+)$/m)?.[1] || `Exam ${number}`,
    pointCount: (markdown.match(/^\d+\.\s/gm) || []).length,
  };
}

try {
  const exams = __EXAM_FILES__.map((file) => {
    const markdown = __EXAM_DATA__[file.match(/^(\d+)\.exam\.md$/)[1]];
    return parseExam(file, markdown);
  });
  exams.sort((a, b) => a.number - b.number);
  document.querySelector('#exam-count').textContent = `${exams.length} ${exams.length === 1 ? 'exam' : 'exams'}`;
  for (const exam of exams) {
    const link = document.createElement('a');
    link.className = 'exam-card';
    link.href = `exams/${encodeURIComponent(exam.id)}/`;
    link.innerHTML = `<span class="exam-number">${String(exam.number).padStart(2, '0')}</span><span class="exam-info"><strong></strong><span>${exam.pointCount} revision points</span></span><span class="arrow" aria-hidden="true">↗</span>`;
    link.querySelector('strong').textContent = exam.title;
    list.append(link);
  }
} catch {
  list.innerHTML = '<p class="empty-state">Could not load the exam list.</p>';
}
