import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  FlatList
} from 'react-native';
import { DataTable, Searchbar, Checkbox } from 'react-native-paper';
import Button from '../components/Button';
import { localData, serverData } from '../services/DataService';
import { stringDate, formatDate, getMonth, getYear, getDay } from '../util/Date';
import { downstreamSyncWithServer } from '../util/Sync';
import Container from '../components/Container';

class PatientCheckIn extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      firstQuery: '',
      fullarr: [],
      arrQ: [],
      isFetching: false,
      loading: false
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));

  }

  syncAndLoadPatients = () => {
    this.props.setLoading(true);

    downstreamSyncWithServer()
      .then((failedPatientKeys) => {
        // View README: Handle syncing the tablet, point 3 for explanation
        console.log('downstream is succesful');
        if (this.props.loading) {
          if (failedPatientKeys.length > 0) {
            throw new Error(`${failedPatientKeys.length} patients failed to download. Try again`);
          }
        }
        this.props.setSuccessMessage('Downloaded successfully');
      })
      .catch(err => {
        console.log("In error");
        if (this.props.loading) {
          this.props.setLoading(false);
          this.props.setErrorMessage("Not Synced to Server");
        }
      });


    const list = localData.getPatients(0);

    /*
            const objs = list.map(obj => {
                const fullName = obj.firstName + ' ' + obj.fatherName + ' ' + obj.motherName;
                const lastVisitNum = Math.max.apply(null, obj.statuses.map(o => o.lastUpdated));
                const lastVisit = new Date(lastVisitNum);
                return ({
                    ...obj,
                    fullName: fullName,
                    lastVisit: lastVisit,
                });
            });
            const patients = objs.filter(({ lastVisit }) => {
                const today = new Date();
                return (lastVisit.getDate() != today.getDate()) || (lastVisit.getMonth() != today.getMonth()) ||
                    (lastVisit.getFullYear() != today.getFullYear());
            }).map(obj => {
                obj.lastVisit = stringDate(obj.lastVisit);
                return obj;
            });
            */

    const objs = list.map(obj => {
      const fullName = obj.firstName + ' ' + obj.fatherName + ' ' + obj.motherName;
      const lastVisitNum = Math.max.apply(null, obj.statuses.map(o => o.lastUpdated));
      const lastVisit = new Date(lastVisitNum);
      const checkedIn = obj.checkedIn
      return ({
        ...obj,
        fullName: fullName,
        lastVisit: lastVisit,
        checkedIn: checkedIn,
      });
    });

    const patients = objs.filter((i) => {
      const today = new Date();
      return (i.lastVisit.getDate() != today.getDate()) || (i.lastVisit.getMonth() != today.getMonth()) ||
        (i.lastVisit.getFullYear() != today.getFullYear() || (i.checkedIn == false));
    }).map(obj => {
      obj.lastVisit = stringDate(obj.lastVisit);
      return obj;
    });





    this.setState({
      fullarr: patients,
      arrQ: patients
    });
    this.props.setLoading(false);
    //this.props.setSuccessMessage('Downloaded successfully');

    this.setState({ isFetching: false });
  }
  onNavigatorEvent(event) {
    if (event.id === 'willAppear') {
      this.props.setLoading(true);
      this.props.clearMessages();
      this.syncAndLoadPatients();
    }
  }

  filterPatients = () => {
    if (this.state.firstQuery == '') {
      arr = Array.from(this.state.fullarr);
      this.setState({ arrQ: arr }, () => console.log("Reset"));
    } else {
      arr = this.state.fullarr.filter((patient) => {
        return patient.fullName.toLowerCase().match(this.state.firstQuery.toLowerCase());
      });
      this.setState({ arrQ: arr }, () => console.log("filtered"));
    }
  }

  goToPatientHistory = key => {
    const patient = this.state.arrQ.find(obj => key == obj.key);
    const today = stringDate(new Date());
    let status = localData.getStatuses(today);
    this.props.navigator.push({
      id: 'goToPatient',
      screen: 'Ihc.PatientHomeScreen',
      title: 'Patient Profile',
      passProps: {
        patientKey: key,
        name: patient.firstName + ' ' + patient.fatherName + ' ' + patient.motherName,
        status: status,
        canModify: false,
        showHistory: true,
        showForm: false
      }
    });
  }

  checkInPatient = key => {
    const patient = this.state.arrQ.find(obj => key == obj.key);
    let statusObj = {};
    this.props.setLoading(true);
    try {
      statusObj = localData.signinPatient(patient);
      console.log("checked in locally");
    } catch (e) {
      this.props.setLoading(false);
      this.props.setErrorMessage(e.message);
      return;
    }
    try {
      serverData.updateStatus(statusObj)
        .then(() => {
          // View README: Handle syncing the tablet, point 3 for explanation
          if (this.props.loading) {
            this.props.setLoading(false);
            this.setState({ arrQ: this.state.arrq.splice(key, 1) });
            this.props.setSuccessMessage(`${patient.firstName} signed in successfully`);
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
    return (<Container>
      <View style = {{ height: '100%', width: '100%' }}>
        <View style = {{ flexDirection: "row" }}>
          <Searchbar placeholder = "Search"
            onChangeText = {
              query => {
                this.setState({ firstQuery: query }, () => this.filterPatients());
              }
            }
            value = { this.state.firstQuery }
            style = { styles.search }/>

          <Button text = "Add Patient"
            onPress = {
              goToPatient = () => {
                this.props.navigator.push({
                  screen: 'Ihc.SigninScreen',
                  title: "Add Patient",
                  id: "Check In",
                  passProps: {
                    syncAndLoadPatients: this.syncAndLoadPatients
                  }
                });
              }
            }
            style = { styles.addPatientButton }/>
        </View>
        <View>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title >
                { `(${this.state.arrQ.length}) PATIENTS` }
              </DataTable.Title>
              <DataTable.Title>
                DATE OF BIRTH
              </DataTable.Title>
              <DataTable.Title>
                Last Visit
              </DataTable.Title>
              <DataTable.Title>
              </DataTable.Title>
            </DataTable.Header>

            <SafeAreaView>
              <FlatList data = { this.state.arrQ }
                renderItem = {
                  ({ item }) => {
                    return (
                      <DataTable.Row key = { item.key }
                        onPress = {
                          () => this.goToPatientHistory(item.key)
                        }>
                        <DataTable.Cell>
                          { item.fullName }
                        </DataTable.Cell>
                        <DataTable.Cell>
                          { item.birthday }
                        </DataTable.Cell>
                        <DataTable.Cell>
                          { item.lastVisit }
                        </DataTable.Cell>
                        <DataTable.Cell style = { styles.checkInButton }
                          onPress = {
                            () => this.checkInPatient(item.key)
                          }>
                          <Text style = {
                            { color: 'white', fontSize: 20 }
                            }>
                            Check In
                          </Text>
                        </DataTable.Cell >
                      </DataTable.Row> );
                  }
                }
                keyExtractor = { item => item.key }
                onRefresh = {
                  () => {
                    this.setState({ isFetching: true }, () => this.syncAndLoadPatients());
                  }
                }
                refreshing = { this.state.isFetching }/>
            </SafeAreaView>
          </DataTable>
        </View>
      </View>
    </Container>);
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
  addPatientButton: {
    width: "15%",
    backgroundColor: 'blue',
    marginTop: '3.5%',
    marginBottom: '2%',
    flex: 1,
    marginLeft: "11%"
  }
});

// Redux
import { setLoading, clearMessages, setErrorMessage, setSuccessMessage } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  loading: state.loading,
});

const mapDispatchToProps = dispatch => ({
  setLoading: (val, showRetryButton) => dispatch(setLoading(val, showRetryButton)),
  clearMessages: () => dispatch(clearMessages()),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
  setSuccessMessage: val => dispatch(setSuccessMessage(val)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PatientCheckIn);
