import types from '../types';

const initState = {
    selectedChannel: null,
    selectedChannelIndex: 0,
    playQueue: null,
    selectedTrack: null,
    selectedTrackIndex: 0,
    soundObject: null,
    myChannels: null,
    playstate: false,
    profile: null,
    comments: [],
    myComments: [],
    conversations: [],
    socket: null,
    genres: [],
    selectedGenre: "",
    selectedUri: '',
    duration: 0,
    playAd: false,
    timeTrackerWidth: 0,
    updateTrackerWidth: false,
    skipCancelTimes: [],
    lastActionTime: 0,
    inactiveLongTime: false,
    isWaiting: false
};

export const reducer = (state = initState, action) => {
    const { type, payload } = action;

    switch ( type ) {
        case types.SAVE_SELECTEDCHANNEL: {
            return {
                ...state,
                selectedChannel: payload
            }
        }
        case types.SAVE_PLAYSTATE: {
            return {
                ...state,
                playstate: payload
            }
        }
        case types.SAVE_PLAYQUEUE: {
            return {
                ...state,
                playQueue: payload
            }
        }
        case types.SAVE_SELECTEDTRACK: {
            if (state.selectedTrack == payload) {
                return {
                    ...state,
                    selectedTrack: payload
                };
            }
            return {
                ...state,
                selectedTrack: payload,
                timeTrackerWidth: 0,
                updateTrackerWidth: false
            }
        }
        case types.SAVE_SELECTEDTRACKINDEX: {
            return {
                ...state,
                selectedTrackIndex: payload,
            }
        }
        case types.SAVE_SOUNDOBJECT: {
            return {
                ...state,
                soundObject: payload,
            }
        }
        case types.ADD_CHANNEL: {
            const {myChannels: beforeAdd} = state;
            const myChannels = [...beforeAdd, payload];
            return {
                ...state,
                myChannels,
            }
        }
        case types.SAVE_MYCHANNELS: {
            return {
                ...state,
                myChannels: payload,
            }
        }
        case types.SAVE_SELECTEDCHANNELINDEX: {
            return {
                ...state,
                selectedChannelIndex: payload,
            }
        }
        case types.SAVE_PROFILE: {
            return {
                ...state,
                profile: payload,
            }
        }
        case types.SET_COMMENTS: {
            return {
                ...state,
                comments: payload
            }
        }
        case types.ADD_COMMENT: {
            const { comments } = state;
            return {
                ...state,
                comments: [...comments, payload]
            }
        }
        case types.SET_COMMENT: {
            let comments = state.comments;
            comments[payload.index] = payload.value;
            return {
                ...state,
                comments: comments
            }
        }
        case types.SET_MY_COMMENTS: {
            return {
                ...state,
                myComments: payload
            }
        }
        case types.SET_CONVERSATIONS: {
            // console.log('set conversations --------------------->');
            return {
                ...state,
                conversations: payload
            }
        }
        case types.ADD_MESSAGE: {
            const commentId = payload.commentId;
            let conversations = state.conversations;
            let conversation = conversations.filter(item => item.commentId == commentId);
            let indexArray = conversations.map(item => item.commentId);
            let index = indexArray.indexOf(commentId);

            conversation[0].conversation.push(payload);
            conversations[index] = conversation[0];

            // console.log('---------------------------', conversations);
            return {
                ...state,
                conversations: conversations
            }
        }
        case types.SET_SOCKET: {
            return {
                ...state,
                socket: payload
            }
        }
        case types.SAVE_GENRES: {
            return {
                ...state,
                genres: payload
            };
        }
        case types.SAVE_SELECTEDGENRE: {
            return {
                ...state,
                selectedGenre: payload
            };
        }
        case types.SET_URI: {
            return {
                ...state,
                selectedUri: payload
            };
        }
        case types.SET_DURATION: {
            return {
                ...state,
                duration: payload
            };
        }
        case types.PLAY_AD: {
            return {
                ...state,
                playAd: payload
            }
        }
        case types.SAVE_TIMETRACKERWIDTH: {
            return {
                ...state,
                timeTrackerWidth: payload
            };
        }
        case types.SAVE_UPDATETRACKERWIDTH: {
            return {
                ...state,
                updateTrackerWidth: payload
            };
        }
        case types.SAVE_SKIPCANCELTIMES: {
            return {
                ...state,
                skipCancelTimes: payload
            };
        }
        case types.SAVE_LASTACTIONTIME: {
            return {
                ...state,
                lastActionTime: payload
            };
        }
        case types.SAVE_INACTIVELONGTIME: {
            return {
                ...state,
                inactiveLongTime: payload
            };
        }
        case types.SAVE_ISWAITING: {
            return {
                ...state,
                isWaiting: payload
            };
        }
        default: {
            return state;
        }
    }
}
