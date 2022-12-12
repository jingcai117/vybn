import React from "react";

import {
    ScrollView, View, Text, ImageBackground, Image, StyleSheet, TouchableOpacity, TextInput, FlatList
} from "react-native";
import { Grid, Row, Segment, Button, Text as TextN } from "native-base";
// import { useMutation } from "@apollo/react-hooks";
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
// import StationCoverBack from "../../assets/stationcoverback.png";
// import StationCover from "../../assets/stationcover.png";
// import AlbumBack from "../../assets/albumback.png";
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

    // showAlbums = ({searchAlbums, selectedTracks}) => {
    //     const p = this;
    //     return (
    //         <View style={{flex:1, alignItems:'center'}}>
    //             <Text style={{color:'white'}}>Album</Text>
    //             <ScrollView >
    //             {searchAlbums.map(function (item, i) {
    //                     return (
    //                         <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5, flex: 1 }}>
    //                             <View style={{ width: '20%' }}>
    //                                 <Image
    //                                     source={{ uri: item.Images.Album75x75 }}
    //                                     style={{ width: 50, height: 60, marginRight: 10 }} />
    //                             </View>
    //                             <View style={{ width: '65%' }}>
    //                                 <Text numberOfLines={1} style={{ color: '#ABAED0', fontSize: 11, marginBottom: 3, width: '100%' }}>{item.title}</Text>
    //                                 <Text numberOfLines={1} style={{ color: '#ABAED0', fontSize: 10, width: '100%' }}>{item.Artist.Name}</Text>
    //                             </View>
    //                             <View style={{ width: '15%' }}>
    //                                 <TouchableOpacity style={{ alignItems: 'center', background: '#fff' }} onPress={async () => {
    //                                     let GET_TRACKS_BY_ALBUM = "method=album.gettracks&mnetId=" + item.MnetId + "&page=1&pagesize=10&format=json&apiKey=" + Config.API_KEY;
    //                                     let signature = md5.hex_hmac_md5(Config.SHARED_SECRET, GET_TRACKS_BY_ALBUM);
    //                                     const url = Config.MNDIGITAL_BASE + GET_TRACKS_BY_ALBUM + "&signature=" + signature;
    //                                     p.setState({isloading: true})
    //                                     try {
    //                                         const res = await axios.get(url);
    //                                         const tracks = res.data.Album.Tracks;
    //                                         var selArr = selectedTracks;
    //                                         tracks.map(track => {
    //                                             track.Album = new Object();
    //                                             track.Album.MnetId = res.data.Album.MnetId;
    //                                             track.Album.Images = res.data.Album.Images;
    //                                         });
    //                                         p.standazation(tracks).map( track => {
    //                                             selArr.push(track)
    //                                         })
    //                                         let filteredArray = p.state.searchAlbums.filter(item1 => item1 !== item);
    //                                         p.setState({selectedTracks: selArr, searchAlbums: filteredArray, isloading: false});
    //                                     } catch (e) {
    //                                         console.log(e);
    //                                         p.setState({isloading: false});
    //                                     }
    //                                 }}>
    //                                     <Image source={AddBut} style={{ width: 25, height: 25, justifyContent: 'center' }} />
    //                                 </TouchableOpacity>
    //                             </View>
    //                         </View>
    //                     );
    //                 })}
    //         </ScrollView>
    //         </View>
            
    //     )
    // }
    // showArtists = ({searchArtists, selectedTracks}) => {
    //     const p = this;
    //     return (
    //         <View style={{flex:1, alignItems:'center' }}>
    //         <Text style={{color:'white'}}>Artist</Text>
    //         <ScrollView >
    //             {searchArtists.map(function (item, i) {
    //                     return (
    //                         <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5, flex: 1 }}>
                                
    //                             <View style={{ width: '80%' }}>
    //                                 <Text numberOfLines={1} style={{ color: '#ABAED0', fontSize: 11, marginBottom: 3, width: '100%' }}>{item.Name}</Text>
    //                                 <Text numberOfLines={1} style={{ color: '#ABAED0', fontSize: 10, width: '100%' }}>{`PopularityRanking: ${item.PopularityRanking}`}</Text>
    //                             </View>
    //                             <View style={{ width: '20%' }}>
    //                                 <TouchableOpacity style={{ alignItems: 'center', background: '#fff' }} onPress={async () => {
    //                                     let GET_TRACKS_BY_ARTIST = "method=artist.gettracks&mnetId=" + item.MnetId + "&page=1&pagesize=10&format=json&apiKey=" + Config.API_KEY;
    //                                     let signature = md5.hex_hmac_md5(Config.SHARED_SECRET, GET_TRACKS_BY_ARTIST);
    //                                     const url = Config.MNDIGITAL_BASE + GET_TRACKS_BY_ARTIST + "&signature=" + signature;
    //                                     p.setState({isloading: true})
    //                                     try {
    //                                         const res = await axios.get(url);
    //                                         if (res.data.Error) {
    //                                             p.setState({isloading: false}, () => {
    //                                                 alert(res.data.Error.Message);
    //                                             })
    //                                         } else {
    //                                             const tracks = res.data.Tracks;
    //                                             var selArr = selectedTracks;
    //                                             p.standazation(tracks).map(track => {
    //                                                 selArr.push(track);
    //                                             });
    //                                             let filteredArray = p.state.searchArtists.filter(item1 => item1 !== item);
    //                                             p.setState({selectedTracks: selArr, searchArtists: filteredArray, isloading: false});
    //                                         }
    //                                     } catch (e) {
    //                                         console.log(e);
    //                                         p.setState({isloading: false});
    //                                     }
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
        // let albums = [];
        // let artists = [];
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

        // try {
        //     const res1 = await axios.get(Config.SEARCH_GETARTISTS + this.state.searchTxt);
        //     artists = res1.data.Artists;
        // } catch (e) {
        //     console.log(e);
        // }

        // try {
        //     const res2 = await axios.get(Config.SEARCH_GETALBUMS + this.state.searchTxt);
        //     albums = res2.data.Albums;
        // } catch (e) {
        //     console.log(e);
        // }
        
        this.setState({
            searchTracks: this.standazation(tracks),
            // searchAlbums: albums,
            // searchArtists: artists,
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
                label: item.Album ? item.Album.Label : ''
            });
        });
        return trackArr;
    }

    convertTrack = (item) => {
        return {
            MnetId: item.MnetId,
            title: item.Title,
            name: item.Artist ? item.Artist.Name : "",
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
            label: item.Album ? item.Album.Label : ''
        }
    };

    getTierTracks = async (tracks, numH, num1, num2, numB) => {
        const allTrackInfo = [...tracks]; // keep all track infos for station

        // keep MnetId list to use for getting next recommendations
        let newlyAddedTrackIds = tracks.map(track => track.MnetId);
        let newlyAddedArtistIds = [];
        allTrackInfo.forEach(track => {
            if (track.artistMnetId && !newlyAddedArtistIds.includes(track.artistMnetId)) {
                newlyAddedArtistIds.push(track.artistMnetId);
            }
        });
        const allArtistIds = [...newlyAddedArtistIds]; // keep artist id list of used for recommendation
        const allRecommendedArtistIds = [];

        // Maximun number of tracks from an album
        const MAX_ALBUM_TRACK_NUM = 5;

        // keep number of tracks from albums
        const albumTrackNums = {};
        tracks.forEach(element => {
            if (albumTrackNums[element.albumMnetId]) {
                albumTrackNums[element.albumMnetId] ++;
            } else {
                albumTrackNums[element.albumMnetId] = 1;
            }
        });
        
        const trackInfos = [{
            ids: [...newlyAddedTrackIds],
            num: numH
        }, {
            ids: [],
            num: num1
        }, {
            ids: [],
            num: num2
        }, {
            ids: [],
            num: numB
        }];

        let leftNum = (tracks.length >= numH ? 0 : numH - tracks.length) + num1 + num2 + numB;
        let currentTierIndex = 0;
        let continueOuterLoop = true;
        let outerLoopCount = 0;
        while (continueOuterLoop) {
            outerLoopCount ++;
            console.log("****** OuterLoopCount: " + outerLoopCount + " ******");

            let continueLoop = true;
            if (newlyAddedTrackIds.length < 1) {
                continueLoop = false;
            }
            // get recommended Tracks using MNOpenAPI Track.GetRecommendations
            while (continueLoop) {
                const idsString = newlyAddedTrackIds.join();
                const GET_RECOMMANDATION_TRACK = "method=Track.GetRecommendations&format=json&mnetids=" + idsString
                    + "&numRecommendations=" + (leftNum + 20) + "&apiKey=aGTrhbeubSEus5FXORMhhJgtW";
                const signature_track = md5.hex_hmac_md5(Config.SHARED_SECRET, GET_RECOMMANDATION_TRACK);
                const recUrl = Config.MNDIGITAL_BASE + GET_RECOMMANDATION_TRACK + "&signature=" + signature_track;
                try {
                    const res_track = await axios.get(recUrl);
                    newlyAddedTrackIds = [];
                    const reco = res_track.data.RecommendationSets;
                    // console.log("reco: ", reco);
                    // console.log("**************** After getting track recommendation ****************");
                    if (reco && reco.length > 0) {
                        for (const p of reco) {
                            const ids = p.RecommendedEntities.filter(entity =>
                                allTrackInfo.findIndex(track => track.MnetId == entity.MnetId) == -1
                            ).map(entity => entity.MnetId);
                            if (ids.length < 1) {
                                continue;
                            }
                            const GET_RADIO_TRACKS = "method=Radio.GetTracks&format=json&mnetIds=" + ids.join()
                                + "&apiKey=aGTrhbeubSEus5FXORMhhJgtW";
                            const signature_radio = md5.hex_hmac_md5(Config.SHARED_SECRET, GET_RADIO_TRACKS);
                            const radioUrl = Config.MNDIGITAL_BASE + GET_RADIO_TRACKS + "&signature=" + signature_radio
                            try {
                                const { data } = await axios.get(radioUrl);
                                if (data.Success) {
                                    for (const ti of data.Tracks) {
                                        const key = ti.Album ? ti.Album.MnetId : "";
                                        if (key && albumTrackNums[key] && albumTrackNums[key] >= MAX_ALBUM_TRACK_NUM) {
                                            continue;
                                        }
                                        albumTrackNums[key] = albumTrackNums[key] ? albumTrackNums[key] + 1 : 1;
                                        // console.log(
                                        //     "Track id: " + ti.MnetId + " Current Tier Index: " + currentTierIndex
                                        //     + " Total Tracks: " + allTrackInfo.length
                                        // );
                                        allTrackInfo.push(this.convertTrack(ti));
                                        newlyAddedTrackIds.push(ti.MnetId);
                                        if (ti.Artist && ti.Artist.MnetId && !allArtistIds.includes(ti.Artist.MnetId)) {
                                            allArtistIds.push(ti.Artist.MnetId);
                                            newlyAddedArtistIds.push(ti.Artist.MnetId);
                                        }

                                        if (trackInfos[currentTierIndex].ids.length >= trackInfos[currentTierIndex].num) {
                                            currentTierIndex ++;
                                        }

                                        trackInfos[currentTierIndex].ids.push(ti.MnetId);
                                        leftNum --;
                                        if (leftNum == 0) {
                                            return {
                                                allTrackInfo: allTrackInfo,
                                                heartTracks: trackInfos[0].ids,
                                                tier1Tracks: trackInfos[1].ids,
                                                tier2Tracks: trackInfos[2].ids,
                                                tierBTracks: trackInfos[3].ids
                                            };
                                        }
                                    }
                                } else {
                                    console.log("Failed getting track infos: " + data.Error.Message);
                                    // console.log("data: ", data);
                                }
                            } catch (e) {
                                console.log("Error in getting radio track infos: ", e);
                            }
                        }
                    } else {
                        // console.log(
                        //     "Please select more tracks - found: "
                        //     + allTrackInfo.length + " not found: " + leftNum
                        //     + " currentTierIndex: " + currentTierIndex
                        // );
                        continueLoop = false;
                    }
                } catch (e) {
                    console.log("******** Error in getting Track recommendations: ", e);
                    continueLoop = false;
                }
                if (newlyAddedTrackIds.length < 1) {
                    continueLoop = false;
                }
            }

            // If not get all tracks needed, get tracks of recommended artists
            
            continueLoop = true;
            if (newlyAddedArtistIds.length < 1) {
                continueLoop = false;
            }
            // console.log("****** Before starting Artist Recommendation ******");
            let loopCount = 0;
            while (continueLoop) {
                loopCount ++;
                // console.log("****** Artist Rec Loop: " + loopCount + " ******");
                const arr_artistId_str = newlyAddedArtistIds.join();
                // console.log("artist array: ", arr_artistId_str);
                let GET_RECOMMANDATION = "method=Artist.GetRecommendations&format=json&mnetids=" + arr_artistId_str
                    + "&numRecommendations=" + leftNum + "&apiKey=aGTrhbeubSEus5FXORMhhJgtW";
                let signature = md5.hex_hmac_md5(Config.SHARED_SECRET, GET_RECOMMANDATION);
                try {
                    const res = await axios.get(Config.MNDIGITAL_BASE + GET_RECOMMANDATION + "&signature=" + signature);
                    newlyAddedArtistIds = [];
                    const recom = [];
                    // console.log("**************** After getting artist recommendation ****************");
                    // console.log("Artist Recommendatation data:", res.data)
                    if (res.data.RecommendationSets && res.data.RecommendationSets.length > 0) {
                        for (let index = 0; index < res.data.RecommendationSets.length; index++) {
                            const element = res.data.RecommendationSets[index];
                            // console.log("Entity Number: ", element.RecommendedEntities.length);
                            element.RecommendedEntities.forEach(item => {
                                if (!allArtistIds.includes(item.MnetId)) {
                                    allArtistIds.push(item.MnetId);
                                    newlyAddedArtistIds.push(item.MnetId);
                                }
                                if (!allRecommendedArtistIds.includes(item.MnetId)) {
                                    recom.push(item);
                                    allRecommendedArtistIds.push(item.MnetId);
                                }
                            })
                        }
                    }
                    recom.sort((a,b) =>  parseFloat(a.score) - parseFloat(b.score));
                    if (recom.length > 0) {
                        for (const item of recom) {
                            try {
                                const res = await axios.get(Config.MNDIGITAL_BASE + "method=artist.gettracks&apiKey=aGTrhbeubSEus5FXORMhhJgtW&format=json&mnetid=" + item.MnetId + "&page=1&pagesize=" + leftNum);
                                if (res.data.Tracks) {
                                    for (const ti of res.data.Tracks) {
                                        if (allTrackInfo.findIndex(track => track.MnetId == ti.MnetId) > -1) {
                                            continue;
                                        }
                                        const key = ti.Album ? ti.Album.MnetId : "";
                                        if (key && albumTrackNums[key] && albumTrackNums[key] >= MAX_ALBUM_TRACK_NUM) {
                                            continue;
                                        }
                                        albumTrackNums[key] = albumTrackNums[key] ? albumTrackNums[key] + 1 : 1;
                                        // console.log(
                                        //     "Track id: " + ti.MnetId + " Current Tier Index: " + currentTierIndex
                                        //     + " Total Tracks: " + allTrackInfo.length
                                        // );
                                        allTrackInfo.push(this.convertTrack(ti));
                                        newlyAddedTrackIds.push(ti.MnetId);
                                        if (trackInfos[currentTierIndex].ids.length >= trackInfos[currentTierIndex].num) {
                                            currentTierIndex ++;
                                        }

                                        trackInfos[currentTierIndex].ids.push(ti.MnetId);
                                        leftNum --;
                                        if (leftNum == 0) {
                                            return {
                                                allTrackInfo: allTrackInfo,
                                                heartTracks: trackInfos[0].ids,
                                                tier1Tracks: trackInfos[1].ids,
                                                tier2Tracks: trackInfos[2].ids,
                                                tierBTracks: trackInfos[3].ids
                                            };
                                        }
                                    }
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        }
                    } else {
                        console.log("got 0 artist recommendations");
                        continueLoop = false;
                    }
                } catch (e) {
                    console.log(e);
                    continueLoop = false;
                }
                if (newlyAddedArtistIds.length < 1) {
                    continueLoop = false;
                }
            }

            // If not get all tracks needed, get tracks using station Genre.
            if (outerLoopCount == 1) {
                let genre = allTrackInfo[0].genre;
                let pageNum = 1;
                let pageSize = leftNum + 50;
                continueLoop = true;

                // console.log("****** Before starting Genre loop ******");
                while (continueLoop) {
                    // console.log("****** Genre Loop Page: " + pageNum + " ******");
                    const urlGenre = Config.SEARCH_GETTRACKS + "&genre=" + genre + "&page=" + pageNum + "&pageSize=" + pageSize;
                    try {
                        const genre_res = await axios.get(urlGenre);
                        // console.log("genre tracks length: ", genre_res.data.Tracks ? genre_res.data.Tracks.length : 0);
                        if (genre_res.data.Tracks && genre_res.data.Tracks.length > 0) {
                            for (const ti of genre_res.data.Tracks) {
                                if (allTrackInfo.findIndex(track => track.MnetId == ti.MnetId) > -1) {
                                    continue;
                                }
                                const key = ti.Album ? ti.Album.MnetId : "";
                                if (key && albumTrackNums[key] && albumTrackNums[key] >= MAX_ALBUM_TRACK_NUM) {
                                    continue;
                                }
                                albumTrackNums[key] = albumTrackNums[key] ? albumTrackNums[key] + 1 : 1;
                                // console.log(
                                //     "Track id: " + ti.MnetId + " Current Tier Index: " + currentTierIndex
                                //     + " Total Tracks: " + allTrackInfo.length
                                // );
                                allTrackInfo.push(this.convertTrack(ti));
                                newlyAddedTrackIds.push(ti.MnetId);
                                if (ti.Artist && ti.Artist.MnetId && !allArtistIds.includes(ti.Artist.MnetId)) {
                                    allArtistIds.push(ti.Artist.MnetId);
                                    newlyAddedArtistIds.push(ti.Artist.MnetId);
                                }
                                if (trackInfos[currentTierIndex].ids.length >= trackInfos[currentTierIndex].num) {
                                    currentTierIndex ++;
                                }

                                trackInfos[currentTierIndex].ids.push(ti.MnetId);
                                leftNum --;
                                if (leftNum == 0) {
                                    return {
                                        allTrackInfo: allTrackInfo,
                                        heartTracks: trackInfos[0].ids,
                                        tier1Tracks: trackInfos[1].ids,
                                        tier2Tracks: trackInfos[2].ids,
                                        tierBTracks: trackInfos[3].ids
                                    };
                                }
                            }
                        } else {
                            const genreSplit = genre.split("/");
                            if (genreSplit.length > 1) {
                                genre = genreSplit[0];
                                pageNum = 0;
                            } else {
                                console.log("Failed to get genre tracks");
                                continueLoop = false;
                            }
                        }
                    } catch (e) {
                        console.log(e);
                        continueLoop = false;
                    }
                    pageNum ++;
                }

                for (const aid of newlyAddedArtistIds) {
                    try {
                        const res = await axios.get(Config.MNDIGITAL_BASE + "method=artist.gettracks&apiKey=aGTrhbeubSEus5FXORMhhJgtW&format=json&mnetid=" + aid + "&page=1&pagesize=" + (leftNum + 50));
                        if (res.data.Tracks) {
                            for (const ti of res.data.Tracks) {
                                if (allTrackInfo.findIndex(track => track.MnetId == ti.MnetId) > -1) {
                                    continue;
                                }
                                const key = ti.Album ? ti.Album.MnetId : "";
                                if (key && albumTrackNums[key] && albumTrackNums[key] >= MAX_ALBUM_TRACK_NUM) {
                                    continue;
                                }
                                albumTrackNums[key] = albumTrackNums[key] ? albumTrackNums[key] + 1 : 1;
                                // console.log(
                                //     "Track id: " + ti.MnetId + " Current Tier Index: " + currentTierIndex
                                //     + " Total Tracks: " + allTrackInfo.length
                                // );
                                allTrackInfo.push(this.convertTrack(ti));
                                newlyAddedTrackIds.push(ti.MnetId);
                                if (trackInfos[currentTierIndex].ids.length >= trackInfos[currentTierIndex].num) {
                                    currentTierIndex ++;
                                }

                                trackInfos[currentTierIndex].ids.push(ti.MnetId);
                                leftNum --;
                                if (leftNum == 0) {
                                    return {
                                        allTrackInfo: allTrackInfo,
                                        heartTracks: trackInfos[0].ids,
                                        tier1Tracks: trackInfos[1].ids,
                                        tier2Tracks: trackInfos[2].ids,
                                        tierBTracks: trackInfos[3].ids
                                    };
                                }
                            }
                        }
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
            // console.log("Newly Added Artist Ids length: " + newlyAddedArtistIds.length);
            // console.log("Newly Added Track Ids length: " + newlyAddedTrackIds.length);
            if (newlyAddedArtistIds.length < 1 && newlyAddedTrackIds.length < 1) {
                continueOuterLoop = false;
            }
        }
        // console.log("***** Outside of all loop. Failed to get all tracks ******");
        return {
            allTrackInfo: allTrackInfo,
            heartTracks: trackInfos[0].ids,
            tier1Tracks: trackInfos[1].ids,
            tier2Tracks: trackInfos[2].ids,
            tierBTracks: trackInfos[3].ids
        };
    }

    render() {
        const { searchTracks, selectedTracks } = this.state;
        return (
            <Mutation mutation={CREATE_CHANNEL}>
                {(createChannel, { loading, error }) => {
                    if (loading) {
                        console.debug("loading");
                    }
                    if (error) {
                        console.debug(error);
                    }
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
                                                        // this.setState({ errorMessage: 'Input Station Name' });
                                                        showError('Input Station Name');
                                                    } else if (this.state.selectedTracks.length < 1) {
                                                        // this.setState({ errorMessage: 'No tracks are selected'});
                                                        showError('No tracks are selected')
                                                    } else {
                                                        this.setState({ isCreating: true });
                                                        this.props.saveIsWaiting(true);
                                                        const stationName = this.state.stationName;
                                                        const heartTracks = this.state.selectedTracks;
                                                        // console.log("******************* Before get recommendation *********************");
                                                        // const tier1Tracks = await this.getRecommandation(heartTracks, 100);
                                                        // const tier2Tracks = await this.getRecommandation(tier1Tracks, 200);
                                                        // const tierHTracks = await this.getRecommandation(tier2Tracks, 300);
                                                        const recData = await this.getTierTracks(heartTracks, 20, 100, 200, 300);
                                                        // console.log("******************** After get recommendation *********************");

                                                        // get unique array of tracks
                                                        // const tracksAll = [...heartTracks, ...tier1Tracks, ...tier2Tracks, ...tierHTracks].filter((track, index, tracks) => {
                                                        //     return index == tracks.findIndex(item => item.MnetId == track.MnetId);
                                                        // });
                                                        if (recData.error) {
                                                            this.setState({ isCreating: false });
                                                            this.props.saveIsWaiting(false);
                                                            showError(recData.error);
                                                            return;
                                                        }
                                                        const valTracks = JSON.stringify(recData.allTrackInfo);
                                                        const albumimage = heartTracks.length > 0 ? heartTracks[0].imgsource : "";
                                                        const genre = heartTracks.length > 0 ? heartTracks[0].genre : "";
                                                        const tracks = recData.heartTracks.map(item => parseInt(item));
                                                        const tracksTier1 = recData.tier1Tracks.map(item => parseInt(item));
                                                        const tracksTier2 = recData.tier2Tracks.map(item => parseInt(item));
                                                        const tracksTierH = recData.tierBTracks.map(item => parseInt(item));

                                                        console.log("Total tracks got: " + recData.allTrackInfo.length);
                                                        
                                                        const data = {
                                                            stationName,
                                                            albumimage,
                                                            genre,
                                                            freHeart: 45,
                                                            freTier1: 25,
                                                            freTier2: 15,
                                                            freBinoculars: 15,
                                                            exploreValue: 50,
                                                            broadcast: false,
                                                            tierHeart: recData.allTrackInfo.filter(track => recData.heartTracks.includes(track.MnetId)),
                                                            tier1: recData.allTrackInfo.filter(track => recData.tier1Tracks.includes(track.MnetId)),
                                                            tier2: recData.allTrackInfo.filter(track => recData.tier2Tracks.includes(track.MnetId)),
                                                            tierBinoculars: recData.allTrackInfo.filter(track => recData.tierBTracks.includes(track.MnetId))
                                                        };
                                                        this.props.addChannel(data);
                                                        if (data) {
                                                            this.props.saveSelectedChannel(data);
                                                            this.props.saveSelectedChannelIndex(this.props.state.myChannels.length - 1);
                                                            const playQueue = new PlayQueue(data);
                                                            this.props.savePlayQueue(playQueue);
                                                            const nextTrack = await playQueue.getNextTrack();
                                                            this.props.saveSelectedTrackIndex(0);
                                                            if (!this.props.state.playstate) {
                                                                this.props.savePlayState(true);
                                                            }
                                                            
                                                            this.props.saveSelectedTrack(nextTrack);
                                                        }
                                                        this.props.navigation.navigate("Music");
                                                        const channelIndex = this.props.state.myChannels.length - 1;
                                                        // console.log("************************** before requesting createChannel ***************************");
                                                        try {
                                                            const { data } = await createChannel({
                                                                variables: { stationName, albumimage, genre, tracks, tracksTier1, tracksTier2, tracksTierH, valTracks}
                                                            });
                                                            this.props.state.myChannels[channelIndex].id = data.createChannel.id;
                                                        } catch(err) {
                                                            console.log('create channel api', err);
                                                        }
                                                        this.setState({ isCreating: false });
                                                        this.props.saveIsWaiting(false);
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

const CREATE_CHANNEL = gql`
    mutation($stationName: String, $albumimage: String, $genre: String, $tracks: [Int], $tracksTier1: [Int], $tracksTier2: [Int], $tracksTierH: [Int], $valTracks: String) {
        createChannel(stationName: $stationName, albumimage: $albumimage, genre: $genre, tracks: $tracks, tracksTier1: $tracksTier1, tracksTier2: $tracksTier2, tracksTierH: $tracksTierH, valTracks: $valTracks){
            id
        }
    }
`;

export default connect(state => ({ state: state.app }), actions)(CreateChannel);
