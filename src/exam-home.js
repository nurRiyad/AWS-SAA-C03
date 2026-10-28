const number = document.querySelector('[data-exam]')?.dataset.exam || '1';
const exam = __EXAMS__[number];

if (exam) {
  document.title = `${exam.title} · AWS Exam Prep`;
  document.querySelector('#exam-label').textContent = `Exam ${String(exam.number).padStart(2, '0')}`;
  document.querySelector('#exam-title').textContent = exam.title;
  const points = (exam.revision.match(/^\d+\.\s/gm) || []).length;
  document.querySelector('#revision-summary').textContent = `${points} focused revision points`;
  document.querySelector('#mcq-summary').textContent = `${exam.questionCount} questions · ${exam.questions.length ? 'ready to begin' : 'not started'}`;
}
