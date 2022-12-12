import React, { Component } from 'react';
import {
  Text, Image, ImageBackground, View, StyleSheet, TouchableOpacity, AsyncStorage, Easing
} from "react-native";
import TextTicker from 'react-native-text-ticker';

import { CustomPicker } from 'react-native-custom-picker';
import { Triangle } from "react-native-shapes";
import HeaderLeft from "../assets/music/musci_play_header_left.png";
import ProfileEmpty from "../assets/profile.png";
import HeaderMiddleBackground from "../assets/music/music_play_header_middle_background.png";
import HeaderTimeTracker from "../assets/music/header-time-tracker.png";
import PlayButton from "../assets/music/play_button.png";
import PauseButton from "../assets/music/pause_button.png";
import PlayButtonSide from "../assets/music/play_button_side.png";
// import DownloadButton from "../assets/music/play_button_download.png";
// import UpArrow from "../assets/music/play_button_up_arrow.png";
import TrackNameBackground from "../assets/music/track_name_background.png";
import TrackNameBottomShadow from "../assets/music/track_name_bottom_shadow.png";
import ButtonBack from "../assets/emptyboxcheckmark.png";
import Heart from "../assets/tracks_levels/heart.png";
import IImage from "../assets/I.png";
import IIImage from "../assets/II.png";
import Binoculars from "../assets/tracks_levels/binoculars.png";
import CancelBtn from "../assets/music/cancel-btn.png";
import * as Config from '../config';

import { connect } from 'react-redux';
import * as actions from '../redux/actions';
import md5 from "react-native-md5";
import axios from 'axios';
import { PlayQueue } from '../utils/utils';
import { Mutation } from 'react-apollo';
import { gql } from "apollo-boost";
import client from "../graphql/client";
import showError from "../utils/showError";
import LoadingModal from "./Loading";
import Menu, { MenuItem } from 'react-native-material-menu';
import { GET_CHANNEL } from '../graphql/queries';

class HeadPlay extends Component {

    constructor(props) {
      super(props);

      this.state = {
        errorMessage: "",
        loggedIn: "",
        stationIndex: props.state.selectedChannelIndex,
        channelLoading: false
      };

      this.updateTrackTier = async () => {};
      this._menu = React.createRef();

      this.toggleAudioPlayback = this.toggleAudioPlayback.bind(this);
      this.playNextSong = this.playNextSong.bind(this);
      // this.playPrevSong = this.playPrevSong.bind(this);
      this.selectChannel = this.selectChannel.bind(this);
    }

    async componentDidMount() {
      const loggedIn = await AsyncStorage.getItem("loggedIn");
      this.setState({ loggedIn });
    }

    UNSAFE_componentWillReceiveProps(newProps) {
      // console.log('HeadPlay.js, selectedTrack changed');
      if (this.props.state.selectedTrack != newProps.state.selectedTrack) {
        if (this.props.state.selectedTrack) {
          this.playTrack(newProps.state.selectedTrack);
        }
      }
      if (this.props.state.selectedChannelIndex != newProps.state.selectedChannelIndex) {
        this.setState({
          stationIndex: newProps.state.selectedChannelIndex
        });
      }
    }

    addTrackId = async (trackId) => {
      // console.log('addTrackId ------------------> ');
      try {
        const result = await client.mutate({
          mutation: ADD_CURRENT_TRACK_ID,
          variables: { trackId: trackId }
        })
  
        // console.log(result);
      } catch(error) {
        console.log('addTrackId error : ', error);
      }
    }

