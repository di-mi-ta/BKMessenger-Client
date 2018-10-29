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

import BKMessProtocolClient from '../../../NativePackage'

import { DeviceEventEmitter } from 'react-native';


export class ViewMembers extends React.Component {
  static navigationOptions = {
    title: 'Group Members',
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
    BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_LIST_MEM_OF_GROUP\", \"input\" : {\"group_id\":" + this.state.groupID + "}} ");
    DeviceEventEmitter.addListener('LISTENER_RES_GET_MEMBERS_OF_GROUP', ({res}) => {this.processRes(res)});
  };

  processRes(res){
    const listIB = JSON.parse(res);
    this.setState({
      data: {
        original: listIB.output.members,
        filtered: listIB.output.members,
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
  };

  renderItem = ({ item }) => (
    <TouchableOpacity>
      <View style={styles.container}>
        <Avatar rkType='circle' style = {{marginRight: 15}} img={require('../../assets/icons/ozil.jpg')}/>
        <RkText style = {{ minWidth: scale(230)}}>{`${item.user_name}`}</RkText>
        {this.renderButton(item)}
      </View>
    </TouchableOpacity>
  );

  renderButton = (item) => {
    if (item.user_name != this.state.username)
    return (
      <RkButton rkType='clear'  onPress={() => this.onAddPress(item)}> 
          <Text style = {{color: 'red'}} >Delete</Text> 
        </RkButton>
    )
  }

  renderSeparator = () => (
    <View style={styles.separator} />
  );


  onAddPress = (item) => {
    BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_DELETE_MEMBER\", \"input\" : {\"user_name\": \"" + item.user_name + "\", \"group_id\":" + this.state.groupID + ", \"deletor\": \"" + this.state.username + "\" }} ");
    BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_LIST_MEM_OF_GROUP\", \"input\" : {\"group_id\":" + this.state.groupID + "}} ");
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
