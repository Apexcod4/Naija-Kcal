import { fireEvent, render } from '@testing-library/react-native';
import { Text } from 'react-native';
import PressableScale from './PressableScale';

test('still fires onPress like a plain Pressable', () => {
  const onPress = jest.fn();
  const { getByTestId } = render(
    <PressableScale testID="btn" onPress={onPress}>
      <Text>Log</Text>
    </PressableScale>
  );
  fireEvent.press(getByTestId('btn'));
  expect(onPress).toHaveBeenCalledTimes(1);
});

test('a disabled button does not fire', () => {
  const onPress = jest.fn();
  const { getByTestId } = render(
    <PressableScale testID="btn" disabled onPress={onPress}>
      <Text>Log</Text>
    </PressableScale>
  );
  fireEvent.press(getByTestId('btn'));
  expect(onPress).not.toHaveBeenCalled();
});

test('forwards accessibility props', () => {
  const { getByLabelText } = render(
    <PressableScale accessibilityRole="button" accessibilityLabel="Scan a meal" onPress={() => {}}>
      <Text>Scan</Text>
    </PressableScale>
  );
  expect(getByLabelText('Scan a meal')).toBeTruthy();
});
