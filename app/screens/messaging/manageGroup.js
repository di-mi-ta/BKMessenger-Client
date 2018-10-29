import React from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert
} from 'react-native';
import {
  RkText,
  RkStyleSheet,
  RkTheme,
} from 'react-native-ui-kitten';

import { DeviceEventEmitter } from 'react-native';
import BKMessProtocolClient from '../../../NativePackage'


export class ManageGroup extends React.Component {
  static navigationOptions = {
    title: 'Group Setting',
    headerLeft: null
  };

  constructor(props){
      super(props);
      this.state = {
        groupName: this.props.navigation.getParam('groupName', undefined),
        onNavigateBack: this.props.navigation.getParam('onNavigateBack', undefined),
        username: this.props.navigation.getParam('username', undefined),
        groupID: this.props.navigation.getParam('groupID', undefined),
        idRec: this.props.navigation.getParam('idRec', undefined),
    };
  }



  render = () => (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={[styles.row, styles.heading]}>
            <Text  style = {{color: "red", fontSize: 20, fontWeight: "bold"}}> {this.state.groupName}</Text>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.rowButton} onPress = {() => this.onAddNewFriendPressed()}>
            <RkText rkType='header6'>Add new member</RkText>
          </TouchableOpacity>
        </View>
        {/* <View style={styles.row}>
          <TouchableOpacity style={styles.rowButton} onPress = {() => this.onChangeColorPressed()}>
            <RkText rkType='header6'>Change Color</RkText>
          </TouchableOpacity>
        </View> */}
        <View style={styles.row}>
          <TouchableOpacity style={styles.rowButton} onPress = {() => this.onMembersPressed()}>
            <RkText rkType='header6'>Members</RkText>
          </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.rowButton} onPress = {() => this.onLeavedGroupPressed()}>
            <Text  style = {{color: "red"}}>Leave Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )

    onAddNewFriendPressed = () => {
        this.props.navigation.navigate('AddGroup',{groupID: this.state.groupID, username: this.state.username})
    }

    onChangeColorPressed = () => {
        alert("Change color presed")
    }

    onLeavedGroupPressed = () => {

      BKMessProtocolClient.sendRequest(" {\"type\" : \"GET_OUT_GROUP\", \"input\" : {\"user_name\": \"" + this.state.username + "\", \"group_id\":" + this.state.groupID + "}} ");
      this.state.onNavigateBack();
      this.props.navigation.navigate('ChatList',{username: this.state.username})
    }

    onMembersPressed = () => {
      this.props.navigation.navigate('ViewMembers',{groupID: this.state.groupID, username: this.state.username})
    }
 }

const styles = RkStyleSheet.create(theme => ({
  container: {
    backgroundColor: theme.colors.screen.base,
  },
  header: {
    paddingVertical: 25,
  },
  section: {
    marginVertical: 25,
  },
  heading: {
    paddingBottom: 12.5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 17.5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border.base,
    alignItems: 'center',
  },
  rowButton: {
    flex: 1,
    paddingVertical: 24,
  },
  switch: {
    marginVertical: 14,
  },
}));
