import React, { useEffect } from 'react';
import { View, Text, Animated, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onHide,
  position = 'top'
}) => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const translateY = new Animated.Value(position === 'top' ? -100 : 100);
  const opacity = new Animated.Value(0);
  const scale = new Animated.Value(0.8);

  const getToastStyle = () => {
    const types = {
      success: {
        bg: isDarkMode ? 'bg-teal-900/90' : 'bg-teal-100',
        icon: 'checkmark-circle',
        iconColor: isDarkMode ? '#2dd4bf' : '#14b8a6',
        borderColor: isDarkMode ? '#14b8a640' : '#14b8a620'
      },
      error: {
        bg: isDarkMode ? 'bg-red-900/90' : 'bg-red-100',
        icon: 'alert-circle',
        iconColor: isDarkMode ? '#f87171' : '#dc2626',
        borderColor: isDarkMode ? '#ef444440' : '#ef444420'
      },
      warning: {
        bg: isDarkMode ? 'bg-yellow-900/90' : 'bg-yellow-100',
        icon: 'warning',
        iconColor: isDarkMode ? '#facc15' : '#ca8a04',
        borderColor: isDarkMode ? '#eab30840' : '#eab30820'
      },
      info: {
        bg: isDarkMode ? 'bg-teal-900/90' : 'bg-teal-100',
        icon: 'information-circle',
        iconColor: isDarkMode ? '#3b82f6' : '#2563eb', // Blue shades
          borderColor: isDarkMode ? '#3b82f640' : '#2563eb20', // Blue with opacity
      }
    };
    return types[type];
  };

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: position === 'top' ? -100 : 100,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 0.8,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        })
      ]).start(() => onHide());
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const toastStyle = getToastStyle();

  return (
    <Animated.View
      style={[
        styles.container(position),
        {
          transform: [{ translateY }, { scale }],
          opacity,
        }
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onHide}
        className={`${toastStyle.bg} rounded-2xl shadow-lg border w-full`}
        style={{ borderColor: toastStyle.borderColor }}
      >
        <View className="flex-row items-center p-4 w-full">
          <View className={`${
            isDarkMode ? 'bg-black/10' : 'bg-white/50'
          } p-2 rounded-full`}>
            <Icon 
              name={toastStyle.icon} 
              size={20} 
              color={toastStyle.iconColor}
            />
          </View>
          <Text 
            className={`flex-1 text-sm font-medium mx-3 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}
            numberOfLines={3}
          >
            {message}
          </Text>
          <TouchableOpacity 
            onPress={onHide}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            className={`${
              isDarkMode ? 'bg-black/10' : 'bg-white/50'
            } p-1.5 rounded-full`}
          >
            <Icon 
              name="close" 
              size={16} 
              color={toastStyle.iconColor}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: (position) => ({
    position: 'absolute',
    left: 16,
    right: 16,
    [position]: 30,
    zIndex: 9999,
    width: '100%',
    maxWidth: width - 32,
  }),
  message: {
    flexShrink: 1,
    flexWrap: 'wrap',
    lineHeight: 18,
  }
});

export default Toast;