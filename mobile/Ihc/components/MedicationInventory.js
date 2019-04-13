import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { Col, Row, Grid } from 'react-native-easy-grid';
import UpdateMedicationModal from './UpdateMedicationModal';
import Button from './Button';
let t = require('tcomb-form-native');

export default class MedicationInventory extends Component<{}> {
  /*
   * Expects in props:
   *  {
   *    rows: [Medication],
   *    createMedication: function,
   *    updateMedication: function,
   *    deleteMedication: function
   *  }
   */

  constructor(props) {
    super(props);
    this.tableHeaders = ['Drug Name', 'Quantity', 'Dosage', 'Units', 'Notes', ' ']; //blank header for 'x' column
    this.rowNum = 0;

    const formValues = {drugName: null, quantity: null, dosage: null, units: null, comments: null};
    this.state = { showModal: false, medicationKey: null, formOptions: this.addModalFormOptions, formValues: formValues};
  }

  getStyle(index) {
    switch(index) {
      case 0:
        return styles.drugNameCol;
      case 1:
      case 2:
      case 3:
        return styles.otherCol;
      case 4:
        return styles.notesCol;
      default:
        return styles.otherCol;
    }
  }

  getSize(index) {
    switch(index) {
      case 0: // drug name
        return 3;
      case 1: // quantity
      case 2: // dosage
      case 3: // units
        return 1;
      case 4: // notes
        return 3;
      default:
        return 1;
    }
  }

  getTextStyle(index) {
    switch(index) {
      case 0: // drug name
        return styles.drugText;
      case 1: // quantity
        return styles.otherText;
      case 2: // dosage
        return styles.otherText;
      case 3: // units
        return styles.otherText;
      case 4: // notes
        return styles.notesText;
      default:
        return styles.otherText;
    }
  }

  addModalFormOptions = {
    fields: {
      comments: {
        multiline: true,
      },
    }
  };

  editModalFormOptions = {
    fields: {
      drugName: {
        editable: false,
      },
      dosage: {
        editable: false,
      },
      units: {
        editable: false, //TODO: units dropdown menu is not disabled
      },
      comments: {
        multiline: true,
      },
    }
  };

  openEditModal = (medication) => {
    const medicationKey = medication.key;
    const formValues = this.getFormValuesFromMedication(medication);
    this.setState({ showModal: true, medicationKey: medicationKey, formOptions: this.editModalFormOptions, formValues: formValues });
  }

  openAddModal = () => {
    const formValues = {drugName: null, quantity: null, dosage: null, units: null, comments: null};
    this.setState({ showModal: true, medicationKey: null, formOptions: this.addModalFormOptions, formValues: formValues });
  }

  closeModal = () => {
    this.setState({ showModal: false, formOptions: this.addModalFormOptions });
  }
  saveModal = (newMedication) => {
    if (this.state.medicationKey == null) {
      this.props.createMedication(newMedication);
    } else {
      this.props.updateMedication(this.state.medicationKey, newMedication);
    }
  }

  deleteMedication = (medication) => {
    const medicationKey = medication.key;
    this.props.deleteMedication(medicationKey);
  }

  isEditModal = () => {
    return this.state.medicationKey !== null;
  }

  getFormValuesFromMedication(medication) {
    let drugName = medication.drugName;
    let quantity = medication.quantity;
    let dosage = medication.dosage;
    let units = medication.units;
    let comments = medication.comments;
    return {drugName: drugName, quantity: quantity, dosage: dosage, units: units, comments: comments};
  }

  updateFormValues = (values) => {
    this.setState({formValues: values});
  }

  // Renders each column in a row
  renderCol = (element, keyFn, index) => {
    return (
      <Col style={this.getStyle(index)} size={this.getSize(index)} key={keyFn(index)}>
        <Text style={this.getTextStyle(index)}>{element}</Text>
      </Col>
    );
  }

  extractMedicationElements = (medication) => {
    let arr = [];
    arr[0] = medication.drugName;
    arr[1] = medication.quantity;
    arr[2] = medication.dosage;
    arr[3] = medication.units;
    arr[4] = medication.comments;
    return arr;
  }

  renderRow = (medication, keyFn) => {
    //puts the properties of medication into an array
    let medData = this.extractMedicationElements(medication);

    // Renders each property
    let cols = medData.map( (e,i) => {
      return this.renderCol(e,keyFn,i);
    });

    return (
      // Entire row is clickable to open a modal to edit
      <Row key={`row${this.rowNum++}`} style={styles.rowContainer}
        onPress={() => this.openEditModal(medication)}>
        {cols}
        <Button style={styles.deleteButton}
          onPress = {() => this.deleteMedication(medication)}
          text='x' />
      </Row>
    );
  }

  renderHeader(data, keyFn) {
    const cols = data.map( (e,i) => (
      <Col size={this.getSize(i)} style={this.getStyle(i)} key={keyFn(i)}>
        <Text style={styles.text}>{e}</Text>
      </Col>
    ));

    return (
      <Row style={styles.headerRow}>
        {cols}
      </Row>
    );
  }

  render() {
    // Render row for header, then render all the rows
    return (
      <View style={styles.container}>
        <Button style={styles.buttonContainer}
          onPress={() => this.openAddModal()}
          text='Add Medication' />

        <UpdateMedicationModal
          showModal={this.state.showModal}
          formOptions={this.state.formOptions}
          formValues={this.state.formValues}
          closeModal={this.closeModal}
          saveModal={this.saveModal}
          isEditModal={this.isEditModal}
          deleteMedication={this.deleteMedication}
          updateFormValues={this.updateFormValues}
        />

        <Grid>
          {this.renderHeader(this.tableHeaders, (i) => `header${i}`)}
          {this.props.rows.map( row => this.renderRow(row, (i) => `row${i}`) )}
        </Grid>
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  rowContainer: {
    borderWidth: 1,
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  notesCol: {
    borderWidth: 1,
  },
  otherCol: {
    borderWidth: 1,
  },
  drugNameCol: {
    borderWidth: 1,
  },
  headerRow: {
    backgroundColor: '#dbdbdb',
    borderWidth: 1,
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
  otherText: {
    textAlign: 'center',
    width: 70,
  },
  buttonContainer: {
    width: 150,
    height: 40,
  },
  deleteButton: {
    width: 20,
    height: 20,
  },
});
