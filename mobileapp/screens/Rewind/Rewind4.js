// screens/rewind/Rewind4.js
import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  SafeAreaView,
  Dimensions,
  Text,
} from 'react-native';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Rewind4({ minutes }) {

    const [displayMinutes, setDisplayMinutes] = useState(minutes || 0);

  // 1) Animate MinutesListened SVG: start at scale 0 → 1 and opacity 0 → 1
  const headerScale   = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;

  // 2) Animate BigNumber SVG: start at scale 0 → 1 and opacity 0 → 1
  const numberScale   = useRef(new Animated.Value(0)).current;
  const numberOpacity = useRef(new Animated.Value(0)).current;

  // 3) Animate FooterCopy SVG: opacity 0 → 1
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence:  
    // A) pop+fade header over 600ms  
    // B) pop+fade big number over 600ms  
    // C) fade in footer over 400ms
    Animated.sequence([
      Animated.parallel([
        Animated.spring(headerScale, {
          toValue: 1,
          bounciness: 12,
          speed: 12,
          useNativeDriver: false, // false for combining scale+opacity
        }),
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
      ]),

      Animated.parallel([
        Animated.spring(numberScale, {
          toValue: 1,
          bounciness: 20,
          speed: 12,
          useNativeDriver: false,
        }),
        Animated.timing(numberOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
      ]),

      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* 1) “My Minutes Listened” (pop + fade) */}
        <Animated.View
          style={{
            transform: [{ scale: headerScale }],
            opacity: headerOpacity,
            marginBottom: 20,
          }}
        >
          <Text style={styles.headerText}>
            My Minutes Listened
          </Text>
        </Animated.View>

        {/* 2) “63,901” number (pop + fade) */}
        <Animated.View
          style={{
            transform: [{ scale: numberScale }],
            opacity: numberOpacity,
            marginBottom: 20,
          }}
        >
          <Text style={styles.bigNumberText}>
            {displayMinutes.toLocaleString()}
          </Text>
        </Animated.View>

        {/* 3) Footer copy (fade in) */}
        <Animated.View style={{ opacity: footerOpacity }}>
          <Text style={styles.footerText}>
            That’s more than 65% of other listeners in New York City
          </Text>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FF5D', // your yellow background
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',           // choose a color you like
    textAlign: 'center',
  },
  bigNumberText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#000',
    textAlign: 'center',
  },
});

