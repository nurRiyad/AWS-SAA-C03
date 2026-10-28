# AWS Exam Revision

A static AWS SAA-C03 study site with an overview for each exam, a revision guide, and a multiple-choice practice area.

## Requirements

- Node.js 24 (use `nvm use` to select the version pinned in `.nvmrc`)
- npm

## Run locally

```sh
nvm use
npm install
npm run dev
```

Open the local URL printed by Vite (usually <http://localhost:5174>).

## Add an exam

Each exam lives in its own folder:

```text
data/exams/1/
  exam.json       # display metadata and question count
  questions.json  # MCQ bank (empty until questions are added)
  revision.md     # revision guide
```

To add an exam, create `data/exams/2/` with the same three files. Put its display title, revision filename, question filename, and expected MCQ count in `exam.json`. The revision Markdown uses YAML frontmatter followed by a numbered guide and pattern summary, for example:

```md
---
title: Day 2 Revision Guide
number: 2
---

## Day 2 Question Revision Guide

1. **Situation → Recommended AWS service.**
   Logic: Why this service fits.
   **Remember:** Short recall rule.

## The patterns I want you to memorize

**Storage patterns**

**Situation → Service**
```

The exam catalog is generated from numbered folders under `data/exams/`; no separate registry edit is needed. Each exam has an overview at `/exams/N/`, a revision guide at `/exams/N/revision/`, and MCQ practice at `/exams/N/mcq/`. Exam 1 has its revision guide ready and an empty 66-question bank. The original practice-dump PDF is kept at `data/AWS SAA-C03 Dumps.pdf`.

## Build and preview

```sh
npm run build
npm run preview
```

The static site is generated in `dist/`.

## Deploy to Vercel

Import the GitHub repository in Vercel. Use the default Vite settings: build command `npm run build`, output directory `dist`.

## Deploy to GitHub Pages

The included GitHub Actions workflow builds and publishes the static site on pushes to `main`. Vite uses relative output paths so it works from a GitHub Pages project subpath.

To publish, enable **Settings → Pages → Build and deployment → GitHub Actions** in the repository.
