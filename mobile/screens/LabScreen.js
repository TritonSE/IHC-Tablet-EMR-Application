import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  Modal,
  Alert,
  AppRegistry,
  TextInput,
  Switch,
  CheckBox,
} from 'react-native';
let t = require('tcomb-form-native');
let Form = t.form.Form;

import {localData, serverData} from '../services/DataService';
import Soap from '../models/Soap';
import {stringDate} from '../util/Date';
import Container from '../components/Container';
import Button from '../components/Button';
import {downstreamSyncWithServer} from '../util/Sync';
import { Col, Grid } from 'react-native-easy-grid';
import Triage from '../models/Triage';
import LabRequest from '../models/LabRequest';
import { DataTable } from 'react-native-paper';
import TriageLabsWheel from '../components/TriageLabsWheel';
import TriageHistory from './TriageHistory';

const MU_UNICODE = '\u03bc';
const Hb = "Hb";
const HbA1c = "HbA1c";
const BloodGlucoseLevel = "Blood Glucose Level";
const Urine = "Urine";
const tests = [
  Hb,
  HbA1c,
  BloodGlucoseLevel,
  Urine
];

class LabScreen extends Component<{}> {
  /*
   * Redux props:
   * loading: boolean
   * currentPatientKey: string
   *
   * Props:
   * name: patient's name for convenience
   * patientKey: string of patient's key
   * todayDate (optional, if doesn't exist, then assume date is for today,
   *   can be used for gathering old traige data from history)
   */
  constructor(props) {
    super(props);
    const todayDate = this.props.todayDate || stringDate(new Date());
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
      formValues: {date: todayDate},
      todayDate: todayDate,
      date: stringDate(new Date()),
      hasInsurance: false,
      location: 'ihc',
      timeIn: `${new Date().getTime()}`,
      timeOut: null,
      triager: 'Alex',
      status: "student",
      history: 'placeholder',
      pharmacySection: 'placeholder',
      labsDone: true,
      isFemale: true,
      urineTestDone: true,
      menstruation: 'Last Menstrual Period',
      pregancy: 'Pregnancies (#)',
      abortion: 'Abortions (#)',
      livebirths: 'Live Births (#)',
      miscarriages: 'Miscarriages (#)',
      height: '',
      weight: '',
      weightswitch: false,
      rr: '',
      temp: '',
      tempswitch: false,
      o2: '',
      bp: '',
      hr: '',
      allergies: '',
      medications: '',
      surgeries: '',
      immunizations: '',
      chiefComplaint: '',
      hb: '',
      hba1c: '',
      bgl: 'Blood Glucose Level',
      fasting: false,
      pregnant: false,
      unitswitch: false,
      showing: this.props.showing ? this.props.showing : tests,
      labTestObjects: labTestObjects,
    };
  }

  loadExistingTriage = () => {
    console.log("Triage page key is  ", this.props.currentPatientKey);
    let triageObj = localData.getTriage(this.props.currentPatientKey, stringDate(new Date()));
    if (!triageObj) {
      this.props.setLoading(false);
      return;
    }
    let triage = Object.assign({}, triageObj);
    let intVals = ['height', 'weight', 'rr', 'temp', 'o2', 'hr'];
    intVals.forEach( obj => {
      //if(triage[obj]){
        triage[obj] = triage[obj].toString();
      //}
    });

    this.setState({...triage,
      labTestObjects: this.getExistingLabTestObjects(triage, this.state.labTestObjects)});

  }

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

  loadPastTriages = () => {
    let patient = localData.getPatient(this.props.currentPatientKey);
    this.setState({patientTriages: patient.triages});
  }

  componentWillMount = () => {
    this.loadExistingTriage();
    this.loadPastTriages();
  }

  submit = () => {
    if(!this.state.timeOut){
      Alert.alert('Confirmation', 'Do you want to mark this lab complete?',
        [{text: 'Yes', onPress: () => {
          this.setState({timeOut: `${new Date().getTime()}`}, () => {
            localData.markLabRequestComplete(this.props.labRequestKey);
            this.save();
            this.markStatus();
            this.successConfirm();
          });
        }},
        {text: 'No', onPress: () => {
          console.log('cancel');
        }}]);
    }else{
      this.setState({timeOut: `${new Date().getTime()}`}, () => {
        this.save();
        localData.markLabRequestComplete(this.props.labRequestKey);
        Alert.alert('Updated', 'The lab results have been updated.',
          [{text: 'Close', onPress: () => {
            console.log('Close');
          }}]);
      });
    }
  }

  requestLabTest = (testName) => {
    var labRequest = {
      key: '',
      patientKey: this.props.currentPatientKey,
      testType: testName,
      dateRequested: new Date().getMonth() + "/" + new Date().getDay() + "/" + new Date().getFullYear(),
      dateCompleted: '',
      lastUpdated: 0
    }
    try {
      localData.enqueueLabRequest(labRequest);
      Alert.alert('Lab request sent', `${testName} lab request has been sent`,
            [{text: 'Close', onPress: () => {
              console.log('Close');
            }}]);
    } catch(e) {
      try {
      var key = LabRequest.makeKey(labRequest);
      localData.updateLabRequest(key, labRequest);
        Alert.alert('Lab request updated', `${testName} lab request has been updated`,
              [{text: 'Close', onPress: () => {
                console.log('Close');
              }}]);
      } catch(e) {
        this.props.setErrorMessage(e.message);
        Alert.alert('Error', e.message,
              [{text: 'Close', onPress: () => {
                console.log('Close');
              }}]);
      }
    }
  }

  save = () => {
    this.props.clearMessages();
    this.props.setLoading(true);
    let formVals = Object.assign({}, this.state);
    console.log(formVals);
    delete formVals.patientTriages;
    const triage = Triage.extractFromForm(formVals, this.props.currentPatientKey, this.state.labTestObjects);
    try {
      localData.updateTriage(triage);
      this.props.setSuccessMessage("Saved Successfully");
      this.props.setLoading(false);
    } catch(e) {
      this.props.setErrorMessage(e.message);
      this.props.setLoading(false);
      return;
    }

    try {
      serverData.updateTriage(triage)
        .then( () => {
          console.log('updated server successfully');
          if (this.props.loading) {
            this.props.setLoading(false);
            this.props.setSuccessMessage('Triage updated successfully');
          }
        })
        .catch( (e) => {
          console.log('error in server', e);
          if (this.props.loading) {
            localData.markPatientNeedToUpload(this.props.currentPatientKey);
            this.props.setLoading(false, true);
            this.props.setErrorMessage(e.message);
          }
        });
    } catch(e) {
      console.log('error in local', e);
      this.props.setErrorMessage(e.message);
      this.props.setLoading(false);
      return;
    }
  }

  markStatus = () => {
    this.props.setLoading(true);
    let statusObj = {};
    try {
      statusObj = localData.updateStatus(this.props.currentPatientKey, stringDate(new Date()),
        'triageCompleted', new Date().getTime());
      console.log('marked complete locally');
    } catch(e) {
      console.log('issue in local ');
      this.props.setLoading(false);
      this.props.setErrorMessage(e.message);
      return;
    }

    this.props.isUploading(true);
    serverData.updateStatus(statusObj)
      .then( () => {
        console.log('marked complete in server');
        // View README: Handle syncing the tablet, point 3 for explanation
        if(this.props.loading) {
          this.props.setLoading(false);
          this.props.setSuccessMessage('Triage marked as completed, but not yet submitted');
        }
      })
      .catch( (e) => {
        console.log('issue in server');
        if(this.props.loading) {
          localData.markPatientNeedToUpload(this.props.currentPatientKey);
          this.props.setErrorMessage(e.message);
          this.props.setLoading(false, true);
        }
      });
  }

  showSave = () => {
    try {
      this.save();
      Alert.alert('Saved', 'Your Changes have been saved',
        [{text: 'Close', onPress: () => {
          console.log('Saved');
        }}]);
    }catch(e){

    }
  }

  successConfirm = () => {
    Alert.alert('Success', 'Triage is marked completed', [
      {text: 'Close', onPress: () => {
        console.log('Close');
      }}
    ]);
  }

  // Updates the timestamp that displays in the PatientSelectScreen
  // Doesn't actually save the SOAP form

  updateLabTests = (name, result, labTestObjects) => {
    const oldTests = Object.assign({}, labTestObjects);
    oldTests[name].result = result;
    this.setState(oldTests);
  }

  render() {
    return (
      <Container>
        <View style={styles.triagescreen}>
        <View style={styles.triagesection}>
          <Text style={styles.subtitle}>Labs </Text>
          <View style={styles.inputsection}>
            {
              this.state.showing.find(elem => elem == Hb) ?
                <Text style={{fontSize: 18, marginTop:12}}>{Hb}</Text>
                : null
            }
            {
              this.state.showing.find(elem => elem == HbA1c) ?
                <Text style={{fontSize: 18, marginTop:25}}>{HbA1c}</Text>
                : null
            }
            {
              this.state.showing.find(elem => elem == BloodGlucoseLevel) ?
                <Text style={{fontSize: 18, marginTop:25}}>{BloodGlucoseLevel}</Text>
                : null
            }
          </View>
          <View style={styles.inputsection}>
            {
              this.state.showing.find(elem => elem == Hb) ?
                <TextInput
                  style={styles.input, {width: 300}}
                  onChangeText={(hb) => this.setState({hb})}
                  value={this.state.hb}
                />
                : null
            }
            {
              this.state.showing.find(elem => elem == HbA1c) ?
                <TextInput
                  style={styles.input, {width: 300}}
                  onChangeText={(hba1c) => this.setState({hba1c})}
                  value={this.state.hba1c}
                />
                : null
            }
            {
              this.state.showing.find(elem => elem == BloodGlucoseLevel) ?
                <TextInput
                  style={styles.input, {width: 300}}
                  onChangeText={(bgl) => this.setState({bgl})}
                  value={this.state.bgl}
                />
                : null
            }
          </View>


        </View>

        {
          this.state.showing.find(elem => elem == Urine) ?
          <View style={styles.triagesection}>
            <Text style={styles.subtitle, {marginBottom: 30, fontSize: 20, color:'#0055FF'}}>Urine Test</Text>
            <TriageLabsWheel
              enabled={true}
              updateLabResult={(name, result) =>
                  this.updateLabTests(name, result, this.state.labTestObjects)}
              tests = {Object.values(this.state.labTestObjects)}
            />
          </View>
          : <View></View>
        }
                {true?
                  <View>
                    <Button onPress={this.submit}
                      style={{marginVertical: 20,}}
                      text='Submit' />
                  </View>: null
                }
          <View style={{display:"flex", flexDirection: "row"}}>
              {
                this.props.doctorView ? 
                // Request test buttons
                tests.map((test, i) => {
                  return(
                    <Button onPress={() => this.requestLabTest(test)}
                      style={{marginVertical: 20, width: (100/ tests.length) + "%"}}
                      text= {`Request ${test} lab test`}
                      key={i} />
                  );
                })
                : null
              }
            </View>
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
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  expand: {
    borderColor: 'white',
    borderWidth: 2.0,
    borderRadius: 10,
    justifyContent: 'center',
    backgroundColor: '#0660ae',
  },
  gridContainer: {
    flex: 1,
    maxWidth: '80%',
    alignItems: 'center',
  },
  col: {
    alignItems: 'center',
  },
  triagescreen:{
    flexDirection: 'column',
    maxWidth: '100%',
  },
  triagesection: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 50,
    flex:1,
    flexWrap: 'wrap'
  },
  inputsection: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    padding: 10,
    start: 100,
    alignItems: 'flex-start',
  },
  inputunitsection:{
    flexDirection: 'column',
    start: 0,
    maxWidth: 100,
    justifyContent: 'flex-start',
    padding: 10,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 5,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'left',
    margin: 2,
    color:'#0055FF'
  },
  units: {
    fontSize: 12,
    marginLeft: 20,
    height: 40,
    marginTop: 10,
  },
  button: {
    width: '80%',
    alignItems: 'center',
    marginBottom: 50,
  },
  input: {
    marginBottom: 10,
    width: 400,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
  },
  switch: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  }
});

// Redux
import { setLoading, setSuccessMessage, setErrorMessage, clearMessages, isUploading } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  loading: state.loading,
});

const mapDispatchToProps = dispatch => ({
  setLoading: (val,showRetryButton) => dispatch(setLoading(val, showRetryButton)),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
  setSuccessMessage: val => dispatch(setSuccessMessage(val)),
  clearMessages: () => dispatch(clearMessages()),
  isUploading: val => dispatch(isUploading(val))
});

export default connect(mapStateToProps, mapDispatchToProps)(LabScreen);
