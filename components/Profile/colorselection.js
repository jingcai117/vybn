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
import { Ionicons } from "@expo/vector-icons";

import { Spinner } from "native-base";
import Color1 from "../../assets/color1.png";
import Color2 from "../../assets/color2.png";
import Color3 from "../../assets/color3.png";
import Color4 from "../../assets/color4.png";
import Color5 from "../../assets/color5.png";
import Color6 from "../../assets/color6.png";
import Color7 from "../../assets/color7.png";
import Color8 from "../../assets/color8.png";
import Color9 from "../../assets/color9.png";
import Color10 from "../../assets/color10.png";
import Color11 from "../../assets/color11.png";
import Color12 from "../../assets/color12.png";
import Color13 from "../../assets/color13.png";
import Color14 from "../../assets/color14.png";
import Color15 from "../../assets/color15.png";
import Color16 from "../../assets/color16.png";
import CheckMark from "../../assets/checkmark.png";
import EmptyBoxCheckMark from "../../assets/emptyboxcheckmark.png";

export default function Freepremium(props) {
  return (
    <View style={{ ...styles.mainContainer, ...props.style }}>
      <View style={styles.rowContainer}>
        <SingleItem color={Color1} />
        <SingleItem color={Color2} />
        <SingleItem color={Color3} />
        <SingleItem color={Color4} />
        <SingleItem color={Color5} />
        <SingleItem color={Color6} />
        <SingleItem color={Color7} />
        <SingleItem color={Color8} />
      </View>
      <View style={styles.rowContainer}>
        <SingleItem color={Color9} />
        <SingleItem color={Color10} />
        <SingleItem color={Color11} />
        <SingleItem color={Color12} />
        <SingleItem color={Color13} />
        <SingleItem color={Color14} />
        <SingleItem color={Color15} />
        <SingleItem color={Color16} />
      </View>
      <View style={styles.rowContainer}>
        <EmptyBox
          index={1}
          handleColorSelection={props.handleColorSelection}
          checked={props.selected == 1 ? true : false}
        />
        <EmptyBox
          index={2}
          handleColorSelection={props.handleColorSelection}
          checked={props.selected == 2 ? true : false}
        />
        <EmptyBox
          index={3}
          handleColorSelection={props.handleColorSelection}
          checked={props.selected == 3 ? true : false}
        />
        <EmptyBox
          handleColorSelection={props.handleColorSelection}
          index={4}
          checked={props.selected == 4 ? true : false}
        />
        <EmptyBox
          index={5}
          handleColorSelection={props.handleColorSelection}
          checked={props.selected == 5 ? true : false}
        />
        <EmptyBox
          index={6}
          handleColorSelection={props.handleColorSelection}
          checked={props.selected == 6 ? true : false}
        />
        <EmptyBox
          index={7}
          handleColorSelection={props.handleColorSelection}
          checked={props.selected == 7 ? true : false}
        />
        <EmptyBox
          index={8}
          handleColorSelection={props.handleColorSelection}
          checked={props.selected == 8 ? true : false}
        />
      </View>
    </View>
  );
}

function SingleItem(props) {
  return (
    <View style={styles.singleItem}>
      <ImageBackground
        imageStyle={{ borderRadius: 5 }}
        source={props.color}
        style={styles.imagecontainer}
      ></ImageBackground>
    </View>
  );
}

function EmptyBox(props) {
  return (
    <TouchableOpacity onPress={() => props.handleColorSelection(props.index)}>
      <View style={styles.singleItem}>
        <ImageBackground
          imageStyle={{ borderRadius: 5 }}
          source={EmptyBoxCheckMark}
          style={styles.imagecontainer}
        >
          {props.checked ? (
            <View style={{ margin: 5, flex: 1 }}>
              <Image source={CheckMark} style={styles.image} />
            </View>
          ) : null}
        </ImageBackground>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    borderRadius: 5,
    flexDirection: "column"
  },
  rowContainer: {
    flex: 1,
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  singleItem: {
    width: 25,
    height: 30
  },
  imagecontainer: {
    width: "100%",
    height: "100%",
    flex: 1
  },
  image: {
    width: "100%",
    height: "100%",
    flex: 1
  },
  viewContainer: {
    flex: 1,
    flexDirection: "row"
  },
  textContainer: {
    flex: 1,
    padding: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    color: "#fff"
  }
});
