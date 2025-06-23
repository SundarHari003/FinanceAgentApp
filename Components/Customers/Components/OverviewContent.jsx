// components/CustomerDetails/OverviewContent.js
import React from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ProgressChart } from 'react-native-chart-kit';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');
const placeholderImage = 'https://via.placeholder.com/150';

// Mock borrower data
const borrower = {
  name: 'Olivia Bennett',
  id: 'LNS87654321',
  customerSince: '2021-08-01',
  currentLoan: {
    amount: 5000,
    monthlyPayment: 450,
    loanStatus: 'Active',
  },
  creditScore: 720,
  pastLoans: [
    { id: 'LN001', amount: 3000, date: '2022-01-15', status: 'Completed', details: 'Paid on time' },
    { id: 'LN002', amount: 2500, date: '2023-03-20', status: 'Completed', details: 'Early repayment' },
    { id: 'LN003', amount: 1500, date: '2023-11-10', status: 'Defaulted', details: 'Missed 3 payments' },
  ],
  documents: [
    { name: 'Identity Proof', status: 'Verified', type: 'id-card-outline' },
    { name: 'Address Proof', status: 'Pending', type: 'home-outline' },
    { name: 'Income Statement', status: 'Rejected', reason: 'Unclear image', type: 'document-text-outline' },
    { name: 'Bank Statement', status: 'Reuploaded', type: 'wallet-outline' },
  ],
};

