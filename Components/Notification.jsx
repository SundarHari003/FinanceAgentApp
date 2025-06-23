import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StatusBar, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { 
  FadeOut, 
  FadeIn, 
  SlideOutRight, 
  Layout,
  withTiming,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { useHideTabBar } from '../hooks/useHideTabBar';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;
const scaleFactor = width / 375;

const NotificationItem = ({ item, onSelect, isSelected, selectionMode, isDarkMode }) => {
  return (
    <Animated.View 
      entering={FadeIn}
      exiting={FadeOut}
      layout={Layout.springify()}
    >
      <Pressable
        onLongPress={() => !selectionMode && onSelect(true)}
        onPress={() => selectionMode ? onSelect() : null}
        delayLongPress={500}
        android_ripple={{ color: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View className={`${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-xl shadow-sm overflow-hidden mx-4 mb-2`}>
          <View className={`p-3 ${!item.isRead ? 'border-l-4 border-l-teal-500' : ''}`}>
            <View className="flex-row items-start">
              {selectionMode ? (
                <View className={`w-6 h-6 rounded-full border-2 ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                } items-center justify-center mr-3`}>
                  {isSelected && (
                    <View className="w-4 h-4 rounded-full bg-teal-500" />
                  )}
                </View>
              ) : (
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${item.color}${isDarkMode ? '30' : '15'}` }}
                >
                  <Icon name={item.icon} size={20} color={item.color} />
                </View>
              )}
              <View className="flex-1">
                <View className="flex-row items-center justify-between">
                  <Text className={`${
                    !item.isRead 
                      ? isDarkMode ? 'text-gray-100 font-bold' : 'text-gray-900 font-bold'
                      : isDarkMode ? 'text-gray-300 font-semibold' : 'text-gray-700 font-semibold'
                  } text-base`}>
                    {item.title}
                  </Text>
                  <View className="flex-row items-center">
                    {!item.isRead && (
                      <View className="w-2 h-2 bg-teal-500 rounded-full mr-2" />
                    )}
                    <Text className={`${
                      isDarkMode ? 'text-gray-500' : 'text-gray-400'
                    } text-xs`}>{item.time}</Text>
                  </View>
                </View>
                <Text numberOfLines={2} className={`text-sm mt-0.5 ${
                  !item.isRead 
                    ? isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {item.message}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const NotificationScreen = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  useHideTabBar(['notifications']);
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'collection',
      title: 'Collection Due Today',
      message: 'You have 15 collections pending for today',
      time: '2 hours ago',
      isRead: false,
      icon: 'wallet-outline',
      color: '#14b8a6'
    },
    {
      id: 2,
      type: 'overdue',
      title: 'Overdue Alert',
      message: 'Customer ID #1234 payment is overdue by 3 days',
      time: '5 hours ago',
      isRead: false,
      icon: 'alert-circle-outline',
      color: '#dc2626'
    },
    {
      id: 3,
      type: 'approval',
      title: 'Loan Approved',
      message: 'New loan application #789 has been approved',
      time: 'Yesterday',
      isRead: true,
      icon: 'checkmark-circle-outline',
      color: '#059669'
    },
    {
      id: 4,
      type: 'document',
      title: 'Documents Required',
      message: 'Customer ID #4567 needs to submit income proof',
      time: '2 days ago',
      isRead: true,
      icon: 'document-text-outline',
      color: '#f59e0b'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  // Load more notifications
  const loadMoreNotifications = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      const newNotifications = [
        {
          id: notifications.length + 1,
          type: 'payment',
          title: 'Payment Received',
          message: 'Customer ID #2345 has paid their due amount',
          time: 'Just now',
          isRead: false,
          icon: 'cash-outline',
          color: '#059669'
        },
      ];
      
      setNotifications([...notifications, ...newNotifications]);
      setIsLoading(false);
    }, 1000);
  }, [notifications]);

  const handleDelete = useCallback((id) => {
    setNotifications(prev => prev.filter(item => item.id !== id));
  }, []);

  const toggleSelectionMode = useCallback(() => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedIds([]);
  }, [isSelectionMode]);

  const toggleSelection = useCallback((id) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(itemId => itemId !== id);
      }
      return [...prev, id];
    });
  }, []);

  const deleteSelected = useCallback(() => {
    setNotifications(prev => prev.filter(item => !selectedIds.includes(item.id)));
    setIsSelectionMode(false);
    setSelectedIds([]);
  }, [selectedIds]);

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <StatusBar 
        backgroundColor={isDarkMode ? '#0f766e' : '#1a9c94'} 
        barStyle={isDarkMode ? "light-content" : "light-content"} 
      />

      <LinearGradient
        colors={isDarkMode ? ['#0f766e', '#0d9488'] : ['#1a9c94', '#14b8a6']}
        className={`px-${isTablet ? 8 : 6} pt-${isTablet ? 10 : 8} pb-${isTablet ? 6 : 4}`}
      >
        <View className="flex-row items-center justify-between">
          {isSelectionMode ? (
            <>
              <View className="flex-row items-center">
                <TouchableOpacity 
                  className="p-2 -ml-2" 
                  activeOpacity={0.7}
                  onPress={toggleSelectionMode}
                >
                  <Icon name="close" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold ml-2">
                  {selectedIds.length} Selected
                </Text>
              </View>
              <TouchableOpacity 
                className={`${
                  isDarkMode ? 'bg-red-900/30' : 'bg-red-500/20'
                } px-4 py-1.5 rounded-lg`}
                activeOpacity={0.7}
                onPress={deleteSelected}
                disabled={selectedIds.length === 0}
              >
                <Text className="text-white text-sm font-medium">Delete</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View className="flex-row items-center">
                <TouchableOpacity 
                  className="p-2 -ml-2" 
                  activeOpacity={0.7} 
                  onPress={() => navigation.goBack()}
                >
                  <Icon 
                    name="arrow-back" 
                    size={isTablet ? 28 * scaleFactor : 24 * scaleFactor} 
                    color="white" 
                  />
                </TouchableOpacity>
                <Text className={`text-white text-${isTablet ? '2xl' : 'xl'} font-bold ml-2`}>
                  Notifications
                </Text>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <View className={`bg-white/30 px-${isTablet ? 3 : 2} py-1 rounded-full ml-2`}>
                    <Text className={`text-white text-${isTablet ? 'sm' : 'xs'} font-bold`}>
                      {notifications.filter(n => !n.isRead).length}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity 
                className={`${
                  isDarkMode ? 'bg-white/10' : 'bg-white/20'
                } px-${isTablet ? 4 : 3} py-1.5 rounded-lg`}
                activeOpacity={0.7}
                onPress={() => {
                  setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
                }}
              >
                <Text className={`text-white text-${isTablet ? 'sm' : 'xs'} font-medium`}>
                  Mark all read
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </LinearGradient>

      <Animated.FlatList
        data={notifications}
        renderItem={({ item }) => (
          <NotificationItem 
            item={item} 
            onSelect={(enterMode) => {
              if (enterMode) {
                setIsSelectionMode(true);
                setSelectedIds([item.id]);
              } else {
                toggleSelection(item.id);
              }
            }}
            isSelected={selectedIds.includes(item.id)}
            selectionMode={isSelectionMode}
            isDarkMode={isDarkMode}
          />
        )
        }
        contentContainerStyle={{ paddingVertical: 8 }}
        onEndReached={loadMoreNotifications}
        onEndReachedThreshold={0.5}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-20">
            <View className={`w-${isTablet ? 24 : 20} h-${isTablet ? 24 : 20} rounded-full ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            } items-center justify-center mb-6`}>
              <Icon 
                name="notifications-off-outline" 
                size={isTablet ? 48 * scaleFactor : 40 * scaleFactor} 
                color={isDarkMode ? '#4b5563' : '#9ca3af'} 
              />
            </View>
            <Text className={`${
              isDarkMode ? 'text-gray-300' : 'text-gray-500'
            } text-${isTablet ? 'xl' : 'lg'} font-medium text-center`}>
              No notifications
            </Text>
            <Text className={`${
              isDarkMode ? 'text-gray-400' : 'text-gray-400'
            } text-${isTablet ? 'base' : 'sm'} text-center mt-2`}>
              You're all caught up!
            </Text>
          </View>
        )}
        ListFooterComponent={() => (
          isLoading ? (
            <View className="py-6">
              <ActivityIndicator 
                size={isTablet ? 'large' : 'small'} 
                color={isDarkMode ? '#2dd4bf' : '#14b8a6'} 
              />
            </View>
          ) : (
            <View className="h-3" />
          )
        )}
        itemLayoutAnimation={Layout.springify()}
      />
    </View>
  );
};

export default NotificationScreen;