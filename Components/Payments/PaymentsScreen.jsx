import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, ActivityIndicator, Pressable, Dimensions, RefreshControl } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  runOnJS,
  withTiming
} from 'react-native-reanimated';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getallpayment, getsinglepaymentreducer } from '../../redux/Slices/paymentslice';
import SkeletonBox from '../Common/SkeletonBox';

const PaymentItemSkeleton = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  return (
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl mb-4 shadow-sm overflow-hidden`}>
      {/* Header Section */}
      <View className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <SkeletonBox width="40%" height={12} style={{ marginBottom: 8 }} />
            <SkeletonBox width="60%" height={16} />
          </View>
          <View className="items-end">
            <SkeletonBox width="30%" height={12} style={{ marginBottom: 8 }} />
            <SkeletonBox width="50%" height={18} />
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View className="p-4">
        {/* Due Date and Status Row */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center flex-1">
            <View className={`w-4 h-4 mr-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} `} />
            <SkeletonBox width="45%" height={14} />
          </View>
          <SkeletonBox width="20%" height={24} style={{ borderRadius: 12 }} />
        </View>

        {/* Loan and Customer ID Section */}
        <View className={`flex-row justify-between ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-3`}>
          <View className="flex-1">
            <SkeletonBox width="40%" height={10} style={{ marginBottom: 6 }} />
            <SkeletonBox width="60%" height={14} />
          </View>
          <View className={`w-px ${isDarkMode ? " bg-gray-500" : "bg-gray-200"} mx-3`} />
          <View className="flex-1">
            <SkeletonBox width="50%" height={10} style={{ marginBottom: 6 }} />
            <SkeletonBox width="70%" height={14} />
          </View>
        </View>
      </View>

      {/* Footer Section */}
      <View className={`${isDarkMode ? 'bg-gray-700/80' : 'bg-gray-50/80'} px-4 py-3 flex-row items-center justify-between`}>
        <View className="flex-row items-center flex-1">
          <View className={`w-4 h-4 mr-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} `} />
          <SkeletonBox width="60%" height={14} />
        </View>
      </View>
    </View>
  );
};

// Error State Component
const ErrorState = ({ onRetry }) => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  return (
    <View className="flex-1 items-center justify-center py-16">
      <View className={`${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'} w-20 h-20 rounded-full items-center justify-center mb-4`}>
        <Icon name="error-outline" size={32} color="#dc2626" />
      </View>
      <Text className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
        Something went wrong
      </Text>
      <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center px-8 mb-4`}>
        We couldn't load your payment history. Please try again.
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

// PaymentItem Component (unchanged)
const PaymentItem = ({ index, paymenthistoryDetails }) => {
  const navigation = useNavigation();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const offset = useSharedValue(50);
  const dispatch = useDispatch();
  useEffect(() => {
    offset.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
    opacity: 1 - offset.value / 50,
  }));

  const getStatusStyle = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-600 border-green-200';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
      case 'partial':
        return 'bg-blue-500/10 text-blue-600 border-blue-200';
      default:
        return 'bg-red-500/10 text-red-600 border-red-200';
    }
  };

  return (
    <TouchableOpacity
      key={index}
      onPress={() => {
        dispatch(getsinglepaymentreducer(paymenthistoryDetails));
        navigation.navigate('Paymentdetails');
      }
      }
    >
      <Animated.View
        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} z-0 rounded-2xl mb-4 shadow-sm overflow-hidden`}
        style={animatedStyle}
      >
        <View className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
          <View className="flex-row justify-between items-start">
            <View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Payment Date</Text>
              <Text className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mt-1`}>
                {paymenthistoryDetails?.payment_date ? moment(paymenthistoryDetails?.payment_date).format('DD MMM YYYY') : "Not yet paid"}
              </Text>
            </View>
            <View>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amount</Text>
              <Text className="text-lg font-bold text-primary-100 mt-1">
                ₹{paymenthistoryDetails?.total_amount.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        <View className="p-4">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Icon name="receipt" size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm ml-2`}>Due Date:</Text>
              <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-medium ml-2`}>
                {paymenthistoryDetails?.due_date ? moment(paymenthistoryDetails.due_date).format('DD MMM YYYY') : 'N/A'}
              </Text>
            </View>
            <View className={`px-3 py-1 capitalize rounded-full border ${getStatusStyle(paymenthistoryDetails?.status.toLowerCase())}`}>
              <Text
                className={`text-xs font-medium ${paymenthistoryDetails?.status.toLowerCase() === 'paid'
                  ? 'text-green-600'
                  : paymenthistoryDetails?.status.toLowerCase() === 'pending'
                    ? 'text-yellow-600'
                    : paymenthistoryDetails?.status.toLowerCase() === 'partial'
                      ? 'text-blue-600'
                      : 'text-red-600'
                  }`}
              >
                {paymenthistoryDetails?.status.toLowerCase()}
              </Text>
            </View>
          </View>

          <View className={`flex-row justify-between ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-3`}>
            <View className="flex-1">
              <Text className={`text-xs ${isDarkMode ? "text-gray-200" : "text-gray-500"} mb-1`}>Loan ID</Text>
              <Text className={`text-sm font-medium ${isDarkMode ? "text-white/50" : "text-gray-800"}`}>{paymenthistoryDetails?.loan_id}</Text>
            </View>
            <View className="w-px bg-gray-200 mx-3" />
            <View className="flex-1">
              <Text className={`text-xs ${isDarkMode ? "text-gray-200" : "text-gray-500"} mb-1`}>Customer ID</Text>
              <Text className={`text-sm font-medium ${isDarkMode ? "text-white/50" : "text-gray-800"}`}>{paymenthistoryDetails?.loan?.customer_id}</Text>
            </View>
          </View>

          {(paymenthistoryDetails?.status.toLowerCase() === 'overdue' || paymenthistoryDetails?.status.toLowerCase() === 'partial') && (
            <View className={`mt-3 ${paymenthistoryDetails?.status.toLowerCase() === 'overdue'
              ? (isDarkMode ? 'bg-red-900/30' : 'bg-red-50')
              : (isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50')
              } rounded-xl p-3`}>
              <View className="flex-row items-center">
                <Icon name={paymenthistoryDetails?.status.toLowerCase() === 'overdue' ? 'warning' : 'info'} size={16} color={paymenthistoryDetails?.status.toLowerCase() === 'overdue' ? '#dc2626' : '#2563eb'} />
                <Text className={`${paymenthistoryDetails?.status.toLowerCase() === 'overdue' ? 'text-red-600' : 'text-blue-600'} text-sm ml-2`}>
                  {paymenthistoryDetails?.status.toLowerCase() === 'overdue' ? `Overdue by ${paymenthistoryDetails.daysOverdue} days` : `Partial payment made`}
                </Text>
              </View>
              <Text className={`${paymenthistoryDetails?.status.toLowerCase() === 'overdue' ? 'text-red-500' : 'text-blue-500'} text-xs mt-1`}>
                {paymenthistoryDetails?.status.toLowerCase() === 'partial' && `Remaining: ₹${paymenthistoryDetails?.total_amount - paymenthistoryDetails?.amount_paid}`}
              </Text>
            </View>
          )}
        </View>

        <View className={`${isDarkMode ? 'bg-gray-700/80' : 'bg-gray-50/80'} px-4 py-3 flex-row items-center justify-between`}>
          <View className="flex-row items-center">
            <Icon
              name={paymenthistoryDetails?.status.toLowerCase() === 'paid' || paymenthistoryDetails?.status.toLowerCase() === 'partial' ? 'check-circle' : 'schedule'}
              size={16}
              color={paymenthistoryDetails?.status.toLowerCase() === 'paid' || paymenthistoryDetails?.status.toLowerCase() === 'partial' ? '#16a34a' : '#6b7280'}
            />
            <Text className={` text-sm ml-2 ${isDarkMode ? 'text-[#6b7280]' : 'text-gray-600'}`}>
              {paymenthistoryDetails?.status.toLowerCase() === 'paid'
                ? `Paid via ${paymenthistoryDetails.notes}`
                : paymenthistoryDetails?.status.toLowerCase() === 'partial'
                  ? `Partially paid via ${paymenthistoryDetails.notes}`
                  : 'Payment pending'}
            </Text>
          </View>
          <Icon name="chevron-right" size={20} color="#6b7280" />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Main Payment History Screen
const PaymentsScreen = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { Allpaymenthistory, isLoadingPayment, paymenterror, hasMore, totalPayments } = useSelector((state) => state.payment);

  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [sortOption, setSortOption] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  const [dateFilterValue, setDateFilterValue] = useState('');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Scroll-to-top functionality
  const flatListRef = useRef(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Animation values for scroll-to-top indicator
  const scrollIndicatorOpacity = useSharedValue(0);
  const scrollIndicatorScale = useSharedValue(0.8);

  // Animated style for scroll-to-top indicator
  const scrollIndicatorStyle = useAnimatedStyle(() => ({
    opacity: scrollIndicatorOpacity.value,
    transform: [
      { scale: scrollIndicatorScale.value },
      { translateY: interpolate(scrollIndicatorOpacity.value, [0, 1], [20, 0]) }
    ],
  }));

  // Handle scroll events
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShow = offsetY > 100; // Show indicator after scrolling 100px

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

  // Scroll to top function
  const scrollToTop = () => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };

  // Base query params that will be maintained throughout pagination
  const getBaseQueryParams = () => ({
    "status": sortOption === 'All' ? '' : sortOption.toUpperCase(),
    "loanid": searchQuery,
    "dueDatestart": dateFilterValue ? dateFilterValue : '',
    "dueDateend": dateFilterValue ? dateFilterValue : '',
    "limit": 10
  });

  // Fetch payments function
  const fetchPayments = async (pageNum = 1, isRefresh = false, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      }

      const queryparam = {
        ...getBaseQueryParams(),
        "page": pageNum
      };

      await dispatch(getallpayment(queryparam));

      if (isRefresh) {
        setRefreshing(false);
      }
      if (isLoadMore) {
        setIsLoadingMore(false);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      if (isRefresh) {
        setRefreshing(false);
      }
      if (isLoadMore) {
        setIsLoadingMore(false);
      }
    }
  };

  // Initial load and filter changes
  useEffect(() => {
    setPage(1);
    fetchPayments(1);
  }, [sortOption, searchQuery, dateFilterValue]);

  // Pull to refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPayments(1, true);
  };

  // Load more data when reaching end of list
  const handleLoadMore = () => {
    if (!isLoadingPayment && !isLoadingMore && hasMore && Allpaymenthistory.length > 0) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPayments(nextPage, false, true);
    }
  };

  // Render footer for loading more items
  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View className="py-6 -mt-2 items-center">
        <ActivityIndicator size="small" color="#2ec4b6" />
        <Text className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Loading more payments...
        </Text>
      </View>
    );
  };

  // Handle sort selection
  const handleSort = (option) => {
    setSortOption(option);
    closeDropdownWithAnimation();
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    if (date) {
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const displayDate = moment(date).format('DD MMM YYYY');
      setDateFilter(displayDate);
      setDateFilterValue(formattedDate);
    }
    setShowCalendarModal(false);
  };

  // Clear date filter
  const clearDateFilter = () => {
    setDateFilter('');
    setDateFilterValue('');
    setShowCalendarModal(false);
  };

  // Retry function
  const handleRetry = () => {
    setDateFilter('');
    setDateFilterValue('');
    setSortOption('All');
    setPage(1);
    const queryparam = {
      "status": '',
      "loanid": '',
      "dueDatestart": '',
      "dueDateend": '',
      "page": 1,
      "limit": 10
    };
    dispatch(getallpayment(queryparam));
  };

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

  // Animation values
  const sortDropdownHeight = useSharedValue(0);
  const sortDropdownOpacity = useSharedValue(0);

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

  const toggleSortDropdown = () => {
    const isOpen = showSortDropdown;

    if (!isOpen) {
      setShowSortDropdown(true);
      sortDropdownHeight.value = withSpring(180, {
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

  const handleBackdropPress = () => {
    closeDropdownWithAnimation();
  };

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {showSortDropdown && (
        <Pressable
          className={`absolute inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/20'} z-20`}
          onPress={handleBackdropPress}
        />
      )}

      <View className="bg-primary-100 pt-10 pb-4 px-4 rounded-b-[32px]">
        <Text className="text-2xl font-bold text-white mb-2">Payment History</Text>
        <Text className="text-white/70 mb-4">View and Manage the all payments</Text>
        <View className={`${isDarkMode ? 'bg-gray-800/40' : 'bg-white/20'} px-4 py-2 rounded-xl flex-row items-center`}>
          <Icon name="search" size={20} color="white" />
          <TextInput
            placeholder="Search by Customer or Loan ID"
            placeholderTextColor={isDarkMode ? '#9ca3af' : 'rgba(255,255,255,0.6)'}
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-white"
          />
        </View>
      </View>

      <View className="px-4 mt-4 flex-1">
        <View className="flex-row justify-between mb-3 relative">
          <TouchableOpacity
            onPress={() => setShowCalendarModal(true)}
            className={`flex-1 mr-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-3 rounded-xl flex-row items-center justify-between shadow-sm`}
          >
            <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`} numberOfLines={1}>
              {dateFilter || 'Filter by Date'}
            </Text>
            <Icon name="calendar-today" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleSortDropdown}
            className={`flex-1 ml-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} z-30 p-3 rounded-xl flex-row items-center justify-between shadow-sm`}
          >
            <View className="flex-row items-center">
              <Icon name="sort" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
              <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium ml-3`} numberOfLines={1}>
                {sortOption.split(' ')[0]}
              </Text>
            </View>
            <Icon
              name={showSortDropdown ? "expand-less" : "expand-more"}
              size={20}
              color={isDarkMode ? '#9ca3af' : '#4b5563'}
            />
          </TouchableOpacity>
        </View>

        {/* Sort Dropdown */}
        <Animated.View
          style={[sortDropdownStyle]}
          className={`absolute top-[60px] right-4 left-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
            } rounded-xl shadow-xl z-40 overflow-hidden`}
        >
          {['All', 'Paid', 'Pending', 'Partial', 'Overdue'].map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => handleSort(option)}
              className={`px-4 py-3.5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'
                } ${sortOption === option ?
                  (isDarkMode ? 'bg-primary-100/20' : 'bg-primary-100/10')
                  : ''
                }`}
            >
              <Text className={`font-medium ${sortOption === option ? 'text-primary-100' :
                (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                }`}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Content */}
        {isLoadingPayment && page === 1 ? (
          // Skeleton Loading State for initial load
          <FlatList
            data={[1, 2, 3, 4, 5]}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <PaymentItemSkeleton />}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        ) : paymenterror ? (
          <ErrorState onRetry={handleRetry} />
        ) : Allpaymenthistory.length === 0 ? (
          <View className="flex-1 items-center justify-center py-16">
            <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} w-20 h-20 rounded-full items-center justify-center mb-4`}>
              <Icon name="receipt-long" size={50} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            </View>
            <Text className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              No payments found
            </Text>
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center px-8`}>
              Try adjusting your search or filter criteria to find the payments you're looking for.
            </Text>
          </View>
        ) : (
          // Data List with Scroll-to-Top Indicator
          <View className='relative mb-8'>
            {/* Scroll-to-Top Indicator */}
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
                <Text className='text-white text-sm font-medium'>{`Back to Top ${Allpaymenthistory.length || 0} / ${totalPayments}`}</Text>
              </TouchableOpacity>
            </Animated.View>

            <FlatList
              ref={flatListRef}
              data={Allpaymenthistory}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item, index }) => (
                <PaymentItem index={index} paymenthistoryDetails={item} />
              )}
              ListFooterComponent={renderFooter}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
              onScroll={handleScroll}
              scrollEventThrottle={16} // Smooth scroll events
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10
              }} // Helps maintain position during data updates
              removeClippedSubviews={true} // Performance optimization
              maxToRenderPerBatch={10} // Render optimization
              updateCellsBatchingPeriod={50} // Batch updates
              initialNumToRender={15} // Initial render count
              windowSize={10}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={['#2ec4b6']}
                  tintColor="#2ec4b6"
                  progressBackgroundColor={isDarkMode ? '#4b5563' : '#fff'}
                  title="Pull to refresh"
                  titleColor={isDarkMode ? '#9ca3af' : '#4b5563'}
                />
              }
              contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendarModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1 bg-black/50 justify-center items-center z-50"
          onPress={() => setShowCalendarModal(false)}
        >
          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg w-11/12`}>
            <CalendarPicker
              onDateChange={handleDateSelect}
              selectedDayColor="#2ec4b6"
              selectedDayTextColor="#ffffff"
              todayBackgroundColor={isDarkMode ? '#374151' : '#f2f2f2'}
              todayTextStyle={{ color: '#2ec4b6' }}
              textStyle={{ color: isDarkMode ? '#f3f4f6' : '#333' }}
              previousComponent={<CustomPrevious />}
              nextComponent={<CustomNext />}
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
    </View>
  );
};

export default PaymentsScreen;