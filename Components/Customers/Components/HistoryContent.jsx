// components/CustomerDetails/HistoryContent.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { singleLoanRepaymentsAPI } from '../../../redux/Slices/loanSlice';

const HistoryContent = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { getsinglecustomerdetailsData } = useSelector((state) => state.customer);
  const { SingleLoanrepaymentsData, newError, isLoadingLoan } = useSelector((state) => state.loanstore);
  const dispatch = useDispatch();
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showLoanFilter, setShowLoanFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const statusOptions = ['All', 'Paid', 'Pending', 'Overdue'];

  // Centralized theme object
  const theme = {
    light: {
      background: 'bg-primary-50',
      card: 'bg-white border border-primary-200 shadow-lg',
      dropdown: 'bg-white border border-primary-200 shadow-lg',
      paymentCard: 'bg-white border border-primary-100 shadow-md',
      primaryButton: 'bg-primary-100 border border-primary-200',
      text: 'text-slate-900',
      subtext: 'text-slate-600',
      border: 'border-primary-200',
      icon: '#1a9c94',
      iconLight: '#2ec4b6',
      status: {
        paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        overdue: 'bg-rose-50 text-rose-700 border-rose-200',
        default: 'bg-slate-100 text-slate-600 border-slate-300',
      },
    },
    dark: {
      background: 'bg-slate-900',
      card: 'bg-slate-800 border border-slate-700',
      dropdown: 'bg-slate-800 border border-slate-600 shadow-xl',
      paymentCard: 'bg-slate-700 border border-slate-600',
      primaryButton: 'bg-teal-700 border border-teal-600',
      text: 'text-white',
      subtext: 'text-slate-400',
      border: 'border-slate-700',
      icon: '#2ec4b6',
      iconLight: '#1a9c94',
      status: {
        paid: 'bg-emerald-900/40 text-emerald-300 border-emerald-800',
        pending: 'bg-amber-900/40 text-amber-300 border-amber-800',
        overdue: 'bg-rose-900/40 text-rose-300 border-rose-800',
        default: 'bg-slate-700/40 text-slate-300 border-slate-600',
      },
    },
  };
  const currentTheme = isDarkMode ? theme.dark : theme.light;

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
        return currentTheme.status.paid;
      case 'pending':
        return currentTheme.status.pending;
      case 'overdue':
        return currentTheme.status.overdue;
      default:
        return currentTheme.status.default;
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
    return currentTheme.background;
  };

  const getCardStyles = () => {
    return currentTheme.card;
  };

  const getDropdownStyles = () => {
    return currentTheme.dropdown;
  };

  const getPaymentCardStyles = () => {
    return currentTheme.paymentCard;
  };

  const getPrimaryButtonStyles = () => {
    return currentTheme.primaryButton;
  };

  // No loans available state
  if (loans.length === 0) {
    return (
      <ScrollView
        className={`flex-1 ${currentTheme.background}`}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="flex-1 px-4 py-6"
        >
          <View className={`${getCardStyles()} rounded-2xl p-8 mx-2 my-4`}>
            <View className="items-center py-16">
              <View className={`w-32 h-32 rounded-full items-center justify-center mb-6 ${currentTheme.background}`}>
                <Icon
                  name="wallet-outline"
                  size={64}
                  color={currentTheme.icon}
                />
              </View>
              <Text className={`text-2xl font-bold ${currentTheme.text} mb-4 text-center`}>
                No Loans Available
              </Text>
              <Text className={`text-base ${currentTheme.subtext} text-center px-8 leading-6`}>
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
        className="flex-1 px-2 pb-7"
      >
        <View className={`${getCardStyles()} rounded-2xl p-6 mx-2`}>
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${currentTheme.background}`}>
              <Icon
                name="time"
                size={28}
                color={currentTheme.iconLight}
              />
            </View>
            <View>
              <Text className={`text-2xl font-bold ${currentTheme.text}`}>
                Payment History
              </Text>
              <Text className={`text-sm ${currentTheme.subtext}`}>
                Track all loan payments and status
              </Text>
            </View>
          </View>

          {/* Loan Selection */}
          <View className="mb-6 relative z-50">
            <Text className={`text-sm font-semibold ${currentTheme.subtext} mb-3 uppercase tracking-wide`}>
              Select Loan
            </Text>

            {/* Dropdown Button */}
            <TouchableOpacity
              onPress={() => {
                setShowLoanFilter(!showLoanFilter);
                setShowStatusFilter(false);
              }}
              className={`flex-row items-center justify-between p-4 rounded-xl border-2 ${currentTheme.background} ${showLoanFilter ? 'border-teal-500' : 'border-slate-600'}`}
            >
              <View className="flex-row items-center">
                <Icon
                  name="document-text"
                  size={20}
                  color={currentTheme.icon}
                />
                <Text className={`ml-3 ${currentTheme.text} text-base font-medium`}>
                  {selectedLoanId ? `Loan #${selectedLoanId}` : 'Choose a loan'}
                </Text>
              </View>
              <Icon
                name={showLoanFilter ? "chevron-up" : "chevron-down"}
                size={20}
                color={currentTheme.icon}
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
                        ? currentTheme.background
                        : ''
                        } ${selectedLoanId === loan.id
                          ? currentTheme.background
                          : currentTheme.background
                        }`}
                    >
                      <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${selectedLoanId === loan.id
                        ? 'border-teal-500 bg-teal-500'
                        : currentTheme.background
                        }`}>
                        {selectedLoanId === loan.id && (
                          <View className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className={`text-base font-medium ${selectedLoanId === loan.id
                          ? currentTheme.text
                          : currentTheme.text
                          }`}>
                          Loan #{loan.id}
                        </Text>
                        <Text className={`text-sm ${selectedLoanId === loan.id
                          ? 'text-teal-200'
                          : currentTheme.text
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
              <Text className={`text-sm font-semibold ${currentTheme.subtext} mb-3 uppercase tracking-wide`}>
                Filter by Status
              </Text>

              {/* Status Dropdown Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowStatusFilter(!showStatusFilter);
                  setShowLoanFilter(false);
                }}
                className={`flex-row items-center justify-between p-4 rounded-xl border-2 ${currentTheme.background} ${showStatusFilter ? 'border-teal-500' : 'border-slate-600'}`}
              >
                <View className="flex-row items-center">
                  <Icon
                    name="filter"
                    size={20}
                    color={currentTheme.subtext}
                  />
                  <Text className={`ml-3 ${currentTheme.text} text-base font-medium`}>
                    {selectedStatus || 'All statuses'}
                  </Text>
                </View>
                <Icon
                  name={showStatusFilter ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={currentTheme.subtext}
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
                        ? currentTheme.background
                        : ''
                        } ${selectedStatus === status
                          ? currentTheme.background
                          : currentTheme.background
                        }`}
                    >
                      <View className={`w-5 h-5 rounded-full border-2 items-center justify-center mr-3 ${selectedStatus === status
                        ? 'border-teal-500 bg-teal-500'
                        : currentTheme.background
                        }`}>
                        {selectedStatus === status && (
                          <View className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </View>
                      <Text className={`text-base font-medium ${selectedStatus === status
                        ? currentTheme.text
                        : currentTheme.text
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
          {newError && selectedLoanId && (
            <View className={`mb-6 p-6 rounded-xl ${currentTheme.background}`}>
              <View className="items-center">
                <Icon
                  name="alert-circle"
                  size={48}
                  color={currentTheme.icon}
                />
                <Text className={`text-lg font-semibold mt-3 mb-2 ${currentTheme.text}`}>
                  Failed to Load Payment History
                </Text>
                <Text className={`text-sm text-center mb-4 ${currentTheme.subtext}`}>
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
          {selectedLoanId && selectedStatus && !newError && (
            <View className="mt-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className={`text-sm font-semibold ${currentTheme.subtext} uppercase tracking-wide`}>
                  Payment Records
                </Text>
                <View className={`px-3 py-1 rounded-full ${currentTheme.background}`}>
                  <Text className={`text-xs font-bold ${currentTheme.text}`}>
                    {filteredPayments.length} records
                  </Text>
                </View>
              </View>

              {isLoadingLoan ? (
                <View className="py-16 items-center">
                  <ActivityIndicator size="large" color={currentTheme.icon} />
                  <Text className={`mt-4 text-base ${currentTheme.subtext}`}>
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
                              color={currentTheme.subtext}
                            />
                            <Text className={`ml-2 text-sm ${currentTheme.subtext}`}>
                              Due: {new Date(payment.due_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </Text>
                          </View>
                          <Text className={`text-2xl font-bold ${currentTheme.text} mb-1`}>
                            ₹{payment.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Text>
                          <Text className={`text-sm ${currentTheme.subtext}`}>
                            Paid: ₹{payment.amount_paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Text>
                        </View>
                        <View className={`px-4 py-2 rounded-full border ${getStatusColor(payment.status)} flex-row items-center`}>
                          <Icon
                            name={getStatusIcon(payment.status)}
                            size={14}
                            color={payment.status.toLowerCase() === 'paid' ? '#065f46' : payment.status.toLowerCase() === 'pending' ? '#92400e' : '#991b1b'}
                          />
                          <Text className={` ${payment.status.toLowerCase() === 'paid' ? currentTheme.text : payment.status.toLowerCase() === 'pending' ? currentTheme.text : currentTheme.text} text-xs font-bold ml-1`}>
                            {payment.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View className={`pt-3 border-t ${currentTheme.background}`}>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Icon
                              name="receipt-outline"
                              size={16}
                              color={currentTheme.subtext}
                            />
                            <Text className={`text-sm ml-2 ${currentTheme.subtext}`}>
                              ID: {payment.id}
                            </Text>
                          </View>
                          {payment.status.toLowerCase() === 'overdue' && (
                            <Text className={`text-xs font-semibold ${currentTheme.text}`}>
                              OVERDUE
                            </Text>
                          )}
                        </View>
                        {payment.notes && (
                          <Text className={`text-sm mt-2 ${currentTheme.subtext} italic`}>
                            "{payment.notes}"
                          </Text>
                        )}
                      </View>
                    </View>

                    {payment.status.toLowerCase() === 'pending' && (
                      <TouchableOpacity
                        className={`py-4 items-center flex-row justify-center ${currentTheme.background}`}
                      >
                        <Icon
                          name="card"
                          size={18}
                          color={currentTheme.icon}
                        />
                        <Text className={`ml-2 font-semibold text-base`} style={{ color: currentTheme.icon }}>
                          Process Payment
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <View className="py-16 items-center">
                  <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${currentTheme.background}`}>
                    <Icon
                      name="receipt-outline"
                      size={40}
                      color={currentTheme.subtext}
                    />
                  </View>
                  <Text className={`text-xl font-semibold ${currentTheme.text} mb-3`}>
                    No {selectedStatus !== 'All' ? selectedStatus.toLowerCase() : ''} payments found
                  </Text>
                  <Text className={`text-sm ${currentTheme.subtext} text-center px-8`}>
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
              <View className={`w-28 h-28 rounded-full items-center justify-center mb-6 ${currentTheme.background}`}>
                <Icon
                  name="document-text-outline"
                  size={48}
                  color={currentTheme.subtext}
                />
              </View>
              <Text className={`text-xl font-semibold ${currentTheme.text} mb-3`}>
                Ready to View History
              </Text>
              <Text className={`text-sm ${currentTheme.subtext} text-center px-8 leading-6`}>
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