import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import {formatDate} from '../util/Date';
let t = require('tcomb-form-native');
let Form = t.form.Form;

import {localData, serverData} from '../services/DataService';
import Patient from '../models/Patient';
import Container from '../components/Container';
import Button from '../components/Button';

class SigninScreen extends Component<{}> {
  /*
   * Redux props:
   *   loading: boolean
   */
  constructor(props) {
    super(props);
    this.state = {
      formValues: {newPatient: true},
      formType: this.NewPatient,
    };
  }

  Signin = t.struct({
    firstName: t.String,
    fatherName: t.String,
    motherName: t.String,
    birthday: t.Date,
    newPatient: t.Boolean,
  });

  Gender = t.enums({
    Male: 'Male',
    Female: 'Female',
  });

  // Signin fields + whatever else a new patient needs
  NewPatient = t.struct({
    firstName: t.String,
    fatherName: t.String,
    motherName: t.String,
    birthday: t.Date,
    gender: this.Gender,
    phone: t.maybe(t.String),
  });

  options = {
    fields: {
      motherName: {label: 'Mother\'s last name'},
      fatherName: {label: 'Father\'s last name'},
      birthday: {
        label: 'Birthday',
        mode: 'date',
        config: {
          format: formatDate,
          dialogMode: 'spinner'
        }
      },
      gender: {label: 'Gender'},
      phoneNumber: {label: 'Phone Number'},
    }
  }

  // If new patient button is clicked, then show extra fields

  onNavigatorEvent(event){
    if(event.id === "Check In"){
      console.log("ITS WORKING");
    }
  }

  submit = () => {
    // TODO: The Birthday field seems to return a value that is a day later than
    // the one entered
    if(!this.refs.form.validate().isValid()) {
      return;
    }
    const form = this.refs.form.getValue();
    const patient = Patient.extractFromForm(form);

    this.props.setLoading(true);
    this.props.clearMessages();
    this.props.isUploading(true);
    this.props.setCurrentPatientKey(patient.key);

      try {
        // Create patient should also add a new status object to the patient
        // that should propogate to the server call
        localData.createPatient(patient);
      } catch(e) {
        this.props.setLoading(false);
        this.props.setErrorMessage(e.message);
        return;
      }

    serverData.createPatient(patient)
      .then( () => {
        // View README: Handle syncing the tablet, point 3 for explanation
        if(this.props.loading) {
          this.props.setLoading(false);
          this.props.setSuccessMessage(`${patient.firstName} added successfully`);

          this.setState({
            // Clear form, reset to Signin form
            formValues: {newPatient: false},
            formType: this.Signin,
          });
        }
      })
      .catch( (e) => {
        if(this.props.loading) {
          // If server update fails, mark the patient as need to upload
          this.props.setLoading(false, true);
          this.props.setErrorMessage(e.message);

          localData.markPatientNeedToUpload(patient.key);
        }
      });

    return;

  }

  render() {
    return (
      <Container>
        <Text style={styles.title}>
          New Patient
        </Text>

        <View style={styles.form}>
          <Form ref='form' type={this.state.formType}
            value={this.state.formValues}
            options={this.options}
          />

          <Button onPress={this.submit}
            style={styles.button}
            text='Submit' />
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  form: {
    width: '80%',
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    margin: 20,
  },
});

// Redux
import { setLoading, setErrorMessage, setSuccessMessage, clearMessages, isUploading, setCurrentPatientKey } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  loading: state.loading,
});

const mapDispatchToProps = dispatch => ({
  setLoading: (val,showRetryButton) => dispatch(setLoading(val, showRetryButton)),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
  setSuccessMessage: val => dispatch(setSuccessMessage(val)),
  clearMessages: () => dispatch(clearMessages()),
  isUploading: val => dispatch(isUploading(val)),
  setCurrentPatientKey: key => dispatch(setCurrentPatientKey(key))
});

export default connect(mapStateToProps, mapDispatchToProps)(SigninScreen);
