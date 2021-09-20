import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import axios from 'axios';
import Icon from 'react-native-vector-icons/dist/Entypo';
import Drawer from './Drawer'
import fontStyles from '../utils/FontStyles';
import Constants from '../utils/Constants';
import { Observer, observer } from 'mobx-react';
import Colors from '../utils/Colors';
import Durations from '../utils/Durations'
import SelectedCourses from '../utils/SelectedCourses';
import SelectedColors from '../utils/SelectedColors';
import { action } from 'mobx';

const Home = observer(({ navigation }) => {

  const [layoutWidth, setLayoutWidth] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [drawerVisibility, setDrawerVisibility] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => NetInfo.fetch().then(async state => {
    if (state.isConnected) {
      const response = await axios.get('http://46.235.14.53:5000/suchedule/data');

      if (await AsyncStorage.getItem('@version') !== response.data.version.toString()) {
        await AsyncStorage.clear();
        await AsyncStorage.setItem('@version', response.data.version.toString());
      }

      AsyncStorage.setItem('@data', JSON.stringify(response.data));
    }

    setData(JSON.parse(await AsyncStorage.getItem('@data')));

    const sessionValue = await AsyncStorage.getItem('@session');
    const Session = sessionValue != null ? JSON.parse(sessionValue) : {};


    for (const code in Session) {
      SelectedCourses[code] = Session[code];
      if (SelectedCourses[code].types.length === SelectedCourses[code].typeLenght) {
        Durations.map(day => day.hour.map(hour => {
          if (hour.data.code === code) {
            const color = hour.data.color;
            const colorIndex = SelectedColors.indexOf(color);
            SelectedColors.slice(colorIndex, 1);

            hour.data.title = '';
            hour.data.code = '';
            hour.data.crn = '';
            hour.data.color = '';
          }
        }))

        let color = Colors.colorPalette[Math.floor(Math.random() * Colors.colorPalette.length)];
        while (SelectedColors.includes(color)) {
          color = Colors.colorPalette[Math.floor(Math.random() * Colors.colorPalette.length)];
        }

        SelectedCourses[code].sections.map(section => {
          const lessonName = section.lessonName;
          const crn = section.crn;

          section.schedule.map(sch => {
            for (i = 0; i < sch.duration; i++) {

              Durations[sch.day + 1].hour[sch.start + i].data.title = lessonName;
              Durations[sch.day + 1].hour[sch.start + i].data.crn = crn;
              Durations[sch.day + 1].hour[sch.start + i].data.code = code;
              Durations[sch.day + 1].hour[sch.start + i].data.color = color;
            }
          })
        });
      }
    }
  }), []);


  const deleteSchedule = async item => {
    const crn = item.crn;

    for (const code in SelectedCourses) {
      const idx = SelectedCourses[code].sections.map(sec => sec.crn).indexOf(crn);
      if (idx > -1) {
        SelectedCourses[code].sections.map(sec => sec.schedule.map(sch => {
          for (i = 0; i < sch.duration; i++) {
            const color = Durations[sch.day + 1].hour[sch.start + i].data.color;
            const colorIndex = SelectedColors.indexOf(color);
            SelectedColors.slice(colorIndex, 1);

            Durations[sch.day + 1].hour[sch.start + i].data.title = '';
            Durations[sch.day + 1].hour[sch.start + i].data.crn = '';
            Durations[sch.day + 1].hour[sch.start + i].data.code = '';
            Durations[sch.day + 1].hour[sch.start + i].data.color = '';
          }
        }));

        SelectedCourses[code].types.splice(idx, 1);
        SelectedCourses[code].sections.splice(idx, 1);
        await AsyncStorage.setItem('@session', JSON.stringify(SelectedCourses));
        return;
      }
    }
  }

  const setLayout = (event) => {
    setLayoutWidth(event.nativeEvent.layout.width);
    setLayoutHeight(event.nativeEvent.layout.height);
  }

  const GridRow = ({ item, index }) => {
    const bgColor = item.dayId % 2 === 0
      ? (index % 2 === 0 ? Colors.grey2 : Colors.grey4)
      : (index % 2 === 0 ? Colors.grey1 : Colors.grey3)

    const width = item.dayId === 0
      ? layoutWidth * 0.16
      : layoutWidth * 0.36

    const GridRowStyle = StyleSheet.compose({
      backgroundColor: bgColor,
      width: width,
      height: layoutHeight * 0.96 / 11,
      alignItems: 'center',
      justifyContent: 'center'
    })

    const SelectedCourseStyle = StyleSheet.compose({
      padding: 5,
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: Durations[item.dayId].hour[index].data.color
    });

    return (
      <Observer>
        {() => <View style={GridRowStyle}>
          {item.dayId === 0
            ?
            <Text style={fontStyles.smallText}>{item.data.title}</Text>
            :
            Durations[item.dayId].hour[index].data.title !== '' &&
            <TouchableOpacity style={{ ...SelectedCourseStyle, backgroundColor: Durations[item.dayId].hour[index].data.color }}>
              <Text style={fontStyles.selectedCourse}>{item.data.title}</Text>
              <TouchableOpacity onPress={action(() => deleteSchedule(Durations[item.dayId].hour[index].data))}>
                <Icon name='cross' style={fontStyles.cancelIcon} />
              </TouchableOpacity>
            </TouchableOpacity>
          }
        </View>}
      </Observer>
    )
  }

  const GridColumn = ({ item, index }) => {
    const width = index === 0
      ? layoutWidth * 0.16
      : layoutWidth * 0.36

    const bgColor = index % 2 === 0 ? Colors.blue2 : Colors.blue3

    const GridColumnStyle = StyleSheet.compose({
      width: width,
      height: layoutHeight,
    })

    const TitleStyle = StyleSheet.compose({
      height: layoutHeight * 0.04,
      backgroundColor: bgColor,
      width: width,
      alignItems: 'center',
      justifyContent: 'center',
    })

    return (
      <View style={GridColumnStyle}>
        <View style={TitleStyle}>
          <Text style={fontStyles.smallTitle}>{item.key}</Text>
        </View>
        <FlatList
          renderItem={GridRow}
          data={item.hour}
          listKey={item => `${index}*${item.id}`}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      </View>
    )
  }

  const DrawerButtonStyle = StyleSheet.compose({
    position: 'absolute',
    width: Constants.DRAWER_BUTTON_SIZE,
    height: Constants.DRAWER_BUTTON_SIZE,
    top: 0,
    left: drawerVisibility ? Constants.DRAWER_WIDTH : 0,
    backgroundColor: Colors.black1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  });

  return (
    data
      ? <View style={{ flex: 1, flexDirection: 'row' }} onLayout={(event) => setLayout(event)}>
        <TouchableOpacity style={DrawerButtonStyle} onPress={() => setDrawerVisibility(!drawerVisibility)}>
          <Icon name='menu' style={fontStyles.largeIcons} />
        </TouchableOpacity>
        <Drawer data={data} navigation={navigation} visibility={drawerVisibility} />
        <ScrollView horizontal={true}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}>
          <FlatList
            renderItem={GridColumn}
            data={Durations}
            keyExtractor={item => item.id}
            numColumns={Durations.length}
            scrollEnabled={false}
          />
        </ScrollView>
      </View>

      : <ActivityIndicator
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        size="large" color={Colors.blue1}
      />
  );
});

export default Home;