    playTrack = async (track) => {
      const soundObject = this.props.state.soundObject;
      if (!track) {
        soundObject.unloadAsync();
        // this.props.setDuration(0);
        if (this.props.state.playQueue) {
          this.props.state.playQueue.initializeFactors();
          const nextTrack = await this.props.state.playQueue.getNextTrack();
          this.props.saveSelectedTrackIndex(0);
          this.props.saveSelectedTrack(nextTrack);
        }
        this.props.savePlayState(false);
        this.props.saveTimeTrackerWidth(0);
      } else {
        if (this.state.errorMessage != "") {
          this.setState({
            errorMessage: ""
          });
        }

        // console.log('trackid ----------------------------->', track.MnetId);
        this.addTrackId(track.MnetId);

        let signature = md5.hex_hmac_md5(Config.SHARED_SECRET, Config.RADIO_GETMEDIALOCATION + track.MnetId);
        // console.log('signature ---------------> ', signature);
        const res = axios.get(Config.MNDIGITAL_BASE + Config.RADIO_GETMEDIALOCATION + track.MnetId + "&signature=" + signature);
        const { data } = await res;
        try {
          await soundObject.unloadAsync();
          
          // if (this.props.state.playAd) {
          //   await soundObject.loadAsync({ uri: 'https://api.adtonos.com/xAy4HhA5s5zCh9v9_64_48000_s.mp3' });
          // } else {
            await soundObject.loadAsync({ uri: data.Location });
          // }
          this.props.saveUpdateTrackerWidth(true);
          soundObject.setIsLoopingAsync(false);
          if (this.props.state.playstate) {
            soundObject.playAsync();
          }
        } catch (e) {
          console.log(`cannot play the sound file`, e)
        }
      }
    }

    async playNextSong() {
        if (!this.checkSkipCancelTimes()) {
          return;
        }
        var index = this.props.state.selectedTrackIndex + 1;
        let nextTrack = await this.props.state.playQueue.getNextTrack();
        this.props.saveSelectedTrackIndex(index);
        this.props.saveSelectedTrack(nextTrack);
        // if ( this.props.musicHeader != null ) {
        //   this.props.refreshTracksSliderPosition(index);
        // }
    }

    // playPrevSong() {
    //     var index = this.props.state.selectedTrackIndex;
    //     let selectedTracks = this.props.state.playQueue.queue;
    //     if ( index > 0) {
    //         index = index - 1;
    //     } else {
    //         index = 0;
    //     }
    //     this.props.saveSelectedTrackIndex(index);
    //     this.props.saveSelectedTrack(selectedTracks[index]);
    //     if ( this.props.musicHeader != null ) {
    //       this.props.refreshTracksSliderPosition(index);
    //     }
    // }

    async toggleAudioPlayback() {
        const playState = this.props.state.playstate;
        const soundObject = this.props.state.soundObject;
        this.props.savePlayState(!playState);
        const loadState = await soundObject.getStatusAsync();
        if ( !playState) {
          if (!loadState.isLoaded) {
            this.playTrack(this.props.state.selectedTrack);
          } else {
            soundObject.playAsync();
          }
        } else {
          if (loadState.isLoaded) {
            soundObject.pauseAsync();
          }
        }
    }

