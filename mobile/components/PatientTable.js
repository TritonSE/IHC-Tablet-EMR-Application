import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import {shortDate} from '../util/Date';
import UpdateStatusNotesModal from './UpdateStatusNotesModal';
import Button from './Button';

export default class PatientTable extends Component<{}> {
  /*
   * Expects in props:
   *  {
   *    rows: [[data]],
   *    goToPatient: function
   *    saveModal: function
   *  }
   */
  constructor(props) {
    super(props);
    this.tableHeaders = ['Name', 'Birthday', 'Checkin', 'Triage', 'SOAP',
      'Pharmacy', 'Doctor', 'Notes'];
    this.rowNum = 0;
    // patientKey is the key of the patient we are editing the notes for in the Modal
    // currNotes is the notes to display in the modal
    // name is the name of the patient
    this.state = {showModal: false, patientKey: null, currNotes: null, name: null};
  }

  getStyle(index) {
    switch(index) {
      case 1:
        return styles.birthdayCol;
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
        return styles.timestampCol;
      case 7:
        return styles.notesCol;
      default:
        return styles.otherCol;
    }
  }

  getText(index, element) {
    switch(index) {
      case 1: // birthday
        return shortDate(element);
      case 2: // checkin time
      case 3: // triage time
      case 4: // SOAP time
      case 5: // pharmacy time
      case 6: // doctor time
        // No time provided
        if(!element) {
          return '';
        }
        const time = new Date(element);
        // TODO: update checkintime format
        return `${time.getHours()}:${time.getMinutes()}`;
      default:
        return element;
    }
  }

  getSize(index) {
    switch(index) {
      case 1: // birthday
        return 1.5;
      case 2: // checkin time
      case 3: // triage time
      case 4: // SOAP time
      case 5: // pharmacy time
      case 6: // doctor time
        return 1;
      case 7: // notes
        return 3;
      default:
        return 2;
    }
  }

  // Modal to update the Notes field of Status object
  openModal = (name, patientKey, currNotes) => {
    this.setState({showModal: true, patientKey: patientKey, currNotes: currNotes, name: name});
  }

  closeModal = () => {
    this.setState({showModal: false, patientKey: null, currNotes: null, name: null});
  }

  updateNotes = (newNotes) => {
    this.setState({currNotes: newNotes});
  }

  renderCol = (element, index, keyFn, name, patientKey) => {
    if (index === 7) {
      return (
        <Col style={this.getStyle(index)} size={this.getSize(index)} key={keyFn(index)}>
          <Button style={styles.notes}
            onPress={() => this.openModal(name, patientKey, element)}
            textStyle={styles.notesText}
            text={element} />
        </Col>
      );
    }

    return (
      <Col style={this.getStyle(index)} size={this.getSize(index)} key={keyFn(index)}>
        <Text>{this.getText(index, element)}</Text>
      </Col>
    );
  }

  renderRow = (data, keyFn) => {
    // e is the current element
    let cols = data.map( (e,i) => {
      if(i === 8)
        return null; // Patient key col shouldn't render
      // Pass the patient key and name
      // to the render column fn to be passed to Update Modal
      return this.renderCol(e,i,keyFn, data[0], data[8]);
    });
    cols.splice(8,1); // remove patient key column

    return (
      <Row key={`row${this.rowNum++}`} style={styles.rowContainer}
        onPress={() => this.props.goToPatient(data)}>
        {cols}
      </Row>
    );
  }

  renderHeader(data, keyFn) {
    const cols = data.map( (e,i) => (
      <Col size={this.getSize(i)} style={this.getStyle(i)} key={keyFn(i)}>
        <Text style={styles.text}>{e}</Text>
      </Col>
    ) );

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
        <UpdateStatusNotesModal
          showModal={this.state.showModal}
          closeModal={this.closeModal}
          saveModal={() => this.props.saveModal(this.state.patientKey, this.state.currNotes)}
          name={this.state.name}
          currNotes={this.state.currNotes}
          updateNotes={this.updateNotes}
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
    flex: 1,
    alignSelf: 'stretch',
    minHeight: 32
  },
  timestampCol: {
    maxWidth: 70,
    borderWidth: 1
  },
  notesCol: {
    borderWidth: 1,
  },
  birthdayCol: {
    borderWidth: 1,
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
  notes: {
    height: '100%',
    width: '100%',
    backgroundColor: '#bebebe',
    borderRadius: 0,
    margin: 0
  },
  notesText: {
    fontWeight: 'normal',
    color: '#111'
  },
});
