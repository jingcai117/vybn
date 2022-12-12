import React, { useEffect } from 'react';
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import {
    View,
    Text,
    ImageBackground,
    Image,
    StyleSheet,
    TouchableHighlight,
    AsyncStorage
} from "react-native";
import { NavigationEvents } from "react-navigation";
import { connect } from 'react-redux';
import * as actions from '../../redux/actions';

import Loading from "../../components/Loading";
import CommentScreen from './comment';
import UserInactivityCheck from '../../components/UserInactivityCheck';

function CommentList(props) {
    const { loading, error, data, refetch, networkStatus } = useQuery(
        GET_CONVERSATIONS,
        {
          notifyOnNetworkStatusChange: true
        }
    );

    React.useEffect(() => {
      const unsubscribe = props.navigation.addListener('willFocus', () => {
        console.log('comment list')
      });
  
      return unsubscribe.remove;
    }, [props.navigation]);

    if (loading || networkStatus === 4) {
      return <Loading />;
    }
  
    if (error) {
      console.log('error message: ', error.message);
      return <Text>Error</Text>;
    }

    if (data) {
      props.setConversations(data.conversations);

      return (
        <UserInactivityCheck navigation={props.navigation}>
          <View style={{ flex: 1 }}>
            <NavigationEvents
                onWillFocus={payload => {
                    refetch();
                }}
              />
            <CommentScreen navigation={props.navigation} />
          </View>
        </UserInactivityCheck>
      );
    }
}

export default connect(state => ({
  }), actions)(CommentList);

const GET_CONVERSATIONS = gql`
  query {
    conversations {
      comment,
      commentId,
      mine,
      trackName,
      profilePic,
      conversation {
        content 
        sender, 
        commentId,
        originalComment,
        originalUserId,
        userId,
        email,
        profilePic
      }
    }
  }
`;