import React, { Component } from 'react';
import {
  Text,
  ScrollView,
  Image,
  ImageBackground,
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  AsyncStorage
} from "react-native";

import { AnimatedCircularProgress } from 'react-native-circular-progress';

import Background from "../../assets/music/background.png";

import TierButtonBack from "../../assets/tracks_levels/tier-button-back.png";
import TierBottomBack from "../../assets/tracks_levels/tier-bottom-back.png";

import HeartImg from "../../assets/tracks_levels/heart.png";
import IImg from "../../assets/I.png";
import IIImg from "../../assets/II.png";
import BinocularImg from "../../assets/tracks_levels/binoculars.png";

import DialBack from "../../assets/tracks_levels/dial-back.png";
import PlusMinusBack from "../../assets/tracks_levels/plus-minus-back.png";
import PlusImg from "../../assets/tracks_levels/plus.png";
import MinusImg from "../../assets/tracks_levels/minus.png";

import AlbumBackTop from "../../assets/tracks_levels/album-back-top.png";
import AlbumBackMiddle from "../../assets/tracks_levels/album-back-middle.png";
import AlbumBackBottom from "../../assets/tracks_levels/album-back-bottom.png";

import TrackImage from "../../assets/tracks_levels/overlay.png";
import ThumbImage from "../../assets/tracks_levels/scroll-head.png";
import HeadPlay from "../../components/HeadPlay";
import Slider from "../../components/CustomSlider";

import AlbumItemBack from "../../assets/tracks_levels/album-item-back.png";
import AlbumImageOverlay from "../../assets/tracks_levels/album-image-overlay.png";
import ButtonBack from "../../assets/buttonback.png";

import { connect } from 'react-redux';
import * as actions from '../../redux/actions';
import { Mutation } from 'react-apollo';
import { gql } from "apollo-boost";
import Error from "../../components/Error";
import { PlayQueue } from '../../utils/utils';
import LoadingModal from "../../components/Loading";
import UserInactivityCheck from '../../components/UserInactivityCheck';

class ControlScreen extends Component {

  constructor(props) {
    super(props);

    const channel = props.state.selectedChannel;
    if (!channel) {
      props.navigation.navigate("CreateChannel");
    }

    this.state = {
      exploreValue: channel ? channel.exploreValue : 50,
      freHeart: channel ? channel.freHeart : 0,
      freTier1: channel ? channel.freTier1 : 0,
      freTier2: channel ? channel.freTier2 : 0,
      freBinoculars: channel ? channel.freBinoculars : 0,
      selectedTier: "",
      errorMessage: "",
      isModified: false,
      isLoading: false
    };

    this.timer = 0;
    this.updatePlayQueue = () => {};
    this._unsubscribe = null;
    this._unsubscribeFocus = null;
    
    this.updateChannel = this.updateChannel.bind(this);
    this.updateFrequency = this.updateFrequency.bind(this);
  }

  async componentDidMount() {
    this._unsubscribe = this.props.navigation.addListener('willBlur', () => {
      if (this.state.isModified) {
        this.setState({
          isModified: false
        });
        this.updateChannel();
      }
    });
    this._unsubscribeFocus = this.props.navigation.addListener('willFocus', () => {
      const channel = this.props.state.selectedChannel;
      if (!channel) {
        this.props.navigation.navigate("CreateChannel");
      }
    });
  }

  componentWillUnmount() {
    if (this._unsubscribe && this._unsubscribe.remove instanceof Function) {
      this._unsubscribe.remove();
    }
    if (this._unsubscribeFocus && this._unsubscribeFocus.remove instanceof Function) {
      this._unsubscribeFocus.remove();
    }
  }

