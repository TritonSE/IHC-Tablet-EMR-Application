import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableHighlight,
  ScrollView,
  TextInput,
  Switch
} from 'react-native';
let t = require('tcomb-form-native');
let Form = t.form.Form;
import {localData, serverData} from '../services/DataService';
import Triage from '../models/Triage';
import {stringDate} from '../util/Date';
import Container from '../components/Container';
import Button from '../components/Button';
import TriageLabsWheel from '../components/TriageLabsWheel';
import {downstreamSyncWithServer} from '../util/Sync';

const MU_UNICODE = '\u03bc';

class TriageScreen extends Component<{}> {
  /**
   * Redux props:
   * currentPatientKey
   * loading
   * todayDate (optional, if doesn't exist, then assume date is for today,
   *   can be used for gathering old traige data from history)
   */
  constructor(props) {
    super(props);
    this.startingFormValues = {
      labsDone: false,
      urineTestDone: false,
      date: this.props.todayDate || stringDate(new Date())
    };

    // Hold objects including a test's propertyName, displayName, options, and result (int that
    // indexes into the options array)
    // The keys in this object should also match the propertyName
    const labTestObjects = {
      glucose: TriageLabsWheel.createLabTestObject('glucose', 'glucose (mg/dL)',
        ['-', '100(+/-)', '250(+)', '500(++)', '1000(+++)', '>=2000(++++)']),
      bilirubin: TriageLabsWheel.createLabTestObject('bilirubin', 'bilirubin (mg/dL)',
        ['-', '1(+)', '2(++)', '4(+++)']),
      ketone: TriageLabsWheel.createLabTestObject('ketone', 'ketone (mg/dL)', ['-', '5(+/-)', '15(+)']),
      specificGravity: TriageLabsWheel.createLabTestObject('specificGravity', 'specific gravity',
        ['1.000', '1.005', '1.010', '1.015', '1.020', '1.025', '1.030']),
      blood: TriageLabsWheel.createLabTestObject('blood', 'blood',
        ['-', '+/-', '+', '5-10', `50 Ery/${MU_UNICODE}L`]),
      ph: TriageLabsWheel.createLabTestObject('ph', 'pH', ['5.0', '6.0', '6.5', '7.0', '7.5', '8.0', '9.0']),
      protein: TriageLabsWheel.createLabTestObject('protein', 'protein (mg/dL)', ['-', '5(+/-)', '15(+)']),
      uroglobin: TriageLabsWheel.createLabTestObject('uroglobin', 'uroglobin (mg/dL)',
        ['0.2', '1', '2', '4', '8', '12']),
      nitrites: TriageLabsWheel.createLabTestObject('nitrites', 'nitrites', ['-', '+']),
      leukocytes: TriageLabsWheel.createLabTestObject('leukocytes', `leukocytes (Leu/${MU_UNICODE}L)`,
        ['-', '15 (+/-)', '70(+)', '125(++)', '500(+++)'])
    };

    this.state = {
      formValues: this.startingFormValues,
      formType: Triage.getFormType(this.startingFormValues, 2),
      gender: 2, // 1: male, 2: female
      todayDate: this.startingFormValues.date,
      labTestObjects: labTestObjects
    };

    this.props.clearMessages();
  }

  // TODO: any other styling? multiline fields needed?
  options = {
    fields: {
      statusClarification: {label: 'Status clarification (if picked Other)'},
      labsDone: {label: 'Did they get labs done?'},
      date: {
        editable: false,
      }
    },
  }

  // to set the triage form correctly depending on gender
  loadPatient = () => {
    this.props.setLoading(true);

    try {
      const patient = localData.getPatient(this.props.currentPatientKey);
      this.setState({
        gender: patient.gender,
      });

      // Call loadFormValues here, or else gender state isn't propogated like
      // expected
      this.loadFormValues(patient.gender);
    } catch(err) {
      this.props.setErrorMessage(err.message);
      this.props.setLoading(false);
    }
  }

