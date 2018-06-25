import React, { Component } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
} from 'react-native';

/* 
 * Our customizable Button component
 */
export default class Button extends Component<{}> {
  /*
   * props:
   * text: string, the text to be displayed on the button
   * onPress: function to be called when the button is clicked
   * style: optional style object for the button
   * textStyle: optional style object for the text
   */
  constructor(props) {
    super(props);
    this.DEFAULT_STYLE = styles.buttonContainer;
  }

  render() {
    return (
      <TouchableOpacity
        style={[styles.buttonContainer, this.props.style]}
        onPress={this.props.onPress}>
        <Text style={[styles.text, this.props.textStyle]}>{this.props.text}</Text>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: '100%',
    height: 40,
    margin: 4,
    padding: 8,
    elevation: 4,
    borderRadius: 2,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontWeight: '500',
    color: '#fefefe',
    textAlign: 'center',
  },
});