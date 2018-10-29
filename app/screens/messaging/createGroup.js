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


export class CreateGroup extends React.Component {
  static navigationOptions = {
    header: null,
  };

  constructor(props){
    super(props)
    this.state = {
      username: this.props.navigation.getParam('username', undefined),
      isNull: 0,
    }
    DeviceEventEmitter.addListener('LISTENER_RES_CREATE_GROUP', ({res}) => this.processRes(res));
  }

  processRes(res){
    const resjson = JSON.parse(res);
    if (resjson.output.groupId){
      this.props.navigation.navigate('AddGroup2', {username: this.state.username, groupID: resjson.output.groupId });
    }
  }

  onCreatePressed = () => {
     if (this.state.groupName == ""){
        this.setState({
          isNull : 1,
        })
     }
     else {
          BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_CREATE_GROUP\", \"input\" : {\"creator\": \"" + this.state.username + "\",\"group_name\": \"" + this.state.groupName + "\"}}");
     }
  };

 

  renderResult(){
    if (this.state.isNull)
      return (<Text style={{color: 'red'}}>All fields must be filled!!!</Text>)
  }

  render = () => (
    <RkAvoidKeyboard
    onStartShouldSetResponder={() => true}
    onResponderRelease={() => Keyboard.dismiss()}
    style={styles.screen}>
    <View style={styles.container}>
    <Text style={{fontWeight: 'bold', fontSize: 25, marginBottom : 15, color : '#000099'}}>CHAT GROUP</Text>
        <RkTextInput rkType='rounded' placeholder='Enter name of group ...' onChangeText={text => this.setState({groupName:text})} />
        <RkButton style = {{marginTop: 15}}
          onPress={() => this.onCreatePressed()}
        >
          CREATE
        </RkButton>
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
