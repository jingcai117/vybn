import React, { Component, useState, useEffect } from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import {
  Text, 
  ScrollView, 
  Image, 
  ImageBackground, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Dimensions, 
  KeyboardAvoidingView,
  AsyncStorage
} from "react-native";
import { connect } from 'react-redux';
import * as Config from '../../config';

import * as actions from '../../redux/actions';
import HeaderRight from "../../assets/music/music_play_header_right.png";
import GoToIcon from "../../assets/music/gotoicon.png";
import InputBox from '../../components/InputBox';

function CommunityList(props) {
    const [community, setCommunity] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [visibleItem, setVisibleItem] = React.useState(-1);
    const [track, setTrack] = React.useState(null);

    useEffect(() => {
      setTrack(props.app.selectedTrack);
      console.log('CommunityList useEffect: ', props.app.selectedTrack );
    }, [props.app.selectedTrack]);

    const refresh = (i) => {
        visibleItem == i ? setVisibleItem(-1) : setVisibleItem(i);
    }

    const sendMessage = async (content, receiverId) => {
      console.log('CommunityList track: ', track);
        if(!track) {
          alert('Track is empty now');
          return;
        }
        if(track.MnetId == '' || !track.MnetId) {
            alert('Track is not available');
            return;
        }
        const token = await AsyncStorage.getItem("authtoken1");
        const message = {
          content: content,
          commentId: 0,
          token: token,
          trackId: track.MnetId,
          trackName: track.title,
          receiverId: receiverId
        };
    
        if(props.app.socket) {
          props.app.socket.emit('community', message);
        }
    }

    return (
      <View style={{ flexDirection: "column", marginTop: 20 }}>
        {props.community.map((item, i) => {
          return (
            <View 
              style={{
                borderBottomWidth: 1,
                borderBottomColor: '#000',
                paddingTop: 10
              }}
              key={i}
            >
              <View
                style={{
                  flexDirection: "row",
                  flex: 1,
                  alignItems: "center",
                  paddingBottom: 10
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      style={{ width: 50, borderRadius: 150 / 2, height: 50 }}
                      source={{ uri: `${Config.STATIC_URL}/${item.profilePic}` }}
                    />
                    <Text style={{ color: "#abaed0", marginLeft: 10 }}>
                      { item.firstName }
                    </Text>
                  </View>
  
                  {/* <TouchableOpacity
                    onPress={() => showModal(i)}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          borderRightWidth: 1,
                          borderRightColor: "#7473ff",
                          paddingRight: 10
                        }}
                      >
                        <Text style={{ color: "#abaed0", fontSize: 12 }}>
                          {comment.count} Replies
                        </Text>
                        <Image
                          style={{
                            marginLeft: 5
                          }}
                          source={DropDownIcon}
                        />
                      </View>                    
                  </TouchableOpacity> */}
                </View>
                <TouchableOpacity
                  onPress={() => refresh(i) }>
                  <Image style={{ marginLeft: 10 }} source={GoToIcon} />
                </TouchableOpacity>
              </View>
          
              {
                visibleItem == i ? 
                  <View style={{ marginLeft: 20, borderTopWidth: 0.5, borderTopColor: '#000', display: 'flex'}}>
                    <InputBox
                      send={ (content) => {
                        sendMessage(content, item.userId);
                        refresh(i);
                      }} />
                  </View> : null
              }
            </View>
          );
        })}
  {/* 
      <Modal
        isVisible={visible}
        onBackdropPress={() => setVisible(false)}
      >
        <View style={{ 
          flex: 1, 
          justifyContent: "center", 
          maxHeight: '60%',
          padding: 10 }}>
          <ImageBackground
              source={Background}
              style={{ flex: 1, height: null, width: null }}
              resizeMode="cover" >
            <View style={{ marginVertical: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: "#abaed0", marginLeft: 10, fontSize: 15 }}>Replies for "{ selectedComment }"</Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}>
                  <Image source={Close} style={{width: 30, height: 30, marginRight: 10}}/>
              </TouchableOpacity>
            </View>
  
            { replies.length == 0 ? 
              <Text style={{ color: "#abaed0", marginLeft: 15, fontSize: 12 }}>No replies</Text> : 
              <ScrollView>
                { replies.map((reply, i) => (
                  <View style={{ 
                    flexDirection: "row", 
                    alignItems: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: '#000',
                    padding: 5 }}
                    key={i}>
                    <Image
                      style={{ width: 50, borderRadius: 150 / 2, height: 50 }}
                      source={HeaderRight}
                    />
                    <Text style={{ color: "#abaed0", marginLeft: 10 }}>
                      { reply.content }
                    </Text>
                  </View>
                ))}                
              </ScrollView>            
            }
          </ImageBackground>
        </View>
      </Modal> */}
    </View>
    );  
  }

  const GET_COMMUNITY = gql`
  query($mNetId: String) {
    community(mNetId: $mNetId) {
      userId,
      email,
      firstName,
      profilePic
    }
  }
`

  export default connect(state => ({
  app: state.app
}), actions)(CommunityList);