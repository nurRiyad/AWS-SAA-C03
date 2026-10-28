import { defineConfig } from 'vite';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const examDirectories = readdirSync(new URL('./data/exams/', import.meta.url), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name));
const exams = Object.fromEntries(examDirectories.map(({ name }) => {
  const folder = new URL(`./data/exams/${name}/`, import.meta.url);
  const metadata = JSON.parse(readFileSync(new URL('exam.json', folder), 'utf8'));
  const revision = readFileSync(new URL(metadata.revisionFile, folder), 'utf8');
  const questionBank = JSON.parse(readFileSync(new URL(metadata.questionsFile, folder), 'utf8'));
  return [name, { ...metadata, revision, questions: questionBank.questions }];
}));

function examRoutes() {
  return {
    name: 'exam-routes',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/exams\/(\d+)(?:\/(revision|mcq))?\/?(?:\?.*)?$/);
        if (!match || !exams[match[1]]) return next();
        const [, number, view = 'hub'] = match;
        const templateFile = view === 'revision' ? 'exam.html' : view === 'mcq' ? 'mcq.html' : 'exam-home.html';
        const source = readFileSync(resolve(templateFile), 'utf8')
          .replaceAll('href="./styles.css"', 'href="/styles.css"')
          .replaceAll('src="./src/', 'src="/src/')
          .replace('data-exam=""', `data-exam="${number}"`);
        try {
          const html = await server.transformIndexHtml(req.url, source);
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
        { view: 'hub', template: 'exam-home.html', segments: 2, suffix: '' },
        { view: 'revision', template: 'exam.html', segments: 3, suffix: '/revision' },
        { view: 'mcq', template: 'mcq.html', segments: 3, suffix: '/mcq' },
      ];
      for (const [number] of Object.entries(exams)) {
        for (const route of routeTypes) {
          const template = readFileSync(resolve(`dist/${route.template}`), 'utf8');
          const relativeAssets = '../'.repeat(route.segments);
          const page = template
            .replaceAll('="./assets/', `="${relativeAssets}assets/`)
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
      input: ['index.html', 'exam-home.html', 'exam.html', 'mcq.html'],
    },
  },
  plugins: [examRoutes()],
  define: {
    __EXAMS__: JSON.stringify(exams),
  },
});
