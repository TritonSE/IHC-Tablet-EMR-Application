/*
 * display when a component called an async service we want to show a loading
 * indicator for
 */
import React, { Component } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {localData} from '../services/DataService';
import Button from './Button';

class Loading extends Component<{}> {
  /*
   * Redux props:
   * setErrorMessage: function to set error msg if cancel button is clicked
   *   or null if not needed
   * setLoading: function to toggle loading, second param is true if user canceled
   * currentPatientKey: the patientKey to mark as upload in case loading is canceled,
   *   or null if not needed
   */
  constructor(props) {
    super(props);
  }

  cancel = () => {
    if(this.props.currentPatientKey) {
      localData.markPatientNeedToUpload(this.props.currentPatientKey);
    }

    // If we cancelled a downstream sync, then display a different message
    if(this.props.uploading)
      this.props.setErrorMessage('Cancelled. May need to retry.');
    else
      this.props.setErrorMessage('Canceling may cause data to be out of sync.');

    // Show retry button when cancel button is pressed
    this.props.setLoading(false, true);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading...</Text>
        <ActivityIndicator size="large" />
        <Button style={styles.button} text="Cancel" onPress={this.cancel} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    margin: 4
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: '#F5FCFF'
  },
  button: {
    width: 120
  }
});

// Redux
import { setLoading, setErrorMessage } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  currentPatientKey: state.currentPatientKey,
  uploading: state.uploading
});

const mapDispatchToProps = dispatch => ({
  setLoading: (val,showRetryButton) => dispatch(setLoading(val, showRetryButton)),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Loading);
