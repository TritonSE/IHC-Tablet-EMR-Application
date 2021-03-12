import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image
} from 'react-native';
let t = require('tcomb-form-native');
let Form = t.form.Form;
import {serverData} from '../services/DataService';
import Container from '../components/Container';
import Button from '../components/Button';
import Credentials from '../models/Credentials';

class LoginScreen extends Component<{}> {
  constructor(props) {
    super(props);
  }

  Locations = t.enums({
    Tijuana: 'Tijuana',
    California: 'California'
  });

  credentials = t.struct({
    userId: t.String,
    password: t.String,
    location: this.Locations
  });

  options = {
    fields: {
      password: {
        password: true,
        secureTextEntry: true
      }
    }
  };

  submit  = () => {
    if(!this.refs.form.validate().isValid()) {
      return;
    }
    const form = this.refs.form.getValue();
    const credentials = Credentials.extractFromForm(form);

    this.props.setLoading(true);
    this.props.clearMessages();

    serverData.checkCredentials(credentials)
      .then( () => {
        if(this.props.loading) {
          this.props.setLoading(false);
          this.goToWelcomeScreen();
        }
      })
      .catch( (err) => {
        if(this.props.loading) {
          this.props.setLoading(false, true);
          this.props.setErrorMessage(err.message);
          return;
        }
      });
    return;
  }

  goToWelcomeScreen = () => {
    this.props.navigator.push({
      screen: 'Ihc.WelcomeScreen',
      title: 'Welcome'
    });
  }

  render() {
    return (
      <View style={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>

        <View style={{
          height: '30%',
          width: '100%',
          }}>

          <Image source={require('../images/ihc.png')} />

        </View>

        <View style={{
          height: '70%',
          width: '100%',
          backgroundColor: '#0660AE',
        }}>

        </View>

        <View style={{
          width: 500,
          backgroundColor: 'white',
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 50,
          paddingLeft: 15,
          paddingRight: 15,
          top: 100,
          shadowColor: "#000",
          shadowOffset: {
          	width: 0,
          	height: 2,
          },
          shadowOpacity: 0.23,
          shadowRadius: 2.62,
          elevation: 4,
        }}>

        <Container>
        <View style={styles.form}>
        <Form ref="form"
          type={this.credentials}
          options={this.options}/>
      </View>

      <Button onPress={this.submit}
        text="Login"
        style={styles.button}
      />
      </Container>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  button: {
    width: 400
  },
  form: {
    width: '80%',
  }
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

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen);
