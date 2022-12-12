import React from 'react';
import { ButtonWithIcon } from "./Form";
import * as Google from "expo-google-app-auth";
import Error from "./Error";
import * as GoogleSignIn from "expo-google-sign-in";
import * as Facebook from "expo-facebook";
import * as Sentry from "sentry-expo";
//import {AppAuth} from 'expo-app-auth'
import { Text, Platform } from "react-native";

export function GoogleAuth(props) {
  const login = async () => {
    /*  try {
      const { type, accessToken, user } = await Google.logInAsync({
        iosClientId: `88854144757-21t4v5pr5qliqmnl5ramq4lj882g5ndh.apps.googleusercontent.com`,
        androidClientId: `88854144757-l3245b814tk0ulg2trcmf5a8p4mji9jo.apps.googleusercontent.com`,
        androidStandaloneAppClientId: `88854144757-b5q5ats0f1gifd8fkvqmthml85f3h8sm.apps.googleusercontent.com`,
        iosStandaloneAppClientId: `88854144757-2gafpjtmjc978kslrbfsl8rh12l1md3n.apps.googleusercontent.com`,
//	behavior: 'web',
//  	redirectUrl: `${AppAuth.OAuthRedirect}:/oauthredirect`
      });

      if (type === "success") {
        console.log(user);
        props.success(user);
      } else {
        alert("An error occured");
      }
    } catch (err) {
console.log(err)
      alert("AN error occured");
    } */

    const clientId = Platform.select({
      android:
        "83341535163-qjbuoujulb810igo90utamhamlfu0bib.apps.googleusercontent.com",
      ios:
        "83341535163-prftudl10n26qateb1iusu4ee5l9vs7p.apps.googleusercontent.com"
    });
    try {
      await GoogleSignIn.initAsync({
        isPromptEnabled: true,
        clientId
      });
      await GoogleSignIn.askForPlayServicesAsync();
      const { type, user } = await GoogleSignIn.signInAsync();
      console.log({ type, user });
      if (type === "success") {
        console.log(user);
        props.success(user);
      }
    } catch ({ message }) {
      alert("GoogleSignIn.initAsync(): " + message);
    }
  };
  return (
    <>
      <ButtonWithIcon
        style={props.style}
        onPress={() => login()}
        icon="logo-google"
        text="Google"
      />
    </>
  );
}

export function FacebookAuth(props) {
  const logIn = async () => {
    try {
      const {
        type,
        token,
        expires,
        permissions,
        declinedPermissions
      } = await Facebook.logInWithReadPermissionsAsync("470512560158618", {
        permissions: ["public_profile"]
      });
      if (type === "success") {
        // Get the user's name using Facebook's Graph API
        const response = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email&access_token=${token}`
        );
        let res = await response.json();
        props.success(res);
      } else {
        // type === 'cancel'
      }
    } catch ({ message }) {
      console.log(message);
      alert(`Facebook Login Error: ${message}`);
    }
  };
  return (
    <ButtonWithIcon
      onPress={() => logIn()}
      icon="logo-facebook"
      text="Facebook"
      style={{ flex: 1, ...props.style }}
    />
  );
}
