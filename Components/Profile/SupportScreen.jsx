import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const SupportScreen = () => {
  const navigation = useNavigation();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  const supportOptions = [
    { title: 'Technical Issues', route: 'ChatScreen' },
    { title: 'Account Problems', route: 'ChatScreen' },
    { title: 'Payment Queries', route: 'ChatScreen' },
    { title: 'Other', route: 'ChatScreen' }
  ];

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Support Options Section */}
      <View className={`px-2 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-lg m-4`}>
        <Text className={`text-sm font-bold ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        } uppercase mb-4 tracking-wider`}>
          WHAT CAN WE HELP YOU WITH?
        </Text>
        
        {supportOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row justify-between items-center p-3 ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
            } rounded-lg ${index !== supportOptions.length - 1 ? 'mb-2' : ''}`}
            onPress={() => navigation.navigate(option.route)}
          >
            <Text className={`${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            } text-base`}>
              {option.title}
            </Text>
            <Icon 
              name="chevron-forward" 
              size={20} 
              color={isDarkMode ? '#9ca3af' : '#4B5563'} 
            />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

export default SupportScreen;