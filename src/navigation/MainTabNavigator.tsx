import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {VideoFeedScreen} from '../screens/main/VideoFeedScreen';
import {ProgressScreen} from '../screens/main/ProgressScreen';
import {ProfileScreen} from '../screens/main/ProfileScreen';

export type MainTabParamList = {
  VideoFeed: undefined;
  Progress: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName: string;

          switch (route.name) {
            case 'VideoFeed':
              iconName = 'play-circle-filled';
              break;
            case 'Progress':
              iconName = 'trending-up';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen
        name="VideoFeed"
        component={VideoFeedScreen}
        options={{tabBarLabel: 'Learn'}}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{tabBarLabel: 'Progress'}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
};