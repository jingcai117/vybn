import Modal from "react-native-modal";
import React from 'react';
import { ActivityIndicator, ImageBackground } from "react-native";
import { View, Text, StyleSheet } from "react-native";
import background from "../assets/stationcoverback.png"

export default function LoadingModalComponent(props) {
  return (
    <View>
      <Modal isVisible={true}>
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <View
            style={{
              width: "100%",
              padding: 20,
              backgroundColor: "#2D2E37",
              borderRadius: 10,
            }}
          >
            <Text style={styles.textStyle}>
              We're on it! Please give us a moment while we build your personalized radio station.
            </Text>
            <Text style={styles.textStyle}>
              When ready you can adjust play settings to fine tune your station as well as explore favorite albums and add new music.
              Enjoy!
            </Text>
            <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 5, marginBottom: 10 }} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  textStyle: {
    fontSize: 16,
    color: "white",
    marginBottom: 20
  }
});
