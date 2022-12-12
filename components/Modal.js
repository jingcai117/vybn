import React from 'react';
import Modal from "react-native-modal";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { ButtonComponent } from "./Form";

export default function ModalComponent(props) {
  return (
    <View>
      <Modal isVisible={true} onBackdropPress={() => props.showModal(false)}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <View style={{ backgroundColor: "white", margin: 10 }}>
            <View style={{ padding: 10 }}>
              <TextInput
                value={props.value}
                style={{ borderWidth: 1, borderColor: "#bbb", height: 40 }}
                onChangeText={text => props.handleChangeText(text)}
              />
              <TouchableOpacity onPress={() => props.showModal(false)}>
                <View
                  style={{
                    padding: 10,
                    marginTop: 10,
                    borderRadius: 10,
                    backgroundColor: "#333",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      justifyContent: "center",
                      alignItems: "center"
                    }}
                  >
                    Continue
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
