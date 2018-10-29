import React from 'react';
import { View } from 'react-native';
import {
  createDrawerNavigator,
  createStackNavigator,
  createBottomTabNavigator
} from 'react-navigation';
import { withRkTheme } from 'react-native-ui-kitten';
import { AppRoutes } from './config/navigation/routesBuilder';
import * as Screens from './screens';
import { bootstrap } from './config/bootstrap';
import BKMessProtocolClient from '../NativePackage'
import { data } from './data';
console.disableYellowBox = true;

bootstrap();
data.populateData();


const KittenApp = createStackNavigator({
  // First: {
  //   screen: Screens.SplashScreen,
  // },
  Home: {
    screen: createDrawerNavigator(
      {
        ...AppRoutes,
      },
      {
        contentComponent: (props) => {
          const SideMenu = withRkTheme(Screens.SideMenu);
          return <SideMenu {...props} />;
        },
      },
    ),
  },
}, {
  headerMode: 'none',
});


export default class App extends React.Component {
  constructor(props){
    super(props);
    BKMessProtocolClient.connectToServer("192.168.100.14", 2018,(msg) => {}, (err) => {});
    BKMessProtocolClient.listenMess();
  }
  state = {
    isLoaded: false,
  };

  componentWillMount() {
    bootstrap();
  }

  onNavigationStateChange = (previous, current) => {
    const screen = {
      current: this.getCurrentRouteName(current),
      previous: this.getCurrentRouteName(previous),
    };
  };

  getCurrentRouteName = (navigation) => {
    const route = navigation.routes[navigation.index];
    return route.routes ? this.getCurrentRouteName(route) : route.routeName;
  };

  loadAssets = async () => {
    await {
      fontawesome: require('./assets/fonts/fontawesome.ttf'),
      icomoon: require('./assets/fonts/icomoon.ttf'),
      'Righteous-Regular': require('./assets/fonts/Righteous-Regular.ttf'),
      'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf'),
      'Roboto-Medium': require('./assets/fonts/Roboto-Medium.ttf'),
      'Roboto-Regular': require('./assets/fonts/Roboto-Regular.ttf'),
      'Roboto-Light': require('./assets/fonts/Roboto-Light.ttf'),
    };
    this.setState({ isLoaded: true });
  };


  renderApp = () => (
    <View style={{ flex: 1 }}>
      <KittenApp onNavigationStateChange={this.onNavigationStateChange} />
    </View>
  );

  render = () => this.renderApp() ;
}

