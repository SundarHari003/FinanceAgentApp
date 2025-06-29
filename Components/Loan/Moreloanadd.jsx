import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Animated,
    PanResponder,
    Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import CalendarPicker from 'react-native-calendar-picker';
import { getallcustomer, getsingleCustomerdetails } from '../../redux/Slices/customerSlice';
import { useToast } from '../../Context/ToastContext';
import { calculateloanrepayments, createLoanforcustomer } from '../../redux/Slices/loanSlice';
import { useHideTabBar } from '../../hooks/useHideTabBar';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');


const Moreloanadd = () => {
    useHideTabBar(['addloanformultiplecustomer']);
    const navigation = useNavigation();
    const route = useRoute();
    const { showToast } = useToast();
    const dispatch = useDispatch();
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);

    const { CustomerByagent, customerError, hasMorecutomer, isloadingcustomer } = useSelector((state) => state.customer);
    const { isLoadingLoan, newError, CalualteRepaymentData, calculating } = useSelector((state) => state.loanstore);

    const routeCustomerId = route.params?.id;
    const routeCustomername = route.params?.name;
    const [formData, setFormData] = useState({
        customer_id: routeCustomerId || '',
        principal_amount: '',
        interest_rate: '',
        payment_frequency: 'WEEKLY',
        calculation_type: routeCustomerId ? 'FIXED_WEEKS' : 'FIXED_WEEKS',
        duration: '',
        start_date: ''
    });

    const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
    const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [pageNum, setPageNum] = useState(1);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [showDurationDropdown, setShowDurationDropdown] = useState(false);
    const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const backdropOpacity = useRef(new Animated.Value(0)).current;

    const monthOptions = [
        { label: '24 Months', value: '24' },
        { label: '42 Months', value: '42' },
    ];

    const frequencyOptions = [
        {
            label: 'Weekly',
            value: 'WEEKLY',
            calculation_type: 'FIXED_WEEKS',
            durationLabel: 'Weeks'
        },
        {
            label: 'Monthly',
            value: 'MONTHLY',
            calculation_type: 'FIXED_MONTHS',
            durationLabel: 'Months'
        }
    ];


    const openBottomSheet = () => {
        setBottomSheetVisible(true);
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closeBottomSheet = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(backdropOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setBottomSheetVisible(false);
        });
    };
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gestureState) => {
            return gestureState.dy > 0 && gestureState.dy > Math.abs(gestureState.dx);
        },
        onPanResponderMove: (_, gestureState) => {
            if (gestureState.dy > 0) {
                slideAnim.setValue(gestureState.dy);
            }
        },
        onPanResponderRelease: (_, gestureState) => {
            if (gestureState.dy > 100) {
                closeBottomSheet();
            } else {
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            }
        },
    });


    const selectedCustomer = CustomerByagent.find(c => c.id === formData.customer_id);
    const selectedFrequency = frequencyOptions.find(f => f.value === formData.payment_frequency);

    const fetchCustomer = useCallback(async (page = 1, isRefresh = false, isLoadMore = false) => {
        try {
            if (isLoadMore) {
                setIsLoadingMore(true);
            }
            const queryparam = { page, search: searchQuery };
            await dispatch(getallcustomer(queryparam));

            if (isRefresh) {
                setRefreshing(false);
            }
            if (isLoadMore) {
                setIsLoadingMore(false);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            if (isRefresh) {
                setRefreshing(false);
            }
            if (isLoadMore) {
                setIsLoadingMore(false);
            }
        }
    }, [dispatch, searchQuery]);

    useEffect(() => {
        if (!routeCustomerId) {
            fetchCustomer(1);
        }
    }, [routeCustomerId, fetchCustomer]);

    useEffect(() => {
        if (routeCustomerId) {
            setFormData(prev => ({
                ...prev,
                customer_id: routeCustomerId,
                calculation_type: 'FIXED_WEEKS'
            }));
        }
    }, [routeCustomerId]);

    const handleFrequencyChange = (frequency) => {
        setFormData(prev => ({
            ...prev,
            payment_frequency: frequency.value,
            calculation_type: frequency.calculation_type,
            duration: ''
        }));
        setShowFrequencyDropdown(false);
    };

    const handleDateChange = (date) => {
        setFormData(prev => ({
            ...prev,
            start_date: date.toISOString().split('T')[0]
        }));
        setShowDatePicker(false);
    };

    const getMinDate = () => {
        const today = new Date();
        return new Date(today.getFullYear(), today.getMonth() + 1, 1);
    };

    const generatePayload = () => {
        const payload = {
            customer_id: formData.customer_id,
            principal_amount: parseFloat(formData.principal_amount),
            interest_rate: parseFloat(formData.interest_rate),
            payment_frequency: formData.payment_frequency,
            calculation_type: formData.calculation_type,
            start_date: formData.start_date
        };

        if (formData.payment_frequency === 'WEEKLY') {
            payload.weeks = parseInt(formData.duration);
        } else {
            payload.months = parseInt(formData.duration);
        }

        return payload;
    };

    const handleSubmit = async () => {
        if (!formData.principal_amount || !formData.duration || !formData.interest_rate) {
            showToast({
                message: 'Please fill all required fields',
                type: 'error',
                duration: 3000,
                position: 'top'
            });
            return;
        }

        try {
            const payload = generatePayload();
            const response = await dispatch(createLoanforcustomer(payload)).unwrap();

            if (response.success) {
                showToast({
                    message: 'Loan created Successfully!',
                    type: 'success',
                    duration: 3000,
                    position: 'top'
                });
                dispatch(getsingleCustomerdetails(formData.customer_id));
                navigation.goBack();
            }
        } catch (error) {
            showToast({
                message: error?.message || "Failed to create loan",
                type: 'error',
                duration: 3000,
                position: 'top'
            });
        }
    };

    const loadMoreCustomers = () => {
        if (hasMorecutomer && !isLoadingMore && !isloadingcustomer) {
            const nextPage = pageNum + 1;
            setPageNum(nextPage);
            fetchCustomer(nextPage, false, true);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setPageNum(1);
        setSearchQuery('');
        fetchCustomer(1, true);
    };

    const handleCalculateLoandrepayment = async () => {
        if (!formData.principal_amount || !formData.duration || !formData.interest_rate || !formData.start_date) {
            showToast({
                message: 'Please fill all required fields',
                type: 'error',
                duration: 3000,
                position: 'top'
            });
            return;
        }
        // Show the sheet immediately while loading

        try {
            const keyTenrure = formData.payment_frequency === 'WEEKLY' ? 'weeks' : 'months';
            const payload = {
                principal_amount: parseFloat(formData.principal_amount),
                customer_id: routeCustomerId || selectedCustomer?.id,
                interest_rate: parseFloat(formData.interest_rate),
                payment_frequency: formData.payment_frequency,
                calculation_type: formData.payment_frequency === "WEEKLY" ? "FIXED_WEEKS" : "FIXED_MONTHS",
                [keyTenrure]: parseInt(formData.duration),
                start_date: formData.start_date
            };

            dispatch(calculateloanrepayments(payload)).then((response) => {
                if (response?.payload?.success) {
                    openBottomSheet();
                }
                else {
                    showToast({
                        message: response?.payload?.message || "Failed to calculate loan repayment",
                        type: 'error',
                        duration: 3000,
                        position: 'top'
                    });
                }
            })
        } catch (error) {
            showToast({
                message: error?.message || "Failed to calculate loan repayment",
                type: 'error',
                duration: 3000,
                position: 'top'
            });
        }
    };

    const renderDatePicker = () => (
        <Modal
            visible={showDatePicker}
            transparent
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
        >
            <View className="flex-1 justify-center bg-black/50 px-4">
                <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 max-h-[80%]`}>
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                            Select Start Date
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                        >
                            <Icon name="close" size={20} color={isDarkMode ? '#fff' : '#1f2937'} />
                        </TouchableOpacity>
                    </View>

                    <CalendarPicker
                        onDateChange={handleDateChange}
                        minDate={getMinDate()}
                        selectedDayColor={isDarkMode ? '#2dd4bf' : '#0f766e'}
                        selectedDayTextColor={isDarkMode ? '#ffffff' : '#ffffff'}
                        textStyle={{
                            color: isDarkMode ? '#ffffff' : '#1f2937',
                            fontSize: 16,
                        }}
                        todayBackgroundColor={isDarkMode ? '#4b5563' : '#e5e7eb'}
                        todayTextStyle={{ color: isDarkMode ? '#ffffff' : '#1f2937' }}
                        disabledDatesTextStyle={{ color: isDarkMode ? '#6b7280' : '#d1d5db' }}
                        backgroundColor={isDarkMode ? '#1f2937' : '#ffffff'}
                        previousComponent={
                            <Icon name="chevron-back" size={20} color={isDarkMode ? '#fff' : '#1f2937'} />
                        }
                        nextComponent={
                            <Icon name="chevron-forward" size={20} color={isDarkMode ? '#fff' : '#1f2937'} />
                        }
                    />

                    <View className={`mt-4 p-3 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                        <Text className={`text-sm text-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                            You can only select dates from next month onwards
                        </Text>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderCustomerDropdown = () => (
        <Modal
            visible={showCustomerDropdown}
            transparent
            animationType="fade"
            onRequestClose={() => setShowCustomerDropdown(false)}
        >
            <TouchableOpacity
                className="flex-1 bg-black/50"
                activeOpacity={1}
                onPress={() => setShowCustomerDropdown(false)}
            >
                <View className="flex-1 justify-center px-4">
                    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4 max-h-[80%]`}>
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                Select Customer
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowCustomerDropdown(false)}
                                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                            >
                                <Icon name="close" size={20} color={isDarkMode ? '#fff' : '#1f2937'} />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-4">
                            <TextInput
                                className={`border-2 rounded-2xl p-3 text-lg ${isDarkMode
                                    ? 'bg-gray-700/50 border-gray-600 text-gray-100'
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                                    }`}
                                placeholder="Search by name or ID"
                                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        {customerError && (
                            <Text className={`text-center text-sm mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'
                                }`}>
                                Error loading customers
                            </Text>
                        )}

                        <FlatList
                            data={CustomerByagent}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`p-4 rounded-xl mb-2 ${formData.customer_id === item.id
                                        ? isDarkMode ? 'bg-teal-900/50' : 'bg-teal-50'
                                        : isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                                        }`}
                                    onPress={() => {
                                        setFormData(prev => ({ ...prev, customer_id: item.id }));
                                        setShowCustomerDropdown(false);
                                    }}
                                >
                                    <Text className={`font-medium ${formData.customer_id === item.id
                                        ? isDarkMode ? 'text-teal-400' : 'text-teal-700'
                                        : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        {item.id} - {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={() => (
                                <Text className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                    No customers found
                                </Text>
                            )}
                            ListFooterComponent={() => (
                                isLoadingMore && (
                                    <View className="py-4">
                                        <ActivityIndicator
                                            size="small"
                                            color={isDarkMode ? '#2dd4bf' : '#0f766e'}
                                        />
                                    </View>
                                )
                            )}
                            onEndReached={loadMoreCustomers}
                            onEndReachedThreshold={0.5}
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    const renderFrequencyDropdown = () => (
        <Modal
            visible={showFrequencyDropdown}
            transparent
            animationType="fade"
            onRequestClose={() => setShowFrequencyDropdown(false)}
        >
            <TouchableOpacity
                className="flex-1 bg-black/50"
                activeOpacity={1}
                onPress={() => setShowFrequencyDropdown(false)}
            >
                <View className="flex-1 justify-center px-4">
                    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4`}>
                        <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'
                            }`}>
                            Payment Frequency
                        </Text>

                        {frequencyOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                className={`p-4 rounded-xl mb-2 ${formData.payment_frequency === option.value
                                    ? isDarkMode ? 'bg-teal-900/50' : 'bg-teal-50'
                                    : isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                                    }`}
                                onPress={() => handleFrequencyChange(option)}
                            >
                                <Text className={`font-medium ${formData.payment_frequency === option.value
                                    ? isDarkMode ? 'text-teal-400' : 'text-teal-700'
                                    : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <LinearGradient
                colors={['#1a9c94', '#14b8a6']}
                className="pt-10 pb-8 px-6 rounded-b-[40px] shadow-2xl"
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            className="bg-white/20 p-3 rounded-2xl mr-4 backdrop-blur-sm"
                        >
                            <Icon name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-white text-2xl font-bold">New Loan</Text>
                            <Text className="text-teal-100 text-sm mt-1">Create loan application</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView
                className="flex-1 px-6 -mt-4"
                showsVerticalScrollIndicator={false}
            >
                <View className={`${isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'
                    } backdrop-blur-xl p-6 rounded-3xl shadow-xl mb-6 border ${isDarkMode ? 'border-gray-700/50' : 'border-white/50'
                    }`}>
                    <View className="flex-row items-center mb-4">
                        <View className={`p-2 rounded-xl mr-3 ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
                            }`}>
                            <Icon name="person" size={20} color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
                        </View>
                        <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'
                            }`}>
                            Customer Selection
                        </Text>
                    </View>

                    {routeCustomerId ? (
                        <View className={`p-4 rounded-2xl ${isDarkMode ? 'bg-teal-900/30 border border-teal-500/30' : 'bg-teal-50 border border-teal-200'
                            }`}>
                            <Text className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-teal-400' : 'text-teal-700'
                                }`}>
                                Selected Customer
                            </Text>
                            <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
                                }`}>
                                {`${routeCustomerId} - ${routeCustomername}`}
                            </Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            className={`border-2 border-dashed rounded-2xl p-4 flex-row justify-between items-center ${formData.customer_id
                                ? isDarkMode
                                    ? 'bg-teal-900/20 border-teal-500/50'
                                    : 'bg-teal-50 border-teal-300'
                                : isDarkMode
                                    ? 'border-gray-600 bg-gray-700/30'
                                    : 'border-gray-300 bg-gray-50'
                                }`}
                            onPress={() => setShowCustomerDropdown(true)}
                            disabled={isloadingcustomer}
                        >
                            <View className="flex-1">
                                <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                    Customer
                                </Text>
                                <Text className={`text-lg font-semibold ${formData.customer_id
                                    ? isDarkMode ? 'text-teal-400' : 'text-teal-700'
                                    : isDarkMode ? 'text-gray-500' : 'text-gray-400'
                                    }`}>
                                    {selectedCustomer ? `${selectedCustomer.id} - ${selectedCustomer.name}` : 'Select a customer'}
                                </Text>
                            </View>
                            {isloadingcustomer ? (
                                <ActivityIndicator size="small" color={isDarkMode ? '#2dd4bf' : '#0f766e'} />
                            ) : (
                                <Icon
                                    name="chevron-down"
                                    size={24}
                                    color={isDarkMode ? '#6b7280' : '#9ca3af'}
                                />
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <View className={`${isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'
                    } backdrop-blur-xl p-6 rounded-3xl shadow-xl mb-6 border ${isDarkMode ? 'border-gray-700/50' : 'border-white/50'
                    }`}>
                    <View className="flex-row items-center mb-6">
                        <View className={`p-2 rounded-xl mr-3 ${isDarkMode ? 'bg-green-500/20' : 'bg-green-50'
                            }`}>
                            <Icon name="calculator" size={20} color={isDarkMode ? '#34d399' : '#10b981'} />
                        </View>
                        <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'
                            }`}>
                            Loan Details
                        </Text>
                    </View>

                    <View className="space-y-6">
                        <View>
                            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                } mb-3 font-medium`}>
                                Principal Amount
                            </Text>
                            <TextInput
                                className={`border-2 rounded-2xl p-4 text-lg font-semibold ${isDarkMode
                                    ? 'bg-gray-700/50 border-gray-600 text-gray-100'
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                                    }`}
                                placeholder="Enter principal amount"
                                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                                keyboardType="numeric"
                                value={formData.principal_amount}
                                onChangeText={(value) => setFormData({ ...formData, principal_amount: value })}
                            />
                        </View>

                        <View>
                            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                } mb-3 font-medium`}>
                                Interest Rate (%)
                            </Text>
                            <TextInput
                                className={`border-2 rounded-2xl p-4 text-lg font-semibold ${isDarkMode
                                    ? 'bg-gray-700/50 border-gray-600 text-gray-100'
                                    : 'bg-gray-50 border-gray-200 text-gray-800'
                                    }`}
                                placeholder="Enter interest rate"
                                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                                keyboardType="numeric"
                                value={formData.interest_rate}
                                onChangeText={(value) => setFormData({ ...formData, interest_rate: value })}
                            />
                        </View>

                        <View>
                            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                } mb-3 font-medium`}>
                                Payment Frequency
                            </Text>
                            <TouchableOpacity
                                className={`border-2 rounded-2xl p-4 flex-row justify-between items-center ${isDarkMode
                                    ? 'bg-gray-700/50 border-gray-600'
                                    : 'bg-gray-50 border-gray-200'
                                    }`}
                                onPress={() => setShowFrequencyDropdown(true)}
                            >
                                <Text className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'
                                    }`}>
                                    {selectedFrequency?.label || 'Select frequency'}
                                </Text>
                                <Icon
                                    name="chevron-down"
                                    size={24}
                                    color={isDarkMode ? '#6b7280' : '#9ca3af'}
                                />
                            </TouchableOpacity>
                        </View>

                        <View>
                            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                } mb-3 font-medium`}>
                                Duration ({selectedFrequency?.durationLabel || 'Periods'})
                            </Text>
                            {formData.payment_frequency === 'MONTHLY' ? (
                                <TouchableOpacity
                                    className={`border-2 rounded-2xl p-4 flex-row justify-between items-center ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'
                                        }`}
                                    onPress={() => setShowDurationDropdown(true)}
                                >
                                    <Text className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : formData.duration ? 'text-gray-800' : 'text-gray-500'
                                        }`}>
                                        {formData.duration ? `${formData.duration} Months` : 'Select duration'}
                                    </Text>
                                    <Icon
                                        name="chevron-down"
                                        size={24}
                                        color={isDarkMode ? '#6b7280' : '#9ca3af'}
                                    />
                                </TouchableOpacity>
                            ) : (
                                <TextInput
                                    className={`border-2 rounded-2xl p-4 text-lg font-semibold ${isDarkMode ? 'bg-gray-700/50 border-gray-600 text-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
                                        }`}
                                    placeholder={`Enter duration in ${selectedFrequency?.durationLabel.toLowerCase() || 'periods'}`}
                                    placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                                    keyboardType="numeric"
                                    value={formData.duration}
                                    onChangeText={(value) => setFormData({ ...formData, duration: value })}
                                />
                            )}
                        </View>

                        <View>
                            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                                } mb-3 font-medium`}>
                                Start Date
                            </Text>
                            <TouchableOpacity
                                className={`border-2 rounded-2xl p-4 flex-row justify-between items-center ${isDarkMode
                                    ? 'bg-gray-700/50 border-gray-600'
                                    : 'bg-gray-50 border-gray-200'
                                    }`}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : `${formData.start_date ? 'text-gray-800' : 'text-gray-500'}`
                                    }`}>
                                    {formData.start_date || 'Select start date'}
                                </Text>
                                <Icon
                                    name="calendar"
                                    size={24}
                                    color={isDarkMode ? '#6b7280' : '#9ca3af'}
                                />
                            </TouchableOpacity>
                        </View>

                        {formData.principal_amount && formData.duration && formData.interest_rate &&
                            formData.start_date && (routeCustomerId || selectedCustomer?.id) && (
                                <TouchableOpacity
                                    className={`mt-4 p-4 rounded-2xl border-2 ${isDarkMode
                                        ? 'border-teal-500/50 bg-teal-900/30'
                                        : 'border-teal-300 bg-teal-50'
                                        }`}
                                    onPress={handleCalculateLoandrepayment}
                                    disabled={calculating}
                                >
                                    <View className="flex-row items-center justify-center">
                                        {calculating ? (
                                            <ActivityIndicator size="small" color={isDarkMode ? '#2dd4bf' : '#0f766e'} />
                                        ) : (
                                            <>
                                                <Icon name="calendar" size={20} color={isDarkMode ? '#2dd4bf' : '#0f766e'} />
                                                <Text className={`ml-2 text-center font-semibold ${isDarkMode ? 'text-teal-400' : 'text-teal-700'
                                                    }`}>
                                                    View Repayment Schedule
                                                </Text>
                                            </>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            )}
                    </View>
                </View>

                <TouchableOpacity
                    className="mb-8 shadow-2xl"
                    activeOpacity={0.8}
                    disabled={!formData.principal_amount || !formData.duration ||
                        !formData.interest_rate || isLoadingLoan}
                    onPress={handleSubmit}
                >
                    <LinearGradient
                        style={{ borderRadius: 14 }}
                        colors={isDarkMode ? isLoadingLoan ? ['#ebf4f5', '#b5c6e0'] : ['#0f766e', '#134e4a'] : isLoadingLoan ? ['#ebf4f5', '#b5c6e0'] : ['#0d9488', '#0f766e']}
                        className="p-5 rounded-3xl"
                    >
                        <View className="flex-row items-center justify-center">
                            <Icon name="checkmark-circle" size={24} color="white" />
                            <Text className="text-white text-lg font-bold ml-2">
                                Create Loan Application
                            </Text>
                        </View>
                    </LinearGradient>
                </TouchableOpacity>

                {renderCustomerDropdown()}
                {renderFrequencyDropdown()}
                {renderDatePicker()}
            </ScrollView>

            <Modal
                visible={showDurationDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowDurationDropdown(false)}
            >
                <TouchableOpacity
                    className="flex-1 bg-black/50"
                    activeOpacity={1}
                    onPress={() => setShowDurationDropdown(false)}
                >
                    <View className="flex-1 justify-center px-4">
                        <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-4`}>
                            <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'
                                }`}>
                                Select Duration
                            </Text>
                            {monthOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    className={`p-4 rounded-xl mb-2 ${formData.duration === option.value
                                        ? isDarkMode ? 'bg-teal-900/50' : 'bg-teal-50'
                                        : isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                                        }`}
                                    onPress={() => {
                                        setFormData({ ...formData, duration: option.value });
                                        setShowDurationDropdown(false);
                                    }}
                                >
                                    <Text className={`font-medium ${formData.duration === option.value
                                        ? isDarkMode ? 'text-teal-400' : 'text-teal-700'
                                        : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Modal
                visible={bottomSheetVisible}
                transparent
                animationType="none"
                onRequestClose={closeBottomSheet}
            >
                <View style={{ flex: 1 }}>
                    <Animated.View
                        style={{
                            flex: 1,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            opacity: backdropOpacity,
                        }}
                    >
                        <TouchableOpacity
                            style={{ flex: 1 }}
                            activeOpacity={1}
                            onPress={closeBottomSheet}
                        />
                    </Animated.View>

                    <Animated.View
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: SCREEN_HEIGHT * 0.7,
                            transform: [{ translateY: slideAnim }],
                        }}
                        className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl overflow-hidden`}
                    >
                        <View {...panResponder.panHandlers} className="p-4">
                            <View className="items-center mb-2">
                                <View className="w-12 h-1 bg-gray-400 rounded-full" />
                            </View>
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                    Repayment Schedule
                                </Text>
                                <TouchableOpacity
                                    onPress={closeBottomSheet}
                                    className="p-2 rounded-full"
                                >
                                    <Icon name="close" size={24} color={isDarkMode ? '#fff' : '#1f2937'} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {calculating ? (
                            <View className="flex-1 justify-center items-center">
                                <ActivityIndicator size="large" color={isDarkMode ? '#2dd4bf' : '#0f766e'} />
                            </View>
                        ) : (
                            <ScrollView
                                className="flex-1"
                                showsVerticalScrollIndicator={false}
                            >
                                {/* Loan Summary Section */}
                                <View className={`p-4 mx-4 mb-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                        Loan Summary
                                    </Text>

                                    <View className="flex-row justify-between mb-2">
                                        <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            Principal Amount:
                                        </Text>
                                        <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                            ₹{CalualteRepaymentData?.data?.principal_amount?.toFixed(2) || '0.00'}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between mb-2">
                                        <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            Interest Rate:
                                        </Text>
                                        <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                            {CalualteRepaymentData?.data?.interest_rate || '0'}%
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between mb-2">
                                        <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            Total Repayment:
                                        </Text>
                                        <Text className={`font-semibold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                                            ₹{CalualteRepaymentData?.data?.total_repayment_amount?.toFixed(2) || '0.00'}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                            Installment Amount:
                                        </Text>
                                        <Text className={`font-semibold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                                            ₹{CalualteRepaymentData?.data?.installment_amount?.toFixed(2) || '0.00'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Repayment Schedule Section */}
                                <View className="px-4 mb-8">
                                    <Text className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                                        Payment Schedule
                                    </Text>

                                    {newError && (
                                        <Text className={`text-center text-sm mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                                            Something went wrong. Please try again.
                                        </Text>
                                    )}

                                    <View className={`rounded-xl overflow-hidden ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                        <View className="flex-row p-3 bg-teal-500/10">
                                            <Text className={`w-1/5 font-semibold text-xs ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
                                                #
                                            </Text>
                                            <Text className={`w-1/5 font-semibold text-xs ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
                                                Due Date
                                            </Text>
                                            <Text className={`w-1/5 font-semibold text-xs ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
                                                Principal
                                            </Text>
                                            <Text className={`w-1/5 font-semibold text-xs ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
                                                Interest
                                            </Text>
                                            <Text className={`w-1/5 font-semibold text-xs ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
                                                Total
                                            </Text>
                                        </View>

                                        <FlatList
                                            scrollEnabled={false}
                                            data={CalualteRepaymentData?.data?.repayment_schedule || []}
                                            keyExtractor={(item) => item.installment_number.toString()}
                                            renderItem={({ item }) => (
                                                <View className={`flex-row p-3 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                                                    <Text className={`w-1/5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {item.installment_number}
                                                    </Text>
                                                    <Text className={`w-1/5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {new Date(item.due_date).toLocaleDateString()}
                                                    </Text>
                                                    <Text className={`w-1/5 text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        ₹{item.principal_amount.toFixed(2)}
                                                    </Text>
                                                    <Text className={`w-1/5 text-xs ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`}>
                                                        ₹{item.interest_amount.toFixed(2)}
                                                    </Text>
                                                    <Text className={`w-1/5 text-xs font-semibold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                                                        ₹{item.total_amount.toFixed(2)}
                                                    </Text>
                                                </View>
                                            )}
                                            ListEmptyComponent={() => (
                                                <Text className={`text-center text-sm p-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    No repayment schedule available
                                                </Text>
                                            )}
                                        />
                                    </View>
                                </View>
                            </ScrollView>
                        )}
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
};


export default Moreloanadd;