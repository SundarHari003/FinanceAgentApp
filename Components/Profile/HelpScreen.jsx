import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useHideTabBar } from '../../hooks/useHideTabBar';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

const HelpScreen = () => {
    useHideTabBar(['HelpScreen', 'SupportScreen', 'ChatScreen']);
    const navigation = useNavigation();
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    const sections = [
      {
        title: 'CONTACT US',
        items: [
          { icon: 'chatbubble-outline', text: 'Chat with us', onPress: () => navigation.navigate('SupportScreen') },
          { icon: 'call-outline', text: 'Call us', onPress: () => {} }
        ]
      },
      {
        title: 'REPORT AN ISSUE',
        items: [
          { icon: 'alert-circle-outline', text: "Report any issues you're experiencing", onPress: () => {} }
        ]
      },
      {
        title: 'FEEDBACK',
        items: [
          { icon: 'megaphone-outline', text: 'Share your thoughts and suggestions', onPress: () => {} }
        ]
      }
    ];

    return (
      <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        {sections.map((section, index) => (
          <View 
            key={section.title} 
            className={`p-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${
              index !== sections.length - 1 ? 'mb-2' : ''
            }`}
          >
            <Text className={`text-xs font-bold ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            } uppercase mb-3 tracking-wider`}>
              {section.title}
            </Text>
            
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity 
                key={itemIndex}
                className={`flex-row items-center p-3 ${
                  isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                } rounded-lg ${
                  itemIndex !== section.items.length - 1 ? 'mb-2' : ''
                }`}
                onPress={item.onPress}
              >
                <Icon 
                  name={item.icon} 
                  size={20} 
                  color={isDarkMode ? '#9ca3af' : '#4B5563'} 
                  className="mr-3" 
                />
                <Text className={`${
                  isDarkMode ? 'text-gray-100' : 'text-gray-800'
                } text-base`}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </SafeAreaView>
    );
};

export default HelpScreen;