import React, { Component, useEffect } from 'react';
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
  AsyncStorage,
  Switch
} from "react-native";
import { gql } from "apollo-boost";
import { Audio } from 'expo-av';
import { connect } from 'react-redux';
import Modal from "react-native-modal";
import { useMutation } from "@apollo/react-hooks";
import { Mutation } from "react-apollo";
import io from 'socket.io-client';
import { GET_CHANNEL, MY_CHANNELS } from '../../graphql/queries';

import * as Config from '../../config';
import Background from "../../assets/music/background.png";
import HeaderRight from "../../assets/music/music_play_header_right.png";
import TrackSliderBackground from "../../assets/music/tracks_slider_background.png";
import AddButton from "../../assets/music/add_button.png";
import HeadphoneCommunityBackground from "../../assets/music/headphonecommunitybackground.png";
import DropDownIcon from "../../assets/music/dropdownicon.png";
import GoToIcon from "../../assets/music/gotoicon.png";
import StationCoverBack from "../../assets/stationcoverback.png";
import HeadphoneActive from "../../assets/music/headphone_active.png";
import BroadcastActive from "../../assets/music/broadcast_active.png";
import CommunityActive from "../../assets/music/community_active.png";
import HeadphoneInActive from "../../assets/music/headphone_inactive.png";
import BroadcastInActive from "../../assets/music/broadcast_inactive.png";
import CommunityInActive from "../../assets/music/community_inactive.png";
import Close from '../../assets/close.png';
import HeadPlay from "../../components/HeadPlay";
import client from "../../graphql/client";
import * as actions from '../../redux/actions';
import { PlayQueue } from '../../utils/utils';
import Error from '../../components/Error';
import InputBox from '../../components/InputBox';
import CommunityList from './CommunityList';
import Loading from '../../components/Loading';
import UserInactivityCheck from '../../components/UserInactivityCheck';

const trackId = 2;
const LIMITATION = 4 * 60 * 1000;
const COMMENT_DISABLED_LABELS = [3, 18, 31];

class Music extends Component {

    constructor(props) {
      super(props);

      this.state = {
        comments: [],
        community: [],
        buttonState: 'headphone',
        errorMessage: '',
        keyboardVisible: true,
        loggedIn: "",
        loadingChannels: false,
        isBroadcast: false
      }

      // this.refreshTracksSliderPosition = this.refreshTracksSliderPosition.bind(this);
      this.initPlayer = this.initPlayer.bind(this);
      this.getMyChannels = this.getMyChannels.bind(this);
      // this.tracksSlider = this.tracksSlider.bind(this);
      this.stationListView = this.stationListView.bind(this);
      // this.selectTrack = this.selectTrack.bind(this);
      this.selectChannel = this.selectChannel.bind(this);
      this.currentTrackShow = this.currentTrackShow.bind(this);
      console.disableYellowBox = true;
      this._unsubscribeFocus = null;
    }

    UNSAFE_componentWillMount() {
      this.socket = io(Config.SOCKET_URL);
      this.props.setSocket(this.socket);
    }

    async componentDidMount() {
      this.initPlayer();
      const loggedIn = await AsyncStorage.getItem("loggedIn");
      this.setState({ loggedIn });
      await this.getMyChannels();

      // this._unsubscribeFocus = this.props.navigation.addListener('willFocus', () => {
      //   this.refreshTracksSliderPosition(this.props.state.selectedTrackIndex);
      // });
      if (!this.props.state.profile) {
        try {
          const { data } = await client.query({
              query: GET_PROFILE,
          });
          this.props.saveProfile(data.profile);
        } catch (e) {
          console.log(e);
        }
      }
    }

    UNSAFE_componentWillReceiveProps(newProps) {
      // console.log('music.js component will receive new props');
      if (this.props.state.selectedTrack != newProps.state.selectedTrack) {
          this.getComments(newProps.state.selectedTrack);
          this.getCommunity(newProps.state.selectedTrack);
      }
      if (this.props.state.selectedChannel != newProps.state.selectedChannel) {
        if (
          newProps.state.selectedChannel
          && this.state.isBroadcast != newProps.state.selectedChannel.broadcast
        ) {
          this.setState({
            isBroadcast: newProps.state.selectedChannel.broadcast
          });
        }
      }
    }

