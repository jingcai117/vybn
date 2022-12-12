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

import StationCoverBack from "../../assets/stationcoverback.png";
import StationCover from "../../assets/stationcover.png";
import EarIcon from "../../assets/ear1.png";
import StationIconBack from "../../assets/stationiconback.png";
import DeleteIcon from "../../assets/delete.png";
import VarietyIcon from "../../assets/variety.png";
import { Spinner } from "native-base";
import YesNoBackground from "../../assets/yesnoback.png";
import NoButton from "../../assets/nobutton.png";
import Editcontainer from "../../assets/editcontainer.png";
import Editicon from "../../assets/editaccount.png";
import Iconbackgroundcontainer from "../../assets/iconbackgroundcontaineredit.png";

export default function EditIcon(props) {
  return (
    <View>
      <View style={{ width: 30, height: 30 }}>
        <ImageBackground
          source={Editcontainer}
          style={{ width: "100%", height: "100%", flex: 1 }}
        >
          <View style={{ flex: 1, margin: 3 }}>
            <ImageBackground
              source={Iconbackgroundcontainer}
              style={{ width: "100%", height: "100%", flex: 1 }}
            >
              <View style={{ width: "80%", height: "80%" }}>
                <View
                  style={{
                    flex: 1,
                    justifyCcntent: "center",
                    alignItems: "center"
                  }}
                >
                  <ImageBackground
                    source={Editicon}
                    style={{ width: "100%", height: "100%", flex: 1 }}
                    imageStyle={{ marginLeft: 5, marginTop: 1 }}
                  ></ImageBackground>
                </View>
              </View>
            </ImageBackground>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}
