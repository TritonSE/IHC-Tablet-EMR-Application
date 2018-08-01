import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {localData, serverData} from '../services/DataService';
import MedicationInventory  from '../components/MedicationInventory';
import Container from '../components/Container';
import {stringDate} from '../util/Date';
import Button from '../components/Button';
import {downstreamSyncWithServer} from '../util/Sync';

export default class MedicationInventoryScreen extends Component<{}> {
  /*
   * Props:
   * name: patient's name for convenience
   * patientKey: string of patient's key
   */
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      showRetryButton: false,
      updates: [],
      errorMsg: null,
      successMsg: null,
      medicationCheckmarks: [],
      todayDate: stringDate(new Date()),
      upstreamSyncing: false, // Should be set before server calls to declare what kind of syncing
    };
    
    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

/*
  // Reload table after new medication updates
  // Replaces componentDidMount() because this will be called around the same
  // time
  onNavigatorEvent(event) {
    if (event.id === 'willAppear') {
      this.syncAndLoadMedications();
    }
  }

  syncAndLoadMedications = () => {
    this.setState({ loading: true, upstreamSyncing: false, errorMsg: null, successMsg: null });

    // Load local data in beginning to display even if sync doesn't work
    let updates = localData.getMedicationUpdates(this.props.patientKey);
    let statusObj = localData.getStatus(this.props.patientKey, this.state.todayDate);
    const checkmarks = statusObj.medicationCheckmarks;
    this.setState({
      updates: updates,
      medicationCheckmarks: checkmarks,
    });

    downstreamSyncWithServer()
      .then((failedPatientKeys) => {
        if(failedPatientKeys.length > 0) {
          throw new Error(`${failedPatientKeys.length} patients didn't properly sync.`);
        }

        let updates = localData.getMedicationUpdates(this.props.patientKey);
        let statusObj = localData.getStatus(this.props.patientKey, this.state.todayDate);
        const checkmarks = statusObj.medicationCheckmarks;
        this.setState({
          updates: updates,
          medicationCheckmarks: checkmarks,
          loading: false
        });
      })
      .catch(err => {
        this.setState({loading: false, errorMsg: err.message});
      });
  }

  //change this for popup
  createNewMedication = () => {
    this.props.navigator.push({
      screen: 'Ihc.MedicatioInventoryUpdateScreen',
      title: 'Medication',
      passProps: {
        action: 'new',
        patientKey: this.props.patientKey,
        name: this.props.name
      }
    });
  }
*/
  render() {
    return (
      <Container>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Medication Inventory</Text>
        </View>

        <ScrollView contentContainerStyle={styles.tableContainer} horizontal>
          <MedicationInventory style={styles.table}
          />
        </ScrollView>

        <View style={styles.footerContainer}>


        </View>
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  tableContainer: {
    flex: 0,
  },
  footerContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 40,
    margin: 4,
  },
  button: {
    width: 120,
    height: 60 
  }
});

