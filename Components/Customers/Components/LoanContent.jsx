// components/CustomerDetails/LoanContent.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
  FlatList,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { getsingleloanapi, singleLoanRepaymentsAPI } from '../../../redux/Slices/loanSlice';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.7;

const LoanContent = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const navigation = useNavigation();
  const { getsinglecustomerdetailsData } = useSelector((state) => state.customer);
  const singleData = getsinglecustomerdetailsData?.data;
  const [selectedCurrentLoan, setSelectedCurrentLoan] = useState(0);
  const dispatch = useDispatch();
  const { SingleLoanrepaymentsData, loanerror, isLoadingLoan } = useSelector((state) => state.loanstore);

  // Bottom Sheet State
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [sheetType, setSheetType] = useState(''); // 'pending' or 'paid' or 'partial'
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Separate active and past loans
  const activeLoans = singleData?.loans?.filter(loan => loan.status === 'ACTIVE') || [];
  const pastLoans = singleData?.loans?.filter(loan => loan.status !== 'ACTIVE') || [];
  const paidterms = SingleLoanrepaymentsData?.data?.filter((term) => term.status === 'PAID') || [];
  const pendingterms = SingleLoanrepaymentsData?.data?.filter((term) => term.status === 'PENDING') || [];
  const partialterms = SingleLoanrepaymentsData?.data?.filter((term) => term.status === 'PARTIAL') || [];

  // Debug logs to check data
  console.log('SingleLoanrepaymentsData:', SingleLoanrepaymentsData);
  console.log('Paid terms:', paidterms);
  console.log('Pending terms:', pendingterms);
  console.log('Partial terms:', partialterms);
  console.log('Sheet type:', sheetType);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not yet paid';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  //indian currency format
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // Bottom Sheet Functions
  const openBottomSheet = (type) => {
    console.log('Opening bottom sheet with type:', type);
    setSheetType(type);
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
        toValue: SHEET_HEIGHT,
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
      setSheetType('');
    });
  };

  // Pan Responder for swipe to close
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

  const renderNoPastLoans = () => (
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 mb-5 shadow-sm items-center`}>
      <Icon name="document-text-outline" size={48} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
      <Text className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mt-3 mb-2`}>
        No Past Loans
      </Text>
      <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center text-sm`}>
        Your loan history will appear here once you complete a loan.
      </Text>
    </View>
  );

  const calculateProgress = (loan) => {
    return (loan.total_paid / loan.total_repayment_amount) * 100;
  };

  const getCurrentLoan = () => {
    if (activeLoans?.length === 0) {
      return null;
    }
    return activeLoans[selectedCurrentLoan];
  };

  const getStatusColor = (status, isDark) => {
    switch (status) {
      case 'ACTIVE':
        return isDark ? 'bg-green-900 text-green-400' : 'bg-green-500 text-white';
      case 'COMPLETED':
        return isDark ? 'bg-sky-900 text-sky-400' : 'bg-sky-500 text-white';
      case 'DEFAULTED':
        return isDark ? 'bg-red-900 text-red-400' : 'bg-red-100 text-red-700';
      case 'PAID':
        return isDark ? 'bg-green-900 text-green-400' : 'bg-green-500 text-white';
      case 'PENDING':
        return isDark ? 'bg-orange-900 text-orange-400' : 'bg-orange-500 text-white';
      case 'PARTIAL':
        return isDark ? 'bg-blue-900 text-blue-400' : 'bg-blue-500 text-white';
      default:
        return isDark ? 'bg-gray-900 text-gray-400' : 'bg-gray-100 text-gray-700';
    }
  };

  const NoCurrentLoans = () => {
    return (
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 mb-5 shadow-sm items-center`}>
        <Icon name="wallet-outline" size={64} color={isDarkMode ? '#6b7280' : '#9ca3af'} />
        <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mt-4 mb-2`}>
          No Active Loans
        </Text>
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center mb-6`}>
          You don't have any active loans at the moment.
        </Text>
        <TouchableOpacity
          className={`${isDarkMode ? 'bg-teal-600' : 'bg-primary-100'} py-3 px-6 rounded-xl`}
          onPress={() => navigation.navigate('addloan', { id: singleData?.id, name: singleData?.name })}
        >
          <Text className="text-white font-bold">Apply for New Loan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Fixed Repayment Item Component for Bottom Sheet
  const RepaymentItem = ({ item }) => {
    return (
      <View
        className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-2xl p-4 mb-3`}
      >
        <View className="flex-row bg justify-between items-center mb-3">
          <View className="flex-row items-center">
            <View className={`${isDarkMode ? 'bg-teal-900' : 'bg-teal-100'} p-2 rounded-lg mr-3`}>
              <Icon name="receipt-outline" size={20} color={isDarkMode ? '#2dd4bf' : '#2ec4b6'} />
            </View>
            <View>
              <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold`}>
                Installment #{item.installment_number}
              </Text>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>
                ID: {item.id}
              </Text>
            </View>
          </View>
          <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status, isDarkMode)}`}>
            <Text className="text-xs font-medium text-white">
              {item.status}
            </Text>
          </View>
        </View>

        {/* Amount Details Grid */}
        <View className="flex-row flex-wrap -mx-1 mb-3">
          <View className="w-1/2 px-1 mb-2">
            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Principal</Text>
            <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold`}>
              {formatCurrency(item.principal_amount)}
            </Text>
          </View>
          <View className="w-1/2 px-1 mb-2">
            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Interest</Text>
            <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold`}>
              {formatCurrency(item.interest_amount)}
            </Text>
          </View>
          <View className="w-1/2 px-1">
            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Total Amount</Text>
            <Text className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'} font-bold`}>
              {formatCurrency(item.total_amount)}
            </Text>
          </View>
          <View className="w-1/2 px-1">
            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>Due Date</Text>
            <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold`}>
              {formatDate(item.due_date)}
            </Text>
          </View>
          {/* Show remaining amount if PARTIAL */}
          {item.status === 'PARTIAL' && (
            <View className="w-full px-1 mt-2">
              <Text className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} text-xs font-semibold`}>
                Remain: {formatCurrency((item.total_amount || 0) - (item.amount_paid || 0))}
              </Text>
            </View>
          )}
        </View>

        {/* Payment Date */}
        <View className={`${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'} p-3 rounded-lg`}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Icon
                name={item.payment_date ? "checkmark-circle" : "time-outline"}
                size={16}
                color={item.payment_date ? (isDarkMode ? '#22c55e' : '#16a34a') : (isDarkMode ? '#f59e0b' : '#d97706')}
              />
              <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-xs ml-2`}>
                Payment Date
              </Text>
            </View>
            <Text className={`${item.payment_date
              ? (isDarkMode ? 'text-green-400' : 'text-green-600')
              : (isDarkMode ? 'text-orange-400' : 'text-orange-600')
              } font-medium text-xs`}>
              {formatDate(item.payment_date)}
            </Text>
          </View>

          {item.notes && (
            <View className={`mt-2 pt-2 ${isDarkMode ? 'border-gray-500' : 'border-gray-300'} border-t`}>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                Note: {item.notes}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Fixed Bottom Sheet Component
  const BottomSheet = () => {
    const currentData =
      sheetType === 'paid' ? paidterms :
        sheetType === 'pending' ? pendingterms :
          sheetType === 'partial' ? partialterms : [];

    console.log('Rendering bottom sheet with data:', currentData);

    return (
      <Modal
        visible={bottomSheetVisible}
        transparent
        animationType="none"
        statusBarTranslucent={true}
        onRequestClose={closeBottomSheet}
      >
        <StatusBar hidden={true} />
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
              height: SHEET_HEIGHT,
              transform: [{ translateY: slideAnim }],
            }}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl overflow-hidden`}
          >
            {/* Handle */}
            <View className="items-center py-3">
              <View className={`w-12 h-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} rounded-full`} />
            </View>

            {/* Header with gesture drag only */}
            <View
              {...panResponder.panHandlers}
              className={`px-6 pb-4 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} border-b`}
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {sheetType === 'paid' ? 'Completed Payments' : sheetType === 'partial' ? 'Partial Payments' : 'Pending Payments'}
                  </Text>
                  <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                    {currentData.length} installments
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={closeBottomSheet}
                  className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-2 rounded-full`}
                >
                  <Icon name="close" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content */}
            {currentData.length > 0 ? (
              <FlatList
                data={currentData}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                renderItem={({ item }) => <RepaymentItem item={item} />}
                contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
                showsVerticalScrollIndicator
                scrollEnabled
                keyboardShouldPersistTaps="handled"
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                getItemLayout={(data, index) => (
                  { length: 160, offset: 160 * index, index } // 160 is estimated item height
                )}
              />
            ) : (
              <View className="flex-1 items-center justify-center px-6">
                <Icon
                  name={sheetType === 'paid' ? 'checkmark-done-circle-outline' : sheetType === 'partial' ? 'alert-circle-outline' : 'time-outline'}
                  size={48}
                  color={isDarkMode ? '#6b7280' : '#9ca3af'}
                />
                <Text className={`text-lg font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mt-3 mb-2`}>
                  No {sheetType === 'paid' ? 'Completed' : sheetType === 'partial' ? 'Partial' : 'Pending'} Payments
                </Text>
                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>
                  {sheetType === 'paid'
                    ? 'No payments have been completed yet.'
                    : sheetType === 'partial'
                      ? 'No partial payments found.'
                      : 'All payments are up to date!'}
                </Text>
              </View>
            )}
          </Animated.View>

        </View>
      </Modal>
    );
  };

  const currentLoan = getCurrentLoan();

  useEffect(() => {
    if (currentLoan?.id) {
      dispatch(singleLoanRepaymentsAPI(currentLoan?.id));
    }
  }, [currentLoan])

  return (
    <>
      <ScrollView className={`px-5 pb-5 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        {/* Current Loans Header with Selector */}
        {activeLoans.length > 1 && (
          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-4 mb-5 shadow-sm`}>
            <Text className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-3`}>
              Select Current Loan ({activeLoans.length} Active)
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row" style={{ gap: 12 }}>
                {activeLoans.map((loan, index) => (
                  <TouchableOpacity
                    key={loan.id}
                    onPress={() => setSelectedCurrentLoan(index)}
                    className={`px-4 py-3 rounded-xl min-w-32 ${selectedCurrentLoan === index
                      ? isDarkMode ? 'bg-teal-600' : 'bg-primary-100'
                      : isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                  >
                    <Text className={`text-xs font-medium ${selectedCurrentLoan === index
                      ? 'text-white'
                      : isDarkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                      {loan.id}
                    </Text>
                    <Text className={`text-lg font-bold ${selectedCurrentLoan === index
                      ? 'text-white'
                      : isDarkMode ? 'text-gray-100' : 'text-gray-800'
                      }`}>
                      {formatCurrency(loan.principal_amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}
        {activeLoans.length === 0 && <NoCurrentLoans />}

        {/* Current Loan Details Card */}
        {currentLoan && <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 mb-5 shadow-sm`}>
          <View className="flex-row items-center mb-4">
            <View className={`${isDarkMode ? 'bg-teal-900' : 'bg-teal-100'} p-3 rounded-xl`}>
              <Icon name="wallet-outline" size={24} color={isDarkMode ? '#2dd4bf' : '#2ec4b6'} />
            </View>
            <View className="flex-1 ml-3">
              <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Current Loan
              </Text>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ID: {currentLoan.id}
              </Text>
            </View>
            <View className={`px-3 py-1 rounded-full ${getStatusColor(currentLoan.status, isDarkMode)}`}>
              <Text className="text-xs font-medium">
                {currentLoan.status}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>Principal Amount</Text>
              <Text className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {formatCurrency(currentLoan.principal_amount)}
              </Text>
            </View>
            <View>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm text-right`}>{currentLoan?.payment_frequency === "WEEKLY" ? "Weekly" : "Monthly"} Payment</Text>
              <Text className={`text-2xl font-semibold ${isDarkMode ? 'text-teal-400' : 'text-teal-600'}`}>
                {formatCurrency(currentLoan.installment_amount)}
              </Text>
            </View>
          </View>

          {/* Payment Status Cards */}
          <View className="flex-row mb-6" style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={() => openBottomSheet('pending')}
              className={`flex-1 ${isDarkMode ? 'bg-orange-900' : 'bg-orange-50'} p-4 rounded-2xl`}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Icon name="time-outline" size={20} color={isDarkMode ? '#fb923c' : '#ea580c'} />
                <Text className={`${isDarkMode ? 'text-orange-400' : 'text-orange-600'} text-xs font-medium`}>
                  VIEW ALL
                </Text>
              </View>
              <Text className={`${isDarkMode ? 'text-orange-400' : 'text-orange-600'} text-2xl font-bold mb-1`}>
                {pendingterms.length}
              </Text>
              <Text className={`${isDarkMode ? 'text-orange-300' : 'text-orange-500'} text-xs`}>
                Remaining
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openBottomSheet('paid')}
              className={`flex-1 ${isDarkMode ? 'bg-green-900' : 'bg-green-50'} p-4 rounded-2xl`}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Icon name="checkmark-done-outline" size={20} color={isDarkMode ? '#4ade80' : '#16a34a'} />
                <Text className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} text-xs font-medium`}>
                  VIEW ALL
                </Text>
              </View>
              <Text className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} text-2xl font-bold mb-1`}>
                {paidterms.length}
              </Text>
              <Text className={`${isDarkMode ? 'text-green-300' : 'text-green-500'} text-xs`}>
                Completed
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => openBottomSheet('partial')}
              className={`flex-1 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-50'} p-4 rounded-2xl`}
            >
              <View className="flex-row items-center justify-between mb-2">
                <Icon name="alert-circle-outline" size={20} color={isDarkMode ? '#87bfff' : '#2667ff'} />
                <Text className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} text-xs font-medium`}>
                  VIEW ALL
                </Text>
              </View>
              <Text className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'} text-2xl font-bold mb-1`}>
                {partialterms.length}
              </Text>
              <Text className={`${isDarkMode ? 'text-blue-300' : 'text-blue-500'} text-xs`}>
                Partial
              </Text>
            </TouchableOpacity>
          </View>

          {/* Enhanced Key Details Grid */}
          <View className="flex-row flex-wrap -mx-2">
            {[
              {
                icon: 'calendar-outline',
                label: 'Start Date',
                value: formatDate(currentLoan.start_date)
              },
              {
                icon: 'calendar-clear-outline',
                label: 'End Date',
                value: formatDate(currentLoan.end_date)
              },
              {
                icon: 'trending-up-outline',
                label: 'Interest Rate',
                value: `${currentLoan.interest_rate}%`
              },
              {
                icon: 'repeat-outline',
                label: 'Frequency',
                value: currentLoan.payment_frequency
              },
              {
                icon: 'cash-outline',
                label: 'Total Amount',
                value: formatCurrency(currentLoan.total_repayment_amount)
              },
              {
                icon: 'card-outline',
                label: 'Disbursement',
                value: formatDate(currentLoan.disbursement_date)
              },
            ].map((item, index) => (
              <View key={index} className="w-1/2 p-2">
                <View className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-3 rounded-xl`}>
                  <View className="flex-row items-center mb-2">
                    <Icon name={item.icon} size={16} color={isDarkMode ? '#2dd4bf' : '#2ec4b6'} />
                    <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs ml-2 flex-1`}>
                      {item.label}
                    </Text>
                  </View>
                  <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold text-xs`}>
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>}

        {/* Past Loans Section */}
        <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 mb-5 shadow-sm`}>
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>
            Past Loans ({pastLoans.length})
          </Text>
          {
            pastLoans.length === 0 ? (
              renderNoPastLoans()
            ) : (
              <View className="flex flex-col" style={{ gap: 12 }}>
                {pastLoans.map((loan, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      navigation.navigate('Loandetails', { loanId: loan?.id });
                      dispatch(getsingleloanapi(loan?.id));
                    }}
                  >
                    <View className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-2xl`}>
                      <View className="flex-row justify-between items-center mb-3">
                        <Text className={`${isDarkMode ? 'text-teal-400' : 'text-teal-600'} font-semibold`}>
                          {loan.id}
                        </Text>
                        <View className={`px-3 py-1 rounded-full ${getStatusColor(loan.status, isDarkMode)}`}>
                          <Text className="text-xs font-medium">
                            {loan.status}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between mb-2">
                        <View className="flex-1">
                          <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>Principal</Text>
                          <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold`}>
                            {formatCurrency(loan.principal_amount)}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>Interest Rate</Text>
                          <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold`}>
                            {loan.interest_rate}%
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between mb-2">
                        <View className="flex-1">
                          <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>Start Date</Text>
                          <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                            {formatDate(loan.start_date)}
                          </Text>
                        </View>
                        <View className="flex-1">
                          <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-xs`}>End Date</Text>
                          <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                            {formatDate(loan.end_date)}
                          </Text>
                        </View>
                      </View>

                      {loan.completion_note && (
                        <View className={`${isDarkMode ? 'bg-gray-600/30' : 'bg-gray-100'} p-2 rounded-lg mt-2`}>
                          <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Note: {loan.completion_note}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )
          }
        </View>

        {/* Loan Actions */}
        <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-sm mb-5`}>
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>
            Loan Actions
          </Text>
          <View className="flex flex-col" style={{ gap: 12 }}>
            {[
              { icon: 'card-outline', label: 'Make Payment', color: 'primary-100', action: 'payment' },
              { icon: 'download-outline', label: 'Download Statement', color: 'blue-500', action: 'statement' },
              { icon: 'calculator-outline', label: 'EMI Calculator', color: 'purple-500', action: 'calculator' },
              { icon: 'add-circle-outline', label: 'Request New Loan', color: 'green-500', action: 'newloan' },
            ].map((action, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center justify-between p-4 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-2xl`}
                onPress={() => {
                  if (action.action === 'newloan') {
                    navigation.navigate('addloan', { id: singleData.id, name: singleData.name });
                  } else if (action.action === 'payment') {
                    console.log('Make Payment for:', currentLoan.id);
                  } else if (action.action === 'statement') {
                    console.log('Download Statement for:', currentLoan.id);
                  } else if (action.action === 'calculator') {
                    console.log('Open EMI Calculator');
                  }
                }}
              >
                <View className="flex-row items-center">
                  <View className={`${isDarkMode ? 'bg-gray-600' : `bg-${action.color}/10`} p-2 rounded-xl mr-3`}>
                    <Icon
                      name={action.icon}
                      size={20}
                      color={isDarkMode ? '#2dd4bf' : `#${action.color === 'primary-100' ? '2ec4b6' :
                        action.color === 'blue-500' ? '3b82f6' :
                          action.color === 'purple-500' ? '8b5cf6' : '22c55e'
                        }`}
                    />
                  </View>
                  <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-medium`}>
                    {action.label}
                  </Text>
                </View>
                <Icon name="chevron-forward" size={20} color={isDarkMode ? '#6b7280' : '#6b7280'} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sheet */}
      <BottomSheet />
    </>
  );
};

export default LoanContent;