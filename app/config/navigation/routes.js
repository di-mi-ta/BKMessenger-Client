import _ from 'lodash';
import { FontIcons } from '../../assets/icons';
import * as Screens from '../../screens/index';

export const MainRoutes = [
  {
    id: 'LoginMenu',
    title: 'Auth',
    icon: FontIcons.login,
    screen: Screens.LoginMenu,
    children: [
      {
        id: 'Login1',
        title: 'Login V1',
        screen: Screens.LoginV1,
        children: [],
      },
      {
        id: 'SignUp',
        title: 'Sign Up',
        screen: Screens.SignUp,
        children: [],
      },
      {
        id: 'password',
        title: 'Password Recovery',
        screen: Screens.PasswordRecovery,
        children: [],
      },
    ],
  },
  {
    id: 'SocialMenu',
    title: 'Social',
    icon: FontIcons.profile,
    screen: Screens.SocialMenu,
    children: [
      {
        id: 'ProfileV1',
        title: 'User Profile V1',
        screen: Screens.ProfileV1,
        children: [],
      },
      {
        id: 'ProfileSettings',
        title: 'Profile Settings',
        screen: Screens.ProfileSettings,
        children: [],
      },
    ],
  },
  {
    id: 'MessagingMenu',
    title: 'Messaging',
    icon: FontIcons.mail,
    screen: Screens.MessagingMenu,
    children: [
      {
        id: 'Chat',
        title: 'Chat',
        screen: Screens.Chat,
        children: [],
      },
      {
        id: 'ChatList',
        title: 'Chat List',
        screen: Screens.ChatList,
        children: [],
      },
      {
        id: 'VideoCall',
        title: 'Video Call',
        screen: Screens.VideoCall,
        children: [],
      },
      {
        id: 'AddGroup',
        title: 'AddGroup',
        screen: Screens.AddGroup,
        children: [],
      },
      {
        id: 'Friends',
        title: 'Friends',
        screen: Screens.Friends,
        children: [],
      },
      {
        id: 'CreateGroup',
        title: 'Group',
        screen: Screens.CreateGroup,
        children: [],
      },
    ],
  },
];

export const SideMenuRoutes = [
  {
    id: 'LoginV1',
    title: 'Log out',
    screen: Screens.LoginV1,
    children: [],
  },
];


const menuRoutes = _.cloneDeep(MainRoutes);
menuRoutes.unshift({
  id: 'Login1',
  title: 'Start',
  screen: Screens.GridV1,
  children: [],
});

export const MenuRoutes = menuRoutes;
