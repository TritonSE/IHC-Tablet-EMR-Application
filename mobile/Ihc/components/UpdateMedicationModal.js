import React, { Component } from 'react';
import {
  StyleSheet,
  TextInput,
  Text,
  Modal,
  View
} from 'react-native';
import Button from './Button';
import Medication from '../models/Medication';

/*
 * Modal to update a status object's notes field
 */
export default class UpdateMedicationModal extends Component<{}> {
  /*
   * Expects in props:
   *  {
   *    showModal: boolean
   *    closeModal: function
   *    saveModal: function
   *    updateMedication: function
   *    medicationToEdit: Medication object
   *  }
   */
  constructor(props) {
    super(props);
  }

  updateName(drugName) {
    this.props.medicationToEdit.drugName = drugName;
    this.props.updateMedication(this.medication);
  }

  updateQuantity(quantity) {
    this.props.medicationToEdit.quantity = parseInt(quantity,10);
    this.props.updateMedication(this.medication);
  }

  updateDosage(dosage) {
    this.props.medicationToEdit.dosage = parseInt(dosage, 10);
    this.props.updateMedication(this.medication);
  }

  updateUnits(units) {
    this.props.medicationToEdit.units = units;
    this.props.updateMedication(this.medication);
  }

  updateComments(comments) {
    this.props.medicationToEdit.comments = comments;
    this.props.updateMedication(this.medication);
  }

  render() {

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={this.props.showModal}
        onRequestClose={this.props.closeModal} >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <Text style={styles.title}>Update Medication</Text>
            <Text>Medication Name:</Text>
            <TextInput style={styles.notesInput}
              multiline={false}
              numberOfLines={1}
              value={this.props.medicationToEdit.drugName}
              onChangeText={this.updateName}/>
            <Text>Quantity:</Text>
            <TextInput style={styles.notesInput}
              multiline={false}
              numberOfLines={1}
              value={(String)(this.props.medicationToEdit.quantity)}
              onChangeText={this.updateQuantity}/>
            <Text>Dosage</Text>
            <TextInput style={styles.notesInput}
              multiline={false}
              numberOfLines={1}
              value={(String)(this.props.medicationToEdit.dosage)}
              onChangeText={this.updateDosage}/>
            <Text>Units:</Text>
            <TextInput style={styles.notesInput}
              multiline={false}
              numberOfLines={1}
              value={this.props.medicationToEdit.units}
              onChangeText={this.updateUnits}/>
            <Text>Comments:</Text>
            <TextInput style={styles.notesInput}
              multiline={false}
              numberOfLines={1}
              value={this.props.medicationToEdit.comments}
              onChangeText={this.updateComments}/>
            <View style={styles.modalFooter}>
              <Button style={styles.buttonContainer} onPress={this.props.closeModal}
                text='Cancel' />

              <Button style={styles.buttonContainer}
                onPress={this.props.saveModal}
                text='Save' />
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

export const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: 24
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    width: '80%',
    height: '60%',
    backgroundColor: '#f6fdff',
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalFooter: {
    height: 60,
    flex: 1,
    flexDirection: 'row',
    margin: 4,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContainer: {
    width: 150,
    height: 40,
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    width: '90%',
    margin: 8,
    borderWidth: 1
  }
});
