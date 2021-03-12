import 'react-native';
import React from 'react';
import PatientSelectScreen from '../screens/PatientSelectScreen';

import Patient from '../models/Patient';
import Status from '../models/Status';
import {localData} from '../services/DataService';

import sinon from 'sinon';
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

import { createStore } from 'redux';
import reducers from '../reduxReducers/reducers';
import { Provider } from 'react-redux';

const store = createStore(reducers);

it('renders correctly', () => {
  sinon.useFakeTimers(100);
  const patient = Patient.getInstance();
  const patient2 = Patient.getInstance();
  const statuses = [Status.newStatus(patient), Status.newStatus(patient2)];

  sinon.stub(localData, 'getStatuses').returns(statuses);

  const fakeNavigator = { setOnNavigatorEvent: (param) => {} };
  const json = renderer.create(
    <Provider store={store}>
      <PatientSelectScreen navigator={fakeNavigator} />
    </Provider>
  ).toJSON();
  expect(json).toMatchSnapshot();
});
