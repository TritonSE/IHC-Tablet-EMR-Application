//require('react-native-mock/mock'); // Must be first line for tests that include enzyme
import 'react-native';
import React from 'react';
import SigninScreen from '../screens/SigninScreen';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import { shallow } from 'enzyme';
import sinon from 'sinon';
// import data from '../services/DataService';

import { createStore } from 'redux';
import reducers from '../reduxReducers/reducers';
import { Provider } from 'react-redux';

const store = createStore(reducers);

it('renders correctly for default (existing patient)', () => {
  sinon.useFakeTimers(100);
  const json = renderer.create(
    <Provider store={store}>
      <SigninScreen />
    </Provider>
  ).toJSON();
  expect(json).toMatchSnapshot();
});

it('renders correctly for new patient', () => {
  sinon.useFakeTimers(100);
  // TODO: Once the "cannot read property number of undefined" problem is gone,
  // this should work??
//  sinon.stub(data, "createPatient");
//  sinon.stub(data, "signinPatient");
  const component = shallow(
    <Provider store={store}>
      <SigninScreen />
    </Provider>
  );
  expect(component).toMatchSnapshot();
  component.setState({formValues: {newPatient: true}});
  expect(component).toMatchSnapshot();
});
