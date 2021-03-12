import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
let t = require('tcomb-form-native');
let Form = t.form.Form;
import {localData, serverData} from '../services/DataService';
import DrugUpdate from '../models/DrugUpdate';
import Container from '../components/Container';
import Button from '../components/Button';

class MedicationUpdateScreen extends Component<{}> {
  /*
   * Redux props:
   *   loading: boolean
   *   currentPatientKey: what patient is this for
   * Props from parent:
   *   action: 'change' or 'new'
   *   drugUpdate: If action is 'change', then what is the old update info
   */
  constructor(props) {
    super(props);
    this.state = {
      formValues: this.props.drugUpdate,
    };
  }

  DrugUpdateForm = t.struct({
    name: t.String, // drug name
    dose: t.String,
    frequency: t.String,
    duration: t.String,
    notes: t.maybe(t.String)
  });

  formOptions = {
    fields: {
      name: {
        editable: this.props.action === 'new'
      },
      notes: {
        multiline: true,
        numberOfLines: 5
      }
    }
  }

  submit = () => {
    if(!this.refs.form.validate().isValid()) {
      return;
    }
    const form = Object.assign({}, this.refs.form.getValue());

    const update = DrugUpdate.extractFromForm(form, this.props.currentPatientKey);

    try {
      localData.updateDrugUpdate(update);
    } catch(e) {
      this.setErrorMessage(e.message);
      return;
    }

    // Upload to server
    this.props.setLoading(true);
    this.props.isUploading(true);

    serverData.updateDrugUpdate(update)
      .then( () => {
        if(this.props.loading) {
          // if successful, then pop screen
          this.props.navigator.pop();
        }
      })
      .catch( (e) => {
        if(this.props.loading) {
          localData.markPatientNeedToUpload(this.props.currentPatientKey);

          this.setErrorMessage(e.message);
          this.props.setLoading(false, true);
        }
      });
  }

  render() {
    return (
      <Container>
        <Text style={styles.title}>
          {this.props.action === 'new' ? 'New Medication' : 'Update Medication'}
        </Text>

        <View style={styles.form}>
          <Form ref="form" type={this.DrugUpdateForm}
            value={this.state.formValues}
            options={this.formOptions}
          />

          <Button onPress={this.submit}
            style={styles.submitButton}
            text="Submit" />
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  form: {
    width: 400,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  submitButton: {
    width: '100%'
  }
});

// Redux
import { setLoading, setErrorMessage, isUploading } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  loading: state.loading,
  currentPatientKey: state.currentPatientKey
});

const mapDispatchToProps = dispatch => ({
  setLoading: (val,showRetryButton) => dispatch(setLoading(val, showRetryButton)),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
  isUploading: val => dispatch(isUploading(val))
});

export default connect(mapStateToProps, mapDispatchToProps)(MedicationUpdateScreen);