  // Load existing Triage info if it exists
  loadFormValues = (gender) => {
    this.props.setLoading(true);
    const triage = localData.getTriage(this.props.currentPatientKey, this.state.todayDate);
    if (!triage) {
      this.props.setLoading(false);
      this.setState({
        formType: Triage.getFormType(this.startingFormValues, gender)
      });
      return;
    }

    this.setState({
      formType: Triage.getFormType(triage, gender),
      formValues: triage,
      labTestObjects: this.getExistingLabTestObjects(triage, this.state.labTestObjects),
    });

    downstreamSyncWithServer()
      .then( (failedPatientKeys) => {
        if (this.props.loading) {
          if (failedPatientKeys.length > 0) {
            throw new Error(`${failedPatientKeys.length} patients didn't properly sync.`);
          }

          const triage = localData.getTriage(this.props.currentPatientKey, this.state.todayDate);
          if (!triage) {
            this.props.setLoading(false);
            this.setState({
              formType: Triage.getFormType(this.startingFormValues, gender)
            });
            return;
          }

          this.props.setLoading(false);
          this.setState({
            formType: Triage.getFormType(triage, gender),
            formValues: triage,
            labTestObjects: this.getExistingLabTestObjects(triage, this.state.labTestObjects),
          });
        }
      })
      .catch( (err) => {
        if (this.props.loading) {
          this.props.setErrorMessage(err.message);
          this.props.setLoading(false);
        }
      });
  }

  // From an existing triage form, properly update the lab test objects with the
  // existing values
  // Pass in the lab test objects we are getting values from
  getExistingLabTestObjects = (triage, labTestObjects) => {
    const labTestObjectsCopy = Object.assign({}, labTestObjects);
    // For each test, set the result field of the labTestObject to the proper
    // index of the options array
    for(const [testName,test] of Object.entries(labTestObjectsCopy)) {
      if(!triage[testName]){
        // If there is no value yet for that test, then skip it
        continue;
      }
      test.result = test.options.indexOf(triage[testName]);
      if(test.result === -1) {
        throw new Error(`${test} does not contain string option ${triage[testName]}`);
      }
    }
    return labTestObjectsCopy;
  }

  componentDidMount() {
    this.loadPatient();
  }

  onFormChange = (value) => {
    this.setState({
      formType: Triage.getFormType(value, this.state.gender),
      formValues: value,
    });
  }

  // Updates the timestamp that displays in the PatientSelectScreen
  // Doesn't actually save the Triage form
  completed = () => {
    this.setModalVisible(!this.state.modalVisible);
    this.props.setLoading(true);
    let statusObj = {};
    try {
      statusObj = localData.updateStatus(this.props.currentPatientKey, this.state.todayDate,
        'triageCompleted', new Date().getTime());
    } catch(e) {
      this.props.setLoading(false);
      this.props.setErrorMessage(e.message);
      return;
    }

    this.props.isUploading(true);
    serverData.updateStatus(statusObj)
      .then( () => {
        // View README: Handle syncing the tablet, point 3 for explanation
        if(this.props.loading) {
          this.props.setLoading(false);
          this.props.setSuccessMessage('Triage marked as completed, but not yet submitted');
        }
      })
      .catch( (e) => {
        if(this.props.loading) {
          localData.markPatientNeedToUpload(this.props.currentPatientKey);
          this.props.setErrorMessage(e.message);
          this.props.setLoading(false, true);
        }
      });
  }

