import { gql } from "apollo-boost";
import client from "../graphql/client";
import * as Config from '../config';
import axios from 'axios';

export class PlayQueue {
    constructor(channel, mode = "ordered") {
        this.channel = channel;

        this.tierHeart = [];
        this.tier1 = [];
        this.tier2 = [];
        this.tierBinoculars = [];
        this.allTracks = [];

        this.addedPercent = [];  // when some tiers don't have tracks, keep recalculated percentages
        this.playedQueueTotal = []; // all tracks played from start

        this.totalPlayTime = 0; // total played time from start
        this.measuredTime3 = 0; // sum of duration of tracks in playedQueue3
        this.playedQueue3 = []; // played tracks during last 3 hours
        this.albumRepeatCount = {};  // keep the information on how many tracks from each album are played
        this.artistRepeatCount = {}; // keep the information on how many tracks from each artist are played
        this.inRowArtistNum = 0; // keep the information on how many tracks from an artist are played in a row
        this.inRowAlbumNum = 0; // keep the information on how many tracks from an album are played in a row

        this.initialize();
    }

    updateChannel = (uChannel) => {
        this.channel = uChannel;
        this.initialize();
    }

    // get addedPercent values from tier track numbers and frequency value
    initialize = () => {
        if (!this.channel) {
            this.tierHeart = [];
            this.tier1 = [];
            this.tier2 = [];
            this.tierBinoculars = [];
            this.allTracks = [];

            this.addedPercent = [];
            return;
        }

        this.tierHeart = this.channel.tierHeart.map(track => {
            return {
                ...track,
                tier: "Heart"
            };
        });
        this.tier1 = this.channel.tier1.map(track => {
            return {
                ...track,
                tier: "Tier1"
            };
        });
        this.tier2 = this.channel.tier2.map(track => {
            return {
                ...track,
                tier: "Tier2"
            };
        });
        this.tierBinoculars = this.channel.tierBinoculars.map(track => {
            return {
                ...track,
                tier: "Binoculars"
            };
        });
        this.allTracks = [...this.tierHeart, ...this.tier1, ...this.tier2, ...this.tierBinoculars];

        const {
            freHeart, freTier1, freTier2, freBinoculars
        } = this.channel;
    
        const percent = [
            this.tierHeart.length > 0 ? freHeart : 0,
            this.tier1.length > 0 ? freTier1 : 0,
            this.tier2.length > 0 ? freTier2 : 0,
            this.tierBinoculars.length > 0 ? freBinoculars : 0
        ];
    
        const totalPercent = percent.reduce((a, b) => a + b, 0);
        if (totalPercent == 0) {
            return [];
        }
        let sum = 0;
        for (let i = 0; i < 4; i ++) {
            sum += percent[i];
            this.addedPercent.push(sum / totalPercent);
        }
    };

    // initialize factors that affect selection of next song(except frequencies and exploreValue)
    initializeFactors = () => {
        this.totalPlayTime = 0;
        this.playedQueueTotal = [];

        this.measuredTime3 = 0;
        this.playedQueue3 = [];

        this.albumRepeatCount = {};
        this.artistRepeatCount = {};

        this.inRowAlbumNum = 0;
        this.inRowArtistNum = 0;
    };

    // get next track to play
    getNextTrack = async (track = null) => {
        if (!this.channel) {
            return null;
        }

        if (track) {
            this.setConditionFactors(track);
            return track;
        }
    
        const {
            exploreValue
        } = this.channel;

        const stationTrack = await this.getAlbumTitle(this.getStationTrack());
        if (!stationTrack) {
            return null;
        }

        // If random number * 100 is less than exploreValue, then select a track from the station tracks
        // Else explore a track from the server.
        let nextTrack = stationTrack;
        if (Math.random() * 100 >= exploreValue && stationTrack.albumMnetId) {
            const exploredTrack = await this.exploreTrack(stationTrack.albumMnetId);
            if (exploredTrack) {
                // console.log("---Original Station Track: ", nextTrack);
                nextTrack = await this.getAlbumTitle(exploredTrack);
            }
        }
        
        // console.log("---Next Station Track: ", nextTrack);

        // If a proper next track is got, update condition factors
        this.setConditionFactors(nextTrack);
        return nextTrack;
    };

