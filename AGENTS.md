# Repository instructions

## Project purpose

This repository is a static AWS SAA-C03 study site built with Vite. It loads numbered exam banks from `data/exams/`, renders MCQ practice, and shows authored revision guides when available.

## Structure and conventions

- Keep the project root limited to configuration, documentation, and the home `index.html` entry. Put application JavaScript in `src/`, page templates in `src/pages/`, and shared styles in `src/styles/`.
- Exam content belongs in `data/exams/<number>/`. Keep each `exam.json`, `questions.json`, `review.json`, and optional `revision.md` together. The exam catalog is discovered from numbered directories; do not add a parallel hard-coded registry.
- When adding or editing a revision guide, read Exam 1's guide and follow `.agents/skills/aws-exam-revision/SKILL.md`. Match the exact question count and order, use clear situation-to-solution cues, and include the pattern summary.
- Treat supplied answers and explanations as source material to verify, not unquestionable facts. Flag demonstrated content errors in the exam's `review.json` with an authoritative AWS reference. Preserve existing review findings. Flag uncertain extraction or source material as unresolved; do not invent missing content.
- Set `revisionTitle` and `revisionFile` in `exam.json` for authored guides. Preserve question IDs, question banks, and score behavior unless the task explicitly calls for changing them.
- Update `README.md` when project structure or contributor workflows change.

## Routes and build

- `vite.config.js` defines the exam routes, embeds exam data, and writes static route pages during build. If changing templates or paths, update both the development middleware and production output logic.
- Keep the authored revision route and MCQ route working for every exam. Do not remove the generated fallback for exams without an authored guide unless explicitly requested.
- Use the package scripts in `package.json`; `npm run build` creates the deployable site in `dist/`.
- The Vite config embeds exam data at startup. After changing exam JSON or Markdown, ensure the development server reloads that data before diagnosing a stale page.

## AWS accuracy

Use the official SAA-C03 exam guide and current AWS documentation for technical verification, especially where an answer or explanation appears inconsistent, overly broad, or dependent on a service feature that may change. Keep the reason and constraints understandable to an exam candidate. Avoid turning scenario-specific recommendations into universal rules.
