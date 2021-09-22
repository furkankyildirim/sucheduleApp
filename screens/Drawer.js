import React, { useState, useRef } from 'react';
import { View, Text, Animated, StyleSheet, TextInput, FlatList, TouchableOpacity, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNPickerSelect from 'react-native-picker-select';
import { observer, Observer } from 'mobx-react';
import Icon from 'react-native-vector-icons/dist/FontAwesome';
import Colors from '../utils/Colors';
import Constants from '../utils/Constants';
import Durations from '../utils/Durations';
import fontStyles from '../utils/FontStyles';
import SelectedCourses from '../utils/SelectedCourses';
import SelectedColors from '../utils/SelectedColors';
import PressedCourses from '../utils/PressedCourses';
import { action } from 'mobx';
import Toast from 'react-native-tiny-toast'

const Drawer = observer(({ data, navigation, visibility }) => {

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

  const setSelectedCourse = async course => {

    let durationController = false;
    const code = course.code
    const type = course.sections[0].type;

    for (i = 0; i < course.sections.length; i++) {
      for (j = 0; j < course.sections[i].schedule.length; j++) {
        const sch = course.sections[i].schedule[j];
        for (k = 0; k < sch.duration; k++) {
          if (Durations[sch.day + 1].hour[sch.start + k].data.crn != '' &&
            Durations[sch.day + 1].hour[sch.start + k].data.code != course.code) {
            Toast.show(`Time Conflict\n${Durations[sch.day + 1].hour[sch.start + k].data.title}`,
              {
                minWidth: 105,
                minHeight: 105,
                backgroundColor: 'rgba(30,30,30,.85)',

                imgStyle: {
                  width: 45,
                  height: 45
                },
                textStyle: {
                  marginTop: 10
                },
                position: Toast.position.CENTER,
                imgSource: require('../assets/icons/icon_fail.png'),
              });
            return;
          }
        }
      }
    }

    if (code in SelectedCourses) {
      if (SelectedCourses[code].types.includes(type)) {
        const idx = SelectedCourses[code].types.indexOf(type);
        SelectedCourses[code].sections[idx] = course.sections[0];
        durationController = true;
      } else {
        SelectedCourses[code].types.push(type);
        SelectedCourses[code].sections.push(course.sections[0]);
        durationController = true;
      }
    } else {
      course.types.push(type);
      SelectedCourses[code] = course
      durationController = true;
    }

    if (SelectedCourses[code].types.length === SelectedCourses[code].typeLenght && durationController) {
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
    await AsyncStorage.setItem('@session', JSON.stringify(SelectedCourses));
  }

  const setSchedule = item => {
    for (crs = 0; crs < data.courses.length; crs++) {
      const code = data.courses[crs].code.replace(/\s/g, '');
      const clsLenght = data.courses[crs].classes.length;
      for (cls = 0; cls < clsLenght; cls++) {
        const type = data.courses[crs].classes[cls].type;
        for (sec = 0; sec < data.courses[crs].classes[cls].sections.length; sec++) {
          const crn = data.courses[crs].classes[cls].sections[sec].crn;
          const group = data.courses[crs].classes[cls].sections[sec].group;
          if (crn === item.crn) {
            const lessonName = code + type + ' - ' + group;
            const schedule = data.courses[crs].classes[cls].sections[sec].schedule;

            for (i = 0; i < schedule.length; i++) {
              schedule[i]['location'] = data.places[schedule[i].place]
            }

            const selectedCourse = {
              sections: [{
                type: type,
                crn: crn,
                schedule: schedule,
                lessonName: lessonName,
              }],
              code: code,
              typeLenght: clsLenght,
              types: []
            }
            setSelectedCourse(selectedCourse);
            return;
          }
        }
      }
    }
  }

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

  const filterData = () => {
    let filteredData = [];
    const tempData = PressedCourses.isPressed ? PressedCourses.data : data.courses;

    for (i = 0; i < tempData.length; i++) {
      const course = { classes: [], code: tempData[i].code, name: tempData[i].name };
      for (j = 0; j < tempData[i].classes.length; j++) {
        const cls = { sections: [], type: tempData[i].classes[j].type }
        for (k = 0; k < tempData[i].classes[j].sections.length; k++) {
          const section = {
            crn: tempData[i].classes[j].sections[k].crn,
            group: tempData[i].classes[j].sections[k].group,
            instructors: tempData[i].classes[j].sections[k].instructors,
            schedule: []
          }
          for (l = 0; l < tempData[i].classes[j].sections[k].schedule.length; l++) {
            if (activeDays[tempData[i].classes[j].sections[k].schedule[l].day][0]) {
              const schedule = {
                day: tempData[i].classes[j].sections[k].schedule[l].day,
                duration: tempData[i].classes[j].sections[k].schedule[l].duration,
                place: tempData[i].classes[j].sections[k].schedule[l].place,
                start: tempData[i].classes[j].sections[k].schedule[l].start
              }
              section.schedule.push(schedule);
            }
          }
          section.schedule.length == tempData[i].classes[j].sections[k].schedule.length
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

  const setPressedCourse = code => {
    const idx = PressedCourses.data.map(crs => crs.code).indexOf(code);
    PressedCourses.data.slice(idx, 1);
    PressedCourses.isPressed = false;

    for (let i = 0; i < useOpen.length; i++) {
      useOpen[i][1](false);
    }
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

  const isActive = crn => {
    for (const code in SelectedCourses) {
      if (SelectedCourses[code].sections.map(item => item.crn).indexOf(crn) > -1) {
        return true;
      }
    }

    return false;
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
      <Observer>
        {() => <TouchableOpacity style={CourseSectionStyle} onPress={action(() => !isActive(item.crn) ? setSchedule(item) : deleteSchedule(item))}>
          <View style={{ flex: 3 }}>
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

          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 30, height: 30, borderWidth: 0.75, alignItems: 'center', justifyContent: 'center' }}>
              {isActive(item.crn) && <Icon name='check' style={fontStyles.checkIcon} />}
            </View>
          </View>
        </TouchableOpacity>}
      </Observer>
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

    const CloseButtonStyle = StyleSheet.compose({
      justifyContent: 'center',
      position: 'absolute',
      width: 16,
      height: 16,
      right: 0,
    });

    return (
      <View style={CourseContainerStyle}>
        {!PressedCourses.isPressed
          ?
          <TouchableOpacity style={CourseHeaderStyle} onPress={() => openCourse(index)}>
            <Text numberOfLines={1} style={fontStyles.courseTitle}>{item.code} - {item.name}</Text>
            <Icon name={useOpen[index][0] ? 'angle-down' : 'angle-right'} style={fontStyles.courseIcon} />
          </TouchableOpacity>
          :
          <TouchableOpacity style={CourseHeaderStyle} onPress={action(() => openCourse(index))}>
            <Text numberOfLines={1} style={fontStyles.courseTitle}>{item.code} - {item.name}</Text>
            <TouchableOpacity style={CloseButtonStyle} onPress={action(() => setPressedCourse(item.code))}>
              <Icon name={'close'} style={{ ...fontStyles.courseIcon, fontSize: 16 }} />
            </TouchableOpacity>
          </TouchableOpacity>
        }

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
            for (let i = 0; i < useOpen.length; i++) {
              useOpen[i][1](false);
            }
            setSearchText(text)
          }}
        />
        <RNPickerSelect
          value={searchType}
          useNativeAndroidPickerStyle={false}
          onValueChange={value => {
            for (let i = 0; i < useOpen.length; i++) {
              useOpen[i][1](false);
            };
            setSearchType(value)
          }}
          style={{
            inputAndroid: fontStyles.picker,
            inputIOS: fontStyles.picker,
            inputAndroidContainer: PickerStyle,
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
})

export default Drawer;