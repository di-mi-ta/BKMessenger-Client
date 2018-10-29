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


export class AddGroup2 extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const username = navigation.state.params ? navigation.state.params.username : undefined;
    return ({
        headerLeft: null,
        headerTitle: AddGroup2.renderNavigationTitle(),
        headerRight: AddGroup2.renderOK(navigation),
    });
    



  };

  static renderNavigationTitle = () => {
    return(
      <TouchableOpacity >
        <View style={styles.header}>
          <RkText rkType='header5'> Add member</RkText>
        </View>
      </TouchableOpacity>
    )
  };

  static renderOK = (navigation,username) => {
    return(
      <TouchableOpacity onPress = {()=> {navigation.navigate('ChatList',{username: username})}}>
        <View style={styles.header}>
        <Text style = {{color: 'red', fontSize: 20, marginRight: 10}} >OK</Text> 
        </View>
      </TouchableOpacity>
    )
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
      BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_LIST_FRIENDS_OUT_OF_GROUP\", \"input\" : {\"user_name\": \"" + this.state.username + "\", \"group_id\":" + this.state.groupID + "}} ");
      DeviceEventEmitter.addListener('LISTENER_RES_GET_OUTSIDE_FRIEND', ({res}) => {this.processRes(res)});
    };
  
    processRes(res){
      const listIB = JSON.parse(res);
      this.setState({
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
      if (item.isAdded == 1){
        return(
           <RkButton rkType='clear'> 
           <Text style = {{color: 'blue'}} >Added</Text> 
          </RkButton>
        )
      }
      else return (
        <RkButton rkType='clear'  onPress={() => this.onAddPress(item)}> 
            <Text style = {{color: 'red'}} >Add</Text> 
        </RkButton>
      )
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
      BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_LIST_FRIENDS_OUT_OF_GROUP\", \"input\" : {\"user_name\": \"" + this.state.username + "\", \"group_id\":" + this.state.groupID + "}} ");
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
  