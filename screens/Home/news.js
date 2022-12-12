import React, { useState, useEffect } from "react";
import { Text, AsyncStorage, View, ImageBackground, Image, TouchableOpacity, ScrollView, Dimensions, Linking } from "react-native";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import ReadMore from 'react-native-read-more-text';
import { NavigationEvents } from "react-navigation";
import HTML from 'react-native-render-html';
import ImageLoad from 'react-native-image-placeholder';

import Background from "../../assets/music/background.png";
import HeaderLeft from "../../assets/music/musci_play_header_left.png";
import HeaderRight from "../../assets/music/music_play_header_right.png";
import HeaderMiddleBackground from "../../assets/music/music_play_header_middle_background.png";
import PlayButton from "../../assets/music/play_button.png";
import PlayButtonSide from "../../assets/music/play_button_side.png";
import LikeButton from "../../assets/music/play_button_like.png";
import DownloadButton from "../../assets/music/play_button_download.png";
import UpArrow from "../../assets/music/play_button_up_arrow.png";
import CancelButton from "../../assets/music/play_button_cancel.png";
import TrackNameBackground from "../../assets/music/track_name_background.png";
import TrackNameBottomShadow from "../../assets/music/track_name_bottom_shadow.png";
import TrackNameSide from "../../assets/music/track_name_side.png";
import DropDownIcon from "../../assets/music/dropdownicon.png";
import AlbumImg from "../../assets/albumimg.png";
import Loading from "../../components/Loading";
import HeadPlay from "../../components/HeadPlay";
import UserInactivityCheck from '../../components/UserInactivityCheck';

export class News extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      isReady: false,
      showhome: false,
      textToShow: "News",
      news: [
          {
              title: 'Lorem Lpsum is simply dummy text',
              content: 'Text messaging,.'
          },
          {
              title: 'Lorem Lpsum is simply dummy text',
              content: 'Text messaging, or texting, is the act of composing and sending electronic messages, typically consisting of alphabetic and numeric characters, between two or more users of mobile devices, desktops/laptops, or other type of compatible computer. Text messages may be sent over a cellular network, or may also be sent via an Internet connection. The term originally referred to messages sent using the Short Message Service (SMS). It has grown beyond alphanumeric text to include multimedia messages using the Multimedia Messaging Service (MMS) containing digital images, videos, and sound content, as well as ideograms known as emoji (happy faces, sad faces, and other icons).'
          },
          {
              title: 'Lorem Lpsum is simply dummy text',
              content: 'Text messaging, or texting, is the act of composing and sending electronic messages, typically consisting of alphabetic and numeric characters, between two or more users of mobile devices, desktops/laptops, or other type of compatible computer. Text messages may be sent over a cellular network, or may also be sent via an Internet connection. The term originally referred to messages sent using the Short Message Service (SMS). It has grown beyond alphanumeric text to include multimedia messages using the Multimedia Messaging Service (MMS) containing digital images, videos, and sound content, as well as ideograms known as emoji (happy faces, sad faces, and other icons).'
          },
          {
              title: 'Lorem Lpsum is simply dummy text',
              content: 'Text messaging, or texting, is the act of composing and sending electronic messages, typically consisting of alphabetic and numeric characters, between two or more users of mobile devices, desktops/laptops, or other type of compatible computer. Text messages may be sent over a cellular network, or may also be sent via an Internet connection. The term originally referred to messages sent using the Short Message Service (SMS). It has grown beyond alphanumeric text to include multimedia messages using the Multimedia Messaging Service (MMS) containing digital images, videos, and sound content, as well as ideograms known as emoji (happy faces, sad faces, and other icons).'
          },
          {
              title: 'Lorem Lpsum is simply dummy text',
              content: 'Text messaging, or texting, is the act of composing and sending electronic messages, typically consisting of alphabetic and numeric characters, between two or more users of mobile devices, desktops/laptops, or other type of compatible computer. Text messages may be sent over a cellular network, or may also be sent via an Internet connection. The term originally referred to messages sent using the Short Message Service (SMS). It has grown beyond alphanumeric text to include multimedia messages using the Multimedia Messaging Service (MMS) containing digital images, videos, and sound content, as well as ideograms known as emoji (happy faces, sad faces, and other icons).'
          },
      ]
    };
  }

  newsList = ({news}) => {
    const { feeds } = this.props;

    return (
      <View style={{ flexDirection: "column", marginTop: 20 }}>
        {feeds.map(function(item, i){
          if(!item.image || item.image.startsWith('https://media.npr.org/include')) return;
          console.log('image -----> ', item.image);

          return (
              <View style={{ flexDirection: "row", padding: 10, borderBottomWidth: 1, borderBottomColor: "#000" }} key={i} >
                <ImageLoad
                  style={{ width: 107, height: 74, marginRight: 5, alignSelf: 'center' }}
                  loadingStyle={{ size: 'large', color: 'blue' }}
                  placeholderSource={require('../../assets/placeholder.png')}
                  source={{ uri: item.image }}
                /> 
                
                <View style={{flex: 1}}>
                    <Text style={{ color: "#abaed0", marginBottom: 2, fontSize: 12 }}>{item.title[0]}</Text>
                    {/* <ReadMore
                        numberOfLines={5}
                        renderTruncatedFooter={this._renderTruncatedFooter}
                        renderRevealedFooter={this._renderRevealedFooter}>
                        <Text style={{ color: "white", fontSize: 10 }} >{item.description[0]}</Text>
                    </ReadMore> */}
                    <HTML 
                      html={item.description[0]} 
                      imagesMaxWidth={Dimensions.get('window').width} 
                      baseFontStyle={{ color: "white", fontSize: 10 }}
                      onLinkPress = {(evt, href) =>  Linking.openURL(href) }
                      ignoredStyles={['font-family', 'display']} />
                </View>
              </View>
          );
        })}
      </View>
    );
  }

  _renderTruncatedFooter = (handlePress) => {
    return (
      <Text style={{color:'#7473FF', marginTop: 5}} onPress={handlePress}>
        Read more
      </Text>
    );
  }

  _renderRevealedFooter = (handlePress) => {
    return (
      <Text style={{color: '#7473FF', marginTop: 5}} onPress={handlePress}>
        Show less
      </Text>
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
          <ImageBackground
              source={Background}
              style={{
                flex: 1,
                height: null,
                width: null
              }}
              resizeMode="cover" >
              <View style={{ margin: 15 }}>
                  <HeadPlay
                    navigation={this.props.navigation}
                  />
                  <ScrollView>
                      <View style={{ marginBottom: 200 }}>
                      { this.newsList(this.state) }
                      </View>
                  </ScrollView>
              </View>
            </ImageBackground>
        </View>
    );
  }
}

export default function NewsScreen(props) {
  const [feeds, setFeeds] = useState([]);

  const { loading, error, data, refetch, networkStatus } = useQuery(
    GET_FEEDS,
    {
      notifyOnNetworkStatusChange: true
    }
  );

  if (loading || networkStatus === 4) {
    return <Loading />;
  }

  if (error) {
    console.log('error message: ', error.message);
    return <Text>Error</Text>;
  }

  if (data) {
    return (
      <UserInactivityCheck navigation={props.navigation}>
        <View style={{ flex: 1 }}>
          <NavigationEvents
              onWillFocus={payload => {
                  refetch();
              }}
          />
          <News feeds={data.feeds} navigation={props.navigation} />
        </View>
      </UserInactivityCheck>
    );
  }
}

const GET_FEEDS = gql`
  query {
    feeds {
      type,
      image,
      title, 
      description,
      pubDate
    }
  }
`;