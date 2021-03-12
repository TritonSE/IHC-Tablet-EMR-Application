import React, { Component } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import TriageLabComponent from './TriageLabComponent';

export default class TriageLabsWheel extends Component<{}> {
  /* Props
   * updateLabResult: function that takes in a test name and the index option
   *   that was chosen i.e. test name of 'cholestrol' and chosen option index of
   *   0, which might correspond to an option like 'healthy'
   * tests: array of test objects, created using the static function below, that
   *   holds info about lab test results
   */
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        { this.props.tests.map( test => {
          return (
            <TriageLabComponent
              name={test.displayName}
              options={test.options}
              enabled={this.props.enabled}
              selectedIndex={test.result}
              onValueChange={
                (index) => {this.props.updateLabResult(test.propertyName, index);}
              }
              key={`${test.propertyName}lab`}
            />
          );
        })}
      </View>
    );
  }

  // Name of the property in the model),
  // Name to be displayed in the application
  // options for the test results, result is the index of the
  // option selected
  static createLabTestObject(propertyName, displayName, options, result = 0) {
    return {propertyName, displayName, options, result};
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    flexWrap: 'wrap'
  }
});
