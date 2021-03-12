import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Modal,
    TouchableHighlight,
    TouchableOpacity,
    Animated
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import TabBar from "react-native-underline-tabbar";
import Button from '../components/Button';
import TriageScreen from './TriageScreen';
import TriagePatientPage from '../components/TriagePatientPage';
import Table from 'react-native-simple-table';
import TriagePageNew from './TriagePageNew';
import { localData, serverData } from '../services/DataService';
import { stringDate } from '../util/Date';
import TriageHistory from './TriageHistory';
import SoapScreen from './SoapScreen';
import LabScreen from './LabScreen';
import Container from '../components/Container';
import GrowthChartScreen from './GrowthChartScreen';

const Page = ({ label }) =>
    (<View style = { styles.container }>
    <Text style = { styles.welcome }>
      { label }
    </Text>
    <Text style = { styles.instructions }>
      To get started, edit index.ios.js
    </Text>
    <Text style = { styles.instructions } >
      Press Cmd + R to reload, { '\n' }
      Cmd + D or shake
      for dev menu
    </Text>
    </View>
);

const Tab = ({ tab, page, isTabActive, onPressHandler, onTabLayout, styles }) => {
    const { label } = tab;
    const style = {
        marginRight: 30,
        paddingVertical: 10,
    };
    const containerStyle = {
        paddingHorizontal: 40,
        paddingVertical: 10,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: styles.backgroundColor,
        opacity: styles.opacity,
        transform: [{ scale: styles.opacity }],
    };
    const textStyle = {
        color: styles.textColor,
        fontWeight: '600',
    };
    return (
      <TouchableOpacity style = { style }
        onPress = { onPressHandler }
        onLayout = { onTabLayout }
        key = { page } >
        <Animated.View style = { containerStyle } >
        <Animated.Text style = { textStyle } > { label }
        </Animated.Text>
        </Animated.View>
      </TouchableOpacity>
    );
};

class PatientHomeScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            patientInfo: null,
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    _scrollX = new Animated.Value(0);
    // 6 is a quantity of tabs
    interpolators = Array.from({ length: 6 }, (_, i) => i).map(idx => ({
        scale: this._scrollX.interpolate({
            inputRange: [idx - 1, idx, idx + 1],
            outputRange: [1, 1.2, 1],
            extrapolate: 'clamp',
        }),
        opacity: this._scrollX.interpolate({
            inputRange: [idx - 1, idx, idx + 1],
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
        }),
        textColor: this._scrollX.interpolate({
            inputRange: [idx - 1, idx, idx + 1],
            outputRange: ['#000', /* when not selected font color */
                '#00A2BD', /* selected font color */
                '#000'
            ],
            /* when not selected font color */
        }),
        backgroundColor: this._scrollX.interpolate({
            inputRange: [idx - 1, idx, idx + 1],
            outputRange: ['white', 'rgba(0, 160, 189, 0.25)', 'white'],
            extrapolate: 'clamp',
        }),
    }));

    componentWillMount() {
        let patientInfo = localData.getPatient(this.props.patientKey);
        this.setState({ patientInfo: patientInfo });
    }

    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }

    onNavigatorEvent(event) {
      switch (event.id) {
      case 'willAppear':
            let patientInfo = localData.getPatient(this.props.patientKey);
            this.setState({ patientInfo: patientInfo });
        this.setState({contentProps: {style: { flex: 1}}});
        break;
      case 'willDisappear':
        this.setState({contentProps: {style: { flex: 0}}});
        break;
      }
    }

    goToTriage = (date) => {
        let triage = this.state.patientInfo.triages.find(obj => {
            return obj.date == date
        });
        this.props.navigator.push({
            screen: 'Ihc.TriageHistory',
            title: `${this.props.name}`,
            passProps: {
                currentPatientKey: this.state.patientInfo.key,
                triage: triage,
                gender: this.state.patientInfo.gender,
            },
        });
    }

    render() {
        let triageLabel = `TRIAGE`;
        let triage = localData.getTriage(this.props.patientKey, this.props.status.date);
        return (
          <View style = {
                [styles.container, { paddingTop: 20 }] } >

            <View style = {
                { marginLeft: 40 } } >

              <Text style = { styles.patientName } >
                { this.props.name }
              </Text>
              <Text style = { styles.patientInfo } >
                { `${this.state.patientInfo.gender == 1 ? 'Male' : 'Female'} | ${this.state.patientInfo.birthday}` }
              </Text>
            </View>
            <ScrollableTabView style = { styles.tabContainer }
              ref={(ref) => { this.scrollableTabView = ref; }}
              contentProps={this.state.contentProps}
              renderTabBar = {
                () => {
                  return( <TabBar tabBarActiveTextColor = "#53ac49"
                    underlineColor = "#00A2BD"
                    tabBarStyle = {
                      { backgroundColor: "#fff", borderTopColor: '#d2d2d2', borderTopWidth: 0 } }
                    renderTab = {
                      (tab, page, isTabActive, onPressHandler, onTabLayout) => {
                        return ( <Tab key = { page }
                          tab = { tab }
                          page = { page }
                          isTabActive = { isTabActive }
                          onPressHandler = { onPressHandler }
                          onTabLayout = { onTabLayout }
                          styles = { this.interpolators[page] }/>);
                      }
                    }/>
                  );
                }
              }
              onScroll = {
                (x) => this._scrollX.setValue(x) } >
              <TriagePageNew 
                currentPatientKey = { this.state.patientInfo.key }
                gender = { this.state.patientInfo.gender }
                goToTriage = { a => this.goToTriage(a) }
                label = "Page #1 Hot"
                canModify = { this.props.canModify }
                tabLabel = { { label: triageLabel } }
                status = { this.props.status }
                showHistory = { this.props.showHistory }
                showForm = { this.props.showForm }
              />
              <SoapScreen 
                currentPatientKey = { this.state.patientInfo.key } 
                tabLabel = { { label: "SOAP" } }
                label = "Page #2 SOAP"
                />
              <GrowthChartScreen 
                tabLabel = { { label: "GROWTH CHART" } }
                label = "Page #3 GC"
                currentPatientKey = { this.state.patientInfo.key } />
              <LabScreen 
                tabLabel = { { label: "LABS" } }
                canModify = { false }
                currentPatientKey = { this.state.patientInfo.key }
                doctorView = { true }
                label = "Page #4 LABS" / >
            </ScrollableTabView>
          </View>
        );
    }
}


const styles = StyleSheet.create({
    tabContainer: {
        marginHorizontal: '2.5%',
    },
    patientName: {
        fontSize: 30,
        color: 'black',
        fontWeight: '900'
    },
    patientInfo: {
        fontSize: 20,
        color: '#333',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'white',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
        fontSize: 28,
    },
});

import { setLoading, clearMessages } from '../reduxActions/containerActions';
import { connect } from 'react-redux';

const mapDispatchToProps = dispatch => ({
    setLoading: (val) => dispatch(setLoading(val)),
    clearMessages: () => dispatch(clearMessages())
});

export default connect(null, mapDispatchToProps)(PatientHomeScreen);
