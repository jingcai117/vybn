import React, {Component} from 'react';
import { Image, Platform, View } from 'react-native';
import { createStackNavigator } from "react-navigation-stack";
import { createBottomTabNavigator } from 'react-navigation-tabs';

import MusicScreen from "./screens/Home/music";
// import SettingsScreen from "./screens/Home/settings";
import ControlScreen from "./screens/Home/control";
// import GuestListener from "./screens/Home/guestlistener";
import NewsScreen from "./screens/Home/news";
import CommentScreen from "./screens/Home/commentlist";
import ProfileScreen from "./screens/Home/profile";
// import GradientTab from "./components/GradientTab";
import CreateChannelScreen from "./screens/Home/createchannel";

const PlayStack = createStackNavigator(
  {
    Music: MusicScreen,
    Profile: ProfileScreen,
    CreateChannel: CreateChannelScreen,
  },
  {
    headerMode: "none",
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => (
            <Image
              source={require('./assets/play.png')}
              style={{
                marginBottom: -3,
                resizeMode: 'contain',
                width: 26,
                height: 26,
                tintColor: tintColor
              }}
              tintColor={tintColor}
            />
      ),
      tabBarOnPress: ({ navigation, defaultHandler }) => {
        defaultHandler();
        console.log('tab bar')
      }
    }
  }
);

const ControlStack = createStackNavigator(
  {
    Control: ControlScreen,
    // GuestListener: GuestListener
    // Settings: SettingsScreen
  },
  {
    headerMode: "none",
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={require('./assets/controls.png')}
          style={{
            marginBottom: -3,
            resizeMode: 'contain',
            width: 26,
            height: 26,
            tintColor: tintColor
          }}
          tintColor={tintColor}
        />
      )
    }
  }
);

const CommentStack = createStackNavigator(
  {
    Comment: CommentScreen,
  },
  {
    headerMode: "none",
    navigationOptions: {
      tabBarIcon: ({ focused, tintColor }) => (
        <Image
          source={require('./assets/comment.png')}
          style={{
            marginBottom: -3,
            resizeMode: 'contain',
            width: 26,
            height: 26,
            tintColor: tintColor
          }}
        />
      ),
      tabBarOnPress: ({ navigation, defaultHandler }) => {
        defaultHandler();
      }
    }
  }
);

const NewsStack = createStackNavigator(
  {
    News: NewsScreen,
  },
  {
    headerMode: "none",
    navigationOptions: {
      tabBarIcon: ({ tintColor }) => (
        <Image
          source={require('./assets/newspaper.png')}
          style={{
            marginBottom: -3,
            resizeMode: 'contain',
            width: 26,
            height: 26,
            tintColor: tintColor
          }}
          tintColor={tintColor}
        />
      ),
    }
  }
);

export default createBottomTabNavigator({
  Play: PlayStack,
  Control: ControlStack,
  Comment: CommentStack,
  News: NewsStack
},
{
  // initialRouteName: "Control",
  tabBarOptions : {
    activeTintColor: '#CC3FDF',
    inactiveTintColor: 'white',
    showLabel: false,
    style: {
      backgroundColor: '#7c52c2'
    }
  }
});
