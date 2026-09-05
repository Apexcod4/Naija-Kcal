import { render } from '@testing-library/react-native';
import ProgressRing from './ProgressRing';
import { RING } from '../logic/rings';

test('an empty ring is fully offset', () => {
  const { getByTestId } = render(
    <ProgressRing value={0} target={2583} {...RING.calories} colour="#F24C1E" />
  );
  expect(getByTestId('ring-progress').props.strokeDashoffset).toBe(314);
});

test('a completed ring has no offset', () => {
  const { getByTestId } = render(
    <ProgressRing value={2583} target={2583} {...RING.calories} colour="#F24C1E" />
  );
  // react-native-svg normalises a zero dash offset to null on the host node.
  // The clamping arithmetic itself is covered directly in rings.test.ts.
  expect(getByTestId('ring-progress').props.strokeDashoffset).toBeNull();
});

test('a partly-filled ring wires the computed offset through', () => {
  const { getByTestId } = render(
    <ProgressRing value={1157} target={2583} {...RING.calories} colour="#F24C1E" />
  );
  expect(getByTestId('ring-progress').props.strokeDashoffset).toBeCloseTo(173.35, 1);
});
