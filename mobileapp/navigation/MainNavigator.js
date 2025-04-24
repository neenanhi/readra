import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Bookshelf from '../screens/Bookshelf';
import Home from '../screens/Home';
import SignUpScreen from '../screens/SignUpScreen';
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { Image } from 'react-native';

const Tab = createBottomTabNavigator();

function Placeholder({ label }) {
  return <Text style={{ paddingTop: 100, textAlign: 'center' }}>{label} screen coming soon</Text>;
}

export default function MainNavigator() {
  return (
    <GestureHandlerRootView styles={styles.container}>
        <Tab.Navigator 
          initialRouteName="Login"
          screenOptions={{
            tabBarStyle: {
              backgroundColor: '#2E3A59',
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              height: 60,
              display: 'flex',
              justifyContent: 'center',
            },
            tabBarShowLabel: false,
          }}
        > 
          <Tab.Screen 
            name="Login" 
            component={SignUpScreen} 
            options={{
              tabBarIcon: ({ size }) => (
                <Image 
                  source={require('../assets/library_icon.svg')} 
                  style={{ width: 30, height: 30 }}
                />  
              ),
            }}    
          />
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen name="Bookshelf" component={Bookshelf} />
          <Tab.Screen name="Analytics" children={() => <Placeholder label="Analytics" />} />
          <Tab.Screen name="Rewind" children={() => <Placeholder label="Rewind" />} />
        </Tab.Navigator>
    </GestureHandlerRootView>
  );
}
// style={{flex: 1}}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e3a59',
  },
  // container: {
  //   flex: 1,
  //   backgroundColor: '#fdfaf6',
  //   paddingHorizontal: 16,
  //   paddingVertical: 24,
  // },
  // quoteBox: {
  //   marginBottom: 32,
  //   padding: 24,
  //   borderRadius: 24,
  //   backgroundColor: '#e9e6f0',
  //   shadowColor: '#000',
  //   shadowOpacity: 0.1,
  //   shadowRadius: 4,
  //   elevation: 2,
  // },
  // quoteText: {
  //   fontSize: 18,
  //   fontStyle: 'italic',
  //   color: '#2e2e42',
  //   textAlign: 'center',
  // },
  // quoteEmphasis: {
  //   fontWeight: 'bold',
  // },
  // quoteAuthor: {
  //   marginTop: 8,
  //   fontSize: 14,
  //   color: '#7a7a90',
  //   textAlign: 'center',
  // },
  // headerRow: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   marginBottom: 16,
  // },
  // sectionTitle: {
  //   fontSize: 18,
  //   color: '#2e2e42',
  //   fontFamily: 'serif',
  // },
  // arrow: {
  //   fontSize: 20,
  //   color: '#2e2e42',
  // },
  // scrollRow: {
  //   marginBottom: 32,
  // },
  // bookCard: {
  //   width: 160,
  //   marginRight: 16,
  // },
  // bookCover: {
  //   height: 192,
  //   width: '100%',
  //   borderRadius: 12,
  //   marginBottom: 8,
  //   backgroundColor: '#d2d3e0',
  // },
  // bookTitle: {
  //   fontSize: 14,
  //   fontWeight: 'bold',
  //   fontFamily: 'serif',
  //   color: '#2e2e42',
  // },
  // bookAuthor: {
  //   fontStyle: 'italic',
  //   fontSize: 12,
  //   color: '#55556d',
  //   marginBottom: 4,
  // },
  // bookDescription: {
  //   fontSize: 12,
  //   color: '#6e6e84',
  // },
  // rating: {
  //   marginTop: 4,
  //   fontSize: 14,
  // },
  // analysisCard: {
  //   padding: 24,
  //   borderRadius: 24,
  //   backgroundColor: '#e6e9f2',
  //   shadowColor: '#000',
  //   shadowOpacity: 0.1,
  //   shadowRadius: 4,
  //   elevation: 2,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  // },
  // analysisCover: {
  //   height: 80,
  //   width: 56,
  //   backgroundColor: '#a5a7c7',
  //   borderRadius: 8,
  //   marginRight: 16,
  // },
  // analysisText: {
  //   fontSize: 18,
  //   fontFamily: 'serif',
  //   color: '#2e2e42',
  // },
});