  async UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.state.selectedChannel != nextProps.state.selectedChannel) {

      if (this.state.isModified) {
        this.setState({
          isModified: false
        });
        await this.updateChannel();
      }
      const channel = nextProps.state.selectedChannel;

      this.setState({
        exploreValue: channel ? channel.exploreValue : 50,
        freHeart: channel ? channel.freHeart : 0,
        freTier1: channel ? channel.freTier1 : 0,
        freTier2: channel ? channel.freTier2 : 0,
        freBinoculars: channel ? channel.freBinoculars : 0,
        selectedTier: "",
        errorMessage: ""
      });
    }
  }

  async updateChannel() {
    if (this.state.isModified) {
      this.setState({
        isModified: false
      });
    } else {
      return;
    }

    this.setState({
      isLoading: true
    });
    const { exploreValue, freHeart, freTier1, freTier2, freBinoculars } = this.state;
    try {
      const { data } = await this.updatePlayQueue({
          variables: {
            id: this.props.state.selectedChannel.id,
            exploreValue,
            freHeart,
            freTier1,
            freTier2,
            freBinoculars
          }
      });

      this.setState({
        errorMessage: ""
      });
      let sChannel = {};
      const mChannels = this.props.state.myChannels.map(channel => {
        if (channel.id == data.updateChannelPlayQueue.id) {
          sChannel = {
            ...channel,
            ...data.updateChannelPlayQueue
          }
          return sChannel;
        } else {
          return channel;
        }
      });
      this.props.state.playQueue.updateChannel(sChannel);
      this.props.saveMyChannels(mChannels);
      this.props.saveSelectedChannel(sChannel);
    } catch (error) {
      if (error.message.replace("GraphQL error:", "").trim().substr(0, 8) == "Login to") {
        await AsyncStorage.removeItem("authtoken1");
        await AsyncStorage.removeItem("loggedIn");
        this.props.saveProfile(null);
        this.props.navigation.navigate("Auth");
      } else {
        this.setState({
          errorMessage: error.message
        });
      }
    }
    this.setState({
      isLoading: false
    });
  }

  updateFrequency(tier, action) {
    let { freHeart, freTier1, freTier2, freBinoculars, selectedTier } = this.state;
    let freArr = [freHeart, freTier1, freTier2, freBinoculars];
    let orderArr = [];
    const mapper = {
      tierHeart: 0,
      tier1: 1,
      tier2: 2,
      tierBinoculars: 3
    };
    
    const filtered = [0, 1, 2, 3].filter(num => num != mapper[tier] && (selectedTier == "" || num != mapper[selectedTier]));
    if (tier == selectedTier || selectedTier == "") {
      orderArr = [mapper[tier], ...filtered];
    } else {
      orderArr = [mapper[tier], ...filtered, mapper[selectedTier]]
    }

    let isChanged = false;
    
    if (action == "plus" && freArr[orderArr[0]] < 80) {
      isChanged = true;
      freArr[orderArr[0]] += 5;
      if (freArr[orderArr[3]] > 0) {
        freArr[orderArr[3]] -= 5;
      } else if (freArr[orderArr[2]] > 0) {
        freArr[orderArr[2]] -= 5;
      } else {
        freArr[orderArr[1]] -= 5;
      }
    } else if (action == "minus" && freArr[orderArr[0]] > 0) {
      isChanged = true;
      freArr[orderArr[0]] -= 5;
      if (freArr[orderArr[3]] < 80) {
        freArr[orderArr[3]] += 5;
      } else if (freArr[orderArr[2]] < 80) {
        freArr[orderArr[2]] += 5;
      } else {
        freArr[orderArr[1]] += 5;
      }
    }

    if (isChanged) {
      this.setState({
        freHeart: freArr[0],
        freTier1: freArr[1],
        freTier2: freArr[2],
        freBinoculars: freArr[3],
        isModified: true
      });
      // this.updateChannel();
    }
  }

  // showAlbums = (tracks) => {
  //   return (
  //     <View style={tracks.length > 0 ? { marginHorizontal: 5 } : {display: "none" } }>
  //       <Image
  //         source={AlbumBackTop}
  //         style={styles.albumBackTop}
  //       />
  //       <ImageBackground
  //         source={AlbumBackMiddle}
  //         style={styles.albumContainer}
  //         resizeMode='stretch'
  //       >
  //         <View style={{ flex: 1, marginHorizontal: 15 }}>
  //           <FlatList
  //             data={tracks}
  //             renderItem={({ item, index }) => (
  //               <View style={{ marginBottom: 15, width: '23%', alignItems: 'center', marginHorizontal: "1%" }}>
  //                 <ImageBackground
  //                   source={AlbumItemBack}
  //                   style={{width: "100%", aspectRatio: 71 / 87 }}
  //                 >
  //                   <ImageBackground
  //                     source={{ uri: item.imgsource }}
  //                     imageStyle={{
  //                       borderColor: "#202024",
  //                       borderWidth: 2,
  //                       borderRadius: 9,
  //                     }}
  //                     style={{
  //                       width: "100%",
  //                       aspectRatio: 1
  //                     }}
  //                   >
  //                     <ImageBackground
  //                       source={AlbumImageOverlay}
  //                       imageStyle={{
  //                         borderRadius: 9
  //                       }}
  //                       style={{
  //                         width: "100%",
  //                         height: "100%",
  //                         resizeMode: "stretch",
  //                         justifyContent: "flex-end",
  //                         alignItems: "center"
  //                       }}
  //                     >
  //                       <Text
  //                         numberOfLines={1}
  //                         style={{
  //                           color: "#abaed0",
  //                           fontSize: 11,
  //                           marginBottom: 3,
  //                           marginHorizontal: 2,
  //                           textAlign: "center"
  //                         }}
  //                       >{item.title}</Text>
  //                     </ImageBackground>
  //                   </ImageBackground>
  //                   <View style={{ flex: 1, width: "100%" }}>
  //                     <Text
  //                       style={{
  //                         color:'#ABAED0',
  //                         fontSize: 9,
  //                         marginHorizontal: 2,
  //                         textAlign: "center"
  //                       }}
  //                       numberOfLines={1}
  //                     >{item.name}</Text>
  //                   </View>
  //                 </ImageBackground>
  //               </View>
  //             )}
  //             numColumns={4}
  //             keyExtractor={(item, index) => index}
  //           />
  //         </View>
  //       </ImageBackground>
  //       <Image
  //         source={AlbumBackBottom}
  //         style={styles.albumBackBottom}
  //       />
  //     </View>
  //   )
  // }

  render() {
    const channel = this.props.state.selectedChannel;
    if (!channel) {
      return null;
    }

    const {
      exploreValue,
      freHeart,
      freTier1,
      freTier2,
      freBinoculars,
      selectedTier
    } = this.state;
    return (
      <Mutation mutation={UPDATE_CHANNEL_PLAY_QUEUE}>
        {(updateChannelPlayQueue) => {
          this.updatePlayQueue = updateChannelPlayQueue;

          return (
            <UserInactivityCheck navigation={this.props.navigation}>
              <View style={{ flex: 1 }}>
                {this.state.isLoading && <LoadingModal />}
                {/* {this.state.errorMessage != '' && <Error message={this.state.errorMessage} />} */}
                <ImageBackground
                  source={Background}
                  style={{ flex: 1,  height: null,  width: null }}
                  resizeMode="cover"
                >
                  <View style={{ margin: 15 }}>
                    <HeadPlay
                      navigation={this.props.navigation}
                    />
                    <ScrollView>
                      <View style={{ marginBottom: 200 }}>
                        <View style={{ flexDirection: "row", marginTop: 30 }}>
                          <TouchableOpacity
                            onPress={() => {
                              this.setState({ selectedTier: "tierHeart" });
                            }}
                            style={styles.multipleIconContainer1}
                          >
                            <ImageBackground
                              imageStyle={{ borderRadius: 5 }}
                              source={TierButtonBack}
                              style={styles.imagecontainer}
                            >
                              <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Image
                                  source={HeartImg}
                                  style={{ width: "33%", height: "30%", resizeMode: 'contain' }}
                                />
                                {/* <Text style={styles.tierText}>{ channel.tierHeart.length }</Text> */}
                              </View>
                            </ImageBackground>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => { this.setState({ selectedTier: "tier1" }); }}
                            style={styles.multipleIconContainer1}
                          >
                            <ImageBackground
                              imageStyle={{ borderRadius: 5 }}
                              source={TierButtonBack}
                              style={styles.imagecontainer}
                            >
                              <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Image
                                  source={IImg}
                                  style={{ width: "33%", height: "30%", resizeMode: 'contain' }}
                                />
                                {/* <Text style={styles.tierText}>{ channel.tier1.length }</Text> */}
                              </View>
                            </ImageBackground>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => { this.setState({ selectedTier: "tier2" }); }}
                            style={styles.multipleIconContainer1}
                          >
                            <ImageBackground
                              imageStyle={{ borderRadius: 5 }}
                              source={TierButtonBack}
                              style={styles.imagecontainer}
                            >
                              <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <Image
                                  source={IIImg}
                                  style={{ width: "33%", height: "30%", resizeMode: 'contain' }}
                                />
                                {/* <Text style={styles.tierText}>{ channel.tier2.length }</Text> */}
                              </View>
                            </ImageBackground>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => { this.setState({ selectedTier: "tierBinoculars" }); }}
                            style={styles.multipleIconContainer1}
                          >
                            <ImageBackground
                              imageStyle={{ borderRadius: 5 }}
                              source={TierButtonBack}
                              style={styles.imagecontainer}
                            >
                              <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                  <Image
                                    source={BinocularImg}
                                    style={{ width: "42%", height: "30%", resizeMode: 'contain' }}
                                  />
                                  {/* <Text style={styles.tierText}>{ channel.tierBinoculars.length }</Text> */}
                              </View>
                            </ImageBackground>
                          </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: "row", marginTop: 10 }}>
                          <ControlAudioItem
                            fill={freHeart}
                            onAction={action => this.updateFrequency("tierHeart", action)}
                          />
                          <ControlAudioItem
                            fill={freTier1}
                            onAction={action => this.updateFrequency("tier1", action)}
                          />
                          <ControlAudioItem
                            fill={freTier2}
                            onAction={action => this.updateFrequency("tier2", action)}
                          />
                          <ControlAudioItem
                            fill={freBinoculars}
                            onAction={action => this.updateFrequency("tierBinoculars", action)}
                          />
                        </View>

                        <View style={{ marginHorizontal: 5, marginTop: 10 }}>
                          {/* {exploreValue == 0 && 
                            <Text style={styles.exploreText}>B Sides</Text>
                          } */}
                          {exploreValue == 25 &&
                            <View style={{ width: "30%", alignItems: "center" }}>
                              <Text style={styles.exploreText}>Eclectic</Text>
                            </View>
                          }
                          {exploreValue == 50 &&
                            <View style={{ width: "100%", alignItems: "center" }}>
                              <Text style={styles.exploreText}>Balanced</Text>
                            </View>
                          }
                          {exploreValue == 75 &&
                            <View style={{ width: "30%", marginLeft: "70%", alignItems: "center" }}>
                              <Text style={styles.exploreText}>Mainstream</Text>
                            </View>
                          }
                          {/* {exploreValue == 100 &&
                            <View style={{ width: "100%", alignItems: "flex-end" }}>
                              <Text style={styles.exploreText}>Favorites</Text>
                            </View>
                          } */}
                        </View>
                        <Slider
                          minimumValue={25}
                          maximumValue={75}
                          step={25}
                          value={exploreValue}
                          minimumTrackTintColor="#6656ff00"
                          maximumTrackTintColor="#FF616164"
                          thumbImage={ThumbImage}
                          trackImage={TrackImage}
                          thumbTintColor="#F4F4F400"
                          thumbTouchSize={{width: 28, height: 28}}
                          thumbStyle={{width: 28, height: 28}}
                          trackStyle={{
                            height: 13,
                            borderRadius: 6,
                            backgroundColor: "#4D4F5D"
                          }}
                          style={{
                            marginHorizontal: "15%",
                            width: "70%"
                          }}
                          onValueChange={(val) => {
                            if (val != exploreValue) {
                              this.setState({
                                exploreValue: val,
                                isModified: true
                              });
                            }
                          }}
                          // onSlidingComplete={(val) => {
                          //     this.updateChannel();
                          // }}
                        />
                        <View style={{ flexDirection: 'row', marginHorizontal: 5, marginBottom: 10 }}>
                          <Text style={{ color: '#abaed0', fontSize: 15, textAlign:'center', width: "30%" }}>Explore</Text>
                          <Text style={{ color: '#abaed0', fontSize: 15, textAlign:'center', marginLeft: "30%", width: "40%" }}>Recommended</Text>
                        </View>
                        <View style={{ marginHorizontal: 2, marginTop: 10, marginBottom: 20 }}>
                          <ImageBackground
                            source={ButtonBack}
                            imageStyle={{ borderRadius: 5 }}
                            style={{
                              width: "100%",
                              height: 40,
                              borderRadius: 5
                            }}
                          >
                            <TouchableOpacity onPress={this.updateChannel}>
                              <View
                                style={{
                                  // borderColor: "#202024",
                                  // borderStyle: "solid",
                                  // borderRadius: 5,
                                  // borderWidth: 1,
                                  justifyContent: "center",
                                  paddingTop: 10,
                                  paddingBottom: 10,
                                  alignItems: "center"
                                }}
                              >
                                <Text style={styles.buttontext}>Submit Queue Settings</Text>
                              </View>
                            </TouchableOpacity>
                          </ImageBackground>
                        </View>
                        {/* <View style={{ flexDirection: "row", marginTop: 10, marginHorizontal: 20 }}>
                          <TouchableOpacity
                            onPress={() => {
                              this.setState({
                                selectedTier: "tierHeart"
                              });
                            }}
                            style={styles.tierBottomContainer}
                          >
                            <ImageBackground
                              imageStyle={{ borderRadius: 5 }}
                              source={TierBottomBack}
                              style={styles.bottomTierImageBack}
                            >
                              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Image
                                  source={HeartImg}
                                  style={{ width: "33%", height: "37%", resizeMode: 'contain' }}
                                />
                              </View>
                            </ImageBackground>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              this.setState({
                                selectedTier: "tier1"
                              })
                            }}
                            style={styles.tierBottomContainer}
                          >
                            <ImageBackground
                              imageStyle={{ borderRadius: 5 }}
                              source={TierBottomBack}
                              style={styles.bottomTierImageBack} >
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                  <Image
                                    source={IImg}
                                    style={{ width: "33%", height: "37%", resizeMode: 'contain' }}
                                  />
                                </View>
                            </ImageBackground>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              this.setState({
                                selectedTier: "tier2"
                              });
                            }}
                            style={styles.tierBottomContainer}
                          >
                            <ImageBackground
                              imageStyle={{ borderRadius: 5 }}
                              source={TierBottomBack}
                              style={styles.bottomTierImageBack} >
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                  <Image
                                    source={IIImg}
                                    style={{ width: "33%", height: "37%", resizeMode: 'contain' }}
                                  />
                                </View>
                            </ImageBackground>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => {
                              this.setState({
                                selectedTier: "tierBinoculars"
                              });
                            }}
                            style={styles.tierBottomContainer}
                          >
                            <ImageBackground
                              imageStyle={{ borderRadius: 5 }}
                              source={TierBottomBack}
                              style={styles.bottomTierImageBack} >
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                  <Image
                                    source={BinocularImg}
                                    style={{ width: "44%", height: "37%", resizeMode: 'contain' }}
                                  />
                                </View>
                            </ImageBackground>
                          </TouchableOpacity>
                        </View>
                        {this.showAlbums(
                          selectedTier ? (channel[selectedTier] || []) : []
                        )} */}
                      </View>
                    </ScrollView>
                  </View>
                </ImageBackground>
              </View>
            </UserInactivityCheck>
          )
        }}
      </Mutation>
    );
  }
}

