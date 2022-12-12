import { gql } from "apollo-boost";

const CREATE_CHANNEL_BACK = gql`
    mutation($stationName: String, $albumimage: String, $genre: String, $tracks: String) {
        createChannelBack(stationName: $stationName, albumimage: $albumimage, genre: $genre, tracks: $tracks){
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

export default CREATE_CHANNEL_BACK;