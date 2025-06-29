import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Share,
    Pressable,
    TextInput,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useHideTabBar } from '../../hooks/useHideTabBar';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import moment from 'moment'; // For consistent date formatting
import LinearGradient from 'react-native-linear-gradient'; // For modern gradient backgrounds
import { useDispatch, useSelector } from 'react-redux';
import { getallpayment, updaterepaymentstatus } from '../../redux/Slices/paymentslice';
import { clearsingleloadnrepayments } from '../../redux/Slices/loanSlice';
import { useToast } from '../../Context/ToastContext';

const { width } = Dimensions.get('window');

// Move AmountInput outside as a separate component to prevent re-creation
const AmountInput = React.memo(({
    paymentAmount,
    onAmountChange,
    actualStatus,
    remainamount,
    totalAmount,
    onSetFullAmount,
    onSetRemainingAmount
}) => (
    <View className="bg-white/10 rounded-2xl p-5 mb-4">
        <View className="flex-row items-center mb-4">
            <View className="bg-white/20 w-8 h-8 rounded-lg items-center justify-center">
                <Icon name="cash" size={20} color="white" />
            </View>
            <Text className="text-white font-semibold text-lg ml-3">Payment Amount</Text>
        </View>

        <View className="bg-white/20 rounded-xl p-4">
            <Text className="text-white/70 text-sm mb-2">Enter amount to pay</Text>
            <View className="flex-row items-center">
                <Text className="text-white font-bold text-xl mr-2">₹</Text>
                <TextInput
                    value={paymentAmount}
                    onChangeText={onAmountChange}
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    keyboardType="decimal-pad"
                    className="flex-1 text-white font-bold text-xl"
                    style={{ color: 'white' }}
                />
            </View>

            {actualStatus === 'PARTIAL' && (
                <View className="mt-3 pt-3 border-t border-white/20">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-white/70 text-sm">Remaining Amount:</Text>
                        <Text className="text-white font-semibold text-sm">
                            ₹{Number(remainamount || 0).toLocaleString()}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={onSetRemainingAmount}
                        className="bg-white/20 p-2 rounded-lg"
                    >
                        <Text className="text-white text-center text-sm">Pay Full Remaining Amount</Text>
                    </TouchableOpacity>
                </View>
            )}

            {(actualStatus === 'PENDING' || actualStatus === 'OVERDUE') && (
                <View className="mt-3 pt-3 border-t border-white/20">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-white/70 text-sm">Total Amount:</Text>
                        <Text className="text-white font-semibold text-sm">
                            ₹{Number(totalAmount || 0).toLocaleString()}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={onSetFullAmount}
                        className="bg-white/20 p-2 rounded-lg"
                    >
                        <Text className="text-white text-center text-sm">Pay Full Amount</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    </View>
));

const Loanpaymentgetspay = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { showToast} =useToast();
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const { singlerepaymentdetails, isLoadingPayment } = useSelector((state) => state.payment);

    const [selectedMethod, setSelectedMethod] = useState('CASH'); // Default to Cash
    const [paymentAmount, setPaymentAmount] = useState('');


    // useFocusEffect(
    //     useCallback(() => {
    //         return () => {
    //             dispatch(clearsingleloadnrepayments());
    //         }
    //     }, [])
    // )

    // Animation for buttons
    const scale = useSharedValue(1);
    const animatedButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 20, stiffness: 300 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 20, stiffness: 300 });
    };

    // Memoize calculated values to prevent unnecessary re-renders
    const remainamount = useMemo(() =>
        Number(singlerepaymentdetails?.total_amount) - Number(singlerepaymentdetails?.amount_paid),
        [singlerepaymentdetails?.total_amount, singlerepaymentdetails?.amount_paid]
    );

    // Check if payment is overdue based on due date
    const isOverdue = useCallback(() => {
        if (!singlerepaymentdetails?.due_date) return false;
        const today = moment();
        const dueDate = moment(singlerepaymentdetails.due_date);
        return today.isAfter(dueDate, 'day') && singlerepaymentdetails?.status !== 'PAID';
    }, [singlerepaymentdetails?.due_date, singlerepaymentdetails?.status]);

    // Get actual status (show as overdue if due date has passed)
    const actualStatus = useMemo(() => {
        if (singlerepaymentdetails?.status === 'PAID') return 'PAID';
        if (isOverdue()) return 'OVERDUE';
        return singlerepaymentdetails?.status;
    }, [singlerepaymentdetails?.status, isOverdue]);

    // Memoize amount change handler
    const handleAmountChange = useCallback((amount) => {
        // Allow only numbers and a single decimal point
        if (/^\d*\.?\d*$/.test(amount)) {
            setPaymentAmount(amount);
        }
    }, []);

    // Memoize button handlers
    const handleSetFullAmount = useCallback(() => {
        setPaymentAmount(singlerepaymentdetails?.total_amount?.toString() || '');
    }, [singlerepaymentdetails?.total_amount]);

    const handleSetRemainingAmount = useCallback(() => {
        setPaymentAmount(remainamount.toString());
    }, [remainamount]);

    // Share functionality
    const handleShare = async () => {
        try {
            const message = `
Payment Details:
Amount: ₹${Number(singlerepaymentdetails?.total_amount || 0).toLocaleString()}
Status: ${actualStatus}
${actualStatus === 'PAID' ?
                    `Paid Date: ${singlerepaymentdetails?.payment_date ? moment(singlerepaymentdetails?.payment_date).format('DD MMM YYYY') : "N/A"}
Payment ID: ${singlerepaymentdetails?.id || 'N/A'}` :
                    actualStatus === 'PARTIAL' ?
                        `Paid Amount: ₹${Number(singlerepaymentdetails?.amount_paid || 0).toLocaleString()}
Remaining: ₹${Number(remainamount || 0).toLocaleString()}
Due Date: ${moment(singlerepaymentdetails?.due_date).format('DD MMM YYYY')}` :
                        `Due Date: ${moment(singlerepaymentdetails?.due_date).format('DD MMM YYYY')}`}`;

            await Share.share({
                message,
                title: 'Payment Details',
            });
        } catch (error) {
            console.error('Error sharing payment details:', error);
        }
    };

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID':
                return { bg: 'bg-green-100', text: 'text-green-600', gradient: ['#34d399', '#059669'] };
            case 'PENDING':
                return { bg: 'bg-yellow-100', text: 'text-yellow-600', gradient: ['#facc15', '#d97706'] };
            case 'PARTIAL':
                return { bg: 'bg-blue-100', text: 'text-blue-600', gradient: ['#60a5fa', '#2563eb'] };
            case 'OVERDUE':
                return { bg: 'bg-red-100', text: 'text-red-600', gradient: ['#f87171', '#dc2626'] };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-600', gradient: ['#9ca3af', '#6b7280'] };
        }
    };

    const statusColor = useMemo(() => getStatusColor(actualStatus), [actualStatus]);
    console.log(paymentAmount, "paymentAmount");

    // Customer Info Card Component
    const CustomerInfoCard = ({ colors }) => (
        <View className="bg-white/20 rounded-2xl p-5 mb-4 shadow-md">
            <View className="flex-row items-center mb-4">
                <View className="bg-white/30 w-8 h-8 rounded-lg items-center justify-center">
                    <Icon name="person" size={20} color={colors} />
                </View>
                <Text style={{ color: colors }} className={` opacity-80 font-bold text-lg ml-3`}>Customer Details</Text>
            </View>
            <View className="grid grid-cols-2 gap-3">
                {[{
                    label: 'Customer',
                    value: singlerepaymentdetails?.loan?.customer?.name,
                    icon: 'person-outline'
                },
                {
                    label: 'Customer ID',
                    value: singlerepaymentdetails?.loan?.customer_id,
                    icon: 'card-outline'
                },
                {
                    label: 'Loan ID',
                    value: singlerepaymentdetails?.loan_id,
                    icon: 'document-text-outline'
                }].map((item, index) => (
                    <View key={index} className="bg-white/20 p-3 rounded-xl">
                        <View className="flex-row items-center mb-1">
                            <Icon name={item.icon} size={14} color="#fff" />
                            <Text className="text-white text-xs ml-1">{item.label}</Text>
                        </View>
                        <Text className="text-white font-medium text-sm">{item.value || 'N/A'}</Text>
                    </View>
                ))}
            </View>
        </View>
    );

    // Payment Method Card Component
    const PaymentMethodCard = ({ method, index }) => (
        <TouchableOpacity
            onPress={() => method.enabled && setSelectedMethod(method.id)}
            disabled={!method.enabled}
            className={`flex-row items-center p-4 ${method.enabled ? 'bg-white/20' : 'bg-white/10'} rounded-xl mb-3 shadow-sm ${!method.enabled ? 'opacity-50' : ''}`}
        >
            <View className="w-6 h-6 border-2 border-white rounded-full items-center justify-center mr-3">
                {method.id === selectedMethod && method.enabled && <View className="w-4 h-4 bg-white rounded-full" />}
            </View>
            <View className="flex-1">
                <Text className={`text-white font-semibold text-base ${!method.enabled ? 'opacity-60' : ''}`}>
                    {method.name}
                </Text>
                <Text className={`text-white/70 text-xs ${!method.enabled ? 'opacity-60' : ''}`}>
                    {method.desc}
                </Text>
                {!method.enabled && (
                    <Text className="text-white/50 text-xs mt-1">Currently unavailable</Text>
                )}
            </View>
            <Icon name={method.icon} size={24} color={method.enabled ? "white" : "rgba(255,255,255,0.5)"} />
        </TouchableOpacity>
    );

    // Payment Breakdown Component
    const PaymentBreakdown = () => {
        const breakdownItems = [
            {
                label: 'Principal',
                value: singlerepaymentdetails?.principal_amount || 0,
                icon: 'cash-outline'
            },
            {
                label: 'Interest',
                value: singlerepaymentdetails?.interest_amount || 0,
                icon: 'trending-up-outline'
            },
            {
                label: 'Processing Fee',
                value: 0,
                icon: 'receipt-outline'
            },
            actualStatus === 'PARTIAL' && {
                label: 'Remaining',
                value: remainamount || 0,
                icon: 'timer-outline',
                highlight: true
            },
            {
                label: 'Other Charges',
                value: 0,
                icon: 'ellipsis-horizontal'
            }
        ].filter(Boolean);

        return (
            <View className="bg-white/10 rounded-2xl p-5 mb-4">
                <View className="flex-row items-center mb-4">
                    <View className="bg-white/20 w-8 h-8 rounded-lg items-center justify-center">
                        <Icon name="calculator" size={20} color="white" />
                    </View>
                    <Text className="text-white font-semibold text-lg ml-3">Amount Breakdown</Text>
                </View>

                <View className="flex-row flex-wrap -mx-2">
                    {breakdownItems.map((item, index) => (
                        <View key={index} className="w-1/2 px-2 mb-4">
                            <View className="bg-white/20 p-3 rounded-xl">
                                <View className="flex-row items-center mb-2">
                                    <View className="bg-white/30 w-8 h-8 rounded-full items-center justify-center">
                                        <Icon name={item.icon} size={16} color="white" />
                                    </View>
                                    <Text className="text-white/80 text-xs ml-2">{item.label}</Text>
                                </View>
                                <Text className="text-white font-semibold text-sm">
                                    ₹{Number(item.value).toLocaleString()}
                                </Text>
                                {item.highlight && (
                                    <Text className="text-white/60 text-xs mt-1">
                                        Remaining balance
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                <View className="bg-white/30 mt-2 p-4 rounded-xl">
                    <View className="flex-row justify-between items-center">
                        <View className="flex-row items-center">
                            <Icon name="calculator-outline" size={20} color="white" />
                            <Text className="text-white font-semibold ml-2">Total Amount</Text>
                        </View>
                        <Text className="text-white font-bold text-lg">
                            ₹{Number(singlerepaymentdetails?.total_amount || 0).toLocaleString()}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    // Render content based on payment status
    const renderPaymentContent = () => {
        const paymentMethods = [
            {
                id: 'UPI',
                name: 'UPI',
                icon: 'phone-portrait',
                desc: 'Pay using UPI apps',
                enabled: false // UPI disabled
            },
            {
                id: 'CASH',
                name: 'Cash',
                icon: 'cash-outline',
                desc: 'Cash on payment',
                enabled: true // Cash enabled by default
            }
        ];

        switch (actualStatus) {
            case 'PAID':
                return (
                    <LinearGradient colors={statusColor.gradient} className="rounded-b-[40px] p-6 mb-5">
                        {/* Status header */}
                        <View className="items-center mb-6">
                            <View className="bg-white/20 w-16 h-16 rounded-full items-center justify-center mb-3 shadow-md">
                                <Icon name="checkmark-circle" size={32} color="white" />
                            </View>
                            <Text className="text-white font-bold text-2xl">
                                ₹{Number(singlerepaymentdetails?.total_amount || 0).toLocaleString()}
                            </Text>
                            <Text className="text-white/80 text-sm mt-2">
                                {`${singlerepaymentdetails?.payment_date ? `Paid on ${moment(singlerepaymentdetails?.payment_date).format('DD MMM YYYY')}` : "Not Yet Paid"}`}
                            </Text>
                        </View>

                        <CustomerInfoCard colors="#059669" />
                        <PaymentBreakdown />
                    </LinearGradient>
                );

            case 'PENDING':
                return (
                    <LinearGradient colors={statusColor.gradient} className="rounded-b-[40px] p-6 mb-5">
                        <View className="items-center mb-6">
                            <View className="bg-white/20 w-16 h-16 rounded-full items-center justify-center mb-3 shadow-md">
                                <Icon name="warning" size={32} color="white" />
                            </View>
                            <Text className="text-white font-bold text-2xl">
                                ₹{Number(singlerepaymentdetails?.total_amount || 0).toLocaleString()}
                            </Text>
                            <Text className="text-white/80 text-sm mt-2">
                                Due Date  {moment(singlerepaymentdetails?.due_date).format('DD MMM YYYY')}
                            </Text>
                        </View>

                        <CustomerInfoCard colors="#d97706" />
                        <PaymentBreakdown />
                        <AmountInput
                            paymentAmount={paymentAmount}
                            onAmountChange={handleAmountChange}
                            actualStatus={actualStatus}
                            remainamount={remainamount}
                            totalAmount={singlerepaymentdetails?.total_amount}
                            onSetFullAmount={handleSetFullAmount}
                            onSetRemainingAmount={handleSetRemainingAmount}
                        />

                        {/* Payment method selection */}
                        <View className="bg-white/10 rounded-2xl p-5 shadow-sm">
                            <Text className="text-white font-semibold text-lg mb-3">Select Payment Method</Text>
                            <View className="space-y-3">
                                {paymentMethods.map((method, index) => (
                                    <PaymentMethodCard key={index} method={method} index={index} />
                                ))}
                            </View>
                        </View>
                    </LinearGradient>
                );

            case 'PARTIAL':
                return (
                    <LinearGradient colors={statusColor.gradient} className="rounded-b-[40px] p-6 mb-5">
                        <View className="items-center mb-6">
                            <View className="bg-white/20 w-16 h-16 rounded-full items-center justify-center mb-3 shadow-md">
                                <Icon name="time" size={32} color="white" />
                            </View>
                            <Text className="text-white font-bold text-2xl">
                                ₹{Number(singlerepaymentdetails?.total_amount || 0).toLocaleString()}
                            </Text>
                            <Text className="text-white/80 text-sm mt-2">
                                {`${singlerepaymentdetails?.payment_date ? `Partially Paid on ${moment(singlerepaymentdetails?.payment_date).format('DD MMM YYYY')}` : "Not Yet Paid"}`}
                            </Text>
                        </View>

                        <CustomerInfoCard colors="#2563eb" />

                        <View className="bg-white/10 rounded-2xl p-5 mb-4 shadow-sm">
                            <Text className="text-white font-semibold text-lg mb-3">Payment Status</Text>
                            <View className="space-y-3">
                                <View className="flex-row justify-between p-3 bg-white/20 rounded-xl">
                                    <Text className="text-white/80 text-sm">Total Amount</Text>
                                    <Text className="text-white font-semibold text-sm">
                                        ₹{Number(singlerepaymentdetails?.total_amount || 0).toLocaleString()}
                                    </Text>
                                </View>
                                <View className="flex-row justify-between p-3 bg-white/20 rounded-xl">
                                    <View>
                                        <Text className="text-white/80 text-sm">Paid Amount</Text>
                                        <Text className="text-white/60 text-xs">
                                            ₹{Number(singlerepaymentdetails?.amount_paid || 0).toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row justify-between p-3 bg-white/20 rounded-xl">
                                    <View>
                                        <Text className="text-white/80 text-sm">Remaining Amount</Text>
                                        <Text className="text-white/60 text-xs">
                                            Due by {moment(singlerepaymentdetails?.due_date).format('DD MMM YYYY')}
                                        </Text>
                                    </View>
                                    <Text className="text-white font-semibold text-sm">
                                        ₹{Number(remainamount || 0).toLocaleString()}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <AmountInput
                            paymentAmount={paymentAmount}
                            onAmountChange={handleAmountChange}
                            actualStatus={actualStatus}
                            remainamount={remainamount}
                            totalAmount={singlerepaymentdetails?.total_amount}
                            onSetFullAmount={handleSetFullAmount}
                            onSetRemainingAmount={handleSetRemainingAmount}
                        />

                        <View className="bg-white/10 rounded-2xl p-5 shadow-sm">
                            <Text className="text-white font-semibold text-lg mb-3">Complete Remaining Payment</Text>
                            <View className="space-y-3">
                                {paymentMethods.map((method, index) => (
                                    <PaymentMethodCard key={index} method={method} index={index} />
                                ))}
                            </View>
                        </View>
                    </LinearGradient>
                );

            case 'OVERDUE':
                return (
                    <LinearGradient colors={statusColor.gradient} className="rounded-b-[40px] p-6 mb-5">
                        <View className="items-center mb-6">
                            <View className="bg-white/20 w-16 h-16 rounded-full items-center justify-center mb-3 shadow-md">
                                <Icon name="alert-circle" size={32} color="white" />
                            </View>
                            <Text className="text-white font-bold text-2xl">
                                ₹{Number(singlerepaymentdetails?.total_amount || 0).toLocaleString()}
                            </Text>
                            <Text className="text-white/80 text-sm mt-2">
                                Overdue since {moment(singlerepaymentdetails?.due_date).format('DD MMM YYYY')}
                            </Text>
                        </View>

                        <CustomerInfoCard colors="#dc2626" />
                        <PaymentBreakdown />
                        <AmountInput
                            paymentAmount={paymentAmount}
                            onAmountChange={handleAmountChange}
                            actualStatus={actualStatus}
                            remainamount={remainamount}
                            totalAmount={singlerepaymentdetails?.total_amount}
                            onSetFullAmount={handleSetFullAmount}
                            onSetRemainingAmount={handleSetRemainingAmount}
                        />

                        <View className="bg-white/10 rounded-2xl p-5 shadow-sm">
                            <Text className="text-white font-semibold text-lg mb-3">Select Payment Method</Text>
                            <View className="space-y-3">
                                {paymentMethods.map((method, index) => (
                                    <PaymentMethodCard key={index} method={method} index={index} />
                                ))}
                            </View>
                        </View>
                    </LinearGradient>
                );

            default:
                return (
                    <View className="p-6">
                        <Text className="text-gray-500 text-center">No payment information available</Text>
                    </View>
                );
        }
    };

    // Validate payment amount
    const validatePaymentAmount = () => {
        const amount = parseFloat(paymentAmount);
        if (!amount || amount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid payment amount');
            return false;
        }

        if (actualStatus === 'PARTIAL' && amount > remainamount) {
            Alert.alert('Amount Exceeds', `Payment amount cannot exceed remaining amount of ₹${remainamount.toLocaleString()}`);
            return false;
        }

        if ((actualStatus === 'PENDING' || actualStatus === 'OVERDUE') && amount > Number(singlerepaymentdetails?.total_amount)) {
            Alert.alert('Amount Exceeds', `Payment amount cannot exceed total amount of ₹${Number(singlerepaymentdetails?.total_amount).toLocaleString()}`);
            return false;
        }

        return true;
    };

    return (
        <ScrollView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`} keyboardShouldPersistTaps="handled">
            <View className="p-5">
                {renderPaymentContent()}

                {/* Transaction Details Section */}
                <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-5 mb-5 shadow-sm`}>
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View className={`${isDarkMode ? 'bg-primary-100/20' : 'bg-primary-100/10'} w-8 h-8 rounded-lg items-center justify-center mr-3`}>
                                <Icon name="receipt-outline" size={20} color="#2ec4b6" />
                            </View>
                            <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-bold text-lg`}>
                                Transaction Details
                            </Text>
                        </View>
                        <TouchableOpacity onPress={handleShare} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-lg`}>
                            <Icon name="share-social-outline" size={20} color="#2ec4b6" />
                        </TouchableOpacity>
                    </View>

                    <View className="space-y-1">
                        {[
                            { label: 'Payment ID', value: singlerepaymentdetails?.id || 'N/A' },
                            {
                                label: 'Payment Date',
                                value: singlerepaymentdetails?.payment_date
                                    ? moment(singlerepaymentdetails.payment_date).format('DD MMM YYYY')
                                    : 'N/A',
                            },
                            {
                                label: 'Due Date',
                                value: singlerepaymentdetails?.due_date
                                    ? moment(singlerepaymentdetails?.due_date).format('DD MMM YYYY')
                                    : 'N/A',
                            },
                            { label: 'Payment Method', value: selectedMethod || 'N/A' },
                            {
                                label: 'Payment Status',
                                value: actualStatus,
                                valueStyle: statusColor.text,
                                chip: true,
                            },
                        ].map((item, index) => (
                            <View
                                key={index}
                                className={`flex-row items-center justify-between p-3 rounded-xl ${isDarkMode
                                    ? index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800'
                                    : index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                    }`}
                            >
                                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} font-medium text-sm`}>
                                    {item.label}
                                </Text>
                                {item.chip ? (
                                    <View className={`${statusColor.bg} px-3 py-1 rounded-full`}>
                                        <Text className={`${statusColor.text} font-medium text-sm`}>
                                            {item.value}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text className={`font-semibold text-sm ${item.valueStyle || (isDarkMode ? 'text-gray-100' : 'text-gray-800')
                                        }`}>
                                        {item.value}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>

                    {actualStatus === 'PAID' && (
                        <View className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <Icon name="time-outline" size={16} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                                    <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm ml-2`}>
                                        Paid on
                                    </Text>
                                </View>
                                <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-medium text-sm`}>
                                    {moment(singlerepaymentdetails?.payment_date).format('hh:mm A')}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Action Button */}
                <Pressable
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={isLoadingPayment || paymentAmount == '' || (actualStatus !== 'PAID' && !selectedMethod)}
                    onPress={() => {
                        if (actualStatus === 'PAID') {
                            // Handle receipt download
                            console.log('Download receipt');
                        } else {
                            if (!validatePaymentAmount()) return;

                            const payload = {
                                "loan_id": singlerepaymentdetails?.loan_id,
                                "installment_number": singlerepaymentdetails?.installment_number,
                                "amount_paid": parseFloat(paymentAmount),
                                "payment_date": moment(new Date()).format('YYYY-MM-DD'),
                                "notes": "Cash payment received",
                                "payment_method": selectedMethod,
                                "repayment_id":singlerepaymentdetails?.id
                            };
                            console.log('Payment payload:', payload);
                            dispatch(updaterepaymentstatus(payload)).then((response) => {
                                console.log(response, "response");
                                
                                if (response?.payload?.success) {
                                    showToast({
                                        message: 'Payment made Successfully!',
                                        type: 'success',
                                        duration: 3000,
                                        position: 'top' // or 'bottom'
                                    })
                                    const payload = {
                                        "status": '',
                                        "loanid": '',
                                        "dueDatestart": '',
                                        "dueDateend": '',
                                        "limit": 10,
                                        "page":1
                                    }
                                    dispatch(getallpayment(payload));
                                    navigation.goBack();
                                }
                                else {
                                    showToast({
                                        message: response?.payload?.error || "Failed to make payment",
                                        type: 'error',
                                        duration: 3000,
                                        position: 'top' // or 'bottom'
                                    })
                                }
                            })
                        }
                    }}
                >
                    <Animated.View style={animatedButtonStyle}>
                        <View className={`p-4 rounded-2xl ${isLoadingPayment || paymentAmount == '' || (actualStatus !== 'PAID' && !selectedMethod) ? "bg-primary-100/20" : "bg-primary-100"} flex-row items-center justify-center shadow-md`}>
                            <Icon
                                name={actualStatus === 'PAID' ? 'download-outline' : 'arrow-forward-outline'}
                                size={20}
                                color="white"
                            />
                            <Text className="text-white font-bold text-base ml-2">
                                {actualStatus === 'PAID'
                                    ? 'Download Receipt'
                                    : actualStatus === 'OVERDUE'
                                        ? 'Pay Overdue Amount'
                                        : actualStatus === 'PARTIAL'
                                            ? 'Pay Remaining Amount'
                                            : 'Pay Now'}
                            </Text>
                        </View>
                    </Animated.View>
                </Pressable>
            </View>
        </ScrollView >
    );
};

export default Loanpaymentgetspay;