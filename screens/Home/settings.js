import React, {Component} from 'react';
import {
    Image,
    View,
    AsyncStorage
} from "react-native";
import ControlScreen from './control';
import GuestListener from './guestlistener';

import Background from "../../assets/music/background.png";
import LoadingModal from "../../components/Loading";

class SettingsScreen extends Component {
    constructor(props) {
        super(props);
        
        this.state = {
            loggedIn: ""
        };
    }

    async UNSAFE_componentWillMount() {
        const loggedIn = await AsyncStorage.getItem("loggedIn");
        this.setState({
            loggedIn: loggedIn
        });
        if (loggedIn == "true") {
            this.props.navigation.navigate("Music");
        }
    }

    getLoadingScreen = () => (
        <View style={{ height: "100%", width: "100%" }}>
            <LoadingModal />
            <Image
                source={Background}
                style={{ flex: 1,  height: null,  width: null }}
                resizeMode="cover"
            />
        </View>
    );

    render() {
        if (this.state.loggedIn == "true") {
            return (<ControlScreen navigation={this.props.navigation} />);
        } else if (this.state.loggedIn == "tempuser") {
            return (<GuestListener navigation={this.props.navigation} />);
        } else {
            return this.getLoadingScreen();
        }
    }
}

export default SettingsScreen;