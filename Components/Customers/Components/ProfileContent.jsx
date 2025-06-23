// components/CustomerDetails/ProfileContent.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import InfoCard from './InfoCard';
import moment from 'moment';

// Updated borrower data based on provided J

const ProfileContent = () => {
    const isDarkMode = useSelector((state) => state.theme.isDarkMode);
    const navigation = useNavigation();
    const { getsinglecustomerdetailsData } = useSelector((state) => state.customer);
    const singleData = getsinglecustomerdetailsData?.data;
    console.log(singleData, "ccc");

    const [borrower, setBorrower] = useState({
        name: singleData?.name,
        phone: singleData?.phone_number,
        email: singleData?.email,
        alternateMobile: singleData?.alternate_mobile_number,
        gender: singleData?.gender,
        dateOfBirth: moment(singleData?.date_of_birth).format("DD-MM-YYYY"),
        addressLine1: singleData?.address_line1,
        district: singleData?.district,
        state: singleData?.state,
        city: singleData?.city,
        pincode: singleData?.pincode,
        placeName: singleData?.place_name,
        customerSince: moment(singleData?.created_at).format("DD-MM-YYYY"),
    })
    // Format date helper
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Format full address
    const fullAddress = `${borrower.addressLine1}, ${borrower.placeName}, ${borrower.city}, ${borrower.district}, ${borrower.state} - ${borrower.pincode}`;

    const personalInfo = [
        {
            icon: 'person-outline',
            label: 'Full Name',
            value: borrower.name,
            bgColor: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100',
            iconColor: isDarkMode ? '#60a5fa' : '#3b82f6'
        },
        {
            icon: 'calendar-outline',
            label: 'Date of Birth',
            value: formatDate(borrower.dateOfBirth),
            bgColor: isDarkMode ? 'bg-purple-900/30' : 'bg-purple-100',
            iconColor: isDarkMode ? '#a78bfa' : '#8b5cf6'
        },
        {
            icon: 'male-female-outline',
            label: 'Gender',
            value: borrower.gender,
            bgColor: isDarkMode ? 'bg-pink-900/30' : 'bg-pink-100',
            iconColor: isDarkMode ? '#f472b6' : '#ec4899'
        },
        {
            icon: 'business-outline',
            label: 'Customer Since',
            value: formatDate(borrower.customerSince),
            bgColor: isDarkMode ? 'bg-green-900/30' : 'bg-green-100',
            iconColor: isDarkMode ? '#34d399' : '#10b981'
        },
    ];

    const contactInfo = [
        {
            icon: 'call-outline',
            label: 'Primary Phone',
            value: borrower.phone,
            type: 'phone',
            bgColor: isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100',
            iconColor: isDarkMode ? '#2dd4bf' : '#14b8a6'
        },
        {
            icon: 'call-outline',
            label: 'Alternate Mobile',
            value: borrower.alternateMobile,
            type: 'phone',
            bgColor: isDarkMode ? 'bg-cyan-900/30' : 'bg-cyan-100',
            iconColor: isDarkMode ? '#22d3ee' : '#06b6d4'
        },
        {
            icon: 'mail-outline',
            label: 'Email Address',
            value: borrower.email,
            type: 'email',
            bgColor: isDarkMode ? 'bg-orange-900/30' : 'bg-orange-100',
            iconColor: isDarkMode ? '#fb923c' : '#f97316'
        },
        {
            icon: 'location-outline',
            label: 'Residential Address',
            value: fullAddress,
            type: 'address',
            bgColor: isDarkMode ? 'bg-red-900/30' : 'bg-red-100',
            iconColor: isDarkMode ? '#f87171' : '#ef4444'
        },
        {
            icon: 'map-outline',
            label: 'District',
            value: borrower.district,
            bgColor: isDarkMode ? 'bg-indigo-900/30' : 'bg-indigo-100',
            iconColor: isDarkMode ? '#818cf8' : '#6366f1'
        },
        {
            icon: 'flag-outline',
            label: 'State',
            value: borrower.state,
            bgColor: isDarkMode ? 'bg-violet-900/30' : 'bg-violet-100',
            iconColor: isDarkMode ? '#a855f7' : '#8b5cf6'
        },
    ];

    const actionItems = [
        {
            icon: 'create-outline',
            label: 'Edit Profile Details',
            action: () => navigation.navigate('editcustomer'),
            color: isDarkMode ? '#60a5fa' : '#3b82f6',
            bgColor: isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'
        },
        {
            icon: 'call-outline',
            label: 'Quick Call',
            action: () => console.log('Quick Call'),
            color: isDarkMode ? '#34d399' : '#10b981',
            bgColor: isDarkMode ? 'bg-green-900/20' : 'bg-green-50'
        },
        {
            icon: 'chatbox-outline',
            label: 'Quick Message',
            action: () => console.log('Quick Message'),
            color: isDarkMode ? '#a78bfa' : '#8b5cf6',
            bgColor: isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'
        },
        {
            icon: 'warning-outline',
            label: 'Report to Admin',
            action: () => console.log('Report to Admin'),
            color: isDarkMode ? '#fb923c' : '#f97316',
            bgColor: isDarkMode ? 'bg-orange-900/20' : 'bg-orange-50'
        },
        {
            icon: 'ban-outline',
            label: 'Disable User',
            action: () => console.log('Disable User'),
            isToggle: true,
            color: isDarkMode ? '#f87171' : '#ef4444',
            bgColor: isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
        },
    ];

    return (
        <ScrollView
            className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} mb-2`}
            showsVerticalScrollIndicator={false}
        >
            <View className="px-4 pb-6">
                {/* Header Section */}
                <View className={`${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-white to-gray-50'} rounded-3xl p-6 mb-6 shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <View className="flex-row items-center mb-4">
                        <View className={`${isDarkMode ? 'bg-teal-900/40' : 'bg-teal-100'} p-4 rounded-2xl mr-4`}>
                            <Icon name="person" size={32} color={isDarkMode ? '#2dd4bf' : '#14b8a6'} />
                        </View>
                        <View className="flex-1">
                            <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                {borrower.name}
                            </Text>
                            <Text className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                                Customer Profile
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row justify-between">
                        <View className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} px-4 py-2 rounded-xl flex-1 mr-2`}>
                            <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                                Customer ID
                            </Text>
                            <Text className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mt-1`}>
                                {singleData?.id}
                            </Text>
                        </View>
                        <View className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'} px-4 py-2 rounded-xl flex-1 ml-2`}>
                            <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
                                Status
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <View className={`w-2 h-2 ${singleData?.is_active ? "bg-green-500" : "bg-red-500"} rounded-full mr-2`} />
                                <Text className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {singleData?.is_active ? "Active" : "In-Active"}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Personal Information Section */}
                <InfoCard title="Personal Information" data={personalInfo} isDarkMode={isDarkMode} />

                {/* Contact Information Section */}
                <InfoCard title="Contact Information" data={contactInfo} isDarkMode={isDarkMode} />

                {/* Actions Section */}
                <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <View className="flex-row items-center mb-6">
                        <View className={`${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'} p-2 rounded-xl mr-3`}>
                            <Icon name="settings-outline" size={20} color={isDarkMode ? '#2dd4bf' : '#14b8a6'} />
                        </View>
                        <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Quick Actions
                        </Text>
                    </View>

                    <View className="flex-col gap-y-3">
                        {actionItems.map((action, index) => (
                            <TouchableOpacity
                                key={index}
                                className={`flex-row items-center justify-between p-4 ${action.bgColor} rounded-2xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200/50'}`}
                                onPress={action.action}
                                activeOpacity={0.7}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-white/80'} p-3 rounded-xl mr-4 shadow-sm`}>
                                        <Icon name={action.icon} size={20} color={action.color} />
                                    </View>
                                    <Text className={`${isDarkMode ? 'text-white' : 'text-gray-900'} font-medium text-base`}>
                                        {action.label}
                                    </Text>
                                </View>

                                {action.isToggle ? (
                                    <View className={`${isDarkMode ? 'bg-red-900/40 border-red-700' : 'bg-red-100 border-red-300'} px-4 py-2 rounded-full border`}>
                                        <Text className={`${isDarkMode ? 'text-red-400' : 'text-red-700'} text-xs font-bold uppercase tracking-wide`}>
                                            Disabled
                                        </Text>
                                    </View>
                                ) : (
                                    <View className={`${isDarkMode ? 'bg-gray-700/50' : 'bg-white/80'} p-2 rounded-lg`}>
                                        <Icon name="chevron-forward" size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default ProfileContent;