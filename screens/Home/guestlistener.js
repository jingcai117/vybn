import React, { Component } from 'react';
import {
  Text,
  Image,
  ImageBackground,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  AsyncStorage
} from "react-native";

import { Audio } from 'expo-av';
import Background from "../../assets/music/background.png";

import HeadPlay from "../../components/HeadPlay";

import { connect } from 'react-redux';
import * as actions from '../../redux/actions';
import { gql } from "apollo-boost";
import Error from "../../components/Error";
import { PlayQueue } from '../../utils/utils';
import LoadingModal from "../../components/Loading";
import Carousel from 'react-native-snap-carousel';
import { GET_CHANNEL, USER_GUEST_CHANNELS } from '../../graphql/queries';

import HCarouselBack from '../../assets/guest/carousel-back.png';
import HCarouselRuler from '../../assets/guest/carousel-ruler.png';
import Synth from '../../assets/guest/synth.png';
import HOverlay from '../../assets/guest/carousel-overlay.png';
import TrackNameBottomShadow from "../../assets/music/track_name_bottom_shadow.png";
import VCarouselBack from '../../assets/guest/v-carousel-back.png';
import VCarouselOverlay from '../../assets/guest/v-carousel-overlay.png';
import ControlBack from '../../assets/guest/control-back.png';
import NextBtnImage from '../../assets/guest/next-btn.png';
import PrevBtnImage from '../../assets/guest/prev-btn.png';
import EarImage from '../../assets/guest/ear.png';
import ListenBack from '../../assets/guest/listen-back.png';
import BottomBackTop from "../../assets/guest/bottom-back-top.png";
import BottomBackMiddle from "../../assets/guest/bottom-back-middle.png";
import BottomBackBottom from "../../assets/guest/bottom-back-bottom.png";
import BottomOverlay from "../../assets/guest/bottom-overlay.png";
import MessageBtnImage from "../../assets/guest/message-btn.png";
import BroadcastBtnImage from "../../assets/guest/broadcast-btn.png";
import ButtonBack from "../../assets/buttonback.png";
import client from "../../graphql/client";
import showError from "../../utils/showError";

import * as Config from "../../config";
import UserInactivityCheck from '../../components/UserInactivityCheck';

const SLIDER_WIDTH = Dimensions.get('window').width - 54;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH / 3);

class GuestListener extends Component {

  constructor(props) {
    super(props);

    this.state = {
      hCarouselIndex: 0,
      genreIndex: 0,
      stationLoading: false,
      loggedIn: ""
    };

    this.timer = 0;
    this.loadingTimeChange = false;

    this.initPlayer = this.initPlayer.bind(this);
    this.selectChannel = this.selectChannel.bind(this);
  }

  async componentDidMount() {
    const loggedIn = await AsyncStorage.getItem("loggedIn");
    this.setState({
      loggedIn
    });
    this.initPlayer();
    await this.getGenres();
    this._unsubscribeFocus = this.props.navigation.addListener('willFocus', () => {
      if (this._carousel) {
        this._carousel.snapToItem(this.props.state.selectedChannelIndex);
      }
    });
  }

  UNSAFE_componentWillUnmount() {
    if (this._unsubscribeFocus && this._unsubscribeFocus.remove instanceof Function) {
      this._unsubscribeFocus.remove();
    }
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
        if (status.didJustFinish) {
          // console.log("********** The current song has just been finished. About to play the next song **********");
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

  getGenres = async () => {
    this.setState({
      stationLoading: true
    });

    try {
      const { data } = await client.query({
          query: GENRES
      });

      const genres = data.broadcastingStationGenres;

      if (genres.length < 1) {
        console.log("****************No genres*****************");
        this.setState({
          stationLoading: false
        });
        return;
      }

      const genreList = genres.map(genre => {
        return {
          name: genre,
          isGenre: true
        }
      });

      if (this.state.loggedIn == "true") {
        genreList.unshift({ name: "My List", isGenre: false });
      }

      this.props.saveGenres(genreList);
      const selectedGenre = genreList[0];
      this.props.saveSelectedGenre(selectedGenre);

      await this.getStations();
    } catch (error) {
      console.log("error in getting broadcasting stations: ", error.message);
      this.setState({
        stationLoading: false
      });
    }
  }

  handleListenClick = async () => {
    const index = this.state.hCarouselIndex;
    if (index == this.props.state.selectedChannelIndex) {
      return;
    }
    this.props.savePlayState(true);
    this.selectChannel(index);
  }

  handleGenreChange = (index) => {
    console.log("****** genre index changed ******", index);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.setState({
        genreIndex: index
      });
      if (!this.state.stationLoading) {
        this.getStations();
      } else {
        this.loadingTimeChange = true;
      }
    }, 1500);
  }

