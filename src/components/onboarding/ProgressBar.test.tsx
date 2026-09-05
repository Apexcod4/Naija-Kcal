import { render } from '@testing-library/react-native';
import ProgressBar from './ProgressBar';

test('reports progress to assistive tech', () => {
  const { getByRole } = render(<ProgressBar percent={42} />);
  expect(getByRole('progressbar').props.accessibilityValue).toMatchObject({
    now: 42,
    min: 0,
    max: 100,
  });
});

test('clamps out-of-range values', () => {
  const { getByRole } = render(<ProgressBar percent={140} />);
  expect(getByRole('progressbar').props.accessibilityValue.now).toBe(100);
});

test('clamps negatives to zero', () => {
  const { getByRole } = render(<ProgressBar percent={-20} />);
  expect(getByRole('progressbar').props.accessibilityValue.now).toBe(0);
});
