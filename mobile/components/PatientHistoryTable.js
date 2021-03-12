import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import {shortDate, formatDate} from '../util/Date';
import Button from './Button';

export default class PatientHistoryTable extends Component<{}> {
  /*
   * Expects in props:
   *  {
   *    rows: [{strDate, soap, triage}],
   *    name: string,
   *    goToSoap: function,
   *    goToTriage: function
   *  }
   */

  constructor(props) {
    super(props);
    this.rowNum = 0;
  }

  renderCol = (data, key, index, keyFn) => {
    if (index === 0) { // date
      return (
        <Col style={styles.col} key={keyFn(index)}>
          <Text key={index} style={styles.dateContainer}>{formatDate(new Date(shortDate(data[key])))}</Text>
        </Col>
      );
    }
    else if (index === 1) { // soap
      if (data[key] !== null) { // NOTE: must define for both cases because of error when accessing date from a null object
        return (
          <Col style={styles.col} key={keyFn(index)}>
            <Button key={index}
              onPress={() => this.props.goToSoap(data[key].date)}
              style={styles.button}
              text='SOAP'/>
          </Col>
        );
      }
      else {
        return (
          <Col style={styles.col} key={keyFn(index)}>
            <Button key={index}
              disabled={true}
              style={styles.button}
              text='SOAP'/>
          </Col>
        );
      }
    }
    else if (index === 2) { // triage
      if (data[key] !== null) {
        return (
          <Col style={styles.col} key={keyFn(index)}>
            <Button key={index}
              onPress={() => this.props.goToTriage(data[key].date)}
              style={styles.button}
              text='Triage'/>
          </Col>
        );
      }
      else {
        return (
          <Col style={styles.col} key={keyFn(index)}>
            <Button key={index}
              disabled={true}
              style={styles.button}
              text='Triage'/>
          </Col>
        );
      }
    } else {
      return null;
    }
  }

  renderRow = (row, keyFn) => {
    let cols = Object.keys(row).map( (key, index) => {
      return this.renderCol(row, key, index, keyFn);
    });

    return (
      <Row key={`row${this.rowNum++}`} style={styles.rowContainer}>
        {cols}
      </Row>
    );
  }

  render() {
    return (
      <View style={styles.gridContainer}>
        <Grid>
          {this.props.rows.map( row => this.renderRow(row, (i) => `row${i}`) )}
        </Grid>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  gridContainer: {
    flex: 10,
    flexDirection: 'row',
    maxWidth: '50%',
    alignItems: 'center',
    margin: 4,
  },
  rowContainer: {
    flex: 1,
    alignSelf: 'stretch',
    minHeight: 32
  },
  col: {
    alignItems: 'center',
  },
  dateContainer: {
    width: 150,
    height: 40,
    margin: 4,
    padding: 8,
    elevation: 4,
    textAlign: 'center',
  },
  button: {
    width: 200,
  }
});