    getAlbumTitle = async track => {
        if (!track || track.albumTitle) {
            return track;
        }
        try {
            const track_item = await axios.get(Config.GET_TRACK + "&mnetid=" + track.MnetId);
            if (track_item.data.Success) {
                const album = track_item.data.Track.Album;
                track.albumMnetId = album ? album.MnetId : "";
                track.albumTitle = album ? album.Title : "";
                track.label = album ? album.Label : "";
                track.labelOwnerId = album ? album.LabelOwnerId : 0;
                if (album) {
                    client.mutate({
                        mutation: UPDATE_TRACK_ALBUM_INFO,
                        variables: {
                            MnetId: track.MnetId,
                            albumMnetId: track.albumMnetId,
                            albumTitle: track.albumTitle,
                            label: track.label,
                            labelOwnerId: track.labelOwnerId
                        }
                    });
                }
                return track;
            } else {
                return track;
            }
        } catch (e) {
            console.log("Error in getting Track info: ", e);
            return track;
        }
    }

    getStationTrack = () => {
        const tracks = [this.tierHeart, this.tier1, this.tier2, this.tierBinoculars];
        let index = 0;

        // get tier index according to random number and addedPercent values
        const pickVal = Math.random();
        if (pickVal < this.addedPercent[0]) {
            index = 0;
        } else if (pickVal < this.addedPercent[1]) {
            index = 1;
        } else if (pickVal < this.addedPercent[2]) {
            index = 2;
        } else {
            index = 3;
        }

        // get tracks that meets DMCA requirements from the tier selected above
        let selectableTracks = tracks[index].filter(track => this.conditionCheck(track));
        // If it fails, get tracks from all tracks in a station
        if (selectableTracks.length < 1) {
            selectableTracks = this.allTracks.filter(track => this.conditionCheck(track));
        }

        if (selectableTracks.length < 1) {
            return null;
        }

        // get a random index for selecting next track
        const count = selectableTracks.length;
        let num = Math.floor(Math.random() * count);
        if (num >= count) {
            num = count - 1;
        }

        return selectableTracks[num];
    };

    conditionCheck = (track) => {
        // if track was played, return false.
        if (this.playedQueueTotal.findIndex(item => item.MnetId == track.MnetId) > -1) {
            return false;
        }

        // Last track played.
        const lastTrack = this.playedQueueTotal.length == 0
            ? false
            : this.playedQueueTotal[this.playedQueueTotal.length - 1];

        // number of tracks from the same album as track in 3 hours
        let count = this.albumRepeatCount[track.albumMnetId];

        // condition check: No more than 3 songs in 3 hours from the same album
        if (count && count >= 3) {
            return false;
        }

        // condition check: No more than 2 songs in a row in 3 hours from the same album
        if (lastTrack && lastTrack.albumMnetId == track.albumMnetId && this.inRowAlbumNum > 1) {
            return false;
        }

        // number of tracks from the same artist as track in 3 hours
        count = this.artistRepeatCount[track.artistMnetId];
        
        // condition check: No more than 4 songs in 3 hours from the same artist
        if (count && count >= 4) {
            return false;
        }

        // condition check: No more than 3 songs in a row in 3 hours from the same artist
        if (lastTrack && lastTrack.artistMnetId == track.artistMnetId && this.inRowArtistNum > 2) {
            return false;
        }
        return true;
    };

    // when track is played, change the factors that affects selecting next tracks
    setConditionFactors = (track) => {
        // get duration of track in seconds
        const seconds = this.getSeconds(track);
        // Last track played.
        const lastTrack = this.playedQueueTotal.length == 0
            ? false
            : this.playedQueueTotal[this.playedQueueTotal.length - 1];

        // when play time is longer than 3 hours, pop the first song and update factors
        if (this.measuredTime3 > 10800) {
            // get the first track in 3 hour tracks
            const releasedTracks = this.playedQueue3.splice(0, 1);
            if (releasedTracks.length > 0) {
                const rTrack = releasedTracks[0];
                const rSecs = this.getSeconds(rTrack);
                this.measuredTime3 -= rSecs;

                let count = this.albumRepeatCount[rTrack.albumMnetId];
                if (count && count > 0) {
                    this.albumRepeatCount[rTrack.albumMnetId] = count - 1;
                }

                count = this.artistRepeatCount[rTrack.artistMnetId];
                if (count && count > 0) {
                    this.artistRepeatCount[rTrack.artistMnetId] = count - 1;
                }
            }
        }

        // push track to played track list and add duration of track to total played time.
        this.playedQueueTotal.push(track);
        this.totalPlayTime += seconds;

        // push track to 3 hours played track list and add duration of track to 3 hours played time.
        this.playedQueue3.push(track);
        this.measuredTime3 += seconds;

        // register track albumMnetId to albumRepeatCount or increase count
        let count = this.albumRepeatCount[track.albumMnetId];
        if (count && count > 0) {
            this.albumRepeatCount[track.albumMnetId] = count + 1;
        } else {
            this.albumRepeatCount[track.albumMnetId] = 1;
        }

        // register track artistMnetId to artistRepeatCount or increase count
        count = this.artistRepeatCount[track.artistMnetId];
        if (count && count > 0) {
            this.artistRepeatCount[track.artistMnetId] = count + 1;
        } else {
            this.artistRepeatCount[track.artistMnetId] = 1;
        }

        // update in-row factors
        if (lastTrack) {
            if (lastTrack.albumMnetId == track.albumMnetId) {
                this.inRowAlbumNum ++;
            } else {
                this.inRowAlbumNum = 1;
            }

            if (lastTrack.artistMnetId == track.artistMnetId) {
                this.inRowArtistNum ++;
            } else {
                this.inRowArtistNum = 1;
            }
        } else {
            this.inRowArtistNum = 1;
            this.inRowAlbumNum = 1;
        }
    };

