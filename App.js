import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import AssignDutyScreen from './src/screens/AssignDutyScreen';
import OutputScreen from './src/screens/OutputScreen';
import CounterScreen from './src/screens/CounterScreen';

export default function App() {
  const [navStack, setNavStack] = useState([{ name: 'Home', params: {} }]);

  const currentScreen = navStack[navStack.length - 1];

  const navigation = {
    navigate: (name, params = {}) => {
      setNavStack((prev) => [...prev, { name, params }]);
    },
    goBack: () => {
      setNavStack((prev) => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev));
    },
    resetToHome: () => {
      setNavStack([{ name: 'Home', params: {} }]);
    },
  };

  const renderScreen = () => {
    switch (currentScreen.name) {
      case 'AssignDuty':
        return <AssignDutyScreen route={currentScreen} navigation={navigation} />;
      case 'Output':
        return <OutputScreen route={currentScreen} navigation={navigation} />;
      case 'Counter':
        return <CounterScreen route={currentScreen} navigation={navigation} />;
      case 'Home':
      default:
        return <HomeScreen route={currentScreen} navigation={navigation} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />
      <View style={styles.content}>{renderScreen()}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a73e8',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
});
