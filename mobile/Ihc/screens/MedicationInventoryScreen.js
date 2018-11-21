import React, { Component } from 'react';
import {
  Platform,
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

  convertMedicationsToRows(medications) {
    const columnOrder = ['drugName', 'quantity', 'dosage', 'units', 'comments'];

    // TODO: sort medications alphabetically and by category
    // Sort medications by quantity for now
    medications.sort( (medication1, medication2) => medication1.quantity - medication2.quantity );

    const toReturn = medications.map((obj) => columnOrder.map( (key) => obj[key] ));
    return toReturn;
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
    const medicationRows = this.convertMedicationsToRows(medications);
    this.setState({ rows: medications });

    // Attempt server download and reload information if successful
    downloadMedications()
      .then((failedMedicationKeys) => {
        if (this.props.loading) {
          if (failedMedicationKeys.length > 0) {
            throw new Error(`${failedMedicationKeys.length} medications didn't properly sync.`);
          }

          const medications = localData.getAllMedications();
          const medicationRows = this.convertMedicationsToRows(medications);
          this.setState({ rows: medications });

          this.props.setLoading(false);
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
      localData.updateMedication(null, newMedication);
    } catch(e) {
      this.props.setErrorMessage(e.message);
      return;
    }
    this.props.setLoading(true);
    this.props.isUploading(true);
    this.syncAndLoadMedications();
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
          //TODO: localData.markMedicationNeedToUpload(key);

          this.props.setLoading(false, true);
          this.props.setErrorMessage(err.message);
        }
      });
  }

  updateMedication = (oldKey, newMedication) => {
    try {
      localData.updateMedication(oldKey, newMedication);
    } catch(e) {
      this.props.setErrorMessage(e.message);
      return;
    }
    this.props.setLoading(true);
    this.props.isUploading(true);

    serverData.updateMedication(oldKey, newMedication)
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
          localData.markMedicationNeedToUpload(oldKey);

          this.props.setLoading(false, true);
          this.props.setErrorMessage(err.message);
        }
      });
  }

  upload = () => {
    this.props.setLoading(true);
    this.props.isUploading(true);
    this.props.clearMessages();

    const medications = localData.getMedicationsToUpload();
    serverData.updateMedications(medications)
      .then(() => {
        if(this.props.loading) {
          localData.markMedicationsUploaded();
          this.props.setLoading(false);
          this.props.setSuccessMessage(`Uploaded successfully: [medications]`);
        }
      })
      .catch(err => {
        if(this.props.loading) {
          this.props.setLoading(false);
          this.props.setErrorMessage(err.message);
        }
      });
  }

  download = () => {
    this.props.setLoading(true);
    this.props.isUploading(false);
    this.props.clearMessages();

    downloadMedications()
      .then((failedMedicationKeys) => {
        if(this.props.loading) {
          if(failedMedicationKeys.length > 0) {
            throw new Error(`${failedMedicationKeys.length} medications failed to download. Try again`);
          }

          this.props.setLoading(false);
          this.props.setSuccessMessage(`Downloaded successfully: [medications]`);
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
          />
        </ScrollView>

        <View style={styles.footer}>
          <Button onPress={this.upload}
            text="upload"
            style={styles.button}
          />
          <Button onPress={this.download}
            text="download"
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
});

const mapDispatchToProps = dispatch => ({
  setLoading: (val,showRetryButton) => dispatch(setLoading(val, showRetryButton)),
  setErrorMessage: val => dispatch(setErrorMessage(val)),
  setSuccessMessage: val => dispatch(setSuccessMessage(val)),
  clearMessages: () => dispatch(clearMessages()),
  isUploading: val => dispatch(isUploading(val))
});

export default connect(mapStateToProps, mapDispatchToProps)(MedicationInventoryScreen);
