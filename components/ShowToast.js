import { Toast } from "native-base";
import { Alert } from "react-native";
import React from 'react';

export default function ShowToast(message) {
  console.log("error compoennet");

  Toast.show({
    text: message,
    buttonText: "Okay",
    duration: 3000,
    position: "top"
  });
}
