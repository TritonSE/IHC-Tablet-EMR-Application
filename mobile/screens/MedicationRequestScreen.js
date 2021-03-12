import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  CheckBox,
  Text,
  Alert,
  View,
  SafeAreaView,
  FlatList
} from 'react-native';
import { DataTable, Searchbar } from 'react-native-paper';
import Button from '../components/Button';
import Patient from '../models/Patient';
import { localData, serverData } from '../services/DataService';
import Container from '../components/Container';
import { stringDate } from '../util/Date';
import { downloadMedRequests } from '../util/Sync';

class MedicationRequestScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      firstQuery: '',
      isFetching: false,
      showingTodo: true,
      medRequests: []
    };
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }


  //sync and loads patients that are checked in
  syncAndLoadMedRequests = () => {
    console.log('syncing');
    //this.props.setLoading(true);
    this.props.clearMessages();
    const medRequests = localData.getMedicationRequests();
    console.log("med requests:");
    console.log(medRequests);
    this.setState({ medRequests: medRequests });

    //serverData.getUpdatedMedRequests(
    downloadMedRequests()
    .then((failedPatientKeys) => {
      // View README: Handle syncing the tablet, point 3 for explanation
      console.log("within downstream Sync");
      if (this.props.loading) {
        if (failedPatientKeys.length > 0) {
          throw new Error(`${failedPatientKeys.length} lab requests didn't properly sync.`);
        }
        let newStatuses = localData.getStatuses(today);
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
        const medRequests = localData.getMedicationRequests();
        console.log("med requests:");
        console.log(medRequests);
        this.setState({ medRequests: medRequests });
        this.setState({ isFetching: false });
      });
  }

  onNavigatorEvent(event) {
    if (event.id === 'willAppear') {
      this.syncAndLoadMedRequests();
    }
  }

  //if num is 1, get triage
  //if num is 2, get soap
  //if num is 3, get Complete
  getStatus = (patient, num) => {
    return (patient[num] ? "Complete" : "");
  }

  goToMedicationFillout = (requestKey) => {
    this.props.navigator.push({
      id: 'goToLabrequest',
      screen: 'Ihc.MedicationFilloutScreen',
      title: 'Labs',
      passProps: {
        requestKey: requestKey,
        canModify: true,
        showForm: true
      }
    });
  }

  filterPatients = () => {
  }

  deleteRequest = (item) => {
    Alert.alert('Confirm Delete Request', 
      `Are you sure you want to cancel the medication request
            test for ${Patient.fullName(localData.getPatient(item.patientKey))}?`,
      [
        {
          text: 'Yes', 
          onPress: () => {
            serverData.dequeueLabRequest(item);
            localData.dequeueMedicationRequest(item.key);
            this.syncAndLoadMedRequests();
          }
        }, 
        {
          text: 'No', 
          onPress: () => {}
        }
      ]
    );
  }

  render() {
    return (<Container>
      <View style = {
        { height: '100%', width: '100%' }}>
        <View>
          {
            //<Searchbar placeholder = "Search"
            //onChangeText = {
            //query => {
            //this.setState({ firstQuery: query }, () => this.filterPatients());
            //}
            //}
            //value = { this.state.firstQuery }
            //style = { styles.search }
            ///>
          }
          <View style={styles.inputsection, {flexDirection:'row', marginLeft: '17%', marginTop: 10}}>
            <Text style={{fontSize:20}}>Show Completed?</Text>
            <CheckBox value={!this.state.showingTodo} onValueChange={() => this.setState({showingTodo: !this.state.showingTodo})}/>
          </View>
        </View>

        <View>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title >
                { `(${this.state.medRequests.length})  Requests` }
              </DataTable.Title>
              <DataTable.Title>
                Date Requested
              </DataTable.Title>
              <DataTable.Title>
                Completed
              </DataTable.Title>
              <DataTable.Title>
              </DataTable.Title>
            </DataTable.Header>

            <SafeAreaView>
              <FlatList data = { this.state.showingTodo ? 
                  this.state.medRequests.filter(request => request.dateCompleted == null) 
                  :this.state.medRequests.filter(request => request.dateCompleted != null) }
                renderItem = {
                  ({ item }) => {
                    return ( <DataTable.Row key = { item.patientKey }
                      onPress = {
                        () => this.goToMedicationFillout(item.key)
                      }>
                      <DataTable.Cell >
                        { Patient.fullName(localData.getPatient(item.patientKey)) }
                      </DataTable.Cell>
                      <DataTable.Cell >
                        { item.dateRequested }
                      </DataTable.Cell>
                      <DataTable.Cell >
                        { item.dateCompleted != null }
                      </DataTable.Cell>
                      <DataTable.Cell style = { styles.button }
                        onPress = {
                          () => this.deleteRequest(item)
                        }>
                        <Text style = {
                          { color: 'white', fontSize: 20 }
                          }>
                          Cancel Request
                        </Text>
                      </DataTable.Cell >
                    </DataTable.Row> );
                  }
                }
                keyExtractor = { item => item.key }
                onRefresh = {
                  () => {
                    this.setState({ isFetching: true }, () => this.syncAndLoadMedRequests());
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
    backgroundColor: 'red',
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

export default connect(mapStateToProps, mapDispatchToProps)(MedicationRequestScreen);