    UNSAFE_componentWillUnmount() {
      // console.log('component will umount');
      this.socket.close();
      this.props.setSocket(null);
      // if (this._unsubscribeFocus && this._unsubscribeFocus.remove instanceof Function) {
      //   this._unsubscribeFocus.remove();
      // }
    }

    initPlayer() {
      if (!this.props.state.soundObject) {
        const soundObject = new Audio.Sound();

        Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        });

        soundObject.setOnPlaybackStatusUpdate(async (status) => {
          // console.log('init player status: ', status);
          // if(status.isLoaded && this.props.state.selectedUri != status.uri) {
          //   this.props.setUri(status.uri);
          //   if(!this.props.state.playAd)
          //     this.props.setDuration(status.durationMillis + this.props.state.duration);
          // }

          if (status.didJustFinish) {
            // console.log("********** The current song has just been finished. About to play the next song **********");
            // if(this.props.state.duration >= LIMITATION) {
            //   this.props.playAd(true);
            //   this.props.setDuration(0);
            // }else {
            //   this.props.playAd(false);
            // }

            // this.selectTrack(this.props.state.selectedTrackIndex + 1);
            if (this.props.state.playQueue) {
              const nextTrack = await this.props.state.playQueue.getNextTrack();
              this.props.saveSelectedTrackIndex(this.props.saveSelectedTrackIndex + 1);
              this.props.saveSelectedTrack(nextTrack);
            } else {
              this.props.saveSelectedTrackIndex(0);
              this.props.saveSelectedTrack(null);
            }
          } else if (status.isLoaded && this.props.state.updateTrackerWidth && this.props.state.playstate) {
            const tWidth = Math.round(98 * status.positionMillis / status.durationMillis);
            if (this.props.state.timeTrackerWidth != tWidth) {
              this.props.saveTimeTrackerWidth(tWidth);
            } 
          }
        });

