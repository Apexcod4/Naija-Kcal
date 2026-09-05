import { appName } from './smoke';

test('scaffold is wired up', () => {
  expect(appName()).toBe('Naija Kcal');
});
