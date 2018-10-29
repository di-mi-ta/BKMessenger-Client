import React from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native';
import _ from 'lodash';
import {
  RkStyleSheet,
  RkText,
  RkTextInput,
} from 'react-native-ui-kitten';
import { Avatar } from '../../components';

import { DeviceEventEmitter } from 'react-native';

const moment = require('moment');

import BKMessProtocolClient from '../../../NativePackage'



export class ChatList extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const user_name = navigation.state.params ? navigation.state.params.username : undefined;
    return ({
        headerLeft: ChatList.renderFriends(navigation,user_name),
        headerTitle: ChatList.renderNavigationTitle(),
        headerRight: ChatList.renderCreateGroup(navigation,user_name),
    });
  };

  static renderNavigationTitle = (withReceiverName) => (
    <TouchableOpacity>
      <View style={styles.header}>
        <Text style = {{fontWeight : "bold",fontSize: 20, color : '#000099'}}>BKMessenger</Text>
      </View>
    </TouchableOpacity>
  );

  static renderCreateGroup = (navigation,user_name) => (
    <TouchableOpacity onPress={() => ChatList.onCreateGroupPressed(navigation, user_name)}>
      <Avatar style = {{marginRight: 10}} img={require('../../assets/icons/group.png')}/>
    </TouchableOpacity>
  );

  static onCreateGroupPressed = (navigation,user_name) => {
     navigation.navigate('CreateGroup',{username : user_name})
  };

  static renderFriends = (navigation,user_name) => (
    <TouchableOpacity onPress={() => ChatList.onFriendsPressed(navigation,user_name)}>
      <Avatar style = {{marginLeft: 10}} img={require('../../assets/icons/friends.png')}/>
    </TouchableOpacity>
  );

  static onFriendsPressed = (navigation,user_name) => {
    navigation.navigate('Friends',{username : user_name})
  };


  constructor(props){
    super(props);
    this.state = {
      username: this.props.navigation.getParam('username',undefined),
      listInbox : [],
      data: {
        original: [],
        filtered: [],
      },
    }
    BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_INBOX\", \"input\" : {\"user_name\": \"" + this.state.username + "\" }} ");
    DeviceEventEmitter.addListener('LISTENER_RES_INBOX', ({res}) => {this.processRes(res)});
  }


  processRes(res){
    const listIB = JSON.parse(res);
    this.setState({
      data: {
        original: listIB.output.inbox,
        filtered: listIB.output.inbox,
      },
    })
  }


  extractItemKey = (item) => `${item.Receiver}`;

  onInputChanged = (event) => {
    const pattern = new RegExp(event.nativeEvent.text, 'i');
    const chats = _.filter(this.state.data.original, chat => {
      const filterResult = {
        Receiver: chat.Receiver.search(pattern),
      };
      return filterResult.Receiver !== -1  ? chat : undefined;
    });
    this.setState({
      data: {
        original: this.state.data.original,
        filtered: chats,
      },
    });
  };


  handleOnNavigateBack() {
    BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_INBOX\", \"input\" : {\"user_name\": \"" + this.state.username + "\" }} ");
  }


  onItemPressed = (item) => {
    const navigationParams = {  onNavigateBack: this.handleOnNavigateBack.bind(this), username: this.state.username ,withReceiverName: item.Receiver , idRec : item.idReceiver, groupID: item.group_id };
    this.props.navigation.navigate('Chat', navigationParams);
  };

  renderSeparator = () => (
    <View style={styles.separator} />
  );

  renderInputLabel = () => (
    <RkText rkType='awesome'></RkText>
  );

  renderHeader = () => (
    <View style={styles.searchContainer}>
      <RkTextInput
        autoCapitalize='none'
        autoCorrect={false}
        onChange={this.onInputChanged}
        label={this.renderInputLabel()}
        rkType='row'
        placeholder='Search'
      />
    </View>
  );

  renderItem = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => this.onItemPressed(item)}>
        <View style={styles.container}>
          <Avatar rkType='circle' style={styles.avatar} img={require('../../assets/icons/ozil.jpg')} />
          <View style={styles.content}>
            <View style={styles.contentHeader}>
              <RkText rkType='header5'>{`${item.Receiver}`}</RkText>
              <RkText rkType='secondary4 hintColor'>
                {moment(item.TimeOfLastMess).format('h:mm:ss a')}
              </RkText>
            </View>
            <RkText numberOfLines={2} rkType='secondary4 hintColor' style={{ paddingTop: 5 }}>
              {item.LastMess}
            </RkText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  render = () => (
    <FlatList
      style={styles.root}
      data={this.state.data.filtered}
      extraData={this.state}
      ListHeaderComponent={this.renderHeader}
      ItemSeparatorComponent={this.renderSeparator}
      keyExtractor={this.extractItemKey}
      renderItem={this.renderItem}
    />
  );
}

const styles = RkStyleSheet.create(theme => ({
  root: {
    backgroundColor: theme.colors.screen.base,
  },
  searchContainer: {
    backgroundColor: theme.colors.screen.bold,
    paddingHorizontal: 16,
    paddingVertical: 10,
    height: 60,
    alignItems: 'center',
  },
  container: {
    paddingLeft: 19,
    paddingRight: 16,
    paddingBottom: 12,
    paddingTop: 7,
    flexDirection: 'row',
  },
  content: {
    marginLeft: 16,
    flex: 1,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border.base,
  },
}));
