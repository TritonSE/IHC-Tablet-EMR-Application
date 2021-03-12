import React, { Component } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableHighlight
} from 'react-native';
import Button from '../components/Button';
let t = require('tcomb-form-native');
let Form = t.form.Form;

/*
 * Our customizable Button component
 */
export default class TriagePatientPage extends Component<{}> {
  /*
   * props:
   * text: string, the text to be displayed on the button
   * onPress: function to be called when the button is clicked
   * style: optional style object for the button
   * textStyle: optional style object for the text
   * disabled: boolean, display a greyed out button
   */

   credentials = t.struct({
     userId: t.String,
     password: t.String,
   });

   options = {
     fields: {
       password: {
         password: true,
         secureTextEntry: true
       }
     }
   };

   state = {
     modalVisible: false,
   };

   setModalVisible(visible) {
     this.setState({modalVisible: visible});
   }

  render() {
    return (
      <View>
        <View style={{marginTop: 22}}>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.modalVisible}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
            }}>
            <View style={{marginTop: 22}}>
              <View>
                <Text>Hello World!</Text>

                <TouchableHighlight
                  onPress={() => {
                    this.setModalVisible(!this.state.modalVisible);
                  }}>
                  <Text>Hide Modal</Text>
                </TouchableHighlight>
              </View>
            </View>
          </Modal>
        </View>


        <Button
        onPress={() => {
          this.setModalVisible(true);
        }}
        style={styles.button}
        text='Add New Form for April 20, 2019' />
        <Text>Hello</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    width: 300,
    marginTop: 15
  },
});
