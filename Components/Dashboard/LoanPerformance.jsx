import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  Easing 
} from 'react-native-reanimated';

const LoanPerformance = () => {
  const [showDetails, setShowDetails] = useState(false)

  const loanData = {
    totalAmount: 50000,
    amountPaid: 30000,
    remainingAmount: 20000,
    weeklyDue: 2500,
    weeklyPaid: 1500,
    overdue: 1000,
    weeklyPaymentCount: 12,
    totalWeeklyPayments: 30000,
    paidDues: 10,
    paidDuesAmount: 25000,
    pendingDues: 4,
    pendingDuesAmount: 10000,
    currentWeekTotalPayments: 4000,
    currentWeekPaymentCount: 2
  }

  const progressWidth = (loanData.amountPaid / loanData.totalAmount) * 100
  const progressStyle = useAnimatedStyle(() => ({
    width: withSpring(`${progressWidth}%`, {
      damping: 20,
      stiffness: 90
    })
  }))

  const detailsStyle = useAnimatedStyle(() => ({
    height: withTiming(showDetails ? 'auto' : 0, {
      duration: 300,
      easing: Easing.inOut(Easing.ease)
    }),
    opacity: withTiming(showDetails ? 1 : 0, {
      duration: 300
    }),
    overflow: 'hidden'
  }))

  const handlePaymentAction = () => {
    // Placeholder for payment action (e.g., API call to process payment)
    alert('Initiating payment for ₹' + loanData.weeklyDue)
  }

  const summaryCards = [
    {
      title: 'Total Portfolio',
      value: '₹50,000',
      subValue: '+12% vs last month',
      icon: 'chart-line',
      gradient: ['#3B82F6', '#1D4ED8']
    },
    {
      title: 'Collection Rate',
      value: '85%',
      subValue: '₹30,000 collected',
      icon: 'cash-multiple',
      gradient: ['#10B981', '#047857']
    }
  ];

  const metrics = [
    {
      label: 'Weekly Due',
      value: '₹2,500',
      status: 'pending',
      icon: 'calendar-clock',
      color: '#F59E0B'
    },
    {
      label: 'Weekly Paid',
      value: '₹1,500',
      status: 'success',
      icon: 'check-circle',
      color: '#10B981'
    },
    {
      label: 'Overdue',
      value: '₹1,000',
      status: 'danger',
      icon: 'alert-circle',
      color: '#EF4444'
    }
  ];

  return (
    <ScrollView className="flex-1">
      {/* Summary Cards */}
      {/* Header */}
        <View className="px-4 py-6 ">
            <Text className="text-lg font-semibold text-gray-800">Loan Performance Overview</Text>
        </View>
      <View className="flex-row gap-4 px-4  bg-white/90 ">
        {summaryCards.map((card, index) => (
          <LinearGradient
            key={index}
            colors={card.gradient}
            className="flex-1 p-4 rounded-2xl"
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
          >
            <View className="flex-row justify-between items-start">
              <View>
                <Text className="text-white/70 text-sm">{card.title}</Text>
                <Text className="text-white text-xl font-bold mt-1">{card.value}</Text>
                <Text className="text-white/80 text-xs mt-1">{card.subValue}</Text>
              </View>
              <View className="bg-white/20 p-2 rounded-full">
                <Icon name={card.icon} size={20} color="white" />
              </View>
            </View>
          </LinearGradient>
        ))}
      </View>

      {/* Progress Section */}
      <View className="mt-6 px-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-gray-700 font-medium">Loan Progress</Text>
          <Text className="text-blue-500 text-sm">60% Complete</Text>
        </View>
        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <Animated.View 
            className="h-full bg-blue-500 rounded-full"
            style={[{ width: '60%' }]}
          />
        </View>
      </View>

      {/* Weekly Metrics */}
      <View className="mt-6">
        <Text className="px-4 text-gray-700 font-medium mb-3">Weekly Performance</Text>
        {metrics.map((metric, index) => (
          <TouchableOpacity 
            key={index}
            className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100"
          >
            <View className="flex-row items-center">
              <View 
                className="w-10 h-10 rounded-full items-center justify-center"
                style={{ backgroundColor: `${metric.color}15` }}
              >
                <Icon name={metric.icon} size={20} color={metric.color} />
              </View>
              <View className="ml-3">
                <Text className="text-gray-600">{metric.label}</Text>
                <Text className="text-gray-900 font-semibold">{metric.value}</Text>
              </View>
            </View>
            <Icon 
              name="chevron-right" 
              size={20} 
              color="#9CA3AF"
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Actions */}
      
    </ScrollView>
  );
};

export default LoanPerformance;