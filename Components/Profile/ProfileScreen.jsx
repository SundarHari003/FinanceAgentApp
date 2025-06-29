import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../redux/features/themeSlice';
import { logoutAPI } from '../../redux/AuthSlice/authslice';
import { persistor } from '../../redux/store';
import { useToast } from '../../Context/ToastContext';


const SettingToggle = ({ isDarkMode, label, value, onToggle, icon }) => (
  <View className={`flex-row items-center justify-between ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl mb-3`}>
    <View className="flex-row items-center flex-1">
      <View className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-2 rounded-lg`}>
        <Icon name={icon} size={22} color="#2ec4b6" />
      </View>
      <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} font-medium ml-3`}>
        {label}
      </Text>
    </View>
    <Switch
      value={value}
      onValueChange={onToggle}
      trackColor={{ false: '#e5e7eb', true: '#2ec4b6' }}
      thumbColor={value ? '#fff' : '#fff'}
    />
  </View>
);

const MenuLink = ({ icon, label, onPress, badgeCount }) => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center ${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-xl mb-3`}
    >
      <View className="bg-primary-100/10 p-2 rounded-lg">
        <Icon name={icon} size={22} color="#2ec4b6" />
      </View>
      <Text className={`flex-1 ${isDarkMode ? 'text-white' : 'text-gray-800'} font-medium ml-3`}>
        {label}
      </Text>
      {badgeCount ? (
        <View className="bg-red-100 px-2 py-1 rounded-full">
          <Text className="text-red-600 text-xs font-medium">{badgeCount}</Text>
        </View>
      ) : (
        <Icon name="chevron-right" size={24} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
      )}
    </TouchableOpacity>
  );
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const { user } = useSelector((state) => state.auth)
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const [notifications, setNotifications] = useState(false);
  const [biometricLock, setBiometricLock] = useState(false);
  const userData = user?.data;
  const handleLogout = async () => {
    try {
      await dispatch(logoutAPI()).unwrap(); // Unwrap to handle fulfilled/rejected
      // On success, dispatch RESET_STATE and purge persisted state
      dispatch({ type: 'RESET_STATE' });
      persistor.purge(); // Clear persisted state
      navigation.navigate('Login'); // Navigate to login screen
    } catch (error) {
      console.error('Logout failed:', error);
      showToast({ message: 'Logout failed', type: 'error', duration: 3000, position: 'top' });
    }
  };
  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Profile Header */}
      <View className="bg-primary-100 pt-12 pb-4 px-4 rounded-b-[32px]">
        <View className="flex-row items-center mb-6">
          <Image
            source={require('../../assests/agent-avatar.png')}
            className="w-20 h-20 rounded-full bg-white border-4 border-white/30"
          />
          <View className="ml-4 flex-1">
            <Text className="text-white text-xl font-bold">{userData?.full_name}</Text>
            <View className="bg-white/20 px-3 py-1 rounded-full mt-2 self-start">
              <Text className="text-white text-sm">@{userData?.username}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView showsVerticalScrollIndicator={false} className="px-4 ">
        <View >
          {/* Profile Management */}
          <View className="mb-6 mt-4">
            <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
              Profile Management
            </Text>
            <View className={`${isDarkMode ? 'bg-gray-800/70' : 'bg-white/70'} backdrop-blur-lg rounded-2xl p-4`}>
              <MenuLink
                icon="account-circle"
                label="Edit Profile"
                onPress={() => navigation.navigate('EditProfile')}
              />
              <MenuLink
                icon="verified-user"
                label="Authentication Settings"
                onPress={() => navigation.navigate('AuthSettings')}
              />
              <MenuLink
                icon="language"
                label="Language"
                onPress={() => navigation.navigate('LanguageSettings')}
              />
            </View>
          </View>

          {/* Support & Help */}
          <View className="mb-6">
            <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
              Support & Help
            </Text>
            <View className={`${isDarkMode ? 'bg-gray-800/70' : 'bg-white/70'} backdrop-blur-lg rounded-2xl p-4`}>
              <MenuLink
                icon="headset-mic"
                label="Help Center"
                onPress={() => navigation.navigate('HelpScreen')}
              />
              <MenuLink
                icon="chat"
                label="Contact Support"
                onPress={() => navigation.navigate('Support')}
                badgeCount="1"
              />
              <MenuLink
                icon="description"
                label="Terms & Privacy"
                onPress={() => navigation.navigate('Terms')}
              />
              <MenuLink
                icon="info"
                label="About App"
                onPress={() => navigation.navigate('About')}
              />
            </View>
          </View>

          {/* App Settings */}
          <View className="mb-6">
            <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4`}>
              App Settings
            </Text>
            <View className={`${isDarkMode ? 'bg-gray-800/70' : 'bg-white/70'} backdrop-blur-lg rounded-2xl p-4`}>
              <SettingToggle
                label="Dark Mode"
                value={isDarkMode}
                onToggle={() => dispatch(toggleTheme())}
                icon="dark-mode"
                isDarkMode={isDarkMode}
              />
              <SettingToggle
                label="Push Notifications"
                value={notifications}
                onToggle={setNotifications}
                icon="notifications"
                isDarkMode={isDarkMode}
              />
              <SettingToggle
                label="Biometric Lock"
                value={biometricLock}
                onToggle={setBiometricLock}
                icon="fingerprint"
                isDarkMode={isDarkMode}
              />

              <TouchableOpacity
                className={`${isDarkMode && " bg-red-600"} flex-row items-center justify-center mt-4 py-3.5 rounded-xl border ${isDarkMode ? "border-red-500 " : " border-red-200"}`}
                onPress={() => { handleLogout() }}
              >
                <Icon name="logout" size={20} color={isDarkMode ? "#fff" : "#ef4444"} />
                <Text className={`${isDarkMode ? " text-white" : "text-red-500"} font-medium ml-2`}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;