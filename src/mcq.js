const number = document.querySelector('[data-exam]')?.dataset.exam || '1';
const exam = __EXAMS__[number];

if (exam) {
  document.title = `Exam ${exam.number} MCQ practice · AWS Exam Prep`;
  document.querySelector('#exam-label').textContent = `Exam ${String(exam.number).padStart(2, '0')} · Practice`;
  document.querySelector('#exam-title').textContent = 'Multiple-choice exam';
  document.querySelector('.revision-heading .intro').textContent = `A practice exam with ${exam.questionCount} questions.`;
  document.querySelector('#question-count').textContent = `${exam.questions.length} of ${exam.questionCount}`;
  document.querySelector('#question-fill').style.width = `${Math.min(100, exam.questions.length / exam.questionCount * 100)}%`;
}
