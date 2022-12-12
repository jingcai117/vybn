import React, {Component} from 'react';
import { View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
//import { TabBarBottom } from 'react-navigation';

export default class GradientTab extends Component {
  render() {
    return (
      <View style={{ backgroundColor: 'transparent' }}>
          <LinearGradient
              colors={['white', 'rgba(214,234,241,0.77)']}
              style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  height: 72
              }}
          >
          <Text >
            Sign in with Facebook
          </Text>
          </LinearGradient>
      </View >
    );
  }
}
