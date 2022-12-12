import React from "react";
import {
  AsyncStorage,
  View,
  ImageBackground,
  StyleSheet,
  Image,
  Animated
} from "react-native";

import { gql } from "apollo-boost";
import client from "../graphql/client";
import { connect } from 'react-redux';
import * as actions from '../redux/actions';
import logo from "../assets/iconnew.png";
import BackgroundSplash from "../assets/bgbackgroundsplash.png";
// import { SplashScreen } from "expo";
import * as SplashScreen from 'expo-splash-screen';

class AuthLoadingScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sizeAnim: new Animated.Value(0),
      opacityAnim: new Animated.Value(0),
      animEnded: false,
      loadingEnded: false,
      toRoute: "Auth"
    }
  }

  componentDidMount() {
    this._bootstrapAsync();

    Animated.sequence([
      Animated.parallel([
        // after decay, in parallel:
        Animated.timing(this.state.sizeAnim, {
          toValue: 1,
          duration: 1000
        }),
        Animated.timing(this.state.opacityAnim, {
          toValue: 1,
          duration: 10
        })
      ])
    ]).start(() => {
      this.setState({
        animEnded: true
      });

      // when animation is ended, if data loading was ended, route to toRoute
      if (this.state.loadingEnded) {
        this.props.navigation.navigate(this.state.toRoute);
      }
    }); // start the sequence group
  }

  // Fetch the token from storage then navigate to our appropriate place
  _bootstrapAsync = async () => {
    // For login test purposes *************************
    // set expired token to authtoken1
    // await AsyncStorage.setItem("authtoken1", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImVtYWlsIjoiZGFuaWVsc215a293c2tpMUBnbWFpbC5jb20iLCJpYXQiOjE1ODYyOTM4NDUsImV4cCI6MTU4NjM4MDI0NX0.KjXad-eCsN7EmQs5Ace0RMQ_-kDVxYZ9QftCJYhrJUM");
    // await AsyncStorage.setItem("loggedIn", "true");
    // *************************************************

    const userToken = await AsyncStorage.getItem("authtoken1");
    const loggedIn = await AsyncStorage.getItem("loggedIn");

    // This will switch to the App screen or Auth screen and this loading
    // screen will be unmounted and thrown away.
    let toRoute = "Auth"
    if ( userToken && loggedIn ) {
      const routeToLogin = await this.getProfile();
      if (!routeToLogin) {
        toRoute = "App";
      }
    }
    this.setState({
      loadingEnded: true,
      toRoute: toRoute
    });

    // when data is loaded, if animiation was ended, route to toRoute
    if (this.state.animEnded) {
      this.props.navigation.navigate(toRoute);
    }
  };

  // get the current user's profile. Return value indicates whether to route to login screen or not.
  async getProfile() {
    try {
      const { data } = await client.query({
          query: GET_PROFILE,
      });
      console.log('saveProfile: ', data.profile);
      this.props.saveProfile(data.profile);
    } catch (e) {
      if (e.message.replace("GraphQL error:", "").trim().substr(0, 8) == "Login to") {
        await AsyncStorage.removeItem("authtoken1");
        await AsyncStorage.removeItem("loggedIn");
        this.props.saveProfile(null);
        return true;
      }
    }
    return false;
  }

  // Render any loading content that you like here
  render() {
    return (
      <View style={{ flex: 1 }}>
        <ImageBackground
          source={BackgroundSplash}
          style={{
            flex: 1,
            height: null,
            width: null
          }}
          resizeMode="cover"
          onLoadEnd={async () => {
            await SplashScreen.hideAsync();
          }}
          fadeDuration={0}
        >
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              flex: 1
            }}
          >
            <Animated.View
              style={{
                transform: [{ scale: this.state.sizeAnim }],
                opacity: this.state.opacityAnim
              }}
            >
              <Image
                source={logo}
                style={{
                  ...styles.logo
                }}
              />
            </Animated.View>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  logo: {
    width: 160,
    height: 160,
    shadowColor: "rgba(0, 0, 0, 0.75)",
    shadowOffset: { width: 1, height: 0 },
    shadowRadius: 2
  }
});

const GET_PROFILE = gql`
  {
    profile {
      id
      profilePic
      plan_type
      firstName
      color_scheme
      private
    }
  }
`;

const mapStateToProps = (state) => {
    return {
        state: state.app
    }
}

export default connect(state => (mapStateToProps), actions)(AuthLoadingScreen);
