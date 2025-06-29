import React from 'react';
import { View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ProgressChart } from 'react-native-chart-kit';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');
const placeholderImage = 'https://via.placeholder.com/150';

const OverviewContent = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { getsinglecustomerdetailsData } = useSelector((state) => state.customer);
  const customer = getsinglecustomerdetailsData?.data;

  // Calculate loan statistics
  const loanStats = {
    active: customer?.loans?.filter(loan => loan.status === 'ACTIVE').length || 0,
    completed: customer?.loans?.filter(loan => loan.status === 'COMPLETED').length || 0,
    total: customer?.loans?.length || 0,
  };

  // Chart data for ProgressChart (showing active loans proportion)
  const chartData = {
    labels: ['Active Loans'],
    data: loanStats.total > 0 ? [loanStats.active / loanStats.total] : [0],
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? '#1f2937' : '#ffffff',
    backgroundGradientTo: isDarkMode ? '#1f2937' : '#ffffff',
    color: (opacity = 1) => `rgba(46, 196, 182, ${opacity})`,
    strokeWidth: 12,
  };

  // Key metrics for display
  const statsData = [
    {
      icon: 'wallet-outline',
      label: 'Total Loans',
      value: `${loanStats.total}`,
      status: loanStats.active > 0 ? 'Active' : 'No Active Loans',
      statusColor: loanStats.active > 0 ? 'green' : 'yellow',
    },
    {
      icon: 'cash-outline',
      label: 'Total Loan Amount',
      value: `₹${customer?.loans?.reduce((sum, loan) => sum + loan.principal_amount, 0).toLocaleString() || 0}`,
      status: 'Disbursed',
      statusColor: 'blue',
    },
    {
      icon: 'calendar-outline',
      label: 'Customer Since',
      value: customer?.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A',
      status: 'Active',
      statusColor: 'green',
    },
    {
      icon: 'person-outline',
      label: 'Gender',
      value: customer?.gender || 'N/A',
      status: 'Verified',
      statusColor: 'green',
    },
  ];

  return (
    <View className={`px-5 pb-5 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Customer Profile Card */}
      <View className="bg-primary-100 rounded-2xl p-5 mb-5 shadow-md">
        <View className="items-center">
          <Image
            source={{ uri: customer?.profile_photo_path || placeholderImage }}
            className="w-24 h-24 rounded-full border-2 border-white shadow-sm"
          />
          <Text className="text-white text-xl font-bold mt-3">{customer?.name || 'N/A'}</Text>
          <Text className="text-white/80 text-sm">ID: {customer?.id || 'N/A'}</Text>
          <View className="flex-row items-center bg-white/20 px-2 py-1 rounded-full mt-2">
            <Icon name="call-outline" size={16} color="white" />
            <Text className="text-white text-sm ml-2">{customer?.phone_number || 'N/A'}</Text>
          </View>
          <Text className="text-white/80 text-sm mt-1">{customer?.email || 'N/A'}</Text>
        </View>
      </View>

      {/* Loan Statistics Card */}
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-5 mb-5 shadow-md`}>
        <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Loan Overview</Text>
        {loanStats.total > 0 ? (
          <View className="items-center mb-4">
            <ProgressChart
              data={chartData}
              width={width - 60}
              height={140}
              strokeWidth={12}
              radius={60}
              chartConfig={chartConfig}
              hideLegend={false}
            />
            <Text className={`text-center text-2xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-primary-100'} mt-2`}>
              {Math.round((loanStats.active / loanStats.total) * 100)}%
            </Text>
            <Text className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Active Loans</Text>
          </View>
        ) : (
          <Text className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-4`}>No loans available</Text>
        )}
        <View className="flex-row justify-between">
          {[
            { label: 'Active', count: loanStats.active, color: 'green', icon: 'checkmark-circle' },
            { label: 'Completed', count: loanStats.completed, color: 'blue', icon: 'checkmark-done' },
          ].map((item, index) => (
            <View key={index} className="items-center">
              <Icon
                name={item.icon}
                size={20}
                color={isDarkMode ? item.color === 'green' ? '#4ade80' : '#60a5fa' : item.color}
              />
              <Text className={`${isDarkMode ? `text-${item.color}-400` : `text-${item.color}-500`} text-base font-bold`}>
                {item.count}
              </Text>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Key Metrics Card */}
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-5 shadow-md mb-3`}>
        <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Key Metrics</Text>
        {statsData.map((item, index) => (
          <TouchableOpacity
            key={index}
            className={`flex-row items-center justify-between p-3 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl mb-3`}
          >
            <View className="flex-row items-center">
              <Icon name={item.icon} size={20} color={isDarkMode ? '#2dd4bf' : '#2ec4b6'} />
              <View className="ml-3">
                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{item.label}</Text>
                <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold`}>{item.value}</Text>
              </View>
            </View>
            <Text className={`text-xs ${isDarkMode ? `text-${item.statusColor}-400` : `text-${item.statusColor}-600`}`}>
              {item.status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default OverviewContent;