import React, { Component, useState } from "react";
import {
  KeyboardAvoidingView, Platform, Keyboard, ScrollView, Dimensions, View, Text, ImageBackground, Image, StyleSheet, TouchableHighlight, AsyncStorage, Animated, TouchableOpacity
} from "react-native";
import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";
import { Grid, Row, Toast } from "native-base";
import Error from "../../components/Error";
import { AuthText, Dash, InputComponent, SecondaryText, ButtonComponent, ButtonWithIcon } from "../../components/Form";
import { GoogleAuth, FacebookAuth } from "../../components/SocialAuth";
import background from "../../assets/background5.png";
import logo from "../../assets/iconnew.png";
import keyimage from "../../assets/passwordicon.png";
import emailimage from "../../assets/emailicon.png";
import ShowToast from "../../components/ShowToast";
import LoadingModal from "../../components/Loading";
import ButtonBack from "../../assets/buttonback.png";

export default function Login(props) {
    let dimension = Dimensions.get("window").height / 2;
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [keyboardshow, setKeyboardshow] = React.useState(false);
    const [marginTop] = useState(
      new Animated.Value(dimension - 75)
    );

    let keyboardShowListener, keyboardHideListener;
    React.useEffect(() => {
      keyboardShowListener = Keyboard.addListener("keyboardDidShow", () =>
        setKeyboardshow(true)
      );
      keyboardHideListener = Keyboard.addListener("keyboardDidHide", () =>
        setKeyboardshow(false)
      );

      Animated.timing(marginTop, {
        toValue: 0,
        duration: 1000
      }).start(); // start the sequence group

      return () => {
        keyboardShowListener.remove();
        keyboardHideListener.remove();
      };
    }, []);
    const handleSubmit = async tokenAuth => {
      if (email == "" || password == "") {
        if (email == "") {
          ShowToast("Email is required");
          return;
        }

        if (password == "") {
          ShowToast("Password id required");
        }
      } else {
        const res = await tokenAuth({ variables: { email, password, authtype: "normal" } });

        await AsyncStorage.setItem("authtoken1", res.data.login.token);
        await AsyncStorage.setItem("loggedIn", "true");
        props.navigation.navigate("App");
        console.log(res);
      }
    };
    const handleGoogleLogin = async (tokenAuth, user) => {
      console.log("user");
      console.log(user);
      console.log(user.email);

      const res = await tokenAuth({
        variables: {
          email: user.email,
          authtype: "google"
        }
      });

      await AsyncStorage.setItem("authtoken1", res.data.login.token);
      await AsyncStorage.setItem("loggedIn", "true");
      props.navigation.navigate("App");
      console.log(res);
    };
    const handleFacebookLogin = async (tokenAuth, user) => {
      console.log(user);
      let res;
      if (user.email) {
        res = await tokenAuth({
          variables: {
            email: user.email,
            authtype: "facebook"
          }
        });
      } else {
        res = await tokenAuth({
          variables: {
            email: user.name,
            authtype: "facebook"
          }
        });
      }

      await AsyncStorage.setItem("authtoken1", res.data.login.token);
      await AsyncStorage.setItem("loggedIn", "true");
      props.navigation.navigate("App");
      console.log(res);
    };

    const sWidth = Dimensions.get("window").width;
    const sHeight = Dimensions.get("window").height;
    const logoSize = Math.floor(sWidth * 0.56);
    const fMarginTop = Math.floor(sHeight * 0.27 - logoSize / 2);
    let buttonGroupHeight = sHeight - fMarginTop - logoSize - 280;
    buttonGroupHeight = buttonGroupHeight > 84 ? buttonGroupHeight : 84;

    return (
      <Mutation mutation={LOGIN_MUTATION}>
        {(tokenAuth, { loading, error }) => {
          if (loading) {
            console.debug("loading");
          }
          if (error) {
            console.debug(error);
          }
          return (
            <Grid>
              {loading && <LoadingModal />}
              {error && <Error message={error.message} />}
              <Row>
                <ImageBackground
                  source={background}
                  style={{
                    flex: 1,
                    height: null,
                    width: null
                  }}
                  resizeMode="stretch"
                >
                  <ScrollView style={{ flex: 1 }}>
                    <Row size={keyboardshow ? 40 : 70}>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "column"
                        }}
                      >
                        <Animated.View style={{ marginTop: marginTop }}>
                          <View style={{ flex: 4, alignItems: "center" }}>
                            <Image
                              source={logo}
                              style={{
                                ...styles.logo,
                                width: logoSize,
                                height: logoSize,
                                marginTop: keyboardshow ? 25 : fMarginTop
                              }}
                            />
                          </View>
                          <AuthText
                            text="LOGIN"
                            style={{
                              marginTop: keyboardshow ? 25 : 45,
                              textAlign: "center"
                            }}
                          />
                          <Dash style={{
                            marginTop: keyboardshow ? 15 : 25,
                            marginBottom: keyboardshow ? 10 : 20
                          }}/>
                        </Animated.View>
                      </View>
                    </Row>

                    <Row>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: "column",
                          alignItems: "center"
                        }}
                      >
                        <View style={{ width: 300 }}>
                          <InputComponent
                            value={email}
                            onChange={text => setEmail(text)}
                            icon={emailimage}
                            icontype="image"
                            placeholder="Enter your email" />

                          <InputComponent
                            secure
                            value={password}
                            onChange={text => setPassword(text)}
                            icon={keyimage}
                            icontype="image"
                            placeholder="Password" />

                          <TouchableHighlight
                            onPress={() =>
                              props.navigation.navigate("ForgetPassword")
                            }>
                            <SecondaryText
                              containerStyle={{
                                justifyContent: "flex-end",
                                alignItems: "flex-end",
                                marginBottom: 16
                              }}
                              text="Forgot Password?"
                            />
                          </TouchableHighlight>
                          <View style={{
                            justifyContent: "flex-end",
                            marginBottom: 24,
                            height: keyboardshow ? 84 : buttonGroupHeight
                          }}>
                            <TouchableOpacity
                              loading={loading}
                              onPress={() => handleSubmit(tokenAuth, "normal")}
                              style={{ width: "100%", height: 38, marginBottom: 8 }}
                            >
                              <ImageBackground
                                source={ButtonBack}
                                imageStyle={{ borderRadius: 5 }}
                                resizeMode="stretch"
                                style={{ width: "100%", height: "100%", borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
                                  <Text style={{ color: '#ABAED0' }}>Login</Text>
                              </ImageBackground>
                            </TouchableOpacity>
                            <View style={{ flexDirection: "row", height: 38 }}>
                              <TouchableOpacity
                                loading={loading}
                                onPress={() =>
                                  props.navigation.navigate("Register")
                                }
                                style={{ flex: 1, marginRight: 5 }} >
                                    <ImageBackground
                                      source={ButtonBack}
                                      imageStyle={{ borderRadius: 5 }}
                                      style={{ width: "100%", height: "100%", flex: 1, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: '#d950c7' }}>Sign Up</Text>
                                    </ImageBackground>
                              </TouchableOpacity>
                              <TouchableOpacity
                                loading={loading}
                                onPress={async () => {
                                  await AsyncStorage.setItem("loggedIn", "tempuser");
                                  props.navigation.navigate("Guest");
                                }}
                                style={{ flex: 1}} >
                                    <ImageBackground
                                      source={ButtonBack}
                                      imageStyle={{ borderRadius: 5 }}
                                      style={{ width: "100%", flex: 1, borderRadius: 5, alignItems: 'center', justifyContent: 'center' }}
                                    >
                                        <View style={{ flexDirection: 'row', paddingTop: 10, paddingBottom: 10, }}>
                                            <Text style={ styles.buttontext, { color: '#abaed0' }}>Listen as </Text>
                                            <Text style={ styles.buttontext, { color: '#d950c7' }}>Guest</Text>
                                        </View>
                                    </ImageBackground>
                              </TouchableOpacity>
                            </View>
                          </View>
                          {/*<View style={{ flexDirection: "row" }}>
                            <GoogleAuth
                              style={{ paddingRight: 5 }}
                              success={user =>
                                handleGoogleLogin(tokenAuth, user)
                              }
                            />
                            <FacebookAuth
                              style={{ paddingLeft: 5 }}
                              success={user =>
                                handleFacebookLogin(tokenAuth, user)
                              }
                            />
                          </View>
                          <View style={{ marginTop: 8 }}>
                            <Dash />
                          </View>
                          <View
                            style={{
                              justifyContent: "center",
                              flexDirection: "row"
                            }}
                          >
                            <Text
                              style={{
                                color: "#abaed0",
                                fontFamily: "Droidsans",
                                fontSize: 13,
                                fontWeight: "400",
                                lineHeight: 20,
                                marginRight: 5
                              }}
                            >
                              Don't have an account?
                            </Text>
                            <TouchableHighlight
                              onPress={() =>
                                props.navigation.navigate("Register")
                              }
                            >
                              <Text
                                style={{
                                  // Style for "Sign up"
                                  color: "#4c4cda",
                                  fontFamily: "Droidsans",
                                  fontSize: 13,
                                  fontWeight: "400",
                                  lineHeight: 20
                                }}
                              >
                                Sign Up
                              </Text>
                            </TouchableHighlight>
                          </View>

                          <View
                            style={{
                              justifyContent: "center",
                              flexDirection: "row"
                            }}
                          >
                            <Text
                              style={{
                                color: "#abaed0",
                                fontFamily: "Droidsans",
                                fontSize: 13,
                                fontWeight: "400",
                                lineHeight: 20,
                                marginRight: 5
                              }}
                            >
                              Listen as
                            </Text>
                            <TouchableHighlight
                              onPress={async () => {
                                await AsyncStorage.setItem("tempuser", "true");
                                props.navigation.navigate("App");
                              }}
                            >
                              <Text
                                style={{
                                  // Style for "Sign up"

                                  color: "#4c4cda",
                                  fontFamily: "Droidsans",
                                  fontSize: 13,
                                  fontWeight: "400",
                                  lineHeight: 20
                                }}
                              >
                                Guest
                              </Text>
                            </TouchableHighlight>
                          </View>*/}
                        </View>
                      </View>
                    </Row>

                    {keyboardshow ? <Row size={30} /> : null}
                  </ScrollView>
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
    width: 160,
    height: 160,
    shadowColor: "rgba(0, 0, 0, 0.75)",
    shadowOffset: { width: 1, height: 0 },
    shadowRadius: 2
  },
  buttontext: {
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 0 },
    textShadowRadius: 2,
    fontFamily: "Droidsans",
    fontSize: 16,
    fontWeight: "400"
  },
});

const LOGIN_MUTATION = gql`
  mutation($email: String, $password: String, $authtype: String!) {
    login(email: $email, password: $password, authtype: $authtype) {
      token
      redirectTo
    }
  }
`;