import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import UpdateMedicationModal from './UpdateMedicationModal';
import Button from './Button';
import Medication from '../models/Medication';

export default class MedicationInventory extends Component<{}> {
  /*
   * Expects in props:
   *  {
   *    rows: [Medication],

   *    saveModal: function
   *  }
   */
  constructor(props) {
    super(props);
    this.tableHeaders = ['Drug Name', 'Quantity', 'Dosage', 'Units', 'Notes'];
    this.rowNum = 0;

    // showModal is the modal to update medication
    // medicationToEdit is the medication that will be edited
    this.state = {showModal: false, 
      medicationToEdit: {
        drugName: '',
        quantity: 0,
        dosage: 0,
        units: '',
        comments: '' //Consider keeping track of multiple comments (array of strings)
      }
    };
  }


  openEditModal = (medicationToEdit) => {
    this.setState({medicationToEdit: medicationToEdit, showModal: true});
    });
  }
  openAddModal = () => {
    this.setState({showModal: true, 
      medicationToEdit: {
        drugName: '',
        quantity: 0,
        dosage: 0,
        units: '',
        comments: '' 
      }
    });
  }
  closeModal = () => {
    this.setState({showModal: false, 
      medicationToEdit: {
        drugName: '',
        quantity: 0,
        dosage: 0,
        units: '',
        comments: '' 
      }
    });
  }

  updateMedication = (newMedication) => {
    this.setState({medicationToEdit: newMedication});
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

        <UpdateMedicationModal
          showModal={this.state.showModal}
          closeModal={this.closeModal}
          saveModal={() => this.props.saveModal(this.state.medicationToEdit)}
          updateMedication={this.updateMedication}
          medicationToEdit={this.state.medicationToEdit}
        />

        <Button style={styles.buttonContainer}
          onPress={() => this.openAddModal()}
          text='Add Medication' />

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
    flex: 1,
    alignSelf: 'stretch',
    minHeight: 32
  },
  otherCol: {
    borderWidth: 1
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
  },
  buttonContainer: {
    width: 150,
    height: 40,
  },
});