  getStations = async () => {
    this.setState({
      stationLoading: true
    });
    console.log("*** getting stations ***");
    try {
      const selectedGenre = this.props.state.genres[this.state.genreIndex];
      let stations = [];
      if (selectedGenre.isGenre) {
        const response = await client.query({
          query: STATIONS_BY_GENRE,
          variables: {
            genre: selectedGenre.name
          }
        });
        stations = response.data.broadcastingStationsByGenre;
      } else {
        const response = await client.query({
          query: USER_GUEST_CHANNELS
        });
        stations = response.data.userGuestChannels;
      }

      if (this.loadingTimeChange) {
        this.loadingTimeChange = false;
        this.getStations();
        return;
      }

      // console.log('my channels: ', data);
      this._carousel.snapToItem(0);
      this.props.saveSelectedGenre(selectedGenre);
      this.props.saveMyChannels(stations);
      if ( stations.length > 0 ) {
        this.selectChannel(0);
      } else {
        if (selectedGenre.isGenre) {
          showError("No stations in the selected genre", 6000);
        } else {
          showError("No stations in your station list", 6000);
        }

        // if (this.state.genreIndex < this.props.state.genres.length - 1) {
        //   this.setState({
        //     stationLoading: false
        //   });
          // this.setState({
          //   genreIndex: this.state.genreIndex + 1
          // });
          // await this.getStations();
        //   this._vcarousel.snapToNext();
        // } else {
          this.props.saveSelectedChannelIndex(0);
          this.props.saveSelectedChannel(null);
          this.props.savePlayQueue(null);
          this.props.saveSelectedTrackIndex(0);
          this.props.saveSelectedTrack(null);
        // }
      }
      this.setState({
        stationLoading: false
      });
    } catch (e) {
      console.log(e);
      this.setState({
        stationLoading: false
      });
    }
  };

  addRemoveStation = async () => {
    this.setState({
      stationLoading: true
    });
    const channelId = this.props.state.selectedChannel.id;
    try {
      if (this.props.state.selectedGenre.isGenre) {
        const { data } = await client.mutate({
          mutation: ADD_TO_USER_GUEST_STATIONS,
          variables: {
            channelId
          },
          update: (store) => {
            // Read the data from our cache for this query.
            try {
              const data = store.readQuery({ query: USER_GUEST_CHANNELS });
              // Add our comment from the mutation to the end.
              data.userGuestChannels.push(this.props.state.selectedChannel);
              // Write our data back to the cache.
              store.writeQuery({ query: USER_GUEST_CHANNELS, data });
            } catch (e) {
              console.log(e);
            }
          }
        });
      } else {
        const { data } = await client.mutate({
          mutation: REMOVE_FROM_USER_GUEST_STATIONS,
          variables: {
            channelId
          },
          update: (store) => {
            // Read the data from our cache for this query.
            try {
              const data = store.readQuery({ query: USER_GUEST_CHANNELS });
              // Add our comment from the mutation to the end.
              data.userGuestChannels = data.userGuestChannels
                .filter(channel => channel.id != channelId);
              // Write our data back to the cache.
              store.writeQuery({ query: USER_GUEST_CHANNELS, data });
            } catch (e) {
              console.log(e);
            }
          }
        });
        if (data.removeFromUserGuestChannels) {
          const stations = this.props.state.myChannels;
          let channelIndex = this.props.state.selectedChannelIndex;
          stations.splice(channelIndex, 1);

          if (stations.length < channelIndex + 1) {
            channelIndex = channelIndex == 0 ? 0 : channelIndex - 1;
          }

          this._carousel.snapToItem(channelIndex);
          this.props.saveMyChannels(stations);
          if ( stations.length > 0 ) {
            this.selectChannel(channelIndex);
          } else {
            if (this.props.state.selectedGenre.isGenre) {
              showError("No stations in the selected genre", 6000);
            } else {
              showError("No stations in your station list", 6000);
            }

            this.props.saveSelectedChannelIndex(0);
            this.props.saveSelectedChannel(null);
            this.props.savePlayQueue(null);
            this.props.saveSelectedTrackIndex(0);
            this.props.saveSelectedTrack(null);
          }
        }
      }
    } catch (e) {
      console.log("Error in add remove station: ", e);
    }
    this.setState({
      stationLoading: false
    });
  }

