import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

export default class SuccessErrorMessages extends Component<{}> {
  /*
   * errorMsg: null or string
   * successMsg: null or string
   */
  constructor(props) {
    super(props);
  }

  render = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>
          {this.props.errorMsg}
        </Text>
        <Text style={styles.success}>
          {this.props.successMsg}
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  success: {
    textAlign: 'center',
    color: 'green',
  },
  error: {
    textAlign: 'center',
    color: 'red',
  },
});
