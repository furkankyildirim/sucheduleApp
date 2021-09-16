import { StyleSheet } from 'react-native';
import Colors from './Colors';

const defaultColor = Colors.white
const fontFamily = 'Roboto-Regular'

const fontStyles = StyleSheet.create({
  largeTitle:{
    fontSize: 30,
    color: defaultColor,
    fontWeight: '600',
    fontFamily: fontFamily
  },
  largeIcons:{
    fontSize: 40,
    color: defaultColor,
    opacity: 0.75,
    fontWeight: '600',
  },
  headerIcons:{
    fontSize: 24,
    color: defaultColor,
    fontWeight: '600',
  },
  smallTitle:{
    fontSize: 15,
    color: defaultColor,
    fontWeight: '500',
  },
  tinyTitle:{
    fontSize: 12,
    color: defaultColor,
    fontWeight: '400',
    position:'absolute',
    top:4.5,
    textAlign:'center',
    width: '100%',
    height: '100%'
  },
  picker:{
    fontSize: 14,
    color: defaultColor,
    fontWeight: '600',
  },
  smallText:{
    fontSize: 16,
    fontWeight: '500',
  },
  courseIcon:{
    fontSize: 24,
    right:0,
    position:'absolute'
  },
  courseTitle:{
    fontSize: 14.5,
    fontWeight: '400',
    paddingRight: 20,
  },
  linkIcon:{
    color: Colors.white,
    paddingHorizontal: 2,
    paddingVertical: 0.5
  },
  groupTitle:{
    fontSize:14,
    fontWeight:'600'
  },
  infoTitle:{
    fontSize: 12,
    color: defaultColor,
    fontWeight: '500',
  },
  instructorTitle:{
    fontSize:14,
    fontWeight:'500',
  },
  scheduleTitle:{
    color: Colors.grey5,
    fontSize:14,
    fontWeight:'500'
  },
  courseDetailTitle:{
    fontSize: 18,
    color: defaultColor,
    fontWeight: '600',
    fontFamily: fontFamily
  }
})

export default fontStyles