  async selectChannel(val) {
    const channelArr = this.props.state.myChannels;
    if (!channelArr || channelArr.length < val + 1 || val < 0) {
      return;
    }
    this.setState({
      stationLoading: true
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
      stationLoading: false
    });
  }

  render() {
    const channels = this.props.state.myChannels;
    const genres = this.props.state.genres;
    const { loggedIn } = this.state;
    
    return (
      <UserInactivityCheck navigation={this.props.navigation}>
        <View style={{ flex: 1 }}>
          {this.state.stationLoading && <LoadingModal />}
          <ImageBackground
            source={Background}
            style={{ flex: 1,  height: null,  width: null }}
            resizeMode="cover"
          >
            <View style={{ margin: 19, flex: 1 }}>
              <HeadPlay
                hideChannelSelect={true}
                navigation={this.props.navigation}
                isGuest={true}
              />
              <View style={{ flex: 1 }}>

                {/* ****************** Station Carousel ******************** */}

                <View style={{ marginBottom: 14, marginTop: 20, position: "relative", zIndex: 0 }}>
                  <ImageBackground
                    source={HCarouselBack}
                    style={{ width: "100%", height: 80, position: "relative", zIndex: 999 }}
                    resizeMode="stretch"
                  >
                    <View style={{ flex: 1, padding: 8 }}>
                      <Image
                        source={HCarouselRuler}
                        style={{ width: "100%", height: 20, marginBottom: 3 }}
                        resizeMode="stretch"
                      />
                      <Carousel
                        ref={(c) => { this._carousel = c; }}
                        data={channels ? channels : []}
                        renderItem={({item, index}) => {
                          return (
                            <View style={{ alignItems: "center" }}>
                              <Image
                                source={{ uri: Config.STATIC_URL + "/" + item.profile.profilePic}}
                                style={{ width: 25, height: 25, borderRadius: 12 }}
                              />
                              <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Text
                                  style={index == this.props.state.selectedChannelIndex ? styles.carouselTitleActive : styles.carouselTitle}
                                  numberOfLines={1}
                                >
                                  { item.stationName }
                                </Text>
                                {index == this.props.state.selectedChannelIndex &&
                                  <Image source={Synth} style={{ marginLeft: 5, width: 8, height: 13 }} resizeMode="stretch" />
                                }
                              </View>
                            </View>
                          );
                        }}
                        sliderWidth={SLIDER_WIDTH}
                        itemWidth={ITEM_WIDTH}
                        onSnapToItem = { index => this.setState({hCarouselIndex: index}) }
                        enableMomentum={true}
                        inactiveSlideOpacity={1}
                        inactiveSlideScale={1}
                        // loop={true}
                      />
                    </View>
                    <View
                      style={{
                        width: "100%",
                        height: "100%",
                        padding: 2,
                        position: "absolute"
                      }}
                      pointerEvents="none"
                    >
                      <Image
                        source={HOverlay}
                        style={{
                          width: "100%",
                          height: "100%"
                        }}
                        resizeMode="stretch"
                      />
                    </View>
                  </ImageBackground>
                  <View style={{ position: "absolute", left: -10, right: -10, top: 35, zIndex: 0 }} >
                    <Image
                      source={TrackNameBottomShadow}
                      style={{ width: "100%" }}
                    />
                  </View>
                </View>

                {/* ******* Middle part: Genre selector, prev/next button, Listen button ****** */}

                <View style={{
                  flexDirection: "row",
                  marginBottom: 16
                }}>

                  {/* ------- Genre selector ------ */}

                  <View style={{ width: "28%" }}>
                    <ImageBackground
                      style={{
                        width: 70,
                        height: 100
                      }}
                      resizeMode="stretch"
                      source={VCarouselBack}
                    >
                      <Carousel
                        ref={(c) => { this._vcarousel = c; }}
                        data={genres ? genres : []}
                        renderItem={({item, index}) => {
                          return (
                            <View style={{
                              alignItems: "center",
                              justifyContent: "center",
                              width: "100%",
                              height: "100%",
                              paddingBottom: 10,
                              paddingHorizontal: 5,
                            }}>
                              <Text
                                style={ item.isGenre
                                  ? styles.vcarouselText
                                  : {
                                    ...styles.vcarouselText,
                                    color: '#A0A0D0'
                                  }
                                }
                                numberOfLines={1}
                              >
                                { item.name }
                              </Text>
                            </View>
                          );
                        }}
                        sliderWidth={68}
                        itemWidth={68}
                        sliderHeight={96}
                        itemHeight={30}
                        onSnapToItem = { index => this.handleGenreChange(index) }
                        enableMomentum={true}
                        vertical={true}
                        activeSlideOffset={10}
                        inactiveSlideOpacity={1}
                        inactiveSlideScale={1}
                        containerCustomStyle = {{
                          marginVertical: 2,
                          overflow: "hidden"
                        }}
                      />
                      <View
                        style={{
                          width: "100%",
                          height: "100%",
                          position: "absolute"
                        }}
                        pointerEvents="none"
                      >
                        <Image
                          source={VCarouselOverlay}
                          style={{
                            width: "100%",
                            height: "100%"
                          }}
                          resizeMode="stretch"
                        />
                      </View>
                    </ImageBackground>
                  </View>
                  <View style={{
                    width: "44%",
                    paddingHorizontal: "2%",
                    height: 100,
                    justifyContent: "center",
                    alignItems: "center"
                  }}>
                    <ImageBackground
                      source={ControlBack}
                      style={{
                        width: "100%",
                        height: 70,
                        flexDirection: "row"
                      }}
                      resizeMode="stretch"
                    >
                      <TouchableOpacity
                        onPress={() => this._carousel.snapToPrev()}
                        style={{
                          width: "50%",
                          height: 70,
                          justifyContent: "center",
                          alignItems: "flex-end",
                          paddingRight: 2
                        }}
                      >
                        <Image
                          source={PrevBtnImage}
                          style={{ aspectRatio: 53 / 64, height: 62 }}
                          resizeMode="stretch"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => this._carousel.snapToNext()}
                        style={{
                          width: "50%",
                          height: 70,
                          justifyContent: "center",
                          alignItems: "flex-start",
                          paddingLeft: 2
                        }}
                      >
                        <Image
                          source={NextBtnImage}
                          style={{ aspectRatio: 53 / 64, height: 62 }}
                          resizeMode="stretch"
                        />
                      </TouchableOpacity>
                    </ImageBackground>
                  </View>
                  <View style={{
                    width: "28%",
                    height: 100,
                    justifyContent: "center",
                    alignItems: "center"
                  }}>
                    <TouchableOpacity
                      onPress={this.handleListenClick}
                      disabled={this.state.hCarouselIndex == this.props.state.selectedChannelIndex}
                    >
                      <ImageBackground
                        source={ListenBack}
                        style={{
                          aspectRatio: 1,
                          height: 65,
                          alignItems: "center"
                        }}
                        resizeMode="stretch"
                      >
                        <Image
                          source={EarImage}
                          style={{
                            aspectRatio: 20 / 27,
                            height: 29,
                            marginTop: 8,
                            marginBottom: 3
                          }}
                        />
                        <Text style={styles.vcarouselText}>Listen</Text>
                      </ImageBackground>
                    </TouchableOpacity>
                  </View>
                </View>
                {
                  loggedIn == "true" && this.props.state.selectedChannel != null &&
                  <View style={{ marginHorizontal: 2, marginBottom: 10 }}>
                    <ImageBackground
                      source={ButtonBack}
                      imageStyle={{ borderRadius: 5 }}
                      style={{
                        width: "100%",
                        height: 35,
                        borderRadius: 5
                      }}
                    >
                      <TouchableOpacity
                        onPress={this.addRemoveStation}
                        disabled={!this.props.state.selectedChannel}
                      >
                        <View
                          style={{
                            height: "100%",
                            justifyContent: "center",
                            alignItems: "center"
                          }}
                        >
                          <Text style={styles.buttontext}>
                            { this.props.state.selectedGenre.isGenre ?
                              'Save to my list'
                              : 'Remove from my list'
                            }
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </ImageBackground>
                  </View>
                }
                <View style={{ width: "100%", flex: 1 }}>
                  <Image
                    source={BottomBackTop}
                    style={{ width: "100%", height: 7 }}
                    resizeMode="stretch"
                  />
                  <Image
                    source={BottomBackMiddle}
                    style={{ width: "100%", flex: 1 }}
                    resizeMode="stretch"
                  />
                  <Image
                    source={BottomBackBottom}
                    style={{ width: "100%", height: 8, marginTop: -1 }}
                    resizeMode="stretch"
                  />
                  <FlatList
                    data={channels}
                    style={{
                      position: "absolute",
                      top: 2,
                      left: 2,
                      right: 2,
                      bottom: 2,
                      paddingLeft: 13,
                      paddingRight: 13
                    }}
                    renderItem={({ item, index }) => (
                      <View style={index == channels.length - 1 ? styles.bottomEntryLast : styles.bottomEntry}>
                        <Image
                          source={{ uri: Config.STATIC_URL + "/" + item.profile.profilePic}}
                          style={{
                            borderRadius: 23,
                            width: 45,
                            height: 45,
                            marginRight: 13
                          }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontFamily: "Droidsans",
                              fontSize: 22,
                              fontWeight: "bold",
                              color: "#C457BE"
                            }}
                            numberOfLines={1}
                          >
                            {item.stationName}
                          </Text>
                          <Text
                            style={{
                              fontFamily: "Droidsans",
                              fontSize: 12,
                              color: "#C457BE"
                            }}
                            numberOfLines={1}
                          >
                            {item.profile.firstName}
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => {}}>
                          <Image
                            source={MessageBtnImage}
                            style={{
                              width: 30,
                              height: 32,
                              marginRight: 15
                            }}
                            resizeMode="stretch"
                          />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => {}}>
                          <Image
                            source={BroadcastBtnImage}
                            style={{
                              width: 30,
                              height: 32
                            }}
                            resizeMode="stretch"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                    keyExtractor={(item, index) => index.toString() }
                  />
                  <Image
                    source={BottomOverlay}
                    style={{
                      position: "absolute",
                      bottom: 2,
                      left: 0,
                      width: "100%",
                      height: 100
                    }}
                    resizeMode="stretch"
                    pointerEvents="none"
                  />
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>
      </UserInactivityCheck>
    )
  }
}

