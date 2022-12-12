import React, { Component, useState } from "react";
import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";
import { Grid, Row } from "native-base";
import Error from "../../components/Error";
import LoadingModal from "../../components/Loading";

import {
  View,
  Text,
  ImageBackground,
  Image,
  StyleSheet,
  AsyncStorage,
  Keyboard
} from "react-native";
import {
  AuthText,
  Dash,
  InputComponent,
  SecondaryText,
  ButtonComponent,
  ButtonWithoutScroll
} from "../../components/Form";

import background from "../../assets/background5.png";
//import logo from "../../assets/logo.png";
import side from "../../assets/side3.png";
import emailimage from "../../assets/email.png";
import emailimageicon from "../../assets/emailicon.png";

export default function Login(props) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [keyboardshow, setKeyboardshow] = React.useState(false);

  let keyboardShowListener, keyboardHideListener;
  React.useEffect(() => {
    keyboardShowListener = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardshow(true)
    );
    keyboardHideListener = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardshow(false)
    );
    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);
  const handleSubmit = async forgetPassword => {
    if (email == "") {
      ShowToast("Email is required");
      return;
    } else {
      const res = await forgetPassword();
      await AsyncStorage.setItem("authtoken1", res.data.forgetPassword.token);
      await AsyncStorage.setItem("authscreen", "OtpConfirm");
      props.navigation.navigate("OtpConfirm");
      console.log(res);
    }
  };
  return (
    <Mutation mutation={FORGET_PASSWORD_MUTATION} variables={{ email }}>
      {(forgetPassword, { loading, error, called, client }) => {
        if (loading) {
          console.debug("loading");
        }
        let message;
        if (error) {
          console.log(error);
        }
        return (
          <Grid>
            {error && <Error message={error.message} />}
            {loading && <LoadingModal />}
            <Row>
              <ImageBackground
                source={background}
                style={{
                  flex: 1,
                  height: "100%",
                  width: "100%"
                }}
                resizeMode="cover"
              >
                <Row size={keyboardshow ? 40 : 60}>
                  <View style={{ flex: 1, flexDirection: "column" }}>
                    <View
                      style={{
                        flex: 4,
                        alignItems: "center",
                        justifyContent: "space-around"
                      }}
                    >
                      <Text
                        style={{
                          // Style for "JUST A MOR"

                          color: "#ffffff",
                          fontFamily: "Droidsans",
                          fontSize: 21,
                          fontWeight: "700",

                          marginTop: 10
                        }}
                      >
                        Get Back
                      </Text>
                      <Image
                        source={emailimage}
                        style={{
                          // Style for "Mail copy"

                          width: 140,
                          height: 120,
                          marginBottom: 20
                        }}
                      />
                    </View>
                    <View style={{ flex: 1, justifyContent: "space-between" }}>
                      <AuthText
                        text="FORGET PASSWORD"
                        style={{ marginTop: 16, textAlign: "center" }}
                      />
                      <View style={{ marginBottom: 20 }}>
                        <Dash />
                      </View>
                    </View>
                  </View>
                </Row>

                <Row size={keyboardshow ? 30 : 50}>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <View>
                      <View style={{ width: 300 }}>
                        <InputComponent
                          value={email}
                          onChange={text => setEmail(text)}
                          icon={emailimageicon}
                          icontype="image"
                          placeholder="Enter your email"
                        />
                        <SecondaryText
                          containerStyle={{
                            justifyContent: "center",
                            alignItems: "center",
                            marginBottom: 16
                          }}
                          text={`Please enter your email address
                    `}
                        />
                      </View>
                    </View>

                    <View
                      style={{
                        marginBottom: 16,

                        justifyContent: "flex-end",
                        flexDirection: "column",
                        width: 300
                      }}
                    >
                      <View style={{ marginBottom: 20 }}>
                        <Dash />
                      </View>
                      <View
                        style={{
                          height: 40,
                          width: "100%"
                        }}
                      >
                        <ButtonWithoutScroll
                          loading={loading}
                          onPress={() => handleSubmit(forgetPassword)}
                          style={{ marginBottom: 8 }}
                          text="Confirm Email"
                        />
                      </View>
                    </View>
                  </View>
                </Row>
                {keyboardshow ? <Row size={30} /> : null}
              </ImageBackground>
            </Row>
          </Grid>
        );
      }}
    </Mutation>
  );
}

const styles = StyleSheet.create({
  logo: {
    marginTop: 65,
    width: 170,
    height: 170,
    shadowColor: "rgba(0, 0, 0, 0.75)",
    shadowOffset: { width: 1, height: 0 },
    shadowRadius: 2
  }
});

const FORGET_PASSWORD_MUTATION = gql`
  mutation($email: String!) {
    forgetPassword(email: $email) {
      token
    }
  }
`;
