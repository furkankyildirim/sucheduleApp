import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Animated, StyleSheet, TextInput, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import Colors from '../utils/Colors';
import Constants from '../utils/Constants';
import Durations from '../utils/Durations';
import fontStyles from '../utils/FontStyles';

const Drawer = ({ data, navigation, visibility }) => {

  const isDarkMode = useColorScheme() === 'dark';
  const [searchType, setSearchType] = useState("course");
  const [searchText, setSearchText] = useState('');


  const heights = [
    useRef(new Animated.Value(24)).current,
    useRef(new Animated.Value(24)).current,
    useRef(new Animated.Value(24)).current,
    useRef(new Animated.Value(24)).current,
    useRef(new Animated.Value(24)).current
  ]

  const activeDays = [];

  for (i = 0; i < 6; i++) {
    const [active, setActive] = useState(true);
    activeDays.push([active, setActive]);
  }

  const filterData = () => {

    let filteredData = [];

    for (i = 0; i < data.courses.length; i++) {
      const course = { classes: [], code: data.courses[i].code, name: data.courses[i].name };
      for (j = 0; j < data.courses[i].classes.length; j++) {
        const cls = { sections: [], type: data.courses[i].classes[j].type }
        for (k = 0; k < data.courses[i].classes[j].sections.length; k++) {
          const section = {
            crn: data.courses[i].classes[j].sections[k].crn,
            group: data.courses[i].classes[j].sections[k].group,
            instructors: data.courses[i].classes[j].sections[k].instructors,
            schedule: []
          }
          for (l = 0; l < data.courses[i].classes[j].sections[k].schedule.length; l++) {
            if (activeDays[data.courses[i].classes[j].sections[k].schedule[l].day][0]) {
              const schedule = {
                day: data.courses[i].classes[j].sections[k].schedule[l].day,
                duration: data.courses[i].classes[j].sections[k].schedule[l].duration,
                place: data.courses[i].classes[j].sections[k].schedule[l].place,
                start: data.courses[i].classes[j].sections[k].schedule[l].start
              }
              section.schedule.push(schedule);
            }
          }
          section.schedule.length == data.courses[i].classes[j].sections[k].schedule.length
            ? cls.sections.push(section) : null;
        }
        cls.sections.length > 0 ? course.classes.push(cls) : null;
      }
      course.classes.length > 0 ? filteredData.push(course) : null;
    }

    if (searchText != '') {
      if (searchType == 'course') {
        filteredData = filteredData.filter(course =>
          course.code.indexOf(searchText) > -1 || course.name.indexOf(searchText) > -1
          || course.code.indexOf(searchText.toLowerCase()) > -1
          || course.name.indexOf(searchText.toLowerCase()) > -1
          || course.code.indexOf(searchText.toUpperCase()) > -1
          || course.name.indexOf(searchText.toUpperCase()) > -1
        );
      }

      else if (searchType == 'instructor') {
        let instructorFilter = [];
        for (i = 0; i < filteredData.length; i++) {
          const course = { classes: [], code: filteredData[i].code, name: filteredData[i].name };
          for (j = 0; j < filteredData[i].classes.length; j++) {
            const cls = { sections: [], type: filteredData[i].classes[j].type }
            for (k = 0; k < filteredData[i].classes[j].sections.length; k++) {
              const section = {
                crn: filteredData[i].classes[j].sections[k].crn,
                group: filteredData[i].classes[j].sections[k].group,
                instructors: filteredData[i].classes[j].sections[k].instructors,
                schedule: filteredData[i].classes[j].sections[k].schedule
              }
              const id = filteredData[i].classes[j].sections[k].instructors;
              if (
                data.instructors[id].indexOf(searchText) > -1
                || data.instructors[id].indexOf(searchText.toUpperCase()) > -1
                || data.instructors[id].indexOf(searchText.toLowerCase()) > -1
              ) {
                cls.sections.push(section);
              }
            }
            cls.sections.length > 0 ? course.classes.push(cls) : null;
          }
          course.classes.length > 0 ? instructorFilter.push(course) : null;
        }
        filteredData = instructorFilter;
      }
    }

    return filteredData;
  }

  const useOpen = [];

  for (index = 0; index < data.courses.length; index++) {
    const [isOpened, Open] = useState(false)
    useOpen.push([isOpened, Open]);
  }


  const openCourse = index => {
    if (!useOpen[index][0]) {
      for (let i = 0; i < data.courses.length; i++) {
        useOpen[i][1](false);
      }
      useOpen[index][1](true);

    } else useOpen[index][1](false);
  }


  const CourseClass = ({ item, index }) => {
    return (
      <View>
        <Text>Sections {item.type != "" ? "(" + item.type + ")" : null}</Text>
        <FlatList
          style={{ marginTop: 5, marginBottom: 10 }}
          scrollEnabled={false}
          renderItem={CourseSection}
          data={item.sections}
          key={item => item.type}
        />
      </View>
    );
  }


  const CourseSection = ({ item, index }) => {
    const CourseSectionStyle = StyleSheet.compose({
      backgroundColor: Colors.white,
      padding: 5, marginVertical: 2,
      flexDirection: 'row',
    });

    const InfoButtonStyle = StyleSheet.compose({
      backgroundColor: Colors.blue1,
      borderColor: Colors.blue1,
      borderWidth: 0.75,
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
      alignSelf: 'flex-start'
    });

    const GroupStyle = StyleSheet.compose({
      backgroundColor: Colors.white,
      paddingHorizontal: 2.5,
      paddingVertical: 0.5,
    })

    const InfoStyle = StyleSheet.compose({
      paddingLeft: 4,
      paddingVertical: 0.5,
      alignItems: 'center',
    })

    return (
      <TouchableOpacity style={CourseSectionStyle}>
        <View style={{ width: '75%' }}>
          <TouchableOpacity style={InfoButtonStyle}
            onPress={() => navigation.push('CourseDetail', { url: data.infoLink + item.crn })}>
            <View style={GroupStyle}>
              <Text style={fontStyles.groupTitle}>{item.group}</Text>
            </View>
            <View style={InfoStyle}>
              <Text style={fontStyles.infoTitle}>info</Text>
            </View>
            <Icon name='external-link-square' style={fontStyles.linkIcon} />
          </TouchableOpacity>

          <View style={{ paddingVertical: 5 }}>
            <Text style={fontStyles.instructorTitle}>{data.instructors[item.instructors]}</Text>
          </View>

          <FlatList
            scrollEnabled={false}
            renderItem={CourseSchedule}
            data={item.schedule}
            key={item => item.key}
          />
        </View>

        <View style={{ width: '75%', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
          <View style={{ width: 30, height: 30, borderWidth: 0.75, }} />
        </View>
      </TouchableOpacity>
    );
  }


  const CourseSchedule = ({ item, index }) => {
    const day = item.day < 5 ? Durations[item.day + 1].key : 'TBA';
    const start = item.start > -1 ?
      (8 + item.start).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) + ':40' : 'TBA';
    const end = item.duration > -1 ?
      '-' + (item.start + item.duration + 8).toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false }) + ':30'
      : null;
    const place = data.places[item.place]

    return (
      <View>
        <Text style={fontStyles.scheduleTitle}>{day} {start}{end} {place}</Text>
      </View>
    );
  }


  const CourseContainer = ({ item, index }) => {
    const CourseContainerStyle = StyleSheet.compose({
      backgroundColor: Colors.grey4,
      marginVertical: 5,
      paddingHorizontal: 10,
      marginRight: 10,
      flex: 1,
    });

    const CourseHeaderStyle = StyleSheet.compose({
      height: 35,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    })

    return (
      <View style={CourseContainerStyle}>
        <TouchableOpacity style={CourseHeaderStyle} onPress={() => openCourse(index)}>
          <Text numberOfLines={1} style={fontStyles.courseTitle}>{item.code} - {item.name}</Text>
          <Icon name={useOpen[index][0] ? 'angle-down' : 'angle-right'} style={fontStyles.courseIcon} />
        </TouchableOpacity>

        {useOpen[index][0]
          ? <FlatList
            style={{ marginTop: 20 }}
            scrollEnabled={false}
            renderItem={CourseClass}
            data={item.classes}
            key={item => item.type}
          />
          : null
        }
      </View>
    )
  }


  const DayContainer = ({ text, index }) => {
    setHeight = (dayIndex) => {
      heights[dayIndex].__getValue() === 24

        ? Animated.timing(heights[dayIndex], {
          toValue: 2,
          duration: 500,
          useNativeDriver: false,
        }).start()

        : Animated.timing(heights[dayIndex], {
          toValue: 24,
          duration: 500,
          useNativeDriver: false,
        }).start()
    }

    const DayStyle = StyleSheet.compose({
      backgroundColor: Colors.transparent,
      marginHorizontal: 3.25,
      justifyContent: 'flex-end',
      width: 35,
      height: 24,
    })

    const AnimatedStyle = StyleSheet.compose({
      width: 35,
      zIndex: -1,
      height: heights[index],
      backgroundColor: Colors.blue6,
    })

    setDays = (dayIndex) => {
      setHeight(dayIndex);
      activeDays[dayIndex][1](!activeDays[dayIndex][0]);
    }

    return (
      <TouchableOpacity style={DayStyle} onPress={() => setDays(index)}>
        <Text style={fontStyles.tinyTitle}>{text}</Text>
        <Animated.View style={AnimatedStyle} />
      </TouchableOpacity>
    )
  }


  const DrawerStyle = StyleSheet.compose({
    display: visibility ? 'flex' : 'none',
    backgroundColor: Colors.blue4,
    width: Constants.DRAWER_WIDTH,
    padding: 10,
  })

  const SearchStyle = StyleSheet.compose({
    backgroundColor: Colors.white,
    width: Constants.SEARCH_WIDTH,
    height: 35,
    paddingHorizontal: 5,
    borderRadius: 3,
  })

  const PickerStyle = StyleSheet.compose({
    backgroundColor: Colors.blue2,
    alignItems: 'center',
    justifyContent: 'center',
    height: 35,
    width: Constants.PICKER_WIDTH,
    borderRadius: 3,
  })

  return (
    <View style={DrawerStyle}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TextInput
          style={SearchStyle}
          placeholder='Search For...'
          placeholderTextColor={Colors.black2}
          onChangeText={text => {
            for (let i = 0; i < data.courses.length; i++) {
              useOpen[i][1](false);
            }
            setSearchText(text)
          }}
        />
        <RNPickerSelect
          value={searchType}
          onValueChange={value => {
            for (let i = 0; i < data.courses.length; i++) {
              useOpen[i][1](false);
            };
            setSearchType(value)
          }}
          style={{
            inputAndroidContainer: fontStyles.picker,
            inputIOS: fontStyles.picker,
            inputAndroid: PickerStyle,
            inputIOSContainer: PickerStyle
          }}
          placeholder={{}}
          items={[
            { label: 'Course Name', value: 'course' },
            { label: 'Instructor', value: 'instructor' },
          ]}
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 15, alignItems: 'center' }}>
        <Icon name='calendar' style={fontStyles.headerIcons} />
        <Text style={{ ...fontStyles.smallTitle }}>Day</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <DayContainer text='MON' index={0} />
          <DayContainer text='TUE' index={1} />
          <DayContainer text='WED' index={2} />
          <DayContainer text='THU' index={3} />
          <DayContainer text='FRI' index={4} />
        </View>
      </View>

      <FlatList
        renderItem={CourseContainer}
        data={filterData()}
        key={item => item.name}
      />

    </View>
  );
}

export default Drawer;