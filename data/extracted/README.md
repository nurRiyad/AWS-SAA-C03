# Extracting the AWS question PDF

The source is `data/local-pdfs/AWS SAA-C03 Dumps.pdf`. Each output file holds up to 65 consecutive source questions. `questions-0001-0065.json` contains source questions 1 through 65. The last batch can have fewer than 65 questions.

## Run one batch

Use Python 3 and install `pdfplumber` if it is not available:

```sh
python3 -m pip install pdfplumber
python3 scripts/extract_pdf_questions.py --batch 1
python3 scripts/extract_pdf_questions.py --batch 2
```

The extractor reads the PDF in visual order, carries cards over page breaks, and writes `data/extracted/questions-START-END.json` and a matching `.review.json`. It does not overwrite existing output unless `--force` is supplied. Run it from any directory. To use a different PDF or output folder, use `--pdf PATH` and `--output-dir PATH`. Batch numbering is one-based; the default size is 65 and can be changed with `--size`.

In this workspace, the bundled Python already has pdfplumber:

```sh
/Users/alasadnurriyad/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 scripts/extract_pdf_questions.py --batch 2
```

## Extract all batches in one pass

From the repository root, run:

```sh
python3 scripts/extract_all_questions.py
```

This reads the PDF once and writes each batch and its review report in order. It stops if an output file already exists; `--force` replaces the generated files. Keep copies of any manually reviewed files before using `--force`.

## Data format

Each question contains its source `id`, `question`, ordered `options` with letter and text, `answer` as an array of letters (some questions have multiple answers), full `explanation`, and 1-based `sourcePages`. Line wrapping is retained from the extracted PDF text. The PDF's own wording, answer and apparent errors are retained; do not silently paraphrase, correct, or invent content. Explanation references and links are retained as text.

## Review each batch before using it

1. Read the matching review report and check each flagged question against the source pages. Compare the stem, each option, the answer and full explanation. Automated checks validate structure, not factual correctness or transcription fidelity.
2. Review the first and last card and questions spanning pages. Inspect any unusual characters, equations, images, tables or text that appears out of order against the rendered PDF. The PDF text layer can contain extraction errors even when no flag appears.
3. Verify source numbering, a single answer line, option order and any multi-select answer. Preserve source content when it is questionable; record discrepancies for review instead of inventing corrections.
4. Fix confirmed extraction errors in the JSON, record the correction and source page, and keep the report with the batch. Do not use `--force` on a manually corrected batch without preserving the reviewed copy.
5. Before loading into the website, ensure the renderer supports multiple answers and the number of options in each record. Do not replace the existing question bank with unreviewed batches.

The source PDF begins with a visible `Question: 1` header even though some PDF text extractors emit that header after the question. Use the layout-aware extractor, not a plain linear `pypdf` extraction, to locate card boundaries.
