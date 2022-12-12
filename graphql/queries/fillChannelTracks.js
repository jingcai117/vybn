import { gql } from "apollo-boost";

const FILL_CHANNEL_TRACKS = gql`
    mutation($id: Int) {
        fillChannelTracks(id: $id){
            id
            stationName
            albumimage
            exploreValue
            freHeart
            freTier1
            freTier2
            freBinoculars
            broadcast
            tierHeart {
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
            tier1{
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
            tier2{
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
            tierBinoculars{
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
    }
`;

export default FILL_CHANNEL_TRACKS;