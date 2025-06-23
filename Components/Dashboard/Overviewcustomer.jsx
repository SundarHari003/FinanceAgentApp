import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  interpolate,
  Extrapolate,
  Easing
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const OverviewCustomer = ({ data }) => {
  const fadeIn = useSharedValue(0);

  useEffect(() => {
    fadeIn.value = withTiming(1, { 
      duration: 500,
      easing: Easing.out(Easing.ease)
    });
  }, []);

  const metrics = [
    { 
      label: 'Total Customers', 
      value: data.total, 
      icon: 'people', 
      color: '#1D4ED8',
      trend: '+12%',
      trendUp: true
    },
    { 
      label: 'Active Users', 
      value: data.active, 
      icon: 'person', 
      color: '#047857',
      trend: '+8%',
      trendUp: true
    },
    { 
      label: 'Inactive Users', 
      value: data.inactive, 
      icon: 'person-remove-outline', 
      color: '#B91C1C',
      trend: '-3%',
      trendUp: false
    },
    { 
      label: 'New Signups', 
      value: data.newThisMonth, 
      icon: 'person-add', 
      color: '#7C3AED',
      trend: '+45',
      trendUp: true
    }
  ];

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeIn.value,
      transform: [
        {
          translateY: interpolate(
            fadeIn.value,
            [0, 1],
            [10, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  const MetricCard = ({ item, index }) => {
    const cardFade = useSharedValue(0);

    useEffect(() => {
      cardFade.value = withDelay(
        index * 100,
        withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
      );
    }, []);

    const cardStyle = useAnimatedStyle(() => {
      return {
        opacity: cardFade.value,
        transform: [
          {
            translateY: interpolate(
              cardFade.value,
              [0, 1],
              [15, 0],
              Extrapolate.CLAMP
            ),
          },
        ],
      };
    });

    return (
      <Animated.View 
        style={[
          cardStyle,
          { 
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#F1F5F9',
            elevation: 1,
          }
        ]}
      >
        <View 
          className="p-3 rounded-full mr-4"
          style={{ backgroundColor: `${item.color}10` }}
        >
          <Icon name={item.icon} size={24} color={item.color} />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {item.value.toLocaleString()}
          </Text>
          <Text className="text-sm text-gray-600">{item.label}</Text>
        </View>
        <View className="flex-row items-center">
          <Icon 
            name={item.trendUp ? 'caret-up' : 'caret-down'} 
            size={16} 
            color={item.trendUp ? '#15803D' : '#B91C1C'} 
          />
          <Text 
            className="text-sm font-medium ml-1"
            style={{ color: item.trendUp ? '#15803D' : '#B91C1C' }}
          >
            {item.trend}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <Animated.View style={[containerStyle, { padding: 16, backgroundColor: '#F8FAFC' }]}>
      <View className="mb-4">
        <Text className="text-xl font-semibold text-gray-900">Customer Overview</Text>
        <Text className="text-xs text-gray-500">
          As of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>
      <View>
        {metrics.map((item, index) => (
          <MetricCard key={index} item={item} index={index} />
        ))}
      </View>
      <View className="bg-white p-4 rounded-lg border border-gray-100 mt-2">
        <Text className="text-sm text-gray-600 mb-1">Growth Trend</Text>
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-gray-900">+12.5%</Text>
          <View className="flex-row items-center">
            <Icon name="trending-up" size={20} color="#1D4ED8" />
            <Text className="text-xs text-blue-600 ml-1">Positive</Text>
          </View>
        </View>
        <View className="flex-row mt-2">
          {[3, 5, 4, 6, 5, 7, 6, 8].map((height, index) => (
            <View 
              key={index}
              style={{ 
                width: 4,
                height: height * 3,
                backgroundColor: index === 7 ? '#1D4ED8' : '#BFDBFE',
                marginRight: 2,
                borderRadius: 1
              }}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
};

export default OverviewCustomer;