import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList
} from 'react-native';
import { DataTable, Searchbar } from 'react-native-paper';
import Button from '../components/Button';
import { downstreamSyncWithServer } from '../util/Sync';
import { localData, serverData } from '../services/DataService';
import Container from '../components/Container';
import { stringDate } from '../util/Date';

class PatientList extends Component {

  constructor(props) {
    super(props);
    this.state = {
      firstQuery: '',
      fullarr: [],
      arrQ: [],
      isFetching: false
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }


  //sync and loads patients that are checked in
  syncAndLoadPatients = () => {
    console.log('syncing');
    this.props.setLoading(true);
    this.props.clearMessages();
    const today = stringDate(new Date());
    //const oldStatuses = localData.getStatuses(today);
    const oldStatuses = localData.getCheckedInStatuses(today);
    this.setState({ fullarr: oldStatuses, arrQ: oldStatuses });

    downstreamSyncWithServer()
      .then((failedPatientKeys) => {
        // View README: Handle syncing the tablet, point 3 for explanation
        console.log("within downstream Sync");
        if (this.props.loading) {
          if (failedPatientKeys.length > 0) {
            throw new Error(`${failedPatientKeys.length} patients didn't properly sync.`);
          }
          //let newStatuses = localData.getStatuses(today);
          let newStatuses = localData.getCheckedInStatuses(today);
          newStatuses = newStatuses.filter(obj => !(obj.soapCompleted && obj.triageCompleted));
          this.setState({ fullarr: newStatuses, arrQ: newStatuses });
          this.props.setLoading(false);
        }
      })
      .catch(err => {
        console.log('failure');
        if (this.props.loading) {
          this.props.setLoading(false);
          this.props.setErrorMessage(err.message);
        }
      })
      .finally(() => {
        this.setState({ isFetching: false });
      });

  }

  onNavigatorEvent(event) {
    if (event.id === 'willAppear') {
      this.syncAndLoadPatients();
    }
  }

  //if num is 1, get triage
  //if num is 2, get soap
  //if num is 3, get Complete
  getStatus = (patient, num) => {
    return (patient[num] ? "Complete" : "");
  }



  goToPatient = ({ patientKey, name }) => {
    this.props.navigator.push({
      id: 'goToPatient',
      screen: 'Ihc.PatientHomeScreen',
      title: 'Patient Profile',
      passProps: {
        patientKey: patientKey,
        name: name,
        status: this.state.arrQ.find(obj => patientKey == obj.patientKey),
        canModify: true,
        showForm: true
      }
    });
  }

  filterPatients = () => {
    if (this.state.firstQuery == '') {
      arr = Array.from(this.state.fullarr);
      this.setState({ arrQ: arr }, () => console.log("Reset"));
    } else {
      arr = this.state.fullarr.filter((patient) => patient.name.match(this.state.firstQuery));
      this.setState({ arrQ: arr }, () => console.log("filtered"));
    }
  }

  checkOut = item => {
    if (item.checkinTime == -1) {
      throw new Error("Already checked out")
    }
    //const patient = this.state.arrQ.find(obj => patientKey == obj.key);
    const patient = item;
    //throw new Error(patient)
    s = ""
    for (i in patient) {
      s += i + ":"
      s += patient[i]
      s += " "
    }
    //throw new Error(s);

    let statusObj = {};
    this.props.setLoading(true);

    try {
      statusObj = localData.signoutPatient(patient, true);
      console.log("checked out locally");
    } catch (e) {
      this.props.setLoading(false);
      this.props.setErrorMessage(e.message);
      return;
    }	    


    //throw new Error(statusObj)
    s = ""
    for (i in statusObj) {
      s += i + ":"
      s += statusObj[i]

    }

    //throw new Error(s)

    try {
      serverData.updateStatus(statusObj)
        .then(() => {
          // View README: Handle syncing the tablet, point 3 for explanation
          if (this.props.loading) {
            this.props.setLoading(false);
            this.setState({ arrQ: this.state.arrq.splice(key, 1) });
            this.props.setSuccessMessage(`${patient.firstName} signed out successfully`);
          }
        })
        .catch((e) => {
          if (this.props.loading) {
            // If server update fails, mark the patient as need to upload
            this.props.setLoading(false, true);
            this.props.setErrorMessage(e.message);

            localData.markPatientNeedToUpload(patient.key);
          }
        });
    } catch (e) {
      this.props.setLoading(false, true);
      this.props.setErrorMessage('Tablet is not connected to server.');
      return;
    }

    this.props.navigator.pop()    
  }

  render() {
    let triageNum = 0;
    let soapNum = 0;
    this.state.arrQ.forEach(obj => {
      if (obj.triageCompleted) {
        triageNum++;
      }
    });
    this.state.arrQ.forEach(obj => {
      if (obj.soapCompleted) {
        soapNum++;
      }
    });
    return (<Container>
      <View style = {
        { height: '100%', width: '100%' }}>
        <View>
          <Searchbar placeholder = "Search"
            onChangeText = {
              query => {
                this.setState({ firstQuery: query }, () => this.filterPatients());
              }
            }
            value = { this.state.firstQuery }
            style = { styles.search }
          />
        </View>

        <View>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title >
                { `(${this.state.arrQ.length})  PATIENTS` }
              </DataTable.Title>
              <DataTable.Title>
                Check In Time
              </DataTable.Title>
              <DataTable.Title>
                { `(${triageNum}) TRIAGE` }
              </DataTable.Title>
              <DataTable.Title>
                { `(${soapNum}) SOAP` }
              </DataTable.Title>
              <DataTable.Title>
              </DataTable.Title>
            </DataTable.Header>

            <SafeAreaView>
              <FlatList data = { this.state.arrQ }
                renderItem = {
                  ({ item }) => {
                    return ( <DataTable.Row key = { item.key }
                      onPress = {
                        () => this.goToPatient(item)
                      }>
                      <DataTable.Cell >
                        { item.name }
                      </DataTable.Cell>
                      <DataTable.Cell >
                        { item.checkinTime ? new Date(item.checkinTime).toLocaleTimeString('en-US') : null }
                      </DataTable.Cell>
                      <DataTable.Cell >
                        { item.triageCompleted ? new Date(item.triageCompleted).toLocaleTimeString('en-US') : null }
                      </DataTable.Cell>
                      <DataTable.Cell >
                        { item.soapCompleted ? new Date(item.soapCompleted).toLocaleTimeString('en-US') : null }
                      </DataTable.Cell>
                      <DataTable.Cell style = { styles.button }
                        onPress = {
                         () => this.checkOut(item)
                        }>
                        <Text style = {
                          { color: 'white', fontSize: 20 }
                          }>
                          Check out
                        </Text>
                      </DataTable.Cell >
                    </DataTable.Row> );
                  }
                }
                keyExtractor = { item => item.patientKey }
                onRefresh = {
                  () => {
                    this.setState({ isFetching: true }, () => this.syncAndLoadPatients());
                  }
                }
                refreshing = { this.state.isFetching }
              />
            </SafeAreaView>
          </DataTable>
        </View>
      </View>
    </Container>
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
import { setLoading, clearMessages, setErrorMessage } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  loading: state.loading
});

const mapDispatchToProps = dispatch => ({
  setLoading: (val) => dispatch(setLoading(val)),
  clearMessages: () => dispatch(clearMessages()),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PatientList);
