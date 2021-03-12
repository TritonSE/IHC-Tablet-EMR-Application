import React, { Component } from 'react';
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

export default class MedicationTable extends Component<{}> {
  /*
   * Expects in props:
   *  {
   *    refill, change, discontinue functions
   *    updates: [DrugUpdate obj, ...]
   *    medicationCheckmarks: MedicationCheckmarks as returned from realm
   *      i.e. {'0': MedicationCheckmarks obj, '1': another }
   *      so that we can edit checkmarks directly
   *    patientKey
   *  }
   */
  constructor(props) {
    super(props);
    this.state = {
      todayDate: stringDate(new Date()),
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
  /* eslint-disable react-native/no-inline-styles */
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
  /* eslint-enablereact-native/no-inline-styles */

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

  renderCheckmarkColumn(drugNames) {
    const medicationCheckmarks = Array.from(this.props.medicationCheckmarks);
    const rows = drugNames.map( (drugName, i) => {
      // Get the checkmarks for that drug
      let checkmarks = medicationCheckmarks.find( instance => {
        return instance.drugName === drugName;
      });

      // If doesn't exist, create blank check boxes
      if(!checkmarks) {
        checkmarks = {taking: false, notTaking: false, incorrectly: false};
      }

      return (
        <Row style={styles.row} key={`checkmarkRow${i}`}>
          <CheckBox value={checkmarks.taking} onValueChange={() => this.checked(drugName, 0)}/>
          <CheckBox value={checkmarks.notTaking} onValueChange={() => this.checked(drugName, 1)}/>
          <CheckBox value={checkmarks.incorrectly} onValueChange={() => this.checked(drugName, 2)}/>
        </Row>
      );
    });

    return rows;
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
 */
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
});
