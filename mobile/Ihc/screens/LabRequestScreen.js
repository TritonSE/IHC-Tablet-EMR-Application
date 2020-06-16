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
import { downloadLabRequests } from '../util/Sync';
import { localData, serverData } from '../services/DataService';
import Container from '../components/Container';
import { stringDate } from '../util/Date';

class LabRequestScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            firstQuery: '',
            labRequests: [],
            isFetching: false,
            showingTodo: true
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }


    //sync and loads patients that are checked in
    syncAndLoadLabRequests = () => {
        console.log('syncing');
        //this.props.setLoading(true);
        this.props.clearMessages();
        const labRequests = localData.getLabRequestsToUpload(true);
        console.log("Lab requests:");
        console.log(labRequests);
        this.setState({ labRequests: labRequests });

        downloadLabRequests()
            .then((downloadedRequests) => {
                // View README: Handle syncing the tablet, point 3 for explanation
                console.log("within downstream Sync");
                if (this.props.loading) {
                    this.setState({labRequests: this.state.labRequests.concat(downloadedRequests)});
                    this.props.setLoading(false);
                }
            })
            .catch(err => {
              console.log('failure: ' + err);
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
            this.syncAndLoadLabRequests();
        }
    }

    //if num is 1, get triage
    //if num is 2, get soap
    //if num is 3, get Complete
    getStatus = (patient, num) => {
        return (patient[num] ? "Complete" : "");
    }

    goToLabrequest = ({patientKey, testType, key}) => {
        this.props.navigator.push({
            id: 'goToLabrequest',
            screen: 'Ihc.LabFilloutScreen',
            title: 'Labs',
            passProps: {
                patientKey: patientKey,
                labRequestKey: key,
                testName: testType,
                canModify: true,
                showForm: true
            }
        });
    }

    filterPatients = () => {
    }

    deleteRequest = (item) => {
        Alert.alert('Confirm Delete Request', 
            `Are you sure you want to cancel the ${item.testType} 
            test for ${Patient.fullName(localData.getPatient(item.patientKey))}?`,
            [
                {
                    text: 'Yes', 
                    onPress: () => {
                        localData.dequeueLabRequest(item.key);
                        this.syncAndLoadLabRequests();
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
                  { `(${this.state.labRequests.length})  Requests` }
                </DataTable.Title>
                <DataTable.Title>
                  Request Type
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
                      this.state.labRequests.filter(request => request.dateCompleted == '') 
                      :this.state.labRequests.filter(request => request.dateCompleted != '') }
                renderItem = {
                    ({ item }) => {
                        return ( <DataTable.Row key = { item.key }
                            onPress = {
                                () => this.goToLabrequest(item)
                            }>
                              <DataTable.Cell >
                                { Patient.fullName(localData.getPatient(item.patientKey)) }
                              </DataTable.Cell>
                              <DataTable.Cell >
                                { item.testType }
                              </DataTable.Cell>
                              <DataTable.Cell >
                                { item.dateRequested }
                              </DataTable.Cell>
                              <DataTable.Cell >
                                  { item.dateCompleted != '' ? "Yes" : "No" }
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
                    keyExtractor = { item => item.patientKey }
                    onRefresh = {
                        () => {
                            this.setState({ isFetching: true }, () => this.syncAndLoadLabRequests());
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

    export default connect(mapStateToProps, mapDispatchToProps)(LabRequestScreen);

