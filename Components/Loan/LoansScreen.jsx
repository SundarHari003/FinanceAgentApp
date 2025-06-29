import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
  withTiming
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { gellloandataapi } from '../../redux/Slices/loanSlice';
import LoanItem from './LoanItem';
import SkeletonBox from '../Common/SkeletonBox';
import { useToast } from '../../Context/ToastContext';

// Main Loans Screen
const LoanSkeletonItem = ({ isDarkMode }) => {
  return (
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl mb-4 shadow-sm overflow-hidden`}>
      {/* Header Skeleton */}
      <View className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <SkeletonBox width={60} height={12} />
            <SkeletonBox width={80} height={16} style={{ marginTop: 8 }} />
          </View>
          <View className="items-end">
            <SkeletonBox width={80} height={12} />
            <SkeletonBox width={100} height={18} style={{ marginTop: 8 }} />
          </View>
        </View>

        {/* Progress Bar Skeleton */}
        <View className="mb-3">
          <View className="flex-row justify-between items-center mb-2">
            <SkeletonBox width={80} height={10} />
            <SkeletonBox width={30} height={10} />
          </View>
          <SkeletonBox width="100%" height={8} />
        </View>
      </View>

      {/* Customer Info Skeleton */}
      <View className="p-4">
        <View className="flex-row items-center mb-3">
          <SkeletonBox width={40} height={40} style={{ borderRadius: 20 }} />
          <View className="ml-3 flex-1">
            <SkeletonBox width={120} height={16} />
            <SkeletonBox width={150} height={12} style={{ marginTop: 8 }} />
          </View>
          <SkeletonBox width={60} height={24} style={{ borderRadius: 12 }} />
        </View>

        {/* Details Grid Skeleton */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-1">
            <SkeletonBox width={70} height={10} />
            <SkeletonBox width={40} height={14} style={{ marginTop: 4 }} />
          </View>
          <View className="flex-1">
            <SkeletonBox width={70} height={10} />
            <SkeletonBox width={60} height={14} style={{ marginTop: 4 }} />
          </View>
          <View className="flex-1">
            <SkeletonBox width={70} height={10} />
            <SkeletonBox width={50} height={14} style={{ marginTop: 4 }} />
          </View>
        </View>

        {/* Bottom Row Skeleton */}
        <View className={`flex-row justify-between items-center ${isDarkMode?"bg-gray-700":"bg-gray-50"} p-4 rounded-lg`}>
          <View className="flex-row items-center">
            <SkeletonBox width={16} height={16} style={{ borderRadius: 8 }} />
            <SkeletonBox width={100} height={12} style={{ marginLeft: 8 }} />
          </View>
          <View className="flex-row items-center">
            <SkeletonBox width={80} height={12} />
            <SkeletonBox width={20} height={20} style={{ marginLeft: 4, borderRadius: 10 }} />
          </View>
        </View>
      </View>
    </View>
  );
};


const ErrorComponent = ({ isDarkMode, onRetry }) => {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <View className={`${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} w-20 h-20 rounded-full items-center justify-center mb-4`}>
        <Icon name="error-outline" size={32} color="#dc2626" />
      </View>
      <Text className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
        Something went wrong
      </Text>
      <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center px-8 mb-4`}>
        We encountered an error while loading your loans. Please try again
      </Text>
      <TouchableOpacity
        onPress={onRetry}
        className="bg-primary-100 px-6 py-3 rounded-xl"
      >
        <Text className="text-white font-medium">Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

const LoansScreen = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { Allloanhistory, isLoadingLoan, loanerror, hasMore, totalLoans } = useSelector((state) => state.loanstore);
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [frequencyFilter, setFrequencyFilter] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const { showToast } = useToast();
  // Animation values
  const statusDropdownHeight = useSharedValue(0);
  const statusDropdownOpacity = useSharedValue(0);
  const frequencyDropdownHeight = useSharedValue(0);
  const frequencyDropdownOpacity = useSharedValue(0);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const scrollIndicatorOpacity = useSharedValue(0);
  const scrollIndicatorScale = useSharedValue(0.8);

  const scrollIndicatorStyle = useAnimatedStyle(() => ({
    opacity: scrollIndicatorOpacity.value,
    transform: [
      { scale: scrollIndicatorScale.value },
      { translateY: interpolate(scrollIndicatorOpacity.value, [0, 1], [20, 0]) }
    ],
  }));

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShow = offsetY > 100;

    if (shouldShow !== showScrollToTop) {
      setShowScrollToTop(shouldShow);

      if (shouldShow) {
        scrollIndicatorOpacity.value = withTiming(1, { duration: 300 });
        scrollIndicatorScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      } else {
        scrollIndicatorOpacity.value = withTiming(0, { duration: 200 });
        scrollIndicatorScale.value = withTiming(0.8, { duration: 200 });
      }
    }
  };

  // Dropdown options
  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Overdue', value: 'OVERDUE' }
  ];

  const frequencyOptions = [
    { label: 'All Frequencies', value: '' },
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Weekly', value: 'WEEKLY' },
    { label: 'Daily', value: 'DAILY' },
    { label: 'Yearly', value: 'YEARLY' }
  ];

  // Build query parameters
  const buildQueryParams = useCallback(() => {
    const params = {
      page: page || 1,
      limit: 20,
      status: statusFilter ? statusFilter : '',
      customer_id: searchQuery ? searchQuery : '',
      paymentfrequency: frequencyFilter ? frequencyFilter : ''
    };
    return params;
  }, [page, statusFilter, searchQuery, frequencyFilter]);

  // Fetch data
  const fetchLoans = useCallback(() => {
    const queryParams = buildQueryParams();
    dispatch(gellloandataapi(queryParams));
  }, [dispatch, buildQueryParams]);

  // Initial load and when filters change
  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  // Refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchLoans();
    setTimeout(() => setRefreshing(false), 1000);
  }, [fetchLoans]);

  // Animation styles
  const statusDropdownStyle = useAnimatedStyle(() => ({
    height: statusDropdownHeight.value,
    opacity: statusDropdownOpacity.value,
    transform: [{ scale: interpolate(statusDropdownOpacity.value, [0, 1], [0.95, 1]) }]
  }));

  const frequencyDropdownStyle = useAnimatedStyle(() => ({
    height: frequencyDropdownHeight.value,
    opacity: frequencyDropdownOpacity.value,
    transform: [{ scale: interpolate(frequencyDropdownOpacity.value, [0, 1], [0.95, 1]) }]
  }));

  useEffect(() => {
    if (loanerror && Allloanhistory?.length > 0) {
      showToast({ message: "Failed to load loans", type: 'error', duration: 3000, position: 'top' });
      if (statusFilter || searchQuery || frequencyFilter) {
        setFrequencyFilter('');
        setSearchQuery('');
        setStatusFilter('');
      }
    }
  }, [loanerror])
  // Toggle functions
  const toggleStatusDropdown = () => {
    if (showStatusDropdown) {
      statusDropdownHeight.value = withSpring(0);
      statusDropdownOpacity.value = withSpring(0, {}, () => {
        runOnJS(setShowStatusDropdown)(false);
      });
    } else {
      setShowStatusDropdown(true);
      statusDropdownHeight.value = withSpring(180,{
        damping: 15,
        stiffness: 100
      });
      statusDropdownOpacity.value = withSpring(1,{
        damping: 15,
        stiffness: 100
      });
    }
  };

  const toggleFrequencyDropdown = () => {
    if (showFrequencyDropdown) {
      frequencyDropdownHeight.value = withSpring(0);
      frequencyDropdownOpacity.value = withSpring(0, {}, () => {
        runOnJS(setShowFrequencyDropdown)(false);
      });
    } else {
      setShowFrequencyDropdown(true);
      frequencyDropdownHeight.value = withSpring(225,{
        damping: 15,
        stiffness: 100
      });
      frequencyDropdownOpacity.value = withSpring(1,{
        damping: 15,
        stiffness: 100
      });
    }
  };

  const handleRetry = () => {
    setPage(1);
    fetchLoans();
  }

  const closeAllDropdowns = () => {
    if (showStatusDropdown) toggleStatusDropdown();
    if (showFrequencyDropdown) toggleFrequencyDropdown();
  };

  const handleFrequencySelect = (value) => {
    setFrequencyFilter(value);
    closeAllDropdowns();
    setPage(1);
    // fetchLoans();
  }

  const handleStatusSelect = (value) => {
    setStatusFilter(value);
    closeAllDropdowns();
    setPage(1);
    // fetchLoans();
  }

  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };


  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Backdrop for dropdowns */}
      {/* {(showStatusDropdown || showFrequencyDropdown) && (
        <Pressable
          className="absolute inset-0 bg-black/50 z-20"
          onPress={closeAllDropdowns}
        />
      )} */}

      {/* Header */}
      <View className="bg-primary-100 flex-row items-center justify-between pt-10 pb-20 px-4 rounded-b-[32px]">
        <View>
          <Text className="text-2xl font-bold text-white mb-2">Loans Management</Text>
          <Text className="text-white/70 mb-4">Track and manage all loan accounts</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('addloanformultiplecustomer')}
          className={`${isDarkMode ? 'bg-gray-800/40' : 'bg-white/20'} p-2 rounded-full`}
        >
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View className="p-4 flex-1 -mt-28">
        {/* Search Bar */}
        <View className={`${isDarkMode ? 'bg-gray-800/40' : 'bg-white/20'} px-4 py-2 my-4 rounded-xl flex-row items-center`}>
          <Icon name="search" size={20} color={isDarkMode ? '#9ca3af' : 'rgba(255,255,255,0.6)'} />
          <TextInput
            placeholder="Search by Customer ID"
            className="flex-1 ml-3 text-white"
            placeholderTextColor={isDarkMode ? '#9ca3af' : 'rgba(255,255,255,0.6)'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        <View className="flex-row justify-between mb-4 mt-3">
          {/* Status Filter */}
          <View className="w-[48%] z-30">
            <TouchableOpacity
              onPress={toggleStatusDropdown}
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded-lg flex-row justify-between items-center`}
            >
              <View className="flex-row items-center">
                <Icon name="filter-list" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium ml-2`}>
                  {statusOptions.find(opt => opt.value === statusFilter)?.label || 'Status'}
                </Text>
              </View>
              <Icon
                name={showStatusDropdown ? "expand-less" : "expand-more"}
                size={20}
                color={isDarkMode ? '#9ca3af' : '#4b5563'}
              />
            </TouchableOpacity>

            <Animated.View
              style={[statusDropdownStyle, { position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 40 }]}
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl border border-gray-200 shadow-xl overflow-hidden`}
            >
              <ScrollView>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleStatusSelect(option.value)}
                    className={`px-4 py-3.5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} ${statusFilter === option.value ? 'bg-primary-100/20' : ''}`}
                  >
                    <Text className={`font-medium ${statusFilter === option.value ? 'text-primary-100' : (isDarkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </View>

          {/* Frequency Filter */}
          <View className="w-[48%] z-30">
            <TouchableOpacity
              onPress={toggleFrequencyDropdown}
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded-lg flex-row justify-between items-center`}
            >
              <View className="flex-row items-center">
                <Icon name="schedule" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium ml-2`}>
                  {frequencyOptions.find(opt => opt.value === frequencyFilter)?.label || 'Frequency'}
                </Text>
              </View>
              <Icon
                name={showFrequencyDropdown ? "expand-less" : "expand-more"}
                size={20}
                color={isDarkMode ? '#9ca3af' : '#4b5563'}
              />
            </TouchableOpacity>

            <Animated.View
              style={[frequencyDropdownStyle, { position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 40 }]}
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl border border-gray-200 shadow-xl overflow-hidden`}
            >
              <ScrollView>
                {frequencyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => handleFrequencySelect(option.value)}
                    className={`px-4 py-3.5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} ${frequencyFilter === option.value ? 'bg-primary-100/20' : ''}`}
                  >
                    <Text className={`font-medium ${frequencyFilter === option.value ? 'text-primary-100' : (isDarkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        </View>

        {/* Results */}
        <View className="flex-1">
          {isLoadingLoan && page === 1 ? (
            <FlatList
              data={[1, 2, 3, 4, 5]}
              keyExtractor={(item) => item.toString()}
              renderItem={() => <LoanSkeletonItem isDarkMode={isDarkMode}/>}
              contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          ) : loanerror && Allloanhistory?.length == 0 ? (
            <ErrorComponent isDarkMode={isDarkMode} onRetry={handleRetry} />
          ) : Allloanhistory?.length == 0 ? (
            <View className="flex-1 py-8 items-center">
              <Icon
                name="account-balance"
                size={40}
                color={isDarkMode ? '#6b7280' : '#9ca3af'}
              />
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-2 text-center`}>
                No loans found
              </Text>
              {searchQuery && (
                <Text className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-sm mt-1`}>
                  Try adjusting your search criteria
                </Text>
              )}
            </View>
          )
            : (
              <View className=" relative">
                <Animated.View
                  style={[scrollIndicatorStyle]}
                  className='absolute z-50 w-full flex-row justify-center top-2'
                  pointerEvents={showScrollToTop ? 'auto' : 'none'}
                >
                  <TouchableOpacity
                    onPress={scrollToTop}
                    className='flex-row gap-x-2 justify-center mx-auto text-center text-white bg-black/70 px-4 py-2 rounded-full shadow-lg'
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.25,
                      shadowRadius: 3.84,
                      elevation: 5,
                    }}
                  >
                    <Icon name="keyboard-arrow-up" size={16} color="#fff" />
                    <Text className='text-white text-sm font-medium'>{`Back to Top ${Allloanhistory?.length || 0} / ${totalLoans}`}</Text>
                  </TouchableOpacity>
                </Animated.View>
                <FlatList
                  ref={flatListRef}
                  onScroll={handleScroll}
                  data={Allloanhistory || []}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <LoanItem item={item} />}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={['#2ec4b6']}
                      tintColor="#2ec4b6"
                    />
                  }
                  onEndReached={() => {
                    if (!isLoadingLoan && Allloanhistory?.length >= 20) {
                      setPage(prev => prev + 1);
                    }
                  }}
                  onEndReachedThreshold={0.5}
                  ListFooterComponent={
                    isLoadingLoan && page > 1 ? (
                      <View className="py-4">
                        <ActivityIndicator size="small" color="#2ec4b6" />
                      </View>
                    ) : null
                  }
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}
        </View>
      </View>
    </View>
  );
};

export default LoansScreen;