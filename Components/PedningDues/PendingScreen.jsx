import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CalendarPicker from 'react-native-calendar-picker';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

// Update the data structure to match PaymentScreen
const pendingDuesData = {
  currentWeek: [
    {
      id: '1',
      date: '2025-06-05',
      customerName: 'Noah Thompson',
      customerId: '456789',
      loanId: '1122334455',
      amount: 40000,
      status: 'Pending',
      dueDate: '2025-06-05',
      agentName: 'John Smith',
      breakdown: {
        principal: 35000,
        interest: 3500,
        processingFee: 1500,
        penalty: 0,
        otherCharges: 0,
        total: 40000,
        remaining: 0
      },
      paymentMethod: null
    },
    {
      id: '2',
      date: '2025-06-08',
      customerName: 'Ava Harper',
      customerId: '123456',
      loanId: '5544332211',
      amount: 50000,
      status: 'Pending',
      dueDate: '2025-06-08',
      agentName: 'Jane Doe',
      breakdown: {
        principal: 45000,
        interest: 4500,
        processingFee: 2000,
        penalty: 0,
        otherCharges: 0,
        total: 50000,
        remaining: 0
      },
      paymentMethod: null
    }
  ],
  overdue: [
    {
      id: '3',
      date: '2024-07-15',
      customerName: 'Liam Carter',
      customerId: '987654',
      loanId: '1234567890',
      amount: 25000,
      status: 'Overdue',
      dueDate: '2024-07-15',
      agentName: 'Sarah Wilson',
      breakdown: {
        principal: 20000,
        interest: 2500,
        processingFee: 1000,
        penalty: 1500,
        otherCharges: 0,
        total: 25000,
        remaining: 25000
      },
      daysOverdue: 15,
      penaltyRate: '2%',
      paymentMethod: null
    },
    {
      id: '4',
      date: '2024-08-20',
      customerName: 'Olivia Bennett',
      customerId: '654321',
      loanId: '8976543210',
      amount: 30000,
      status: 'Overdue',
      dueDate: '2024-08-20',
      agentName: 'Michael Brown',
      breakdown: {
        principal: 25000,
        interest: 3000,
        processingFee: 1200,
        penalty: 1800,
        otherCharges: 0,
        total: 30000,
        remaining: 30000
      },
      daysOverdue: 10,
      penaltyRate: '2%',
      paymentMethod: null
    },
    {
      id: '5',
      date: '2025-05-30',
      customerName: 'Ethan Brown',
      customerId: '789123',
      loanId: '9988776655',
      amount: 60000,
      status: 'Overdue',
      dueDate: '2025-05-30',
      agentName: 'Emily White',
      breakdown: {
        principal: 50000,
        interest: 5000,
        processingFee: 2500,
        penalty: 3500,
        otherCharges: 0,
        total: 60000,
        remaining: 60000
      },
      daysOverdue: 7,
      penaltyRate: '2%',
      paymentMethod: null
    }
  ]
};

