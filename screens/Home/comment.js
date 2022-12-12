import React from "react";
import { Text, AsyncStorage, View, ScrollView, ImageBackground, Image, TouchableOpacity, TextInput, KeyboardAvoidingView } from "react-native";
import { gql } from "apollo-boost";
import { connect } from 'react-redux';
import { NavigationEvents } from "react-navigation";

import * as Config from '../../config';
import client from '../../graphql/client';
import * as actions from '../../redux/actions';
import InputBox from '../../components/InputBox';
import Background from "../../assets/music/background.png";
import HeaderLeft from "../../assets/music/musci_play_header_left.png";
import HeaderRight from "../../assets/music/music_play_header_right.png";
import HeaderMiddleBackground from "../../assets/music/music_play_header_middle_background.png";
import PlayButton from "../../assets/music/play_button.png";
import PlayButtonSide from "../../assets/music/play_button_side.png";
import LikeButton from "../../assets/music/play_button_like.png";
import DownloadButton from "../../assets/music/play_button_download.png";
import UpArrow from "../../assets/music/play_button_up_arrow.png";
import CancelButton from "../../assets/music/play_button_cancel.png";
import TrackNameBackground from "../../assets/music/track_name_background.png";
import TrackNameBottomShadow from "../../assets/music/track_name_bottom_shadow.png";
import TrackNameSide from "../../assets/music/track_name_side.png";
import DropDownIcon from "../../assets/music/dropdownicon.png";
import GoToIcon from "../../assets/music/gotoicon.png";
import SendIcon from "../../assets/send.png";

import HeadPlay from "../../components/HeadPlay";

class CommentScreen extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isReady: false,
      showhome: false,
      textToShow: "Comment",
      comments : [
        {
          name: "Jason Byfrost",
          commentTxt: "I love this song",
          replies: 151,
          comments: [
            {
              name: "Jason Byfrost",
              commentTxt: "Me too @Jason.",
              replies: 1
            },
            {
              name: "Jason Byfrost",
              commentTxt: "Me too @Jason.",
              replies: 2
            }
          ],
        },
        {
          name: "Thori Ghalel",
          commentTxt: "I love this song2",
          replies: 140,
          comments: []
        },
        {
          name: "Advert Ghanbell",
          commentTxt: "I love this song1",
          replies: 130,
          comments: []
        },
        {
          name: "Jason Byfrost",
          commentTxt: "I love this song",
          replies: 151,
          comments: [
            {
              name: "Jason Byfrost",
              commentTxt: "Me too @Jason.",
              replies: 1
            },
            {
              name: "Jason Byfrost",
              commentTxt: "Me too @Jason.",
              replies: 2
            }
          ],
        },
      ],
      visibleItem: -1
    };
  }

  componentDidMount() {
    if(this.props.app.socket) {
      this.props.app.socket.on('receive-message', message => {
        console.log('message: ', message);

        this.props.addMessage(message);
      });      
    }
  }

  // getComments = async () => {
  //   console.log('get comments: ')
  //   const { data, loading, networkStatus, stale } = await client.query({
  //     query: GET_CONVERSATIONS
  //   });

  //   console.log('conversations -------------->', data);
  //   this.props.setConversations(data.conversations);
  // }

  sendMessage = async (content, commentId) => {
    const token = await AsyncStorage.getItem("authtoken1");
    const message = {
      content: content,
      commentId: commentId,
      token: token
    };

    if(this.props.app.socket) {
      this.props.app.socket.emit('message', message);
    }
  }

  commentList = () => {
    const { visibleItem } = this.state;
    return (
      <View style={{ flexDirection: "column", marginTop: 20 }}>
        {this.props.app.conversations.map((item, i) => {
          return (
            <View key={i}>
              <View
                style={{
                  flexDirection: "row",
                  flex: 1,
                  padding: 10,
                  alignItems: "center",
                  borderBottomWidth: 1,
                  borderBottomColor: "#000"
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
                      style={{ width: 40, borderRadius: 150 / 2, height: 40 }}
                      source={{uri: `${Config.STATIC_URL}/${item.profilePic}`}}
                    />
                    <View>
                        <Text style={{ color: "#abaed0", marginLeft: 10, marginBottom: 2 }}>{item.trackName}</Text>
                        <Text style={{ color: "white", marginLeft: 10, fontSize: 10 }}>{item.comment}</Text>
                    </View>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      // borderRightWidth: 1,
                      // borderRightColor: "#7473ff",
                      paddingRight: 10
                    }}
                  >
                    {/* <Text style={{ color: "#abaed0", fontSize: 12 }}>
                      {item.count} Replies
                    </Text>
                    <Image
                      style={{
                        marginLeft: 5
                      }}
                      source={DropDownIcon}
                    /> */}
                  </View>
                </View>

                {/* <TouchableOpacity
                  onPress={() => this.showInputBox(i)}>
                  <Image style={{ marginLeft: 10 }} source={GoToIcon} />                    
                </TouchableOpacity> */}
              </View>

              { visibleItem == i ? 
                  <View style={{ marginLeft: 20, borderTopWidth: 0.5, borderTopColor: '#000', display: 'flex'}}>
                    <InputBox 
                      send={(content) => {
                        const originalUserId = 2;
                        const userId = 1;
                        const commentId = 1;
                        const direction = 0;

                        this.sendMessage(content);
                      }} />
                  </View> : null 
              }

              <DCommentList conversations={item.conversation} mine={item.mine} sendMessage={this.sendMessage} profilePic={item.profilePic} />
            </View>
          );
        })}
      </View>
    );
  }

  render() {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior='height'>
        <ImageBackground
            source={Background}
            style={{
              flex: 1,
              height: null,
              width: null
            }}
            resizeMode="cover" >
            <View style={{ margin: 15, flex: 1 }}>
                <HeadPlay
                  style={{flex: 1}}
                  navigation={this.props.navigation}
                />
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} >
                    <View>
                        {this.commentList()}
                    </View>
                </ScrollView>
                <View>
                    <View
                      style={{
                        alignItems: "center",
                        borderBottomWidth: 1,
                        borderBottomColor: "#000",
                        marginBottom: 30
                      }}
                    >
                        <Image source={TrackNameSide} style={{marginBottom: 5, width: 20, height: 20}} />
                    </View>
                </View>
            </View>
          </ImageBackground>
      </KeyboardAvoidingView>
    );
  }
}

