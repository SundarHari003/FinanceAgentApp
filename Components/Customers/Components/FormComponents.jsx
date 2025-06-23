import React, { memo, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export const FormSection = memo(({ title, children, isDarkMode }) => (
  <View className="mb-6">
    <Text className={`text-lg font-bold mb-4 ${
      isDarkMode ? 'text-gray-100' : 'text-gray-800'
    }`}>
      {title}
    </Text>
    <View className="flex-col gap-4">
      {children}
    </View>
  </View>
));

export const FormInput = memo(({ 
  label, 
  icon, 
  error, 
  isDarkMode, 
  editable = true,
  onChangeText,
  value,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  placeholder = '',
  maxLength,
  autoCapitalize = 'sentences',
  ...props 
}) => {
  // Memoize the change handler to prevent unnecessary re-renders
  const handleTextChange = useCallback((text) => {
    if (onChangeText && editable) {
      onChangeText(text);
    }
  }, [onChangeText, editable]);

  // Determine input style based on state
  const getInputStyle = useCallback(() => {
    let baseStyle = 'flex-row items-center border rounded-xl pl-4 ';
    
    if (multiline) {
      baseStyle += 'py-3 ';
    } else {
      baseStyle += 'py-4 ';
    }

    if (!editable) {
      baseStyle += 'opacity-60 ';
    }

    if (isDarkMode) {
      if (error) {
        baseStyle += 'border-red-500/50 bg-red-500/10';
      } else {
        baseStyle += 'border-gray-700 bg-gray-600/50';
      }
    } else {
      if (error) {
        baseStyle += 'border-red-500 bg-red-50';
      } else {
        baseStyle += 'border-gray-200 bg-gray-50';
      }
    }

    return baseStyle;
  }, [isDarkMode, error, editable, multiline]);

  // Determine text color
  const getTextColor = useCallback(() => {
    if (isDarkMode) {
      return error ? 'text-red-400' : 'text-gray-100';
    } else {
      return error ? 'text-red-600' : 'text-gray-800';
    }
  }, [isDarkMode, error]);

  // Determine icon color
  const getIconColor = useCallback(() => {
    if (error) {
      return isDarkMode ? '#f87171' : '#ef4444';
    }
    if (!editable) {
      return isDarkMode ? '#6b7280' : '#9ca3af';
    }
    return '#2ec4b6';
  }, [error, isDarkMode, editable]);

  return (
    <View>
      <Text className={`text-sm mb-2 font-medium ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {label}
      </Text>
      
      <View className={getInputStyle()}>
        <Icon
          name={icon}
          size={20}
          color={getIconColor()}
          style={{ marginRight: 12 }}
        />
        
        <TextInput
          value={value}
          onChangeText={handleTextChange}
          editable={editable}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          placeholder={placeholder}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize}
          className={`flex-1 ${getTextColor()} text-base`}
          placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
          style={{
            minHeight: multiline ? 80 : 20,
            textAlignVertical: multiline ? 'top' : 'center',
            paddingTop: multiline ? 8 : 0,
            paddingBottom: multiline ? 8 : 0,
            paddingRight: 16,
          }}
          {...props}
        />
        
        {!editable && (
          <Icon
            name="lock-closed-outline"
            size={16}
            color={isDarkMode ? '#6b7280' : '#9ca3af'}
            style={{ marginRight: 12 }}
          />
        )}
      </View>
      
      {error && (
        <Animated.View 
          className="mt-2"
          style={{ opacity: 1 }}
        >
          <View className="flex-row items-center">
            <Icon
              name="alert-circle-outline"
              size={14}
              color={isDarkMode ? '#f87171' : '#ef4444'}
              style={{ marginRight: 6 }}
            />
            <Text className={`text-xs ${
              isDarkMode ? 'text-red-400' : 'text-red-500'
            }`}>
              {error}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
});

export const DocumentUploadButton = memo(({ 
  icon, 
  label, 
  selected, 
  onPress, 
  isDarkMode,
  subtitle 
}) => {
  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    }
  }, [onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      className={`flex-row items-center p-4 rounded-xl mb-3 border ${
        selected 
          ? isDarkMode 
            ? 'bg-teal-900/20 border-teal-500/30' 
            : 'bg-teal-50 border-teal-200'
          : isDarkMode 
            ? 'bg-gray-700/50 border-gray-600' 
            : 'bg-gray-50 border-gray-200'
      }`}
      activeOpacity={0.7}
    >
      <View className={`w-12 h-12 rounded-full items-center justify-center ${
        selected 
          ? 'bg-teal-500' 
          : isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
      }`}>
        <Icon
          name={selected ? "checkmark-circle" : icon}
          size={22}
          color={selected ? 'white' : isDarkMode ? '#9ca3af' : '#6b7280'}
        />
      </View>
      
      <View className="flex-1 ml-4">
        <Text className={`font-semibold text-base ${
          selected 
            ? 'text-teal-600' 
            : isDarkMode ? 'text-gray-200' : 'text-gray-800'
        }`}>
          {label}
        </Text>
        <Text className={`text-sm mt-1 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {subtitle || (selected ? 'Document uploaded successfully' : 'Tap to upload document')}
        </Text>
      </View>
      
      <View className={`px-3 py-1 rounded-full ${
        selected 
          ? 'bg-teal-100' 
          : isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
      }`}>
        <Text className={`text-xs font-medium ${
          selected 
            ? 'text-teal-700' 
            : isDarkMode ? 'text-gray-300' : 'text-gray-600'
        }`}>
          {selected ? 'Uploaded' : 'Upload'}
        </Text>
      </View>
    </TouchableOpacity>
  );
});

// Enhanced dropdown component for better UX
export const FormDropdown = memo(({ 
  label, 
  icon, 
  value, 
  onPress, 
  displayValue, 
  error, 
  isDarkMode, 
  editable = true,
  placeholder = 'Select option'
}) => {
  const handlePress = useCallback(() => {
    if (onPress && editable) {
      onPress();
    }
  }, [onPress, editable]);

  return (
    <View>
      <Text className={`text-sm mb-2 font-medium ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        {label}
      </Text>
      
      <TouchableOpacity
        onPress={handlePress}
        disabled={!editable}
        className={`flex-row items-center border rounded-xl pl-4 py-4 ${
          isDarkMode 
            ? error 
              ? 'border-red-500/50 bg-red-500/10' 
              : 'border-gray-700 bg-gray-600/50'
            : error 
              ? 'border-red-500 bg-red-50'
              : 'border-gray-200 bg-gray-50'
        } ${!editable ? 'opacity-60' : ''}`}
        activeOpacity={0.7}
      >
        <Icon
          name={icon}
          size={20}
          color={error 
            ? isDarkMode ? '#f87171' : '#ef4444'
            : !editable
              ? isDarkMode ? '#6b7280' : '#9ca3af'
              : '#2ec4b6'
          }
          style={{ marginRight: 12 }}
        />
        
        <Text className={`flex-1 text-base ${
          value
            ? isDarkMode ? 'text-gray-100' : 'text-gray-800'
            : isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {displayValue || placeholder}
        </Text>
        
        <Icon 
          name={editable ? "chevron-down" : "lock-closed-outline"} 
          size={editable ? 20 : 16} 
          color={isDarkMode ? '#6b7280' : '#9ca3af'} 
          style={{ marginRight: 12 }} 
        />
      </TouchableOpacity>
      
      {error && (
        <Animated.View 
          className="mt-2"
          style={{ opacity: 1 }}
        >
          <View className="flex-row items-center">
            <Icon
              name="alert-circle-outline"
              size={14}
              color={isDarkMode ? '#f87171' : '#ef4444'}
              style={{ marginRight: 6 }}
            />
            <Text className={`text-xs ${
              isDarkMode ? 'text-red-400' : 'text-red-500'
            }`}>
              {error}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
});

// Add display names for better debugging
FormSection.displayName = 'FormSection';
FormInput.displayName = 'FormInput';
DocumentUploadButton.displayName = 'DocumentUploadButton';
FormDropdown.displayName = 'FormDropdown';