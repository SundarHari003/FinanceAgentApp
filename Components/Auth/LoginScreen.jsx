import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView
} from 'react-native';
import React, { useState, useEffect } from 'react';
import Icons from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
  interpolate,
  runOnJS,
  Easing,
  withDelay
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { getAgentuserData, loginAPi } from '../../redux/AuthSlice/authslice';
import { useToast } from '../../Context/ToastContext';

const { width, height } = Dimensions.get('window');

// Vector Icon component
const VectorIcon = ({ name, type = 'FontAwesome5', size = 20, color = '#000', style }) => {
  const IconComponent = type === 'MaterialIcons' ? MaterialIcons : Icons;
  return <IconComponent name={name} size={size} color={color} style={style} />;
};

const LoginScreen = () => {
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [loginloading, setloginloading] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState({
    email: false,
    password: false
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const navigation = useNavigation();

  // Reanimated shared values
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(100);
  const logoScaleAnim = useSharedValue(0.5);
  const formSlideAnim = useSharedValue(50);
  const buttonScaleAnim = useSharedValue(1);
  const pulseAnim = useSharedValue(1);

  // Background animations
  const floatingCard1 = useSharedValue(0);
  const floatingCard2 = useSharedValue(0);
  const floatingCard3 = useSharedValue(0);
  const gradientShift = useSharedValue(0);

  useEffect(() => {
    // Staggered entrance animations
    fadeAnim.value = withTiming(1, { duration: 800 });

    logoScaleAnim.value = withDelay(200,
      withSpring(1, { damping: 12, stiffness: 80 })
    );

    slideAnim.value = withDelay(400,
      withSpring(0, { damping: 15, stiffness: 100 })
    );

    formSlideAnim.value = withDelay(600,
      withSpring(0, { damping: 15, stiffness: 80 })
    );

    // Floating cards animation
    floatingCard1.value = withRepeat(
      withSequence(
        withTiming(10, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        withTiming(-10, { duration: 3000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    floatingCard2.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        withTiming(15, { duration: 4000, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    floatingCard3.value = withRepeat(
      withSequence(
        withTiming(8, { duration: 3500, easing: Easing.inOut(Easing.sin) }),
        withTiming(-8, { duration: 3500, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );

    // Gradient shift animation
    gradientShift.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );

    // Pulsing animation for loading
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      false
    );
  }, []);

  const handleLogin = async () => {
    setloginloading(true);
    const options = {
      username: email,
      password: password,
    }
    dispatch(loginAPi(options)).then((response) => {
      setloginloading(false)
      console.log(response, "response");
      
      if (response?.payload?.success) {
        showToast({
          message: 'Login successful!',
          type: 'success',
          duration: 3000,
          position: 'top'
        });
        setError({
          email: false,
          password: false
        });
        setEmail('');
        setPassword('');
        dispatch(getAgentuserData(response?.payload?.data?.user?.id))
        navigation.navigate("MainApp");
      }
      else {
        showToast({
          message: response.payload.error || 'Login failed. Please try again.',
          type: 'error',
          duration: 3000,
          position: 'top'
        });
        setError({
          email: true,
          password: true
        });
        setEmail('');
        setPassword('');
        return;
      }
    })
  };

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScaleAnim.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: formSlideAnim.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScaleAnim.value }],
  }));

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const floatingCard1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: floatingCard1.value }],
  }));

  const floatingCard2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: floatingCard2.value }],
  }));

  const floatingCard3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: floatingCard3.value }],
  }));

  const gradientAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(gradientShift.value, [0, 1], [0.1, 0.3]);
    return { opacity };
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 w-full"
    >
      <StatusBar barStyle="light-content" backgroundColor="#1a9c94" />

      {/* Enhanced Background with LinearGradient */}
      <LinearGradient
        colors={['#1a9c94', '#14b8a6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 w-full"
      >
        {/* Dynamic Background Elements */}
        <View className="absolute inset-0 w-full">
          {/* Floating financial cards */}
          <Animated.View
            className="absolute top-20 right-8 w-16 h-10 bg-white/10 rounded-lg border border-white/20"
            style={floatingCard1Style}
          />
          <Animated.View
            className="absolute top-40 left-6 w-12 h-8 bg-white/10 rounded-lg border border-white/20"
            style={floatingCard2Style}
          />
          <Animated.View
            className="absolute bottom-40 right-12 w-14 h-9 bg-white/10 rounded-lg border border-white/20"
            style={floatingCard3Style}
          />

          {/* Gradient overlay */}
          <Animated.View style={gradientAnimatedStyle} className="w-full">
            <LinearGradient
              colors={['rgba(15, 118, 110, 0.1)', 'transparent']}
              className="absolute inset-0 w-full"
            />
          </Animated.View>

          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={false}
            className="w-full"
          >
            <Animated.View
              className="flex-1 pt-16 pb-8 w-full"
              style={containerAnimatedStyle}
            >
              {/* Enhanced Logo Section */}
              <View className="items-center mb-8 w-full">
                <Animated.View
                  className="relative mb-6"
                  style={logoAnimatedStyle}
                >
                  {/* Logo background glow */}
                  <View className="absolute inset-0 w-24 h-24 rounded-full">
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                      className="w-full h-full rounded-full"
                    />
                  </View>
                  <LinearGradient
                    colors={['#ffffff', '#f8fafc']}
                    className="w-24 h-24 rounded-full items-center justify-center shadow-2xl elevation-12 border-4 border-white/30"
                  >
                    <Icons name="hand-holding-usd" size={36} color="#0f766e" />
                  </LinearGradient>
                </Animated.View>

                <Text className="text-white text-4xl font-bold tracking-wide">
                  Annam Finance
                </Text>
                <View className="flex-row items-center mt-2">
                  <View className="w-2 h-2 bg-white/60 rounded-full mr-2" />
                  <Text className="text-white/90 text-lg font-medium">Agent Portal</Text>
                  <View className="w-2 h-2 bg-white/60 rounded-full ml-2" />
                </View>
              </View>

              {/* Enhanced Login Form */}
              <Animated.View
                className="w-full px-4"
                style={formAnimatedStyle}
              >
                <View className="bg-white/95 backdrop-blur-lg p-8 rounded-3xl shadow-2xl elevation-20 border border-white/20 w-full">
                  {/* Header */}
                  <View className="text-center mb-8">
                    <Text className="text-3xl font-bold text-gray-800 mb-2">
                      Welcome Back
                    </Text>
                    <Text className="text-gray-600 text-base">
                      Sign in to access your dashboard
                    </Text>
                  </View>

                  {/* Form Fields */}
                  <View className="space-y-6 flex-col gap-y-4 w-full">
                    {/* Email Input with enhanced styling */}
                    <View className="w-full">
                      <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">
                        Email Address
                      </Text>
                      <View className="relative w-full">
                        <View className="absolute left-4 top-6 z-10">
                          <VectorIcon name="envelope" size={18} color={focusedInput === 'email' ? '#0f766e' : '#9CA3AF'} />
                        </View>
                        <TextInput
                          className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 ${focusedInput === 'email' ? 'border-teal-500 bg-teal-50/50' : 'border-gray-200'
                            } rounded-2xl text-gray-800 text-base transition-colors ${error.email ? 'border-red-500 bg-red-50/50' : ''}`}
                          placeholder="Enter your email address"
                          placeholderTextColor="#9CA3AF"
                          value={email}
                          onChangeText={setEmail}
                          onFocus={() => {
                            setFocusedInput('email')
                            setError({
                              ...error,
                              email: false
                            })
                          }}
                          onBlur={() => setFocusedInput(null)}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>

                    {/* Password Input with enhanced styling */}
                    <View className="w-full">
                      <Text className="text-gray-700 text-sm font-semibold mb-2 ml-1">
                        Password
                      </Text>
                      <View className="relative w-full">
                        <View className="absolute left-4 top-6 z-10">
                          <VectorIcon name="lock" size={18} color={focusedInput === 'password' ? '#0f766e' : '#9CA3AF'} />
                        </View>
                        <TextInput
                          className={`w-full pl-12 pr-14 py-4 bg-gray-50 border-2 ${focusedInput === 'password' ? 'border-teal-500 bg-teal-50/50' : 'border-gray-200'
                            } rounded-2xl text-gray-800 text-base transition-colors ${error.password ? 'border-red-500 bg-red-50/50' : ''}`}
                          placeholder="Enter your password"
                          placeholderTextColor="#9CA3AF"
                          value={password}
                          onChangeText={setPassword}
                          onFocus={() => {
                            setFocusedInput('password')
                            setError({
                              ...error,
                              password: false
                            })
                          }}
                          onBlur={() => setFocusedInput(null)}
                          secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                          onPress={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-[18px] p-1"
                        >
                          <VectorIcon
                            name={showPassword ? "visibility" : "visibility-off"}
                            type="MaterialIcons"
                            size={18}
                            color="#9CA3AF"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Forgot Password */}
                    <TouchableOpacity className="self-end">
                      <Text className="text-teal-600 text-sm font-semibold underline">
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>

                    {/* Enhanced Login Button */}
                    <Animated.View style={buttonAnimatedStyle} className="mt-2 w-full">
                      <TouchableOpacity
                        onPress={handleLogin}
                        disabled={!email || !password || loginloading}
                        className={`w-full rounded-2xl shadow-lg elevation-8 relative overflow-hidden ${(!email || !password) ? 'opacity-50' : ''}`}
                      >
                        <LinearGradient
                          colors={['#0f766e', '#14b8a6', '#0d9488']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          className="py-5 rounded-2xl w-full"
                        >
                          {/* Button glow effect */}
                          <LinearGradient
                            colors={['rgba(255, 255, 255, 0.1)', 'transparent']}
                            className="absolute inset-0 rounded-2xl w-full"
                          />

                          <View className="flex-row items-center justify-center relative z-10">
                            {loginloading && (
                              <Animated.View
                                className="mr-3"
                                style={loadingAnimatedStyle}
                              >
                                <VectorIcon name="refresh" type="MaterialIcons" size={20} color="white" />
                              </Animated.View>
                            )}
                            <Text className="text-white text-center font-bold text-lg tracking-wide">
                              {loginloading ? 'Signing In...' : 'Sign In to Dashboard'}
                            </Text>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animated.View>
                  </View>
                </View>

                {/* Enhanced Footer */}
                <View className="items-center mt-8 px-4 w-full">
                  <View className="flex-row items-center w-full">
                    <View className="flex-1 h-px bg-white/30" />
                    <Text className="mx-4 text-white/80 text-sm">Need Help?</Text>
                    <View className="flex-1 h-px bg-white/30" />
                  </View>

                  <TouchableOpacity className="mt-4 rounded-full border border-white/20 overflow-hidden">
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                      className="px-6 py-3"
                    >
                      <Text className="text-white text-sm font-semibold">
                        Contact Administrator
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <Text className="text-white/70 text-xs mt-4 text-center">
                    © 2025 Annam Finance. All rights reserved.
                  </Text>
                </View>
              </Animated.View>
            </Animated.View>
          </ScrollView>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;