import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  Alert,
  AppRegistry,
  TextInput,
  Switch,
  CheckBox,

} from 'react-native';
import { Col, Grid } from 'react-native-easy-grid';
import Container from '../components/Container';
import Button from '../components/Button';
import Triage from '../models/Triage';
import {stringDate} from '../util/Date';
import { DataTable } from 'react-native-paper';
import TriageLabsWheel from '../components/TriageLabsWheel';
import {localData, serverData} from '../services/DataService';
import TriageHistory from './TriageHistory';


const MU_UNICODE = '\u03bc';



class TriagePageNew extends Component{
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

  loadPastTriages = () => {
    let patient = localData.getPatient(this.props.currentPatientKey);
    this.setState({patientTriages: patient.triages});
  }

  componentWillMount = () => {
    this.loadExistingTriage();
    this.loadPastTriages();
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

  setMetricUnits = () => {
    if (this.state.heightswitch) {
      try {
        this.setState({height : "" + (parseFloat(this.state.height) * 2.54)})
      } catch(e) {
        this.setState({height : '0'})
      }
      this.setState({heightswitch : false})
    } 
    if (this.state.weightswitch) {
      try {
        this.setState({weight : "" + (parseFloat(this.state.weight) / 2.205)})
      } catch(e) {
        this.setState({weight : '0'})
      }
      this.setState({weightswitch : false})
    }
    if (this.state.tempswitch) {
      try {
        this.setState({temp : "" + (5/9 * (parseFloat(this.state.temp) - 32))})
      } catch(e) {
        this.setState({temp : '0'})
      }
      this.setState({tempswitch : false})
    }

  }

  save = () => {
    
    this.setMetricUnits();
    this.props.clearMessages();
    this.props.setLoading(true);
    let formVals = Object.assign({}, this.state);
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

  successConfirm = () => {
    Alert.alert('Success', 'Triage is marked completed', [
      {text: 'Close', onPress: () => {
        console.log('Close');
      }}
    ]);
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

  submit = () => {
    this.setMetricUnits();
    if(!this.state.timeOut) {
      Alert.alert('Confirmation', 'Do you want to mark this Triage complete?',
        [{text: 'Yes', onPress: () => {
          this.setState({timeOut: `${new Date().getTime()}`}, () => {
            this.save();
            this.markStatus();
            this.successConfirm();
          });
        }},
        {text: 'No', onPress: () => {
          console.log('cancel');
        }}]);
    } else {
      this.setState({timeOut: `${new Date().getTime()}`}, () => {
        this.save();
        Alert.alert('Updated', 'The Triage has been updated.',
          [{text: 'Close', onPress: () => {
            console.log('Close');
          }}]);
      });
    }
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


  render() {
    const date = new Date();
    const dateString = this.props.todayDateString || date.toDateString();
    return (
    <Container>
      <View style={{marginTop: 24, marginBottom: 24, width:'100%' }}>
            <View style={styles.triagescreen}>
              {this.props.showForm ?
                <View>
                  <Text style={this.state.timeOut? [styles.title, {color:'green'}] : styles.title}>
                    {`${this.state.timeOut ? 'Completed': 'New'} Triage Form: ${dateString}`}
                  </Text>
                  {this.state.timeOut ?
                    <Text style={[styles.title, {color:'green', fontSize: 15}]}>
                      {`at ${new Date(Number(this.state.timeOut)).toLocaleTimeString('en-US')}`}
                    </Text>
                    : null
                  }
                  <Text style={styles.title}>Patient Information</Text>
                </View>
              : null}
              {this.props.showForm ?
                (<View style={styles.triagesection}>
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
                      value={this.state.height}
                      keyboardType={'numeric'}
                      editable={this.props.canModify}
                      />
                    <TextInput
                      style={styles.input, {width: 300}}
                      onChangeText={(weight) => this.setState({weight})}
                      value={this.state.weight}
                      keyboardType={'numeric'}
                      editable={this.props.canModify}
                      />
                    <TextInput
                      style={styles.input, {width: 300}}
                      onChangeText={(temp) => this.setState({temp})}
                      value={this.state.temp}
                      keyboardType={'numeric'}
                      editable={this.props.canModify}
                      />
                    <TextInput
                      style={styles.input, {width: 300}}
                      onChangeText={(rr) => this.setState({rr})}
                      value={this.state.rr}
                      keyboardType={'numeric'}
                      editable={this.props.canModify}
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
                      keyboardType={'numeric'}
                      value={this.state.o2}
                      />
                    <TextInput
                      style={styles.input, {width: 300}}
                      onChangeText={(bp) => this.setState({bp})}
                      keyboardType={'numeric'}
                      value={this.state.bp}
                      />
                    <TextInput
                      style={styles.input, {width: 300}}
                      onChangeText={(hr) => this.setState({hr})}
                      keyboardType={'numeric'}
                      value={this.state.hr}
                      />
                  </View>
                  <View style={styles.inputunitsection}>
                    <Text style={styles.units}>{'%'}</Text>
                    <Text style={styles.units}>{'mmHg'}</Text>
                    <Text style={styles.units}>{'bpm'}</Text>
                  </View>

                </View>)
              : null}
              { this.props.gender == 2 && this.props.showForm?
                <View style={styles.triagesection}>
                  <Text style={styles.subtitle}>Women</Text>
                  <View style={styles.inputsection}>
                    <TextInput
                      style={styles.input, {width: 300}}
                      onChangeText={(menstruation) => this.setState({menstruation})}
                      placeholder='Last Menstrual Period'
                      value={this.state.menstruation}
                      />
                    <TextInput
                      style={styles.input, {width: 300}}
                      onChangeText={(pregancy) => this.setState({pregancy})}
                      placeholder='Pregnancies (#)'
                      value={this.state.pregancy}
                      />
                  </View>

                  <View style={styles.inputsection}>
                    <TextInput
                      style={styles.input, {width: 300}}
                      onChangeText={(livebirths) => this.setState({livebirths})}
                      placeholder='Live Births (#)'
                      value={this.state.livebirths}
                      />
                    <TextInput
                      style={styles.input, {width: 300}}
                      onChangeText={(abortion) => this.setState({abortion})}
                      placeholder='Abortions (#)'
                      value={this.state.abortion}
                      />
                    <TextInput
                      style={styles.input, {width: 300}}
                      onChangeText={(miscarriages) => this.setState({miscarriages})}
                      placeholder='Miscarriages (#)'
                      value={this.state.miscarriages}
                    />
                  </View>
                </View>
                : null
              }

              {this.props.showForm ?
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
                      />
                    <TextInput
                      style={styles.input, {width: 700}}
                      onChangeText={(medications) => this.setState({medications})}
                      value={this.state.medications}
                      />
                    <TextInput
                      style={styles.input, {width: 700}}
                      onChangeText={(surgeries) => this.setState({surgeries})}
                      value={this.state.surgeries}
                      />
                    <TextInput
                      style={styles.input, {width: 700}}
                      onChangeText={(immunizations) => this.setState({immunizations})}
                      value={this.state.immunizations}
                    />
                  </View>
                  <View style={styles.inputsection, {flexDirection:'row', marginLeft: '17%', marginTop: 10}}>
                    <Text style={{fontSize:20}}>Fasting?</Text>
                    <CheckBox value={this.state.fasting} onValueChange={() => this.setState({fasting: !this.state.fasting})}/>
                  </View>
                  <View style={styles.inputsection, {flexDirection:'row', marginLeft: '10%', marginTop: 11}}>
                    <Text style={{fontSize:20}}>Pregnant?</Text>
                    <CheckBox value={this.state.pregnant} onValueChange={() => this.setState({pregnant: !this.state.pregnant})}/>
                  </View>
                </View>
              : null}

              {this.props.showForm ?
              <View>
                <View style={styles.triagesection}>
                  <Text style={styles.subtitle}>Chief Complaint</Text>
                  <View style={styles.inputsection}>
                  <TextInput
                    style={styles.input, {width: 700, start: -30}}
                    onChangeText={(chiefComplaint) => this.setState({chiefComplaint})}
                    value={this.state.chiefComplaint}
                    />
                  </View>
                </View>


              </View>
              : null}


              {this.props.canModify ?
                <View>
                  <Button onPress={this.submit}
                    style={{marginVertical: 20,}}
                    text='Submit' />
                </View>: null
              }

              {this.props.canModify || this.props.showHistory ?
                <View >
                  <Text style={{textAlign:'center', width:"100%", fontSize: 25, fontWeight:'bold'}}>Triage History</Text>
                  <DataTable style={{justifyContent: 'center', borderWidth:3}}>
                    <DataTable.Header>
                      <DataTable.Title >Last Visit</DataTable.Title>
                      <DataTable.Title >Check In Time</DataTable.Title>
                      <DataTable.Title >Vitals</DataTable.Title>
                      <DataTable.Title ></DataTable.Title>
                    </DataTable.Header>
                    {this.state.patientTriages.map( obj => {
                      return (<DataTable.Row key={obj.patientKey}>
                        <DataTable.Cell>{stringDate(new Date(obj.date))}</DataTable.Cell>
                        <DataTable.Cell>{new Date(this.props.status.checkinTime).toLocaleTimeString('en-US')}</DataTable.Cell>
                        <DataTable.Cell>{obj.timeIn}</DataTable.Cell>
                        <DataTable.Cell style={styles.expand} onPress={() => this.props.goToTriage(obj.date)}>
                          <Text style={{color:'white'}}>Expand</Text>
                        </DataTable.Cell>
                      </DataTable.Row>);
                    })}
                  </DataTable>
                </View>
              : null}
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
