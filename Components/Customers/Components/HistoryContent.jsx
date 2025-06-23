// components/CustomerDetails/HistoryContent.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { singleLoanRepaymentsAPI } from '../../../redux/Slices/loanSlice';

const HistoryContent = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { getsinglecustomerdetailsData } = useSelector((state) => state.customer);
  const { SingleLoanrepaymentsData, loanerror, isLoadingLoan } = useSelector((state) => state.loanstore);
  const dispatch = useDispatch();
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showLoanFilter, setShowLoanFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const statusOptions = ['All', 'Paid', 'Pending', 'Overdue'];

  // Primary colors
  const primaryColor = '#1a9c94';
  const primaryLightColor = '#2ec4b6';

  const filteredPayments = selectedStatus === 'All'
    ? SingleLoanrepaymentsData?.data || []
    : SingleLoanrepaymentsData?.data?.filter(payment =>
      payment.status.toLowerCase() === selectedStatus?.toLowerCase()
    ) || [];

  const loans = getsinglecustomerdetailsData?.data?.loans || [];

  useEffect(() => {
    if (selectedLoanId && selectedLoanId !== 'All') {
      dispatch(singleLoanRepaymentsAPI(selectedLoanId));
    }
  }, [selectedLoanId, dispatch]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRetry = () => {
    if (selectedLoanId) {
      dispatch(singleLoanRepaymentsAPI(selectedLoanId));
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return isDarkMode
          ? 'bg-emerald-900/40 text-emerald-300 border-emerald-800'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return isDarkMode
          ? 'bg-amber-900/40 text-amber-300 border-amber-800'
          : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'overdue':
        return isDarkMode
          ? 'bg-rose-900/40 text-rose-300 border-rose-800'
          : 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return isDarkMode
          ? 'bg-slate-700/40 text-slate-300 border-slate-600'
          : 'bg-slate-100 text-slate-600 border-slate-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'checkmark-circle';
      case 'pending': return 'time';
      case 'overdue': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const getContainerStyles = () => {
    return isDarkMode
      ? 'bg-slate-900'
      : 'bg-primary-50';
  };

  const getCardStyles = () => {
    return isDarkMode
      ? 'bg-slate-800 border border-slate-700'
      : 'bg-white border border-primary-200 shadow-lg';
  };

  const getDropdownStyles = () => {
    return isDarkMode
      ? 'bg-slate-800 border border-slate-600 shadow-xl'
      : 'bg-white border border-primary-200 shadow-lg';
  };

  const getPaymentCardStyles = () => {
    return isDarkMode
      ? 'bg-slate-700 border border-slate-600'
      : 'bg-white border border-primary-100 shadow-md';
  };

  const getPrimaryButtonStyles = () => {
    return isDarkMode
      ? 'bg-teal-700 border border-teal-600'
      : 'bg-primary-100 border border-primary-200';
  };

  // No loans available state
  if (loans.length === 0) {
    return (
      <ScrollView
        className={`flex-1  ${isDarkMode ? 'bg-slate-900' : 'bg-primary-50'}`}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="flex-1 px-4 py-6"
        >
          <View className={`${getCardStyles()} rounded-2xl p-8 mx-2 my-4`}>
            <View className="items-center py-16">
              <View className={`w-32 h-32 rounded-full items-center justify-center mb-6 ${isDarkMode ? 'bg-slate-700' : 'bg-primary-100/40'}`}>
                <Icon
                  name="wallet-outline"
                  size={64}
                  color={isDarkMode ? '#64748b' : primaryColor}
                />
              </View>
              <Text className={`text-2xl font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'} mb-4 text-center`}>
                No Loans Available
              </Text>
              <Text className={`text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-center px-8 leading-6`}>
                This customer doesn't have any loans yet. Once loans are created, their payment history will appear here.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className={`flex-1 `}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="flex-1 px-4 pb-7"
      >
        <View className={`${getCardStyles()} rounded-2xl p-6 mx-2`}>
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${isDarkMode ? 'bg-slate-700' : 'bg-primary-100/30'}`}>
              <Icon
                name="time"
                size={28}
                color={isDarkMode ? primaryLightColor : primaryColor}
              />
            </View>
            <View>
              <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Payment History
              </Text>
              <Text className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Track all loan payments and status
              </Text>
            </View>
          </View>

          {/* Loan Selection */}
          <View className="mb-6 relative z-50">
            <Text className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-3 uppercase tracking-wide`}>
              Select Loan
            </Text>

            {/* Dropdown Button */}
            <TouchableOpacity
              onPress={() => {
                setShowLoanFilter(!showLoanFilter);
                setShowStatusFilter(false);
              }}
              className={`flex-row items-center justify-between p-4 rounded-xl border-2 ${isDarkMode
                ? showLoanFilter
                  ? 'border-teal-500 bg-slate-700'
                  : 'border-slate-600 bg-slate-700'
                : showLoanFilter
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-primary-200 bg-white'
                }`}
            >
              <View className="flex-row items-center">
                <Icon
                  name="document-text"
                  size={20}
                  color={isDarkMode ? primaryColor : primaryLightColor}
                />
                <Text className={`ml-3 ${isDarkMode ? 'text-primary-100/60' : 'text-primary-100/70'} text-base font-medium`}>
                  {selectedLoanId ? `Loan #${selectedLoanId}` : 'Choose a loan'}
                </Text>
              </View>
              <Icon
                name={showLoanFilter ? "chevron-up" : "chevron-down"}
                size={20}
                color={isDarkMode ? primaryColor : primaryLightColor}
              />
            </TouchableOpacity>

            {/* Dropdown List */}
            {showLoanFilter && (
              <View className={`absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50 ${getDropdownStyles()}`}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                  style={{ maxHeight: 200 }}
                >
                  {loans.map((loan, index) => (
                    <TouchableOpacity
                      key={loan.id}
                      onPress={() => {
                        setSelectedLoanId(loan.id);
                        setSelectedStatus('All');
                        setShowLoanFilter(false);
                        setShowStatusFilter(false);
                      }}
                      className={`p-4 flex-row items-center ${index !== loans.length - 1
                        ? isDarkMode ? 'border-b border-slate-700' : 'border-b border-primary-100'
                        : ''
                        } ${selectedLoanId === loan.id
                          ? isDarkMode ? 'bg-teal-900/30' : 'bg-primary-100'
                          : isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-primary-50'
                        }`}
                    >
                      <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${selectedLoanId === loan.id
                        ? 'border-teal-500 bg-teal-500'
                        : isDarkMode ? 'border-slate-500' : 'border-primary-300'
                        }`}>
                        {selectedLoanId === loan.id && (
                          <View className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className={`text-base font-medium ${selectedLoanId === loan.id
                          ? isDarkMode ? 'text-white' : 'text-white'
                          : isDarkMode ? 'text-slate-200' : 'text-slate-700'
                          }`}>
                          Loan #{loan.id}
                        </Text>
                        <Text className={`text-sm ${selectedLoanId === loan.id
                          ? 'text-teal-200'
                          : isDarkMode ? 'text-slate-200' : 'text-slate-700'
                          }`}>
                          Amount: ₹{loan.total_repayment_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || 'N/A'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {/* Status Selection */}
          {selectedLoanId && (
            <View className="mb-6 relative z-40">
              <Text className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-3 uppercase tracking-wide`}>
                Filter by Status
              </Text>

              {/* Status Dropdown Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowStatusFilter(!showStatusFilter);
                  setShowLoanFilter(false);
                }}
                className={`flex-row items-center justify-between p-4 rounded-xl border-2 ${isDarkMode
                  ? showStatusFilter
                    ? 'border-teal-500 bg-slate-700'
                    : 'border-slate-600 bg-slate-700'
                  : showStatusFilter
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-primary-200 bg-white'
                  }`}
              >
                <View className="flex-row items-center">
                  <Icon
                    name="filter"
                    size={20}
                    color={isDarkMode ? '#94a3b8' : '#64748b'}
                  />
                  <Text className={`ml-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'} text-base font-medium`}>
                    {selectedStatus || 'All statuses'}
                  </Text>
                </View>
                <Icon
                  name={showStatusFilter ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={isDarkMode ? '#94a3b8' : '#64748b'}
                />
              </TouchableOpacity>

              {/* Status Dropdown List */}
              {showStatusFilter && (
                <View className={`absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-40 ${getDropdownStyles()}`}>
                  {statusOptions.map((status, index) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => {
                        setSelectedStatus(status);
                        setShowStatusFilter(false);
                      }}
                      className={`p-4 flex-row items-center ${index !== statusOptions.length - 1
                        ? isDarkMode ? 'border-b border-slate-700' : 'border-b border-primary-100'
                        : ''
                        } ${selectedStatus === status
                          ? isDarkMode ? 'bg-teal-900/30' : 'bg-primary-100'
                          : isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-primary-50'
                        }`}
                    >
                      <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${selectedStatus === status
                        ? 'border-teal-500 bg-teal-500'
                        : isDarkMode ? 'border-slate-500' : 'border-primary-300'
                        }`}>
                        {selectedStatus === status && (
                          <View className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </View>
                      <Text className={`text-base font-medium ${selectedStatus === status
                        ? isDarkMode ? 'text-teal-300' : 'text-primary-700'
                        : isDarkMode ? 'text-slate-200' : 'text-slate-700'
                        }`}>
                        {status}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Error State */}
          {loanerror && selectedLoanId && (
            <View className={`mb-6 p-6 rounded-xl ${isDarkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
              <View className="items-center">
                <Icon
                  name="alert-circle"
                  size={48}
                  color={isDarkMode ? '#f87171' : '#dc2626'}
                />
                <Text className={`text-lg font-semibold mt-3 mb-2 ${isDarkMode ? 'text-red-300' : 'text-red-700'}`}>
                  Failed to Load Payment History
                </Text>
                <Text className={`text-sm text-center mb-4 ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                  Unable to fetch payment data. Please check your connection and try again.
                </Text>
                <TouchableOpacity
                  onPress={handleRetry}
                  className={`px-6 py-3 rounded-lg flex-row items-center ${getPrimaryButtonStyles()}`}
                >
                  <Icon
                    name="refresh"
                    size={18}
                    color="white"
                  />
                  <Text className="text-white font-semibold ml-2">
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Payment List */}
          {selectedLoanId && selectedStatus && !loanerror && (
            <View className="mt-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} uppercase tracking-wide`}>
                  Payment Records
                </Text>
                <View className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-primary-100'}`}>
                  <Text className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-primary-50'}`}>
                    {filteredPayments.length} records
                  </Text>
                </View>
              </View>

              {isLoadingLoan ? (
                <View className="py-16 items-center">
                  <ActivityIndicator size="large" color={primaryColor} />
                  <Text className={`mt-4 text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Loading payment history...
                  </Text>
                </View>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment, index) => (
                  <View
                    key={payment.id}
                    className={`mb-4 rounded-xl overflow-hidden ${getPaymentCardStyles()}`}
                  >
                    <View className={`p-5 ${payment?.status === "PAID" ? "bg-primary-50/10" : "bg-orange-50/20"}`}>
                      <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                          <View className="flex-row items-center mb-2">
                            <Icon
                              name="calendar-outline"
                              size={16}
                              color={isDarkMode ? '#94a3b8' : '#64748b'}
                            />
                            <Text className={`ml-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              Due: {new Date(payment.due_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Text>
                          </View>
                          <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-1`}>
                            ₹{payment.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Text>
                          <Text className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                            Paid: ₹{payment.amount_paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Text>
                        </View>
                        <View className={`px-4 py-2 rounded-full border ${getStatusColor(payment.status)} flex-row items-center`}>
                          <Icon
                            name={getStatusIcon(payment.status)}
                            size={14}
                            color={payment.status.toLowerCase() === 'paid' ? '#065f46' : payment.status.toLowerCase() === 'pending' ? '#92400e' : '#991b1b'}
                          />
                          <Text className={` ${payment.status.toLowerCase() === 'paid' ? isDarkMode ? 'text-green-300' : 'text-green-700' : payment.status.toLowerCase() === 'pending' ? isDarkMode ? 'text-amber-300' : 'text-amber-700' : isDarkMode ? 'text-red-300' : 'text-red-700'} text-xs font-bold ml-1`}>
                            {payment.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View className={`pt-3 border-t ${isDarkMode ? 'border-slate-600' : 'border-primary-100'}`}>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Icon
                              name="receipt-outline"
                              size={16}
                              color={isDarkMode ? '#94a3b8' : '#64748b'}
                            />
                            <Text className={`text-sm ml-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              ID: {payment.id}
                            </Text>
                          </View>
                          {payment.status.toLowerCase() === 'overdue' && (
                            <Text className={`text-xs font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                              OVERDUE
                            </Text>
                          )}
                        </View>
                        {payment.notes && (
                          <Text className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} italic`}>
                            "{payment.notes}"
                          </Text>
                        )}
                      </View>
                    </View>

                    {payment.status.toLowerCase() === 'pending' && (
                      <TouchableOpacity
                        className={`py-4 items-center flex-row justify-center ${isDarkMode
                          ? 'bg-slate-600 border-t border-slate-600'
                          : 'bg-primary-50 border-t border-primary-100'
                          }`}
                      >
                        <Icon
                          name="card"
                          size={18}
                          color={isDarkMode ? primaryLightColor : primaryColor}
                        />
                        <Text className={`ml-2 font-semibold text-base`} style={{ color: isDarkMode ? primaryLightColor : primaryColor }}>
                          Process Payment
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <View className="py-16 items-center">
                  <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${isDarkMode ? 'bg-slate-700' : 'bg-primary-100'}`}>
                    <Icon
                      name="receipt-outline"
                      size={40}
                      color={isDarkMode ? '#64748b' : primaryColor}
                    />
                  </View>
                  <Text className={`text-xl font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'} mb-3`}>
                    No {selectedStatus !== 'All' ? selectedStatus.toLowerCase() : ''} payments found
                  </Text>
                  <Text className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-center px-8`}>
                    {selectedStatus !== 'All'
                      ? `No ${selectedStatus.toLowerCase()} payment records found for this loan`
                      : 'No payment records found for this loan'
                    }
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Initial State */}
          {!selectedLoanId && (
            <View className="py-16 items-center">
              <View className={`w-28 h-28 rounded-full items-center justify-center mb-6 ${isDarkMode ? 'bg-slate-700' : 'bg-primary-100/40'}`}>
                <Icon
                  name="document-text-outline"
                  size={48}
                  color={isDarkMode ? '#64748b' : primaryColor}
                />
              </View>
              <Text className={`text-xl font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'} mb-3`}>
                Ready to View History
              </Text>
              <Text className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'} text-center px-8 leading-6`}>
                Select a loan from the dropdown above to view detailed payment history and track transaction status
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    </ScrollView>
  );
};

export default HistoryContent;