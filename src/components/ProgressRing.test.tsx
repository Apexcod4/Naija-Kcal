import { render } from '@testing-library/react-native';
import { RING } from '../logic/rings';
import ProgressRing from './ProgressRing';

/**
 * The offset arithmetic itself is covered directly in logic/rings.test.ts.
 * What matters here is that the ring is wired to the right geometry and fills
 * on mount rather than appearing already complete.
 */

test('uses the full circumference as its dash array', () => {
  const { getByTestId } = render(
    <ProgressRing value={1157} target={2583} {...RING.calories} colour="#F24C1E" />
  );
  expect(getByTestId('ring-progress').props.strokeDasharray).toEqual([314, 314]);
});

test('starts empty and fills on mount rather than rendering complete', () => {
  const { getByTestId } = render(
    <ProgressRing value={2583} target={2583} {...RING.calories} colour="#F24C1E" />
  );
  // Even a full ring begins fully offset; the 700ms timing animation closes it.
  expect(getByTestId('ring-progress').props.strokeDashoffset).toBe(314);
});

test('macro rings carry their own smaller geometry', () => {
  const { getByTestId } = render(
    <ProgressRing value={0} target={390} {...RING.macro} colour="#E8A33D" />
  );
  expect(getByTestId('ring-progress').props.strokeDasharray).toEqual([132, 132]);
});
