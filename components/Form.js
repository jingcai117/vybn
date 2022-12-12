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
import ButtonBack from "../assets/buttonback.png";
import { Spinner } from "native-base";

export function AuthText(props) {
  return (
    <View
      style={{
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        ...props.style
      }}
    >
      <Text style={{ ...styles.authtext, ...props.textstyle }}>
        {props.text}
      </Text>
    </View>
  );
}

export function Dash(props) {
  return (
    <View
      style={{
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
        ...props.style
      }}
    >
      <View style={styles.dash}></View>
    </View>
  );
}

export function InputComponent(props) {
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8
      }}
    >
      <View
        style={{
          ...styles.textInputContainer,
          backgroundColor: "#1A1B22",
          shadowColor: "#fff",
          shadowOffset: {
            width: 0,
            height: 9
          },
          borderRadius: 5,
          shadowOpacity: 0.48,
          shadowRadius: 11.95,

          elevation: 18
        }}
      >
        <View
          style={{
            justifyContent: "center",
            paddingRight: 10,
            marginLeft: 10
          }}
        >
          {props.icontype ? (
            <Image source={props.icon} style={styles.textInputIcon} />
          ) : (
            <Ionicons
              iconStyle={styles.textInputIcon}
              name={props.icon}
              size={20}
              color="#E159BA"
            />
          )}
        </View>
        <View
          style={{
            justifyContent: "center",
            marginRight: 10
          }}
        >
          <View
            style={{
              height: 20,
              width: 1,
              backgroundColor: "white"
            }}
          ></View>
        </View>
        <View
          style={{
            justifyContent: "center"
          }}
        >
          <TextInput
            placeholderTextColor="#fff"
            secureTextEntry={props.secure ? true : false}
            value={props.value}
            onChangeText={text => props.onChange(text)}
            style={styles.textInputText}
            placeholder={props.placeholder}
          />
        </View>
      </View>
    </View>
  );
}

export function ButtonComponent(props) {
  return (
    <View style={{ ...styles.buttonContainer, ...props.style }}>
      <ImageBackground
        source={ButtonBack}
        imageStyle={{ borderRadius: 5 }}
        style={{ width: "100%", height: "100%", flex: 1, borderRadius: 5 }}
      >
        <TouchableOpacity onPress={() => props.onPress()}>
          <View
            style={{
              borderColor: "#202024",
              borderStyle: "solid",
              borderRadius: 5,
              borderWidth: 1,

              justifyContent: "center",
              paddingTop: 10,
              paddingBottom: 10,
              alignItems: "center"
            }}
          >
            <Text style={styles.buttontext}>{props.text}</Text>
          </View>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

export function ButtonWithIcon(props) {
  return (
    <TouchableOpacity onPress={props.onPress} style={props.style}>
      <View
        style={{
          flexDirection: "row",
          width: 145,
          height: 34,
          justifyContent: "center",
          alignItems: "center",
          borderColor: "#202024",
          borderStyle: "solid",
          borderWidth: 1,
          backgroundColor: "#2C2D37",
          borderRadius: 5
        }}
      >
        <View
          style={{ justifyContent: "center", paddingRight: 10, marginLeft: 10 }}
        >
          <Ionicons
            iconStyle={styles.textInputIcon}
            name={props.icon}
            size={20}
            color="#fff"
          />
        </View>
        <View style={{ justifyContent: "center", marginRight: 10 }}>
          <View
            style={{
              width: 1,
              height: 20,
              borderRightWidth: 1,
              borderRightColor: "#fff"
            }}
          ></View>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "white" }}>{props.text}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function ButtonWithoutScroll(props) {
  return (
    <View>
      <ImageBackground
        source={ButtonBack}
        imageStyle={{ borderRadius: 5 }}
        style={{
          width: "100%",
          height: "100%",

          borderRadius: 5
        }}
      >
        <TouchableOpacity onPress={() => props.onPress()}>
          <View
            style={{
              borderColor: "#202024",
              borderStyle: "solid",
              borderRadius: 5,
              borderWidth: 1,

              justifyContent: "center",
              paddingTop: 10,
              paddingBottom: 10,
              alignItems: "center"
            }}
          >
            {props.loading ? (
              <Spinner color="white" />
            ) : (
              <Text style={styles.buttontext}>{props.text}</Text>
            )}
          </View>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}

export function SecondaryText(props) {
  return (
    <View style={{ ...props.containerStyle }}>
      <Text style={{ ...styles.secondaryText, ...props.textStyle }}>
        {props.text}
      </Text>
    </View>
  );
}
// Style for "LOGIN"
const styles = StyleSheet.create({
  authtext: {
    color: "#abaed0",

    fontSize: 21,
    fontWeight: "700"
  },
  buttonContainer: {
    /*   borderBottomWidth: 3,

    borderRadius: 5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "rgba(88, 84, 84, 0.77)", */
    /*   backgroundColor: "rgba(88, 84, 84, 0.77)" */
  },
  dash: {
    width: 21,
    height: 6,
    borderRadius: 2,
    borderColor: "#202024",
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: "rgba(0, 0, 0, 0.36)",
    backgroundColor: "#000000"
  },
  // Style for "Shape 81"

  textInputContainer: {
    flexDirection: "row",
    width: 300,

    height: 40,
    shadowColor: "#4d4f5e",
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 0,
    borderColor: "#202024",
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: "rgba(0, 0, 0, 0.36)"
  },
  textInputText: {
    // Style for "|   Enter"
    width: 240,
    height: 36,
    color: "#fff",
    fontFamily: "Droidsans",
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 16,
    textAlignVertical: "center"
  },
  textInputIcon: {
    // Style for "Mail"

    width: 20,
    height: 15,
    shadowColor: "rgba(253, 89, 206, 0.41)",
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 13
  }, // Style for "Shape 2"

  button: {
    width: 300,
    height: 34,
    shadowColor: "#4d4f5e",
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 0,
    borderColor: "#202024",
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: "#abaed0"
  },
  buttontext: {
    // Style for "Login"

    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 0 },
    textShadowRadius: 2,
    color: "#abaed0",
    fontFamily: "Droidsans",
    fontSize: 16,
    fontWeight: "400"
  },
  secondaryText: {
    // Style for "Forgot Pas"

    color: "#abaed0",
    fontFamily: "Droidsans",
    fontSize: 13,
    fontWeight: "400",
    lineHeight: 20,
    textAlign: "center"
  }
});