function DCommentList(props) {
  const [visibleItem, setVisibleItem] = React.useState(-1);
  const showInputBox = (i) => {
    visibleItem == i ? setVisibleItem(-1) : setVisibleItem(i);
  }

  return (
    <View style={{ flexDirection: "column" }}>
      { props.conversations && props.conversations.map((item, i) => {
        return (
          <View key={i}>
            {item.content == null ? null : 
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    flex: 1,
                    padding: 10,
                    alignItems: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: "#000"
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
                      <View style={
                        item.sender == props.mine ? { 
                        width: 15, 
                        height: 1, 
                        backgroundColor: '#7473ff', 
                        marginLeft: 10, 
                        marginRight: 10 } :
                        { 
                          width: 15, 
                          height: 1, 
                          backgroundColor: '#0055ff', 
                          marginLeft: 10, 
                          marginRight: 10 } } />
                      <Image
                        style={{ width: 35, borderRadius: 105 / 2, height: 35 }}
                        source={item.senderProfilePic ? {uri: `${Config.STATIC_URL}/${item.senderProfilePic}`} :
                                {uri: `${Config.STATIC_URL}/${props.profilePic}`}}
                      />
                      <View style={{marginLeft: 10}}>
                          <Text style={{ color: "#abaed0", marginBottom: 2, fontSize: 10 }}>{item.email}</Text>
                          <Text style={{ color: "white", fontSize: 10 }}>{item.content}</Text>
                      </View>
                    </View>
                    {/* <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        borderRightWidth: 1,
                        borderRightColor: "#7473ff",
                        paddingRight: 10
                      }}
                    >
                      <Text style={{ color: "#abaed0", fontSize: 10 }}>{item.replies} Replies</Text>
                      <Image
                        style={{
                          marginLeft: 5
                        }}
                        source={DropDownIcon}
                      />
                    </View> */}
                  </View>
                  
                  { item.sender != props.mine? 
                    <TouchableOpacity
                      onPress={() => showInputBox(i)}>
                      <Image style={{ marginLeft: 10, width: 15, height: 15 }} source={GoToIcon} />
                    </TouchableOpacity> : null
                  }
                </View>

                { visibleItem == i ? 
                  <View style={{ marginLeft: 50, borderTopWidth: 0.5, borderTopColor: '#000', display: 'flex'}}>
                    <InputBox 
                      send={(content) => {
                        const originalUserId = 2;
                        const userId = 1;
                        const commentId = 1;
                        const direction = 0;
                        showInputBox(i);
                        props.sendMessage(content, item.commentId);
                      }} />
                  </View> : null 
                }               
              </View>
      
            }

          </View>
        );
      })}
    </View>
  );
}


const GET_CONVERSATIONS = gql`
  query {
    conversations {
      comment,
      commentId,
      mine,
      conversation {
        content 
        sender, 
        commentId,
        originalComment,
        originalUserId,
        userId,
        email
      }
    }
  }
`;

const GET_MY_COMMENTS = gql`
  query($userId: Int!) {
    myComments(userId: $userId) {
        id,
        content,
        userId,
        replies {
          content,
          userId,
          commentId
        },
        count
    }
  }
`;

export default connect(state => ({
  app: state.app
}), actions)(CommentScreen);