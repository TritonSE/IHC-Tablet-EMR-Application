import React, { Component } from 'react';
import {
  StyleSheet,
  Modal,
  View
} from 'react-native';
let t = require('tcomb-form-native');
let Form = t.form.Form;

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
   *  }
   */
  constructor(props) {
    super(props);
  }

  Units = t.enums({
    kg: 'kg',
    g: 'g',
    mg: 'mg',
    ml: 'ml'
  });

  Medication = t.struct({
    drugName: t.String,
    quantity: t.Number,
    dosage: t.Number,
    units: this.Units,
    comments: t.maybe(t.String)
  });

  onFormChange = (value) => {
    this.props.updateFormValues(value);
  }

  submit = () => {
    if(!this.refs.form.validate().isValid()) {
      return;
    }
    const form = this.refs.form.getValue();
    const medication = Medication.extractFromForm(form);

    this.props.saveModal(medication);
  }

  delete = () => {
    if(!this.refs.form.validate().isValid()) {
      return;
    }
    const form = this.refs.form.getValue();
    const medication = Medication.extractFromForm(form);

    this.props.deleteMedication(medication);
  }

  render() {
    let deleteButton;
    if (this.props.isEditModal()) {
      deleteButton = <Button text='Delete' style={styles.buttonContainer} onPress={this.delete} />;
    }

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={this.props.showModal}
        onRequestClose={this.props.closeModal} >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            <View style={styles.form}>
              <Form ref="form"
                type={this.Medication}
                value={this.props.formValues}
                options={this.props.formOptions}
                onChange={this.onFormChange} />
              <View style={styles.modalFooter}>
                <Button text='Cancel'
                  style={styles.buttonContainer}
                  onPress={this.props.closeModal} />
                <Button text='Save'
                  style={styles.buttonContainer}
                  onPress={this.submit} />
                {deleteButton}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modal: {
    width: '60%',
    height: '70%',
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
  form: {
    width: '80%',
  }
});
