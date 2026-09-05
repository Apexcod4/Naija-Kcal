import { fireEvent, within } from '@testing-library/react-native';
import { renderScreen } from '../src/test-utils';
import Portion from './portion';
import { useAppStore } from '../src/state/useAppStore';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), dismissAll: jest.fn(), replace: jest.fn(), push: jest.fn() }),
}));

beforeEach(() => useAppStore.getState().resetAll());

test('the CTA carries the live number', () => {
  const { getByText } = renderScreen(<Portion />);
  expect(getByText('Log 610 kcal')).toBeTruthy();
});

test('stepping a unit updates the CTA immediately', () => {
  const { getByTestId, getByText } = renderScreen(<Portion />);
  fireEvent.press(within(getByTestId('wraps-stepper')).getByTestId('stepper-plus'));
  // 1.5 wraps + 1 ladle = 480 + 290 = 770
  expect(getByText('Log 770 kcal')).toBeTruthy();
});

test('choosing a half share halves the number', () => {
  const { getByText } = renderScreen(<Portion />);
  fireEvent.press(getByText('Half'));
  expect(getByText('Log 305 kcal')).toBeTruthy();
});

test('the share note changes with the selection', () => {
  const { getByText, queryByText } = renderScreen(<Portion />);
  expect(getByText('Counted as your own bowl, not a split.')).toBeTruthy();
  fireEvent.press(getByText('Half'));
  expect(queryByText('Counted as your own bowl, not a split.')).toBeNull();
});

test('the share prompt disappears for a household of one', () => {
  useAppStore.getState().setHouseholdSize(1);
  const { queryByText } = renderScreen(<Portion />);
  expect(queryByText('Half')).toBeNull();
});
