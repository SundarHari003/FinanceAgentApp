import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LineChart } from 'react-native-chart-kit';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const screenWidth = Dimensions.get('window').width;

const LoanGraph = () => {
  const animationProgress = useSharedValue(0);
  const [selectedPeriod, setSelectedPeriod] = useState('Monthly');

  useEffect(() => {
    animationProgress.value = withDelay(400, withTiming(1, { duration: 1000 }));
  }, []);

  // Chart data for different periods
  const chartData = {
    Monthly: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `rgba(20, 184, 166, ${opacity})`,
        strokeWidth: 3
      }],
      title: 'Monthly Disbursement Trends'
    },
    Weekly: {
      labels: ['W1', 'W2', 'W3', 'W4'],
      datasets: [{
        data: [65, 78, 90, 81],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
        strokeWidth: 3
      }],
      title: 'Weekly Disbursement Trends'
    },
    Yearly: {
      labels: ['2021', '2022', '2023', '2024'],
      datasets: [{
        data: [300, 450, 620, 820],
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
        strokeWidth: 3
      }],
      title: 'Yearly Disbursement Trends'
    }
  };

  const periods = ['Weekly', 'Monthly', 'Yearly'];
  const currentData = chartData[selectedPeriod];

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: animationProgress.value,
      transform: [
        {
          translateY: interpolate(
            animationProgress.value,
            [0, 1],
            [30, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#f8fafc',
    decimalPlaces: 0,
    color: (opacity = 1) => currentData.datasets[0].color(opacity),
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: {
      borderRadius: 20,
    },
    propsForDots: {
      r: "7",
      strokeWidth: "3",
      stroke: currentData.datasets[0].color(1),
      fill: "#ffffff"
    },
    propsForBackgroundLines: {
      strokeDasharray: "5,5",
      stroke: "#e5e7eb",
      strokeWidth: 1
    },
    fillShadowGradient: currentData.datasets[0].color(0.1),
    fillShadowGradientOpacity: 0.3,
  };

  const StatCard = ({ icon, label, value, change, isPositive }) => (
    <View className="bg-gray-50 rounded-2xl p-4 flex-1 mx-1">
      <View className="flex-row items-center justify-between mb-2">
        <Icon name={icon} size={20} color="#6b7280" />
        <View className="flex-row items-center">
          <Icon 
            name={isPositive ? 'trending-up' : 'trending-down'} 
            size={14} 
            color={isPositive ? '#22c55e' : '#ef4444'} 
          />
          <Text 
            className="text-xs font-bold ml-1"
            style={{ color: isPositive ? '#22c55e' : '#ef4444' }}
          >
            {change}%
          </Text>
        </View>
      </View>
      <Text className="text-sm text-gray-600">{label}</Text>
      <Text className="text-xl font-bold text-gray-900">{value}</Text>
    </View>
  );

  return (
    <Animated.View style={containerAnimatedStyle} className="p-4">
      <Text className="text-lg font-bold text-gray-900 mb-4">
        {currentData.title}
      </Text>
      
      <View className="flex-row justify-between mb-4">
        {periods.map((period) => (
          <TouchableOpacity
            key={period}
            onPress={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg ${
              selectedPeriod === period ? 'bg-blue-500' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`${
                selectedPeriod === period ? 'text-white' : 'text-gray-600'
              } font-medium`}
            >
              {period}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <LineChart
        data={currentData}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />

      <View className="flex-row mt-4">
        <StatCard
          icon="cash-outline"
          label="Total Disbursed"
          value="$1.2M"
          change={12.5}
          isPositive={true}
        />
        <StatCard
          icon="trending-up-outline"
          label="Growth Rate"
          value="8.7%"
          change={3.2}
          isPositive={true}
        />
        <StatCard
          icon="people-outline"
          label="Active Loans"
          value="245"
          change={5.1}
          isPositive={false}
        />
      </View>
    </Animated.View>
  );
};

export default LoanGraph;