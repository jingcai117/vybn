import React, { useEffect } from 'react';
import {
    View, 
    Image, 
    ImageBackground,
    TextInput,
    TouchableOpacity
} from 'react-native';
import gql from "graphql-tag";
import { connect } from 'react-redux';
import showError from "../utils/showError";

import * as actions from '../redux/actions';
import client from "../graphql/client";
import * as Config from '../config';
import HeaderRight from "../assets/music/music_play_header_right.png";
import ProfileEmpty from "../assets/profile.png";

import TrackNameBackground from "../assets/music/track_name_background.png";
import SendIcon from "../assets/send.png";

function InputBox(props) {
    const [content, setContent] = React.useState('');
    const [profileImg, setProfileImg] = React.useState('');

    const onChange = (value) => {
        setContent(value);
    }

    const postComment = async () => {
        if (props.disabled) {
            showError("Comment Disabled");
            return;
        }
        if(content == '') return;

        props.send(content);
        setContent('');
    }

    useEffect(() => {
        if ( props.state.profile != null && props.state.profile.profilePic ) {
            let image = Config.STATIC_URL+'/' + props.state.profile.profilePic;
            console.log('profileImg -----------> ', image);
            setProfileImg(image);
        }

    }, [props.state.profile]) ;

    return (
        <View
            style={{
                alignItems: "center",
                paddingVertical: 10
            }} >

            <View style={{ flexDirection: "row", alignItems: 'center' }}>
                { profileImg != ''
                    ? <Image style={{ width: 37, height: 37, borderRadius: 7 }} source={{ uri: profileImg }} />
                    : <Image style={{ width: 37, height: 37, borderRadius: 7 }} source={ProfileEmpty} />
                }

                <View
                    style={{
                        flex: 1,
                        marginRight: 10,
                        marginLeft: 10,
                        flexDirection: "column",
                        zIndex: 1
                    }} >
                    <ImageBackground
                        imageStyle={{
                            shadowColor: "#4d4f5e",
                            shadowOffset: { width: 2, height: 0 },
                            shadowRadius: 0,
                            borderColor: "#202024",
                            borderWidth: 1,
                            borderRadius: 5
                        }}
                        style={{ height: null, width: null }}
                        source={TrackNameBackground}
                    >
                        <TextInput
                            name='comment'
                            style={{ marginLeft: 5, height: 40, color: '#abaed0' }}
                            placeholder={ props.disabled ? "Comment Disabled" : "Add your comment.." }
                            placeholderTextColor="#abaed0"
                            value={ content }
                            onChangeText={ onChange }
                            editable={ !props.disabled }
                        />
                    </ImageBackground>
                </View>

                <TouchableOpacity
                    onPress={ postComment }>
                    <Image source={SendIcon} style={{width: 30, height: 30, marginRight: 5}}/>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const ADD_COMMENT = gql`
  mutation($content: String, $userId: Int, $trackId: Int) {
    addComment(content: $content, userId: $userId, trackId: $trackId) {
        id,
        content,
        userId,
        trackId,
        replies {
            content,
            userId,
            commentId
        },
        count
    }
  }
`;

const ADD_REPLY = gql`
  mutation($content: String, $userId: Int, $commentId: Int) {
    addReply(content: $content, userId: $userId, commentId: $commentId) {
        id,
        content,
        userId,
        trackId,
        replies {
            content,
            userId,
            commentId
        },
        count
    }
  }
`;

const GET_COMMENTS = gql`
  query($trackId: Int!) {
    comments(trackId: $trackId) {
        id,
        content,
        userId,
        trackId, 
        replies {
          content,
          userId,
          commentId
        },
        count
    }
  }
`;

const mapStateToProps = (state) => {
    return {
        state: state.app
    }
};

export default connect(state => (mapStateToProps), actions)(InputBox);