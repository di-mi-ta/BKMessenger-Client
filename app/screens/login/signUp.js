import React from 'react';
import {
  View,
  Image,
  Keyboard,
  Button
} from 'react-native';
import {
  RkButton,
  RkText,
  RkTextInput,
  RkStyleSheet,
  RkTheme,
  RkAvoidKeyboard,
} from 'react-native-ui-kitten';
import { scaleVertical } from '../../utils/scale';

import BKMessProtocolClient from '../../../NativePackage'

import { DeviceEventEmitter } from 'react-native';



export class SignUp extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props){
    super(props)
    this.state = {
      username : '',
      fullname : '',
      pass: '',
      confirmpass: '',
      isDiffPass: 0,
      isDupUser: 0,
      isSuccess: 0,
    }
    DeviceEventEmitter.addListener('LISTENER_RES_REGISTRATION', ({res}) => {this.processRes(res)});
  }

  processRes(res){
    const resjson = JSON.parse(res);
    if (resjson.output.isExistedUser === "True"){
      this.setState({
        isSuccess : 1,
      })
    }
    else{
      this.setState({
        isDupUser : 1,
      })
    }
  }

  getThemeImageSource = (theme) => (
    theme.name === 'light' ?
      require('../../assets/images/logo.png') : require('../../assets/images/logoDark.png')
  );

  renderImage = () => (
    <Image style={styles.image} source={this.getThemeImageSource(RkTheme.current)} />
  );

  onSignUpButtonPressed = () => {
    this.setState({
      isDiffPass: 0,
      isDupUser: 0,
      isSuccess: 0
    })
    if (this.state.pass !== this.state.confirmpass){
       this.setState({
         isDiffPass : 1
       })
    }
    BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_REGISTRATION\", \"input\" : {\"username\": \"" + this.state.username + "\",\"fullname\": \"" + this.state.fullname + "\", \"password\": \"" + this.state.pass + "\"}} ");
  };

  onSignInButtonPressed = () => {
    this.props.navigation.navigate('Login1');
  };

  renderPassFailed(){
    if (this.state.isDiffPass)
      return (<RkText>Password is different after two times entering!!!</RkText>)
  }

  renderDupUser(){
    if (this.state.isDupUser)
      return (<RkText>User name is used by another user!!!</RkText>)
  }

  renderSuccessful(){
    if (this.state.isDupUser)
      return (<RkText>Registration is successful!</RkText>)
  }

  render = () => (
    <RkAvoidKeyboard
      style={styles.screen}
      onStartShouldSetResponder={() => true}
      onResponderRelease={() => Keyboard.dismiss()}>
      <View style={{ alignItems: 'center' }}>
        {this.renderImage()}
        <RkText rkType='h1'>Registration</RkText>
      </View>
      <View style={styles.content}>
        <View>
        <RkTextInput rkType='rounded' placeholder='Username' onChangeText={text => this.setState({username:text})} />
        <RkTextInput rkType='rounded' placeholder='FullName' onChangeText={text => this.setState({fullname:text})} />
        <RkTextInput rkType='rounded' placeholder='Password' onChangeText={text => this.setState({pass:text})} secureTextEntry />
        <RkTextInput rkType='rounded' placeholder='Confirm Password' onChangeText={text => this.setState({confirmpass:text})} secureTextEntry />
        {this.renderPassFailed()}
        {this.renderDupUser()}
        {this.renderSuccessful()}
        <RkButton
          onPress={() => this.onSignUpButtonPressed()}
        >
          LOGIN
        </RkButton>
        </View>
        <View style={styles.footer}>
          <View style={styles.textRow}>
            <RkButton rkType='clear' onPress={this.onSignInButtonPressed}>
              <RkText rkType='header6'>Sign in now</RkText>
            </RkButton>
          </View>
        </View>
      </View>
    </RkAvoidKeyboard>
  )
}

const styles = RkStyleSheet.create(theme => ({
  screen: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-around',
    backgroundColor: theme.colors.screen.base,
  },
  image: {
    marginBottom: 10,
    height: scaleVertical(77),
    resizeMode: 'contain',
  },
  content: {
    justifyContent: 'space-between',
  },
  save: {
    marginVertical: 20,
  },
  buttons: {
    flexDirection: 'row',
    marginBottom: 12,
    marginHorizontal: 12,
    justifyContent: 'space-around',
  },
  footer: {
    justifyContent: 'flex-end',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
}));
