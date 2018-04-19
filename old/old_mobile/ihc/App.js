/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  ActivityIndicator,
  Button,
  Text,
  View
} from 'react-native';
import {API_HOME} from './config';

export default class App extends Component<{}> {
  constructor(props) {
    super(props);
    state = {text: "", loading: false};
  }

  uploadUpdates = () => {
    this.setState({text: "Upload", loading: true});
    /*
      fetch(`${API_HOME}/groups/${groupId}/all`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstParam: 'yourValue',
          secondParam: 'yourOtherValue',
        })
      })
    */
  }

  downloadUpdates = () => {
    this.setState({text: "Download", loading: false});
  }

  newPatient = () => {
    this.setState({text: "New patient"});
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          {this.state.text}
        </Text>
        <ActivityIndicator animating?={this.state.loading} />
        <Button onPress={uploadUpdates}
          title="Upload updates"/>
        <Button onPress={downloadUpdates}
          title="Download updates"/>
        <Button onPress={newPatient}
          title="New patient"/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
