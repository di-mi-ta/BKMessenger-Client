import React from 'react';
import {
  FlatList,
  View,
  Image,
  TouchableOpacity,
  Keyboard,
  Alert
} from 'react-native';
import {
  RkButton,
  RkText,
  RkTextInput,
  RkAvoidKeyboard,
  RkStyleSheet,
  RkTheme,
} from 'react-native-ui-kitten';
import _ from 'lodash';
import { data } from '../../data';
import { Avatar } from '../../components/avatar';
import { scale } from '../../utils/scale';
import { Button } from 'react-native-elements';
import ImagePicker from 'react-native-image-crop-picker';

import BKMessProtocolClient from '../../../NativePackage'

import { DeviceEventEmitter } from 'react-native';
import { DocumentPicker, DocumentPickerUtil } from 'react-native-document-picker';

const moment = require('moment');

export class Chat extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const withReceiverName = navigation.state.params ? navigation.state.params.withReceiverName : undefined;
    const idRec = navigation.state.params ? navigation.state.params.idRec : undefined;
    const user_name = navigation.state.params ? navigation.state.params.username : undefined;
    const onNavigateBack = navigation.state.params ? navigation.state.params.onNavigateBack : undefined;
    return ({
        headerLeft: Chat.renderBack(navigation,onNavigateBack),
        headerTitle: Chat.renderNavigationTitle(withReceiverName),
        headerRight: Chat.renderVideoCall(navigation,user_name,idRec),
    });
  };

  constructor(props) {
    super(props);
    this.state = {
      username : this.props.navigation.getParam('username', undefined),
      withReceiverName : this.props.navigation.getParam('withReceiverName', undefined),
      idRec : this.props.navigation.getParam('idRec', undefined),
      data: [],
      isProcessedItem: 0,
      itemMessToDelete: null
    };
    BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_MESSAGE\", \"input\" : {\"user_name\": \"" + this.state.username + "\", \"idReceiver\": " + this.state.idRec + "}} ");
    BKMessProtocolClient.listenMess();
    DeviceEventEmitter.addListener('LISTENER_RES_MESSAGE', ({res}) => {this.processRes(res)});
    DeviceEventEmitter.addListener('LISTENER_NEW_MESSAGES', ({res}) => {this.processNewMessage(res)});
    DeviceEventEmitter.addListener('LISTENER_RES_CONFIRM_VC', ({res}) => {this.processComfirmVideoCall(res)});
    DeviceEventEmitter.addListener('LISTENER_GET_CONFIRM_VIDEO_CALL', ({res}) => {this.onReceiveRequestVideoCall(res)});
    DeviceEventEmitter.addListener('LISTENER_ERROR', ({res}) => {
      Alert.alert(
        'Notification',
        {res},
        [
          {text: 'OK', onPress: () => {}},
        ],
        { cancelable:true }
      )
    });
    DeviceEventEmitter.addListener('LISTENER_RES_GET_CONTENT_FILE', ({res}) => {this.processGetContentFile(res)});
  }

  onReceiveRequestVideoCall(res){
    const _res = JSON.parse(res);
      Alert.alert(
        'Request new video call',
        _res.output.sender + "want to call video with you!!!!",
        [
          {text: 'OK', onPress: () => this.onConfirmVideoCall(_res)},
          {text: 'Cancel', onPress: () => this.onCancelVideoCall(_res)},
        ],
        { cancelable:true }
      )
  }

  onConfirmVideoCall(_res){
    BKMessProtocolClient.sendRequest(" {\"type\" : \"RES_CONNECT_VC_FROM_RECEIVER\", \"input\" : {\"sender\": \"" + _res.output.sender + "\", \"idReceiver\": " + _res.output.idReceiver + ", \"confirm\": \"OK\"}}");
    this.props.navigation.navigate('VideoCall', { roomID: _res.output.key })
  }

  onCancelVideoCall(_res){
    BKMessProtocolClient.sendRequest(" {\"type\" : \"RES_CONNECT_VC_FROM_RECEIVER\", \"input\" : {\"sender\": \"" + _res.output.sender + "\", \"idReceiver\": " + _res.output.idReceiver + ", \"confirm\": \"No\"}}");
  }

  processComfirmVideoCall(res){
    const info = JSON.parse(res);
    if (info.output.confirm == "OK"){
      this.props.navigation.navigate('VideoCall', { roomID: info.output.sender })
    }
  }


  processRes(res){
    const listMess = JSON.parse(res);
    this.setState({
      data: listMess.output.messages
    })
  }


  processNewMessage(res){
    const info = JSON.parse(res);
    if (info.output.idReceiver == this.state.idRec){
      if (info.output.message.type !== "text"){
        BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_CONTENT\", \"input\" : {\"idFile\": " + info.output.message.idMess + "}} ");
      }
      
      this.state.data.push(info.output.message);
    }
  }

  processGetContentFile(res){
    const info = JSON.parse(res);
    var copyData = this.state.data
    var foundIndex = copyData.findIndex(x => x.idMess == info.output.idMess);
    copyData[foundIndex].content = info.output.content
    copyData[foundIndex].isLoaded = 1
    this.setState({
      data : copyData
    })
  }

  onInputChanged = (text) => {
    this.setState({ message: text });
  };

  onSendButtonPressed = () => {
    if (!this.state.message) {
      return;
    }
    BKMessProtocolClient.sendRequest(" {\"type\" : \"SEND_TEXT_MESSAGE\", \"input\" : {\"sender\": \"" + this.state.username + "\", \"idReceiver\": " + this.state.idRec + ", \"content\": \"" + this.state.message + "\"}} ");
    this.setState({ message: '' });
  };

  static onVideoCallPressed = (navigation,user_name,idRec) => {
    BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_CONNECT_VC\", \"input\" : {\"sender\": \"" + user_name + "\", \"idReceiver\": " + idRec + "}} ");
    Alert.alert(
      'Notification',
      'Connecting ... ',
      [],
      { cancelable:true }
    )
  
  };

  static onBackButtonPressed = (navigation,onNavigateBack) => {
        BKMessProtocolClient.closeListenMess();
        onNavigateBack();
        navigation.goBack();
  };

  static renderNavigationTitle = (withReceiverName) => (
    <TouchableOpacity>
      <View style={styles.header}>
        <RkText rkType='header5'>{`${withReceiverName}`}</RkText>
        <RkText rkType='secondary3 secondaryColor'>Online</RkText>
      </View>
    </TouchableOpacity>
  );

  static onAddGroupPressed = (navigation,user_name,idRec) => {
    navigation.navigate('AddGroup',{username: user_name, idRec: idRec})
  };

  static renderVideoCall = (navigation,user_name,idRec) => (
    <View>
      <TouchableOpacity onPress={() => Chat.onAddGroupPressed(navigation, user_name, idRec)}>
        <Avatar style={styles.avatar} rkType='small' img={require('../../assets/icons/addGroup.png')}/>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => Chat.onVideoCallPressed(navigation, user_name,idRec)}>
        <Avatar style={styles.avatar} rkType='small' img={require('../../assets/images/videoicon.png')}/>
      </TouchableOpacity>
    </View>
  );

  static renderBack = (navigation,onNavigateBack) => (
    <TouchableOpacity onPress={() => Chat.onBackButtonPressed(navigation,onNavigateBack)}>
      <Avatar style={styles.back} rkType='small' img={require('../../assets/icons/backicon.png')}/>
    </TouchableOpacity>
  );

  renderFriendAvatar = () => (
      <Avatar style={styles.avatar} rkType='small' img={{uri: 'https://facebook.github.io/react-native/docs/assets/favicon.png'}}/>
  );

  renderDate = (item) => (
    <RkText style={styles.time} rkType='secondary7 hintColor'>
      {moment(item.timeSent).format('MMMM Do YYYY, h:mm:ss a')}
    </RkText>
  );

  renderNameSender = (item) => (
    <RkText  rkType='secondary3 hintColor'>
      {item.sender}
    </RkText>
  );

  processItem = (item) => {
      Alert.alert(
        'Delete Message',
        'Do you delete this message?',
        [
          {text: 'Delete All', onPress: () => this.onDeleteAllMessagesButtonPressed(item)},
          {text: 'OK', onPress: () => this.onDeleteMessagesButtonPressed(item)},
          {text: 'Cancel', onPress: () => {},style: 'cancel'},
        ],
        { cancelable:true }
      )
  }

  renderContentMessage = (item,backgroundColor) => {
      if (item.type == "text"){
         return (
          <View style={[styles.balloon, { backgroundColor }]}>
            <RkText rkType='primary2 mediumLine chat' style={{ paddingTop: 5 }}>{item.content}</RkText>
          </View>
         )
      }
      else{
        if (item.isLoaded === 0){
         BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_CONTENT\", \"input\" : {\"idFile\": " + item.idMess + "}} ");
         return (
          <Image source={require('../../assets/icons/load.gif')} style={{width : scale(200), height : scale(200) }} />
         )
        }
        else {
          return (
            <Image source={{uri: `data:image/png;base64,${item.content}`}} style={{width : scale(200), height : scale(200) }} />
         )
        }
      }
  }

  renderItem = ({ item }) => {
    const isIncoming = item.sender !== this.state.username;
    const backgroundColor = isIncoming
      ? RkTheme.current.colors.chat.messageInBackground
      : RkTheme.current.colors.chat.messageOutBackground;
    const itemStyle = isIncoming ? styles.itemIn : styles.itemOut;

    return (
        <View style={[styles.item, itemStyle]}>
          {isIncoming && this.renderFriendAvatar()}
          <View>
          <TouchableOpacity onPress = { 
            () => this.processItem(item)
          }>
          {isIncoming && this.renderNameSender(item)}
          {this.renderContentMessage(item,backgroundColor)}
          </TouchableOpacity>
          {this.renderDate(item)}
          </View>
        </View>
     
    );
  };

  renderBottomChat = () => {
    if (this.state.isProcessedItem === 0) {
         return (
          <View style={styles.footer}>
          <RkButton style={styles.plus} rkType='clear'  onPress={this.onSendFilePressed}>
            <RkText rkType='icon'>+</RkText>
          </RkButton>
          <RkTextInput
            onFocus={this.scrollToEnd}
            onBlur={this.scrollToEnd}
            onChangeText={this.onInputChanged}
            value={this.state.message}
            rkType='row sticker'
            placeholder="Add a message..."
          />
          <RkButton onPress={this.onSendButtonPressed} style={styles.send} rkType='circle highlight'>
            <Image source={require('../../assets/icons/sendIcon.png')} />
          </RkButton>
        </View>
        )
    }
    else {
      return (
        <View style={styles.DeFobutton}>
        <Button
            title="DELETE"
            onPress = {() => this.onDeleteMessagesButtonPressed()}
            buttonStyle={{
              backgroundColor: "rgba(92, 99,216, 1)",
              height: 60,
              width: 100,
              marginLeft: 0,
              borderColor: "transparent",
              borderWidth: 0,
              borderRadius: 5
            }}
        />

        <Button
            title="DELETE ALL"
            onPress = {() => this.onDeleteAllMessagesButtonPressed()}
            buttonStyle={{
              backgroundColor: "red",
              height: 60,
              width: 100,
              marginLeft: 0,
              borderColor: "transparent",
              borderWidth: 0,
              borderRadius: 5
            }}
        />

        <Button
            title="CANCEL"
            onPress = {() => this.onCancelButtonPressed()}
            buttonStyle={{
              backgroundColor: "rgba(92, 99,216, 1)",
              height: 60,
              width: 100,
              marginLeft: 0,
              borderColor: "transparent",
              borderWidth: 0,
              borderRadius: 5
            }}
        />
      </View>
      )
    }
  }


  onDeleteMessagesButtonPressed = (item) => {
    BKMessProtocolClient.sendRequest(" {\"type\" : \"DELETE_MESSAGE\", \"input\" : {\"user_name\": \"" + this.state.username + "\", \"idMess\": " + item.idMess + "}} ");
    BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_MESSAGE\", \"input\" : {\"user_name\": \"" + this.state.username + "\", \"idReceiver\": " + this.state.idRec + "}} ");
  }

  onDeleteAllMessagesButtonPressed = (item) => {
    BKMessProtocolClient.sendRequest(" {\"type\" : \"DELETE_ALL_MESSAGE\", \"input\" : {\"sender\": \"" + this.state.username + "\", \"receiver\": " + this.state.idRec + "}} ");
    BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_MESSAGE\", \"input\" : {\"user_name\": \"" + this.state.username + "\", \"idReceiver\": " + this.state.idRec + "}} ");
  }

  onCancelButtonPressed = (item) => {
  
  }

  onSendFilePressed = () => {
    ImagePicker.openPicker({
      width: 250,
      height: 250,
      cropping: true,
      includeBase64 : true,
      compressImageMaxHeight: 250,
      compressImageMaxWidth: 250,
      compressImageQuality: 0.9
    }).then(image => {
      //alert(image.data)
      BKMessProtocolClient.sendRequest(" {\"type\" : \"SEND_FILE_MESSAGE\", \"input\" : {\"sender\": \"" + this.state.username + "\", \"idReceiver\": " + this.state.idRec + ",\"content\": \"" + image.data + "\" ,\"type\": \"img\",\"nameFile\": \"image\" }} ")
    });
  };


  render = () => (
    <RkAvoidKeyboard
      style={styles.container}
      onResponderRelease={Keyboard.dismiss}>
      <FlatList
        ref={ ( ref ) => this.scrollView = ref }
        onContentSizeChange={ () => {        
            this.scrollView.scrollToEnd( { animated: false } )
        } } 
        extraData={this.state}
        style={styles.list}
        data={this.state.data}
        keyExtractor={this.extractItemKey}
        renderItem={this.renderItem}
      />
      {this.renderBottomChat()}
    </RkAvoidKeyboard>
  )
}

const styles = RkStyleSheet.create(theme => ({
  header: {
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  back: {
    marginLeft: 16,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.screen.base,
  },
  list: {
    paddingHorizontal: 17,
  },
  footer: {
    flexDirection: 'row',
    minHeight: 60,
    padding: 10,
    backgroundColor: theme.colors.screen.alter,
  },

  DeFobutton: {
    minHeight: 60,
    flexDirection: 'row',
    margin: 0,
    padding: 0,
  },

  delete : {
    height : 60,
    backgroundColor: theme.colors.screen.alter,
    color: 'red',
  },

  item: {
    marginVertical: 14,
    flex: 1,
    flexDirection: 'row',
  },
  itemIn: {},
  itemOut: {
    alignSelf: 'flex-end',
  },
  balloon: {
    maxWidth: scale(250),
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    borderRadius: 20,
  },
  time: {
    alignSelf: 'flex-end',
    marginTop: 5,
  },
  plus: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginRight: 7,
  },
  send: {
    width: 40,
    height: 40,
    marginLeft: 10,
  },
  file: {
    width: 40,
    height: 40,
    marginRight: 5,
  },
}));
