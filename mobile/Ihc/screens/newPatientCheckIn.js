import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { DataTable, Searchbar, Checkbox } from 'react-native-paper';
import Button from '../components/Button';

class newPatientList extends React.Component {
  
  constructor(props){
    super(props);
    this.state = {
      firstQuery: '',
      fullarr: [{name: "Alex", DOB:"5/12/1998", lastVisit: "5/10/2019"},
      {name: "Brandon", DOB:"5/12/1998", lastVisit: "5/10/2019"},
      {name: "Carl", DOB:"5/12/1998", lastVisit: "5/10/2019"},
      {name: "Devon", DOB:"5/12/1998", lastVisit: "5/10/2019"},
      {name: "Edward", DOB:"5/12/1998", lastVisit: "5/10/2019"},
      {name: "Fuck", DOB:"5/12/1998", lastVisit: "5/10/2019"}], 
      arrQ: [{name: "Alex", status: [true, true, true], checkInTime: "5:15"},
      {name: "Brandon", DOB:"5/12/1998", lastVisit: "5/10/2019"},
      {name: "Carl", DOB:"5/12/1998", lastVisit: "5/10/2019"},
      {name: "Devon", DOB:"5/12/1998", lastVisit: "5/10/2019"},
      {name: "Edward", DOB:"5/12/1998", lastVisit: "5/10/2019"},
      {name: "Fuck", DOB:"5/12/1998", lastVisit: "5/10/2019"}]
    };
  }

  patientList = () =>  this.state.arrQ.map( (patient,i) => 
        (<DataTable.Row key = {i}>
            <DataTable.Cell>{patient.name}</DataTable.Cell>
            <DataTable.Cell>{patient.DOB}</DataTable.Cell>
            <DataTable.Cell>{patient.lastVisit}</DataTable.Cell>
            <DataTable.Cell style = {styles.checkInButton}>Check In</DataTable.Cell>
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
        <View style={{flexDirection:"row"}}>
          <Searchbar
            placeholder="Search"
            onChangeText={query => { 
              this.setState({firstQuery: query }, () => this.filterPatients()); 
              console.log("Query is " + this.state.firstQuery);
            }}
            value={this.state.firstQuery}
            style = {styles.search}
          />

          <Button text="Add Patient" style={styles.addPatientButton}/>

        </View>

        <DataTable>
          <DataTable.Header>
            <DataTable.Title >Patient Name</DataTable.Title>
            <DataTable.Title >Date of Birth</DataTable.Title>
            <DataTable.Title >Last Visit</DataTable.Title>   
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
  checkInButton: {
    borderColor: 'yellow',
    borderWidth: 2.0,
    borderRadius: 10,
    justifyContent: 'center',
    backgroundColor: '#4169e1',
  },
  addPatientButton:{
    width: "15%",
    backgroundColor: 'blue',
    marginTop: '3.5%',
    marginBottom: '2%',
    flex: 1,
    marginLeft: "11%"
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