        this.props.saveSoundObject(soundObject);
      }
    }

    getComments = async (track) => {
      // console.log('getComments ----------------> ', track);

      if(!track || !track.MnetId || track.MnetId == '') return;
      // console.log('getComments //////////////////', track.MnetId);

      try {
        const { data } = await client.query({
          query: GET_COMMENTS,
          variables: { mNetId: track.MnetId }
        });

        this.props.setComments(data.comments);        
      }catch(error) {
        console.log('getComments error: ', error);
      }
    }

    getCommunity = async (track) => {
      if(!track || !track.MnetId) {
        return;
      }

      try {
        const { data } = await client.query({
            query: GET_COMMUNITY,
            variables: { mNetId: track.MnetId }
        });

        // console.log('getCommunity: ', data);
        this.setState({ community: data.community });
      } catch(error) {
        console.log('getCommunity error: ', error);
      }
    }

    async getMyChannels() {
      const { loggedIn } = this.state;
      this.setState({
        loadingChannels: true
      });
      if ( loggedIn == "true" ) {
      // if ( loggedIn ) {
        try {
          const { data } = await client.query({
              query: MY_CHANNELS
          });

          this.props.saveMyChannels(data.mychannels);
          if ( data.mychannels.length > 0 ) {
            await this.selectChannel(0);
          } else {
            this.props.navigation.navigate("CreateChannel");
          }
        } catch (error) {
          if (error.message.replace("GraphQL error:", "").trim().substr(0, 8) == "Login to") {
            await AsyncStorage.removeItem("authtoken1");
            await AsyncStorage.removeItem("loggedIn");
            this.props.saveProfile(null);
            this.props.navigation.navigate("Auth");
          }
        }
      }
      this.setState({
        loadingChannels: false
      });
    }

    // selectTrack(index) {
    //   let selectedTracks = this.props.state.playQueue.queue;
    //   if (index == selectedTracks.length - 1) {
    //     const playQueue = this.props.state.playQueue;
    //     playQueue.getMore();
    //     this.props.savePlayQueue(playQueue);
    //   }
    //   this.props.saveSelectedTrackIndex(index);
    //   this.props.saveSelectedTrack(selectedTracks[index]);
    //   this.refreshTracksSliderPosition(index);
    // }

    async selectChannel(index) {
      const channelArr = this.props.state.myChannels;
      this.setState({
        loadingChannels: true
      });
      const id = channelArr[index].id;
      try {
        const { data } = await client.query({
            query: GET_CHANNEL,
            variables: {
              id
            }
        });
        
        const myChannels = channelArr.map(channel => {
          return channel.id == id ? data.getChannel : channel;
        });
        
        this.props.saveMyChannels(myChannels);
        this.props.saveSelectedChannelIndex(index);

        const playQueue = new PlayQueue(data.getChannel);
        this.props.savePlayQueue(playQueue);
        this.props.saveSelectedChannel(data.getChannel);
        const nextTrack = await playQueue.getNextTrack();
        this.props.saveSelectedTrackIndex(0);
        this.props.saveSelectedTrack(nextTrack);
      } catch (error) {
        console.log('Error in get channel: ', error.message);
      }
      this.setState({
        loadingChannels: false
      });
    }

    // refreshTracksSliderPosition(index) {
    //   let deviceWidth = (Dimensions.get('window').width- 230)/2;
    //   if (this.tracksSlider_Ref) {
    //     this.tracksSlider_Ref.scrollTo({ animated: true, x:index*214-deviceWidth, y: 0 });
    //   }
    // }

    // tracksSlider (selectedTrack) {
    //     const prop = this;
    //     return (
    //         <SafeAreaView>
    //             <ScrollView horizontal scrollEnabled={false}
    //                 ref={ref => {
    //                   this.tracksSlider_Ref = ref;  // <------ ADD Ref for the Flatlist
    //                 }} >
    //                 {selectedTrack.map(function(item, i){
    //                     return (
    //                         <View style={{ marginRight: 7, marginLeft: 7 }} key={i}>
    //                           {/* <TouchableOpacity onPress={() => { prop.selectTrack(i) }}> */}
    //                               <Image source={item.imgsource150 ? {uri: item.imgsource150} : null}  style={{ width: 200, height: 200, borderColor: "#262730", borderWidth: 6, borderRadius: 20 }} />
    //                               <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 999 }} >
    //                                 <Image source={TrackSliderBackground} style={{ width: 200, height: 200 }} />
    //                               </View>
    //                           {/* </TouchableOpacity> */}
    //                         </View>
    //                     );
    //                 })}
    //             </ScrollView>
    //         </SafeAreaView>
    //     );
    // }

    currentTrackShow() {
      const item = this.props.state.selectedTrack;
      if (!item) {
        return null;
      }
      let size = Math.floor(Dimensions.get('window').width * 0.60);
      
      return (
        <View style={{ width: "100%", alignItems: "center" }}>
          <View style={{ marginRight: 7, marginLeft: 7 }}>
            {/* <TouchableOpacity onPress={() => { prop.selectTrack(i) }}> */}
                <Image source={item.imgsource150 ? {uri: item.imgsource150} : null}  style={{ width: size, height: size, borderColor: "#262730", borderWidth: 6, borderRadius: 30 }} />
                <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 999 }} >
                  <Image source={TrackSliderBackground} style={{ width: size, height: size }} />
                </View>
            {/* </TouchableOpacity> */}
          </View>
        </View>
      );
    }

    stationListView() {
        const stations = this.props.state.myChannels || [];
        const sChannel = this.props.state.selectedChannel;
        return (
            <ScrollView horizontal={true}>
            {stations.map((item, i) => {
                const imgsource = item.albumimage ? item.albumimage : '';
                return (
                    <View style={{ marginRight: 7 }} key={i}>
                        <TouchableOpacity
                          onPress={() => this.selectChannel(i)}
                          disabled={sChannel && sChannel.id == stations[i].id}
                        >
                            <ImageBackground
                                imageStyle={{ borderRadius: 5 }}
                                source={StationCoverBack}
                                style={{
                                  width: 82,
                                  height: 96,
                                  resizeMode: 'contain'
                                }}>
                                <View
                                  style={
                                    sChannel && sChannel.id == stations[i].id
                                      ? styles.stationSelected
                                      : styles.station
                                  }
                                >
                                  <Image
                                      source={{uri: imgsource}}
                                      style={{ width: "100%", height: "100%" }}
                                      resizeMode='contain'
                                  />
                                </View>
                                <View style={{ position: "absolute", top: 77, bottom: 0, left: 0, right: 0, zIndex: 999, alignItems: 'center' }}>
                                    <Text numberOfLines={1} style={{ color:'#ABAED0', fontSize: 11, marginBottom: 3}}>{item.stationName}</Text>
                                    {/*<Text numberOfLines={1} style={{ color:'#ABAED0', fontSize: 10, width: '100%' }}>{item.name}</Text>*/}
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>
                    </View>
                );
            })}
            </ScrollView>
        );
    }

    setKeyboardVisibility = () => {
      const { keyboardVisible } = this.state;
      this.setState({ keyboardVisible: !keyboardVisible });
    }

    updateChannelBroadcast = async isBroadcast => {
      const { loggedIn } = this.state;
      this.setState({
        loadingChannels: true
      });
      if ( loggedIn == "true" ) {
        try {
          const { data } = await client.mutate({
              mutation: UDPATE_CHANNEL_BROADCAST,
              variables: {
                id: this.props.state.selectedChannel.id,
                broadcast: isBroadcast
              }
          });
          if (data.updateChannelBroadcast) {
            this.props.state.selectedChannel.broadcast = isBroadcast;
            this.props.saveSelectedChannel(this.props.state.selectedChannel);
          }
        } catch (error) {
          if (error.message.replace("GraphQL error:", "").trim().substr(0, 8) == "Login to") {
            await AsyncStorage.removeItem("authtoken1");
            await AsyncStorage.removeItem("loggedIn");
            this.props.saveProfile(null);
            this.props.navigation.navigate("Auth");
          }
        }
      }
      this.setState({
        loadingChannels: false
      });
    }

    render() {
        const sTrack = this.props.state.selectedTrack;
        const selectedTrackTitle = (sTrack && sTrack.title) || '';
        const selectedTrackName = (sTrack && sTrack.name) || '';
        const comments  = this.props.state.comments;

        return (
          <Mutation mutation={ADD_COMMENT}>
          {(addComment) => {
            return(
              <UserInactivityCheck navigation={this.props.navigation}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior='height'>
                  {this.state.loadingChannels && <Loading />}
                  {this.state.errorMessage != '' && <Error message={this.state.errorMessage} />}
                  <ImageBackground
                      source={Background}
                      style={{ flex: 1, height: null, width: null }}
                      resizeMode="cover" >
                      <View style={{ margin: 15, flex: 1 }}>
                        <HeadPlay
                          // musicHeader={true}
                          // refreshTracksSliderPosition={this.refreshTracksSliderPosition}
                          navigation={this.props.navigation}
                        />
                        
                        <ScrollView
                          contentContainerStyle={{ flexGrow: 1 }}
                          ref={ref => this.scrollView = ref}
                        >
                            <View style={{ marginBottom: 10 }}>
                                <View style={{ marginTop: 25, marginBottom: 5 }}>
                                    {/* {this.tracksSlider(this.props.state.playQueue.queue || [])} */}
                                    {this.currentTrackShow()}
                                </View>
                                {/*<Image source={ReloadButton} style={{ marginTop: 10 }}/>*/}
                                <View style={{ alignItems: "center" }}>
                                  <Text numberOfLines={1} style={{ color: "#abaed0", fontSize: 18 }}>{selectedTrackTitle}</Text>
                                  <Text numberOfLines={1} style={{ color: "#abaed0" }}>{selectedTrackName}</Text>
                                </View>
                                <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 }}>
                                    <TouchableOpacity
                                      onPress={() => this.props.navigation.navigate("CreateChannel") }
                                      disabled={this.state.loggedIn != "true"}
                                    >
                                        <Image source={AddButton} />
                                    </TouchableOpacity>
                                </View>
                                {this.stationListView()}
                                {/*<View style={{ flexDirection: "row", marginTop: 10 }}>
                                    <Image source={Bars} style={{width:'100%'}}/>
                                </View>*/}
                                <View style={{ alignItems: "center", marginTop: 20 }}>
                                  <View style={{ width: 150, height: 40 }}>
                                    <ImageBackground
                                      source={HeadphoneCommunityBackground}
                                      imageStyle={{ borderRadius: 5 }}
                                      style={{ width: "100%", height: "100%" }}>
                                      <View style={{ flexDirection: "row", flex: 1 }}>
                                          <TouchableOpacity
                                              onPress={() => this.setState({ buttonState: 'headphone'})}
                                              style={{ flex: 1, width: 50, height: 40 }} >
                                              { this.state.buttonState == 'headphone' ?
                                                <Image source={HeadphoneActive} style={{width:50, height:40}} /> : <Image source={HeadphoneInActive} style={{width:50, height:40}}/> }
                                          </TouchableOpacity>
                                          <TouchableOpacity
                                              onPress={() => this.setState({ buttonState: 'community'})}
                                              style={{ flex: 1, width: 50, height: 40 }} >
                                              { this.state.buttonState == 'community' ?
                                                <Image source={CommunityActive} style={{width:50, height:40}} /> : <Image source={CommunityInActive} style={{width:50, height:40}}/> }
                                          </TouchableOpacity>
                                          <TouchableOpacity
                                              onPress={() => {
                                                this.setState({ buttonState: 'broadcast'});
                                                setTimeout(() => {
                                                  this.scrollView.scrollResponderScrollToEnd({animated: true});
                                                });
                                              }}
                                              style={{ flex: 1, width: 50, height: 40 }} >
                                              { this.state.buttonState == 'broadcast' ?
                                                <Image source={BroadcastActive} style={{width:50, height:40}} /> : <Image source={BroadcastInActive} style={{width:50, height:40}}/> }
                                          </TouchableOpacity>
                                      </View>
                                    </ImageBackground>
                                  </View>
                                </View>

                                { this.state.buttonState == 'headphone' ?
                                  ( !!sTrack && (!sTrack.labelOwnerId || !COMMENT_DISABLED_LABELS.includes(sTrack.labelOwnerId)) ?
                                    <CommentList 
                                      setKeyboardVisibility={this.setKeyboardVisibility}
                                      comments={ comments } 
                                      setComment={ this.props.setComment }
                                    />
                                    :
                                    <Text style={{
                                      marginTop: 20,
                                      fontSize: 16,
                                      color: '#abaed0',
                                      paddingHorizontal: 40,
                                      textAlign: "center"
                                    }}>Comment Disabled for the current track!</Text>
                                  )
                                  : null
                                }
                                
                                { this.state.buttonState == 'community' ?
                                  <CommunityList community={this.state.community} /> : null
                                }
                                
                                { this.state.buttonState == 'broadcast' && (
                                  !this.props.state.profile || !this.props.state.profile.plan_type || this.props.state.profile.plan_type == "free" ?
                                  <Text style={{
                                    marginTop: 20,
                                    fontSize: 16,
                                    color: '#abaed0',
                                    paddingHorizontal: 40,
                                    textAlign: "center"
                                  }}>
                                    Upgrade Now to begin Broadcasting your Station
                                  </Text>
                                  :
                                  <View style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexDirection: "row",
                                    marginTop: 20
                                  }}>
                                    <Switch
                                      trackColor={{ false: "#767577", true: "#81b0ff" }}
                                      thumbColor={this.state.isBroadcast ? "#f4f3f4" : "#f4f3f4"}
                                      ios_backgroundColor="#767577"
                                      value={this.state.isBroadcast}
                                      onValueChange={async value => {
                                        this.setState({
                                          isBroadcast: value
                                        });
                                        await this.updateChannelBroadcast(value);
                                      }}
                                    />
                                    <Text style={{
                                      fontSize: 16,
                                      color: '#abaed0',
                                      marginLeft: 5
                                    }}>
                                      Broadcast
                                    </Text>
                                  </View>
                                )}
                            </View>
                        </ScrollView>
                      
                        {
                          !this.state.keyboardVisible
                            || this.state.buttonState == 'community'
                            || this.state.buttonState == 'broadcast' ? null :
                          <InputBox
                            send={ async (content) => {
                              const selectedTrack = this.props.state.selectedTrack;
                              // console.log('playing selected track : ', selectedTrack);
                              if(selectedTrack == null || !selectedTrack.MnetId || selectedTrack.MnetId == '') {
                                alert('No track is available');
                                return;
                              }
                              const { data } = await addComment({ variables: { content, trackId: trackId, mNetId: selectedTrack.MnetId, trackName: selectedTrack.title } });
                              this.props.addComment(data.addComment);
                            }}
                            disabled={ !sTrack || (sTrack.labelOwnerId && COMMENT_DISABLED_LABELS.includes(sTrack.labelOwnerId)) } // if track label is Sony
                          />
                        }
                      </View>
                  </ImageBackground>
                </KeyboardAvoidingView>
              </UserInactivityCheck>
            )
          }}
          </Mutation>
        );
    }
}

