// components/common/CustomAlert.js
import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const CustomAlert = ({ 
  visible, 
  title, 
  message, 
  type = 'info', // 'info', 'warning', 'error', 'success'
  isDarkMode,
  buttons = [],
  onClose
}) => {
  const getAlertConfig = () => {
    switch (type) {
      case 'warning':
        return {
          icon: 'warning-outline',
          iconColor: isDarkMode ? '#fbbf24' : '#f59e0b',
          iconBg: isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-50',
          borderColor: isDarkMode ? 'border-yellow-500/30' : 'border-yellow-200'
        };
      case 'error':
        return {
          icon: 'alert-circle-outline',
          iconColor: isDarkMode ? '#f87171' : '#ef4444',
          iconBg: isDarkMode ? 'bg-red-900/30' : 'bg-red-50',
          borderColor: isDarkMode ? 'border-red-500/30' : 'border-red-200'
        };
      case 'success':
        return {
          icon: 'checkmark-circle-outline',
          iconColor: isDarkMode ? '#4ade80' : '#22c55e',
          iconBg: isDarkMode ? 'bg-green-900/30' : 'bg-green-50',
          borderColor: isDarkMode ? 'border-green-500/30' : 'border-green-200'
        };
      default: // info
        return {
          icon: 'information-circle-outline',
          iconColor: isDarkMode ? '#60a5fa' : '#3b82f6',
          iconBg: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50',
          borderColor: isDarkMode ? 'border-blue-500/30' : 'border-blue-200'
        };
    }
  };

  const config = getAlertConfig();

  const defaultButtons = [
    {
      text: 'OK',
      style: 'default',
      onPress: onClose
    }
  ];

  const alertButtons = buttons.length > 0 ? buttons : defaultButtons;

  const getButtonStyle = (buttonStyle) => {
    switch (buttonStyle) {
      case 'destructive':
        return {
          bg: isDarkMode ? 'bg-red-900/30' : 'bg-red-50',
          text: isDarkMode ? 'text-red-400' : 'text-red-600',
          border: isDarkMode ? 'border-red-500/30' : 'border-red-200'
        };
      case 'cancel':
        return {
          bg: isDarkMode ? 'bg-gray-600' : 'bg-gray-100',
          text: isDarkMode ? 'text-gray-300' : 'text-gray-600',
          border: isDarkMode ? 'border-gray-500' : 'border-gray-200'
        };
      default:
        return {
          bg: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50',
          text: isDarkMode ? 'text-blue-400' : 'text-blue-600',
          border: isDarkMode ? 'border-blue-500/30' : 'border-blue-200'
        };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl w-full max-w-sm shadow-2xl border ${config.borderColor}`}>
          
          {/* Header with Icon */}
          <View className="items-center pt-8 pb-4">
            <View className={`p-4 rounded-full ${config.iconBg} mb-4`}>
              <Icon 
                name={config.icon} 
                size={32} 
                color={config.iconColor} 
              />
            </View>
            
            {title && (
              <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-900'} text-xl font-bold text-center mb-2`}>
                {title}
              </Text>
            )}
          </View>

          {/* Message */}
          {message && (
            <View className="px-6 pb-6">
              <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-base text-center leading-6`}>
                {message}
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View className={`border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
            {alertButtons.length === 1 ? (
              // Single button
              <TouchableOpacity
                className="py-4 px-6"
                onPress={alertButtons[0].onPress}
                activeOpacity={0.7}
              >
                <Text className={`${getButtonStyle(alertButtons[0].style).text} text-center font-semibold text-lg`}>
                  {alertButtons[0].text}
                </Text>
              </TouchableOpacity>
            ) : (
              // Multiple buttons
              <View className="flex-row">
                {alertButtons.map((button, index) => {
                  const buttonStyle = getButtonStyle(button.style);
                  const isLast = index === alertButtons.length - 1;
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      className={`flex-1 py-4 px-4 ${!isLast ? `border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}` : ''}`}
                      onPress={button.onPress}
                      activeOpacity={0.7}
                    >
                      <Text className={`${buttonStyle.text} text-center font-semibold text-base`}>
                        {button.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;