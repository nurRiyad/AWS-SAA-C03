import { defineConfig } from 'vite';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const exams = readdirSync(new URL('./exams/', import.meta.url))
  .filter((file) => /^\d+\.exam\.md$/.test(file));
const examData = Object.fromEntries(exams.map((file) => [file.match(/^(\d+)\.exam\.md$/)[1], readFileSync(new URL(`./exams/${file}`, import.meta.url), 'utf8')]));

function examPages() {
  return {
    name: 'exam-pages',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const match = req.url?.match(/^\/exams\/(\d+)\/?(?:\?.*)?$/);
        if (!match) return next();
        const examFile = `${match[1]}.exam.md`;
        if (!exams.includes(examFile)) return next();
        req.url = `/exam.html?id=${match[1]}`;
        next();
      });
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const match = ctx.path.match(/^\/exams\/(\d+)\//);
        if (!match) return html;
        return html.replace('id="revision-content"', `id="revision-content" data-exam="${match[1]}"`);
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
