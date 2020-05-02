import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Button,
  FlatList,
  View
} from 'react-native';
import Container from '../components/Container';
import Patient from '../models/Patient';
import {localData, serverData} from '../services/DataService';

class MedicationFilloutScreen extends Component {
  constructor(props) {
    super(props);
  }

  markCompleted = () => {
    localData.markMedicationRequestComplete(this.props.requestKey);
  }

  render() {
    const medication = localData.getMedicationRequest(this.props.requestKey);
    const patient = localData.getPatient(medication.patientKey);
    return (
      <Container>
        <View>
          <Text style={styles.title}>
            {Patient.fullName(patient)}
          </Text>
          <FlatList
            data= {medication ? medication.medicationRequested : []}
            extraData={this.props}
            renderItem={({item}) => <Text style={styles.item}>{item}</Text>}
          />
          <Button onPress={this.markCompleted} title={"Mark Completed"}/>
        </View>
      </Container>
    );
  }
}

export const styles = StyleSheet.create({
  search: {
    marginTop: '3%',
    marginBottom: '2%',
    width: '60%',
    marginLeft: "2%",
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  button: {
    borderColor: 'white',
    borderWidth: 2.0,
    borderRadius: 10,
    justifyContent: 'center',
    backgroundColor: '#00ac3d',
  }
});

// Redux
import { setLoading, clearMessages, setErrorMessage } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  loading: state.loading
});

const mapDispatchToProps = dispatch => ({
  setLoading: (val) => dispatch(setLoading(val)),
  clearMessages: () => dispatch(clearMessages()),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MedicationFilloutScreen);


