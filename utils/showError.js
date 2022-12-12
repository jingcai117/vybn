import { Toast } from "native-base";

export default function(errMsg, duration = 3000) {
  let message = errMsg.replace("GraphQL Error:", "").trim();
  message = message.replace("GraphQL error:", "").trim();
  Toast.show({
    text: message,
    buttonText: "Okay",
    duration: duration,
    position: "top"
  });
}
