# AWS Exam Revision

A small static study site that turns numbered exam Markdown files into focused revision pages with checkboxes, per-session elapsed time, and progress tracking.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (usually <http://localhost:5173>).

## Add an exam

Add a numbered Markdown file under `exams/`, for example `exams/2.exam.md`. Include YAML frontmatter with `title` and `number`, followed by a heading for the numbered revision list and a second-level heading for the pattern summary:

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

The exam catalog is generated from files matching `N.exam.md`; no separate registry edit is needed. Each exam is published at `/exams/N/`.

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
