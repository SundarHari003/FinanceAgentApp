// components/CustomerDetails/DetailRow.js
import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const DetailRow = ({ label, value, iconName, iconColor = '#6b7280', index, isDarkMode }) => (
  <View className={`flex-row items-center justify-between py-3 px-4 ${
    index % 2 === 1 
      ? isDarkMode ? 'bg-gray-800' : 'bg-gray-50' 
      : isDarkMode ? 'bg-gray-700' : 'bg-white'
  } border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} last:border-b-0 -mx-4`}>
    <View className="flex-row items-center">
      {iconName && <Icon name={iconName} size={20} color={iconColor} className="mr-3" />}
      <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-base`}>{label}</Text>
    </View>
    <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold text-base`}>{value}</Text>
  </View>
);

export default DetailRow;