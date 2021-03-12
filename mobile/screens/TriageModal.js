import React, { Component } from 'react';
import {
    StyleSheet,
    ScrollView,
    Text,
    View,
    Modal,
    Alert,
    AppRegistry,
    TextInput,
    Switch
} from 'react-native';
import { Col, Grid } from 'react-native-easy-grid';
import Container from './Container';
import Button from './Button';

class TriageModal extends Component < {} > {
    /*
     * Expects:
     *  {
     *    name: string, patient's name (for convenience)
     *    patientKey: string
     *    todayDateString: optional, (new Date().toDateString()), helpful for
     *    tests
     *  }
     */
    constructor(props) {
        super(props);
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.state = {
            text: 'Useless Placeholder',
            firstname: 'First Name',
            middlename: 'Middle Name',
            motherlastname: 'Mother\'s Last Name',
            fatherlastname: 'Father\'s Last Name',
            bdaymonth: 'Month',
            bdaydate: 'Day',
            bdayyear: 'Year',
            femaleswitch: false,
            menstruation: 'Last Menstrual Period',
            pregancy: 'Pregnancies (#)',
            abortion: 'Abortions (#)',
            livebirths: 'Live Births (#)',
            miscarriages: 'Miscarriages (#)',
            height: 'Height',
            heightswitch: false,
            weight: 'Weight',
            weightswitch: false,
            respirationrate: 'Respiration Rate',
            temp: 'Temperature',
            tempswitch: false,
            oxygenlevel: 'Oxygen Level',
            bloodpressure: 'Blood Pressure',
            heartrate: 'Heart Rate',
            bmi: 'BMI',
            allergies: 'Allergies',
            medications: 'Current Medications',
            surgeries: 'Past Surgeries',
            immunizations: 'Immunizations',
            chiefcomplaint: 'Enter Chief Complaint',
            hb: 'Hb',
            hba1c: 'HbA1c',
            bloodglucose: 'Blood Glucose Level',
            fasting: false,
            pregnant: false,
            leukocytes: 'Leukocytes',
            nitrites: 'Nitrites',
            urobilirubin: 'Uro-Bilirubin',
            glucoselevel: 'Glucose Level',
            protein: 'Protein',
            phlevel: 'pH Level',
            blood: 'Blood',
            specificgravity: 'Specific Gravity',
            ketone: 'Ketone',
            bilirubin: 'Bilirubin',
            unitswitch: false,
        };
    }

