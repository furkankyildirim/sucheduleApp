import React from 'react';
import { LogBox, View, Text, TouchableOpacity, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNCalendarEvents from "react-native-calendar-events";
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
import axios from 'axios';
import NetInfo from '@react-native-community/netinfo';
import Toast from 'react-native-tiny-toast'

LogBox.ignoreAllLogs(true);
const Stack = createNativeStackNavigator();

const clearAll = () => {
  const keys = Object.keys(SelectedCourses);
  for (i = 0; i < keys.length; i++) {
    delete SelectedCourses[keys[i]];

  }

  AsyncStorage.setItem('@session', JSON.stringify(SelectedCourses));

  for (i = 1; i < Durations.length; i++) {
    for (j = 0; j < Durations[i].hour.length; j++) {
      Durations[i].hour[j].data.title = '';
      Durations[i].hour[j].data.code = '';
      Durations[i].hour[j].data.crn = '';
      Durations[i].hour[j].data.color = Colors.transparent;
    }
  }
  Toast.show("Deleted All Courses");
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
  Toast.show("Copied to Clipboard");
}

const saveCalendar = async () => {
  await RNCalendarEvents.requestPermissions();
  const calendars = await RNCalendarEvents.findCalendars();
  const idx = calendars.map(calendar => calendar.title).indexOf('SUchedule');

  if (idx > -1) {
    await RNCalendarEvents.removeCalendar(calendars[idx].id);
  }

  const calendarId = await RNCalendarEvents.saveCalendar({
    title: 'SUchedule',
    name: 'SUchedule',
    color: Colors.blue1,
    entityType: 'event',
    accessLevel: 'root',
    source: {
      isLocalAccount: true,
      name: 'SUchedule'
    },
    ownerAccount: 'SUchedule'
  });

  const isConnected = (await NetInfo.fetch()).isConnected;
  let firstDay, lastDay;

  if (isConnected) {
    const appInfo = (await axios.get('https://suchedule.herokuapp.com/version')).data;
    lastDay = new Date(appInfo['end-date']);
    firstDay = new Date(appInfo['start-date']);

    await AsyncStorage.setItem('@start-date', firstDay.toISOString());
    await AsyncStorage.setItem('@end-date', firstDay.toISOString());

  } else {
    firstDay = new Date(await AsyncStorage.getItem('@start-date'));
    lastDay = new Date(await AsyncStorage.getItem('@end-date'));
  }

  for (const code in SelectedCourses) {
    SelectedCourses[code].sections
      .map(section => section.schedule.map(sch => {

        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() + sch.day);
        startDate.setHours(8 + sch.start);
        startDate.setMinutes(40);

        const endDate = new Date(startDate)
        endDate.setHours(8 + sch.start + sch.duration);
        endDate.setMinutes(30);

        RNCalendarEvents.saveEvent(section.lessonName, {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          calendarId: calendarId,
          recurrenceRule: {
            frequency: 'weekly',
            endDate: lastDay.toISOString()
          },
          location: sch.location,
        }, { sync: true })
      }));
  }
  Toast.show("Saved to Calendar!");
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
      <HeaderButton button="calendar" operation={() => saveCalendar()} />
    </View>
  );
}

const App = () => {
  return (
    <NavigationContainer>      
      <StatusBar backgroundColor={'transparent'} translucent={true} barStyle="light-content" />
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
            headerTitleAlign: 'center',
            headerTitleStyle: fontStyles.courseDetailTitle
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
};

export default App;
