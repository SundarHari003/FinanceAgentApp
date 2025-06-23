// components/CustomerDetails/CustomerDetailsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  InteractionManager,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useHideTabBar } from '../../hooks/useHideTabBar';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import OverviewContent from './Components/OverviewContent';
import LoanContent from './Components/LoanContent';
import ProfileContent from './Components/ProfileContent';
import HistoryContent from './Components/HistoryContent';
import DocumentsContent from './Components/DocumentsContent';

const CustomerDetailsScreen = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { isloadingcustomer } = useSelector((state) => state.customer);
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isReady, setIsReady] = useState(false);
  useHideTabBar(['Customerdetails', 'Loandetails', 'editcustomer', 'addloan']);

  const tabs = [
    { id: 'overview', title: 'Overview', icon: 'grid-outline' },
    { id: 'loan', title: 'Loan Details', icon: 'wallet-outline' },
    { id: 'profile', title: 'Profile', icon: 'person-outline' },
    { id: 'history', title: 'History', icon: 'time-outline' },
    { id: 'documents', title: 'Documents', icon: 'document-attach-outline' },
  ];

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setIsReady(true);
    });
  }, []);

  if ( isloadingcustomer) {
    return (
      <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator
            color={isDarkMode ? '#2dd4bf' : '#14b8a6'}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
        >
          <View className="flex flex-1 gap-8 flex-row w-full justify-between px-5 pb-1 pt-5">
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                className="items-center pb-2"
              >
                <View className={`p-3 rounded-2xl mb-1 ${activeTab === tab.id
                  ? 'bg-primary-100'
                  : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                  <Icon
                    name={tab.icon}
                    size={20}
                    color={activeTab === tab.id ? '#ffffff' : isDarkMode ? '#9ca3af' : '#6b7280'}
                  />
                </View>
                <Text className={`text-xs font-medium ${activeTab === tab.id
                  ? 'text-primary-100'
                  : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                  {tab.title}
                </Text>
                {activeTab === tab.id && (
                  <View className="w-full h-1 bg-primary-100 rounded-full absolute bottom-0" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <ScrollView
        className={`flex-1 pt-5 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        removeClippedSubviews={Platform.OS === 'android'}
      >
        {activeTab === 'overview' && <OverviewContent />}
        {activeTab === 'loan' && <LoanContent />}
        {activeTab === 'profile' && <ProfileContent />}
        {activeTab === 'history' && <HistoryContent />}
        {activeTab === 'documents' && <DocumentsContent />}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CustomerDetailsScreen;