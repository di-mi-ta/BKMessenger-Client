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
  RkButton
} from 'react-native-ui-kitten';
import { data } from '../../data';
import { Avatar } from '../../components/avatar';
import { scale } from '../../utils/scale';


import { DeviceEventEmitter } from 'react-native';
import BKMessProtocolClient from '../../../NativePackage'


export class Friends extends React.Component {
  static navigationOptions = {
    title: 'Friends',
    headerLeft: null
  };
  
  constructor(props){
    super(props);
    this.state = {
      data: {
        original: [],
        filtered: [],
      },
      username : this.props.navigation.getParam('username', undefined),
      groupID: this.props.navigation.getParam('groupID', undefined),
    }
    BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_LIST_FRIENDS\", \"input\" : {\"user_name\": \"" + this.state.username +"\"}} ");
    DeviceEventEmitter.addListener('LISTENER_RES_LIST_FRIEND', ({res}) => {this.processRes(res)});
  };

  handleOnNavigateBack() {
    BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_LIST_FRIENDS\", \"input\" : {\"user_name\": \"" + this.state.username +"\"}} ");
  }

  processRes(res){
    const listIB = JSON.parse(res);
    this.setState({
      onNavigateBack: this.props.navigation.getParam('onNavigateBack', undefined),
      data: {
        original: listIB.output.friends,
        filtered: listIB.output.friends,
      },
    })
  }

  extractItemKey = (item) => `${item.user_name}`;



  onSearchInputChanged = (event) => {
    const pattern = new RegExp(event.nativeEvent.text, 'i');
    const contacts = _.filter(this.state.data.original, contact => {
      const filterResult = {
        username: contact.user_name.search(pattern),
      };
      return filterResult.username !== -1  ? contact : undefined;
    });
    this.setState({
      data: {
        original: this.state.data.original,
        filtered: contacts,
      },
    });
    BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_LIST_FRIENDS_OUT_OF_GROUP\", \"input\" : {\"user_name\": \"" + this.state.username + "\", \"group_id\":" + this.state.groupID + "}} ");
  };

  
  onItemPressed = (item) => {
    const navigationParams = {onNavigateBack: this.handleOnNavigateBack.bind(this), username: this.state.username , withReceiverName: item.user_name , idRec : item.idRec, groupID: item.group_id };
    this.props.navigation.navigate('Chat', navigationParams);
  };

  renderItem = ({ item }) => (
    <TouchableOpacity onPress = {() => this.onItemPressed(item)}>
      <View style={styles.container}>
        <Avatar rkType='circle' style = {{marginRight: 15}} img={require('../../assets/icons/ozil.jpg')}/>
        <RkText style = {{ minWidth: scale(180)}}>{`${item.user_name}`}</RkText>
        {this.renderButton(item)}
      </View>
    </TouchableOpacity>
  );

  renderButton = (item) => {
    if (item.isGroup == 1){
      if (item.numOn == 1){
        return(
          <Text style = {{color: 'green', marginRight: 20}} >{item.numOn} user is online</Text> 
        )
      }
      if (item.numOn > 1){
        return(
          <Text style = {{color: 'green', marginRight: 20}} >{item.numOn} users is online</Text> 
        )
      }
      
    }
    else {
      if (item.status == 1) {
        return(
          <Text style = {{color: 'green', marginRight: 20}} >Online</Text> 
        )
      }
    }
  }

  renderSeparator = () => (
    <View style={styles.separator} />
  );


  onAddPress = (item) => {
    BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_ADD_MEMBER_TO_GROUP\", \"input\" : {\"user_name\": \"" + item.user_name + "\", \"group_id\":" + this.state.groupID + "}} ");
    var copyData = this.state.data.original;
    var foundIndex = copyData.findIndex(x => x.user_name == item.user_name);
    copyData[foundIndex].isAdded = 1;
    this.setState({
      data: {
        original: copyData,
        filtered: copyData,
      },
    });
  }

  renderHeader = () => (
    <View style={styles.searchContainer}>
      <RkTextInput
        autoCapitalize='none'
        autoCorrect={false}
        onChange={this.onSearchInputChanged}
        rkType='row'
        placeholder='Search'
      />
    </View>
  );

  render = () => (
    <FlatList
      style={styles.root}
      data={this.state.data.filtered}
      renderItem={this.renderItem}
      ListHeaderComponent={this.renderHeader}
      ItemSeparatorComponent={this.renderSeparator}
      keyExtractor={this.extractItemKey}
      enableEmptySections
    />
  )
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
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border.base,
  },
}));