    // get track duration as seconds
    getSeconds = (track) => {
        if (!track.duration) {
            return 0;
        }
        const minSec = track.duration.split(":");
        if (minSec.length == 1) {
            return parseInt(minSec[0]) || 0;
        } else if (minSec.length == 2) {
            return (parseInt(minSec[0]) || 0) * 60 + (parseInt(minSec[1]) || 0);
        } else if (minSec.length == 3) {
            return (parseInt(minSec[0]) || 0) * 3600 + (parseInt(minSec[1]) || 0) * 60 + (parseInt(minSec[2]) || 0);
        } else {
            return 0;
        }
    };

    // get a random track from the server
    getRandomTrack = async () => {
        // get forbidden albums and artists lists according to DMCA condition factors
        const albums = [];
        for (const aId in this.albumRepeatCount) {
            if (this.albumRepeatCount[aId] >= 3) {
                albums.push(aId);
            }
        }
        const artists = [];
        for (const bId in this.artistRepeatCount) {
            if (this.artistRepeatCount[bId] >= 4) {
                artists.push(bId);
            }
        }

        // Last track played.
        const lastTrack = this.playedQueueTotal.length == 0
            ? false
            : this.playedQueueTotal[this.playedQueueTotal.length - 1];

        if (lastTrack) {
            if (this.inRowAlbumNum >= 2) {
                albums.push(lastTrack.albumMnetId);
            }
            if (this.inRowArtistNum >= 3) {
                artists.push(lastTrack.artistMnetId);
            }
        }

        // get a random track that meets DMCA condition factors from the server.
        try {
            const { data, error } = await client.query({
                query: GET_RANDOM_TRACK,
                variables: {
                    position: Math.random(),
                    albums,
                    artists
                }
            });
            if (!error) {
                if (data.randomTrack.MnetId == "") {
                    return null;
                } else {
                    return {
                        ...data.randomTrack,
                        tier: "Explore"
                    };
                }
            } else {
                return null;
            }
        } catch (e) {
            console.log("Error in getting Random Track: ", e);
            return null;
        }
    };

    // explore a track from the server
    exploreTrack = async (albumMnetId) => {
        try {
            const { data, error } = await client.mutate({
                mutation: EXPLORE_TRACK,
                variables: {
                    position: Math.random(),
                    channelId: this.channel.id,
                    albumMnetId,
                    playedTrackMnetIds: this.playedQueueTotal.map(track => track.MnetId)
                }
            });
            if (!error) {
                if (data.exploreTrack.MnetId == "") {
                    return null;
                } else {
                    return {
                        ...data.exploreTrack,
                        tier: "Explore"
                    };
                }
            } else {
                return null;
            }
        } catch (e) {
            console.log("Error in getting Random Track: ", e);
            return null;
        }
    };
};

const GET_RANDOM_TRACK = gql`
  query($position: Float!, $albums: [String]!, $artists: [String]!) {
    randomTrack(position: $position, albums: $albums, artists: $artists) {
      MnetId
      title
      name
      imgsource
      imgsource150
      duration
      albumMnetId
      artistMnetId
      albumTitle
      label
      labelOwnerId
    }
  }
`;

const EXPLORE_TRACK = gql`
  mutation($position: Float!, $channelId: Int!, $albumMnetId: String!, $playedTrackMnetIds: [String]) {
    exploreTrack(position: $position, channelId: $channelId, albumMnetId: $albumMnetId, playedTrackMnetIds: $playedTrackMnetIds) {
      MnetId
      title
      name
      imgsource
      imgsource150
      duration
      albumMnetId
      artistMnetId
      albumTitle
      label
      labelOwnerId
    }
  }
`;

const UPDATE_TRACK_ALBUM_INFO = gql`
  mutation($MnetId: String, $albumMnetId: String, $albumTitle: String, $label: String, $labelOwnerId: Int) {
    updateTrackAlbumInfo(
        MnetId: $MnetId,
        albumMnetId: $albumMnetId,
        albumTitle: $albumTitle,
        label: $label,
        labelOwnerId: $labelOwnerId
    )
  }
`;