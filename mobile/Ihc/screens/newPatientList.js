import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { DataTable, Searchbar, Checkbox } from 'react-native-paper';
import Button from '../components/Button';
import {downstreamSyncWithServer} from '../util/Sync';
import {localData, serverData} from '../services/DataService';
import {stringDate} from '../util/Date';

class newPatientList extends React.Component {
  
  constructor(props){
    super(props);
    this.state = {
      firstQuery: '',
      fullarr: [], 
      arrQ: []
    };
  }


  //sync and loads patients that are checked in
    syncAndLoadPatients = () => {
    this.props.setCurrentPatientKey(null);
    this.props.setLoading(true);
    this.props.isUploading(false);
    this.props.clearMessages();

    // Load local data in beginning to display even if sync doesn't work
    const today = stringDate(new Date());
    const oldStatuses = localData.getStatuses(today);
    const oldRowData = this.convertStatusesToRows(oldStatuses);
    this.setState({rows: oldRowData});

    downstreamSyncWithServer()
      .then((failedPatientKeys) => {
        // View README: Handle syncing the tablet, point 3 for explanation
        if(this.props.loading) {
          if(failedPatientKeys.length > 0) {
            throw new Error(`${failedPatientKeys.length} patients didn't properly sync.`);
          }
          const newStatuses = localData.getStatuses(today);
          const newRowData = this.convertStatusesToRows(newStatuses);

          this.setState({fullarr: newRowData, arrQ:newRowData});
          this.props.setLoading(false);
        }
      })
      .catch(err => {
        if(this.props.loading) {
          this.props.setLoading(false);
          this.props.setErrorMessage(err.message);
        }
      });
  }

  // Reload table after moving back to table
  // Replaces componentDidMount() because this will be called around the same
  // time
  onNavigatorEvent(event) {
    if (event.id === 'willAppear') {
      this.syncAndLoadPatients();
    }
  }


  //if num is 1, get triage
  //if num is 2, get soap
  //if num is 3, get Complete
  getStatus = (patient, num) => {
    return (patient[num] ? "Complete" : "" );
  }

  patientList = () =>  this.state.arrQ.map( (patient,i) => 
        (<DataTable.Row key = {i}>
            <DataTable.Cell>{patient.name}</DataTable.Cell>
            <DataTable.Cell>{patient.checkInTime}</DataTable.Cell>
            <DataTable.Cell>{patient.triageCompleted}</DataTable.Cell>
            <DataTable.Cell>{patient.soapCompleted}</DataTable.Cell>
            <DataTable.Cell>{patient.pharmacyCompleted}</DataTable.Cell>
            <DataTable.Cell style = {styles.button} onPress={(i) => this.goToPatient(i)}>Check Out</DataTable.Cell>
          </DataTable.Row> ));

  goToPatient = (i) => {
    console.log("Going to patient");
  }

  filterPatients = () => {
    if(this.state.firstQuery == ''){
      arr = Array.from(this.state.fullarr);
      this.setState({arrQ: arr}, () => console.log("Reset"));
    }else{
      arr = this.state.fullarr.filter( (patient) => patient.name.match(this.state.firstQuery));
      this.setState({arrQ: arr}, () => console.log("filtered")); 
    }
  } 

  render() {
    return (
      <View>
        <Searchbar
          placeholder="Search"
          onChangeText={query => { 
            this.setState({firstQuery: query }, () => this.filterPatients()); 
            console.log("Query is " + this.state.firstQuery);
          }}
          value={this.state.firstQuery}
          style = {styles.search}
        />

        <DataTable>
          <DataTable.Header>
            <DataTable.Title >Patient Name</DataTable.Title>
            <DataTable.Title >Check In Time</DataTable.Title>
            <DataTable.Title >Triage</DataTable.Title>   
            <DataTable.Title >SOAP</DataTable.Title>
            <DataTable.Title ></DataTable.Title>        
          </DataTable.Header>

          {this.patientList()}
        </DataTable>
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  search: {
    marginTop: '3%',
    marginBottom: '2%',
    width: '60%',
    marginLeft: "2%",
  },
  button: {
    borderColor: 'white',
    borderWidth: 2.0,
    borderRadius: 10,
    justifyContent: 'center',
    backgroundColor: '#00ac3d',
  }
});

// Redux
import { setLoading, clearMessages } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapDispatchToProps = dispatch => ({
  setLoading: (val) => dispatch(setLoading(val)),
  clearMessages: () => dispatch(clearMessages())
});

export default connect(null, mapDispatchToProps)(newPatientList);