const styles = StyleSheet.create({
    stationSelected: {
      width: 82,
      height: 80,
      borderRadius: 13,
      overflow: "hidden",
      borderColor: "#C457BE",
      borderWidth: 2
    },
    station: {
      width: 82,
      height: 80,
      borderRadius: 13,
      overflow: "hidden"
    }
});

function CommentList(props) {
  const comments = props.comments;
  const [visibleItem, setVisibleItem] = React.useState(-1);
  const [visible, setVisible] = React.useState(false);
  const [replies, setReplies] = React.useState([]);
  const [selectedComment, setSelectedComment] = React.useState('');
  const [addReply, { loading: replyLoading, error: replyError }] = useMutation(ADD_REPLY);

  const refresh = (i) => {
    visibleItem == i ? setVisibleItem(-1) : setVisibleItem(i);
    props.setKeyboardVisibility();
  }

  const showModal = (i) => {
    setReplies(comments[i].replies);
    setSelectedComment(comments[i].content);
    setVisible(true);
  }

  return (
    <View style={{ flexDirection: "column", marginTop: 20 }}>
      {comments.map((comment, i) => {
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
                    style={{ width: 37, borderRadius: 150 / 2, height: 37 }}
                    source={ comment.profile && comment.profile.profilePic
                      ? { uri: `${Config.STATIC_URL}/${comment.profile.profilePic}` }
                      : HeaderRight
                    }
                  />
                  <Text style={{ color: "#abaed0", marginLeft: 10 }}>
                    { comment.content }
                  </Text>
                </View>

                <TouchableOpacity
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
                  </TouchableOpacity>
              </View>
              
              {comment.mine != comment.userId ? 
                <TouchableOpacity
                  onPress={() => refresh(i) }>
                  <Image style={{ marginLeft: 10 }} source={GoToIcon} />
                </TouchableOpacity> : null           
              }

            </View>
         
            {
              visibleItem == i ? 
                <View style={{ marginLeft: 20, borderTopWidth: 0.5, borderTopColor: '#000', display: 'flex'}}>
                  <InputBox
                    send={ async (content) => {
                      const { data } = await addReply({ variables: { content, commentId: comment.id } });
                      props.setComment({
                        index: i,
                        value: data.addReply
                      });
                      refresh(i);
                    }} />
                </View> : null
            }
          </View>
        );
      })}

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
      </Modal>
    </View>
  );
}

