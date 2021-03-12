import 'react-native';
import React from 'react';
import PatientHistoryScreen from '../screens/PatientHistoryScreen';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import sinon from 'sinon';
import {localData} from '../services/DataService';
import Patient from '../models/Patient';

import { createStore } from 'redux';
import reducers from '../reduxReducers/reducers';
import { Provider } from 'react-redux';

const store = createStore(reducers);

it('renders correctly', () => {
  sinon.stub(localData, 'getPatient').returns(Patient.getInstance());

  const fakeNavigator = { setOnNavigatorEvent: (param) => {} };
  const json = renderer.create(
    <Provider store={store}>
      <PatientHistoryScreen todayDate = '20180101' navigator={fakeNavigator} />
    </Provider>
  ).toJSON();
  expect(json).toMatchSnapshot();
});
