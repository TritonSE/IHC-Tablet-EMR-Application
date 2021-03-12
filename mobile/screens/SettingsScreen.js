import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import {formatDate} from '../util/Date';
let t = require('tcomb-form-native');
let Form = t.form.Form;

import {localData, serverData} from '../services/DataService';
import Patient from '../models/Patient';
import Container from '../components/Container';
import Button from '../components/Button';

import SyncStorage from 'sync-storage';

import {is_web_iri} from '../util/ValidUrl';

class SettingsScreen extends Component<{}> {
  /*
   * Redux props:
   *   loading: boolean
   */
  constructor(props) {
    super(props);
    this.state = {
      formValues: {settings: true},
      formType: this.Settings,
    };
    this.props.clearMessages();
  }

  Settings = t.struct({
    serverUrl: t.String,
  });

  options = {
    fields: {
      serverUrl: {label: 'Change Server'},
    }
  }

  submit = () => {
    if(!this.refs.form.validate().isValid()) {
      return;
    }
    const form = this.refs.form.getValue();
    this.props.setLoading(true);
    this.props.clearMessages();
    if (is_web_iri(form.serverUrl)) {
        SyncStorage.set("@ihc:fetchUrl", form.serverUrl).then(() => {
            this.props.setLoading(false);
            this.props.setSuccessMessage(`Server URL changed successfully.`);
            this.setState({
                formValues: {settings: true},
                formType: this.Settings,
            });
        }).catch(e => {
            this.props.setLoading(false);
            this.props.setErrorMessage(e.message);
        });
    } else {
        this.props.setLoading(false);
        this.props.setErrorMessage("URL must be in the format 'http://IP:PORT'");
    }
  }

  render() {
    return (
      <Container>
        <Text style={styles.title}>
          Settings
        </Text>
        <Text style={styles.info}>
            Current Server: {SyncStorage.get("@ihc:fetchUrl")}
        </Text>
        <View style={styles.form}>
          <Form ref='form' type={this.state.formType}
            value={this.state.formValues}
            options={this.options}
          />
          <Button onPress={this.submit}
            style={styles.button}
            text='Submit' />
        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  form: {
    width: '80%',
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    margin: 20,
  },
  info: {
    fontSize: 18,
    textAlign: 'left',
    marginBottom: 15
  }
});

// Redux
import { setLoading, setErrorMessage, setSuccessMessage, clearMessages, isUploading, setCurrentPatientKey } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  loading: state.loading,
});

const mapDispatchToProps = dispatch => ({
  setLoading: (val,showRetryButton) => dispatch(setLoading(val, showRetryButton)),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
  setSuccessMessage: val => dispatch(setSuccessMessage(val)),
  clearMessages: () => dispatch(clearMessages()),
  isUploading: val => dispatch(isUploading(val)),
  setCurrentPatientKey: key => dispatch(setCurrentPatientKey(key))
});

export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);