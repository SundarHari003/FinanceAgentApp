// components/CustomerDetails/DocumentCard.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const DocumentCard = ({ document, isDarkMode, onPreview }) => (
  <View className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'} rounded-2xl shadow-sm border`}>
    <View className="p-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View className={`p-3 rounded-xl ${
            isDarkMode 
              ? document.status === 'Verified' ? 'bg-green-900/30' 
              : document.status === 'Pending' ? 'bg-yellow-900/30'
              : 'bg-red-900/30'
              : document.status === 'Verified' ? 'bg-green-50'
              : document.status === 'Pending' ? 'bg-yellow-50'
              : 'bg-red-50'
          }`}>
            <Icon
              name={document.type || 'document-outline'}
              size={24}
              color={
                isDarkMode
                  ? document.status === 'Verified' ? '#4ade80'
                  : document.status === 'Pending' ? '#facc15'
                  : '#f87171'
                  : document.status === 'Verified' ? '#16a34a'
                  : document.status === 'Pending' ? '#ca8a04'
                  : '#dc2626'
              }
            />
          </View>
          <View className="ml-3 flex-1">
            <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold text-base`}>{document.name}</Text>
            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-0.5`}>
              Last updated: {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View className={`px-3 py-1 rounded-full ${
          document.status === 'Verified' ? 'bg-green-100' :
          document.status === 'Pending' ? 'bg-yellow-100' :
          'bg-red-100'
        }`}>
          <Text className={`text-xs font-medium ${
            document.status === 'Verified' ? 'text-green-700' :
            document.status === 'Pending' ? 'text-yellow-700' :
            'text-red-700'
          }`}>
            {document.status.toUpperCase()}
          </Text>
        </View>
      </View>

      {document.reason && (
        <View className="bg-red-50 p-3 rounded-xl mb-3">
          <Text className="text-red-600 text-sm">
            <Icon name="alert-circle-outline" size={16} color="#dc2626" /> {document.reason}
          </Text>
        </View>
      )}

      <View className={`flex-row gap-2 mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-2 rounded-xl ${isDarkMode ? 'bg-gray-600' : 'bg-gray-50'}`}
          onPress={onPreview}
        >
          <Icon name="eye-outline" size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
          <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium ml-2`}>Preview</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 flex-row items-center justify-center py-2 rounded-xl ${isDarkMode ? 'bg-teal-900/30' : 'bg-primary-100/10'}`}
          onPress={() => console.log('Download document')}
        >
          <Icon name="download-outline" size={18} color={isDarkMode ? '#2dd4bf' : '#2ec4b6'} />
          <Text className={`${isDarkMode ? 'text-teal-400' : 'text-primary-100'} font-medium ml-2`}>Download</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default DocumentCard;