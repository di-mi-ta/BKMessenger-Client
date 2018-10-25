/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button,TextInput, Image} from 'react-native';

import BKMessProtocolClient from './NativePackage'

import { DeviceEventEmitter } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

export default class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      mess: "",
      text: 'None',
      error: "",
      image64: "",
      isShow : 0
    }

  }

  processMess(){
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true,
      includeBase64 : true
    }).then(image => {
      this.setState({
        image64 : image.data,
        isShow : 1 
      })
    });
  }


  renderImage(){
    if (this.state.isShow == 1){
      alert("OK")
      return(
      <Image style={{width: 150, height: 150}} source={{uri: `data:image/png;base64,${this.state.image64}`}} />
      )
    }
  }


  render() {
    return (
        <View style = {styles.container}>
            <Text> SERVER: {this.state.mess} </Text>  
            <Text> Client:</Text>  
            <TextInput
              style={{height: 40, width :200, borderColor: 'gray', borderWidth: 1}}
              onChangeText={(text) => this.setState({text})}
              value={this.state.text}
            />
            <Button onPress ={this.processMess.bind(this)} title = "PickFile" style ={{height: 100, width : 1000}}/> 
            {this.renderImage()}
            <Text> {this.state.error} </Text>  
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
