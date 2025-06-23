import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    Share,
    Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useHideTabBar } from '../../hooks/useHideTabBar';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import moment from 'moment'; // For consistent date formatting
import LinearGradient from 'react-native-linear-gradient'; // For modern gradient backgrounds
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

const PaymentDetails = () => {
    const navigation = useNavigation();
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const { singlerepaymentdetails } = useSelector((state) => state.payment);
    useHideTabBar(['Paymentdetails']);

    const [selectedMethod, setSelectedMethod] = useState(null);

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
    const remainamount = Number(singlerepaymentdetails?.total_amount) - Number(singlerepaymentdetails?.amount_paid);
    // Share functionality
    const handleShare = async () => {
        try {
            const message = `
Payment Details:
Amount: ₹${Number(singlerepaymentdetails?.total_amount || 0).toLocaleString()}
Status: ${singlerepaymentdetails?.status}
${singlerepaymentdetails.status === 'PAID' ?
                    `Paid Date: ${singlerepaymentdetails?.payment_date ? moment(singlerepaymentdetails?.payment_date).format('DD MMM YYYY') : "N/A"}
Payment ID: ${singlerepaymentdetails?.id || 'N/A'}` :
                    singlerepaymentdetails?.status === 'PARTIAL' ?
                        `Paid Amount: ₹${Number(singlerepaymentdetails?.amount_paid || 0).toLocaleString()}
Remaining: ₹${Number(remainamount || 0).toLocaleString()}
Due Date: ${moment(singlerepaymentdetails?.due_date).format('DD MMM YYYY')}` :
                        `Due Date: ${moment(singlerepaymentdetails?.due_date).format('DD MMM YYYY')}`}`
            // ${singlerepaymentdetails.status === 'OVERDUE' ?
            //                     `\nPenalty: ₹${Number(singlerepaymentdetails.breakdown?.penalty || 0).toLocaleString()}
            // Days Overdue: ${singlerepaymentdetails.daysOverdue || 0}` : ''}`;

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

    const statusColor = getStatusColor(singlerepaymentdetails?.status);

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
                },
                    // {
                    //     label: 'Agent',
                    //     value: paymentInfo.agentName,
                    //     icon: 'people-outline'
                    // }
                ].map((item, index) => (
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
            onPress={() => setSelectedMethod(method.id)}
            className="flex-row items-center p-4 bg-white/20 rounded-xl mb-3 shadow-sm"
        >
            <View className="w-6 h-6 border-2 border-white rounded-full items-center justify-center mr-3">
                {method.id === selectedMethod && <View className="w-4 h-4 bg-white rounded-full" />}
            </View>
            <View className="flex-1">
                <Text className="text-white font-semibold text-base">{method.name}</Text>
                <Text className="text-white/70 text-xs">{method.desc}</Text>
            </View>
            <Icon name={method.icon} size={24} color="white" />
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
            // singlerepaymentdetails.status === 'Overdue' && {
            //     label: 'Late Fee',
            //     value: singlerepaymentdetails.breakdown?.penalty || 0,
            //     icon: 'timer-outline',
            //     highlight: true
            // },
            singlerepaymentdetails.status === 'PARTIAL' && {
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
        ].filter(Boolean); // Remove undefined items

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
                                        {singlerepaymentdetails.status === 'OVERDUE'
                                            ? `${singlerepaymentdetails.daysOverdue} days @ ${singlerepaymentdetails.penaltyRate || 'N/A'}`
                                            : 'Remaining balance'}
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
            { id: 'upi', name: 'UPI', icon: 'phone-portrait', desc: 'Pay using UPI apps' },
            { id: 'Cash', name: 'Cash', icon: 'cash-outline', desc: 'Cash on payment' }
        ];

        switch (singlerepaymentdetails.status) {
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

                        {/* Payment method info if needed */}
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
                        {/* Status header */}
                        <CustomerInfoCard colors="#d97706" />
                        <PaymentBreakdown />
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
                                            via {singlerepaymentdetails?.amount_paid || 'N/A'}
                                        </Text>
                                    </View>
                                    {/* <Text className="text-white font-semibold text-sm">
                                        ₹{Number(singlerepaymentdetails?.breakdown?.total || 0).toLocaleString()}
                                    </Text> */}
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
                                ₹{((Number(singlerepaymentdetails?.total_amount) || 0))}
                            </Text>
                            {/* <Text className="text-white/80 text-sm mt-2">
                                Overdue by {singlerepaymentdetails.daysOverdue || 0} days
                            </Text> */}
                        </View>

                        <CustomerInfoCard colors="#dc2626" />
                        <PaymentBreakdown />



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

    return (
        <ScrollView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
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
                            { label: 'Paymnet ID', value: singlerepaymentdetails?.id || 'N/A' },
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
                            { label: 'Payment Method', value: singlerepaymentdetails?.paymentMethod || 'N/A' },
                            {
                                label: 'Payment Status',
                                value: singlerepaymentdetails?.status,
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

                    {singlerepaymentdetails?.status === 'PAID' && (
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
                    onPress={() => {
                        if (singlerepaymentdetails?.status === 'PAID') {
                            // Handle receipt download (e.g., open receiptUrl)
                            console.log('Download receipt:',);
                        } else {
                            // Handle payment navigation or action
                            console.log('Initiate payment for:', selectedMethod);
                        }
                    }}
                >
                    <Animated.View style={animatedButtonStyle}>
                        <View className="p-4 rounded-2xl bg-primary-100 flex-row items-center justify-center shadow-md">
                            <Icon
                                name={singlerepaymentdetails?.status === 'PAID' ? 'download-outline' : 'arrow-forward-outline'}
                                size={20}
                                color="white"
                            />
                            <Text className="text-white font-bold text-base ml-2">
                                {singlerepaymentdetails?.status === 'PAID'
                                    ? 'Download Receipt'
                                    : singlerepaymentdetails?.status === 'OVERDUE'
                                        ? 'Pay Overdue Amount'
                                        : singlerepaymentdetails?.status === 'PARTIAL'
                                            ? 'Pay Remaining Amount'
                                            : 'Pay Now'}
                            </Text>
                        </View>
                    </Animated.View>
                </Pressable>
            </View>
        </ScrollView>
    );
};

export default PaymentDetails;