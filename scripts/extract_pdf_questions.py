#!/usr/bin/env python3
"""Extract one batch of numbered question cards from the source PDF."""
import argparse
import json
import re
import sys
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    sys.exit('Install the dependency with: python3 -m pip install pdfplumber')

ROOT = Path(__file__).resolve().parents[1]
HEADER = re.compile(r'^Question:\s*(\d+)\s+CertyIQ\s*$')
OPTION = re.compile(r'^([A-Z])\.\s*(\S.*)$')
ANSWER = re.compile(r'^Answer:\s*(.+?)\s*$', re.I)


def normalize(lines):
    # Preserve PDF line breaks for auditability; remove only indentation and trailing whitespace.
    return '\n'.join(line.strip() for line in lines).strip()


def parse_card(number, lines, pages):
    answer_lines = [i for i, line in enumerate(lines) if ANSWER.match(line)]
    issues = []
    if len(answer_lines) != 1:
        issues.append(f'Expected one Answer: line, found {len(answer_lines)}')
    answer_index = answer_lines[0] if answer_lines else len(lines)
    body = lines[:answer_index]
    choices = [(i, OPTION.match(line)) for i, line in enumerate(body) if OPTION.match(line)]
    # A wrapped stem can begin with 'B.' (for example, 'VPC-\nB. Both ...').
    # If an A option appears later, keep earlier labels in the question.
    first_a = next((i for i, (_, match) in enumerate(choices) if match.group(1) == 'A'), None)
    if first_a is not None:
        choices = choices[first_a:]
    if not choices:
        issues.append('No option labels found')
        question = normalize(body)
        options = []
    else:
        question = normalize(body[:choices[0][0]])
        options = []
        for pos, (index, match) in enumerate(choices):
            end = choices[pos + 1][0] if pos + 1 < len(choices) else len(body)
            options.append({'id': match.group(1), 'text': normalize([match.group(2)] + body[index + 1:end])})
    ids = [option['id'] for option in options]
    if ids != list('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[:len(ids)]) or not 2 <= len(ids) <= 10:
        issues.append(f'Unexpected option sequence: {ids}')
    if re.search(r'\b(following (?:policy|diagram|image|figure|code|configuration)|shown (?:below|in the (?:figure|diagram|image)))\b', question, re.I):
        issues.append('Question may contain a diagram, policy, or other content not present in the text layer; inspect the source pages')
    if not question or any(not option['text'] for option in options):
        issues.append('Empty question or option')
    answer_text = ANSWER.match(lines[answer_index]).group(1) if answer_lines else ''
    answer = re.findall(r'[A-Z]', answer_text.upper())
    if not answer or any(letter not in ids for letter in answer) or len(set(answer)) != len(answer):
        issues.append(f'Unexpected answer: {answer_text}')
    explanation_lines = lines[answer_index + 1:] if answer_lines else []
    if explanation_lines and explanation_lines[0].strip().lower() == 'explanation:':
        explanation_lines = explanation_lines[1:]
    else:
        issues.append('Explanation: heading missing or not directly after answer')
    explanation = normalize(explanation_lines)
    if not explanation:
        issues.append('Empty explanation')
    return {'id': number, 'question': question, 'options': options, 'answer': answer,
            'explanation': explanation, 'sourcePages': pages}, issues


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--batch', type=int, required=True, help='1-based batch number')
    parser.add_argument('--size', type=int, default=65)
    parser.add_argument('--pdf', type=Path, default=ROOT / 'data/AWS SAA-C03 Dumps.pdf')
    parser.add_argument('--output-dir', type=Path, default=ROOT / 'data/extracted')
    parser.add_argument('--force', action='store_true', help='Replace existing output files')
    args = parser.parse_args()
    if args.batch < 1 or args.size < 1: parser.error('batch and size must be positive')
    first = (args.batch - 1) * args.size + 1
    last = args.batch * args.size
    cards, current, previous_number = [], None, None
    found_next = False
    with pdfplumber.open(args.pdf) as pdf:
        for page in pdf.pages:
            for line in (page.extract_text() or '').splitlines():
                marker = HEADER.fullmatch(line.strip())
                if marker:
                    number = int(marker.group(1))
                    if previous_number is not None and number != previous_number + 1:
                        raise ValueError(f'Nonconsecutive source question markers: {previous_number}, {number} on page {page.page_number}')
                    previous_number = number
                    if current:
                        cards.append(current)
                        current = None
                    if number > last:
                        found_next = True
                        break
                    if first <= number <= last:
                        current = {'number': number, 'lines': [], 'pages': [page.page_number]}
                elif current:
                    current['lines'].append(line)
                    if page.page_number not in current['pages']: current['pages'].append(page.page_number)
            if found_next: break
    if current: cards.append(current)
    if not cards: sys.exit(f'No questions found for batch {args.batch}.')
    numbers = [card['number'] for card in cards]
    if numbers != list(range(first, first + len(numbers))):
        raise ValueError(f'Unexpected question sequence: {numbers}')
    if len(cards) < args.size and found_next:
        raise ValueError(f'Incomplete batch: {len(cards)} questions')
    questions, review = [], []
    for card in cards:
        question, issues = parse_card(card['number'], card['lines'], card['pages'])
        questions.append(question)
        if issues: review.append({'question': card['number'], 'sourcePages': card['pages'], 'issues': issues})
    args.output_dir.mkdir(parents=True, exist_ok=True)
    out = args.output_dir / f'questions-{first:04d}-{numbers[-1]:04d}.json'
    report = args.output_dir / f'questions-{first:04d}-{numbers[-1]:04d}.review.json'
    if not args.force and (out.exists() or report.exists()): sys.exit(f'Output exists: {out}. Use --force to replace it.')
    result = {'source': args.pdf.name, 'batch': args.batch, 'firstQuestion': first,
              'lastQuestion': numbers[-1], 'questionCount': len(questions), 'questions': questions}
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
    report.write_text(json.dumps({'source': args.pdf.name, 'batch': args.batch, 'issues': review,
                                  'note': 'Automated checks do not prove exact text fidelity. Review PDF pages against JSON.'}, ensure_ascii=False, indent=2) + '\n')
    print(f'Wrote {len(questions)} questions to {out}; {len(review)} flagged in {report}.')

if __name__ == '__main__': main()
