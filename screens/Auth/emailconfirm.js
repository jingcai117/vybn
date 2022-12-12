import React, { Component, useState } from "react";
import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";
import { Grid, Row } from "native-base";
import LoadingModal from "../../components/Loading";
import { View, Text, ImageBackground, Image, StyleSheet } from "react-native";
import {
  AuthText,
  Dash,
  SecondaryText,
  ButtonComponent,
  ButtonWithoutScroll
} from "../../components/Form";
import background from "../../assets/background5.png";
//import logo from "../../assets/logo.png";
import side from "../../assets/side3.png";
import emailconfirm from "../../assets/emailconfirm.png";
import emailimageicon from "../../assets/emailicon.png";

export default function Login(props) {
  return (
    <Grid>
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
          <Row size={60}>
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
                    marginTop: 20
                  }}
                >
                  JUST A MORE STEP
                </Text>
                <View>
                  <Image
                    source={emailconfirm}
                    style={{
                      // Style for "Mail copy"
                      width: 140,
                      height: 170,
                      marginBottom: 20
                    }}
                  />
                </View>
              </View>
              <View style={{ flex: 1, justifyContent: "space-between" }}>
                <AuthText
                  text="CONGRATULATIONS"
                  style={{ marginTop: 16, textAlign: "center" }}
                />
                <View style={{ marginBottom: 20 }}>
                  <Dash />
                </View>
              </View>
            </View>
          </Row>

          <Row size={50}>
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
                  <SecondaryText
                    containerStyle={{
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 16
                    }}
                    text={`Your account has been successfully registered. To complete your request please check your email for a validation request
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
                    onPress={() => props.navigation.navigate("OtpConfirm")}
                    style={{ marginBottom: 8 }}
                    text="Next"
                  />
                </View>
              </View>
            </View>
          </Row>
        </ImageBackground>
      </Row>
    </Grid>
  );
}

const LOGIN_MUTATION = gql`
  mutation($username: String!, $password: String!) {
    customLogin(username: $username, password: $password) {
      token
      user {
        profileSet {
          is2fa
        }
      }
    }
  }
`;

// Style for "Asset 2"
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
