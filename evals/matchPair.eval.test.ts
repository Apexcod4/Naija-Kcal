import { DISHES } from '../src/data/dishes';
import { matchPair } from '../src/logic/matchPair';
import { CASES, scores } from './matchPair.cases';

/**
 * The eval. Unlike a unit test this is a measurement: it prints a report and
 * guards a floor, so accuracy can only move up. Raise BASELINE whenever it
 * improves — that ratchet is the point.
 */
const BASELINE = 1;

function describeActual(input: string): string {
  const m = matchPair(input, DISHES);
  switch (m.kind) {
    case 'pair':
      return `pair(${m.soup.id} + ${m.swallow.id})`;
    case 'partial':
      return `partial(${m.dish.id}, missing ${m.missing})`;
    case 'single':
      return `single(${m.dish.id})`;
    case 'none':
      return 'none';
  }
}

function describeExpected(e: (typeof CASES)[number]['expect']): string {
  switch (e.kind) {
    case 'pair':
      return `pair(${e.soup} + ${e.swallow})`;
    case 'partial':
      return `partial(${e.id})`;
    case 'single':
      return `single(${e.id})`;
    case 'none':
      return 'none';
  }
}

test('matchPair accuracy on hard real-world cases', () => {
  const results = CASES.map((c) => ({
    ...c,
    passed: scores(matchPair(c.input, DISHES), c.expect),
    actual: describeActual(c.input),
  }));

  const passed = results.filter((r) => r.passed).length;
  const accuracy = passed / results.length;

  const failures = results.filter((r) => !r.passed);

  const report = [
    '',
    '=== matchPair eval ===',
    `Accuracy: ${passed}/${results.length}  (${Math.round(accuracy * 100)}%)`,
    '',
    ...(failures.length
      ? [
          'Failing cases:',
          ...failures.map(
            (f) =>
              `  "${f.input}"\n      expected ${describeExpected(f.expect)}\n      got      ${f.actual}\n      why      ${f.why}`
          ),
        ]
      : ['All cases passing.']),
    '',
  ].join('\n');

  // eslint-disable-next-line no-console
  console.log(report);

  expect(accuracy).toBeGreaterThanOrEqual(BASELINE);
});
