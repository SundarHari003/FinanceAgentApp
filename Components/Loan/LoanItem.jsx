
import React, { useEffect, useState, useCallback, memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { getsingleloanapi } from '../../redux/Slices/loanSlice';
const LoanItem = memo(({ item }) => {
    const navigation = useNavigation();
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const offset = useSharedValue(50);
    const dispatch = useDispatch();
    useEffect(() => {
        offset.value = withSpring(0, { damping: 15, stiffness: 100 });
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: offset.value }],
        opacity: 1 - offset.value / 50,
    }));

    const isActive = item?.status === 'ACTIVE';
    const isCompleted = item?.status === 'COMPLETED';

    // Calculate progress for active loans
    // const startDate = new Date(item?.start_date);
    // const endDate = new Date(item?.end_date);
    // const currentDate = new Date();
    // const totalDuration = endDate?.getTime() - startDate?.getTime();
    // const elapsed = currentDate?.getTime() - startDate?.getTime();
    // const progress = Math.min(Math.max(elapsed / totalDuration, 0), 1);
  
    
    // Status colors and text
    const getStatusColor = () => {
        if (isActive) return 'text-green-600';
        if (isCompleted) return 'text-blue-600';
        return 'text-gray-600';
    };

    const getStatusBg = () => {
        if (isActive) return 'bg-green-500/10 border-green-200';
        if (isCompleted) return 'bg-blue-500/10 border-blue-200';
        return 'bg-gray-500/10 border-gray-200';
    };

    const handlePress = () => {
        // Navigate to loan details
        navigation.navigate('Loandetails', { loanId: item?.id });
        dispatch(getsingleloanapi(item?.id));
    };

    return (
        <TouchableOpacity onPress={handlePress}>
            <Animated.View
                style={animatedStyle}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl mb-4 shadow-sm overflow-hidden`}
            >
                {/* Header with Loan Info */}
                <View className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                    <View className="flex-row justify-between items-start mb-3">
                        <View className={`flex-1`}>
                            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Loan ID
                            </Text>
                            <Text className={`text-base font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mt-1`}>
                                {item?.id}
                            </Text>
                        </View>
                        <View className="items-end">
                            <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Total Amount
                            </Text>
                            <Text className="text-lg font-bold text-primary-100 mt-1">
                                {`₹${item?.total_repayment_amount?.toLocaleString()}`}
                            </Text>
                        </View>
                    </View>

                    {/* Progress Bar for Active Loans */}
                    {/* {isActive && (
                        <View className="mb-3">
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    Loan Progress
                                </Text>
                                <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {Math.round(progress * 100)}%
                                </Text>
                            </View>
                            <View className={`h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full overflow-hidden`}>
                                <View
                                    className="h-full bg-primary-100 rounded-full"
                                    style={{ width: `${progress * 100}%` }}
                                />
                            </View>
                        </View>
                    )} */}
                </View>

                {/* Customer Info */}
                <View className="p-4">
                    <View className="flex-row items-center mb-3">
                        <View className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} items-center justify-center`}>
                            <Icon name="person" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-900'} font-semibold text-base`}>
                                {item?.customer?.name}
                            </Text>
                            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                                {item?.customer?.phone_number} • {item?.customer?.city}
                            </Text>
                        </View>
                        <View className={`px-3 py-1 rounded-full border ${getStatusBg()}`}>
                            <Text className={`text-xs font-medium ${getStatusColor()}`}>
                                {item?.status}
                            </Text>
                        </View>
                    </View>

                    {/* Details Grid */}
                    <View className="flex-row justify-between mb-4">
                        <View className="flex-1">
                            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mb-1`}>Interest Rate</Text>
                            <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold`}>
                                {item?.interest_rate}%
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mb-1`}>Tenure</Text>
                            <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold`}>
                                {item?.payment_frequency === 'WEEKLY' ? `${item?.weeks} Weeks` : `${item?.tenure_months} Months`}
                            </Text>
                        </View>
                        <View className="flex-1">
                            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs mb-1`}>Frequency</Text>
                            <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold text-xs`}>
                                {item?.payment_frequency}
                            </Text>
                        </View>
                    </View>

                    {/* Bottom Row */}
                    <View className={`flex-row justify-between items-center ${isDarkMode ? 'bg-gray-700' : "bg-gray-50"} p-4 rounded-lg`}>
                        <View className="flex-row items-center">
                            <Icon
                                name={isActive ? "schedule" : isCompleted ? "check-circle" : "info"}
                                size={16}
                                color={isDarkMode ? '#9ca3af' : '#6b7280'}
                            />
                            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm ml-2`}>
                                {isActive ? `₹${item?.installment_amount?.toLocaleString()} / ${item?.payment_frequency?.toLowerCase()}`
                                    : isCompleted ? `Completed ${new Date(item?.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                                        : 'View Details'}
                            </Text>
                        </View>
                        <TouchableOpacity className="flex-row items-center">
                            <Text className={`mr-1 text-sm font-medium ${isActive ? 'text-primary-100' : isCompleted ? 'text-blue-600' : 'text-gray-600'}`}>
                                View Details
                            </Text>
                            <Icon
                                name="chevron-right"
                                size={20}
                                color={isActive ? '#2ec4b6' : isCompleted ? '#2563eb' : '#6b7280'}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
});
export default LoanItem;