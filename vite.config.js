import { defineConfig } from 'vite';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const examDirectories = readdirSync(new URL('./data/exams/', import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name));
const exams = Object.fromEntries(examDirectories.map(({ name }) => {
  const folder = new URL(`./data/exams/${name}/`, import.meta.url);
  const metadata = JSON.parse(readFileSync(new URL('exam.json', folder), 'utf8'));
  const questionBank = JSON.parse(readFileSync(new URL(metadata.questionsFile, folder), 'utf8'));
  const revision = metadata.revisionFile
    ? readFileSync(new URL(metadata.revisionFile, folder), 'utf8')
    : `---\ntitle: ${metadata.title} Revision Guide\nnumber: ${metadata.number}\n---\n\n## ${metadata.title} Question Revision Guide\n\n${questionBank.questions.map((question, index) => {
      const answerIds = Array.isArray(question.answer) ? question.answer : [question.answer];
      const answer = answerIds.map((id) => {
        const option = question.options?.find((candidate) => candidate.id === id);
        return option ? `${id}: ${option.text}` : id;
      }).join('; ');
      const explanation = question.explanation || question.rationale || '';
      return `${index + 1}. **${question.question}**\n   **Remember:** ${answer}${explanation ? ` — ${explanation}` : ''}`;
    }).join('\n\n')}\n\n## The patterns to memorize\n\nReview the questions and explanations above, then retake the exam to reinforce the key AWS service choices.`;
  return [name, { ...metadata, revision, questions: questionBank.questions }];
}));

function pageMetadata(html, number, view) {
  const exam = exams[number];
  const title = view === 'revision'
    ? `Exam ${number} Revision Guide | AWS Exam Prep`
    : `Exam ${number} MCQ Practice | AWS Exam Prep`;
  const description = view === 'revision'
    ? `Review key AWS Solutions Architect Associate SAA-C03 concepts with the Exam ${number} revision guide.`
    : `Practice for the AWS Solutions Architect Associate SAA-C03 exam with ${exam.questionCount} questions in Exam ${number}.`;
  return html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`);
}

function examRoutes() {
  return {
    name: 'exam-routes',
    configureServer(server) {
      // Exam data is embedded in Vite's define configuration, so reload it when
      // a guide or its metadata changes instead of serving the startup snapshot.
      server.watcher.add(resolve('data/exams'));
      server.watcher.on('all', (event, path) => {
        if (['add', 'change', 'unlink'].includes(event) && /[/\\]data[/\\]exams[/\\].*\.(json|md)$/.test(path)) {
          server.restart();
        }
      });
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/exams\/(\d+)(?:\/(revision|mcq))?\/?(?:\?.*)?$/);
        if (!match || !exams[match[1]]) return next();
        const [, number, view = 'hub'] = match;
        if (view === 'hub') {
          res.statusCode = 302;
          res.setHeader('Location', `/exams/${number}/mcq/`);
          return res.end();
        }
        const templateFile = view === 'revision' ? 'src/pages/exam.html' : 'src/pages/mcq.html';
        const source = readFileSync(resolve(templateFile), 'utf8')
          .replaceAll('href="../styles/styles.css"', 'href="/src/styles/styles.css"')
          .replaceAll('src="../', 'src="/src/')
          .replace('data-exam=""', `data-exam="${number}"`);
        try {
          const html = await server.transformIndexHtml(req.url, pageMetadata(source, number, view));
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html');
          res.end(html);
        } catch (error) {
          next(error);
        }
      });
    },
    writeBundle() {
      const routeTypes = [
        { view: 'hub' },
        { view: 'revision', template: 'src/pages/exam.html', segments: 3, suffix: '/revision' },
        { view: 'mcq', template: 'src/pages/mcq.html', segments: 3, suffix: '/mcq' },
      ];
      for (const [number] of Object.entries(exams)) {
        for (const route of routeTypes) {
          if (route.view === 'hub') {
            const outputDir = resolve(`dist/exams/${number}`);
            mkdirSync(outputDir, { recursive: true });
            writeFileSync(resolve(outputDir, 'index.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=./mcq/"><title>Opening exam</title></head><body><a href="./mcq/">Open exam</a></body></html>');
            continue;
          }
          const template = readFileSync(resolve(`dist/${route.template}`), 'utf8');
          const relativeAssets = '../'.repeat(route.segments);
          const page = pageMetadata(template, number, route.view)
            .replace(/="(?:\.\.\/|\.\/)*assets\//g, `="${relativeAssets}assets/`)
            .replace('data-exam=""', `data-exam="${number}"`);
          const outputDir = resolve(`dist/exams/${number}${route.suffix}`);
          mkdirSync(outputDir, { recursive: true });
          writeFileSync(resolve(outputDir, 'index.html'), page);
        }
      }
    },
  };
}

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: ['index.html', 'src/pages/exam.html', 'src/pages/mcq.html'],
    },
  },
  plugins: [examRoutes()],
  define: {
    __EXAMS__: JSON.stringify(exams),
  },
});
