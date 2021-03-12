import 'react-native';
import React from 'react';
import PatientHomeScreen from '../screens/PatientHomeScreen';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

import { createStore } from 'redux';
import reducers from '../reduxReducers/reducers';
import { Provider } from 'react-redux';

const store = createStore(reducers);

it('renders correctly', () => {
  const fakeNavigator = { setOnNavigatorEvent: (param) => {} };
  const json = renderer.create(
    <Provider store={store}>
      <PatientHomeScreen todayDateString={'Tue Apr 10 2018'} navigator={fakeNavigator} />
    </Provider>
  ).toJSON();
  expect(json).toMatchSnapshot();
});
