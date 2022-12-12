import Modal from "react-native-modal";
import React from 'react';
import { ActivityIndicator } from "react-native";
import { View } from "react-native";

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
            bottom: 0
          }}
        >
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        </View>
      </Modal>
    </View>
  );
}
