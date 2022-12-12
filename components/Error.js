import React from 'react';
import { Toast } from "native-base";
import { Alert, AsyncStorage } from "react-native";

export default function(props) {
  // const [error, showerror] = React.useState(true);
  console.log("error compoennet");
  console.log(props.message);

  let message = props.message.replace("GraphQL Error:", "").trim();
  message = message.replace("GraphQL error:", "").trim();
  // if (error) {
    Toast.show({
      text: message,
      buttonText: "Okay",
      duration: 3000,
      position: "top"
    });
    // showerror(false);
  // }

  return null;
}
