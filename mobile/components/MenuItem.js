import React from 'react';
import {
  View,
  Image,
  StyleSheet,
} from 'react-native';

export default class MenuItem extends React.Component {
      render() {
        return(
          <View style={styles.menuItem}>
            <Image
                source={this.props.itemImage}
                style={styles.image} />
          </View>
        );
      }
}

const styles = StyleSheet.create({
  menuItem: {
    width: '80%',
    height: '100%',
    padding: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  }
});
