import 'react-native';
import React from 'react';
import TriageScreen from '../screens/TriageScreen';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import sinon from 'sinon';

import {localData} from '../services/DataService';
import Patient from '../models/Patient';
import Triage from '../models/Triage';

import { createStore } from 'redux';
import reducers from '../reduxReducers/reducers';
import { Provider } from 'react-redux';
const store = createStore(reducers);

it('renders correctly', () => {
  sinon.useFakeTimers(100);
  sinon.stub(localData, 'getPatient').returns(Patient.getInstance());
  sinon.stub(localData, 'getTriage').returns(Triage.getInstance());

  const json = renderer.create(
    <Provider store={store}>
      <TriageScreen todayDate='20180101' />
    </Provider>
  ).toJSON();
  expect(json).toMatchSnapshot();
});