const OverviewContent = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { getsinglecustomerdetailsData } = useSelector((state) => state.customer);
  const singleData = getsinglecustomerdetailsData?.data;
  // Calculate document statistics
  const documentStats = {
    verified: borrower.documents.filter(doc => doc.status === 'Verified').length,
    pending: borrower.documents.filter(doc => doc.status === 'Pending').length,
    rejected: borrower.documents.filter(doc => doc.status === 'Rejected').length,
    total: borrower.documents.length,
  };

  // Chart data for ProgressChart
  const chartData = {
    labels: ['Verified'],
    data: documentStats.total > 0 ? [documentStats.verified / documentStats.total] : [0],
  };

  // Chart config
  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? '#1f2937' : '#ffffff',
    backgroundGradientTo: isDarkMode ? '#1f2937' : '#ffffff',
    color: (opacity = 1) => `rgba(46, 196, 182, ${opacity})`,
    strokeWidth: 12,
  };

  // Stats data
  const statsData = [
    {
      icon: 'wallet-outline',
      label: 'Current Loan',
      value: `$${borrower.currentLoan.amount.toLocaleString()}`,
      status: borrower.currentLoan.loanStatus,
      statusColor: borrower.currentLoan.loanStatus === 'Active' ? 'green' : 'yellow',
    },
    {
      icon: 'calendar-outline',
      label: 'Next Payment',
      value: `$${borrower.currentLoan.monthlyPayment}`,
      status: 'Due in 7 days',
      statusColor: 'blue',
    },
    {
      icon: 'document-text-outline',
      label: 'Documents',
      value: `${documentStats.verified}/${documentStats.total}`,
      status: documentStats.verified === documentStats.total && documentStats.total > 0 ? 'Complete' : 'Pending',
      statusColor: documentStats.verified === documentStats.total && documentStats.total > 0 ? 'green' : 'yellow',
    },
    {
      icon: 'analytics-outline',
      label: 'Payment History',
      value: '98%',
      status: 'Good Standing',
      statusColor: 'green',
    },
    {
      icon: 'trending-up-outline',
      label: 'Credit Score',
      value: `${borrower.creditScore}`,
      status: borrower.creditScore >= 700 ? 'Excellent' : 'Good',
      statusColor: borrower.creditScore >= 700 ? 'green' : 'blue',
    },
    {
      icon: 'time-outline',
      label: 'Account Age',
      value: `${Math.floor((new Date() - new Date(borrower.customerSince)) / (1000 * 60 * 60 * 24 * 365))} yrs`,
      status: 'Active',
      statusColor: 'green',
    },
    {
      icon: 'cash-outline',
      label: 'Total Loans',
      value: `${borrower.pastLoans.length + 1}`,
      status: 'Active',
      statusColor: 'green',
    },
  ];

  return (
    <View className={`px-5 pb-5 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Customer Profile Card */}
      <View className="bg-primary-100 rounded-3xl p-6 mb-6 shadow-lg">
        <View className="items-center">
          <View className="relative mb-4">
            <Image
              source={{ uri: placeholderImage }}
              className="w-28 h-28 rounded-full border-4 border-white shadow-md"
            />
            <View className="absolute bottom-0 right-0 bg-green-500 w-7 h-7 rounded-full items-center justify-center border-2 border-white">
              <Icon name="shield-checkmark" size={18} color="white" />
            </View>
          </View>
          <Text className="text-white text-2xl font-bold mb-1">{singleData.name}</Text>
          <Text className="text-white/80 text-sm mb-3">ID: {singleData.id}</Text>
          <View className="flex-row items-center bg-white/20 px-3 py-1 rounded-full">
            <Icon name="time-outline" size={16} color="white" />
            <Text className="text-white text-sm ml-2">
              Member since {new Date(singleData.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Document Statistics Card */}
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 mb-6 shadow-lg`}>
        <Text className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-5`}>Document Overview</Text>
        {documentStats.total > 0 ? (
          <View className="items-center mb-5">
            <ProgressChart
              data={chartData}
              width={width - 80}
              height={160}
              strokeWidth={16}
              radius={70}
              chartConfig={chartConfig}
              hideLegend={false}
            />
            <View className="absolute top-14 left-28">
              <Text className={`text-center text-4xl font-bold ${isDarkMode ? 'text-teal-400' : 'text-primary-100'}`}>
                {Math.round((documentStats.verified / documentStats.total) * 100)}%
              </Text>
              <Text className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>Verified</Text>
            </View>
          </View>
        ) : (
          <Text className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-5`}>No documents available</Text>
        )}

        <View className="flex-row justify-between mt-4">
          {[
            { label: 'Verified', count: documentStats.verified, color: 'green', icon: 'checkmark-circle' },
            { label: 'Pending', count: documentStats.pending, color: 'yellow', icon: 'time' },
            { label: 'Locked', count: documentStats.rejected, color: 'red', icon: 'lock-closed' },
          ].map((item, index) => (
            <View key={index} className="items-center">
              <View className={`${isDarkMode
                  ? item.color === 'green' ? 'bg-green-900/30'
                    : item.color === 'yellow' ? 'bg-yellow-900/30'
                      : 'bg-red-900/30'
                  : `bg-${item.color}-100`
                } p-2 rounded-full mb-1`}>
                <Icon
                  name={item.icon}
                  size={20}
                  color={isDarkMode
                    ? item.color === 'green' ? '#4ade80'
                      : item.color === 'yellow' ? '#facc15'
                        : '#f87171'
                    : item.color === 'green' ? '#16a34a'
                      : item.color === 'yellow' ? '#ca8a04'
                        : '#dc2626'
                  }
                />
              </View>
              <Text className={`${isDarkMode
                  ? item.color === 'green' ? 'text-green-400'
                    : item.color === 'yellow' ? 'text-yellow-400'
                      : 'text-red-400'
                  : `text-${item.color}-500`
                } text-lg font-bold`}>
                {item.count}
              </Text>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Key Statistics */}
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 mb-6 shadow-lg`}>
        <Text className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-5`}>Key Metrics</Text>
        <View className="flex flex-col" style={{ gap: 12 }}>
          {statsData.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center justify-between p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-2xl shadow-sm`}
            >
              <View className="flex-row items-center flex-1">
                <View className={`${isDarkMode ? 'bg-teal-900/30' : 'bg-primary-100/10'} p-3 rounded-xl`}>
                  <Icon name={item.icon} size={22} color={isDarkMode ? '#2dd4bf' : '#2ec4b6'} />
                </View>
                <View className="ml-4">
                  <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>{item.label}</Text>
                  <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-bold text-lg`}>{item.value}</Text>
                </View>
              </View>
              <View className={`px-3 py-1 rounded-full ${isDarkMode
                  ? item.statusColor === 'green' ? 'bg-green-900/30'
                    : item.statusColor === 'yellow' ? 'bg-yellow-900/30'
                      : item.statusColor === 'blue' ? 'bg-blue-900/30'
                        : 'bg-red-900/30'
                  : `bg-${item.statusColor}-100`
                }`}>
                <Text className={`text-xs font-medium ${isDarkMode
                    ? item.statusColor === 'green' ? 'text-green-400'
                      : item.statusColor === 'yellow' ? 'text-yellow-400'
                        : item.statusColor === 'blue' ? 'text-blue-400'
                          : 'text-red-400'
                    : `text-${item.statusColor}-700`
                  }`}>
                  {item.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* User Status Control */}
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 mb-6 shadow-lg`}>
        <Text className={`text-2xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-5`}>Account Status</Text>
        <TouchableOpacity
          className={`flex-row items-center justify-between p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-2xl shadow-sm`}
          onPress={() => console.log('Toggle user status')}
        >
          <View className="flex-row items-center">
            <View className={`${isDarkMode ? 'bg-teal-900/30' : 'bg-primary-100/10'} p-3 rounded-xl`}>
              <Icon name="shield-outline" size={24} color={isDarkMode ? '#2dd4bf' : '#2ec4b6'} />
            </View>
            <View className="ml-4">
              <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold text-base`}>Account Status</Text>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>Control user account access</Text>
            </View>
          </View>
          <View className={`${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'} px-4 py-2 rounded-full`}>
            <Text className={`${isDarkMode ? 'text-red-400' : 'text-red-600'} font-medium`}>DISABLE</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-row items-center justify-between p-4 ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'} rounded-2xl border ${isDarkMode ? 'border-yellow-900/30' : 'border-yellow-200'} mt-4`}
          onPress={() => console.log('Hold user data')}
        >
          <View className="flex-row items-center">
            <View className={`${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'} p-3 rounded-xl`}>
              <Icon name="lock-closed-outline" size={24} color={isDarkMode ? '#facc15' : '#EAB308'} />
            </View>
            <View className="ml-4">
              <Text className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'} font-semibold text-base`}>Hold User Data</Text>
              <Text className={`${isDarkMode ? 'text-yellow-400/70' : 'text-yellow-600'} text-sm`}>Temporarily restrict data access</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color={isDarkMode ? '#facc15' : '#EAB308'} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OverviewContent;