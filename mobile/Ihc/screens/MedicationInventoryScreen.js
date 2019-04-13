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
import Button from '../components/Button';
import Medication from '../models/Medication';
import {stringDate} from '../util/Date';
import {downloadMedications} from '../util/Sync';

class MedicationInventoryScreen extends Component<{}> {
  /*
   * Redux props:
	 * loading: boolean
   *
   * Props:
   * todayDate (optional, if doesn't exist, then assume date is for today,
   *   can be used for gathering old traige data from history)
   */
  constructor(props) {
    super(props);
    const todayDate = this.props.todayDate || stringDate(new Date());
    const tempMedication = Medication.getInstance();
    this.state = {
      todayDate: todayDate,
      rows: [],
      rowsTemp: [tempMedication]
    };

    this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
  }

  // Reload table after new medication updates
  // Replaces componentDidMount() because this will be called around the same
  // time
  onNavigatorEvent(event) {
    if (event.id === 'willAppear') {
      this.syncAndLoadMedications();
    }
  }

  // Sync up tablet with server
  syncAndLoadMedications = () => {
    this.props.setLoading(true);
    this.props.isUploading(false);
    this.props.clearMessages();

    // Load existing Medication info if it exists
    const medications = localData.getAllMedications();
    this.setState({ rows: medications });

    // Attempt server download and reload information if successful
    downloadMedications()
      .then((failedMedicationKeys) => {
        if (this.props.loading) {
          if (failedMedicationKeys.length > 0) {
            throw new Error(`${failedMedicationKeys.length} medications didn't properly sync.`);
          }

          const medications = localData.getAllMedications();
          this.setState({ rows: medications });

          this.props.setLoading(false);
          this.props.setSuccessMessage('Synced successfully');
        }
      })
      .catch( (err) => {
        if (this.props.loading) {
          this.props.setErrorMessage(err.message);
          this.props.setLoading(false);
        }
      });
  }

  createMedication = (newMedication) => {
    try {
      localData.createMedication(newMedication);
    } catch(e) {
      this.props.setErrorMessage(e.message);
      return;
    }
    this.props.setLoading(true);
    this.props.isUploading(true);

    serverData.createMedication(newMedication)
      .then( () => {
        if(this.props.loading) {
          // if successful, then reload screen (which closes modal too)
          this.syncAndLoadMedications();

          this.props.setLoading(false);
          this.props.setSuccessMessage('Saved successfully');
        }
      })
      .catch( (err) => {
        if(this.props.loading) {
          //localData.markMedicationNeedToUpload(key);

          this.props.setLoading(false, true);
          this.props.setErrorMessage(err.message);
        }
      });
  }

  updateMedication = (key, newMedication) => {
    try {
      localData.updateMedication(key, newMedication);
    } catch(e) {
      this.props.setErrorMessage(e.message);
      return;
    }
    this.props.setLoading(true);
    this.props.isUploading(true);

    serverData.updateMedication(key, newMedication)
      .then( () => {
        if(this.props.loading) {
          // if successful, then reload screen (which closes modal too)
          this.syncAndLoadMedications();

          this.props.setLoading(false);
          this.props.setSuccessMessage('Saved successfully');
        }
      })
      .catch( (err) => {
        if(this.props.loading) {
          localData.markMedicationNeedToUpload(key);

          this.props.setLoading(false, true);
          this.props.setErrorMessage(err.message);
        }
      });
  }

  deleteMedication = (key) => {
    try {
      localData.deleteMedication(key);
    } catch(e) {
      this.props.setErrorMessage(e.message);
      return;
    }
    this.props.setLoading(true);
    this.props.isUploading(true);

    serverData.deleteMedication(key)
      .then( () => {
        if(this.props.loading) {
          // if successful, then reload screen (which closes modal too)
          this.syncAndLoadMedications();
          this.props.setLoading(false);
          this.props.setSuccessMessage('Saved successfully');
        }
      })
      .catch( (err) => {
        if(this.props.loading) {
          //localData.markMedicationNeedToUpload(key);

          this.props.setLoading(false, true);
          this.props.setErrorMessage(err.message);
        }
      });
  }

  sync = () => {
    this.props.setLoading(true);
    this.props.isUploading(true);
    this.props.clearMessages();

    const medications = localData.getMedicationsToUpload();
    serverData.updateMedications(medications)
      .then(() => {
        if(this.props.loading) {
          localData.markMedicationsUploaded();
          this.syncAndLoadMedications();
        }
      })
      .catch(err => {
        if(this.props.loading) {
          this.props.setLoading(false);
          this.props.setErrorMessage(err.message);
        }
      });
  }

  render() {
    //TODO update rows
    return (
      <Container>

        <View style={styles.header}>
          <Text style={styles.title}>Medication Inventory</Text>
        </View>

        <ScrollView contentContainerStyle={styles.tableContainer} horizontal>
          <MedicationInventory
            rows={this.state.rows}
            createMedication={this.createMedication}
            updateMedication={this.updateMedication}
            deleteMedication={this.deleteMedication}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button onPress={this.sync}
            text="sync"
            style={styles.button}
          />
        </View>

      </Container>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 0,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  },
  tableContainer: {
    width: '100%',
  },
  button: {
    width: 140,
  }
});

// Redux
import { setLoading, setErrorMessage, setSuccessMessage, clearMessages, isUploading } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapStateToProps = state => ({
  loading: state.loading,
  messages: state.messages,
});

const mapDispatchToProps = dispatch => ({
  setLoading: (val,showRetryButton) => dispatch(setLoading(val, showRetryButton)),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
  setSuccessMessage: val => dispatch(setSuccessMessage(val)),
  clearMessages: () => dispatch(clearMessages()),
  isUploading: val => dispatch(isUploading(val))
});

export default connect(mapStateToProps, mapDispatchToProps)(MedicationInventoryScreen);