const mapStateToProps = (state) => {
  return {
    state: state.app
  };
};

const GET_COMMENTS = gql`
  query($mNetId: String) {
    comments(mNetId: $mNetId) {
      id,
      content,
      userId,
      trackId, 
      mNetId,
      mine,
      replies {
        content,
        userId,
        commentId,
        profile {
          profilePic
        }
      },
      count,
      profile {
        profilePic
      }
    }
  }
`;

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
const ADD_COMMENT = gql`
  mutation($content: String, $trackId: Int, $mNetId: String, $trackName: String) {
    addComment(content: $content, trackId: $trackId, mNetId: $mNetId, trackName: $trackName) {
        id,
        content,
        userId,
        trackId,
        mNetId,
        mine,
        trackName,
        replies {
            content,
            userId,
            commentId,
            profile {
              profilePic
            }
        },
        count
        profile {
          profilePic
        }
    }
  }
`;

const ADD_REPLY = gql`
  mutation($content: String, $commentId: Int) {
    addReply(content: $content, commentId: $commentId) {
        id,
        content,
        userId,
        trackId,
        mNetId,
        mine,
        replies {
            content,
            userId,
            commentId,
            profile {
              profilePic
            }
        },
        count,
        profile {
          profilePic
        }
    }
  }
`;

const UDPATE_CHANNEL_BROADCAST = gql`
  mutation($id: Int, $broadcast: Boolean) {
    updateChannelBroadcast(id: $id, broadcast: $broadcast)
  }
`;

const GET_PROFILE = gql`
  {
    profile {
      id
      profilePic
      plan_type
      firstName
      color_scheme
      private
    }
  }
`;

export default connect(state => (mapStateToProps), actions)(Music);