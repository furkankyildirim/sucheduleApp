import React from 'react';
import { LogBox, View, Text, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Clipboard from '@react-native-clipboard/clipboard';
import { NavigationContainer } from '@react-navigation/native';
import { observer } from 'mobx-react';
import Colors from './utils/Colors';
import fontStyles from './utils/FontStyles';
import Icon from 'react-native-vector-icons/dist/Entypo';
import Home from './screens/Home';
import CourseDetail from './screens/CourseDetail';
import Durations from './utils/Durations';
import SelectedCourses from './utils/SelectedCourses';
import { action } from 'mobx';

LogBox.ignoreAllLogs(true);
const Stack = createNativeStackNavigator();

const clearAll = () => {
  const keys = Object.keys(SelectedCourses);
  for (i = 0; i < keys.length; i++) {
    delete SelectedCourses[keys[i]];

  }

  for (i = 1; i < Durations.length; i++) {
    for (j = 0; j < Durations[i].hour.length; j++) {
      Durations[i].hour[j].data.title = '';
      Durations[i].hour[j].data.code = '';
      Durations[i].hour[j].data.crn = '';
      Durations[i].hour[j].data.color = Colors.transparent;
    }
  }
}

const copyCourses = () => {
  let copiedText = '';
  for (const code in SelectedCourses) {
    SelectedCourses[code].sections.map(section => {

      const lessonName = section.lessonName;
      const crn = section.crn;
      copiedText = copiedText + lessonName + ': ' + crn + '\n';
    })
  }
  Clipboard.setString(copiedText);
}

const HeaderLeft = () => {
  return (
    <View>
      <Text style={fontStyles.largeTitle}>SUchedule</Text>
    </View>
  )
}

const HeaderButton = observer(({ button, operation }) => {
  return (
    <TouchableOpacity onPress={operation}>
      <Icon name={button} style={{
        ...fontStyles.headerIcons,
        marginHorizontal: 7.5
      }} />
    </TouchableOpacity>
  )
})

const HeaderRight = () => {
  return (
    <View style={{ flexDirection: 'row' }}>
      <HeaderButton button="trash" operation={action(() => clearAll())} />
      <HeaderButton button="clipboard" operation={() => copyCourses()} />
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
            gestureEnabled: true,
            headerStyle: { backgroundColor: Colors.blue1 },
            headerTintColor: Colors.white,
            headerTitleStyle: fontStyles.courseDetailTitle
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
};

export default App;
