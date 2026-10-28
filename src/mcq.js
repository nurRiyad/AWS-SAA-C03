import { getProgress, saveProgress, clearProgress, saveAttempt } from './storage.js';

const number = document.querySelector('[data-exam]')?.dataset.exam || '1';
const exam = __EXAMS__[number];
const session = document.querySelector('#mcq-session');

if (exam) {
  document.title = `Exam ${exam.number} MCQ practice · AWS Exam Prep`;
  document.querySelector('#exam-label').textContent = `Exam ${String(exam.number).padStart(2, '0')} · Practice`;
  document.querySelector('#exam-title').textContent = 'Multiple-choice exam';
  document.querySelector('.revision-heading .intro').textContent = `A practice exam with ${exam.questionCount} questions.`;

  const questions = exam.questions;
  const saved = getProgress(number);
  let currentIndex = Number.isInteger(saved?.currentIndex) && saved.currentIndex >= 0 && saved.currentIndex < questions.length ? saved.currentIndex : 0;
  const answers = new Map(Array.isArray(saved?.answers) ? saved.answers : []);
  const submitted = new Set(Array.isArray(saved?.submitted) ? saved.submitted : []);
  let progressSaved = true;
  const persist = () => { progressSaved = saveProgress(number, { currentIndex, answers: [...answers], submitted: [...submitted] }); };
  const getCorrectAnswers = (question) => Array.isArray(question.answer) ? question.answer : [question.answer];
  const scoreAttempt = () => {
    const gradable = questions.filter((question) => !question.reviewIssues?.length);
    const correct = gradable.filter((question) => {
      const selected = answers.get(question.id) || [];
      const expected = getCorrectAnswers(question);
      return submitted.has(question.id) && selected.length === expected.length && expected.every((answer) => selected.includes(answer));
    }).length;
    const answered = gradable.filter((question) => submitted.has(question.id)).length;
    return { correct, total: gradable.length, answered, excluded: questions.length - gradable.length,
      percent: gradable.length ? Math.round(correct / gradable.length * 100) : 0, completedAt: new Date().toISOString() };
  };
  const showFinish = () => {
    const score = scoreAttempt();
    session.innerHTML = `<section class="question-card result-card"><p class="eyebrow">Finish exam ${escapeHtml(number)}</p><h2>Ready to finish?</h2><p>You checked ${score.answered} of ${score.total} scored questions. ${score.total - score.answered} unanswered questions will count as incorrect.</p>${score.excluded ? `<p>${score.excluded} question${score.excluded === 1 ? ' is' : 's are'} excluded because the source needs review.</p>` : ''}<div class="question-actions"><button class="action-link action-secondary" type="button" data-action="resume">Continue exam</button><button class="action-link action-primary" type="button" data-action="finish">Finish and save</button></div></section>`;
  };
  const showResult = (score, savedSuccessfully) => {
    session.innerHTML = `<section class="question-card result-card"><p class="eyebrow">Exam ${escapeHtml(number)} complete</p><h2>Your score</h2><div class="result-score">${score.correct} <span>/ ${score.total}</span></div><p>${score.percent}% correct · ${score.answered} of ${score.total} questions checked</p>${score.excluded ? `<p>${score.excluded} question${score.excluded === 1 ? ' was' : 's were'} excluded for source review.</p>` : ''}<p>${savedSuccessfully ? 'Saved in this browser.' : 'Could not save in this browser. Check your browser storage settings.'}</p><div class="question-actions"><a class="action-link action-secondary" href="../../../">← All exams</a><button class="action-link action-primary" type="button" data-action="retry">Try again</button></div></section>`;
  };
  const render = () => {
    const question = questions[currentIndex];
    const selected = answers.get(question.id) || [];
    const correctAnswers = Array.isArray(question.answer) ? question.answer : [question.answer];
    const multiple = correctAnswers.length > 1;
    const needsReview = question.reviewIssues?.length > 0;
    const isCorrect = selected.length === correctAnswers.length && correctAnswers.every((answer) => selected.includes(answer));
    const isSubmitted = submitted.has(question.id);
    document.querySelector('#question-count').textContent = `${currentIndex + 1} of ${questions.length}`;
    document.querySelector('#question-fill').style.width = `${(currentIndex + 1) / questions.length * 100}%`;
    session.innerHTML = `
      <div class="question-toolbar"><span class="question-number">Question ${currentIndex + 1} of ${questions.length}</span><span class="muted">${multiple ? `Choose ${correctAnswers.length} answers` : 'Choose one answer'} · Source question ${question.id}</span></div>
      <article class="question-card">
        ${needsReview ? `<div class="answer-explanation explanation-incorrect"><strong>Source question needs review</strong><p>Check source question ${question.id} on PDF page${question.sourcePages?.length === 1 ? '' : 's'} ${(question.sourcePages || []).join(', ')} before relying on its answer.</p></div>` : ''}
        <h2 class="question-prompt">${escapeHtml(question.question)}</h2>
        <fieldset class="answer-list" ${isSubmitted ? 'disabled' : ''}>
          <legend class="visually-hidden">Choose an answer</legend>
          ${question.options.map((option) => {
            const correct = isSubmitted && correctAnswers.includes(option.id);
            const incorrect = isSubmitted && selected.includes(option.id) && !correctAnswers.includes(option.id);
            return `<label class="answer-option${selected.includes(option.id) ? ' is-selected' : ''}${correct ? ' is-correct' : ''}${incorrect ? ' is-incorrect' : ''}"><input type="${multiple ? 'checkbox' : 'radio'}" name="answer-${question.id}" value="${escapeHtml(option.id)}" ${selected.includes(option.id) ? 'checked' : ''}><span class="answer-letter">${escapeHtml(option.id)}</span><span class="answer-copy">${escapeHtml(option.text)}</span>${correct ? '<span class="answer-state">Correct</span>' : incorrect ? '<span class="answer-state">Your answer</span>' : ''}</label>`;
          }).join('')}
        </fieldset>
        ${isSubmitted ? `<div class="answer-explanation ${isCorrect ? 'explanation-correct' : 'explanation-incorrect'}"><strong>${isCorrect ? 'Correct answer' : `Correct answer: ${escapeHtml(correctAnswers.join(', '))}`}</strong><p>${escapeHtml(question.explanation || 'No explanation is available for this question.')}</p></div>` : ''}
        <div class="question-actions"><button class="action-link action-secondary" type="button" data-action="previous" ${currentIndex === 0 ? 'disabled' : ''}>← Previous</button><button class="action-link action-primary" type="button" data-action="${isSubmitted || needsReview ? 'next' : 'submit'}" ${(!isSubmitted && !needsReview && selected.length !== correctAnswers.length) || ((isSubmitted || needsReview) && currentIndex === questions.length - 1) ? 'disabled' : ''}>${isSubmitted || needsReview ? (currentIndex === questions.length - 1 ? 'Last question' : 'Next question →') : 'Check answer'}</button></div>
      </article>
      <div class="finish-area"><span>${submitted.size} checked${!progressSaved ? ' · Progress could not be saved in this browser' : ''}</span><button class="action-link action-secondary" type="button" data-action="finish-preview">Finish exam</button></div>
      <nav class="question-jump" aria-label="Question navigation">${questions.map((item,index)=>`<button type="button" class="question-dot${index===currentIndex?' is-current':''}${submitted.has(item.id)?' is-answered':''}" aria-label="Go to question ${index+1}" aria-current="${index===currentIndex?'step':'false'}" data-index="${index}">${index+1}</button>`).join('')}</nav>`;
  };

  const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

  session.addEventListener('change', (event) => {
    if (event.target.matches('input[type="radio"], input[type="checkbox"]')) {
      const question = questions[currentIndex];
      const selected = answers.get(question.id) || [];
      const updated = event.target.type === 'radio' ? [event.target.value] : event.target.checked ? [...selected, event.target.value] : selected.filter((value) => value !== event.target.value);
      answers.set(question.id, updated);
      persist();
      render();
    }
  });
  session.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action],button[data-index]');
    if (!button) return;
    if (button.dataset.action === 'finish-preview') { showFinish(); return; }
    if (button.dataset.action === 'resume') { render(); return; }
    if (button.dataset.action === 'finish') {
      const score = scoreAttempt();
      const savedSuccessfully = saveAttempt(number, score);
      if (savedSuccessfully) clearProgress(number);
      showResult(score, savedSuccessfully);
      return;
    }
    if (button.dataset.action === 'retry') {
      clearProgress(number);
      answers.clear();
      submitted.clear();
      currentIndex = 0;
      persist();
      render();
      return;
    }
    if (button.hasAttribute('data-index')) {
      currentIndex = Number(button.dataset.index);
    } else if (button.dataset.action === 'previous') {
      currentIndex = Math.max(0, currentIndex - 1);
    } else if (button.dataset.action === 'submit') {
      submitted.add(questions[currentIndex].id);
    } else if (button.dataset.action === 'next') {
      currentIndex = Math.min(questions.length - 1, currentIndex + 1);
    }
    persist();
    render();
  });
  render();
} else {
  session.innerHTML = '<p class="empty-state">This exam could not be found.</p>';
}