    async selectChannel(val) {
      const channelArr = this.props.state.myChannels;
      if (!channelArr || channelArr.length < val + 1 || val < 0) {
        return;
      }
      this.setState({
        channelLoading: true
      });
      const id = channelArr[val].id;
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
        this.props.saveSelectedChannelIndex(val);

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
        channelLoading: false
      });
    }

    stationPickerSelect = () => {
      const myChannels = this.props.state.myChannels ? [...this.props.state.myChannels] : [];
      myChannels.push({
        id: 0,
        stationName: "Premade Stations"
      });

      return (
        <View style={{ height: 40, justifyContent: "center" }} >
          <CustomPicker
            placeholder={'Select a station'}
            options={myChannels}
            getLabel={item => item.stationName}
            fieldTemplate={this.renderField}
            optionTemplate={this.renderOption}
            value={myChannels.length > 0 ? myChannels[this.state.stationIndex] : null}
            onValueChange={value => {
              if (value.id == 0) {
                this.initializeStations();
                this.props.navigation.navigate("Guest");
              }
              const index = myChannels.findIndex(channel => {
                return channel.id == value.id;
              });
              if (index == this.state.stationIndex) {
                return;
              }
              this.setState({
                stationIndex: index
              });
              this.selectChannel(index);
              console.log('Selected Item', value ? JSON.stringify(value.stationName) : 'No item were selected!')
            }}
            modalStyle={{
              backgroundColor: "#2D2E37"
            }}
          />
        </View>
      );
    }

    renderField = settings => {
      const { selectedItem, defaultText, getLabel, clear } = settings
      return (
        <View style={styles.container}>
          <View style={{ flex: 1}}>
            <Text style={styles.text}>{ selectedItem ? getLabel(selectedItem) : defaultText}</Text>
          </View>
          <View style={styles.iconContainer}>
            <Triangle size={1.3} color="#abaed0" rotate={180} type="isosceles" />
          </View>
        </View>
      )
    };
   
    renderOption = settings => {
      const { item, getLabel } = settings
      return (
        <View style={styles.optionContainer}>
          <Text style={styles.text}>{getLabel(item)}</Text>
        </View>
      );
    };

    moveTrackToTier = async (tierNum) => {
      if (tierNum == -1 && !this.checkSkipCancelTimes()) {
        return;
      }

      const sChannel = this.props.state.selectedChannel;
      const sTrack = this.props.state.selectedTrack;
      const originalTier = sTrack.tier;

      try {
        const { data } = await this.updateTrackTier({
            variables: {
              channelId: this.props.state.selectedChannel.id,
              trackId: parseInt(this.props.state.selectedTrack.MnetId),
              tierNum: tierNum
            },
            update: (store) => {
              const data = store.readQuery({
                query: GET_CHANNEL,
                variables: {
                  id: sChannel.id
                }
              });

              if (originalTier == "Heart") {
                data.getChannel.tierHeart = data.getChannel.tierHeart.filter(t => t.MnetId != sTrack.MnetId);
              } else if (originalTier == "Tier1") {
                data.getChannel.tier1 = data.getChannel.tier1.filter(t => t.MnetId != sTrack.MnetId);
              } else if (originalTier == "Tier2") {
                data.getChannel.tier2 = data.getChannel.tier2.filter(t => t.MnetId != sTrack.MnetId);
              } else if (originalTier == "Binoculars") {
                data.getChannel.tierBinoculars = data.getChannel.tierBinoculars.filter(t => t.MnetId != sTrack.MnetId);
              }
    
              if (tierNum == 0) {
                data.getChannel.tierHeart.push(sTrack);
              } else if (tierNum == 1) {
                data.getChannel.tier1.push(sTrack);
              } else if (tierNum == 2) {
                data.getChannel.tier2.push(sTrack);
              } else if (tierNum == 3) {
                data.getChannel.tierBinoculars.push(sTrack);
              }

              store.writeQuery({
                query: GET_CHANNEL,
                variables: {
                  id: sChannel.id
                },
                data
              });
            }
        });

        if (data.updateTrackTier) {
          if (originalTier == "Heart") {
            sChannel.tierHeart = sChannel.tierHeart.filter(t => t.MnetId != sTrack.MnetId);
          } else if (originalTier == "Tier1") {
            sChannel.tier1 = sChannel.tier1.filter(t => t.MnetId != sTrack.MnetId);
          } else if (originalTier == "Tier2") {
            sChannel.tier2 = sChannel.tier2.filter(t => t.MnetId != sTrack.MnetId);
          } else if (originalTier == "Binoculars") {
            sChannel.tierBinoculars = sChannel.tierBinoculars.filter(t => t.MnetId != sTrack.MnetId);
          }

          if (tierNum == 0) {
            sTrack.tier = "Heart";
            sChannel.tierHeart.push(sTrack);
          } else if (tierNum == 1) {
            sTrack.tier = "Tier1";
            sChannel.tier1.push(sTrack);
          } else if (tierNum == 2) {
            sTrack.tier = "Tier2";
            sChannel.tier2.push(sTrack);
          } else if (tierNum == 3) {
            sTrack.tier = "Binoculars";
            sChannel.tierBinoculars.push(sTrack);
          } else {
            sTrack.tier = "Explore"
          }

          this.props.saveSelectedTrack(sTrack);
          this.props.state.playQueue.updateChannel(sChannel);
          
        } else {
          showError("Updating Track Tier Failed");
        }
      } catch (error) {
        if (error.message.replace("GraphQL error:", "").trim().substr(0, 8) == "Login to") {
          await AsyncStorage.removeItem("authtoken1");
          await AsyncStorage.removeItem("loggedIn");
          this.props.saveProfile(null);
          this.props.navigation.navigate("Auth");
        } else {
          showError(error.message);
        }
      }
    };

    checkSkipCancelTimes = () => {
      const times = this.props.state.skipCancelTimes;
      const currentTime = Math.floor(new Date().getTime() / 1000);
      const updatedTimes = times.filter(time => time >= currentTime - 3600);
      let valid = false;
      if (updatedTimes.length < 6) {
        updatedTimes.push(currentTime);
        valid = true;
      }
      this.props.saveSkipCancelTimes(updatedTimes);
      if (!valid) {
        showError("Skipping or cancelling tracks too often!");
      }
      return valid;
    }

    initializeStations = () => {
      if (this.props.state.soundObject) {
        this.props.state.soundObject.unloadAsync();
        this.props.saveSoundObject(null);
      }
      this.props.savePlayState(false);
      this.props.saveSelectedTrackIndex(0);
      this.props.saveSelectedTrack(null);
      this.props.saveSelectedChannelIndex(0);
      this.props.saveSelectedChannel(null);
      this.props.saveMyChannels(null);
    }

    gotoNowPlaying = () => {
      this.initializeStations();
      this.props.navigation.navigate("Music");
      this._menu.hide();
    };

    gotoProfile = () => {
      this.props.navigation.navigate("Profile");
      this._menu.hide();
    };

    gotoLogin = () => {
      this.initializeStations();
      this.props.navigation.navigate("Auth");
      this._menu.hide();
    };

    logout = async () => {
      this.initializeStations();
      await AsyncStorage.removeItem("authtoken1");
      await AsyncStorage.removeItem("loggedIn");
      this.props.saveProfile(null);
      this.props.navigation.navigate("Auth");
      this._menu.hide();
    };

    gotoSignup = () => {
      this.initializeStations();
      this.props.navigation.navigate("Register");
      this._menu.hide();
    };

    render() {
        var profileImg = '';
        if ( this.props.state.profile != null && this.props.state.profile.profilePic ) {
          profileImg = Config.STATIC_URL+'/'+this.props.state.profile.profilePic;
        }

        const selectedTrack = this.props.state.selectedTrack;
        const selectedTrackTitle = selectedTrack != null
          ? selectedTrack.title + ", " + selectedTrack.name + ", " + selectedTrack.albumTitle
          : "";
        var selectedTrackTier = selectedTrack ? selectedTrack.tier : "Explore";
        const playState = this.props.state.playstate;
        const { loggedIn } = this.state;
        const { isGuest } = this.props;
        const trackerWidth = this.props.state.timeTrackerWidth;

        return (
          <Mutation mutation={UDPATE_TRACK_TIER}>
            {(updateTrackTier, {loading}) => {
              this.updateTrackTier = updateTrackTier;

              return (
                <View>
                  {(loading || this.state.channelLoading) && <LoadingModal />}
                  <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start",  marginTop: 30}} >
                    <View style={{ marginRight: 10, marginTop: 5 }}>
                      <Image style={{ width: 50, height: 50 }} source={HeaderLeft} />
                    </View>
                    <View style={{ flex: 1, marginTop: 9, flexDirection: "column"}} >
                      <ImageBackground
                        imageStyle={{
                          shadowColor: "#4d4f5e",
                          shadowOffset: { width: 2, height: 0 },
                          shadowRadius: 0,
                        }}
                        style={{
                          height: 30,
                          width: "100%",
                          position: "relative"
                        }}
                        source={HeaderMiddleBackground}
                        resizeMode="stretch"
                      >
                        <Image
                          source={HeaderTimeTracker}
                          style={{
                            position: "absolute",
                            top: 6,
                            left: "1%",
                            height: 18,
                            width: `${trackerWidth}%`,
                            borderRadius: 9
                          }}
                          resizeMode="cover"
                        />
                        <View style={{ height: 30, justifyContent: "center", position: "relative", paddingHorizontal: 10 }} >
                          <TextTicker
                            style={{ fontSize: 14, color: "#abaed0", fontWeight: "bold" }}
                            scrollSpeed={350}
                            easing={Easing.linear}
                            loop
                            bounce={false}
                            repeatSpacer={50}
                            marqueeDelay={1000}
                          >
                            {selectedTrackTitle}
                          </TextTicker>
                        </View>
                      </ImageBackground>
                      <View style={{ flexDirection: "row", marginTop: 10, alignItems: "center", justifyContent: 'center' }} >
                        <View style={{ flexDirection: "row", alignItems: "center", marginRight: 7 }} >
                            <TouchableOpacity onPress={this.toggleAudioPlayback}>
                                { playState ? <Image source={PauseButton} /> : <Image source={PlayButton} /> }
                            </TouchableOpacity>
                            <TouchableOpacity onPress={this.playNextSong}>
                              <Image source={PlayButtonSide} style={{ marginLeft: -5, marginTop: 4 }} />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          onPress={() => this.moveTrackToTier(0)}
                          disabled={selectedTrackTier == "Heart" || loggedIn != "true" || isGuest}
                        >
                          <ImageBackground
                            source={ButtonBack}
                            style={styles.buttonBack}
                          >
                            <View
                              style={selectedTrackTier == "Heart" ? styles.iconWrapperSelected : styles.iconWrapper}
                            >
                              <Image source={Heart} style={{ height: null, width: 18, aspectRatio: 14 / 13 }} />
                            </View>
                          </ImageBackground>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.moveTrackToTier(1)}
                          disabled={selectedTrackTier == "Tier1" || loggedIn != "true" || isGuest}
                        >
                          <ImageBackground
                            source={ButtonBack}
                            style={styles.buttonBack}
                          >
                            <View
                              style={selectedTrackTier == "Tier1" ? styles.iconWrapperSelected : styles.iconWrapper}
                            >
                              <Image source={IImage} style={{ height: 14.5, width: null, aspectRatio: 5 / 22 }} />
                            </View>
                          </ImageBackground>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.moveTrackToTier(2)}
                          disabled={selectedTrackTier == "Tier2" || loggedIn != "true" || isGuest}
                        >
                          <ImageBackground
                            source={ButtonBack}
                            style={styles.buttonBack}
                          >
                            <View
                              style={selectedTrackTier == "Tier2" ? styles.iconWrapperSelected : styles.iconWrapper}
                            >
                              <Image source={IIImage} style={{ height: 14.5, width: null, aspectRatio: 15 / 22 }} />
                            </View>
                          </ImageBackground>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.moveTrackToTier(3)}
                          disabled={selectedTrackTier == "Binoculars" || loggedIn != "true" || isGuest}
                        >
                          <ImageBackground
                            source={ButtonBack}
                            style={styles.buttonBack}
                          >
                            <View
                              style={selectedTrackTier == "Binoculars" ? styles.iconWrapperSelected : styles.iconWrapper}
                            >
                              <Image source={Binoculars} style={{ height: null, width: 20, aspectRatio: 18 / 11 }} />
                            </View>
                          </ImageBackground>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => this.moveTrackToTier(-1)}
                          disabled={selectedTrackTier == "Explore" || loggedIn != "true" || isGuest}
                        >
                          <ImageBackground
                            source={ButtonBack}
                            style={styles.buttonBack}
                          >
                            <View
                              style={styles.iconWrapper}
                            >
                              <Image source={CancelBtn} style={{ height: null, width: 16, aspectRatio: 1, marginTop: 2 }} />
                            </View>
                          </ImageBackground>
                        </TouchableOpacity>
                        {/* <TouchableOpacity
                          onPress={this.upgradeTrack}
                          disabled={loggedIn != "true" || selectedTrackTier == "Explore" || selectedTrackTier == "Heart"}
                        >
                          <Image source={UpArrow} style={{ marginRight: 7 }} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={this.downgradeTrack}
                          disabled={loggedIn != "true" || selectedTrackTier == "Explore" || selectedTrackTier == "Binoculars"}
                          // onPress={this.playNextSong}
                        >
                          <Image source={DownloadButton} style={{ marginRight: 7 }} />
                        </TouchableOpacity> */}
                      </View>
                    </View>
                    <View style={{ marginTop: 9, marginLeft: 12 }}>
                      <Menu
                        ref={ ref => this._menu = ref }
                        button={ 
                          <TouchableOpacity
                            onPress={() => this._menu.show()}
                          >
                            { profileImg != ''
                              ? <Image style={{ width: 33, height: 34, borderRadius: 7 }} source={{ uri: profileImg }} />
                              : <Image style={{ width: 33, height: 34, borderRadius: 7 }} source={ProfileEmpty} />
                            }
                          </TouchableOpacity>
                        }
                      >
                        <MenuItem
                          onPress={
                            loggedIn == "true"
                              ? (isGuest ? this.gotoNowPlaying : this.gotoProfile)
                              : this.gotoLogin
                          }
                          style={ styles.menuItem }
                          textStyle={ styles.menuItemText }
                        >
                          { loggedIn == "true" ? (isGuest ? "Now Playing" : "Profile") : "Login" }
                        </MenuItem>
                        <MenuItem
                          onPress={ loggedIn == "true" ? this.logout : this.gotoSignup }
                          style={ styles.menuItem }
                          textStyle={ styles.menuItemText }
                        >
                          { loggedIn == "true" ? "Logout" : "Signup" }
                        </MenuItem>
                      </Menu>
                    </View>
                  </View>
                  {
                    !this.props.hideChannelSelect &&
                    <View style={{ flexDirection: "row", marginTop: 10 }}>
                        <View style={{ flex: 1, flexDirection: "column", zIndex: 1 }} >
                          <ImageBackground imageStyle={{ shadowColor: "#4d4f5e", shadowOffset: { width: 2, height: 0 }, shadowRadius: 0, borderColor: "#202024", borderWidth: 1, borderRadius: 5 }}
                              style={{ height: null, width: null }}
                              source={TrackNameBackground} >
                              {this.stationPickerSelect()}
                          </ImageBackground>
                          <View style={{ position: "absolute", left: -20, right: -25, top: 10, zIndex: -1 }} >
                            <Image source={TrackNameBottomShadow} style={{ width: "100%", height: 60 }} resizeMode="stretch" />
                          </View>
                        </View>
                        {/*<Image source={TrackNameSide} />*/}
                    </View>
                  }
                </View>
              );
            }}
          </Mutation>
        );
    }
}

