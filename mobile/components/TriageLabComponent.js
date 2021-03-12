import React, { Component } from 'react';
import {
  View,
  Text
} from 'react-native';

import Picker from 'react-native-wheel-picker';
const PickerItem = Picker.Item;

/*
 * A component to display one lab test. Options will be picked through the
 * Picker component and sent to the parent component
 */
export default class TriageLabComponent extends Component<{}> {
  /* Props
   * name: string name of test, such as "Blood" for blood test
   * options: [string] array of the possible options
   * onValueChange: function to pass new value
   * selectedIndex: int, hold index that corresponds to an option
   */
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.title}> {this.props.name}</Text>
        <Picker style={styles.pickerStyle}
          enabled={this.props.enabled}
          selectedValue={this.props.selectedIndex}
          itemStyle={styles.itemStyle}
          onValueChange={this.props.onValueChange}>
          {this.props.options.map((value, i) => (
            <PickerItem label={value} value={i} key={`${this.props.name}${value}`}/>
          ))}
        </Picker>
      </View>
    );
  }
}

const styles = {
  itemStyle: {
    color: '#505050',
    fontSize: 12
  },
  pickerStyle: {
    width: '100%',
    height: 100,
    marginBottom: 4,
    backgroundColor: '#CBECE5',
    borderRadius: 12
  },
  container: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4
  },
  title: {
    fontSize: 12
  }
};
