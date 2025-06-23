import React, { useEffect } from 'react';
import { Dimensions, View } from "react-native";
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useSelector } from "react-redux";

const { width: screenWidth } = Dimensions.get('window');
// Skeleton Components
const SkeletonBox = ({ width = '100%', height = 16, style = {} }) => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const animation = useSharedValue(0);

  useEffect(() => {
    animation.value = withRepeat(
      withTiming(1, {
        duration: 1500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          animation.value,
          [0, 1],
          [-screenWidth, screenWidth]
        ),
      },
    ],
  }));

  return (
    <View
      style={[
        {
          width,
          height,
          overflow: 'hidden',
          borderRadius: 8,
          backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            left: 0,
            width: '60%',
            height: '100%',
            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.4)',
            borderRadius: 8,
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
};

export default SkeletonBox;