---
name: aws-exam-revision
description: Create or update an AWS SAA-C03 exam revision guide from this project's numbered MCQ exam folders. Use when asked to create a review or revision guide for a specified exam or range of exams.
---

# AWS exam revision guide

Create a complete, accurate, easy-to-recall revision guide for each requested exam in the AWS Exam Preparation project. A request such as “create review for exam 3” means the revision guide, not a generic question-bank summary. Limit work to the exam numbers requested.

## Read the source

- Locate `data/exams/<number>/` in the workspace. Read `exam.json`, every question and answer option in `questions.json`, and `review.json`. Read `data/exams/1/revision.md` as the canonical example; inspect the revision renderer and existing guides when needed.
- Examine the source PDF pages for flagged extraction issues when possible, including images, diagrams, and duplicated or missing answer labels. If the source remains unclear, explicitly mark the corresponding guide entry as needing source review and do not invent an answer.
- Treat the supplied answers and explanations as unverified. Check questionable or time-sensitive claims against current official AWS documentation and the official SAA-C03 exam guide. Preserve relevant constraints instead of presenting a scenario-specific rule as universal.

## Write the guide

- Create `revision.md` in the requested exam folder. Use the same frontmatter (`title`, `number`, `pointCount`), numbered section heading, one point per question in source order, and final `The patterns I want you to memorize` section as Exam 1. Use the actual question count, including shorter exams.
- For each numbered point write **situation → solution**, a concise `Logic:` explanation, and a **Remember:** recall cue or **Trap:** contrasting a plausible wrong choice. Include all necessary components for multi-answer questions. Emphasize availability, security, performance, cost, operational overhead, and other constraints where they decide the choice.
- Explain distinctions and limitations clearly, using plain language. Prefer accurate decision rules to copying full questions, raw explanations, or unsupported claims. Summarize recurring patterns from that exam at the end.
- When an answer or explanation is demonstrably wrong or misleading, add a flag to that exam's `review.json`, retaining existing issues and source pages. Record the issue and official AWS reference; write the supported rule in the guide and distinguish a flawed answer from a flawed explanation. Do not silently alter the question bank or scoring. If uncertain, label the issue as unresolved rather than stating it is wrong.

## Integrate and verify

- Set `revisionTitle` and `revisionFile` in the exam's `exam.json` to point to the authored guide. Preserve other metadata and question-bank contents. Update documentation only if its description of available guides becomes inaccurate.
- Check frontmatter, actual question count, contiguous numbering, all source questions covered, multi-answer completeness, source-review flags, and the pattern summary. Run the project's build and other appropriate existing checks.
- Verify the actual `/exams/<number>/revision/` page renders the authored guide in the same card format as Exam 1, with the correct count and without the generated fallback. The Vite configuration embeds data at startup; ensure the running server has reloaded updated exam files before concluding the page is wrong.
- Report completed guides and any unresolved source issues. Never present a partial guide as complete or claim verification that was not performed.
