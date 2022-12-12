import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  Image,
  ImageBackground
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import StationCoverBack from "../../assets/stationcoverback.png";
import StationCover from "../../assets/stationcover.png";
import EarIcon from "../../assets/ear1.png";
import StationIconBack from "../../assets/stationiconback.png";
import DeleteIcon from "../../assets/delete.png";
import VarietyIcon from "../../assets/variety.png";
import { Spinner } from "native-base";
import YesNoBackground from "../../assets/yesnoback.png";
import NoButton from "../../assets/nobutton.png";

export default function Yesnobutton(props) {
  console.log(props.privateProfile);
  console.log(props.privateProfile == "true");
  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: 100, height: 50 }}>
        <ImageBackground
          source={YesNoBackground}
          imageStyle={{ borderRadius: 5 }}
          style={{ width: "100%", height: "100%" }}
        >
          <View style={{ flexDirection: "row", flex: 1 }}>
            {props.privateProfile == true ? (
              <>
                <ActiveButton
                  setPrivateProfile={props.setPrivateProfile}
                  privateProfile={props.privateProfile}
                  text="Yes"
                />
                <InactiveButton
                  setPrivateProfile={props.setPrivateProfile}
                  privateProfile={props.privateProfile}
                  text="No"
                />
              </>
            ) : (
              <>
                <InactiveButton
                  setPrivateProfile={props.setPrivateProfile}
                  privateProfile={props.privateProfile}
                  text="Yes"
                />
                <ActiveButton
                  setPrivateProfile={props.setPrivateProfile}
                  privateProfile={props.privateProfile}
                  text="No"
                />
              </>
            )}
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}

function ActiveButton(props) {
  return (
    <TouchableOpacity
      onPress={() => props.setPrivateProfile(!props.privateProfile)}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          color: "#9798b9",
          /*   fontFamily: "Droid Sans - Regular", */
          fontSize: 15,
          justifyContent: "center",

          alignItems: "center"
        }}
      >
        <Text style={{ color: "#9798b9", fontSize: 15 }}>{props.text}</Text>
      </View>
    </TouchableOpacity>
  );
}
function InactiveButton(props) {
  return (
    <TouchableOpacity
      onPress={() => props.setPrivateProfile(!props.privateProfile)}
      style={{ flex: 1 }}
    >
      <View
        style={{
          flex: 1,
          marginBottom: 3
        }}
      >
        <ImageBackground
          source={NoButton}
          style={{ width: "100%", height: "100%", flex: 1 }}
          imageStyle={{ borderRadius: 1 }}
        >
          <View
            style={{
              flex: 1,

              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Text style={{ color: "#9798b9", fontSize: 13 }}>{props.text}</Text>
          </View>
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );
}
