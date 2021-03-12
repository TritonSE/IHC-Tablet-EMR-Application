import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView,
  View
} from 'react-native';

import SuccessErrorMessages from './SuccessErrorMessages';
import Loading from './Loading';
import {localData, serverData} from '../services/DataService';
import Button from './Button';
import {downstreamSyncWithServer} from '../util/Sync';

/*
 * Common wrapper around Screens. Includes code for the ScrollView,
 * Success/Error messages, Retry button, and Loading indicator
 */
class Container extends Component<{}> {
  /*
   * Redux props:
   * loading: boolean true if the component is loading
   * successMessage: null or string
   * errorMessage: null or string
   * showRetryButton: boolean
   * uploading: true if the screen is trying to upload to the server, false if
   *   the screen is trying to download from the server. Used for Retry button.
   *
   * Props from parent:
   * children: the JSX that will be displayed within the container
   *
   * use Container like
   * <Container>
   *  <Text>Text</Text>
   * </Container>
   */
  constructor(props) {
    super(props);
  }

  // Retry retries sending ALL updates, so is equivalent to Upload Updates
  // button on the WelcomeScreen
  retry = () => {
    if(this.props.uploading)
      this.retryUpload();
    else
      this.retryDownload();
  }

  retryDownload = () => {
    this.props.setLoading(true);
    downstreamSyncWithServer()
      .then((failedPatientKeys) => {
        if(this.props.loading) {
          if(failedPatientKeys.length > 0) {
            throw new Error(`${failedPatientKeys.length} patients didn't properly sync.`);
          }

          this.props.setSuccessMessage('Downloaded successfully');
          this.props.setLoading(false);
        }
      })
      .catch(err => {
        if(this.props.loading) {
          this.props.setErrorMessage(err.message);
          this.props.setLoading(false);
        }
      });
  }

  retryUpload = () => {
    this.props.setLoading(true);
    const patients = localData.getPatientsToUpload();
    serverData.updatePatients(patients)
      .then(() => {
        if(this.props.loading) {
          localData.markPatientsUploaded();
          this.props.setSuccessMessage('Uploaded successfully');
          this.props.setLoading(false);
        }
      })
      .catch(err => {
        if(this.props.loading) {
          this.props.setErrorMessage(err.message);
          this.props.setLoading(false);
        }
      });
  }

  render = () => {
    if (this.props.loading) {
      return (
        <View style={styles.outside}>
          <Loading />
        </View>
      );
    }

    if (this.props.showRetryButton) {
      return (
        <View style={styles.outside}>
          <ScrollView contentContainerStyle={styles.container}>
            {this.props.children}
          </ ScrollView>

          <View style={styles.buttonContainer}>
            <Button text="Retry" onPress={this.retry} />
          </View>

          <SuccessErrorMessages errorMsg={this.props.errorMessage}
            successMsg={this.props.successMessage} />
        </View>
      );
    }

    return (
      <View style={styles.outside}>
        <ScrollView contentContainerStyle={styles.container}>
          {this.props.children}
        </ ScrollView>

        <SuccessErrorMessages errorMsg={this.props.errorMessage}
          successMsg={this.props.successMessage} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
  },
  outside: {
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Redux
import { setLoading, setErrorMessage, setSuccessMessage, clearMessages } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  loading: state.loading,
  errorMessage: state.messages.errorMessage,
  successMessage: state.messages.successMessage,
  showRetryButton: state.showRetryButton,
  uploading: state.uploading
});

const mapDispatchToProps = dispatch => ({
  setLoading: val => dispatch(setLoading(val)),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
  setSuccessMessage: val => dispatch(setSuccessMessage(val)),
  clearMessages: () => dispatch(clearMessages())
});

export default connect(mapStateToProps, mapDispatchToProps)(Container);