function ControlAudioItem({fill, onAction}) {
  return (
    <View style={styles.multipleIconContainer2}>
      <ImageBackground
        imageStyle={{ borderRadius: 5 }}
        source={DialBack}
        style={styles.imagecontainer2} >
        <View style={{ height: "100%", flexDirection: 'column', width:"100%", alignItems: "center" }}>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", width: "100%" }}>
            <View style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "#111115",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <AnimatedCircularProgress
                size={54}
                width={4}
                fill={fill}
                tintColor="#8874FF"
                backgroundColor="#313238"
                rotation={0}
              >
                {val => (
                  <View style={{
                    width: 46,
                    height: 46,
                    borderRadius: 23,
                    backgroundColor: "#1b1a22",
                    justifyContent: "center",
                    alignItems: "center",
                    borderColor: "#0b0c0f",
                    borderWidth: 1
                  }}>
                    <View style={{
                      width: 38,
                      height: 38,
                      borderRadius: 19,
                      backgroundColor: "#281329",
                      justifyContent: "center",
                      alignItems: "center",
                      borderColor: "#0e0b11",
                      borderWidth: 1
                    }}>
                      <Text style={{
                        color: '#DD54C2',
                        fontWeight: "bold",
                        fontSize: 12,
                        textShadowColor: "#CC3FDF",
                        textShadowOffset: {width: 0, height: 0},
                        textShadowRadius: 45
                      }}>
                        {`${Math.floor(val)}%`}
                      </Text>
                    </View>
                  </View>
                )}
              </AnimatedCircularProgress>
            </View>
          </View>
          <View style={{
            flex: 1,
            width: "34%"
          }}>
            <ImageBackground
              imageStyle={{ borderRadius: 5 }}
              source={PlusMinusBack}
              style={styles.plusMinusContainer}
            >
              <TouchableOpacity
                onPress={() => {
                  onAction("plus");
                }}
              >
                <View style={styles.plusImageWrapper}>
                  <Image
                    source={PlusImg}
                    style={styles.plusImage}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  onAction("minus");
                }}
              >
                <View style={styles.minusImageWrapper}>
                  <Image
                    source={MinusImg}
                    style={styles.plusImage}
                  />
                </View>
              </TouchableOpacity>
            </ImageBackground>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    borderRadius: 5,
    flexDirection: "column"
  },
  imagetext: {
    color: "#abaed0",
    fontSize: 10
  },
  icontext: {
    color: "#abaed0",
    marginTop: 5,
    fontSize: 12,
    fontWeight: "700"
  },
  iconparentcontainer: {
    flex: 3,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  rowContainer: {
    flex: 1,
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  singleItem: {
    flex: 1,
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5
  },
  multipleIconContainer1: {
    flex: 1,
    justifyContent: "space-between",
    marginLeft: 6,
    marginRight: 6,
    alignItems: 'center',
    borderRadius: 5
  },
  multipleIconContainer2: {
    flex: 1,
    justifyContent: "space-between",
    marginLeft: 5,
    marginRight: 5,
    alignItems: 'center',
    borderRadius: 10
  },
  imagecontainer: {
    width: "100%",
    height: undefined,
    aspectRatio: 1,
    justifyContent: 'center',
  },
  imagecontainer2: {
    width: "100%",
    height: undefined,
    aspectRatio: 74.3 / 144.8,
  },
  plusMinusContainer: {
    width: "100%",
    height: undefined,
    aspectRatio: 24 / 48,
    resizeMode: "contain",
    marginTop: "30%",
    flexDirection: "column",
    alignItems: "center"
  },
  plusImageWrapper: {
    width: "80%",
    marginTop: "25%"
  },
  minusImageWrapper: {
    width: "80%",
    marginTop: "5%"
  },
  plusImage: {
    width: "100%",
    height: undefined,
    resizeMode: "contain",
    aspectRatio: 1
  },
  image: {
    width: "100%",
    flex: 1
  },
  tierBottomContainer: {
    flex: 1,
    justifyContent: "space-between",
    marginLeft: 3,
    marginRight: 3,
    alignItems: 'center',
    borderRadius: 5
  },
  bottomTierImageBack: {
    width: "100%",
    height: undefined,
    aspectRatio: 70 / 57,
    justifyContent: 'center',
  },
  albumBackTop: {
    width: "100%",
    height: undefined,
    aspectRatio: 336 / 12
  },
  albumContainer: {
    width: "100%",
    resizeMode: "repeat"
  },
  albumBackBottom: {
    width: "100%",
    height: undefined,
    aspectRatio: 336 / 13
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
  },
  tierText: {
    color: '#abaed0',
    fontSize: 20,
    marginTop: 5
  },
  exploreText: {
    color: '#abaed0',
    fontSize: 15
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

const UPDATE_CHANNEL_PLAY_QUEUE = gql`
  mutation($id: Int, $exploreValue: Int, $freHeart: Int, $freTier1: Int, $freTier2: Int, $freBinoculars: Int) {
    updateChannelPlayQueue(
      id: $id
      exploreValue: $exploreValue
      freHeart: $freHeart
      freTier1: $freTier1
      freTier2: $freTier2
      freBinoculars: $freBinoculars
    ){
      id
      exploreValue
      freHeart
      freTier1
      freTier2
      freBinoculars
    }
  }
`;

export default connect(state => ({state: state.app}), actions)(ControlScreen);