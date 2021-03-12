/* eslint-disable */
import React, { Component } from 'react';
import {
  View,
  Button,
} from 'react-native';
import {serverData} from '../services/DataService';
import Patient from '../models/Patient';

export default class TestServerScreen extends Component<{}> {
  testGet = () => {
    // Replace serverData call with GET function being tested
    const patientKey = Patient.getInstance().key;
    console.log('GET called');
    serverData.getPatient(patientKey).then( (patient) => {
      console.log('Patient:', patient);
    }).catch( (err) => {
      console.log('ERROR:', err.message);
    });
  }

  testPostPut = () => {
    // Replace serverData call with POST/PUT function being tested
    const patient = Patient.getInstance();
    console.log('POST/PUT called');
    serverData.createPatient(patient).then( () => {
      console.log('Service completed');
    }).catch( (err) => {
      console.log('ERROR:', err.message);
    });
  }

  render() {
    return (
      <View>
        <Button title="Test GET" onPress={this.testGet} />
        <Button title="Test POST/PUT" onPress={this.testPostPut} />
      </View>
    );
  }
}
/* eslint-enable */
