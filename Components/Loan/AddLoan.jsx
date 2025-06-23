import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import CalendarPicker from 'react-native-calendar-picker'; // Adjust path to your action
import { getallcustomer, getsingleCustomerdetails } from '../../redux/Slices/customerSlice';
import { useToast } from '../../Context/ToastContext';
import { createLoanforcustomer } from '../../redux/Slices/loanSlice';

const AddLoan = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { CustomerByagent, customerError, hasMorecutomer, isloadingcustomer } = useSelector((state) => state.customer);
  const { isLoadingLoan } = useSelector((state) => state.loanstore);
  // Get customer_id from route params if available
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

  const [showTenureDetails, setShowTenureDetails] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showFrequencyDropdown, setShowFrequencyDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const selectedCustomer = CustomerByagent.find(c => c.id === formData.customer_id);
  const selectedFrequency = frequencyOptions.find(f => f.value === formData.payment_frequency);

  // Fetch customers
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
  }, [dispatch]);

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
      duration: '' // Reset duration when frequency changes
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

  // New repayment calculation using simple interest: Total = Principal + (P × R × T / 100)
  const calculateLoanDetails = () => {
    const principal = parseFloat(formData.principal_amount) || 0;
    const rate = parseFloat(formData.interest_rate) || 0;
    const periods = parseInt(formData.duration) || 0;

    if (!principal || !periods || !rate) return [];

    const isWeekly = formData.payment_frequency === 'WEEKLY';
    const periodsPerYear = isWeekly ? 52 : 12;
    const timeInYears = periods / periodsPerYear; // Convert periods to years

    // Total interest = P × R × T / 100
    const totalInterest = (principal * rate * timeInYears) / 100;
    const totalAmount = principal + totalInterest;

    // Equal principal payment per period
    const principalPerPeriod = principal / periods;
    // Interest per period (pro-rated based on total interest)
    const interestPerPeriod = totalInterest / periods;
    // Total payment per period
    const totalPerPeriod = principalPerPeriod + interestPerPeriod;

    let remainingBalance = principal;
    const details = [];

    for (let period = 1; period <= periods; period++) {
      remainingBalance -= principalPerPeriod;

      details.push({
        period,
        principal: principalPerPeriod.toFixed(2),
        interest: interestPerPeriod.toFixed(2),
        total: totalPerPeriod.toFixed(2),
        balance: Math.max(0, remainingBalance).toFixed(2)
      });
    }

    return details;
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

  const handleSubmit = () => {
    const payload = generatePayload();
    dispatch(createLoanforcustomer(payload)).then((response)=>{
      if(response?.payload?.success){
        showToast({
          message: 'Loan created Successfully!',
          type: 'success',
          duration: 3000,
          position: 'top' // or 'bottom'
        })
        dispatch(getsingleCustomerdetails(formData.customer_id));
        navigation.goBack();
      }
      else{
        showToast({
          message: response?.payload?.message || "Failed to create loan",
          type: 'error',
          duration: 3000,
          position: 'top' // or 'bottom'
        })
      }
    })
    // Handle submission logic here
  };


  // Load more customers when reaching the end of the list
  const loadMoreCustomers = () => {
    if (hasMorecutomer && !isLoadingMore && !isloadingcustomer) {
      const nextPage = pageNum + 1;
      setPageNum(nextPage);
      fetchCustomer(nextPage, false, true);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = () => {
    setRefreshing(true);
    setPageNum(1);
    setSearchQuery('');
    fetchCustomer(1, true);
  };

  const renderDatePicker = () => (
    <Modal
      visible={showDatePicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowDatePicker(false)}
    >
      <View className="flex-1 justify-center bg-black/50 px-4">
        <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-3xl p-6 max-h-[80%]`}>
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Select Start Date</Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(false)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                }`}
            >
              <Icon
                name="close"
                size={20}
                color={isDarkMode ? '#fff' : '#1f2937'}
              />
            </TouchableOpacity>
          </View>

          {/* Calendar Picker */}
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

          {/* Info Text */}
          <View className={`mt-4 p-3 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
            }`}>
            <Text className={`text-sm text-center ${isDarkMode ? 'text-blue-400' : 'text-blue-600'
              }`}>
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
          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'
            } rounded-2xl p-4 max-h-[80%]`}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'
                }`}>Select Customer</Text>
              <TouchableOpacity
                onPress={() => setShowCustomerDropdown(false)}
                className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                  }`}
              >
                <Icon
                  name="close"
                  size={20}
                  color={isDarkMode ? '#fff' : '#1f2937'}
                />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
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
                }`}>Error loading customers: {customerError}</Text>
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
                    }`}>{item.id} - {item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <Text className={`text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>No customers found</Text>
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
          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'
            } rounded-2xl p-4`}>
            <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Payment Frequency</Text>

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
                  }`}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderTenureModal = () => (
    <Modal
      visible={showTenureDetails}
      transparent
      animationType="slide"
      onRequestClose={() => setShowTenureDetails(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-t-3xl p-6 flex-1`}>
          {/* Header */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Repayment Schedule
            </Text>
            <TouchableOpacity
              onPress={() => setShowTenureDetails(false)}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              <Icon name="close" size={20} color={isDarkMode ? '#fff' : '#1f2937'} />
            </TouchableOpacity>
          </View>

          {/* Summary Cards */}
          <View className="flex-row flex-wrap justify-between mb-6">
            <View className={`w-[48%] p-4 rounded-2xl mb-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Principal
              </Text>
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                ₹{formData.principal_amount || '0'}
              </Text>
            </View>
            <View className={`w-[48%] p-4 rounded-2xl mb-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Duration
              </Text>
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {formData.duration || '0'} {selectedFrequency?.durationLabel}
              </Text>
            </View>
            <View className={`w-[48%] p-4 rounded-2xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Interest Rate
              </Text>
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {formData.interest_rate || '0'}%
              </Text>
            </View>
            <View className={`w-[48%] p-4 rounded-2xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <Text className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {selectedFrequency?.label} Payment
              </Text>
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                ₹{calculateLoanDetails()[0]?.total || '0'}
              </Text>
            </View>
          </View>

          {/* Repayment Table */}
          <View className={`rounded-2xl overflow-hidden ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray-50'} flex-1`}>
            <View className="flex-row p-4">
              <Text className={`w-1/4 font-semibold text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedFrequency?.durationLabel.slice(0, -1)}
              </Text>
              <Text className={`w-1/4 font-semibold text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Principal
              </Text>
              <Text className={`w-1/4 font-semibold text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Interest
              </Text>
              <Text className={`w-1/4 font-semibold text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Total
              </Text>
            </View>
            <FlatList
              data={calculateLoanDetails()}
              className='mb-2'
              keyExtractor={(item) => item.period.toString()}
              renderItem={({ item, index }) => (
                <View
                  className={`flex-row p-4 ${index % 2 === 0
                      ? isDarkMode
                        ? 'bg-gray-800/50'
                        : 'bg-white'
                      : isDarkMode
                        ? 'bg-gray-800/20'
                        : 'bg-gray-100/50'
                    }`}
                >
                  <Text className={`w-1/4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {item.period}
                  </Text>
                  <Text className={`w-1/4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    ₹{item.principal}
                  </Text>
                  <Text className={`w-1/4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    ₹{item.interest}
                  </Text>
                  <Text className={`w-1/4 text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    ₹{item.total}
                  </Text>
                </View>
              )}
              ListEmptyComponent={() => (
                <Text className={`text-center text-sm p-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No repayment schedule available
                </Text>
              )}
              contentContainerStyle={{ paddingBottom: 150 }} // Add padding to account for footer
            />
          </View>

          {/* Summary Footer */}
          {calculateLoanDetails().length > 0 && (
            <LinearGradient
              style={{ borderRadius: 20 }}
              colors={isDarkMode ? ['#134e4a', '#0f766e'] : ['#0f766e', '#0d9488']}
              className="mt-6 p-6 rounded-2xl absolute bottom-6 left-6 right-6"
            >
              <Text className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-white'}`}>
                Payment Summary
              </Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-100'}`}>
                    Total Principal
                  </Text>
                  <Text className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-white'}`}>
                    ₹{parseFloat(formData.principal_amount).toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-100'}`}>
                    Total Interest
                  </Text>
                  <Text className={`text-sm font-semibold ${isDarkMode ? 'text-orange-400' : 'text-orange-300'}`}>
                    ₹{calculateLoanDetails()
                      .reduce((sum, item) => sum + parseFloat(item.interest), 0)
                      .toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between border-t border-white/20 pt-2 mt-2">
                  <Text className={`text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-100'}`}>
                    Total Payable
                  </Text>
                  <Text className={`text-sm font-bold ${isDarkMode ? 'text-teal-400' : 'text-teal-300'}`}>
                    ₹{calculateLoanDetails()
                      .reduce((sum, item) => sum + parseFloat(item.total), 0)
                      .toFixed(2)}
                  </Text>
                </View>
              </View>
            </LinearGradient>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
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
        {/* Customer Selection */}
        <View className={`${isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'
          } backdrop-blur-xl p-6 rounded-3xl shadow-xl mb-6 border ${isDarkMode ? 'border-gray-700/50' : 'border-white/50'
          }`}>
          <View className="flex-row items-center mb-4">
            <View className={`p-2 rounded-xl mr-3 ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-50'
              }`}>
              <Icon name="person" size={20} color={isDarkMode ? '#60a5fa' : '#3b82f6'} />
            </View>
            <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>Customer Selection</Text>
          </View>

          {routeCustomerId ? (
            <View className={`p-4 rounded-2xl ${isDarkMode ? 'bg-teal-900/30 border border-teal-500/30' : 'bg-teal-50 border border-teal-200'
              }`}>
              <Text className={`text-sm font-medium mb-1 ${isDarkMode ? 'text-teal-400' : 'text-teal-700'
                }`}>Selected Customer</Text>
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
                  }`}>Customer</Text>
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

        {/* Loan Details */}
        <View className={`${isDarkMode ? 'bg-gray-800/95' : 'bg-white/95'
          } backdrop-blur-xl p-6 rounded-3xl shadow-xl mb-6 border ${isDarkMode ? 'border-gray-700/50' : 'border-white/50'
          }`}>
          <View className="flex-row items-center mb-6">
            <View className={`p-2 rounded-xl mr-3 ${isDarkMode ? 'bg-green-500/20' : 'bg-green-50'
              }`}>
              <Icon name="calculator" size={20} color={isDarkMode ? '#34d399' : '#10b981'} />
            </View>
            <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'
              }`}>Loan Details</Text>
          </View>

          <View className="space-y-6">
            {/* Principal Amount */}
            <View>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                } mb-3 font-medium`}>Principal Amount</Text>
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

            {/* Interest Rate */}
            <View>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                } mb-3 font-medium`}>Interest Rate (%)</Text>
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

            {/* Payment Frequency */}
            <View>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                } mb-3 font-medium`}>Payment Frequency</Text>
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

            {/* Duration */}
            <View>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                } mb-3 font-medium`}>Duration ({selectedFrequency?.durationLabel || 'Periods'})</Text>
              <TextInput
                className={`border-2 rounded-2xl p-4 text-lg font-semibold ${isDarkMode
                  ? 'bg-gray-700/50 border-gray-600 text-gray-100'
                  : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                placeholder={`Enter duration in ${selectedFrequency?.durationLabel.toLowerCase() || 'periods'}`}
                placeholderTextColor={isDarkMode ? '#9ca3af' : '#6b7280'}
                keyboardType="numeric"
                value={formData.duration}
                onChangeText={(value) => setFormData({ ...formData, duration: value })}
              />
            </View>

            {/* Start Date */}
            <View>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                } mb-3 font-medium`}>Start Date</Text>
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

            {/* View Repayment Schedule Button */}
            {formData.principal_amount && formData.duration && formData.interest_rate && (
              <TouchableOpacity
                className={`mt-4 p-4 rounded-2xl border-2 ${isDarkMode
                  ? 'border-teal-500/50 bg-teal-900/30'
                  : 'border-teal-300 bg-teal-50'
                  }`}
                onPress={() => setShowTenureDetails(true)}
              >
                <View className="flex-row items-center justify-center">
                  <Icon
                    name="calendar"
                    size={20}
                    color={isDarkMode ? '#2dd4bf' : '#0f766e'}
                  />
                  <Text className={`ml-2 text-center font-semibold ${isDarkMode ? 'text-teal-400' : 'text-teal-700'
                    }`}>
                    View Repayment Schedule
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className="mb-8 shadow-2xl"
          activeOpacity={0.8}
          disabled={!formData.principal_amount || !formData.duration || !formData.interest_rate || isLoadingLoan}
          onPress={handleSubmit}
        >
          <LinearGradient
            style={{ borderRadius: 14 }}
            colors={isDarkMode ? isLoadingLoan ? ['#ebf4f5', '#b5c6e0'] : ['#0f766e', '#134e4a'] : isLoadingLoan ? ['#ebf4f5', '#b5c6e0'] : ['#0d9488', '#0f766e']}
            className="p-5 rounded-3xl"
          >
            <View className="flex-row items-center justify-center">
              <Icon name="checkmark-circle" size={24} color="white" />
              <Text className="text-white text-lg font-bold ml-2">Create Loan Application</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Modals */}
        {renderCustomerDropdown()}
        {renderFrequencyDropdown()}
        {renderTenureModal()}
        {renderDatePicker()}
      </ScrollView>
    </View>
  );
};

export default AddLoan;