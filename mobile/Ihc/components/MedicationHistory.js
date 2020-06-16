import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList
} from 'react-native';
import {localData, serverData} from '../services/DataService';

export default class MedicationHistory extends Component {
  render() {
    let medicationRequests = localData.getPatientMedicationRequests(this.props.patientKey);
    let patient = localData.getPatient(this.props.patientKey);

    console.log("requests", medicationRequests);
    return(
      <View>
        <Text style={styles.subtitle}>
          Medication Request History
        </Text>
        <FlatList
          data= {medicationRequests}
          extraData={this.props}
          renderItem={({item}) => 
            <View>
              <Text>
                {(""+item.medicationRequested + " Requested on:" + item.dateRequested)}
              </Text>
            </View>
          }
        />
        <View style={{height:30}}/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 20,
    textAlign: 'left',
    margin: 2,
    color:'#0055FF'
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  }
});
