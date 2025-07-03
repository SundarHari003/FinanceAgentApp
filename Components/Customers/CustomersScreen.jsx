import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getallcustomer, getsingleCustomerdetails } from '../../redux/Slices/customerSlice';
import SkeletonBox from '../Common/SkeletonBox';

// Skeleton Loader Component for Customer Cards
const CustomerCardSkeleton = ({ index }) => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const offset = useSharedValue(50);

  useEffect(() => {
    offset.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
      delay: index * 100 // Stagger animation
    });
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
    opacity: 1 - offset.value / 50,
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={`${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-sm p-4 rounded-2xl mb-3 shadow-sm`}
    >
      <View className="flex-row items-center">
        <SkeletonBox width={48} height={48} className="rounded-full my-4" />
        <View className="flex-1 gap-y-2 px-3">
          <SkeletonBox width="70%" height={16} className="mb-2" />
          <SkeletonBox width="40%" height={12} />
          <SkeletonBox width="40%" height={12} />
        </View>
        <SkeletonBox width={32} height={32} className="rounded-full" />
      </View>
    </Animated.View>
  );
};

// Updated Customer Card Component
const CustomerCard = memo(({ name, custId, city, isActive, index, onPress }) => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const offset = useSharedValue(50);

  // Animate card entrance
  useEffect(() => {
    offset.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
    opacity: 1 - offset.value / 50,
  }));

  return (
    <TouchableOpacity onPress={onPress}>
      <Animated.View
        style={animatedStyle}
        className={`${isDarkMode
          ? 'bg-gray-800/90 border-gray-700' :
          'bg-white/90 border-gray-200'
          } backdrop-blur-sm p-4 rounded-2xl mb-3 shadow-sm border ${!isActive ? 'opacity-60' : ''
          }`}
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-primary-100/10 items-center justify-center mr-4">
            <Icon
              name="person-outline"
              size={24}
              color={isActive ? "#2ec4b6" : "#9ca3af"}
            />
          </View>

          {/* Customer Info */}
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className={`text-base font-semibold ${isDarkMode
                ? isActive ? 'text-gray-100' : 'text-gray-400'
                : isActive ? 'text-gray-900' : 'text-gray-500'
                }`}>
                {name}
              </Text>
              {!isActive && (
                <View className="ml-2 px-2 py-1 rounded-full bg-red-100/80">
                  <Text className="text-xs font-medium text-red-600">DISABLED</Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center mt-1">
              <Icon name="badge" size={14} color="#9ca3af" />
              <Text className={`text-sm ml-1 ${isActive ? 'text-gray-500' : 'text-gray-400'
                }`}>
                ID: {custId}
              </Text>
            </View>

            {city && (
              <View className="flex-row items-center mt-1">
                <Icon name="location-on" size={14} color="#9ca3af" />
                <Text className={`text-sm ml-1 ${isActive ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                  {city}
                </Text>
              </View>
            )}
          </View>

          <View className="bg-primary-100/10 p-2 rounded-full">
            <Icon
              name={"chevron-right"}
              size={20}
              color={isActive ? "#2ec4b6" : "#9ca3af"}
            />
          </View>
        </View>

        {/* Status Info for Disabled Customers */}
        {!isActive && (
          <View className={`mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'
            }`}>
            <Text className={`text-xs text-center ${isDarkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
              Customer temporarily disabled
            </Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

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
        We couldn't load your customers. Please try again.
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

// Empty State Component
const EmptyState = ({ onRetry }) => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const navigation = useNavigation();

  return (
    <View className="flex-1 items-center justify-center py-16">
      <View className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} w-20 h-20 rounded-full items-center justify-center mb-4`}>
        <Icon name="people-outline" size={32} color="#9ca3af" />
      </View>
      <Text className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
        No customers found
      </Text>
      <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-center px-8 mb-4`}>
        Start building your customer base by adding your first customer.
      </Text>
      <TouchableOpacity
        onPress={() => onRetry}
        className="bg-primary-100 px-6 py-3 rounded-xl"
      >
        <Text className="text-white font-medium">Try Again</Text>
      </TouchableOpacity>
    </View>
  );
};

// Main Customer List Screen
const CustomersScreen = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { CustomerByagent, customerError, totalCustomer, hasMorecutomer, isloadingcustomer } = useSelector((state) => state.customer);

  // Local state
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Define dropdown options
  const statusOptions = ['All', 'Active', 'Inactive'];
  const sortOptions = ['Newest', 'Oldest'];

  const statusDropdownHeight = useSharedValue(0);
  const sortDropdownHeight = useSharedValue(0);
  const statusDropdownOpacity = useSharedValue(0);
  const sortDropdownOpacity = useSharedValue(0);



  const fetchCustomer = async (pageNum = 1, isRefresh = false, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setIsLoadingMore(true);
      }
      const queryparam = {
        "page": pageNum,
        "search": searchQuery,
        "status": selectedStatus === 'All' ? '' : selectedStatus.toLowerCase(),
      };
      await dispatch(getallcustomer(queryparam));

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

  // Initial load
  useEffect(() => {
    setCurrentPage(1);
    fetchCustomer(1)
  }, [dispatch, searchQuery, selectedStatus]);

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setCurrentPage(1);
    fetchCustomer(1, true)
  }, [dispatch]);

  // Retry handler for error state
  const handleRetry = useCallback(() => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedSort('Newest');
    setCurrentPage(1);
    dispatch(getallcustomer({ "page": 1, "search": searchQuery || '' }));
  }, [dispatch]);

  const statusDropdownStyle = useAnimatedStyle(() => ({
    height: statusDropdownHeight.value,
    opacity: statusDropdownOpacity.value,
    transform: [
      {
        scale: interpolate(
          statusDropdownOpacity.value,
          [0, 1],
          [0.95, 1]
        )
      }
    ]
  }));

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

  const toggleStatusDropdown = () => {
    const isOpen = showStatusDropdown;
    setShowStatusDropdown(!isOpen);
    setShowSortDropdown(false);

    if (!isOpen) {
      statusDropdownHeight.value = withSpring(135, {
        damping: 15,
        stiffness: 100
      });
      statusDropdownOpacity.value = withSpring(1, {
        damping: 15,
        stiffness: 100
      });
      sortDropdownHeight.value = withSpring(0);
      sortDropdownOpacity.value = withSpring(0);
    } else {
      statusDropdownHeight.value = withSpring(0);
      statusDropdownOpacity.value = withSpring(0);
    }
  };

  const toggleSortDropdown = () => {
    const isOpen = showSortDropdown;
    setShowSortDropdown(!isOpen);
    setShowStatusDropdown(false);

    if (!isOpen) {
      sortDropdownHeight.value = withSpring(90, {
        damping: 15,
        stiffness: 100
      });
      sortDropdownOpacity.value = withSpring(1, {
        damping: 15,
        stiffness: 100
      });
      statusDropdownHeight.value = withSpring(0);
      statusDropdownOpacity.value = withSpring(0);
    } else {
      sortDropdownHeight.value = withSpring(0);
      sortDropdownOpacity.value = withSpring(0);
    }
  };

  const handleOutsidePress = useCallback(() => {
    if (showStatusDropdown || showSortDropdown) {
      // Close Status Dropdown with animation
      if (showStatusDropdown) {
        statusDropdownHeight.value = withSpring(0, {
          damping: 15,
          stiffness: 100
        });
        statusDropdownOpacity.value = withSpring(0, {
          damping: 15,
          stiffness: 100
        });
        setShowStatusDropdown(false);
      }

      // Close Sort Dropdown with animation
      if (showSortDropdown) {
        sortDropdownHeight.value = withSpring(0, {
          damping: 15,
          stiffness: 100
        });
        sortDropdownOpacity.value = withSpring(0, {
          damping: 15,
          stiffness: 100
        });
        setShowSortDropdown(false);
      }
    }
  }, [showStatusDropdown, showSortDropdown]);

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

  // Handle scroll events - THIS IS THE MAIN FIX
  const handleScroll = useCallback((event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const shouldShow = offsetY > 200; // Show indicator after scrolling 200px

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
  }, [showScrollToTop]);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, []);

  // Render footer component for pagination
  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View className="py-6 items-center">
        <ActivityIndicator size="small" color="#2ec4b6" />
        <Text className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Loading more customers...
        </Text>
      </View>
    );
  };

  const handleLoadMore = () => {
    if (!isloadingcustomer && !isLoadingMore && hasMorecutomer && CustomerByagent.length > 0) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchCustomer(nextPage, false, true);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (customerError) {
        handleRetry();
      }
      return () => {
        scrollToTop();
        setShowScrollToTop(false)
        statusDropdownHeight.value = 0;
        statusDropdownOpacity.value = 0;
        sortDropdownHeight.value = 0;
        sortDropdownOpacity.value = 0;
        runOnJS(setShowStatusDropdown)(false);
        runOnJS(setShowSortDropdown)(false);
      };
    }, [])
  );

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header with Glass Effect */}
      <View className="bg-primary-100 pt-8 px-4 rounded-b-[32px] shadow-lg">
        <View className="flex-row justify-between items-center">
          <Text className="text-2xl font-bold text-white">Customers</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Createcustomer')}
            className={`${isDarkMode ? 'bg-gray-800/40' : 'bg-white/20'} p-2 rounded-full`}
          >
            <Icon name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-white/70">Manage your customer database</Text>
        <View className={`${isDarkMode ? 'bg-gray-800/40' : 'bg-white/20'} px-4 py-2 my-4 rounded-xl flex-row items-center`}>
          <Icon name="search" size={22} color={isDarkMode ? '#9ca3af' : 'rgba(255,255,255,0.6)'} />
          <TextInput
            placeholder="Search by ID or name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="flex-1 ml-3 text-white"
            placeholderTextColor={isDarkMode ? '#9ca3af' : 'rgba(255,255,255,0.6)'}
          />
          {searchQuery !== '' && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              className="p-1"
            >
              <Icon name="close" size={22} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Backdrop for dropdowns */}
      {(showStatusDropdown || showSortDropdown) && (
        <Pressable
          className={`absolute inset-0 ${isDarkMode ? 'bg-black/60' : 'bg-black/20'} z-10`}
          onPress={handleOutsidePress}
        />
      )}

      {/* Floating Search and Filters */}
      <View className="px-4 relative z-20">
        <View className="mb-5 mt-4">
          <View className="flex-row justify-between">
            {/* Status Filter */}
            <TouchableOpacity
              onPress={toggleStatusDropdown}
              className={`flex-1 mr-2 flex-row items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                } px-4 py-3.5 rounded-xl`}
            >
              <View className="flex-row items-center">
                <Icon name="filter-list" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                <Text className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
                  {selectedStatus}
                </Text>
              </View>
              <Icon
                name={showStatusDropdown ? "expand-less" : "expand-more"}
                size={20}
                color={isDarkMode ? '#9ca3af' : '#4b5563'}
              />
            </TouchableOpacity>

            {/* Sort Filter */}
            <TouchableOpacity
              onPress={toggleSortDropdown}
              className={`flex-1 ml-2 flex-row items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                } px-4 py-3.5 rounded-xl`}
            >
              <View className="flex-row items-center">
                <Icon name="sort" size={20} color={isDarkMode ? '#9ca3af' : '#4b5563'} />
                <Text className={`ml-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium`}>
                  {selectedSort}
                </Text>
              </View>
              <Icon
                name={showSortDropdown ? "expand-less" : "expand-more"}
                size={20}
                color={isDarkMode ? '#9ca3af' : '#4b5563'}
              />
            </TouchableOpacity>
          </View>

          {/* Status Dropdown */}
          <Animated.View
            style={[statusDropdownStyle]}
            className={`absolute top-[110%] left-0 right-[52%] ${isDarkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-xl shadow-xl z-30 border border-gray-200 overflow-hidden`}
          >
            {statusOptions.map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => {
                  setSelectedStatus(status);
                  setShowScrollToTop(false);
                  toggleStatusDropdown();
                }}
                className={`px-4 py-3.5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'
                  } ${selectedStatus === status ?
                    (isDarkMode ? 'bg-primary-100/20' : 'bg-primary-100/10') : ''
                  }`}
              >
                <Text className={`font-medium ${selectedStatus === status ? 'text-primary-100' :
                  (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                  }`}>
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Sort Dropdown */}
          <Animated.View
            style={[sortDropdownStyle]}
            className={`absolute top-[110%] left-[52%] right-0 ${isDarkMode ? 'bg-gray-800' : 'bg-white'
              } rounded-xl shadow-xl z-30 border border-gray-200 overflow-hidden`}
          >
            {sortOptions.map((sort) => (
              <TouchableOpacity
                key={sort}
                onPress={() => {
                  setSelectedSort(sort);
                  toggleSortDropdown();
                }}
                className={`px-4 py-3.5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'
                  } ${selectedSort === sort ?
                    (isDarkMode ? 'bg-primary-100/20' : 'bg-primary-100/10') : ''
                  }`}
              >
                <Text className={`font-medium ${selectedSort === sort ? 'text-primary-100' :
                  (isDarkMode ? 'text-gray-300' : 'text-gray-700')
                  }`}>
                  {sort}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      </View>

      {/* Main Content */}
      <View className="flex-1 z-0">
        {/* Show skeleton only on initial load */}
        {currentPage == 1 && isloadingcustomer ? (
          <FlatList
            data={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
            keyExtractor={(item) => item.toString()}
            renderItem={() => <CustomerCardSkeleton />}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={7}
            removeClippedSubviews={true}
          />
        ) : customerError ? (
          <ErrorState onRetry={handleRetry} />
        ) : CustomerByagent.length === 0 && !isloadingcustomer ? (
          <EmptyState onRetry={handleRetry} />
        ) : (
          <View className='relative'>
            {/* Back to Top Button - Fixed positioning */}
            {showScrollToTop && <Animated.View
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
                <Text className='text-white text-sm font-medium'>
                  {`Back to Top ${CustomerByagent.length || 0} / ${totalCustomer}`}
                </Text>
              </TouchableOpacity>
            </Animated.View>}

            {/* FlatList with scroll handler */}
            <FlatList
              ref={flatListRef}
              data={CustomerByagent}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              renderItem={({ item, index }) => (
                <CustomerCard
                  name={item.name}
                  city={item.city}
                  isActive={item.is_active}
                  custId={item.id}
                  index={index}
                  onPress={() => {
                    dispatch(getsingleCustomerdetails(item.id));
                    navigation.navigate("Customerdetails", { id: item.id });
                  }}
                />
              )}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
              onScroll={handleScroll} // THIS IS THE KEY FIX - Adding the scroll handler
              scrollEventThrottle={16} // Smooth scroll events
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
                autoscrollToTopThreshold: 10
              }} // Helps maintain position during data updates
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={7}
              removeClippedSubviews={true} // Memory optimization
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={['#2ec4b6']}
                  progressBackgroundColor={isDarkMode ? '#4b5563' : '#fff'}
                  tintColor="#2ec4b6"
                  title="Pull to refresh"
                  titleColor={isDarkMode ? '#9ca3af' : '#4b5563'}
                />
              }
              ListFooterComponent={renderFooter}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.1}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default CustomersScreen;