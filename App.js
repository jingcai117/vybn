import React from "react";
//import * as Sentry from "sentry-expo";
//import { gql } from "apollo-boost";
import { ApolloProvider } from "react-apollo";

import { Root } from "native-base";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { createStore } from 'redux';
import reducers from './redux/reducers';
import { Provider } from 'react-redux';
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";

import Authloadingscreen from "./screens/Authentication";
import GuestListenerScreen from "./screens/Home/guestlistener";
import LoginScreen from "./screens/Auth/login";
import RegisterScreen from "./screens/Auth/register";
import EmailConfirm from "./screens/Auth/emailconfirm";
import Createpassword from "./screens/Auth/createpassword";
import Forgetpassword from "./screens/Auth/forgetpassword";
import Loading from "./components/Loading";
import client from "./graphql/client";
import Otpconfirm from "./screens/Auth/otpverification";
import * as Config from './config';
import MainTabNavigator from "./MainTabNavigator";
// import { SplashScreen } from 'expo';
import * as actions from './redux/actions';
import * as SplashScreen from 'expo-splash-screen';
import UserInactivity from 'react-native-user-inactivity';
// import BackgroundTimer from 'react-native-user-inactivity/lib/BackgroundTimer';
// import BackgroundTimer from 'react-native-background-timer';
import BackgroundTimer from './utils/BackgroundTimer';

const AuthStack = createStackNavigator(
  {
    Login: LoginScreen,
    Register: RegisterScreen,
    Confirmemail: EmailConfirm,
    CreatePassword: Createpassword,
    ForgetPassword: Forgetpassword,
    OtpConfirm: Otpconfirm,
  },
  {
    headerMode: "none",
    navigationOptions: {
      headerVisible: false
    }
  }
);

const store = createStore(reducers);
const AppContainer = createAppContainer(
    createSwitchNavigator(
        {
          AuthLoading: Authloadingscreen,
          App: MainTabNavigator,
          Auth: AuthStack,
          Guest: GuestListenerScreen
        },
        {
          initialRouteName: "AuthLoading"
        }
    )
);

export default class MainApp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      acitve: true
    };
    this.timer = 0;
  }
  
  async componentDidMount() {
    // Prevent native splash screen from autohiding
    try {
      await SplashScreen.preventAutoHideAsync();
    } catch (e) {
      console.warn(e);
    }

    await Font.loadAsync({
      Roboto: require("native-base/Fonts/Roboto.ttf"),
      Roboto_medium: require("native-base/Fonts/Roboto_medium.ttf"),
      Droidsans: require("./assets/DroidSans.ttf"),
      ...Ionicons.font
    });

    this.setState({ loading: false });
  }

  handleOnAction = async isActive => {
    this.setState({
      active: isActive
    });
    
    if (isActive) {
      BackgroundTimer.clearInterval(this.timer);
      this.timer = BackgroundTimer.setInterval(() => {
        store.dispatch(actions.saveInactiveLongTime(true));
        BackgroundTimer.clearInterval(this.timer);
      }, 600000);
    }
  };

  componentWillUnmount() {
    BackgroundTimer.clearInterval(this.timer);
  }

  render() {
    if (this.state.loading) {
      return null;
    }
    return (
      <Provider store={store}>
        <ApolloProvider fetchPolicy="cache-and-network" client={client}>
          <UserInactivity
            isActive={this.state.active}
            timeForInactivity={1000}
            onAction={this.handleOnAction}
            style={{ flex: 1 }}
          >
            <Root>
              <AppContainer />
            </Root>
          </UserInactivity>
        </ApolloProvider>
      </Provider>
    );
  }
}