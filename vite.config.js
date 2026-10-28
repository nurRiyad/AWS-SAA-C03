import { defineConfig } from 'vite';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const exams = readdirSync(new URL('./data/exams/', import.meta.url))
  .filter((file) => /^\d+\.exam\.md$/.test(file));
const examData = Object.fromEntries(exams.map((file) => [file.match(/^(\d+)\.exam\.md$/)[1], readFileSync(new URL(`./data/exams/${file}`, import.meta.url), 'utf8')]));

function examPages() {
  return {
    name: 'exam-pages',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/exams\/(\d+)\/?(?:\?.*)?$/);
        if (!match || !exams.includes(`${match[1]}.exam.md`)) return next();
        req.url = `/exam.html?id=${match[1]}`;
        next();
      });
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const match = (ctx.path + (ctx.originalUrl || '')).match(/\/exams\/(\d+)(?:\/|\?|$)/);
        if (!match) return html;
        return html
          .replaceAll('href="./styles.css"', 'href="../../styles.css"')
          .replaceAll('src="./src/exam.js"', 'src="../../src/exam.js"')
          .replace('id="revision-content"', `id="revision-content" data-exam="${match[1]}"`);
      },
    },
    writeBundle() {
      const template = readFileSync(resolve('dist/exam.html'), 'utf8');
      for (const file of exams) {
        const number = file.match(/^(\d+)\.exam\.md$/)[1];
        const page = template
          .replaceAll('="./assets/', '="../../assets/')
          .replace('id="revision-content"', `id="revision-content" data-exam="${number}"`);
        const outputDir = resolve(`dist/exams/${number}`);
        mkdirSync(outputDir, { recursive: true });
        writeFileSync(resolve(outputDir, 'index.html'), page);
      }
    },
  };
}

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: ['index.html', 'exam.html'],
    },
  },
  plugins: [examPages()],
  define: {
    __EXAM_FILES__: JSON.stringify(exams),
    __EXAM_DATA__: JSON.stringify(examData),
  },
});
