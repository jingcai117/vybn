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
import FreePremiumBack from "../../assets/freepremiumback.png";
import Premiumback from "../../assets/premiumback.png";
import { Spinner } from "native-base";

export default function Freepremium(props) {
  return (
    <View style={{ ...styles.mainContainer, ...props.style }}>
      <ImageBackground source={FreePremiumBack} style={styles.imagecontainer}>
        <View style={styles.viewContainer}>
          {props.plan_type == "free" ? (
            <>
              <ActiveButton text="Free" />
              <InactiveButton
                plan_type={props.plan_type}
                showPaymentModal={props.showPaymentModal}
                text="Premium"
              />
            </>
          ) : (
            <>
              <InactiveButton text="Free" />
              <ActiveButton text="Premium" />
            </>
          )}
        </View>
      </ImageBackground>
    </View>
  );
}

function ActiveButton(props) {
  return (
    <View style={styles.viewContainer}>
      <ImageBackground source={Premiumback} style={styles.viewContainer}>
        <View
          style={{
            ...styles.textContainer,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Text style={styles.text}>{props.text}</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

function InactiveButton(props) {
  return (
    <View style={styles.textContainer}>
      <TouchableOpacity
        style={{ flex: 1 }}
        onPress={() => {
          console.log('Inactive Button: ', props);
          if (props.plan_type == "free") {
            props.showPaymentModal(true);
          }
        }}
      >
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.text}>{props.text}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    borderRadius: 5
  },
  imagecontainer: {
    width: "100%",
    height: "100%",
    flex: 1
  },
  viewContainer: {
    flex: 1,
    flexDirection: "row"
  },
  textContainer: {
    flex: 1,
    padding: 10
  },
  text: {
    color: "#fff"
  }
});
