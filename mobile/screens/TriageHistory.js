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
  CheckBox
} from 'react-native';
import { Col, Grid } from 'react-native-easy-grid';
import Container from '../components/Container';
import Button from '../components/Button';
import Triage from '../models/Triage';
import {stringDate} from '../util/Date';
import { DataTable } from 'react-native-paper';
import TriageLabsWheel from '../components/TriageLabsWheel';
import {localData, serverData} from '../services/DataService';


const MU_UNICODE = '\u03bc';



class TriagePageNew extends Component{
  /*
   * Expects:
   *  {
   *    name: string, patient's name (for convenience)
   *    patientKey: string
   *    todayDateString: optional, (new Date().toDateString()), helpful for
   *    tests
   *  }
   */
  constructor(props) {
    super(props);
    //this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
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
      hasInsurance: false,
      location: 'ihc',
      timeIn: `${new Date().getTime()}`,
      timeOut: null,
      triager: 'Alex',
      status: "student",
      date: stringDate(new Date()),
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
      heightswitch: false,
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
      labTestObjects: labTestObjects,
    };

  }
  /*state = {
    modalVisible: false,
  };*/

  setModalVisible(visible) {
    this.setState({modalVisible: visible});
  }

/*
  loadPastTriages = () => {
    let patient = localData.getPatient(this.props.currentPatientKey);
    this.setState({patientTriages: patient.triages});
  }*/

  componentWillMount = () => {
    this.loadExistingTriage();
    //this.loadPastTriages();
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

  loadExistingTriage = () => {
    //let triageObj = localData.getTriage(this.props.currentPatientKey, stringDate(new Date()));
    /*if (!triageObj) {
      this.props.setLoading(false);
      return;
    }*/
    let triage = Object.assign({}, this.props.triage);
    let intVals = ['height', 'weight', 'rr', 'temp', 'o2', 'hr'];
    intVals.forEach( obj => {
      //if(triage[obj]){
        triage[obj] = triage[obj].toString();
      //}
    });

    this.setState({...triage,
      labTestObjects: this.getExistingLabTestObjects(triage, this.state.labTestObjects)});

  }

  sexSwitch = (value) => {
      //onValueChange of the switch this function will be called
      this.setState({femaleswitch: value})
      //state changes according to switch
      //which will result in re-render the text
   }

   heightSwitch = (value) => {
     this.setState({heightswitch: value})
   }

  weightSwitch = (value) => {
    this.setState({weightswitch: value})
  }

  unitSwitch = (value) => {
    this.setState({unitswitch: value})
  }

  tempSwitch = (value) => {
    this.setState({tempswitch: value})
  }

  fastingSwitch = (value) => {
    this.setState({fasting: value})
  }

  pregnantSwitch = (value) => {
    this.setState({pregnant: value})
  }

  updateLabTests = (name, result, labTestObjects) => {
    const oldTests = Object.assign({}, labTestObjects);
    oldTests[name].result = result;
    this.setState(oldTests);
  }


  onNavigatorEvent(event) {
    if (event.id === 'willAppear') {
      this.props.clearMessages();
    }
  }


  submit = () => {
    this.props.clearMessages();
    this.props.setLoading(true);
    let formVals = Object.assign({}, this.state);
    delete formVals.patientTriages;
    this.setState({timeOut: `${new Date().getTime()}`}, () => {
      const triage = Triage.extractFromForm(this.state, this.props.currentPatientKey, this.state.labTestObjects);
      try {
        localData.updateTriage(triage);
        console.log('updated locally successfully');
      } catch(e) {
        console.log('error in local', e);
        this.props.setErrorMessage(e.message);
        this.props.setLoading(false);
        return;
      }

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
    });
  }

  render() {
    const date = new Date();
    //const dateString = `${date.getMonth()} ${date.getDate()}, ${date.getYear()}`;
    const dateString = this.props.triage.date;
    return (
    <Container>

      <View style={{marginTop: 12, width :'95%', height: '100%' }}>
            <View style={styles.triagescreen}>
              <Text style={[styles.title, {fontSize:25}]}>Past Triage Form: {dateString}</Text>
              <Text style={[styles.title, {fontSize:25}]}>Patient Information</Text>

              <View style={styles.triagesection}>
                <Text style={styles.subtitle}>Vitals</Text>
                <View style={styles.inputsection}>
                  <Text style={{fontSize: 18, marginTop:12}}>Height</Text>
                  <Text style={{fontSize: 18, marginTop:25}}>Weight</Text>
                  <Text style={{fontSize: 18, marginTop:25}}>Temperature</Text>
                  <Text style={{fontSize: 18, marginTop:25}}>Respiration Rate</Text>

                </View>
                <View style={styles.inputsection}>
                  <TextInput
                    style={styles.input, {width: 300}}
                    onChangeText={(height) => this.setState({height})}
                    value={this.state.heightswitch ? "" + (parseFloat(this.state.height) / 2.54) : this.state.height}
                    keyboardType={'numeric'}
                    editable={false}
                    />
                  <TextInput
                    style={styles.input, {width: 300}}
                    onChangeText={(weight) => this.setState({weight})}
                    value={this.state.weightswitch ? "" + (parseFloat(this.state.weight) * 2.204) :  this.state.weight}
                    keyboardType={'numeric'}
                    editable={false}
                    />
                  <TextInput
                    style={styles.input, {width: 300}}
                    onChangeText={(temp) => this.setState({temp})}
                    value={this.state.tempswitch ? "" + (9.0 * (parseFloat(this.state.temp)) / 5.0 + 32) : this.state.temp}
                    keyboardType={'numeric'}
                    editable={false}
                    />
                  <TextInput
                    style={styles.input, {width: 300}}
                    onChangeText={(rr) => this.setState({rr})}
                    value={this.state.rr}
                    keyboardType={'numeric'}
                    editable={false}
                    />
                </View>
                <View style={styles.inputunitsection}>
                  <Text style={styles.units}>{this.state.heightswitch?'in':'cm'}</Text>
                  <Text style={styles.units}>{this.state.weightswitch?'lb':'kg'}</Text>
                  <Text style={styles.units}>{this.state.tempswitch?'F':'C'}</Text>
                  <Text style={styles.units}>{'breaths/min'}</Text>
                </View>
                <View style={styles.inputsection, {marginLeft: 0}}>
                  <Switch
                    style={{marginTop: 22}}
                    onValueChange = {this.heightSwitch}
                    value = {this.state.heightswitch}/>
                  <Switch
                    style={{marginTop: 22}}
                    onValueChange = {this.weightSwitch}
                    value = {this.state.weightswitch}/>
                  {/*<Switch
                    style={{marginTop: 22}}
                    onValueChange = {this.unitSwitch}
                    disabled = {true}
                  value = {this.state.unitswitch}/>*/}
                  <Switch
                    style={{marginTop: 22}}
                    onValueChange = {this.tempSwitch}
                    value = {this.state.tempswitch}/>
                </View>
                <View style={styles.inputsection}>
                  <Text style={{fontSize: 18, marginTop:12}}>Oxygen Level</Text>
                  <Text style={{fontSize: 18, marginTop:25}}>Blood Pressure</Text>
                  <Text style={{fontSize: 18, marginTop:25}}>Heart Rate</Text>
                </View>
                <View style={styles.inputsection}>
                  <TextInput
                    style={styles.input, {width: 300}}
                    onChangeText={(o2) => this.setState({o2})}
                    value={this.state.o2}
                    editable={false}
                    />
                  <TextInput
                    style={styles.input, {width: 300}}
                    onChangeText={(bp) => this.setState({bp})}
                    value={this.state.bp}
                    editable={false}
                    />
                  <TextInput
                    style={styles.input, {width: 300}}
                    onChangeText={(hr) => this.setState({hr})}
                    value={this.state.hr}
                    editable={false}
                    />
                </View>
                <View style={styles.inputunitsection}>
                  <Text style={styles.units}>{'%'}</Text>
                  <Text style={styles.units}>{'mmHg'}</Text>
                  <Text style={styles.units}>{'bpm'}</Text>
                </View>
                <View style={styles.inputsection, {marginLeft: 0}}>
                  {/*<Switch
                    style={{marginTop: 22}}
                    onValueChange = {this.unitSwitch}
                    value = {this.state.unitswitch}/>
                  <Switch
                    style={{marginTop: 22}}
                    onValueChange = {this.unitSwitch}
                    value = {this.state.unitswitch}/>
                  <Switch
                    style={{marginTop: 22}}
                    onValueChange = {this.unitSwitch}
                  value = {this.state.unitswitch}/>*/}
                </View>

              </View>

              { this.props.gender == 2 ?
                <View style={styles.triagesection}>
                  <Text style={styles.subtitle}>Women</Text>
                  <View style={styles.inputsection}>
                    <TextInput
                      style={styles.input, {width: 300}}
                      onChangeText={(menstruation) => this.setState({menstruation})}
                      placeholder='Last Menstrual Period'
                      value={this.state.menstruation}
                      editable={false}
                      />
                    <TextInput
                      style={styles.input, {width: 300}}
                      onChangeText={(pregancy) => this.setState({pregancy})}
                      placeholder='Pregnancies (#)'
                      value={this.state.pregancy}
                      editable={false}
                      />
                  </View>

                  <View style={styles.inputsection}>
                    <TextInput
                      style={styles.input, {width: 300}}
                      onChangeText={(livebirths) => this.setState({livebirths})}
                      placeholder='Live Births (#)'
                      value={this.state.livebirths}
                      editable={false}
                      />
                    <TextInput
                      style={styles.input, {width: 300}}
                      onChangeText={(abortion) => this.setState({abortion})}
                      placeholder='Abortions (#)'
                      value={this.state.abortion}
                      editable={false}
                      />
                    <TextInput
                      style={styles.input, {width: 300}}
                      onChangeText={(miscarriages) => this.setState({miscarriages})}
                      placeholder='Miscarriages (#)'
                      value={this.state.miscarriages}
                      editable={false}
                    />
                  </View>
                </View>
                : null
              }

              <View style={styles.triagesection}>
                <Text style={styles.subtitle}>History</Text>
                <View style={styles.inputsection}>
                  <Text style={{fontSize: 18, marginTop:12}}>Allergies</Text>
                  <Text style={{fontSize: 18, marginTop:25}}>Current Medication</Text>
                  <Text style={{fontSize: 18, marginTop:25}}>Past Surgeries</Text>
                  <Text style={{fontSize: 18, marginTop:25}}>Immunizations</Text>
                </View>
                <View style={styles.inputsection}>
                  <TextInput
                    style={styles.input, {width: 700}}
                    onChangeText={(allergies) => this.setState({allergies})}
                    value={this.state.allergies}
                    editable={false}
                    />
                  <TextInput
                    style={styles.input, {width: 700}}
                    onChangeText={(medications) => this.setState({medications})}
                    value={this.state.medications}
                    editable={false}
                    />
                  <TextInput
                    style={styles.input, {width: 700}}
                    onChangeText={(surgeries) => this.setState({surgeries})}
                    value={this.state.surgeries}
                    editable={false}
                    />
                  <TextInput
                    style={styles.input, {width: 700}}
                    onChangeText={(immunizations) => this.setState({immunizations})}
                    value={this.state.immunizations}
                    editable={false}
                  />
                </View>
              </View>

              <View style={styles.triagesection}>
                <Text style={styles.subtitle}>Chief Complaint</Text>
                <View style={styles.inputsection}>
                <TextInput
                  style={styles.input, {width: 700, start: -30}}
                  onChangeText={(chiefComplaint) => this.setState({chiefComplaint})}
                  value={this.state.chiefComplaint}
                  editable={false}
                  />
                </View>
              </View>

              <View style={styles.triagesection}>
                <Text style={styles.subtitle}>Labs</Text>
                  <View style={styles.inputsection}>
                    <Text style={{fontSize: 18, marginTop:12}}>Hb</Text>
                    <Text style={{fontSize: 18, marginTop:25}}>HbA1c</Text>
                    <Text style={{fontSize: 18, marginTop:25}}>Blood Glucose Level</Text>
                  </View>
                <View style={styles.inputsection}>
                  <TextInput
                  style={styles.input, {width: 300}}
                    onChangeText={(hb) => this.setState({hb})}
                    value={this.state.hb}
                    editable={false}
                    />
                  <TextInput
                  style={styles.input, {width: 300}}
                    onChangeText={(hba1c) => this.setState({hba1c})}
                    value={this.state.hba1c}
                    editable={false}
                    />
                  <TextInput
                  style={styles.input, {width: 300}}
                    onChangeText={(bgl) => this.setState({bgl})}
                    value={this.state.bgl}
                    editable={false}
                  />
                </View>

                <View style={styles.inputsection, {flexDirection:'row', marginLeft: '17%', marginTop: 10}}>
                  <Text style={{fontSize:20}}>Fasting?</Text>
                  <CheckBox value={this.state.fasting} disabled={true}/>
                </View>
                <View style={styles.inputsection, {flexDirection:'row', marginLeft: '10%', marginTop: 11}}>
                  <Text style={{fontSize:20}}>Pregnant?</Text>
                  <CheckBox value={this.state.pregnant} disabled={true}/>
                </View>

              </View>

              <View style={styles.triagesection}>
                <Text style={styles.subtitle, {marginBottom: 30, fontSize: 20, color:'#0055FF'}}>Urine Test</Text>
                <TriageLabsWheel
                  enabled={false}
                  updateLabResult={(name, result) =>
                    this.updateLabTests(name, result, this.state.labTestObjects)}
                  tests = {Object.values(this.state.labTestObjects)}
                />
              </View>
            </View>
      </View>

      </Container>
    );
  }
}

const styles = StyleSheet.create({
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

export default connect(mapStateToProps, mapDispatchToProps)(TriagePageNew);
