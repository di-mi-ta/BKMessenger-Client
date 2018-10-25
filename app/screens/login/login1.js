import React from 'react';
import {
  View,
  Image,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView
} from 'react-native';
import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme,
} from 'react-native-ui-kitten';
import { scaleModerate, scaleVertical } from '../../utils/scale';
import NavigationType from '../../config/navigation/propTypes';

import BKMessProtocolClient from '../../../NativePackage'


import { DeviceEventEmitter } from 'react-native';



export class LoginV1 extends React.Component {
  static propTypes = {
    navigation: NavigationType.isRequired,
  };
  static navigationOptions = {
    header: null,
  };

  constructor(props){
    super(props);
    this.state = {
       username : '__tan__',
       pass: '1234',
       isFailed: false,
    }
  }

  getThemeImageSource = (theme) => (
    theme.name === 'light' ?
      require('../../assets/images/backgroundLoginV1.png') : require('../../assets/images/backgroundLoginV1DarkTheme.png')
  );

  renderImage = () => {
    const screenSize = Dimensions.get('window');
    const imageSize = {
      width: screenSize.width,
      height: screenSize.height - scaleModerate(375, 1),
    };
    return (
      <Image
        style={[styles.image, imageSize]}
        source={this.getThemeImageSource(RkTheme.current)}
      />
    );
  };


  onLoginButtonPressed = () => {
    BKMessProtocolClient.sendRequest(" {\"type\" : \"CHECK_LOGIN\", \"input\" : {\"user_name\": \"" + this.state.username + "\", \"password\": \"" + this.state.pass + "\"  , \"IpAddr\": \"" + this.state.pass + "\" }} ");
    BKMessProtocolClient.receiveMessages();
    DeviceEventEmitter.addListener('LISTENER_RES_CHECK_LOGIN', ({res}) => this.processRes(res));
  };

  processRes(res){
    const a = JSON.parse(res);
    if (a.output.code == 777){
       username = this.state.username;
       this.props.navigation.navigate('ChatList',{username: this.state.username});
    }
    else 
       this.setState({isFailed: true})

  }

  renderLoginFailed(){
    if (this.state.isFailed)
      return (<RkText>Login Failed</RkText>)
  }

  onSignUpButtonPressed = () => {
    this.props.navigation.navigate('SignUp');
  };

  render = () => (
    <RkAvoidKeyboard
      onStartShouldSetResponder={() => true}
      onResponderRelease={() => Keyboard.dismiss()}
      style={styles.screen}>
      {this.renderImage()}
      <View style={styles.container}>
        <RkTextInput rkType='rounded' placeholder='Username' onChangeText={text => this.setState({username:text})} />
        <RkTextInput rkType='rounded' placeholder='Password' onChangeText={text => this.setState({pass:text})} secureTextEntry />
        {this.renderLoginFailed()}
        <RkButton
          onPress={this.onLoginButtonPressed}
        >
          LOGIN
        </RkButton>
        <View style={styles.footer}>
          <View style={styles.textRow}>
            <RkButton rkType='clear'>
              <RkText rkType='header6' onPress={this.onSignUpButtonPressed}>Sign up</RkText>
            </RkButton>
          </View>
        </View>
      </View>
    </RkAvoidKeyboard>
  )
}

const styles = RkStyleSheet.create(theme => ({
  screen: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.screen.base,
  },
  image: {
    resizeMode: 'cover',
    marginBottom: scaleVertical(10),
  },
  container: {
    paddingHorizontal: 17,
    paddingBottom: scaleVertical(22),
    alignItems: 'center',
    flex: -1,
  },
  footer: {
    justifyContent: 'flex-end',
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    marginBottom: scaleVertical(24),
  },
  button: {
    marginHorizontal: 14,
  },
  save: {
    marginVertical: 9,
  },
  textRow: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
}));
