import React, { Component, useState } from "react";

import {
    ScrollView, Dimensions, View, Text, ImageBackground, Image, StyleSheet, AsyncStorage, Animated, TouchableOpacity, TextInput, FlatList, SafeAreaView, Alert
} from "react-native";
// import Carousel from 'react-native-looped-carousel';
import { Grid, Row, Segment, Button, Text as TextN } from "native-base";
import { useMutation } from "@apollo/react-hooks";
import { connect } from 'react-redux';
import axios from 'axios';
import { Mutation } from "react-apollo";
import { gql } from "apollo-boost";
import md5 from "react-native-md5";

import * as Config from '../../config';
import { ButtonComponent, Dash } from "../../components/Form";
import * as actions from '../../redux/actions';

import background from "../../assets/background5.png";
import TrackNameBackground from "../../assets/music/track_name_background.png";
import Magnifier from "../../assets/maginifier.png";
import StationCoverBack from "../../assets/stationcoverback.png";
import StationCover from "../../assets/stationcover.png";
import AlbumBack from "../../assets/albumback.png";
import AddBut from "../../assets/add.png";
import LoadingModal from "../../components/Loading";
import Error from "../../components/Error";
import { PlayQueue } from "../../utils/utils";
import Loading from '../../components/Loading';

class CreateChannel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            stationName: '',
            searchTxt: '',
            searchTracks: [],
            searchArtists: [],
            searchAlbums: [],
            selectedTracks: [],
            errorMessage: '',
            isloading: false, // FOR REST API CALL
            isactive: 0
        }
    }

    showTracks = ({ searchTracks, selectedTracks }) => {
        const p = this;
        return (
            <View style={{flex:1, alignItems:'center'}}>
                <Text style={{color:'white'}}>Song</Text>
                <ScrollView>
                    {searchTracks.map(function (item, i) {
                        return (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, flex: 1 }}>
                                <View style={{ width: '20%' }}>
                                    <Image
                                        source={{ uri: item.imgsource }}
                                        style={{ width: 50, height: 60, marginRight: 10 }} />
                                </View>
                                <View style={{ width: '65%' }}>
                                    <Text numberOfLines={1} style={{ color: '#ABAED0', fontSize: 11, marginBottom: 3, width: '100%' }}>{item.title}</Text>
                                    <Text numberOfLines={1} style={{ color: '#ABAED0', fontSize: 10, width: '100%' }}>{item.name}</Text>
                                </View>
                                <View style={{ width: '15%' }}>
                                    <TouchableOpacity style={{ alignItems: 'center', background: '#fff' }} onPress={() => {
                                        var selArr = selectedTracks;
                                        selArr.push(item);
                                        p.setState({ selectedTracks: selArr });

                                        let filteredArray = p.state.searchTracks.filter(item1 => item1 !== item)
                                        p.setState({ searchTracks: filteredArray });
                                    }}>
                                        <Image source={AddBut} style={{ width: 25, height: 25, justifyContent: 'center' }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
                
        )
    }
    showAlbums = ({searchAlbums, selectedTracks}) => {
        const p = this;
        return (
            <View style={{flex:1, alignItems:'center'}}>
                <Text style={{color:'white'}}>Album</Text>
                <ScrollView >
                {searchAlbums.map(function (item, i) {
                        return (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, flex: 1 }}>
                                <View style={{ width: '20%' }}>
                                    <Image
                                        source={{ uri: item.Images.Album75x75 }}
                                        style={{ width: 50, height: 60, marginRight: 10 }} />
                                </View>
                                <View style={{ width: '65%' }}>
                                    <Text numberOfLines={1} style={{ color: '#ABAED0', fontSize: 11, marginBottom: 3, width: '100%' }}>{item.title}</Text>
                                    <Text numberOfLines={1} style={{ color: '#ABAED0', fontSize: 10, width: '100%' }}>{item.Artist.Name}</Text>
                                </View>
                                <View style={{ width: '15%' }}>
                                    <TouchableOpacity style={{ alignItems: 'center', background: '#fff' }} onPress={async () => {
                                        let GET_TRACKS_BY_ALBUM = "method=album.gettracks&mnetId=" + item.MnetId + "&page=1&pagesize=10&format=json&apiKey=" + Config.API_KEY;
                                        let signature = md5.hex_hmac_md5(Config.SHARED_SECRET, GET_TRACKS_BY_ALBUM);
                                        const url = Config.MNDIGITAL_BASE + GET_TRACKS_BY_ALBUM + "&signature=" + signature;
                                        p.setState({isloading: true})
                                        try {
                                            const res = await axios.get(url);
                                            const tracks = res.data.Album.Tracks;
                                            var selArr = selectedTracks;
                                            tracks.map(track => {
                                                track.Album = new Object();
                                                track.Album.MnetId = res.data.Album.MnetId;
                                                track.Album.Images = res.data.Album.Images;
                                            });
                                            p.standazation(tracks).map( track => {
                                                selArr.push(track)
                                            })
                                            let filteredArray = p.state.searchAlbums.filter(item1 => item1 !== item);
                                            p.setState({selectedTracks: selArr, searchAlbums: filteredArray, isloading: false});
                                        } catch (e) {
                                            console.log(e);
                                            p.setState({isloading: false});
                                        }
                                    }}>
                                        <Image source={AddBut} style={{ width: 25, height: 25, justifyContent: 'center' }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
            </ScrollView>
            </View>
            
        )
    }
    showArtists = ({searchArtists, selectedTracks}) => {
        const p = this;
        return (
            <View style={{flex:1, alignItems:'center' }}>
            <Text style={{color:'white'}}>Artist</Text>
            <ScrollView >
                {searchArtists.map(function (item, i) {
                        return (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5, flex: 1 }}>
                                
                                <View style={{ width: '80%' }}>
                                    <Text numberOfLines={1} style={{ color: '#ABAED0', fontSize: 11, marginBottom: 3, width: '100%' }}>{item.Name}</Text>
                                    <Text numberOfLines={1} style={{ color: '#ABAED0', fontSize: 10, width: '100%' }}>{`PopularityRanking: ${item.PopularityRanking}`}</Text>
                                </View>
                                <View style={{ width: '20%' }}>
                                    <TouchableOpacity style={{ alignItems: 'center', background: '#fff' }} onPress={async () => {
                                        let GET_TRACKS_BY_ARTIST = "method=artist.gettracks&mnetId=" + item.MnetId + "&page=1&pagesize=10&format=json&apiKey=" + Config.API_KEY;
                                        let signature = md5.hex_hmac_md5(Config.SHARED_SECRET, GET_TRACKS_BY_ARTIST);
                                        const url = Config.MNDIGITAL_BASE + GET_TRACKS_BY_ARTIST + "&signature=" + signature;
                                        p.setState({isloading: true})
                                        try {
                                            const res = await axios.get(url);
                                            if (res.data.Error) {
                                                p.setState({isloading: false}, () => {
                                                    alert(res.data.Error.Message);
                                                })
                                            } else {
                                                const tracks = res.data.Tracks;
                                                var selArr = selectedTracks;
                                                p.standazation(tracks).map(track => {
                                                    selArr.push(track);
                                                });
                                                let filteredArray = p.state.searchArtists.filter(item1 => item1 !== item);
                                                p.setState({selectedTracks: selArr, searchArtists: filteredArray, isloading: false});
                                            }
                                        } catch (e) {
                                            console.log(e);
                                            p.setState({isloading: false});
                                        }
                                    }}>
                                        <Image source={AddBut} style={{ width: 25, height: 25, justifyContent: 'center' }} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        )
    }

    addedTracks = ({ selectedTracks }) => {
        return (
            <View style={selectedTracks.length > 0 ? { width: '100%' } : { display: "none" }, {flex:1}}>
                <Text style={{ color: '#fff', fontFamily: 'Droidsans', fontWeight: '500', marginTop: 10, marginBottom: 5, alignSelf: 'center' }}>Added</Text>
                <ScrollView horizontal={true} bounces>
                    {selectedTracks.map(function (item, i) {
                        return (
                            <View key={i}>
                                <Image
                                    source={{ uri: item.imgsource }}
                                    style={{ width: 50, height: 60, borderRadius: 10, marginRight: 5 }} />
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
        let albums = [];
        let artists = [];
        try {
            const res = await axios.get(Config.SEARCH_GETTRACKS + "&title=" + this.state.searchTxt /*"&page=1&pageSize=20"*/);
            tracks = res.data.Tracks;
        } catch (e) {
            console.log(e);
        }

        try {
            const res1 = await axios.get(Config.SEARCH_GETARTISTS + this.state.searchTxt);
            artists = res1.data.Artists;
        } catch (e) {
            console.log(e);
        }

        try {
            const res2 = await axios.get(Config.SEARCH_GETALBUMS + this.state.searchTxt);
            albums = res2.data.Albums;
        } catch (e) {
            console.log(e);
        }
        
        this.setState({
            searchTracks: this.standazation(tracks),
            searchAlbums: albums,
            searchArtists: artists,
            isloading: false
        });
    }

    standazation = (arr) => {
        var trackArr = [];
        arr.map(function (item) {
            var title = item.Title;
            var name = item.Artist.Name;
            trackArr.push({
                MnetId: item.MnetId,
                title: title.replace(/[^a-zA-Z ]/g, ""),
                name: name.replace(/[^a-zA-Z ]/g, ""),
                artistMnetId: item.Artist.MnetId,
                imgsource: item.Album ? item.Album.Images.Album75x75 : '',
                imgsource150: item.Album ? item.Album.Images.Album150x150 : '',
                musicsource: item.SampleLocations[1].Location,
                genre: item.Genre,
                releaseDate: item.ReleaseDate,
                bitrate: item.Bitrate,
                duration: item.Duration,
                trackNumber: item.TrackNumber,
                discNumber: item.DiscNumber,
                albumMnetId: item.Album ? item.Album.MnetId : ''
            });
        });
        return trackArr;
    }

    getRecommandation =  async (tracks, num) => {
        if (tracks.length < 1) {
            return [];
        }
        let leftNum = num;
        const recom = []; let recom_tracks = [];
        // console.log("**************** Starting get recommendation ****************");
        const arr_tracksId = tracks.map(item => item.MnetId);
        const arr_trackId_str = arr_tracksId.join();
        let GET_RECOMMANDATION_TRACK = "method=Track.GetRecommendations&format=json&mnetids=" + arr_trackId_str + "&numRecommendations=" + leftNum + "&apiKey=aGTrhbeubSEus5FXORMhhJgtW";
        let signature_track = md5.hex_hmac_md5(Config.SHARED_SECRET, GET_RECOMMANDATION_TRACK);
        try {
            const res_track = await axios.get(Config.MNDIGITAL_BASE + GET_RECOMMANDATION_TRACK + "&signature=" + signature_track);
            const reco = res_track.data.RecommendationSets;
            // console.log("**************** After getting track recommendation ****************");
            if (reco && reco.length > 0) {
                for (const p of reco) {
                    const entities = p.RecommendedEntities; 
                    for (const m of entities) {
                        if (recom_tracks.length >= num) {
                            break;
                        }
                        try {
                            const track_item = await axios.get(Config.GET_TRACK + "&mnetid=" + m.MnetId);
                            if (track_item.data.Success) {
                                recom_tracks.push(track_item.data.Track);    
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            }
        } catch (e) {
            console.log("******** Error in getting Track recommendations: ", e);
        }

        // console.log("**************** After getting track recommendation tracks ****************");
        
        // console.log('Recommand from Track IDs', recom_tracks);
        if (recom_tracks.length < num) {
            const arr_artistId = tracks.map(item => item.artistMnetId);
            const arr_artistId_str = arr_artistId.join();
            leftNum = num - recom_tracks.length;
            let GET_RECOMMANDATION = "method=Artist.GetRecommendations&format=json&mnetids=" + arr_artistId_str + "&numRecommendations=" + leftNum + "&apiKey=aGTrhbeubSEus5FXORMhhJgtW";
            let signature = md5.hex_hmac_md5(Config.SHARED_SECRET, GET_RECOMMANDATION);
            try {
                const res = await axios.get(Config.MNDIGITAL_BASE + GET_RECOMMANDATION + "&signature=" + signature);
                // console.log("**************** After getting artist recommendation ****************");
                if (res.data.RecommendationSets && res.data.RecommendationSets.length > 0) {
                    for (let index = 0; index < res.data.RecommendationSets.length; index++) {
                        const element = res.data.RecommendationSets[index];
                        element.RecommendedEntities.map(item => recom.push(item));
                    }
                }
                recom.sort((a,b) =>  parseFloat(a.score) - parseFloat(b.score));
                if (recom.length > 0) {
                    for (const item of recom) {
                        try {
                            const res = await axios.get(Config.MNDIGITAL_BASE + "method=artist.gettracks&apiKey=aGTrhbeubSEus5FXORMhhJgtW&format=json&mnetid=" + item.MnetId + "&page=1&pagesize=" + leftNum);
                            res.data.Tracks && res.data.Tracks.map(track => {
                                if (recom_tracks.length < num) {
                                    recom_tracks.push({...track});
                                }
                            })
                            if (recom_tracks.length >= num) {
                                break;
                            }
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }

        
        const pp = this.standazation(recom_tracks);
        // console.log("**************** After gtandazation ****************");
        return pp;   
      }

    render() {
        const {selectedTracks, searchTracks, searchTxt, searchAlbums, searchArtists, isactive} = this.state;
        return (
            <Mutation mutation={CREATE_CHANNEL}>
                {(createChannel, { data, loading, error, called, client }) => {
                    if (loading) {
                        console.debug("loading");
                    }
                    if (error) {
                        console.debug(error);
                    }
                    return (
                        <Grid>
                            {(loading || this.state.isloading) && <LoadingModal />}
                            {error && <Error message={error.message} />}
                            {this.state.errorMessage != '' && <Error message={this.state.errorMessage} />}
                            <Row>
                                <ImageBackground
                                    source={background}
                                    style={{ flex: 1, height: "100%", width: "100%" }}
                                    resizeMode="cover">
                                    <View style={{ marginTop: 40, marginBottom: 30, alignItems: 'center',flex:1 , marginLeft:30, marginRight:30}}>
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
                                        {searchTracks.length>0 || searchAlbums.length>0 || searchArtists.length>0 ? 
                                            <View style={{flex:1, width:'100%', marginTop:15}}>
                                                <View style={{flex:2, borderBottomColor: 'white', borderBottomWidth: 1, alignItems:'center'}}>
                                                    {/* <Carousel
                                                        style={{flex:1, width:'100%', height:'100%'}}
                                                        isLooped={true}
                                                        autoplay={false}
                                                        bullets={true}
                                                    >
                                                        {searchTracks.length>0 && this.showTracks(this.state)}
                                                        {searchAlbums.length>0 && this.showAlbums(this.state)}
                                                        {searchArtists.length>0 && this.showArtists(this.state)}                                                      
                                                    </Carousel> */}
                                                </View>
                                                <View style={{height:110, width:'100%'}}>
                                                    {this.addedTracks(this.state)}
                                                </View>
                                            </View>
                                            :
                                            searchTxt.length > 0 ? <Text style={{marginTop:15, color:'white'}}>Can not find search result!</Text> : null 
                                        }
                                        <ButtonComponent
                                            style={{width: '100%', height: 40, marginTop: 20 }}
                                            text="Start Listening"
                                            loading={loading}
                                            onPress={async () => {
                                                if (this.state.stationName == '') {
                                                    this.setState({ errorMessage: 'Input Station Name' });
                                                } else if (this.state.selectedTracks.length < 1) {
                                                    this.setState({ errorMessage: 'No tracks are selected'});
                                                } else {
                                                    this.setState({ isloading: true });
                                                    const stationName = this.state.stationName;
                                                    const heartTracks = this.state.selectedTracks;
                                                    // console.log("******************* Before get recommendation *********************");
                                                    const tier1Tracks = await this.getRecommandation(heartTracks, 100);
                                                    const tier2Tracks = await this.getRecommandation(tier1Tracks, 200);
                                                    const tierHTracks = await this.getRecommandation(tier2Tracks, 300);
                                                    // console.log("******************** After get recommendation *********************");

                                                    // get unique array of tracks
                                                    const tracksAll = [...heartTracks, ...tier1Tracks, ...tier2Tracks, ...tierHTracks].filter((track, index, tracks) => {
                                                        return index == tracks.findIndex(item => item.MnetId == track.MnetId);
                                                    });
                                                    const valTracks = JSON.stringify(tracksAll);
                                                    const albumimage = heartTracks.length > 0 ? heartTracks[0].imgsource : "";
                                                    const genre = heartTracks.length > 0 ? heartTracks[0].genre : "";
                                                    const tracks = heartTracks.map(({ MnetId }) => parseInt(MnetId));
                                                    const tracksTier1 = tier1Tracks.map(({ MnetId }) => parseInt(MnetId));
                                                    const tracksTier2 = tier2Tracks.map(({ MnetId }) => parseInt(MnetId));
                                                    const tracksTierH = tierHTracks.map(({ MnetId }) => parseInt(MnetId));
                                                    const data = {
                                                        stationName,
                                                        albumimage,
                                                        genre,
                                                        freHeart: 45,
                                                        freTier1: 25,
                                                        freTier2: 15,
                                                        freBinoculars: 15,
                                                        exploreValue: 50,
                                                        tierHeart: heartTracks,
                                                        tier1: tier1Tracks,
                                                        tier2: tier2Tracks,
                                                        tierBinoculars: tierHTracks
                                                    };
                                                    this.props.addChannel(data);
                                                    if (data) {
                                                        this.props.saveSelectedChannel(data);
                                                        this.props.saveSelectedChannelIndex(this.props.state.myChannels.length - 1);
                                                        const playQueue = new PlayQueue(data);
                                                        this.props.savePlayQueue(playQueue);

                                                        if (playQueue.queue.length > 0) {
                                                            this.props.saveSelectedTrackIndex(0);
                                                            this.props.saveSelectedTrack(playQueue.queue[0]);
                                                        }
                                                    }
                                                    this.props.navigation.navigate("Music");
                                                    this.setState({ isloading: false });
                                                    const channelIndex = this.props.state.myChannels.length - 1;
                                                    // console.log("************************** before requesting createChannel ***************************");
                                                    try {
                                                        const { data } = await createChannel({
                                                            variables: { stationName, albumimage, genre, tracks, tracksTier1, tracksTier2, tracksTierH, valTracks}
                                                        });
                                                        this.props.state.myChannels[channelIndex].id = data.createChannel.id;
                                                    }  catch(err) {
                                                        console.log('create channel api', err);
                                                    }       
                                                }
                                            }}
                                        />
                                    </View>
                                </ImageBackground>
                            </Row>
                        </Grid>
                    );
                }}
            </Mutation>
        );
    }
}
const styles = StyleSheet.create({
    button: {
        alignItems:'center',
        flex:1,
        tintColor: 'black'
    },
    segment: {
        width:'100%',
        marginTop:10,
        height: 40,
        flexDirection:'row'
    },
    text: {
        color: "#fff",
        fontSize: 13
    }
})
const CREATE_CHANNEL = gql`
    mutation($stationName: String, $albumimage: String, $genre: String, $tracks: [Int], $tracksTier1: [Int], $tracksTier2: [Int], $tracksTierH: [Int], $valTracks: String) {
        createChannel(stationName: $stationName, albumimage: $albumimage, genre: $genre, tracks: $tracks, tracksTier1: $tracksTier1, tracksTier2: $tracksTier2, tracksTierH: $tracksTierH, valTracks: $valTracks){
            id
        }
    }
`;

export default connect(state => ({ state: state.app }), actions)(CreateChannel);
