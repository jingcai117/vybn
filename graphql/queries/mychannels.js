import { gql } from "apollo-boost";

const MY_CHANNELS = gql`
{
  mychannels {
    id
    stationName
    albumimage
    exploreValue
    freHeart
    freTier1
    freTier2
    freBinoculars
    broadcast
  }
}
`;

export default MY_CHANNELS;