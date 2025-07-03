// components/CustomerDetails/HistoryContent.js
import React, { useEffect, useState, useMemo } from 'react';
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
  const [filterFadeAnim] = useState(new Animated.Value(1));
  const statusOptions = ['All', 'Paid', 'Pending', 'Overdue'];

  // Optimized filtering with useMemo for immediate updates
  const filteredPayments = useMemo(() => {
    if (!SingleLoanrepaymentsData?.data) return [];

    if (selectedStatus === 'All') {
      return SingleLoanrepaymentsData.data;
    }

    return SingleLoanrepaymentsData.data.filter(payment =>
      payment.status.toLowerCase() === selectedStatus.toLowerCase()
    );
  }, [SingleLoanrepaymentsData?.data, selectedStatus]);

  const loans = useMemo(() =>
    getsinglecustomerdetailsData?.data?.loans || [],
    [getsinglecustomerdetailsData?.data?.loans]
  );

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

  // Smooth animation when status changes
  const handleStatusChange = (status) => {
    Animated.sequence([
      Animated.timing(filterFadeAnim, {
        toValue: 0.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(filterFadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedStatus(status);
    setShowStatusFilter(false);
  };

  const handleRetry = () => {
    if (selectedLoanId) {
      dispatch(singleLoanRepaymentsAPI(selectedLoanId));
    }
  };

  const getStatusColor = (status) => {
    const statusLower = status.toLowerCase();
    if (isDarkMode) {
      switch (statusLower) {
        case 'paid': return 'bg-emerald-900/40 text-emerald-300 border-emerald-800';
        case 'pending': return 'bg-amber-300/10 text-amber-300 border-amber-800';
        case 'overdue': return 'bg-rose-900/40 text-rose-300 border-rose-800';
        default: return 'bg-slate-700/40 text-slate-300 border-slate-600';
      }
    } else {
      switch (statusLower) {
        case 'paid': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'overdue': return 'bg-rose-50 text-rose-700 border-rose-200';
        default: return 'bg-slate-100 text-slate-600 border-slate-300';
      }
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

  // No loans available state
  if (loans.length === 0) {
    return (
      <ScrollView
        className={`flex-1 ${isDarkMode ? 'bg-slate-900' : 'bg-[#e0f2f2]'}`}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="flex-1 px-4 py-6"
        >
          <View className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-8 mx-2 my-4 border shadow-lg`}>
            <View className="items-center py-16">
              <View className="w-32 h-32 rounded-full items-center justify-center mb-6 bg-[#e0f2f2]">
                <Icon
                  name="wallet-outline"
                  size={64}
                  color={isDarkMode ? '#2ec4b6' : '#1a9c94'}
                />
              </View>
              <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-4 text-center`}>
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
      className={`flex-1 ${isDarkMode ? 'bg-slate-900' : ''}`}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View
        style={{ opacity: fadeAnim }}
        className="flex-1 px-2 pb-7"
      >
        <View className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} rounded-2xl p-6 mx-2 border shadow-lg`}>
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <View className="w-14 h-14 rounded-2xl items-center justify-center mr-4 bg-[#e0f2f2]">
              <Icon
                name="time"
                size={28}
                color={isDarkMode ? '#2ec4b6' : '#1a9c94'}
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
            <Text className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-3 uppercase tracking-wide`}>
              Select Loan
            </Text>

            {/* Dropdown Button */}
            <TouchableOpacity
              onPress={() => {
                setShowLoanFilter(!showLoanFilter);
                setShowStatusFilter(false);
              }}
              className={`flex-row items-center justify-between p-4 rounded-xl border-2 ${isDarkMode ? 'bg-slate-900' : 'bg-[#e0f2f2]'} ${showLoanFilter ? 'border-[#2ec4b6]' : 'border-gray-300'}`}
            >
              <View className="flex-row items-center">
                <Icon
                  name="document-text"
                  size={20}
                  color={isDarkMode ? '#2ec4b6' : '#1a9c94'}
                />
                <Text className={`ml-3 ${isDarkMode ? 'text-white' : 'text-slate-900'} text-base font-medium`}>
                  {selectedLoanId ? `Loan #${selectedLoanId}` : 'Choose a loan'}
                </Text>
              </View>
              <Icon
                name={showLoanFilter ? "chevron-up" : "chevron-down"}
                size={20}
                color={isDarkMode ? '#2ec4b6' : '#1a9c94'}
              />
            </TouchableOpacity>

            {/* Dropdown List */}
            {showLoanFilter && (
              <View className={`absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-50 ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'} border shadow-lg`}>
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
                      className="p-4 flex-row items-center"
                      style={{
                        backgroundColor: selectedLoanId === loan.id ? '#e0f2f2' : 'transparent'
                      }}
                    >
                      <View
                        className="w-5 h-5 rounded-full border-2 items-center justify-center mr-3"
                        style={{
                          borderColor: selectedLoanId === loan.id ? '#2ec4b6' : '#9ca3af',
                          backgroundColor: selectedLoanId === loan.id ? '#2ec4b6' : 'transparent'
                        }}
                      >
                        {selectedLoanId === loan.id && (
                          <View className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className={`text-base font-medium ${isDarkMode ? 'text-primary-100' : 'text-slate-900'}`}>
                          Loan #{loan.id}
                        </Text>
                        <Text className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
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
              <Text className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-3 uppercase tracking-wide`}>
                Filter by Status
              </Text>

              {/* Status Dropdown Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowStatusFilter(!showStatusFilter);
                  setShowLoanFilter(false);
                }}
                className={`flex-row items-center justify-between p-4 rounded-xl border-2 ${isDarkMode ? 'bg-slate-900' : 'bg-[#e0f2f2]'}`}
                style={{
                  borderColor: showStatusFilter ? '#2ec4b6' : '#9ca3af'
                }}
              >
                <View className="flex-row items-center">
                  <Icon
                    name="filter"
                    size={20}
                    color={isDarkMode ? '#2ec4b6' : '#1a9c94'}
                  />
                  <Text className={`ml-3 ${isDarkMode ? 'text-white' : 'text-slate-900'} text-base font-medium`}>
                    {selectedStatus || 'All statuses'}
                  </Text>
                </View>
                <Icon
                  name={showStatusFilter ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={isDarkMode ? '#2ec4b6' : '#1a9c94'}
                />
              </TouchableOpacity>

              {/* Status Dropdown List */}
              {showStatusFilter && (
                <View className={`absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-40 ${isDarkMode ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'} border shadow-lg`}>
                  {statusOptions.map((status, index) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => handleStatusChange(status)}
                      className="p-4 flex-row items-center"
                      style={{
                        backgroundColor: selectedStatus === status ? '#e0f2f2' : 'transparent'
                      }}
                    >
                      <View
                        className="w-5 h-5 rounded-full border-2 items-center justify-center mr-3"
                        style={{
                          borderColor: selectedStatus === status ? '#2ec4b6' : '#9ca3af',
                          backgroundColor: selectedStatus === status ? '#2ec4b6' : 'transparent'
                        }}
                      >
                        {selectedStatus === status && (
                          <View className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </View>
                      <Text className={`text-base font-medium ${isDarkMode ? 'text-primary-100' : 'text-slate-900'}`}>
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
            <View className={`mb-6 p-6 rounded-xl bg-[#e0f2f2]`}>
              <View className="items-center">
                <Icon
                  name="alert-circle"
                  size={48}
                  color={isDarkMode ? '#2ec4b6' : '#1a9c94'}
                />
                <Text className={`text-lg font-semibold mt-3 mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Failed to Load Payment History
                </Text>
                <Text className={`text-sm text-center mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Unable to fetch payment data. Please check your connection and try again.
                </Text>
                <TouchableOpacity
                  onPress={handleRetry}
                  className="px-6 py-3 rounded-lg flex-row items-center bg-[#1a9c94]"
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

          {/* Payment List with Optimized Rendering */}
          {selectedLoanId && selectedStatus && !newError && (
            <Animated.View style={{ opacity: filterFadeAnim }} className="mt-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} uppercase tracking-wide`}>
                  Payment Records
                </Text>
                <View className={`px-3 py-1 rounded-full ${isDarkMode ? "bg-primary-100/10" : "bg-[#e0f2f2]"}`}>
                  <Text className={`text-xs font-bold ${isDarkMode ? 'text-primary-100' : 'text-slate-900'}`}>
                    {filteredPayments.length} records
                  </Text>
                </View>
              </View>

              {isLoadingLoan ? (
                <View className="py-16 items-center">
                  <ActivityIndicator size="large" color={isDarkMode ? '#2ec4b6' : '#1a9c94'} />
                  <Text className={`mt-4 text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    Loading payment history...
                  </Text>
                </View>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment, index) => (
                  <View
                    key={payment.id}
                    className={`mb-4 rounded-xl overflow-hidden ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-100'} border shadow-md`}
                  >
                    <View
                      className="p-5"
                      style={{
                        backgroundColor: payment?.status === "PAID" ?
                          (isDarkMode ? 'rgba(30, 166, 148, 0.1)' : 'rgba(224, 242, 242, 0.5)') :
                          (isDarkMode ? 'rgba(253, 230, 138, 0.1)' : 'rgba(254, 243, 205, 0.5)')
                      }}
                    >
                      <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1">
                          <View className="flex-row items-center mb-2">
                            <Icon
                              name="calendar-outline"
                              size={16}
                              color={isDarkMode ? '#94a3b8' : '#64748b'}
                            />
                            <Text className={`ml-2 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
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
                          <Text className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Paid: ₹{payment.amount_paid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </Text>
                        </View>
                        <View className={`px-4 py-2 rounded-full border ${getStatusColor(payment.status)} flex-row items-center`}>
                          <Icon
                            name={getStatusIcon(payment.status)}
                            size={14}
                            color={payment.status.toLowerCase() === 'paid' ? '#065f46' : payment.status.toLowerCase() === 'pending' ? '#92400e' : '#991b1b'}
                          />
                          <Text className={`${payment.status.toLowerCase() === 'paid' ? 'text-emerald-700' : payment.status.toLowerCase() === 'pending' ? 'text-amber-700' : 'text-rose-700'} text-xs font-bold ml-1`}>
                            {payment.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View className={`pt-3 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center">
                            <Icon
                              name="receipt-outline"
                              size={16}
                              color={isDarkMode ? '#94a3b8' : '#64748b'}
                            />
                            <Text className={`text-sm ml-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                              ID: {payment.id}
                            </Text>
                          </View>
                          {payment.status.toLowerCase() === 'overdue' && (
                            <Text className="text-xs font-semibold text-rose-600">
                              OVERDUE
                            </Text>
                          )}
                        </View>
                        {payment.notes && (
                          <Text className={`text-sm mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} italic`}>
                            "{payment.notes}"
                          </Text>
                        )}
                      </View>
                    </View>

                    {payment.status.toLowerCase() === 'pending' && (
                      <TouchableOpacity
                        className={`py-4 items-center flex-row justify-center ${isDarkMode ? "bg-primary-100/10" : "bg-[#e0f2f2]"}`}
                      >
                        <Icon
                          name="card"
                          size={18}
                          color={isDarkMode ? '#2ec4b6' : '#1a9c94'}
                        />
                        <Text
                          className="ml-2 font-semibold text-base"
                          style={{ color: isDarkMode ? '#2ec4b6' : '#1a9c94' }}
                        >
                          Process Payment
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              ) : (
                <View className="py-16 items-center">
                  <View className="w-24 h-24 rounded-full items-center justify-center mb-6 bg-[#e0f2f2]">
                    <Icon
                      name="receipt-outline"
                      size={40}
                      color={isDarkMode ? '#94a3b8' : '#64748b'}
                    />
                  </View>
                  <Text className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-3`}>
                    No {selectedStatus !== 'All' ? selectedStatus.toLowerCase() : ''} payments found
                  </Text>
                  <Text className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-center px-8`}>
                    {selectedStatus !== 'All'
                      ? `No ${selectedStatus.toLowerCase()} payment records found for this loan`
                      : 'No payment records found for this loan'
                    }
                  </Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Initial State */}
          {!selectedLoanId && (
            <View className="py-16 items-center">
              <View className="w-28 h-28 rounded-full items-center justify-center mb-6 bg-[#e0f2f2]">
                <Icon
                  name="document-text-outline"
                  size={48}
                  color={isDarkMode ? '#94a3b8' : '#64748b'}
                />
              </View>
              <Text className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-3`}>
                Ready to View History
              </Text>
              <Text className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} text-center px-8 leading-6`}>
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