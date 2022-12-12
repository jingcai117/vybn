import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View } from 'react-native';
import * as actions from '../redux/actions';
import { AsyncStorage } from 'react-native';

class UserInactivityCheck extends Component {
  constructor(props) {
    super(props);

    this.state = {
      active: true
    };
  }

  async UNSAFE_componentWillReceiveProps(newProps) {
    const flag = newProps.state.inactiveLongTime;
    if (this.props.state.inactiveLongTime != flag && flag == true) {
      if (!this.props.state.isWaiting && !this.props.state.playstate) {
        await AsyncStorage.removeItem("authtoken1");
        await AsyncStorage.removeItem("loggedIn");
        this.props.saveProfile(null);
        this.props.navigation.navigate("Auth");
      }
    }
    if (flag) {
      this.props.saveInactiveLongTime(false);
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        { this.props.children }
      </View>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    state: state.app
  }
};

export default connect(state => (mapStateToProps), actions)(UserInactivityCheck);