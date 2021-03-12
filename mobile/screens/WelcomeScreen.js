import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';
import { localData, serverData } from '../services/DataService';
import Container from '../components/Container';
import Button from '../components/Button';
import { downstreamSyncWithServer } from '../util/Sync';
import MenuItem from '../components/MenuItem';
import UnitSwitch from '../components/UnitSwitch'


class newWelcomeScreen extends Component {


    static _navigatorButtons = {
        _rightButtons: [
            {
                title: "Test",
                id: "test_id",
                disabled: false,
                buttonColor: 'blue',
            }
        ],
        get rightButtons() {
            return this._rightButtons;
        },
        set rightButtons(value) {
            this._rightButtons = value;
        },
    };
    static get navigatorButtons() {
        return newWelcomeScreen._navigatorButtons;
    }
    static set navigatorButtons(value) {
        newWelcomeScreen._navigatorButtons = value;
    }
    constructor(props) {
        super(props);
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
       /**
        this.state = {
            unitSwitchValue: false,
        }
        */
    }

    /*
    toggleUnitSwitch = (value) => {
        this.setState({ unitSwitchValue: value })
        console.log('Switch 1 is: ' + value)
    }
    */

    onNavigatorEvent(event) {
        if (event.id == 'willAppear') {
            this.upload();
            this.download();
        } 
        if (event.id == 'test_id') {
            console.log(event)
            console.log(this.props.navigator)
            console.log(newWelcomeScreen._navigatorButtons)
            let myButton = newWelcomeScreen._navigatorButtons._rightButtons[0]
            console.log(myButton)
            myButton.setState({buttonColor: "green"})
            //this.forceUpdate()
            console.log(myButton)
            //navigatorButtons.rightButtons.test_id.buttonColor = 'green'
            //navigation.navigatorButtons.test_id.buttonColor = 'green'
        }
    }

    goToScreen = (screenName, title) => {
        this.props.navigator.push({
            screen: screenName,
            title: title,
        });
    }

    upload = () => {
        this.props.setLoading(true);
        this.props.isUploading(true);
        this.props.clearMessages();

        const patients = localData.getPatientsToUpload();
        serverData.updatePatients(patients)
            .then(() => {
                // View README: Handle syncing the tablet, point 3 for explanation
                if (this.props.loading) {
                    localData.markPatientsUploaded();
                    this.props.setLoading(false);
                    this.props.setSuccessMessage('Uploaded successfully');
                }
            })
            .catch(err => {
                if (this.props.loading) {
                    this.props.setLoading(false);
                    this.props.setErrorMessage(err.message);
                }
            });
    }

    download = () => {
        this.props.setLoading(true);
        this.props.isUploading(false);
        this.props.clearMessages();

        downstreamSyncWithServer()
            .then((failedPatientKeys) => {
                // View README: Handle syncing the tablet, point 3 for explanation
                if (this.props.loading) {
                    if (failedPatientKeys.length > 0) {
                        throw new Error(`${failedPatientKeys.length} patients failed to download. Try again`);
                    }

                    this.props.setLoading(false);
                    this.props.setSuccessMessage('Downloaded successfully');
                }
            })
            .catch(err => {
                if (this.props.loading) {
                    this.props.setLoading(false);
                    this.props.setErrorMessage(err.message);
                }
            });

    }

    render() {
        return (
            <Container >
              <View style = { styles.menuContainer } >
                <TouchableOpacity onPress = { () => this.goToScreen("Ihc.PatientCheckIn", "Patient Check In") }
                style = { styles.TouchableOpacityStyle } >
                  <MenuItem itemImage = { require('../images/WelcomeScreen/CheckInPatient.png') }
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress = { () => this.goToScreen("Ihc.PatientList", "Select Patient") }
                style = { styles.TouchableOpacityStyle } >
                  <MenuItem itemImage = { require('../images/WelcomeScreen/PatientList.png') }
                  />
                </TouchableOpacity >
                <TouchableOpacity onPress = { () => this.goToScreen("Ihc.LabRequestScreen", "Lab Requests") }
                style = { styles.TouchableOpacityStyle } >
                  <MenuItem itemImage = { require('../images/WelcomeScreen/Labs.png') }
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress = { () => this.goToScreen("Ihc.MedicationRequestScreen", "Medication Inventory") }
                style = { styles.TouchableOpacityStyle } >
                  <MenuItem itemImage = { require('../images/WelcomeScreen/Pharmacy.png') }
                  />
                </TouchableOpacity >
                 <TouchableOpacity onPress = { () => this.goToScreen("Ihc.SettingsScreen", "Settings") }
                 style = { styles.menuSettings } >
                    <MenuItem itemImage = { require('../images/WelcomeScreen/Settings.jpg') }
                  />
                 </TouchableOpacity>
              </View>
            </Container >
        );
    }
}


const styles = StyleSheet.create({
    menuContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 600,
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 50,
        marginLeft: '10%'
    },
    TouchableOpacityStyle: {
        height: '38%',
        width: '50%',
    },
    menuSettings: {
        height: '15%',
        width: '100%',
    },
});

// Redux
import { setLoading, setErrorMessage, setSuccessMessage, clearMessages, isUploading } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
    loading: state.loading
});

const mapDispatchToProps = dispatch => ({
    setLoading: val => dispatch(setLoading(val)),
    setErrorMessage: val => dispatch(setErrorMessage(val)),
    setSuccessMessage: val => dispatch(setSuccessMessage(val)),
    clearMessages: () => dispatch(clearMessages()),
    isUploading: val => dispatch(isUploading(val))
});

export default connect(mapStateToProps, mapDispatchToProps)(newWelcomeScreen);