    state = {
        modalVisible: false,
    };

    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }

    sexSwitch = (value) => {
        //onValueChange of the switch this function will be called
        this.setState({ femaleswitch: value })
            //state changes according to switch
            //which will result in re-render the text
    }

    heightSwitch = (value) => {
        this.setState({ heightswitch: value })
    }

    weightSwitch = (value) => {
        this.setState({ weightswitch: value })
    }

    unitSwitch = (value) => {
        this.setState({ unitswitch: value })
    }

    tempSwitch = (value) => {
        this.setState({ tempswitch: value })
    }

    fastingSwitch = (value) => {
        this.setState({ fasting: value })
    }

    pregnantSwitch = (value) => {
        this.setState({ pregnant: value })
    }

    goToTriage = () => {
        this.props.navigator.push({
            screen: 'Ihc.TriageScreen',
            title: 'Back to patient',
            passProps: { name: this.props.name }
        });
    }

    goToSoap = () => {
        this.props.navigator.push({
            screen: 'Ihc.SoapScreen',
            title: 'Back to patient',
            passProps: { name: this.props.name }
        });
    }

    goToMedicationList = () => {
        this.props.navigator.push({
            screen: 'Ihc.MedicationScreen',
            title: 'Back to patient',
            passProps: { name: this.props.name }
        });
    }

    goToHistory = () => {
        this.props.navigator.push({
            screen: 'Ihc.PatientHistoryScreen',
            title: 'Back to patient',
            passProps: { name: this.props.name }
        });
    }

    goToGrowthChart = () => {
        // Growth chart takes time to load
        this.props.setLoading(true);
        this.props.navigator.push({
            screen: 'Ihc.GrowthChartScreen',
            title: 'Back to patient',
        });
    }

    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            this.props.clearMessages();
        }
    }

    render() {
        const date = new Date();
        //const dateString = `${date.getMonth()} ${date.getDate()}, ${date.getYear()}`;
        const dateString = this.props.todayDateString || date.toDateString();
        return
          ( <Container>

            <View style = {
                { marginTop: 22 } } >
            <Modal animationType = "slide"
            transparent = { false }
            visible = { this.state.modalVisible }
            onRequestClose = {
                () => {
                    Alert.alert('Modal has been closed.');
                }
            } >
            <ScrollView style = {
                { marginTop: 22 } } >
            <View style = { styles.triagescreen } >
            <Text style = { styles.title } >
              New Triage Form: { dateString }
            </Text>
            <Text style = { styles.title }>
              Patient Information
            </Text>

            <View style = { styles.triagesection } >
            <Text style = { styles.subtitle }>
              Name
            </Text>
            <View style = { styles.inputsection } >
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (firstname) => this.setState({ firstname }) }
            value = { this.state.firstname }
            />
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (middlename) => this.setState({ middlename }) }
            value = { this.state.middlename }
            />
            </View>
            <View style = { styles.inputsection } >

            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (motherlastname) => this.setState({ motherlastname }) }
            value = { this.state.motherlastname }
            />
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (fatherlastname) => this.setState({ fatherlastname }) }
            value = { this.state.fatherlastname }
            />
            </View>
            </View>

            <View style = { styles.triagesection } >
            <Text style = { styles.subtitle } >
              Birthday
            </Text>
            <View style = {
                {
                    alignItems: 'flex-start',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    padding: 10,
                    start: 100,
                }
            } >
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (bdaymonth) => this.setState({ bdaymonth }) }
            value = { this.state.bdaymonth }
            />
            <TextInput style = { styles.input, { width: 70 } }
            onChangeText = {
                (bdaydate) => this.setState({ bdaydate }) }
            value = { this.state.bdaydate }
            />
            <TextInput style = { styles.input, { width: 100 } }
            onChangeText = {
                (bdayyear) => this.setState({ bdayyear }) }
            value = { this.state.bdayyear }
            />
            </View>
            </View>

            <View style = { styles.triagesection } >
            <Text style = { styles.subtitle } >
              Sex
            </Text>
            <View style = { styles.inputsection } >
            <Text style = { styles.input, { width: 300 } } >
              { this.state.femaleswitch ? 'Female' : 'Male' }
            </Text>
            <Switch style = { styles.switch }
            onValueChange = { this.sexSwitch }
            value = { this.state.femaleswitch }
            />
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (menstruation) => this.setState({ menstruation }) }
            value = { this.state.menstruation }
            />
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (pregancy) => this.setState({ pregancy }) }
            value = { this.state.pregancy }
            />
            </View>
            <View style = { styles.inputsection } >
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (livebirths) => this.setState({ livebirths }) }
            value = { this.state.livebirths }
            />
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (abortion) => this.setState({ abortion }) }
            value = { this.state.abortion }
            />
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (miscarriages) => this.setState({ miscarriages }) }
            value = { this.state.miscarriages }
            />
            </View>
            </View>

            <View style = { styles.triagesection } >
            <Text style = { styles.subtitle } >
              Vitals
            </Text>
            <View style = { styles.inputsection } >
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (height) => this.setState({ height }) }
            value = { this.state.height }
            />
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (weight) => this.setState({ weight }) }
            value = { this.state.weight }
            />
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (respirationrate) => this.setState({ respirationrate }) }
            value = { this.state.respirationrate }
            />
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (temp) => this.setState({ temp }) }
            value = { this.state.temp }
            />
            </View>
            <View style = { styles.inputunitsection } >
            <Text style = { styles.units } >
              { this.state.heightswitch ? 'cm' : 'in' }
            </Text>
            <Text style = { styles.units } >
              { this.state.weightswitch ? 'kg' : 'lb' }
            </Text>
            <Text style = { styles.units } >
              { this.state.unitswitch ? 'unit1' : 'unit2' }
            </Text>
            <Text style = { styles.units } >
              { this.state.tempswitch ? 'C' : 'F' }
            </Text>
            </View>
            <View style = { styles.inputsection, { marginLeft: 0 } } >
            <Switch style = { styles.switch }
            onValueChange = { this.heightSwitch }
            value = { this.state.heightswitch }
            />
            <Switch style = { styles.switch }
            onValueChange = { this.weightSwitch }
            value = { this.state.weightswitch }
            />
            <Switch style = { styles.switch }
            onValueChange = { this.unitSwitch }
            value = { this.state.unitswitch }
            />
            <Switch style = { styles.switch }
            onValueChange = { this.tempSwitch }
            value = { this.state.tempswitch }
            />
            </View>
            <View style = { styles.inputsection } >
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (oxygenlevel) => this.setState({ oxygenlevel }) }
            value = { this.state.oxygenlevel }
            />
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (bloodpressure) => this.setState({ bloodpressure }) }
            value = { this.state.bloodpressure }
            />
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (heartrate) => this.setState({ heartrate }) }
            value = { this.state.heartrate }
            />
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (bmi) => this.setState({ bmi }) }
            value = { this.state.bmi }
            />
            </View>
            <View style = { styles.inputunitsection } >
            <Text style = { styles.units } >
              { this.state.unitswitch ? 'unit1' : 'unit2' }
            </Text>
            <Text style = { styles.units } >
              { this.state.unitswitch ? 'unit1' : 'unit2' }
            </Text>
            <Text style = { styles.units } >
              { this.state.unitswitch ? 'unit1' : 'unit2' }
            </Text>
            <Text style = { styles.units } >
              { this.state.unitswitch ? 'unit1' : 'unit2' }
            </Text>
            </View>
            <View style = { styles.inputsection, { marginLeft: 0 } } >
            <Switch style = { styles.switch }
            onValueChange = { this.unitSwitch }
            value = { this.state.unitswitch }
            />
            <Switch style = { styles.switch }
            onValueChange = { this.unitSwitch }
            value = { this.state.unitswitch }
            />
            <Switch style = { styles.switch }
            onValueChange = { this.unitSwitch }
            value = { this.state.unitswitch }
            />
            <Switch style = { styles.switch }
            onValueChange = { this.unitSwitch }
            value = { this.state.unitswitch }
            />
            </View>

            </View>

            <View style = { styles.triagesection } >
            <Text style = { styles.subtitle } > History < /Text>
            <View style = { styles.inputsection } >
            <TextInput style = { styles.input, { width: 700 } }
            onChangeText = {
                (allergies) => this.setState({ allergies }) }
            value = { this.state.allergies }
            />
            <TextInput style = { styles.input, { width: 700 } }
            onChangeText = {
                (medications) => this.setState({ medications }) }
            value = { this.state.medications }
            />
            <TextInput style = { styles.input, { width: 700 } }
            onChangeText = {
                (surgeries) => this.setState({ surgeries }) }
            value = { this.state.surgeries }
            />
            <TextInput style = { styles.input, { width: 700 } }
            onChangeText = {
                (immunizations) => this.setState({ immunizations }) }
            value = { this.state.immunizations }
            />
            </View>
            </View>

            <View style = { styles.triagesection } >

            <Text style = { styles.subtitle } >
              Chief Complaint
            </Text>
            <View style = { styles.inputsection } >
            <TextInput style = { styles.input, { width: 700, start: -30 } }
            onChangeText = {
                (chiefcomplaint) => this.setState({ chiefcomplaint }) }
            value = { this.state.chiefcomplaint }
            />
            </View>
            </View>

            <View style = { styles.triagesection } >
            <Text style = { styles.subtitle } >
              Labs
            </Text>
            <View style = { styles.inputsection } >
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (hb) => this.setState({ hb }) }
            value = { this.state.hb }
            />
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (hba1c) => this.setState({ hba1c }) }
            value = { this.state.hba1c }
            />
            <TextInput style = { styles.input, { width: 300 } }
            onChangeText = {
                (bloodglucose) => this.setState({ bloodglucose }) }
            value = { this.state.bloodglucose }
            />
            </View>
            <View style = { styles.inputsection } >
            <Text >
              Fasting: { this.state.fasting ? 'yes' : 'no' }
            </Text>
            <Text >
              Pregnant: { this.state.pregnant ? 'yes' : 'no' }
            </Text>
            </View>
            <View style = { styles.inputsection } >
            <Switch style = { styles.switch }
            onValueChange = { this.fastingSwitch }
            value = { this.state.fasting }
            />
            <Switch style = { styles.switch }
            onValueChange = { this.pregnantSwitch }
            value = { this.state.pregnant }
            />
            </View>
            </View>

            <View style = { styles.triagesection } >
            <Text style = { styles.subtitle } >
              Urine Test
            </Text>
            <View style = { styles.inputsection } >
            <TextInput style = { styles.input, { width: 200 } }
            onChangeText = {
                (leukocytes) => this.setState({ leukocytes }) }
            value = { this.state.leukocytes }
            />
            <TextInput style = { styles.input, { width: 200 } }
            onChangeText = {
                (nitrites) => this.setState({ nitrites }) }
            value = { this.state.nitrites }
            />
            <TextInput style = { styles.input, { width: 200 } }
            onChangeText = {
                (urobilirubin) => this.setState({ urobilirubin }) }
            value = { this.state.urobilirubin }
            />
            </View>
            <View style = { styles.inputunitsection } >
            <Text style = { styles.units } >
              { this.state.unitswitch ? 'unit1' : 'unit2' }
            </Text>
            <Text style = { styles.units } >
              { this.state.unitswitch ? 'unit1' : 'unit2' }
            </Text>
            <Text style = { styles.units } >
              { this.state.unitswitch ? 'unit1' : 'unit2' }
            </Text>
            </View>
            <View style = { styles.inputsection, { marginLeft: 0 } } >
            <Switch style = { styles.switch }
            onValueChange = { this.unitSwitch }
            value = { this.state.unitswitch }
            />
            <Switch style = { styles.switch }
            onValueChange = { this.unitSwitch }
            value = { this.state.unitswitch }
            />
            <Switch style = { styles.switch }
            onValueChange = { this.unitSwitch }
            value = { this.state.unitswitch }
            />
            </View>
            <View style = { styles.inputsection } >
            <TextInput style = { styles.input, { width: 200 } }
            onChangeText = {
                (glucoselevel) => this.setState({ glucoselevel }) }
            value = { this.state.glucoselevel }
            />
            <TextInput style = { styles.input, { width: 200 } }
            onChangeText = {
                (protein) => this.setState({ protein }) }
            value = { this.state.protein }
            />
            <TextInput style = { styles.input, { width: 200 } }
            onChangeText = {
                (phlevel) => this.setState({ phlevel }) }
            value = { this.state.phlevel }
            />
            </View>
            <View style = { styles.inputunitsection } >
            <Text style = { styles.units } >
              { this.state.unitswitch ? 'unit1' : 'unit2' }
            </Text>
            <Text style = { styles.units } >
              { this.state.unitswitch ? 'unit1' : 'unit2' }
            </Text>
            <Text style = { styles.units } >
              { this.state.unitswitch ? 'unit1' : 'unit2' }
            </Text>
            </View>
            <View style = { styles.inputsection, { marginLeft: 0 } } >
            <Switch style = { styles.switch }
            onValueChange = { this.unitSwitch }
            value = { this.state.unitswitch }
            />
            <Switch style = { styles.switch }
            onValueChange = { this.unitSwitch }
            value = { this.state.unitswitch }
            />
            <Switch style = { styles.switch }
            onValueChange = { this.unitSwitch }
            value = { this.state.unitswitch }
            />
            </View>
            <View style = { styles.inputsection } >
            <TextInput style = { styles.input, { width: 200 } }
            onChangeText = {
                (blood) => this.setState({ blood }) }
            value = { this.state.blood }
            />
            <TextInput style = { styles.input, { width: 200 } }
            onChangeText = {
                (specificgravity) => this.setState({ specificgravity }) }
            value = { this.state.specificgravity }
            />
            <TextInput style = { styles.input, { width: 200 } }
            onChangeText = {
                (ketone) => this.setState({ ketone }) }
            value = { this.state.ketone }
            />
            <TextInput style = { styles.input, { width: 200 } }
            onChangeText = {
                (bilirubin) => this.setState({ bilirubin }) }
            value = { this.state.bilirubin }
            />
            </View>
            <View style = { styles.inputunitsection } >
            <Text style = { styles.units } >
              { this.state.unitswitch ? 'unit1' : 'unit2' }
            </Text>
            <Text style = { styles.units } >
              { this.state.unitswitch ? 'unit1' : 'unit2' }
            </Text>
            <Text style = { styles.units } >
              { this.state.unitswitch ? 'unit1' : 'unit2' }
            </Text>
            <Text style = { styles.units } >
              { this.state.unitswitch ? 'unit1' : 'unit2' }
            </Text>
            </View>
            <View style = { styles.inputsection, { marginLeft: 0 } } >
            <Switch style = { styles.switch }
            onValueChange = { this.unitSwitch }
            value = { this.state.unitswitch }
            />
            <Switch style = { styles.switch }
            onValueChange = { this.unitSwitch }
            value = { this.state.unitswitch }
            />
            <Switch style = { styles.switch }
            onValueChange = { this.unitSwitch }
            value = { this.state.unitswitch }
            />
            <Switch style = { styles.switch }
            onValueChange = { this.unitSwitch }
            value = { this.state.unitswitch }
            />
            </View>
            </View>

            <Button onPress = {
                () => {
                    this.setModalVisible(!this.state.modalVisible);
                }
            }
            style = { styles.button }
            text = 'Hide Modal' / >
            </View>
            </ScrollView>
            </Modal>

            <Button onPress = {
                () => {
                    this.setModalVisible(true);
                }
            }
            style = { styles.button }
            text = 'Show Modal' / >
            </View>

            <Text style = { styles.title } >
              { this.props.name }
            </Text>

            <Text style = { styles.title } >
              { dateString }
            </Text>

            <View style = { styles.gridContainer } >
            <Grid >
            <Col style = { styles.col } >
            <Button onPress = { this.goToTriage }
            style = { styles.button }
            text = 'Triage' / >

            <Button onPress = { this.goToSoap }
            style = { styles.button }
            text = 'SOAP' / >

            <Button onPress = { this.goToMedicationList }
            style = { styles.button }
            text = 'Medications' / >
            </Col>

            <Col style = { styles.col } >
            <Button onPress = { this.goToHistory }
            style = { styles.button }
            text = 'History' / >

            <Button onPress = { this.goToGrowthChart }
            style = { styles.button }
            text = 'Growth Chart' / >
            </Col>
            </Grid>
            </View>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    gridContainer: {
        flex: 1,
        maxWidth: '80%',
        alignItems: 'center',
    },
    col: {
        alignItems: 'center',
    },
    triagescreen: {
        flexDirection: 'column',
        marginLeft: 100,
    },
    triagesection: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginBottom: 50,
    },
    inputsection: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        padding: 10,
        start: 100,
        alignItems: 'flex-start',
    },
    inputunitsection: {
        flexDirection: 'column',
        start: 0,
        maxWidth: 100,
        justifyContent: 'flex-start',
        padding: 10,
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 20,
        textAlign: 'center',
        margin: 5,
    },
    subtitle: {
        fontSize: 17,
        textAlign: 'left',
        margin: 3,
    },
    units: {
        fontSize: 12,
        marginLeft: 20,
        height: 40,
        marginTop: 10,
    },
    button: {
        width: '80%',
        alignItems: 'center',
        marginBottom: 50,
    },
    input: {
        marginBottom: 10,
        width: 400,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
    },
    switch: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    }
});

// Redux
import { setLoading, clearMessages } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapDispatchToProps = dispatch => ({
    setLoading: (val) => dispatch(setLoading(val)),
    clearMessages: () => dispatch(clearMessages())
});

export default connect(null, mapDispatchToProps)(TriageModal);