const styles = StyleSheet.create({
  carouselTitle: {
    color: "#C457BE",
    fontFamily: "Droidsans",
    fontWeight: "bold",
    fontSize: 13,
  },
  carouselTitleActive: {
    maxWidth: ITEM_WIDTH - 13,
    color: "#C457BE",
    fontFamily: "Droidsans",
    fontWeight: "bold",
    fontSize: 13,
    textShadowColor: "#7473FF",
    textShadowRadius: 4
  },
  vcarouselText: {
    color: "#ABAED0",
    fontFamily: "Droidsans",
    fontWeight: "bold",
    fontSize: 11,
    textAlignVertical: "center"
  },
  bottomEntry: {
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
    flexDirection: "row"
  },
  bottomEntryLast: {
    marginTop: 12,
    paddingBottom: 12,
    width: '100%',
    alignItems: 'center',
    flexDirection: "row"
  },
  buttontext: {
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 0 },
    textShadowRadius: 2,
    color: "#abaed0",
    fontFamily: "Droidsans",
    fontSize: 14,
    fontWeight: "400"
  }
});

const STATIONS_BY_GENRE = gql`
  query($genre: String) {
    broadcastingStationsByGenre(genre: $genre) {
      id
      stationName
      albumimage
      exploreValue
      freHeart
      freTier1
      freTier2
      freBinoculars
      profile {
        firstName
        profilePic
      }
    }
  }
`;

const ADD_TO_USER_GUEST_STATIONS = gql`
  mutation($channelId: Int) {
    addToUserGuestChannels(channelId: $channelId)
  }
`;

const REMOVE_FROM_USER_GUEST_STATIONS = gql`
  mutation($channelId: Int) {
    removeFromUserGuestChannels(channelId: $channelId)
  }
`;

const GENRES = gql`
  {
    broadcastingStationGenres
  }
`;

export default connect(state => ({state: state.app}), actions)(GuestListener);