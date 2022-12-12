import React from 'react';
import { Image, StyleSheet, View, TouchableOpacity } from "react-native";
import { STATIC_URL } from "../../config";
import Editicon from "./editicon";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";
import * as Permissions from "expo-permissions";

export default function HeaderImage(props) {

  const handleImageSelect = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }
    }
    _pickImage();
  };

  _pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5
    });

    //console.log(result);

    if (!result.cancelled) {
      //console.log(result);
      props.handleImage(result);
    }
  };

  return (
    <>
      <Image
        source={{ uri: props.profilePic }}
        style={
          props.originamProfilePic == "profile.png"
            ? {
                ...styles.logo,
                marginBottom: 20
              }
            : {
                ...styles.logo,
                marginBottom: 20,
                borderRadius: 150 / 2
              }
        }
      />

      <View style={{ position: "absolute", bottom: 13 }}>
        <TouchableOpacity onPress={handleImageSelect}>
          <Editicon />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 150,
    height: 150,
    shadowColor: "rgba(0, 0, 0, 0.75)",
    shadowOffset: { width: 1, height: 0 },
    shadowRadius: 2
  },
  m15: {
    marginBottom: 23
  },
  m10: {
    marginBottom: 18
  },
  m20: {
    marginBottom: 28
  },
  m5: {
    marginBottom: 13
  }
});
