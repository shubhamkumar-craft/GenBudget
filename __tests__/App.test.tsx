/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import Stats from '../src/screens/Stats';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({ navigate: jest.fn() }),
}));

jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }) => <>{children}</>,
      Screen: ({ children }) => <>{children}</>,
    }),
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }) => children,
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

jest.mock('react-native-vector-icons/AntDesign', () => 'AntDesign');
jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MaterialCommunityIcons');
jest.mock('react-native-vector-icons/MaterialIcons', () => 'MaterialIcons');
jest.mock('react-native-gifted-charts', () => ({
  PieChart: () => null,
}));

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});

test('shows totals from real transaction data', () => {
  const trans = [
    { id: '1', type: 'income', amount: '5000', expname: 'Salary' },
    { id: '2', type: 'expense', amount: '1200', expname: 'Rent' },
    { id: '3', type: 'expense', amount: '800', expname: 'Groceries' },
  ];

  let component;
  ReactTestRenderer.act(() => {
    component = ReactTestRenderer.create(<Stats trans={trans} />);
  });

  const output = JSON.stringify(component.toJSON());

  expect(output).toContain('₹');
});

test('opens the money coach and answers questions from transactions', () => {
  const trans = [
    { id: '1', type: 'income', amount: '5000', expname: 'Salary' },
    { id: '2', type: 'expense', amount: '1200', expname: 'Rent' },
    { id: '3', type: 'expense', amount: '800', expname: 'Groceries' },
  ];
  let component;

  ReactTestRenderer.act(() => {
    component = ReactTestRenderer.create(<Stats trans={trans} />);
  });
  ReactTestRenderer.act(() => {
    component.root.findByProps({ testID: 'open-money-coach' }).props.onPress();
  });

  ReactTestRenderer.act(() => {
    component.root.findByProps({ testID: 'money-coach-input' }).props.onChangeText('Where did I spend the most?');
  });
  ReactTestRenderer.act(() => {
    component.root.findByProps({ testID: 'send-money-coach-question' }).props.onPress();
  });

  const output = JSON.stringify(component.toJSON());
  expect(output).toContain('Money Coach');
  expect(output).toContain('Rent is your biggest spending category at');
  expect(output).toContain('60% of your expenses');
});
