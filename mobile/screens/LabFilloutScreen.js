import React, { Component } from 'react';
import {
  StyleSheet,
} from 'react-native';
import LabScreen from "../screens/LabScreen";

class LabFilloutScreen extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <LabScreen
                tabLabel = { { label: "LABS" } }
                canModify = { true }
                currentPatientKey = { this.props.patientKey }
                labRequestKey = {this.props.labRequestKey}
                showing = {[this.props.testName]}
            />
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

    export default connect(mapStateToProps, mapDispatchToProps)(LabFilloutScreen);

