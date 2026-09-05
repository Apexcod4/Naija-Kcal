import { render } from '@testing-library/react-native';
import Toast from './Toast';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('auto-dismisses after 3.6 seconds', () => {
  const onHide = jest.fn();
  render(<Toast message="Logged 610 kcal" onHide={onHide} />);
  jest.advanceTimersByTime(3599);
  expect(onHide).not.toHaveBeenCalled();
  jest.advanceTimersByTime(1);
  expect(onHide).toHaveBeenCalledTimes(1);
});

test('does not fire after unmount', () => {
  const onHide = jest.fn();
  const { unmount } = render(<Toast message="Logged 610 kcal" onHide={onHide} />);
  unmount();
  jest.advanceTimersByTime(5000);
  expect(onHide).not.toHaveBeenCalled();
});

test('a new message restarts the timer', () => {
  const onHide = jest.fn();
  const { rerender } = render(<Toast message="first" onHide={onHide} />);
  jest.advanceTimersByTime(3000);
  rerender(<Toast message="second" onHide={onHide} />);
  jest.advanceTimersByTime(3000);
  expect(onHide).not.toHaveBeenCalled();
  jest.advanceTimersByTime(600);
  expect(onHide).toHaveBeenCalledTimes(1);
});