const styles = StyleSheet.create({
  buttonBack: {
    width: 27,
    height: 29,
    marginRight: 5
  },
  iconWrapper: {
    width: 25,
    height: 25,
    marginTop: 1,
    marginLeft: 1,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapperSelected: {
    width: 25,
    height: 25,
    marginTop: 1,
    marginLeft: 1,
    borderRadius: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#C457BE23"
  },
  container: {
    height: "100%",
    paddingHorizontal: 10,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center"
  },
  iconContainer: {
    width: 30,
    alignItems: "center"
  },
  text: {
    fontSize: 16,
    color: '#abaed0'
  },
  headerFooterContainer: {
    padding: 10,
    alignItems: 'center'
  },
  optionContainer: {
    padding: 10
  },
  menuItem: {
    backgroundColor: "#3D3E47"
  },
  menuItemText: {
    fontSize: 16,
    color: '#abaed0'
  }
});

const ADD_CURRENT_TRACK_ID = gql`
  mutation($trackId: String) {
    addCurrentTrackId(trackId: $trackId)
  }
`;

const UDPATE_TRACK_TIER = gql`
  mutation($channelId: Int, $trackId: Int, $tierNum: Int) {
    updateTrackTier(
      channelId: $channelId
      trackId: $trackId
      tierNum: $tierNum
    )
  }
`;

const mapStateToProps = (state) => {
    return {
        state: state.app
    }
}

export default connect(state => (mapStateToProps), actions)(HeadPlay);
