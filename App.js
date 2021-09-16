import React from 'react';
import { LogBox, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Colors from './utils/Colors';
import fontStyles from './utils/FontStyles';
import Icon from 'react-native-vector-icons/dist/Entypo';
import Home from './screens/Home';
import CourseDetail from './screens/CourseDetail';

LogBox.ignoreAllLogs(true);
const Stack = createNativeStackNavigator();

const HeaderLeft = () => {
  return (
    <View>
      <Text style={fontStyles.largeTitle}>SUchedule</Text>
    </View>
  )
}

const HeaderButton = ({ button, operation }) => {
  return (
    <TouchableOpacity onPress={operation}>
      <Icon name={button} style={{
        ...fontStyles.headerIcons,
        marginHorizontal: 7.5
      }} />
    </TouchableOpacity>
  )
}

const HeaderRight = () => {
  return (
    <View style={{ flexDirection: 'row' }}>
      <HeaderButton button="trash" operation={() => { }} />
      <HeaderButton button="clipboard" operation={() => { }} />
      <HeaderButton button="calendar" operation={() => { }} />
    </View>
  );
}

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home}
          options={{
            title: null,
            headerStyle: { backgroundColor: Colors.blue1, },
            headerLeft: () => <HeaderLeft />,
            headerRight: () => <HeaderRight />,
          }}
        />
        <Stack.Screen name="CourseDetail" component={CourseDetail}
          options={{
            title: 'SUchedule',
            headerStyle: { backgroundColor: Colors.blue1},
            headerTintColor: Colors.white,
            headerTitleStyle: fontStyles.courseDetailTitle
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
};

export default App;