  // Saves the Triage, first locally, then over the server
  submit = () => {
    if(!this.refs.form.validate().isValid()) {
      this.props.setErrorMessage('Form not correct. Review form.');
      return;
    }

    this.props.clearMessages();
    this.props.setLoading(true);

    const form = this.refs.form.getValue();
    const triage = Triage.extractFromForm(form, this.props.currentPatientKey, this.state.labTestObjects);

    try {
      localData.updateTriage(triage);
    } catch(e) {
      this.props.setErrorMessage(e.message);
      this.props.setLoading(false);
      return;
    }

    serverData.updateTriage(triage)
      .then( () => {
        if (this.props.loading) {
          this.props.setLoading(false);
          this.props.setSuccessMessage('Triage updated successfully');
        }
      })
      .catch( (e) => {
        if (this.props.loading) {
          localData.markPatientNeedToUpload(this.props.currentPatientKey);

          this.props.setLoading(false, true);
          this.props.setErrorMessage(e.message);
        }
      });
  }

  gotoMedications = () => {
    this.props.navigator.push({
      screen: 'Ihc.MedicationScreen',
      title: 'Back to triage',
      passProps: { name: this.props.name, patientKey: this.props.currentPatientKey }
    });
  }

  // Takes in the test name and the string result
  updateLabTests = (name, result, labTestObjects) => {
    const oldTests = Object.assign({}, labTestObjects);
    oldTests[name].result = result;
    this.setState(oldTests);
  }

  // These is for the modal
  state = {
    modalVisible: false,
  };

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

  render() {
    return (
      <View style={styles.triageContainer}>

        <Button
        onPress={() => {
          this.setModalVisible(true);
        }}
        style={styles.button}
        text='Add New Form for April 20, 2019' />

        <Container>

        <View style={{marginTop: 50}}>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
            }}>
            <View style={{paddingHorizontal: '10%'}}>
              <ScrollView>
                <View>
                  <Text style={styles.title}>New Triage Form: April 20, 2019</Text>

                  <View style={styles.formContainer}>
                    <Text style={styles.nameModal}>Firstname Middlename Motherslast Fatherslast</Text>
                    <Text style={styles.dateModal}>April 20, 1969</Text>
                  </View>
                  <View style={styles.separator}></View>

                  <View style={styles.formContainer}>
                    <View style={{width: '25%', marginRight: '5%', height: 50}}>
                      <Text style={styles.nameModal}>Chief Complaint</Text>
                    </View>
                    <View style={{width: '70%'}}>
                      <Form ref='form'
                        type={this.state.formType}
                        value={this.state.formValues}
                        options={this.options}
                        onChange={this.onFormChange}
                      />
                      </View>

                  </View>

                  {
                    this.state.formValues.urineTestDone ?
                      (
                        <View style={styles.labsContainer}>
                          <TriageLabsWheel
                            updateLabResult={(name, result) =>
                              this.updateLabTests(name, result, this.state.labTestObjects)}
                            tests = {Object.values(this.state.labTestObjects)}
                          />
                        </View>
                      ) : null
                  }

                  <Button onPress={this.completed}
                    style={{marginVertical: 50,}}
                    text='Triage completed' />

                </View>
              </ScrollView>
            </View>
          </Modal>
        </View>

          <View style={styles.form}></View>

        </Container>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  formContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  triageContainer: {
    margin: '1%',
  },
  nameModal: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  dateModal: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    marginLeft: 'auto'
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#D8D8D8',
    marginTop: 15,
    marginBottom: 35,
  },
  form: {
    width: '80%',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    color: 'black',
    margin: 10,
    marginVertical: 40,
    fontWeight: 'bold',
  },
  labsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start'
  }
});

// Redux
import { setLoading, setErrorMessage, setSuccessMessage, clearMessages, isUploading } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  loading: state.loading,
  currentPatientKey: state.currentPatientKey
});

const mapDispatchToProps = dispatch => ({
  setLoading: (val,showRetryButton) => dispatch(setLoading(val, showRetryButton)),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
  setSuccessMessage: val => dispatch(setSuccessMessage(val)),
  clearMessages: () => dispatch(clearMessages()),
  isUploading: val => dispatch(isUploading(val)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TriageScreen);
