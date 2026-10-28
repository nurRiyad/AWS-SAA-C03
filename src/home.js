const list = document.querySelector('#exam-list');

try {
  const exams = Object.entries(__EXAMS__).map(([number, exam]) => ({ number: Number(number), ...exam }));
  exams.sort((a, b) => a.number - b.number);
  document.querySelector('#exam-count').textContent = `${exams.length} ${exams.length === 1 ? 'exam' : 'exams'}`;
  for (const exam of exams) {
    const revisionCount = (exam.revision.match(/^\d+\.\s/gm) || []).length;
    const card = document.createElement('article');
    card.className = 'exam-card';
    card.innerHTML = `<span class="exam-number">${String(exam.number).padStart(2, '0')}</span><span class="exam-info"><strong></strong><span>${exam.questionCount} MCQs · ${revisionCount} revision points</span></span><nav class="exam-actions" aria-label="Study options"></nav>`;
    card.querySelector('.exam-info strong').textContent = exam.title;

    const actions = card.querySelector('.exam-actions');
    const takeExam = document.createElement('a');
    takeExam.className = 'action-link action-primary';
    takeExam.href = `exams/${exam.number}/mcq/`;
    takeExam.textContent = 'Take exam';
    takeExam.setAttribute('aria-label', `Take Exam ${exam.number} multiple-choice exam`);

    const revise = document.createElement('a');
    revise.className = 'action-link action-secondary';
    revise.href = `exams/${exam.number}/revision/`;
    revise.textContent = 'Revise';
    revise.setAttribute('aria-label', `Revise Exam ${exam.number}`);

    actions.append(takeExam, revise);
    list.append(card);
  }
} catch {
  list.innerHTML = '<p class="empty-state">Could not load the exam list.</p>';
}
