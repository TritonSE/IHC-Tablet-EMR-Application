import 'react-native';
import React from 'react';
import MedicationScreen from '../screens/MedicationScreen';

import DrugUpdate from '../models/DrugUpdate';
import Status from '../models/Status';
import sinon from 'sinon';
import {localData} from '../services/DataService';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

import { createStore } from 'redux';
import reducers from '../reduxReducers/reducers';
import { Provider } from 'react-redux';

const store = createStore(reducers);

it('renders correctly', () => {
  sinon.useFakeTimers(100);
  const drug1 = DrugUpdate.getInstance();
  const drug2 = DrugUpdate.getInstance();
  sinon.stub(localData, 'getMedicationUpdates').returns([drug1, drug2]);
  sinon.stub(localData, 'getStatus').returns(Status.newStatus({key: 'key'}));

  const fakeNavigator = { setOnNavigatorEvent: (param) => {} };
  const json = renderer.create(
    <Provider store={store}>
      <MedicationScreen navigator={fakeNavigator} />
    </Provider>
  ).toJSON();
  expect(json).toMatchSnapshot();
});
