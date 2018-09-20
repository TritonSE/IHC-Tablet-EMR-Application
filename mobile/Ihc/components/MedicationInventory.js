/*import React, { Component } from 'react';
import {
  CheckBox,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import {stringDate} from '../util/Date';
import MedicationCheckmarks from '../models/MedicationCheckmarks';
import {localData} from '../services/DataService';
import Button from './Button';

export default class MedicationInventory extends Component<{}> {
  /*
   * Expects in props:
   *  {
   *    [drugName: string,
   *    dosage: int,
   *    units: string,
   *    quantity: int,
   *    expirationDate: int,
   *    comments: string]
   *    edit function
   *  }
  constructor(props) {
    super(props);
    this.state = {
      drugNames: new Set(),
      dateToUpdates: {}
    };
  }

  componentWillReceiveProps(nextProps) {
    this.processUpdates(nextProps.updates);
  }

  componentDidMount() {
    this.processUpdates(this.props.updates);
  }

  processUpdates(updates) {
    const dateToUpdates = {};
    const drugNames = new Set();

    updates.forEach( (update) => {
      if(update.date in dateToUpdates) {
        dateToUpdates[update.date].push(update);
      } else{
        dateToUpdates[update.date] = [update];
      }

      drugNames.add(update.name);
    });

    this.setState({
      dateToUpdates: dateToUpdates,
      drugNames: drugNames,
    });
  }

  // Returns the update with that name, or null if not found
  // updates: Array of update objects
  // name: string of drug name
  updateWithName(updates, name) {
    if(!updates)
      return null;
    return updates.find( (update) => {
      return update.name === name;
    });
  }

  renderRow(updates, name, columnIndex, rowIndex) {
    let update = this.updateWithName(updates, name);
    if(!update) {
      update = {
        dose: '',
        frequency: '',
        duration: '',
        notes: ''
      };
    }



    return (
      <Row style={styles.row} key={`col${columnIndex}row${rowIndex}`}>
        <Col style={styles.smallCol}><Text style={styles.text}>{update.dose}</Text></Col>
        <Col style={styles.smallCol}><Text style={styles.text}>{update.frequency}</Text></Col>
        <Col style={styles.smallCol}><Text style={styles.text}>{update.duration}</Text></Col>
        <Col style={styles.notesCol}><Text style={styles.text}>{update.notes}</Text></Col>
      </Row>
    );
  }

  // Row order should follow names array
  renderColumn(date, updates, names, i) {
    // Empty column
    if (!updates) {
      return (
        <Col style={styles.fullCol} key={'emptycol'}>
          <Row style={styles.headerRow}><Text>{this.state.todayDate}</Text></Row>
          <Row style={styles.row}><Text>No medications for today</Text></Row>
        </Col>
      );
    }

    const rows = names.map( (name, rowIndex) => {
      return this.renderRow(updates, name, i, rowIndex);
    });

    return (
      <Col style={styles.fullCol} key={`col${i}`}>
        <Row style={styles.headerRow}><Text>{date}</Text></Row>
        {rows}  
      </Col>
    );
  }

  /*
   * Take in updates, drug names, and ordered dates
   */
  /* eslint-disable react-native/no-inline-styles
  renderButtonColumn(dateToUpdates, names, dates) {
    const rows = names.map( (name, i) => {
      // A drug update with today's date
      const todayUpdate = this.updateWithName(dateToUpdates[stringDate(new Date())], name);

      // Find the previous update to be passed in to change/refill if an update
      // for today doesn't exist
      let prevUpdate = null;
      if(!todayUpdate) {
        let i = 0;
        while(!prevUpdate) {
          prevUpdate = this.updateWithName(dateToUpdates[dates[i]], name);
          i++;
        }
        if(!prevUpdate) {
          throw new Error(`Shouldve found an update for drug ${name}`);
        }
      }

      // Disable refill button if an update already exists for today
      const disableRefill = Boolean(todayUpdate);
      // Only give option to discontinue if there isnt an update for today, but
      // there is an update for previous date
      const disableDiscontinue = Boolean(todayUpdate || !prevUpdate);

      return (
        <Row style={styles.row} key={`buttonRow${i}`}>
          <Button
            style={[styles.button, disableRefill && {opacity: 0.5}]}
            onPress={() => this.props.refill(prevUpdate)}
            disabled={disableRefill}
            text='R' />

          <Button
            style={styles.button}
            onPress={() => this.props.change(todayUpdate || prevUpdate)}
            text='D' />

          <Button
            style={[styles.button, disableDiscontinue && {opacity: 0.5}]}
            onPress={() => this.props.discontinue(prevUpdate)}
            disabled={disableDiscontinue}
            text='X' />
        </Row>
      );
    });

    return (
      <Col style={styles.actionColumn}>
        <Row style={styles.headerRow}><Text>Actions</Text></Row>
        {rows}
      </Col>
    );
  }
  /* eslint-enablereact-native/no-inline-styles

  // option 0: Taking, 1: Not taking, 2: Incorrectly
  checked = (drugName, option) => {
    let curr = this.props.medicationCheckmarks.find( instance => {
      return instance.drugName === drugName;
    });

    let newObject = false; //true if created a new checkmarks obj
    if(!curr) {
      curr = MedicationCheckmarks.newMedicationCheckmarks(this.props.patientKey, drugName);
      newObject = true;
    }

    // Write directly to realm
    localData.write(() => {
      switch(option) {
        case 0:
          curr.taking = !curr.taking;
          break;
        case 1:
          curr.notTaking = !curr.notTaking;
          break;
        case 2:
          curr.incorrectly = !curr.incorrectly;
          break;
        default:
          throw new Error('Incorrect option passed to checked() in MedicationTable');
      }

      if(newObject){
        this.props.medicationCheckmarks.push(curr);
      }
    });
  }


  render() {
    if (!this.state.drugNames.size || !Object.keys(this.state.dateToUpdates).length) {
      return (
        <View style={styles.container}>
          <Text style={styles.emptyText}>No data to show</Text>
        </View>
      );
    }

    const names = Array.from(this.state.drugNames).sort();
    const nameColumn = names.map( (name,i) => {
      return (
        <Row style={styles.row} key={`name${i}`}><Text>{name}</Text></Row>
      );
    });

    const dates = Object.keys(this.state.dateToUpdates).sort().reverse();
    // Insert empty column for todays date if it doesn't exist
    // Empty column should be less confusing for pharmacists
    // i.e. they can just refill the leftmost medications without having to
    // check the date
    if (dates[0] !== this.state.todayDate) {
      dates.splice(0, 0, this.state.todayDate); 
    }

    const updateColumns = dates.map( (date, i) => {
      return this.renderColumn(date, this.state.dateToUpdates[date], names, i);
    });

    const buttonColumn = this.renderButtonColumn(this.state.dateToUpdates, names, dates);
    const checkmarkColumn = this.renderCheckmarkColumn(names);

    // Render row for header, then render all the rows
    return (
      <Grid>
        <Col style={styles.actionColumn}>
          <Row style={styles.headerRow}><Text>T/N/I</Text></Row>
          {checkmarkColumn}
        </Col>
        <Col style={styles.actionColumn}>
          <Row style={styles.headerRow}><Text>Drug name</Text></Row>
          {nameColumn}
        </Col>
        {buttonColumn}
        {updateColumns}
      </Grid>
    );
  }
}

/*
 * Files that create a renderRow() function should use these styles for
 * consistency
 
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    textAlign: 'center',
  },
  headerRow: {
    maxHeight: 20,
    backgroundColor: '#dbdbdb',
    borderWidth: 1
  },
  row: {
    height: 60,
    backgroundColor: '#dddddd',
    borderWidth: 1
  },
  notesCol: {
    minWidth: 150,
    backgroundColor: '#adadad',
    borderWidth: 1
  },
  smallCol: {
    minWidth: 60,
    maxWidth: 60,
    backgroundColor: '#adadad',
    borderWidth: 1
  },
  fullCol: {
    minWidth: 250,
    backgroundColor: '#adadad',
    borderWidth: 1
  },
  actionColumn: {
    width: 100,
    backgroundColor: '#adada0',
    borderWidth: 1
  },
  text: {
    textAlign: 'center',
  },
  button: {
    flex: 1
  }
});*/

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

export default class MedicationInventory extends Component<{}> {
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
    this.tableHeaders = ['Name', 'Birthday', 'Checkin', 'Triage', 'Doctor',
      'Pharmacy', 'Notes'];
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
        return styles.timestampCol;
      case 6:
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
      case 4: // doctor time
      case 5: // pharmacy time
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
      case 4: // doctor time
      case 5: // pharmacy time
        return 1;
      case 6: // notes
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
    if (index === 6) {
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
      if(i === 7)
        return null; // Patient key col shouldn't render
      // Pass the patient key and name
      // to the render column fn to be passed to Update Modal
      return this.renderCol(e,i,keyFn, data[0], data[7]);
    });
    cols.splice(7,1); // remove patient key column

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
    maxWidth: 60,
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
