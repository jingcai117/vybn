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
  Keyboard,
  TouchableOpacity
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
import side from "../../assets/email.png";
import emailimage from "../../assets/background5.png";
import emailimageicon from "../../assets/emailicon.png";
import ButtonBack from "../../assets/buttonback.png";
import ShowToast from "../../components/ShowToast";

export default function Register(props) {
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
  const handleSubmit = async createUser => {
    if (email == "") {
      ShowToast("Email is required");
      return;
    } else {
      const res = await createUser();
      console.log(res);
      await AsyncStorage.setItem("authtoken1", res.data.createUser.token);
      await AsyncStorage.setItem("authscreen", "emailconfirm");
      props.navigation.navigate("Confirmemail");
      console.log(res);
    }
  };
  return (
    <Mutation mutation={REGISTER_MUTATION} variables={{ email }}>
      {(createUser, { loading, error, called, client }) => {
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
                          lineHeight: 20,
                          marginTop: 10
                        }}
                      >
                        JUST A MORE STEP
                      </Text>
                      <Image
                        source={side}
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
                        text="EMAIL CONFIRMRATION"
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
                    <View style={{ flex: 1 }}>
                      <View style={{ width: 300 }}>
                        <InputComponent
                          value={email}
                          onChange={text => setEmail(text)}
                          icon={emailimageicon}
                          icontype="image"
                          placeholder="Enter your email"
                        />
                        <View
                          style={{
                            justifyContent: "center",
                            alignItems: "center"
                          }}
                        >
                          <SecondaryText
                            containerStyle={{
                              justifyContent: "center",
                              alignItems: "center",
                              marginBottom: 16,
                              alignSelf: "center"
                            }}
                            text={`Please verify your email address so you can sign in if you ever forget your password , we've sent confirmation email too
                    `}
                          />
                        </View>
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
                          onPress={() => handleSubmit(createUser)}
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

const REGISTER_MUTATION = gql`
  mutation($email: String!) {
    createUser(email: $email) {
      token
    }
  }
`;
