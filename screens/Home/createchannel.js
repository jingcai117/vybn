import React from "react";

import {
    ScrollView, View, Text, ImageBackground, Image, StyleSheet,
    TouchableOpacity, TextInput, FlatList, AsyncStorage
} from "react-native";
import { Grid, Row } from "native-base";
import { connect } from 'react-redux';
import axios from 'axios';
import { Mutation } from "react-apollo";
import client from "../../graphql/client";
import {
    CREATE_CHANNEL_BACK,
    FILL_CHANNEL_TRACKS,
    MY_CHANNELS
} from "../../graphql/queries";

import * as Config from '../../config';
import { ButtonComponent, Dash } from "../../components/Form";
import * as actions from '../../redux/actions';

import background from "../../assets/background5.png";
import TrackNameBackground from "../../assets/music/track_name_background.png";
import Magnifier from "../../assets/maginifier.png";
import BottomBackTop from "../../assets/guest/bottom-back-top.png";
import BottomBackMiddle from "../../assets/guest/bottom-back-middle.png";
import BottomBackBottom from "../../assets/guest/bottom-back-bottom.png";
import AddBut from "../../assets/add.png";
import LoadingModal from "../../components/Loading";
import { PlayQueue } from "../../utils/utils";
import showError from "../../utils/showError";
import CreateStationModal from "../../components/CreateStationModal";
import UserInactivityCheck from '../../components/UserInactivityCheck';

