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

import PromoBack from "../../assets/promoback.png";

export default function Promoback(props) {
  return (
    <View
      style={{
        borderBottomWidth: 5,

        borderRadius: 5,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: "rgba(88, 84, 84, 0.77)",
        backgroundColor: "rgba(88, 84, 84, 0.77)"
      }}
    >
      <View
        style={{
          borderTopWidth: 5,
          borderLeftWidth: 2,
          borderRightWidth: 2,

          borderColor: "#2C2D37",
          borderBottomWidth: 5,
          borderRadius: 5
        }}
      >
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ImageBackground
            source={PromoBack}
            style={{ width: "100%", height: "100%", flex: 1 }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                padding: 20
              }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                <Text
                  style={{ color: "#abaed0", fontSize: 30, paddingRight: 20 }}
                >
                  $4.99/M
                </Text>
              </View>
              <View style={{ flex: 1, justifyContent: "center" }}>
                <Text style={styles.text}>● Unlimited Access</Text>
                <Text style={styles.text}>● All Kits included</Text>
                <Text style={styles.text}>● IOS suport</Text>
                <Text style={styles.text}>● Ad free listenting</Text>
                <Text style={styles.text}>● Broadcast</Text>
              </View>
            </View>
          </ImageBackground>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 21,
    color: "#abaed0"
  }
});
