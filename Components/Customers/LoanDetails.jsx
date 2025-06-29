import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ProgressChart } from 'react-native-chart-kit';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import { clearsingleloan, getsingleloanapi } from '../../redux/Slices/loanSlice';
import { useHideTabBar } from '../../hooks/useHideTabBar';
import { getsinglepaymentreducer } from '../../redux/Slices/paymentslice';

const { width } = Dimensions.get('window');
const InfoRow = ({ label, value, icon, isDarkMode, alignRight = false }) => (
  <View className={`flex-row items-center justify-between py-2 ${alignRight ? 'items-start' : ''}`}>
    <View className="flex-row items-center">
      {icon && (
        <MaterialIcons
          name={icon}
          size={18}
          color={isDarkMode ? '#9CA3AF' : '#6B7280'}
          className="mr-2"
        />
      )}
      <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
        {label}
      </Text>
    </View>
    <Text
      className={`${isDarkMode ? 'text-white' : 'text-gray-900'} ${alignRight ? 'text-right max-w-[60%]' : ''}`}
      numberOfLines={alignRight ? 2 : 1}
    >
      {value}
    </Text>
  </View>
);


const LoanDetailsScreen = ({ route }) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const navigation = useNavigation();
  const loanId = route.params?.loanId;
  const { OneLoanDetails, newError, isLoadingLoan } = useSelector((state) => state.loanstore);
  const [refreshing, setRefreshing] = useState(false);
  useHideTabBar(['Loandetails', 'Paymentdetailsfromloan']);

  useFocusEffect(
    useCallback(() => {
      if (loanId) {
        dispatch(getsingleloanapi(loanId));
      }
    }, [dispatch, loanId])
  )

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    dispatch(getsingleloanapi(loanId)).then(() => {
      setRefreshing(false);
    });
  }, [loanId, dispatch]);
  // useFocusEffect(
  //   useCallback(() => {
  //     // setgotopaymentpage(false);
  //     return () => {
  //       if(gotopaymentpage)
  //       {
  //         setgotopaymentpage(false);
  //         dispatch(clearsingleloan());
  //       }
  //     }
  //   }, [])
  // )

  // Main Content with Data
  const loan = OneLoanDetails;
  const customer = loan?.customer;
  const totalPaid = loan?.repayments?.reduce((sum, repayment) => sum + repayment.amount_paid, 0);
  const progress = (totalPaid / loan?.total_repayment_amount) * 100;

  // Separate repayments into paid, pending, and overdue
  const paidRepayments = loan?.repayments?.filter(repayment => repayment.status === 'PAID') || [];
  const pendingRepayments = loan?.repayments?.filter(repayment =>
    repayment.status === 'PENDING' && moment(repayment.due_date).isAfter(moment())
  ) || [];
  const overdueRepayments = loan?.repayments?.filter(repayment =>
    repayment.status === 'PENDING' && moment(repayment.due_date).isBefore(moment())
  ) || [];
  console.log(pendingRepayments);

  // Check if NOC should be disabled (any overdue or pending payments)
  const isNocDisabled = pendingRepayments.length > 0 || overdueRepayments.length > 0;

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? '#1f2937' : '#ffffff',
    backgroundGradientTo: isDarkMode ? '#1f2937' : '#ffffff',
    color: (opacity = 1) => `rgba(46, 196, 182, ${opacity})`,
    strokeWidth: 2,
  };

  const chartData = {
    data: [progress / 100],
  };

  const handlepaymentscreennavigation = (item) => {

    const payload = {
      ...item,
      loan: {
        "id": loan?.id,
        "customer_id": loan?.customer_id,
        "principal_amount": loan?.principal_amount,
        "interest_rate": loan?.interest_rate,
        "payment_frequency": loan?.payment_frequency,
        "calculation_type": loan?.calculation_type,
        "years": loan?.years,
        "weeks": loan?.weeks,
        "tenure_months": loan?.tenure_months,
        "total_repayment_amount": loan?.total_repayment_amount,
        "installment_amount": loan?.installment_amount,
        "start_date": loan?.start_date,
        "end_date": loan?.end_date,
        "status": loan?.status,
        "document_photo_path": loan?.document_photo_path,
        "evidence_photo_path": loan?.evidence_photo_path,
        "disbursement_date": loan?.disbursement_date,
        "created_at": loan?.created_at,
        "updated_at": loan?.updated_at,
        "created_by": loan?.created_by,
        "customer": loan?.customer,
      }

    }
    dispatch(getsinglepaymentreducer(payload));
    navigation.navigate('Paymentdetailsfromloan');
  }

  return (
    <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Enhanced Header Section - Only shown when data is available */}
      <View className="bg-primary-100 px-5 py-6 rounded-b-3xl">
        <View className="flex-row items-center py-5">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-white/20 p-2 rounded-xl mr-4"
          >
            <Icon name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <View>
            <Text className="text-white text-2xl font-bold">Loan Details</Text>
            {OneLoanDetails?.customer?.name && (
              <Text className="text-white/70">
                {OneLoanDetails?.customer?.name || 'Loading...'}
              </Text>
            )}
          </View>
        </View>

        {loan?.interest_rate && <View className="bg-white/20 rounded-2xl p-4 mb-4">
          <Text className="text-white/80 text-sm mb-1">Loan Amount</Text>
          <Text className="text-white text-3xl font-bold">
            ₹{loan?.principal_amount.toLocaleString()}
          </Text>

          <View className="flex-row justify-between mt-2 mb-3 bg-white/10 p-2 rounded-xl">
            <View>
              <Text className="text-white/60 text-xs">Start Date</Text>
              <Text className="text-white text-sm font-medium">
                {moment(loan?.start_date).format('DD MMM YYYY')}
              </Text>
            </View>
            <View>
              <Text className="text-white/60 text-xs">End Date</Text>
              <Text className="text-white text-sm font-medium">
                {moment(loan?.end_date).format('DD MMM YYYY')}
              </Text>
            </View>
          </View>

          <View className="flex-row justify-between mt-3">
            <View>
              <Text className="text-white/80 text-xs">Interest Rate</Text>
              <Text className="text-white text-base font-semibold">{loan?.interest_rate}%</Text>
            </View>
            <View>
              <Text className="text-white/80 text-xs">payment Frequency</Text>
              <Text className="text-white text-base font-semibold">{loan?.payment_frequency}</Text>
            </View>
            <View>
              <Text className="text-white/80 text-xs">Installment</Text>
              <Text className="text-white text-base font-semibold">
                ₹{loan?.installment_amount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>}
      </View>
      {
        isLoadingLoan ? (
          <View className={`flex-1 justify-center items-center ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <ActivityIndicator size="large" color="#2ec4b6" />
            <Text className={`mt-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Fetching loan details...
            </Text>
          </View>
        ) :
          newError ? (
            <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <View className="flex-1 justify-center items-center p-6">
                <View className={`${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'} p-6 rounded-full mb-4`}>
                  <Icon name="alert-circle-outline" size={48} color="#dc2626" />
                </View>
                <Text className={`text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'} text-center mb-6`}>
                  Failed to load loan details. Please try again.
                </Text>
                <TouchableOpacity
                  className="bg-primary-100 py-3 px-6 rounded-xl"
                  onPress={onRefresh}
                >
                  <Text className="text-white font-bold">Retry</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) :
            !OneLoanDetails ? (
              <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                <View className="flex-1 justify-center items-center p-6">
                  <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} p-6 rounded-full mb-4`}>
                    <Icon name="document-text-outline" size={48} color="#6b7280" />
                  </View>
                  <Text className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-center mb-6`}>
                    No loan details available
                  </Text>
                  <TouchableOpacity
                    className="bg-primary-100 py-3 px-6 rounded-xl"
                    onPress={() => navigation.goBack()}
                  >
                    <Text className="text-white font-bold">Go Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) :
              (
                <ScrollView
                  className="-mt-6 z-40"
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                      colors={['#2ec4b6']}
                      tintColor="#2ec4b6"
                    />
                  }
                >
                  <View className="px-5 pb-10">
                    {/* Loan Progress Card */}
                    <View className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-3xl p-6 shadow-sm mb-5 border`}>
                      <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>
                        Repayment Progress
                      </Text>
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
                          <Text className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Completed
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between mt-4">
                        <View>
                          <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                            Paid Amount
                          </Text>
                          <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} text-lg font-bold`}>
                            ₹{totalPaid?.toLocaleString()}
                          </Text>
                        </View>
                        <View>
                          <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                            Remaining
                          </Text>
                          <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} text-lg font-bold`}>
                            ₹{(loan?.total_repayment_amount - totalPaid).toLocaleString()}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Overdue Payments */}
                    {overdueRepayments.length > 0 && (
                      <View className={`${isDarkMode ? 'bg-red-900/20 border-red-900/30' : 'bg-red-50 border-red-200'} rounded-3xl p-6 mb-5 shadow-sm border`}>
                        <View className="flex-row items-center justify-between mb-4">
                          <View className="flex-row items-center">
                            <Icon name="warning-outline" size={24} color="#dc2626" />
                            <Text className={`text-lg font-bold ${isDarkMode ? 'text-red-400' : 'text-red-700'} ml-2`}>
                              Overdue Payments ({overdueRepayments.length})
                            </Text>
                          </View>
                        </View>

                        {overdueRepayments.slice(0, 3).map((repayment, index) => (
                          <View
                            key={index}
                            className={`${isDarkMode ? 'bg-gray-800 border-red-900/30' : 'bg-white border-red-100'} p-4 rounded-xl border mb-3`}
                          >
                            <View className="flex-row justify-between items-center mb-2">
                              <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold`}>
                                Installment #{repayment.installment_number}
                              </Text>
                              <Text className={`${isDarkMode ? 'text-red-400' : 'text-red-600'} font-bold`}>
                                ₹{repayment.total_amount.toFixed(2)}
                              </Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                              <View>
                                <Text className={`${isDarkMode ? 'text-red-400' : 'text-red-500'} text-sm`}>
                                  {moment().diff(moment(repayment.due_date), 'days')} days overdue
                                </Text>
                                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                                  Due: {moment(repayment.due_date).format('DD MMM YYYY')}
                                </Text>
                              </View>
                              <TouchableOpacity
                                className={`${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'} px-3 py-1 rounded-full`}
                                onPress={() => handlepaymentscreennavigation(repayment)}
                              >
                                <Text className={`${isDarkMode ? 'text-red-300' : 'text-red-700'} font-medium text-sm`}>
                                  Pay Now
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}

                        {overdueRepayments.length > 3 && (
                          <Text className={`${isDarkMode ? 'text-red-400' : 'text-red-600'} text-sm text-center mt-2`}>
                            + {overdueRepayments.length - 3} more overdue payments
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Pending Payments */}
                    {pendingRepayments.length > 0 && (
                      <View className={`${isDarkMode ? 'bg-yellow-900/20 border-yellow-900/30' : 'bg-yellow-50 border-yellow-200'} rounded-3xl p-6 mb-5 shadow-sm border`}>
                        <View className="flex-row items-center justify-between mb-4">
                          <View className="flex-row items-center">
                            <Icon name="time-outline" size={24} color="#d97706" />
                            <Text className={`text-lg font-bold ${isDarkMode ? 'text-yellow-400' : 'text-yellow-800'} ml-2`}>
                              Upcoming Payments ({pendingRepayments.length})
                            </Text>
                          </View>
                        </View>

                        {pendingRepayments.slice(0, 3).map((repayment, index) => (
                          <View
                            key={index}
                            className={`${isDarkMode ? 'bg-gray-800 border-yellow-900/30' : 'bg-white border-yellow-100'} p-4 rounded-xl border mb-3`}
                          >
                            <View className="flex-row justify-between items-center mb-2">
                              <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold`}>
                                Installment #{repayment.installment_number}
                              </Text>
                              <Text className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} font-bold`}>
                                ₹{repayment.total_amount.toFixed(2)}
                              </Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                              <View>
                                <Text className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} text-sm`}>
                                  Due in {moment(repayment.due_date).diff(moment(), 'days')} days
                                </Text>
                                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                                  Due: {moment(repayment.due_date).format('DD MMM YYYY')}
                                </Text>
                              </View>
                              <TouchableOpacity
                                className={`${isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'} px-3 py-1 rounded-full`}
                                onPress={() => { handlepaymentscreennavigation(repayment) }}
                              >
                                <Text className={`${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'} font-medium text-sm`}>
                                  Pay Now
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}

                        {pendingRepayments.length > 3 && (
                          <Text className={`${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'} text-sm text-center mt-2`}>
                            + {pendingRepayments.length - 3} more upcoming payments
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Paid Payments */}
                    {paidRepayments.length > 0 && (
                      <View className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-3xl p-6 shadow-sm mb-5 border`}>
                        <View className="flex-row items-center justify-between mb-4">
                          <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                            Payment History ({paidRepayments.length})
                          </Text>
                        </View>

                        {paidRepayments.slice(0, 3).map((repayment, index) => (
                          <View
                            key={index}
                            className={`flex-row items-center justify-between ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'} p-4 rounded-xl mb-3 border`}
                          >
                            <View>
                              <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-medium`}>
                                {moment(repayment.payment_date).format('DD MMM YYYY')}
                              </Text>
                              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                                Installment #{repayment.installment_number}
                              </Text>
                            </View>
                            <View className="items-end">
                              <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-bold`}>
                                ₹{repayment.amount_paid.toFixed(2)}
                              </Text>
                              <View className={`${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'} px-2 py-1 rounded-full mt-1`}>
                                <Text className={`${isDarkMode ? 'text-green-400' : 'text-green-700'} text-xs font-medium`}>
                                  {repayment.status}
                                </Text>
                              </View>
                            </View>
                          </View>
                        ))}

                        {paidRepayments.length > 3 && (
                          <Text className="text-primary-100 text-sm text-center mt-2">
                            + {paidRepayments.length - 3} more paid payments
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Customer Details */}
                    <View className={`${isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl p-6 shadow-lg mb-6 border`}>
                      {/* Header */}
                      <View className="flex-row justify-between items-center mb-6">
                        <Text className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          Customer Overview
                        </Text>
                        <MaterialIcons
                          name="person-outline"
                          size={24}
                          color={isDarkMode ? '#9CA3AF' : '#6B7280'}
                        />
                      </View>

                      {/* Customer Info */}
                      <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                          <Text className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Personal Details
                          </Text>
                        </View>
                        <View className="gap-3">
                          <InfoRow
                            label="Name"
                            value={customer?.name}
                            icon="person-outline"
                            isDarkMode={isDarkMode}
                          />
                          <InfoRow
                            label="Phone"
                            value={customer?.phone_number}
                            icon="phone-android"
                            isDarkMode={isDarkMode}
                          />
                          <InfoRow
                            label="Email"
                            value={customer?.email || 'N/A'}
                            icon="email"
                            isDarkMode={isDarkMode}
                          />
                          <InfoRow
                            label="Address"
                            value={[customer?.address_line1, customer?.city, customer?.state, customer?.pincode]
                              .filter(Boolean)
                              .join(', ')}
                            icon="home"
                            isDarkMode={isDarkMode}
                            alignRight
                          />
                        </View>
                      </View>

                      {/* Loan Info */}
                      <View>
                        <View className="flex-row items-center mb-3">
                          <Text className={`text-lg font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Loan Information
                          </Text>
                        </View>
                        <View className="gap-3">
                          <InfoRow
                            label="Approved By"
                            value={loan?.created_by_user?.full_name || 'N/A'}
                            icon="verified-user"
                            isDarkMode={isDarkMode}
                          />
                          <InfoRow
                            label="Tenure"
                            value={
                              loan?.payment_frequency === 'WEEKLY'
                                ? `${loan?.weeks} weeks`
                                : `${loan?.tenure_months} months`
                            }
                            icon="date-range"
                            isDarkMode={isDarkMode}
                          />
                          <View className="flex-row items-center justify-between py-2">
                            <View className="flex-row items-center">
                              <MaterialIcons
                                name="circle-notifications"
                                size={20}
                                color={isDarkMode ? '#D1D5DB' : '#4B5563'}
                                className="mr-2"
                              />
                              <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
                                Status
                              </Text>
                            </View>
                            <View className={`px-3 py-1 rounded-full ${loan?.status === 'ACTIVE'
                              ? 'bg-green-100 dark:bg-green-900/50'
                              : loan?.status === 'COMPLETED'
                                ? 'bg-blue-100 dark:bg-blue-900/50'
                                : 'bg-gray-100 dark:bg-gray-700'
                              }`}>
                              <Text className={`text-sm font-semibold ${loan?.status === 'ACTIVE'
                                ? 'text-green-800 dark:text-green-200'
                                : loan?.status === 'COMPLETED'
                                  ? 'text-blue-800 dark:text-blue-200'
                                  : 'text-gray-600 dark:text-gray-300'
                                }`}>
                                {loan?.status || 'N/A'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    </View>


                    {/* Action Buttons */}
                    <View className="flex-col gap-4">
                      <TouchableOpacity className="flex-1 bg-primary-100 py-4 rounded-xl items-center">
                        <Text className="text-white font-bold">Download Statement</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-1 bg-red-500 py-4 rounded-xl items-center">
                        <Text className="text-white font-bold">Request Close Loan</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className={`flex-1 py-4 rounded-xl items-center ${isNocDisabled
                          ? isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                          : 'bg-blue-500'
                          }`}
                        disabled={isNocDisabled}
                        onPress={() => console.log('Generate NOC')}
                      >
                        <Text className={`font-bold ${isNocDisabled
                          ? isDarkMode ? 'text-gray-400' : 'text-gray-500'
                          : 'text-white'
                          }`}>
                          Get NOC
                        </Text>
                        {/* {isNocDisabled && (
                          <Text className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                            {overdueRepayments.length > 0 ? 'Clear overdues' : 'Complete all payments'}
                          </Text>
                        )} */}
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              )
      }
    </View>
  );
};

export default LoanDetailsScreen;