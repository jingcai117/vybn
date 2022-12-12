import { gql } from "apollo-boost";

const USER_GUEST_CHANNELS = gql`
{
  userGuestChannels {
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

export default USER_GUEST_CHANNELS;