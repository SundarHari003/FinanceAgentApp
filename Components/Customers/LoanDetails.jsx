import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ProgressChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const LoanDetails = () => {
  const navigation =useNavigation()
  const loan = {
    amount: 5000,
    interestRate: 8.5,
    totalTerm: 18,
    monthlyPayment: 450,
    totalPaid: 2700,
    dueDate: '2024-12-31',
    status: 'Active',
    issueDate: '2023-06-15',
    closeDate: '2024-12-31'
  }
  const progress = (loan.totalPaid / loan.amount) * 100;
  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(46, 196, 182, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5
  };

  const chartData = {
    data: [progress / 100]
  };

  return (
    <View className="flex-1 bg-gray-200/20">
      {/* Header Section */}
      <View className="bg-primary-100 px-5 py-6 rounded-b-3xl">
        <View className="flex-row items-center py-5">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-white/20 p-2 rounded-xl mr-4"
          >
            <Icon name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-2xl font-bold">Loan details</Text>
            <Text className="text-white/70">View loan amount, status, and payment details</Text>
          </View>
        </View>
        <View className="bg-white/20 rounded-2xl p-4 mb-4">
          <Text className="text-white/80 text-sm mb-1">Loan Amount</Text>
          <Text className="text-white text-3xl font-bold">${loan.amount.toLocaleString()}</Text>

          {/* Add dates section */}
          <View className="flex-row justify-between mt-2 mb-3 bg-white/10 p-2 rounded-xl">
            <View>
              <Text className="text-white/60 text-xs">Issue Date</Text>
              <Text className="text-white text-sm font-medium">
                {new Date(loan.issueDate).toLocaleDateString()}
              </Text>
            </View>
            <View>
              <Text className="text-white/60 text-xs">Close Date</Text>
              <Text className="text-white text-sm font-medium">
                {new Date(loan.closeDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          {/* Existing loan details */}
          <View className="flex-row justify-between mt-3">
            <View>
              <Text className="text-white/80 text-xs">Interest Rate</Text>
              <Text className="text-white text-base font-semibold">{loan.interestRate}%</Text>
            </View>
            <View>
              <Text className="text-white/80 text-xs">Term</Text>
              <Text className="text-white text-base font-semibold">{loan.totalTerm} months</Text>
            </View>
            <View>
              <Text className="text-white/80 text-xs">EMI</Text>
              <Text className="text-white text-base font-semibold">${loan.monthlyPayment}</Text>
            </View>
          </View>
        </View>
      </View>
      <ScrollView
        className=' -mt-6 z-40'
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
      >
        <View className="px-5 ">
          {/* Loan Progress Card */}
          <View className="bg-white rounded-3xl p-6 shadow-sm mb-5">
            <Text className="text-xl font-bold text-gray-800 mb-4">Repayment Progress</Text>
            <View className="items-center">
              <ProgressChart
                data={chartData}
                width={width - 80}
                height={150}
                strokeWidth={16}
                radius={64}
                chartConfig={chartConfig}
                hideLegend={true}
              />
              <View className="absolute top-16">
                <Text className="text-center text-4xl font-bold text-primary-100">
                  {progress.toFixed(1)}%
                </Text>
                <Text className="text-center text-gray-500">Completed</Text>
              </View>
            </View>

            <View className="flex-row justify-between mt-4">
              <View>
                <Text className="text-gray-500 text-sm">Paid Amount</Text>
                <Text className="text-gray-800 text-lg font-bold">${loan.totalPaid.toLocaleString()}</Text>
              </View>
              <View>
                <Text className="text-gray-500 text-sm">Remaining</Text>
                <Text className="text-gray-800 text-lg font-bold">${(loan.amount - loan.totalPaid).toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Current Week Due Alert */}
          <View className="bg-yellow-50 rounded-3xl p-6 mb-5 shadow-sm border border-yellow-200">
            <View className="flex-row items-center mb-3">
              <Icon name="alert-circle-outline" size={24} color="#EAB308" />
              <Text className="text-lg font-bold text-yellow-700 ml-2">Current Week Due</Text>
            </View>
            <Text className="text-yellow-700 mb-3">Payment of ${loan.monthlyPayment} is due this week.</Text>
            <TouchableOpacity
              className="bg-yellow-500 py-3 rounded-xl items-center"
              onPress={() => console.log('Make Payment')}
            >
              <Text className="text-white font-bold">Pay Now</Text>
            </TouchableOpacity>
          </View>

          {/* Overdue Payments */}
          <View className="bg-red-50 rounded-3xl p-6 mb-5 shadow-sm border border-red-200">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Icon name="warning-outline" size={24} color="#dc2626" />
                <Text className="text-lg font-bold text-red-700 ml-2">Overdue Payments</Text>
              </View>
              <View className="bg-red-100 px-3 py-1 rounded-full">
                <Text className="text-red-700 font-medium text-sm">2 Pending</Text>
              </View>
            </View>
            <View className="space-y-3 mb-4">
              {[{
                month: 'April',
                amount: 450,
                days: 15,
                penalty: 45
              },
              {
                month: 'May',
                amount: 450,
                days: 8,
                penalty: 25
              }].map((overdue, index) => (
                <View key={index} className="bg-white p-4 rounded-xl border border-red-100">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-800 font-semibold">{overdue.month} Payment</Text>
                    <Text className="text-red-600 font-bold">
                      ${overdue.amount + overdue.penalty}
                    </Text>
                  </View>
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-red-500 text-sm">{overdue.days} days overdue</Text>
                      <Text className="text-gray-500 text-xs">Penalty: ${overdue.penalty}</Text>
                    </View>
                    <TouchableOpacity className="bg-red-100 px-3 py-1 rounded-full">
                      <Text className="text-red-700 font-medium text-sm">Pay Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
            <TouchableOpacity className="bg-red-600 py-3 rounded-xl items-center">
              <Text className="text-white font-bold">Clear All Overdues</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View className="bg-white rounded-3xl p-6 shadow-sm mb-5">
            <Text className="text-xl font-bold text-gray-800 mb-4">Quick Actions</Text>
            <View className="grid grid-cols-2 gap-3">
              {[{
                icon: 'card-outline',
                label: 'Make Payment',
                color: 'primary-100',
                action: () => console.log('Make Payment')
              },
              {
                icon: 'calculator-outline',
                label: 'Settlement',
                color: 'purple-500',
                action: () => console.log('Calculate Settlement')
              },
              {
                icon: 'sync-outline',
                label: 'Reschedule',
                color: 'blue-500',
                action: () => console.log('Reschedule Loan')
              },
              {
                icon: 'close-circle-outline',
                label: 'Close Loan',
                color: 'red-500',
                action: () => console.log('Close Loan')
              }].map((action, index) => (
                <TouchableOpacity
                  key={index}
                  className={`bg-${action.color}/10 p-4 rounded-xl`}
                  onPress={action.action}
                >
                  <View className={`bg-${action.color}/20 w-10 h-10 rounded-full items-center justify-center mb-2`}>
                    <Icon
                      name={action.icon}
                      size={20}
                      color={`${action.color === 'primary-100' ? '#2ec4b6' :
                        action.color === 'purple-500' ? '#8b5cf6' :
                          action.color === 'blue-500' ? '#3b82f6' :
                            '#ef4444'
                        }`}
                    />
                  </View>
                  <Text className="text-gray-800 font-medium">{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Settlement Details */}
          <View className="bg-white rounded-3xl p-6 shadow-sm mb-5">
            <Text className="text-xl font-bold text-gray-800 mb-4">Settlement Options</Text>
            <View className="space-y-4">
              <View className="bg-gray-50 p-4 rounded-xl">
                <Text className="text-gray-800 font-semibold mb-2">Outstanding Amount</Text>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Principal</Text>
                  <Text className="text-gray-800 font-bold">${(loan.amount - loan.totalPaid).toLocaleString()}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Interest</Text>
                  <Text className="text-gray-800 font-bold">$350</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Penalties</Text>
                  <Text className="text-gray-800 font-bold">$70</Text>
                </View>
                <View className="flex-row justify-between mt-2 pt-2 border-t border-gray-200">
                  <Text className="text-gray-800 font-semibold">Total Settlement</Text>
                  <Text className="text-primary-100 font-bold text-lg">$2,720</Text>
                </View>
              </View>
              <TouchableOpacity className="bg-primary-100 py-3 rounded-xl items-center">
                <Text className="text-white font-bold">Request Settlement</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Loan Documents */}
          <View className="bg-white rounded-3xl p-6 shadow-sm mb-5">
            <Text className="text-xl font-bold text-gray-800 mb-4">Loan Documents</Text>
            <View className="space-y-3">
              {[
                { name: 'Loan Agreement', type: 'PDF', size: '2.4 MB', icon: 'document-text' },
                { name: 'KYC Documents', type: 'ZIP', size: '5.1 MB', icon: 'folder' },
                { name: 'Income Proof', type: 'PDF', size: '1.8 MB', icon: 'document-text' },
                { name: 'Bank Statements', type: 'PDF', size: '3.2 MB', icon: 'document-text' }
              ].map((doc, index) => (
                <TouchableOpacity
                  key={index}
                  className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="bg-primary-100/10 p-3 rounded-xl">
                      <Icon name={`${doc.icon}-outline`} size={20} color="#2ec4b6" />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-800 font-medium">{doc.name}</Text>
                      <Text className="text-gray-500 text-sm">{doc.type} • {doc.size}</Text>
                    </View>
                  </View>
                  <Icon name="download-outline" size={20} color="#6b7280" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment History */}
          <View className="bg-white rounded-3xl p-6 shadow-sm mb-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">Payment History</Text>
              <TouchableOpacity className="bg-primary-100/10 px-3 py-1 rounded-full">
                <Text className="text-primary-100 font-medium">View All</Text>
              </TouchableOpacity>
            </View>
            <View className="space-y-3">
              {[
                { date: '2025-05-01', amount: 450, status: 'Paid', method: 'UPI' },
                { date: '2025-04-01', amount: 450, status: 'Paid', method: 'Bank Transfer' },
                { date: '2025-03-01', amount: 450, status: 'Paid', method: 'Card' }
              ].map((payment, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between bg-gray-50 p-4 rounded-xl"
                >
                  <View>
                    <Text className="text-gray-800 font-medium">
                      {new Date(payment.date).toLocaleDateString()}
                    </Text>
                    <Text className="text-gray-500 text-sm">{payment.method}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-gray-800 font-bold">${payment.amount}</Text>
                    <View className="bg-green-100 px-2 py-1 rounded-full mt-1">
                      <Text className="text-green-700 text-xs font-medium">{payment.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-4 mb-6">
            <TouchableOpacity className="flex-1 bg-primary-100 py-4 rounded-xl items-center">
              <Text className="text-white font-bold">Download Statement</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-blue-500 py-4 rounded-xl items-center">
              <Text className="text-white font-bold">Get NOC</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LoanDetails;