// Pending Due Item Component with Animation
const PendingDueItem = ({ item }) => {
  const navigation = useNavigation();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const offset = useSharedValue(50); // Initial position for animation

  useEffect(() => {
    offset.value = withSpring(0, { damping: 15, stiffness: 100 }); // Smooth spring animation
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
    opacity: 1 - offset.value / 50, // Fade in as it slides up
  }));

  const isOverdue = item.status === 'Overdue';

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Paymentdetails', {
        status: item.status,
        paymentData: item
      })}
    >
      <Animated.View
        style={animatedStyle}
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl mb-4 shadow-sm overflow-hidden`}
      >
        <View className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <View className="flex-row justify-between items-start">
            <View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payment Due</Text>
              <Text className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mt-1`}>
                {moment(item.dueDate).format('DD MMM YYYY')}
              </Text>
            </View>
            <View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amount</Text>
              <Text className="text-lg font-bold text-primary-100 mt-1">
                ₹{item.amount.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View className="p-4">
          <View className="flex-row items-center mb-3">
            <View className={`w-8 h-8 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} items-center justify-center`}>
              <Icon name="person" size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            </View>
            <View className="ml-3 flex-1">
              <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-900'} font-semibold`}>
                {item.customerName}
              </Text>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                ID: {item.customerId}
              </Text>
            </View>
            <View className={`px-3 py-1 rounded-full border ${isOverdue ? 'bg-red-500/10 border-red-200' : 'bg-yellow-500/10  border-yellow-200'
              }`}>
              <Text className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-yellow-600'
                }`}>
                {isOverdue ? `${item.daysOverdue} Days Overdue` : 'Due Soon'}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <Icon name="receipt" size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm ml-2`}>Loan ID:</Text>
              <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-medium ml-2`}>
                {item.loanId}
              </Text>
            </View>
            <TouchableOpacity className="flex-row items-center">
              <Text className={`mr-1 text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-primary-100'
                }`}>
                {isOverdue ? 'Pay Now' : 'View Details'}
              </Text>
              <Icon
                name="chevron-right"
                size={20}
                color={isOverdue ? '#dc2626' : '#2ec4b6'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Main Pending Dues Screen
const PendingScreen = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const [activeTab, setActiveTab] = useState('Current Week'); // Tab state: 'Current Week' or 'Overdue'
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Oldest'); // Default sort for Overdue
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [dateFilter, setDateFilter] = useState(''); // For display (e.g., "15 Jan 2024")
  const [dateFilterValue, setDateFilterValue] = useState(''); // For filtering (e.g., "2024-01-15")

  // Current date and week range (based on June 7, 2025)
  const currentDate = moment('2025-06-07');
  const startOfWeek = moment('2025-06-02'); // Monday, June 2, 2025
  const endOfWeek = moment('2025-06-08'); // Sunday, June 8, 2025

  // Filter data based on tab, search, and additional filters
  useEffect(() => {
    let filtered = activeTab === 'Current Week'
      ? [...pendingDuesData.currentWeek]
      : [...pendingDuesData.overdue];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.customerId.includes(searchQuery) || item.loanId.includes(searchQuery)
      );
    }

    // Apply date filter (for Overdue only)
    if (activeTab === 'Overdue' && dateFilterValue) {
      filtered = filtered.filter((item) => item.dueDate === dateFilterValue);
    }

    // Apply sort (for Overdue only)
    if (activeTab === 'Overdue') {
      if (sortOption === 'Oldest') {
        filtered.sort((a, b) => moment(a.dueDate).diff(moment(b.dueDate)));
      } else if (sortOption === 'Newest') {
        filtered.sort((a, b) => moment(b.dueDate).diff(moment(a.dueDate)));
      }
    }

    setFilteredData(filtered);
  }, [activeTab, searchQuery, sortOption, dateFilterValue]);

  // Add animation values
  const sortDropdownHeight = useSharedValue(0);
  const sortDropdownOpacity = useSharedValue(0);

  // Add animated style
  const sortDropdownStyle = useAnimatedStyle(() => ({
    height: sortDropdownHeight.value,
    opacity: sortDropdownOpacity.value,
    transform: [
      {
        scale: interpolate(
          sortDropdownOpacity.value,
          [0, 1],
          [0.95, 1]
        )
      }
    ]
  }));

  // Add close animation function
  const closeDropdownWithAnimation = () => {
    sortDropdownHeight.value = withSpring(0, {
      damping: 15,
      stiffness: 100
    });
    sortDropdownOpacity.value = withSpring(0, {
      damping: 15,
      stiffness: 100
    }, (finished) => {
      if (finished) {
        runOnJS(setShowSortDropdown)(false);
      }
    });
  };

  // Update toggle function
  const toggleSortDropdown = () => {
    const isOpen = showSortDropdown;

    if (!isOpen) {
      setShowSortDropdown(true);
      sortDropdownHeight.value = withSpring(100, {
        damping: 15,
        stiffness: 100
      });
      sortDropdownOpacity.value = withSpring(1, {
        damping: 15,
        stiffness: 100
      });
    } else {
      closeDropdownWithAnimation();
    }
  };

  // Handle sort for Overdue
  const handleSort = (option) => {
    setSortOption(option);
    closeDropdownWithAnimation();
  };

  // Handle date selection for Overdue
  const handleDateSelect = (date) => {
    if (date) {
      const formattedDate = moment(date).format('YYYY-MM-DD'); // For filtering
      const displayDate = moment(date).format('DD MMM YYYY'); // For display
      setDateFilter(displayDate); // Update display date
      setDateFilterValue(formattedDate); // Update filter value
    }
    setShowCalendarModal(false);
  };

  // Clear date filter for Overdue
  const clearDateFilter = () => {
    setDateFilter('');
    setDateFilterValue('');
    setShowCalendarModal(false);
  };

  // Custom Previous and Next components for CalendarPicker
  const CustomPrevious = () => (
    <View className="px-4">
      <Text className="text-primary-100 text-base">Previous</Text>
    </View>
  );

  const CustomNext = () => (
    <View className="px-4">
      <Text className="text-primary-100 text-base">Next</Text>
    </View>
  );

  // Add backdrop press handler
  const handleBackdropPress = () => {
    closeDropdownWithAnimation();
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Update backdrop with press handler */}
      {showSortDropdown && (
        <Pressable
          className={`absolute inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/20'} z-20`}
          onPress={handleBackdropPress}
        />
      )}

      {/* Header */}
      <View className="bg-primary-100 pt-10 pb-20 px-4 rounded-b-[32px]">
        <Text className="text-2xl font-bold text-white mb-2">Pending Dues</Text>
        <Text className="text-white/70">Manage your upcoming and overdue payments</Text>
      </View>

      {/* Tabs and Filters */}
      <View className="p-4 flex-1 -mt-20">
        {/* Tabs */}
        <View className={`${isDarkMode ? 'bg-gray-800/20' : 'bg-white/20'} backdrop-blur-sm p-1 rounded-xl mb-7`}>
          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={() => {
                setActiveTab('Current Week');
                setDateFilter(''); // Reset date filter when switching tabs
                setDateFilterValue('');
              }}
              className={`flex-1 p-3 rounded-lg mr-0.5 ${activeTab === 'Current Week' ? 'bg-white' : 'bg-transparent'
                }`}
            >
              <Text
                className={`text-center font-semibold ${activeTab === 'Current Week' ? 'text-primary-100' : 'text-white'
                  }`}
              >
                Current Week Dues
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setActiveTab('Overdue');
                setDateFilter(''); // Reset date filter when switching tabs
                setDateFilterValue('');
              }}
              className={`flex-1 p-3 rounded-lg ml-2 ${activeTab === 'Overdue' ? 'bg-white' : 'bg-transparent'
                }`}
            >
              <Text
                className={`text-center font-semibold ${activeTab === 'Overdue' ? 'text-primary-100' : 'text-white'
                  }`}
              >
                Overdue Dues
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View className={`${isDarkMode ? 'bg-gray-800/40' : 'bg-white/70'} backdrop-blur-sm px-3 py-1 rounded-lg flex-row items-center mb-4`}>
          <Icon name="search" size={20} color={isDarkMode ? '#9ca3af' : '#999'} className="mr-2" />
          <TextInput
            placeholder="Search by Customer ID or Loan ID"
            placeholderTextColor={isDarkMode ? '#6b7280' : '#6b7280'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className={`flex-1 text-base ${isDarkMode ? 'text-gray-100' : 'text-gray-700'}`}
          />
        </View>

        {/* Additional Filters for Overdue */}
        {activeTab === 'Overdue' && (
          <View className="flex-row justify-between mb-4">
            {/* Date Filter */}
            <View className="w-[48%]">
              <TouchableOpacity
                onPress={() => setShowCalendarModal(true)}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded-lg flex-row justify-between items-center`}
              >
                <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`} numberOfLines={1}>
                  {dateFilter || 'Filter by Date'}
                </Text>
                <Icon name="calendar-today" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
              </TouchableOpacity>
            </View>

            {/* Sort Dropdown */}
            <View className="w-[48%] z-30">
              <TouchableOpacity
                onPress={toggleSortDropdown}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded-lg flex-row justify-between items-center`}
              >
                <View className="flex-row items-center">
                  <Icon name="sort" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                  <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium ml-3`}>{sortOption}</Text>
                </View>
                <Icon
                  name={showSortDropdown ? "expand-less" : "expand-more"}
                  size={20}
                  color={isDarkMode ? '#9ca3af' : '#4b5563'}
                />
              </TouchableOpacity>

              <Animated.View
                style={[
                  sortDropdownStyle,
                  {
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    right: 0,
                    zIndex: 40,
                  }
                ]}
                className={`${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                } rounded-xl shadow-xl overflow-hidden`}
              >
                {['Oldest', 'Newest'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => handleSort(option)}
                    className={`px-4 py-3.5 border-b ${
                      isDarkMode ? 'border-gray-700' : 'border-gray-100'
                    } ${
                      sortOption === option ?
                        (isDarkMode ? 'bg-primary-100/20' : 'bg-primary-100/10')
                        : ''
                    }`}
                  >
                    <Text className={`font-medium ${
                      sortOption === option ? 'text-primary-100' :
                        (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                    }`}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            </View>
          </View>
        )}

        {/* Calendar Modal */}
        <Modal
          visible={showCalendarModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setShowCalendarModal(false);
            closeDropdownWithAnimation();
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            className={`flex-1 ${isDarkMode ? 'bg-black/60' : 'bg-black/50'} justify-center items-center`}
            onPress={() => {
              setShowCalendarModal(false);
              closeDropdownWithAnimation();
            }}
          >
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg w-11/12`}>
              <CalendarPicker
                onDateChange={handleDateSelect}
                selectedDayColor="#2ec4b6"
                selectedDayTextColor="#ffffff"
                todayBackgroundColor={isDarkMode ? '#374151' : '#f2f2f2'}
                todayTextStyle={{ color: '#2ec4b6' }}
                textStyle={{ color: isDarkMode ? '#f3f4f6' : '#333' }}
                previousComponent={<CustomPrevious isDarkMode={isDarkMode} />}
                nextComponent={<CustomNext isDarkMode={isDarkMode} />}
                initialDate={dateFilter ? moment(dateFilter, 'DD MMM YYYY').toDate() : new Date()}
              />
              <TouchableOpacity
                className="mt-4 p-3 bg-primary-100 rounded-lg items-center"
                onPress={clearDateFilter}
              >
                <Text className="text-white font-medium">Clear Filter</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Pending Dues List */}
        <ScrollView showsVerticalScrollIndicator={false} className="">
          <Text className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-2`}>
            Payment Details
          </Text>
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <PendingDueItem item={item} />}
            ListEmptyComponent={
              <View className="py-8 items-center">
                <Icon
                  name={activeTab === 'Overdue' ? 'warning' : 'hourglass-empty'}
                  size={40}
                  color={isDarkMode ? '#6b7280' : '#9ca3af'}
                />
                <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                  No {activeTab.toLowerCase()} payments found
                </Text>
              </View>
            }
            nestedScrollEnabled={true}
            scrollEnabled={false}
          />
        </ScrollView>
      </View>
    </View>
  );
};

export default PendingScreen;