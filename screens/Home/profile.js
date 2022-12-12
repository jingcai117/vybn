import React, { Component, useState } from "react";

import { Grid, Row, Toast } from "native-base";
import Error from "../../components/Error";
import PremiumButton from "../../components/Profile/freepremium";
import Promotext from "../../components/Profile/ProfilePromoText";
import Colorselection from "../../components/Profile/colorselection";
import Yesnobutton from "../../components/Profile/yesnobutton";
import Editicon from "../../components/Profile/editicon";
import AddSubscription from './AddSubscription';
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";

import {
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView
} from "react-native";
import {
  View,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
  TouchableHighlight,
  AsyncStorage
} from "react-native";
import {
  AuthText,
  Dash,
  InputComponent,
  SecondaryText,
  ButtonComponent,
  ButtonWithIcon
} from "../../components/Form";
import { GoogleAuth, FacebookAuth } from "../../components/SocialAuth";
import background from "../../assets/background5.png";
import logo from "../../assets/iconnew.png";
import keyimage from "../../assets/passwordicon.png";
import ProfileBackground from "../../assets/profileback.png";
import Profile from "../../assets/profile.png";
import emailimage from "../../assets/emailicon.png";
import ShowToast from "../../components/ShowToast";
import Editprofile from "./editprofile";
import Loading from "../../components/Loading";

export default function ProfileComponent(props) {
  const { loading, error, data, refetch, networkStatus } = useQuery(
    GET_PROFILE,
    {
      notifyOnNetworkStatusChange: true
    }
  );

  console.log('data: ', data);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    console.log('error message: ', error.message);
    return <Text>Error</Text>;
  }

  const goPlay = () => {
    props.navigation.navigate("Music");
  }

  if (data) {
    return (
      <Editprofile refetch={refetch} titleText="PROFILE" {...data.profile} goPlay={goPlay} />
    );
  }
}

const styles = StyleSheet.create({
  logo: {
    width: 150,
    height: 150,
    shadowColor: "rgba(0, 0, 0, 0.75)",
    shadowOffset: { width: 1, height: 0 },
    shadowRadius: 2
  },
  m15: {
    marginBottom: 23
  },
  m10: {
    marginBottom: 18
  },
  m20: {
    marginBottom: 28
  },
  m5: {
    marginBottom: 13
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
