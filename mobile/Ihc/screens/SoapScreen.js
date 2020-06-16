import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Picker,
  FlatList
} from 'react-native';
let t = require('tcomb-form-native');
let Form = t.form.Form;

import {localData, serverData} from '../services/DataService';
import Soap from '../models/Soap';
import {stringDate} from '../util/Date';
import Container from '../components/Container';
import Button from '../components/Button';
import {downstreamSyncWithServer} from '../util/Sync';
import Medication from '../models/Medication';
import MedicationRequest from '../models/MedicationRequest';
import MedicationHistory from '../components/MedicationHistory';

const blank = "-";

class SoapScreen extends Component<{}> {
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
    this.state = {
      formValues: {date: todayDate},
      todayDate: todayDate,
      selectedCategory: blank,
      selectedMedication: blank,
      requestedMedication: []
    };
  }

  // TODO: Make form fields larger, more like textarea
  Soap = t.struct({
    date: t.String,
    subjective: t.maybe(t.String),
    objective: t.maybe(t.String),
    assessment: t.maybe(t.String),
    plan: t.maybe(t.String),
    wishlist: t.maybe(t.String),
    provider: t.String // Doctor's name
  });

  formOptions = {
    fields: {
      date: {
        editable: false,
      },
      subjective: {
        multiline: true,
      },
      objective: {
        multiline: true,
      },
      assessment: {
        multiline: true,
      },
      plan: {
        multiline: true,
      },
      wishlist: {
        multiline: true,
      },
    }
  }

  syncAndLoadFormValues = () => {
    this.props.setLoading(true);
    this.props.isUploading(false);
    this.props.clearMessages();

    // Load existing SOAP info if it exists
    const soap = localData.getSoap(this.props.currentPatientKey, this.state.todayDate);
    if (soap) {
      this.setState({ formValues: soap });
    }

    // TODO: Make get last medication request by patient, also clean up
    // medication fillout screen.
    //const medication = localData.getMedicationRequest(this.props.currentPatientKey);
    //if(medication) {
    //console.log("med: " + medication.medicationRequested);
    //console.log("key: " + this.props.currentPatientKey);
    //}

    //if(medication && medication != null && medication.medicationRequested) {
    //this.setState({requestedMedication: medication.medicationRequested.map(m => {return {key: m}})});
    //}

    // Attempt server download and reload information if successful
    downstreamSyncWithServer()
      .then( ( failedPatientKeys) => {
        if (this.props.loading) {
          if (failedPatientKeys.length > 0) {
            throw new Error(`${failedPatientKeys.length} patients didn't properly sync.`);
          }

          const soap = localData.getSoap(this.props.currentPatientKey, this.state.todayDate);
          if (soap) {
            this.setState({ formValues: soap });
          }

          this.props.setLoading(false);
        }
      })
      .catch( (err) => {
        if (this.props.loading) {
          this.props.setErrorMessage(err.message);
          this.props.setLoading(false);
        }
      });
  }

  componentDidMount() {
    this.syncAndLoadFormValues();
  }

  // Updates the timestamp that displays in the PatientSelectScreen
  // Doesn't actually save the SOAP form
  completed = () => {
    this.props.setLoading(true);
    let statusObj = {};
    try {
      statusObj = localData.updateStatus(this.props.currentPatientKey, this.state.todayDate,
        'soapCompleted', new Date().getTime());
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
          this.props.setSuccessMessage('SOAP marked as completed, but not yet submitted');
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

  submitMedicationRequest = () => {
    const meds = this.state.requestedMedication.map(medication => medication.key);
    console.log("key: " + this.props.currentPatientKey);
    const medicationRequest = MedicationRequest.newMedicationRequest(this.props.currentPatientKey, meds);
    serverData.enqueueMedicationRequest(medicationRequest);
    localData.enqueueMedicationRequest(medicationRequest);
    this.props.setLoading(true);
    setTimeout(() => this.props.setLoading(false), 5);
  }

  submit = () => {
    //validations 
    if(!this.refs.form.validate().isValid()) {
      this.props.setErrorMessage('Form not correct. Review form.');
      return;
    }
    const form = this.refs.form.getValue();
    const soap = Soap.extractFromForm(form, this.props.currentPatientKey);

    // Update local data first
    this.props.setLoading(true);
    //dont think isUploading does anything rn
    this.props.isUploading(true);
    this.props.clearMessages();

    //updates local database
    try {
      localData.updateSoap(soap);
    } catch(e) {
      this.props.setErrorMessage(e.message);
      this.props.setLoading(false);
      return;
    }


    // Send updates to server
    serverData.updateSoap(soap)
      .then( () => {
        if(this.props.loading) {
          this.props.setLoading(false);
          this.props.setSuccessMessage('Saved');
        }
      })
      .catch( (err) => {
        if(this.props.loading) {
          localData.markPatientNeedToUpload(this.props.patientKey);
          this.props.setLoading(false, true);
          this.props.setErrorMessage(err.message);
          return;
        }
      });
  }

  onFormChange = (value) => {
    this.setState({
      formValues: value,
    });
  }

  addMedication = () => {
    var list = Object.assign([], this.state.requestedMedication);
    if(this.state.selectedMedication != blank && 
      list.filter(item => item.key == this.state.selectedMedication).length == 0) {
      list.push({key: this.state.selectedMedication});
      this.setState({requestedMedication: list});
    }
  }

  MedicationSelection = () => {
    return (
        <View>
          <Text style={styles.subtitle}>
            Request Medication
          </Text>
          <View style={{display: "flex", alignItems: "center", flexDirection: "row"}}>
            <Text
              style={styles.label} 
            >
              Category:
            </Text>
            <Text
              style={styles.label} 
            >
              Medication:
            </Text>
          </View>
          <View style={{display: "flex", alignItems: "center", flexDirection: "row"}}>
            <Picker 
              selectedValue={this.state.selectedCategory}
              style={{ height: 50, width: "50%", }} 
              onValueChange={(itemValue, itemIndex) => this.setState({selectedCategory: itemValue})}
            >
              <Picker.Item label={blank} value={blank}/>
              {
                Object.getOwnPropertyNames(Medication.categories).map(entry => 
                  <Picker.Item label={entry} value={entry} key={entry}/>
                )
              }
            </Picker>

            <Picker 
              selectedValue={this.state.selectedMedication}
              style={{ height: 50, width: "50%" }} 
              onValueChange={(itemValue, itemIndex) => this.setState({selectedMedication: itemValue})}
            >
              {
                this.state.selectedCategory == blank ? <Picker.Item label={blank} value={blank}/>
                : Medication.categories[this.state.selectedCategory].map(entry => 
                <Picker.Item label={entry} value={entry} key={entry}/>
                )
              }
            </Picker>
          </View>
          <Text
            style={styles.label} 
          >
            Requested Medication: 
          </Text>
          <FlatList
            data= {this.state.requestedMedication}
            extraData={this.props}
            renderItem={({item}) => <Text style={styles.item}>{item.key}</Text>}
          />
          <Button onPress={this.addMedication}
            text='Add medication' />
          <Button onPress={this.submitMedicationRequest}
            text='Submit Medication Request' />
        </View>
    );
  }

  render() {
    return (
      <Container>

        <View style={{width:'80%'}}>
          <Text style={styles.subtitle}>
            Soap
          </Text>
        </View>
        <View style={styles.form}>
          <Form ref="form"
            type={this.Soap}
            value={this.state.formValues}
            options={this.formOptions}
            onChange={this.onFormChange}
          />

          <Button onPress={this.submit}
            text="Submit SOAP" />
          <this.MedicationSelection/>

          <MedicationHistory
            patientKey={this.props.currentPatientKey}
          />
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
  label: {
    fontSize: 20,
    height: 50,
    width: "50%"
  }, 
  subtitle: {
    fontSize: 20,
    textAlign: 'left',
    margin: 2,
    color:'#0055FF'
  },
  item: {
    textAlign: 'center',
    fontSize: 15,
    height:30
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

export default connect(mapStateToProps, mapDispatchToProps)(SoapScreen);
