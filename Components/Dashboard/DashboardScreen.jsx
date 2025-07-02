import React, { useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Alert, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import Overviewcustomer from './Overviewcustomer';
import LoanPerformance from './LoanPerformance';
import LoanGraph from './LoanGraph';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const DashboardScreen = () => {
  const scrollY = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const navigation = useNavigation();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  // Remove or comment out the BackHandler logic to allow default back button behavior

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        BackHandler.exitApp(); // Exit the app
        return true; // Prevent default navigation
      });

      return () => backHandler.remove(); // Cleanup when screen loses focus
    }, [])
  );


  // Dashboard data structure
  const dashboardData = {
    customerMetrics: {
      totalCustomers: 1250,
      activeCustomers: 850,
      inactiveCustomers: 400,
      newThisMonth: 45,
      activeLoans: 450,
    },
    loanMetrics: {
      todayCollection: '₹5,00,000',
      weeklyDues: {
        total: '₹12,00,000',
        totalCount: 180,
        paid: '₹8,00,000',
        paidCount: 120,
        pending: '₹4,00,000',
        pendingCount: 60
      },
      overdue: {
        count: 125,
        amount: '₹15,00,000'
      }
    }
  };

  const quickActions = [
    {
      label: 'New Loan',
      icon: 'add-circle',
      color: '#14b8a6',
      route: 'addloan'
    },
    {
      label: 'New Customer',
      icon: 'person-add',
      color: '#3b82f6',
      route: 'addcustomer'
    }
  ];

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 100],
      [1, 1],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      height: 200,
      transform: [{ scale: 1 }],
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [
        {
          translateY: interpolate(
            headerOpacity.value,
            [0, 1],
            [30, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
    };
  });

  const handleScroll = (event) => {
    scrollY.value = event.nativeEvent.contentOffset.y;
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <StatusBar backgroundColor="#1a9c94" barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <LinearGradient
        colors={['#1a9c94', '#14b8a6']}
        className="px-6 pt-8 pb-10 rounded-b-3xl"
        style={{ 
          borderRadius: 20,
         }}
      >
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-white text-2xl font-bold">
              Annam Finance
            </Text>
            <Text className="text-teal-100 text-base">
              Agent Dashboard
            </Text>
          </View>

          <TouchableOpacity className="bg-white/20 p-3 rounded-xl" onPress={() => navigation.navigate('notifications')}>
            <Icon name="notifications-outline" size={22} color="white" />
            <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
              <Text className="text-white text-xs font-bold">3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Today's Highlights */}
        <View className="flex-row justify-between">
          <View className="bg-white/10 px-4 py-3 rounded-xl flex-1 mr-3">
            <Text className="text-teal-100 text-sm">Today's Collection</Text>
            <Text className="text-white text-lg font-bold mt-1">
              {dashboardData.loanMetrics.todayCollection}
            </Text>
          </View>
          <View className="bg-white/10 px-4 py-3 rounded-xl flex-1">
            <Text className="text-teal-100 text-sm">Active Loans</Text>
            <Text className="text-white text-lg font-bold mt-1">
              {dashboardData.customerMetrics.activeLoans}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <Animated.ScrollView
        style={contentAnimatedStyle}
        className="flex-1 px-4 -mt-10"
        contentContainerStyle={{ paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Dues Overview */}
        <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-5 shadow-sm mb-6`}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} text-lg font-semibold`}>
              Weekly Dues Status
            </Text>
            <View className={`${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-50'} px-3 py-1 rounded-lg`}>
              <Text className="text-teal-500 text-sm font-medium">This Week</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View className="mb-6">
            <View className="flex-row justify-between mb-2">
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                Collection Progress
              </Text>
              <Text className="text-teal-500 text-sm font-medium">
                {Math.round((dashboardData.loanMetrics.weeklyDues.paidCount /
                  dashboardData.loanMetrics.weeklyDues.totalCount) * 100)}%
              </Text>
            </View>
            <View className={`h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden`}>
              <View
                className="h-full bg-teal-500 rounded-full"
                style={{
                  width: `${(dashboardData.loanMetrics.weeklyDues.paidCount /
                    dashboardData.loanMetrics.weeklyDues.totalCount) * 100}%`
                }}
              />
            </View>
          </View>

          {/* Stats Items */}
          <View className="flex-col gap-y-3 -mx-2">
            {[{
              label: 'Total Due',
              amount: dashboardData.loanMetrics.weeklyDues.total,
              count: dashboardData.loanMetrics.weeklyDues.totalCount,
              icon: 'wallet-outline',
              bgColor: isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50',
              textColor: isDarkMode ? 'text-gray-100' : 'text-gray-900',
              iconColor: isDarkMode ? '#9ca3af' : '#1f2937'
            },
            {
              label: 'Collected',
              amount: dashboardData.loanMetrics.weeklyDues.paid,
              count: dashboardData.loanMetrics.weeklyDues.paidCount,
              icon: 'checkmark-circle-outline',
              bgColor: isDarkMode ? 'bg-teal-900/30' : 'bg-teal-50',
              textColor: isDarkMode ? 'text-teal-400' : 'text-teal-700',
              iconColor: '#059669'
            },
            {
              label: 'Pending',
              amount: dashboardData.loanMetrics.weeklyDues.pending,
              count: dashboardData.loanMetrics.weeklyDues.pendingCount,
              icon: 'time-outline',
              bgColor: isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50',
              textColor: isDarkMode ? 'text-yellow-400' : 'text-yellow-700',
              iconColor: isDarkMode ? '#fbbf24' : '#d97706'
            }
            ].map((item, index) => (
              <View key={index} className="w-full px-2">
                <View className=' flex-row items-center gap-3'>
                  <View className={`${item.bgColor} w-2/6 flex-col items-center p-4 rounded-2xl`}>
                    <View className={` rounded-full ${item.bgColor} items-center justify-center`}>
                      <Icon name={item.icon} size={25} color={item.iconColor} />
                    </View>
                    <Text className={`${item.textColor} text-sm font-medium`}>
                      {item.label}
                    </Text>
                  </View>
                  <View className={`${item.bgColor} flex-col items-center p-4 rounded-2xl flex-1`}>
                    <Text className={`${item.textColor} text-lg font-bold mb-1`}>
                      {item.amount}
                    </Text>
                    <Text className={`${item.textColor} text-xs opacity-75`}>
                      {item.count} accounts
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Customer Overview */}
        <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-5 shadow-sm mb-6`}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} text-lg font-semibold`}>
              Customer Overview
            </Text>
            <TouchableOpacity className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} px-3 py-1 rounded-lg`}>
              <Text className="text-teal-500 text-sm font-medium">View Details</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap">
            {[{
              label: 'Total Customers',
              value: dashboardData.customerMetrics.totalCustomers,
              icon: 'people',
              color: isDarkMode ? '#2dd4bf' : '#1a9c94'
            },
            {
              label: 'Active',
              value: dashboardData.customerMetrics.activeCustomers,
              icon: 'person',
              color: isDarkMode ? '#34d399' : '#059669'
            },
            {
              label: 'Inactive',
              value: dashboardData.customerMetrics.inactiveCustomers,
              icon: 'person-outline',
              color: isDarkMode ? '#f87171' : '#dc2626'
            },
            {
              label: 'New This Month',
              value: dashboardData.customerMetrics.newThisMonth,
              icon: 'person-add',
              color: isDarkMode ? '#60a5fa' : '#2563eb'
            }].map((item, index) => (
              <View
                key={index}
                className="w-1/2 p-2"
                style={{
                  borderRightWidth: index % 2 === 0 ? 1 : 0,
                  borderBottomWidth: index < 2 ? 1 : 0,
                  borderColor: isDarkMode ? '#374151' : '#f1f5f9'
                }}
              >
                <View className="p-3">
                  <View className="flex-row gap-3 items-center mb-2">
                    <View
                      className="w-10 h-10 rounded-full items-center justify-center"
                      style={{ backgroundColor: `${item.color}15` }}
                    >
                      <Icon name={item.icon} size={20} color={item.color} />
                    </View>
                    <Text className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                      {item.value}
                    </Text>
                  </View>
                  <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                    {item.label}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Onboarding Status */}
        <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-5 shadow-sm mb-6`}>
          <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} text-lg font-semibold mb-4`}>
            Onboarding Status
          </Text>

          <View className="flex flex-col gap-4">
            {[{
              label: 'Documents Pending',
              count: 12,
              total: 15,
              color: isDarkMode ? '#fbbf24' : '#f59e0b',
              bgColor: isDarkMode ? 'bg-amber-900/30' : 'bg-amber-50',
              borderColor: isDarkMode ? 'border-amber-900/20' : 'border-amber-100'
            },
            {
              label: 'Verification Pending',
              count: 8,
              total: 10,
              color: isDarkMode ? '#60a5fa' : '#3b82f6',
              bgColor: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50',
              borderColor: isDarkMode ? 'border-blue-900/20' : 'border-blue-100'
            },
            {
              label: 'Ready for Disbursement',
              count: 5,
              total: 5,
              color: isDarkMode ? '#34d399' : '#10b981',
              bgColor: isDarkMode ? 'bg-emerald-900/30' : 'bg-emerald-50',
              borderColor: isDarkMode ? 'border-emerald-900/20' : 'border-emerald-100'
            }].map((item, index) => (
              <View key={index} className={`border rounded-xl p-4 ${item.bgColor} ${item.borderColor}`}>
                <View className="flex-row justify-between items-center mb-2">
                  <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-700'} font-medium`}>
                    {item.label}
                  </Text>
                  <Text className="text-sm font-medium" style={{ color: item.color }}>
                    {item.count}/{item.total}
                  </Text>
                </View>
                <View className={`h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-full overflow-hidden`}>
                  <View
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: item.color,
                      width: `${(item.count / item.total) * 100}%`
                    }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Collection Summary */}
        <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-5 shadow-sm mb-6`}>
          <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} text-lg font-semibold mb-4`}>
            Collection Summary
          </Text>

          <View className={`flex-row justify-between ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4 mb-4`}>
            <View>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                Total Collection
              </Text>
              <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-xl font-bold mt-1`}>
                {dashboardData.loanMetrics.weeklyDues.total}
              </Text>
            </View>
            <View className={`border-l ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} pl-4`}>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                Collection Rate
              </Text>
              <Text className="text-teal-500 text-xl font-bold mt-1">
                {Math.round((parseInt(dashboardData.loanMetrics.weeklyDues.paid.replace(/[^0-9]/g, '')) /
                  parseInt(dashboardData.loanMetrics.weeklyDues.total.replace(/[^0-9]/g, ''))) * 100)}%
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            <View className={`${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'} p-4 flex-row items-center gap-4 rounded-xl flex-1`}>
              <Icon name="alert-circle-outline" size={24} color={isDarkMode ? '#f87171' : '#dc2626'} />
              <View>
                <Text className={`${isDarkMode ? 'text-red-400' : 'text-red-600'} text-sm`}>Overdue</Text>
                <Text className={`${isDarkMode ? 'text-red-300' : 'text-red-900'} text-lg font-bold mt-1`}>
                  {dashboardData.loanMetrics.overdue.amount}
                </Text>
              </View>
              <View className={`ml-auto border-s ${isDarkMode ? 'border-s-red-700' : 'border-s-red-400'} px-6`}>
                <Text className={`${isDarkMode ? 'text-red-400' : 'text-red-600'} text-sm`}>Accounts</Text>
                <Text className={`${isDarkMode ? 'text-red-400' : 'text-red-600'} text-lg font-bold mt-1`}>
                  {dashboardData.loanMetrics.overdue.count}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default DashboardScreen;