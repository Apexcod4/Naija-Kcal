import { render } from '@testing-library/react-native';
import FoodTile from './FoodTile';

test('falls back to the placeholder colour when there is no photo', () => {
  const { getByTestId, queryByTestId } = render(<FoodTile colour="#8A5A22" />);
  expect(getByTestId('food-swatch')).toBeTruthy();
  expect(queryByTestId('food-photo')).toBeNull();
});

test('renders the photo when one is supplied', () => {
  const { getByTestId, queryByTestId } = render(
    <FoodTile colour="#8A5A22" photoUri="file:///meal.jpg" />
  );
  expect(getByTestId('food-photo')).toBeTruthy();
  expect(queryByTestId('food-swatch')).toBeNull();
});
