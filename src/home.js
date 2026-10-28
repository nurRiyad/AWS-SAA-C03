const list = document.querySelector('#exam-list');

try {
  const exams = Object.entries(__EXAMS__).map(([number, exam]) => ({ number: Number(number), ...exam }));
  exams.sort((a, b) => a.number - b.number);
  document.querySelector('#exam-count').textContent = `${exams.length} ${exams.length === 1 ? 'exam' : 'exams'}`;
  for (const exam of exams) {
    const link = document.createElement('a');
    link.className = 'exam-card';
    link.href = `exams/${exam.number}/`;
    const revisionCount = (exam.revision.match(/^\d+\.\s/gm) || []).length;
    link.innerHTML = `<span class="exam-number">${String(exam.number).padStart(2, '0')}</span><span class="exam-info"><strong></strong><span>${exam.questionCount} MCQs · ${revisionCount} revision points</span></span><span class="arrow" aria-hidden="true">↗</span>`;
    link.querySelector('strong').textContent = exam.title;
    list.append(link);
  }
} catch {
  list.innerHTML = '<p class="empty-state">Could not load the exam list.</p>';
}
