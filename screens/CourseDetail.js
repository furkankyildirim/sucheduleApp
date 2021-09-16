import React, { Component, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

const CourseDetail = ({ route, navigation }) => {
  const { url } = route.params;
  const [visible, setVisible] = useState(true);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        style={{ flex: 1 }}
        onLoad={() => setVisible(false)}
        source={{ uri: url }} />
      {visible
        ? <ActivityIndicator
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          size="large"
        />
        : null}
    </View>

  );

}

export default CourseDetail;