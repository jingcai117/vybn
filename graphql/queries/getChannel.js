import { gql } from "apollo-boost";

const GET_CHANNEL = gql`
  query($id: Int) {
    getChannel(id: $id) {
      id
      stationName
      albumimage
      exploreValue
      freHeart
      freTier1
      freTier2
      freBinoculars
      broadcast
      profile {
        firstName
        profilePic
      }
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

export default GET_CHANNEL;