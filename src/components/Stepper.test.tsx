import { render, fireEvent } from '@testing-library/react-native';
import Stepper from './Stepper';

test('the 34px buttons expand to a 44px hit target', () => {
  const { getByTestId } = render(<Stepper value={1} label="1" onStep={() => {}} />);
  // 34 visual + 5 hitSlop on each side = 44, the minimum the handoff requires.
  expect(getByTestId('stepper-plus').props.hitSlop).toMatchObject({
    top: 5, bottom: 5, left: 5, right: 5,
  });
});

test('reports the delta rather than the new value', () => {
  const onStep = jest.fn();
  const { getByTestId } = render(<Stepper value={1} label="1" onStep={onStep} />);
  fireEvent.press(getByTestId('stepper-plus'));
  expect(onStep).toHaveBeenCalledWith(0.5);
  fireEvent.press(getByTestId('stepper-minus'));
  expect(onStep).toHaveBeenCalledWith(-0.5);
});
