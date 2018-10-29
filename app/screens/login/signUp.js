import React from 'react';
import {
  View,
  Image,
  Keyboard,
  Button,
  Text
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
    DeviceEventEmitter.addListener('LISTENER_RES_REGISTRATION', ({res}) => this.processRes(res));
  }

  processRes(res){
    const resjson = JSON.parse(res);
    if (resjson.output.isExistedUser != "True"){
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
      isSuccess: 0,
      isNull: 0
    })
    if (this.state.username == '' || this.state.fullname == '' || this.state.pass == '' || this.state.confirmpass == ''){
      this.setState({
        isNull : 1
      })
    }
    else if (this.state.pass != this.state.confirmpass){
      this.setState({
        isDiffPass : 1
      })
   }
   else {
      BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_REGISTRATION\", \"input\" : {\"user_name\": \"" + this.state.username + "\",\"full_name\": \"" + this.state.fullname + "\", \"password\": \"" + this.state.pass + "\"}} ");
    }
  };

  onSignInButtonPressed = () => {
    this.props.navigation.navigate('Login1');
  };

  renderResult(){
    if (this.state.isDiffPass)
      return (<Text style={{color: 'red'}}>Password is different after two times entering!!!</Text>)
    if (this.state.isDupUser)
      return (<Text style={{color: 'red'}}>User name is used by another user!!!</Text>)
    if (this.state.isSuccess)
      return (<Text style={{color: 'red'}}>Registration is successful!</Text>)
    if (this.state.isNull)
      return (<Text style={{color: 'red'}}>All fields must be filled!!!</Text>)
  }

  render = () => (
    <RkAvoidKeyboard
    onStartShouldSetResponder={() => true}
    onResponderRelease={() => Keyboard.dismiss()}
    style={styles.screen}>
    <View style={styles.container}>
    <Text style={{fontWeight: 'bold', fontSize: 25, marginBottom : 15, color : '#000099'}}>REGISTRATION</Text>
    <RkTextInput rkType='rounded' placeholder='Username' onChangeText={text => this.setState({username:text})} />
        <RkTextInput rkType='rounded' placeholder='FullName' onChangeText={text => this.setState({fullname:text})} />
        <RkTextInput rkType='rounded' placeholder='Password' onChangeText={text => this.setState({pass:text})} secureTextEntry />
        <RkTextInput rkType='rounded' placeholder='Confirm Password' onChangeText={text => this.setState({confirmpass:text})} secureTextEntry />
        {this.renderResult()}
        <RkButton style = {{marginTop: 15}}
          onPress={() => this.onSignUpButtonPressed()}
        >
          SIGN IN
        </RkButton>
        <View style={styles.footer}>
          <View style={styles.textRow}>
            <RkButton rkType='clear' onPress={this.onSignInButtonPressed}>
            <Text style={{fontWeight: 'bold', fontSize: 17, marginBottom : 5, color : '#000099'}}>Log in now</Text>
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
    backgroundColor: "FF9966",
  },
  image: {
    marginBottom: 10,
    height: scaleVertical(77),
    resizeMode: 'contain',
  },

  container: {
    paddingHorizontal: 17,
    paddingBottom: scaleVertical(22),
    alignItems: 'center',
    flex: -1,
  },
  content: {
    justifyContent: 'center',
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
    marginTop: 40,
    justifyContent: 'flex-end',
  },
  textRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
}));
