import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

import { Col, Row, Grid } from 'react-native-easy-grid';
import UpdateMedicationModal from './UpdateMedicationModal';
import {localData, serverData} from '../services/DataService';
import Button from './Button';

export default class MedicationInventory extends Component<{}> {
  /*
   * Expects in props:
   *  {
   *    rows: [Medication],
   *    createMedication: function,
   *    updateMedication: function
   *  }
   */
  constructor(props) {
    super(props);
    this.tableHeaders = ['Drug Name', 'Quantity', 'Dosage', 'Units', 'Notes'];
    this.rowNum = 0;
    this.state = { showModal: false, oldKey: null, 
      formValues: {drugName: null, quantity: null, dosage: null, units: null, comments: null}};
  }

  openEditModal = (oldMedication) => {
    const oldKey = oldMedication.key;
    const formValues = this.getCurrentMedication(oldKey);
    this.setState({ showModal: true, oldKey: oldKey, formValues: formValues});
  }

  openAddModal = () => {
    this.setState({ showModal: true, oldKey: null, 
      formValues: {drugName: null, quantity: null, dosage: null, units: null, comments: null}});
  }

  closeModal = () => {
    this.setState({ showModal: false});
  }
  saveModal = (newMedication) => {
    if (this.state.oldKey == null) {
      this.props.createMedication(newMedication);
    } else {
      this.props.updateMedication(this.state.oldKey, newMedication);
    }
  }

  getCurrentMedication(oldKey) {
    let medication = localData.getMedicationWithKey(oldKey);

    // medication[0] since getMedicationWithKey gives
    let drugName = medication[0].drugName;
    let quantity = medication[0].quantity;
    let dosage = medication[0].dosage;
    let units = medication[0].units;
    let comments = medication[0].comments;
    return {drugName: drugName, quantity: quantity, dosage: dosage, units: units, comments: comments};
  }

  // Renders each column in a row
  renderCol = (element, keyFn, index) => {
    return (
      <Col style={styles.otherCol} size={2} key={keyFn(index)}>
        <Text>{element}</Text>
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
      </Row>
    );
  }

  renderHeader(data, keyFn) {
    const cols = data.map( (e,i) => (
      <Col size={2} style={styles.otherCol} key={keyFn(i)}>
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
          onPress={this.openAddModal}
          text='Add Medication' />

        <UpdateMedicationModal
          showModal={this.state.showModal}
          closeModal={this.closeModal}
          saveModal={this.saveModal}
          formValues={this.state.formValues}
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
   headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    textAlign: 'center',
},
  rowContainer: {
    flex: 1,
    alignSelf: 'stretch',
    minHeight: 32,
  },
  otherCol: {
    borderWidth: 1,
    minWidth: 150,
    minHeight: 25
  },
  headerRow: {
    backgroundColor: '#dbdbdb',
    borderWidth: 1,
    flex: 1,
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
  text: {
    textAlign: 'center',
    width: 130,
  },
  buttonContainer: {
    width:'50%',
    alignSelf: 'center',
    marginBottom: 10
  },
});
