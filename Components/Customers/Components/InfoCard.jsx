// components/CustomerDetails/InfoCard.js
import React from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const InfoCard = ({ title, data, isDarkMode }) => (
  <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 mb-5 shadow-sm`}>
    <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>{title}</Text>
    <View className="flex flex-col" style={{ gap: 12 }}>
      {data.map((item, index) => (
        <View
          key={index}
          className={`flex-row items-center p-3 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-2xl`}
        >
          <View className={`${isDarkMode ? 'bg-teal-900/30' : 'bg-primary-100/10'} p-3 rounded-xl`}>
            <Icon name={item.icon} size={20} color={isDarkMode ? '#2dd4bf' : '#2ec4b6'} />
          </View>
          <View className="ml-3 flex-1">
            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.label}</Text>
            <Text className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{item.value}</Text>
          </View>
        </View>
      ))}
    </View>
  </View>
);

export default InfoCard;