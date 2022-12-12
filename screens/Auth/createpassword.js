import React, { Component, useState } from "react";
import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";
import { Grid, Row } from "native-base";
import LoadingModal from "../../components/Loading";
import Error from "../../components/Error";
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
import email from "../../assets/email.png";
import keyimage from "../../assets/passwordicon.png";
import ShowToast from "../../components/ShowToast";

export default function Login(props) {
  const [password, setPassword] = React.useState("");
  const [cpassword, setCpassword] = React.useState("");
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
  const handleSubmit = async createPassword => {
    if (password == "" || cpassword == "") {
      if (password == "") {
        ShowToast("Password cannot be empty");
        return;
      }
      if (cpassword == "") {
        ShowToast("Confirm Password cannot be empty");
        return;
      }
    }
    if (password != cpassword) {
      ShowToast("Password do not match");
    } else {
      const res = await createPassword();
      await AsyncStorage.setItem("authscreen", "false");
      await AsyncStorage.setItem("loggedIn", "true");
      //props.navigation.navigate("App");
      props.navigation.navigate("CreateChannel");
      console.log(res);
    }
  };
  return (
    <Mutation mutation={CREATE_PASSWORD} variables={{ password }}>
      {(createPassword, { loading, error, called, client }) => {
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
                        LET'S FINISH THIS
                      </Text>
                      <Image
                        source={keyimage}
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
                        text="CREATE YOUR PASSWORD"
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
                          secure
                          value={password}
                          onChange={text => setPassword(text)}
                          icon={keyimage}
                          icontype="image"
                          placeholder="Enter Password"
                        />

                        <InputComponent
                          secure
                          value={cpassword}
                          onChange={text => setCpassword(text)}
                          icon={keyimage}
                          icontype="image"
                          placeholder="Confirm Your password"
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
                          onPress={() => handleSubmit(createPassword)}
                          style={{ marginBottom: 8 }}
                          text="Start My Adventure"
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

const CREATE_PASSWORD = gql`
  mutation($password: String!) {
    createPassword(password: $password)
  }
`;
