import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useHideTabBar } from '../../hooks/useHideTabBar';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

// Helper function to format the timestamp to "H:MM AM/PM"
const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const ChatScreen = () => {
  const navigation = useNavigation();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi there, how can I help you today?", sender: 'agent', timestamp: new Date('2025-06-07T19:00:00') }, // 7:00 PM
    { id: 2, text: "I have a question about a customer's", sender: 'user', timestamp: new Date('2025-06-07T19:02:00') }, // 7:02 PM
  ]);

  const sendMessage = () => {
    if (message.trim()) {
      setMessages([...messages, { 
        id: messages.length + 1, 
        text: message, 
        sender: 'user', 
        timestamp: new Date() // Use current time for new messages
      }]);
      setMessage('');
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Chat Area */}
      <ScrollView className="flex-1 p-4">
        {messages.map((msg) => (
          <View key={msg.id} className={`flex-row ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
            {msg.sender === 'agent' && (
              <View className={`w-8 h-8 rounded-full ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
              } mr-2 items-center justify-center`}>
                <Icon 
                  name="person" 
                  size={20} 
                  color={isDarkMode ? '#9ca3af' : '#4B5563'} 
                />
              </View>
            )}
            <View
              className={`max-w-[70%] p-3 rounded-2xl ${
                msg.sender === 'user' 
                  ? 'bg-[#1a9c94] rounded-br-none' 
                  : isDarkMode 
                    ? 'bg-gray-800 rounded-bl-none' 
                    : 'bg-white rounded-bl-none'
              }`}
            >
              <Text className={
                msg.sender === 'user' 
                  ? 'text-white' 
                  : isDarkMode 
                    ? 'text-gray-100' 
                    : 'text-gray-800'
              }>
                {msg.text}
              </Text>
              <Text className={`text-xs mt-1 ${
                msg.sender === 'user' 
                  ? 'text-gray-200' 
                  : isDarkMode 
                    ? 'text-gray-400' 
                    : 'text-gray-500'
              }`}>
                {formatTime(msg.timestamp)}
              </Text>
            </View>
            {msg.sender === 'user' && (
              <View className={`w-8 h-8 rounded-full ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
              } ml-2 items-center justify-center`}>
                <Icon 
                  name="person" 
                  size={20} 
                  color={isDarkMode ? '#9ca3af' : '#4B5563'} 
                />
              </View>
            )}
            {msg.sender === 'agent' && (
              <Text className={`text-xs ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              } mt-1 ml-10`}>
                Agent
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Message Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className={`p-4 ${
          isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
        } border-t ${
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`}
      >
        <View className={`flex-row items-center ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-full p-2`}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Write a message"
            placeholderTextColor={isDarkMode ? '#9ca3af' : '#9ca3af'}
            className={`flex-1 px-4 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-800'
            }`}
          />
          <TouchableOpacity className="p-2">
            <Icon 
              name="attach" 
              size={24} 
              color={isDarkMode ? '#9ca3af' : '#4B5563'} 
            />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={sendMessage} 
            className="p-2 bg-[#1a9c94] rounded-full"
          >
            <Icon name="send" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;