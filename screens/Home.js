import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import Icon from 'react-native-vector-icons/dist/Entypo';
import axios from 'axios';
import Drawer from './Drawer'
import fontStyles from '../utils/FontStyles';
import Constants from '../utils/Constants';
import { observer } from 'mobx-react';
import Colors from '../utils/Colors';
import Durations from '../utils/Durations'
import SelectedCourses from '../utils/SelectedCourses';
import SelectedColors from '../utils/SelectedColors';

const Home = observer(({ navigation }) => {

  const [layoutWidth, setLayoutWidth] = useState(0);
  const [layoutHeight, setLayoutHeight] = useState(0);
  const [drawerVisibility, setDrawerVisibility] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => NetInfo.fetch().then(async state => {
    if (state.isConnected) {
      const response = await axios.get('http://46.235.14.53:5000/suchedule/data');
      setData(response.data);
      AsyncStorage.setItem('@data', JSON.stringify(response.data));
    } else {
      setData(JSON.parse(await AsyncStorage.getItem('@data')));
    }
  }));

  const deleteSchedule = data => {
    const crn = data.crn;
    let removedCode;

    for (const code in SelectedCourses) {
      for (i = 0; i < SelectedCourses[code].sections.length; i++) {
        if (crn === SelectedCourses[code].sections[i].crn) {
          removedCode = code;
          SelectedCourses[code].sections.splice(i, 1);
          SelectedCourses[code].types.splice(i, 1);
          break;
        }
      }
    }

    for (i = 1; i < Durations.length; i++) {
      for (j = 0; j < Durations[i].hour.length; j++) {
        if (Durations[i].hour[j].data.code === removedCode) {
          const color = Durations[i].hour[j].data.color;
          const colorIndex = SelectedColors.indexOf(color);
          SelectedColors.slice(colorIndex, 1);

          Durations[i].hour[j].data.title = '';
          Durations[i].hour[j].data.code = '';
          Durations[i].hour[j].data.crn = '';
          Durations[i].hour[j].data.color = Colors.transparent;
        }
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
      <View style={GridRowStyle}>

        {item.dayId === 0
          ?
          <Text style={fontStyles.smallText}>{item.data.title}</Text>
          :
          Durations[item.dayId].hour[index].data.title !== '' &&
          <TouchableOpacity style={SelectedCourseStyle}>
            <Text style={fontStyles.selectedCourse}>{item.data.title}</Text>
            <TouchableOpacity onPress={() => deleteSchedule(Durations[item.dayId].hour[index].data)}>
              <Icon name='cross' style={fontStyles.cancelIcon} />
            </TouchableOpacity>
          </TouchableOpacity>
        }
      </View>
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