class CreateChannel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            stationName: '',
            searchTxt: '',
            searchTracks: [],
            // searchArtists: [],
            // searchAlbums: [],
            selectedTracks: [],
            isloading: false, // FOR REST API CALL
            isCreating: false,
            isactive: 0
        }
    }

    // showTracks = ({ searchTracks, selectedTracks }) => {
    //     const p = this;
    //     return (
    //         <View style={{flex:1, alignItems:'center'}}>
    //             <Text style={{color:'white'}}>Song</Text>
    //             <ScrollView>
    //                 {searchTracks.map(function (item, i) {
    //                     return (
    //                         <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, flex: 1 }}>
    //                             <View style={{ width: '20%' }}>
    //                                 <Image
    //                                     source={{ uri: item.imgsource }}
    //                                     style={{ width: 50, height: 60, marginRight: 10 }} />
    //                             </View>
    //                             <View style={{ width: '65%' }}>
    //                                 <Text numberOfLines={1} style={{ color: '#ABAED0', fontSize: 11, marginBottom: 3, width: '100%' }}>{item.title}</Text>
    //                                 <Text numberOfLines={1} style={{ color: '#ABAED0', fontSize: 10, width: '100%' }}>{item.name}</Text>
    //                             </View>
    //                             <View style={{ width: '15%' }}>
    //                                 <TouchableOpacity style={{ alignItems: 'center', background: '#fff' }} onPress={() => {
    //                                     var selArr = selectedTracks;
    //                                     selArr.push(item);
    //                                     p.setState({ selectedTracks: selArr });

    //                                     let filteredArray = p.state.searchTracks.filter(item1 => item1 !== item)
    //                                     p.setState({ searchTracks: filteredArray });
    //                                 }}>
    //                                     <Image source={AddBut} style={{ width: 25, height: 25, justifyContent: 'center' }} />
    //                                 </TouchableOpacity>
    //                             </View>
    //                         </View>
    //                     );
    //                 })}
    //             </ScrollView>
    //         </View>
    //     )
    // }

    showSearchedTracks = () => {
        const { searchTracks, selectedTracks } = this.state;
        return (
            <View style={{ width: "100%", flex: 1 }}>
                <Image
                    source={BottomBackTop}
                    style={{ width: "100%", height: 7, opacity: 0.75 }}
                    resizeMode="stretch"
                />
                <Image
                    source={BottomBackMiddle}
                    style={{ width: "100%", flex: 1, opacity: 0.75 }}
                    resizeMode="stretch"
                />
                <Image
                    source={BottomBackBottom}
                    style={{ width: "100%", height: 8, marginTop: -1, opacity: 0.75 }}
                    resizeMode="stretch"
                />
                <FlatList
                    data={searchTracks}
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
                        <View style={index == searchTracks.length - 1 ? styles.bottomEntryLast : styles.bottomEntry}>
                            <Image
                                source={{ uri: item.imgsource }}
                                style={{
                                    borderRadius: 8,
                                    width: 50,
                                    height: 50,
                                    marginRight: 10
                                }}
                            />
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        fontFamily: "Droidsans",
                                        color: '#ABAED0',
                                        fontSize: 14,
                                        marginBottom: 3
                                    }}
                                    numberOfLines={1}
                                >
                                    {item.title}
                                </Text>
                                <Text
                                    style={{
                                        fontFamily: "Droidsans",
                                        fontSize: 12,
                                        color: '#ABAED0'
                                    }}
                                    numberOfLines={1}
                                >
                                    {item.name}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={() => {
                                const selArr = selectedTracks;
                                selArr.push(item);
                                const filteredArray = this.state.searchTracks.filter(item1 => item1 !== item)
                                this.setState({
                                    selectedTracks: selArr,
                                    searchTracks: filteredArray
                                });
                            }}>
                                <Image source={AddBut} style={{ width: 25, height: 25, marginLeft: 5 }} />
                            </TouchableOpacity>
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString() }
                />
            </View>
        );
    };

    addedTracks = ({ selectedTracks }) => {
        return (
            <View style={selectedTracks.length > 0 ? { width: '100%' } : { display: "none" }, { flex: 1 }}>
                <Text style={{
                    color: '#fff',
                    fontFamily: 'Droidsans',
                    fontWeight: '500',
                    marginTop: 10,
                    marginBottom: 5,
                    alignSelf: 'center',
                    fontSize: 16
                }}>Added</Text>
                <ScrollView horizontal={true} bounces>
                    {selectedTracks.map(function (item, i) {
                        return (
                            <View key={i}>
                                <Image
                                    source={{ uri: item.imgsource }}
                                    style={{ width: 50, height: 50, borderRadius: 10, marginRight: 5 }} />
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        )
    }

    getTracks = async () => {
        this.setState({isloading: true});
        let tracks = [];
        try {
            const res = await axios.get(Config.RADIO_SEARCHTRACKS + "&keyword=" + this.state.searchTxt + "&page=1&pageSize=30");
            if (res.data.Tracks && res.data.Tracks.length > 0) {
                tracks = res.data.Tracks.filter(t => {
                    return this.state.selectedTracks.findIndex(st => st.MnetId == t.MnetId) == -1;
                });
            }
            if (tracks.length == 0) {
                showError("No search result!");
            }
        } catch (e) {
            console.log(e);
            showError("Error in searching tracks");
        }
        
        this.setState({
            searchTracks: this.standazation(tracks),
            isloading: false
        });
    }

    standazation = (arr) => {
        var trackArr = [];
        arr.map(function (item) {
            var title = item.Title;
            var name = item.Artist ? item.Artist.Name : "";
            trackArr.push({
                MnetId: item.MnetId,
                title: title,
                name: name,
                artistMnetId: item.Artist ? item.Artist.MnetId : "",
                imgsource: item.Album ? item.Album.Images.Album75x75 : '',
                imgsource150: item.Album ? item.Album.Images.Album150x150 : '',
                musicsource: item.SampleLocations[1].Location,
                genre: item.Genre,
                releaseDate: item.ReleaseDate,
                bitrate: item.Bitrate,
                duration: item.Duration,
                trackNumber: item.TrackNumber,
                discNumber: item.DiscNumber,
                albumMnetId: item.Album ? item.Album.MnetId : '',
                albumTitle: item.Album ? item.Album.Title : '',
                label: item.Album ? item.Album.Label : '',
                labelOwnerId: item.Album ? item.Album.LabelOwnerId : 0
            });
        });
        return trackArr;
    }

    render() {
        const { searchTracks, selectedTracks } = this.state;
        return (
            <Mutation mutation={CREATE_CHANNEL_BACK}>
                {(createChannelBack, { loading, error }) => {
                    return (
                        <UserInactivityCheck
                            navigation={this.props.navigation}
                        >
                            <Grid>
                                {(loading || this.state.isloading) && <LoadingModal />}
                                {this.state.isCreating && <CreateStationModal />}
                                <Row>
                                    <ImageBackground
                                        source={background}
                                        style={{ flex: 1, height: "100%", width: "100%" }}
                                        resizeMode="cover">
                                        <View style={{ marginTop: 40, marginBottom: 15, alignItems: 'center',flex:1 , marginLeft:30, marginRight:30}}>
                                            <Text style={{ color: "#fff", fontFamily: "Droidsans", fontSize: 21, fontWeight: "700" }}>
                                                CREATE YOUR STATION
                                            </Text>
                                            <ImageBackground
                                                imageStyle={{
                                                    shadowColor: "#4d4f5e", shadowOffset: { width: 2, height: 0 }, shadowRadius: 0,
                                                    borderColor: "#202024", borderWidth: 1, borderRadius: 5
                                                }}
                                                style={{ height: null, width: '100%', marginTop: 25}}
                                                source={TrackNameBackground} >
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <TextInput
                                                        style={{ marginLeft: 5, height: 40, color: '#abaed0', flex: 1 }}
                                                        value={this.state.stationName}
                                                        onChangeText={text => { this.setState({ stationName: text }) }}
                                                        placeholder=" Station Name"
                                                        placeholderTextColor="#abaed0" />
                                                </View>
                                            </ImageBackground>

                                            <Text style={{ color: "#fff", fontFamily: "Droidsans", fontSize: 13, marginTop: 10 }}>
                                                Enter a song, artist, or category to start building your station.
                                            </Text>

                                            <ImageBackground
                                                imageStyle={{
                                                    shadowColor: "#4d4f5e", shadowOffset: { width: 2, height: 0 }, shadowRadius: 0,
                                                    borderColor: "#202024", borderWidth: 1, borderRadius: 5
                                                }}
                                                style={{ height: null, width: '100%', marginTop: 10 }}
                                                source={TrackNameBackground} >
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <TextInput
                                                        style={{ marginLeft: 5, height: 40, color: '#abaed0', flex: 1 }}
                                                        value={this.state.searchTxt}
                                                        onChangeText={text => { this.setState({ searchTxt: text }) }}
                                                        placeholder=" Enter a song, artist, or category"
                                                        placeholderTextColor="#abaed0" />
                                                    <TouchableOpacity style={{ position: 'absolute', right: 10 }} onPress={this.getTracks} >
                                                        <Image source={Magnifier} style={{ width: 25, height: 25 }} />
                                                    </TouchableOpacity>
                                                </View>
                                            </ImageBackground>
                                            {(searchTracks.length > 0 || selectedTracks.length > 0) && 
                                                <View style={{flex:1, width:'100%', marginTop: 15 }}>
                                                    {/* <View style={{flex:2, borderBottomColor: 'white', borderBottomWidth: 1, alignItems:'center'}}>
                                                        { this.showTracks(this.state) }
                                                    </View> */}
                                                    { this.showSearchedTracks() }
                                                    <View style={{ height: 88, width:'100%' }}>
                                                        {this.addedTracks(this.state)}
                                                    </View>
                                                </View>
                                            }
                                            <ButtonComponent
                                                style={{width: '100%', height: 40, marginTop: 15 }}
                                                text="Start Listening"
                                                loading={loading}
                                                onPress={async () => {
                                                    if (this.state.stationName == '') {
                                                        showError('Input Station Name');
                                                    } else if (this.state.selectedTracks.length < 1) {
                                                        showError('No tracks are selected')
                                                    } else {
                                                        this.setState({ isCreating: true });
                                                        this.props.saveIsWaiting(true);
                                                        const stationName = this.state.stationName;
                                                        const heartTracks = this.state.selectedTracks;
                                                        const tracks = JSON.stringify(heartTracks);
                                                        
                                                        const albumimage = heartTracks.length > 0 ? heartTracks[0].imgsource : "";
                                                        const genre = heartTracks.length > 0 ? heartTracks[0].genre : "";
                                                        
                                                        // console.log("************************** before requesting createChannel ***************************");
                                                        try {
                                                            // create a channel: get recommended songs in backend
                                                            const { data } = await createChannelBack({
                                                                variables: { stationName, albumimage, genre, tracks },
                                                                update: (store, { data: { createChannelBack } }) => {
                                                                    // Read the data from our cache for this query.
                                                                    const data = store.readQuery({ query: MY_CHANNELS });
                                                                    data.mychannels.push(createChannelBack);
                                                                    store.writeQuery({ query: MY_CHANNELS, data });
                                                                }
                                                            });
                                                            const channel = data.createChannelBack;
                                                            if (channel) {
                                                                const channelTracks = [
                                                                    ...channel.tierHeart.map(track => { track.tier = "Heart"; return track; }),
                                                                    ...channel.tier1.map(track => { track.tier = "Tier1"; return track; }),
                                                                    ...channel.tier2.map(track => { track.tier = "Tier2"; return track; }),
                                                                    ...channel.tierBinoculars.map(track => { track.tier = "Binoculars"; return track; })
                                                                ];
                                                                // get recommended tarcks
                                                                const recTracks = channelTracks.filter(track => {
                                                                    return heartTracks.findIndex(hTrack => hTrack.MnetId == track.MnetId) == -1;
                                                                });
                                                                if (recTracks.length == 0) {
                                                                    showError("Station creation failed. Please try again.");
                                                                    this.setState({ isCreating: false });
                                                                    this.props.saveIsWaiting(false);
                                                                    return;
                                                                }
                                                                this.props.addChannel(channel);
                                                                this.props.saveSelectedChannel(channel);
                                                                this.props.saveSelectedChannelIndex(this.props.state.myChannels.length - 1);
                                                                const playQueue = new PlayQueue(channel);
                                                                this.props.savePlayQueue(playQueue);
                                                                const nextTrack = await playQueue.getNextTrack(recTracks[0]);
                                                                this.props.saveSelectedTrackIndex(0);
                                                                if (!this.props.state.playstate) {
                                                                    this.props.savePlayState(true);
                                                                }
                                                                this.props.saveSelectedTrack(nextTrack);
                                                                this.props.navigation.navigate("Music");
                                                                this.setState({ isCreating: false });
                                                                this.props.saveIsWaiting(false);
                                                                // fill remaining station recommendation tracks in background
                                                                client.mutate({
                                                                    mutation: FILL_CHANNEL_TRACKS,
                                                                    variables: { id: channel.id }
                                                                }).then(({ data }) => {
                                                                    console.log("*** channel, after filling station: ", data);
                                                                    const fChannel = data.fillChannelTracks;
                                                                    if (fChannel && this.props.state.myChannels) {
                                                                        const channels = this.props.state.myChannels.map(ch => {
                                                                            if (ch.id == fChannel.id) {
                                                                                return fChannel;
                                                                            } else {
                                                                                return ch;
                                                                            }
                                                                        });
                                                                        this.props.saveMyChannels(channels);
                                                                        if (this.props.state.selectedChannel.id == fChannel.id) {
                                                                            this.props.state.playQueue.updateChannel(fChannel);
                                                                            this.props.saveSelectedChannel(fChannel);
                                                                        }
                                                                    }
                                                                }).catch(e => {
                                                                    console.log("Error in filling station tracks");
                                                                });
                                                            } else {
                                                                showError("Station creation failed. Please try again.");
                                                                this.setState({ isCreating: false });
                                                                this.props.saveIsWaiting(false);
                                                            }
                                                        } catch(err) {
                                                            console.log('create channel api', err);
                                                            this.setState({ isCreating: false });
                                                            this.props.saveIsWaiting(false);
                                                            const errorMessage = err.message.replace("GraphQL error:", "").trim();
                                                            if (errorMessage.substr(0, 8) == "Login to") {
                                                                await AsyncStorage.removeItem("authtoken1");
                                                                await AsyncStorage.removeItem("loggedIn");
                                                                this.props.saveProfile(null);
                                                                this.props.navigation.navigate("Auth");
                                                            } else if (errorMessage.substr(0, 18) == "No recommendations") {
                                                                showError("Please select more songs and try again.");
                                                            } else {
                                                                showError("Station creation failed. Please try again.");
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </View>
                                    </ImageBackground>
                                </Row>
                            </Grid>
                        </UserInactivityCheck>
                    );
                }}
            </Mutation>
        );
    }
}

const styles = StyleSheet.create({
    bottomEntry: {
        marginTop: 8,
        width: '100%',
        alignItems: 'center',
        flexDirection: "row"
    },
    bottomEntryLast: {
        marginTop: 8,
        paddingBottom: 12,
        width: '100%',
        alignItems: 'center',
        flexDirection: "row"
    }
});

export default connect(state => ({ state: state.app }), actions)(CreateChannel);
