import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FormSection, FormInput, FormDropdown } from './Components/FormComponents';
import Animated, {
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import { useToast } from '../../Context/ToastContext';
import { getsingleCustomerdetails, updateCustomer } from '../../redux/Slices/customerSlice';

const EditCustomerScreen = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { getsinglecustomerdetailsData, isloadingcustomer, customerError } = useSelector((state) => state.customer);
  const navigation = useNavigation();
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);
  const [showIdTypeDropdown, setShowIdTypeDropdown] = useState(false);
  const singleDate = getsinglecustomerdetailsData?.data;

  // Initialize customer data with fallback values
  const [customerData, setCustomerData] = useState({
    id: singleDate?.id || '',
    name: singleDate?.name || '',
    phone_number: singleDate?.phone_number ? `+91${singleDate.phone_number.replace(/^\+91/, '')}` : '',
    email: singleDate?.email || '',
    alternate_mobile_number: singleDate?.alternate_mobile_number ? `+91${singleDate.alternate_mobile_number.replace(/^\+91/, '')}` : '',
    gender: singleDate?.gender || '',
    date_of_birth: singleDate?.date_of_birth || '',
    address_line1: singleDate?.address_line1 || '',
    district: singleDate?.district || '',
    state: singleDate?.state || '',
    city: singleDate?.city || '',
    pincode: singleDate?.pincode || '',
    place_name: singleDate?.place_name || '',
    profile_photo_path: singleDate?.profile_photo_path || '',
    identification_type: singleDate?.identification_type || '',
    identification_number: singleDate?.identification_number || '',
    status: singleDate?.is_active || false,
    joinDate: singleDate?.created_at ? moment(singleDate.created_at).format('DD-MM-YYYY') : '',
  });

  // Form validation errors
  const [errors, setErrors] = useState({});

  // Memoized dropdown options
  const genderOptions = useMemo(() => [
    { label: 'Male', value: 'MALE', icon: 'man-outline' },
    { label: 'Female', value: 'FEMALE', icon: 'woman-outline' },
    { label: 'Other', value: 'OTHER', icon: 'people-outline' },
  ], []);

  const identificationOptions = useMemo(() => [
    { label: 'Aadhar Card', value: 'AADHAR', icon: 'card-outline' },
    { label: 'PAN Card', value: 'PAN', icon: 'document-outline' },
    { label: 'Voter ID', value: 'VOTER_ID', icon: 'ballot-outline' },
    { label: 'Driving License', value: 'DRIVING_LICENSE', icon: 'car-outline' },
    { label: 'Passport', value: 'PASSPORT', icon: 'airplane-outline' },
  ], []);

  // Fields that cannot be edited
  const nonEditableFields = useMemo(() => ['id', 'joinDate', 'status'], []);

  // Validation functions
  const validateEmail = useCallback((email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, []);

  const validatePhone = useCallback((phone) => {
    const cleanedPhone = phone.replace(/^\+91/, '');
    const phoneRegex = /^[6-9]\d{10}$/;
    return phoneRegex.test(cleanedPhone);
  }, []);

  const validatePincode = useCallback((pincode) => {
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    return pincodeRegex.test(pincode);
  }, []);

  // const validateAadhar = useCallback((aadhar) => {
  //   const aadharRegex = /^[2-9]{1}[0-9]{3}\s[0-9]{4}\s[0-9]{4}$/;
  //   return aadharRegex.test(aadhar);
  // }, []);

  const validatePAN = useCallback((pan) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.replace(/\s/g, ''));
  }, []);

  // Real-time form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!customerData.name.trim()) newErrors.name = 'Name is required';
    if (!customerData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
    // else if (!validatePhone(customerData.phone_number)) newErrors.phone_number = 'Please enter a valid 10-digit phone number';
    if (!customerData.email.trim()) newErrors.email = 'Email is required';
    else if (!validateEmail(customerData.email)) newErrors.email = 'Please enter a valid email address';
    if (customerData.alternate_mobile_number && !validatePhone(customerData.alternate_mobile_number)) {
      newErrors.alternate_mobile_number = 'Please enter a valid 10-digit phone number';
    }
    if (!customerData.address_line1.trim()) newErrors.address_line1 = 'Address is required';
    if (!customerData.district.trim()) newErrors.district = 'District is required';
    if (!customerData.state.trim()) newErrors.state = 'State is required';
    if (!customerData.city.trim()) newErrors.city = 'City is required';
    if (!customerData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!validatePincode(customerData.pincode)) newErrors.pincode = 'Please enter a valid 6-digit pincode';
    if (!customerData.identification_type) newErrors.identification_type = 'ID type is required';
    if (!customerData.identification_number.trim()) newErrors.identification_number = 'ID number is required';
    // else if (customerData.identification_type === 'AADHAR' && !validateAadhar(customerData.identification_number)) {
    //   newErrors.identification_number = 'Please enter valid Aadhar number (XXXX XXXX XXXX)';
    // } else if (customerData.identification_type === 'PAN' && !validatePAN(customerData.identification_number)) {
    //   newErrors.identification_number = 'Please enter valid PAN number (ABCDE1234F)';
    // }
    if (!customerData.gender) newErrors.gender = 'Gender is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [customerData, validateEmail, validatePhone, validatePincode, validatePAN]);

  // Validate form on mount and whenever customerData changes
  useEffect(() => {
    if (isEditing) {
      validateForm();
    }
  }, [customerData, isEditing, validateForm]);

  // Check if form is valid and has changes
  const isFormValid = useMemo(() => {
    return Object.keys(errors).length === 0 && isEditing;
  }, [errors, isEditing]);

  // Input change handler with phone number formatting
  const handleInputChange = useCallback((field, value) => {
    if (isEditing && !nonEditableFields.includes(field)) {
      let formattedValue = value;
      if (field === 'phone_number' || field === 'alternate_mobile_number') {
        const cleanedValue = value.replace(/^\+91|\D/g, '');
        formattedValue = cleanedValue ? `+91${cleanedValue.slice(0, 10)}` : '';
      }
      setCustomerData((prev) => ({
        ...prev,
        [field]: formattedValue,
      }));
    }
  }, [isEditing, nonEditableFields]);

  // Save handler
  const handleSave = useCallback(() => {
    if (validateForm()) {
      showSheet()
      setShowOverlay(true);
      setShowAlert(true);
    } else {
      showToast({
        message: 'Please fill all mandatory fields correctly',
        type: 'error',
        duration: 3000,
        position: 'top',
      });
    }
  }, [validateForm]);

  // Confirm save handler
  const handleConfirmSave = useCallback(() => {
    const payload = {
      ...customerData,
      phone_number: customerData.phone_number.replace(/^\+91/, ''),
      alternate_mobile_number: customerData.alternate_mobile_number
        ? customerData.alternate_mobile_number.replace(/^\+91/, '')
        : '',
    };

    setShowOverlay(false);
    setShowAlert(false);
    setIsEditing(false);

    dispatch(updateCustomer(payload)).then((response) => {
      if (response?.payload?.success && response?.payload?.status_code === 200) {
        dispatch(getsingleCustomerdetails(customerData.id));
        navigation.goBack();
        showToast({
          message: 'Customer updated successfully!',
          type: 'success',
          duration: 3000,
          position: 'top',
        });
      } else {
        setIsEditing(true); // Re-enable editing if the save fails
        showToast({
          message: response?.payload?.message || 'Failed to update customer',
          type: 'error',
          duration: 3000,
          position: 'top',
        });
      }
    });
  }, [customerData, dispatch, navigation, showToast]);

  // Format date helper
  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Status badge component
  const renderStatusBadge = useCallback((status) => {
    const statusConfig = {
      Active: {
        bg: 'bg-emerald-500',
        text: 'text-white',
        icon: 'checkmark-circle',
        label: 'Active',
      },
      Inactive: {
        bg: 'bg-red-500',
        text: 'text-white',
        icon: 'close-circle',
        label: 'Inactive',
      },
    };

    const config = statusConfig[status ? 'Active' : 'Inactive'];
    return (
      <View className={`${config.bg} px-4 py-2 rounded-xl flex-row items-center`}>
        <Icon name={config.icon} size={16} color="white" />
        <Text className={`${config.text} font-medium ml-2`}>{config.label}</Text>
      </View>
    );
  }, []);

  // Bottom sheet animation hook
  const useBottomSheetAnimation = () => {
    const translateY = useSharedValue(1000);

    const animatedStyles = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const showSheet = () => {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
        mass: 0.8,
      });
    };

    const hideSheet = (callback) => {
      translateY.value = withSpring(1000, {
        damping: 20,
        stiffness: 120,
        mass: 0.8,
      }, () => {
        if (callback) runOnJS(callback)();
      });
    };

    return { animatedStyles, showSheet, hideSheet };
  };

  const { animatedStyles, showSheet, hideSheet } = useBottomSheetAnimation();

  // Memoized dropdown component
  const DropdownModal = useCallback(
    ({ visible, onClose, options, selectedValue, onSelect, title }) => (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <TouchableOpacity className="flex-1 bg-black/50 justify-center px-4" activeOpacity={1} onPress={onClose}>
          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 mx-4`}>
            <Text className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-4 text-center`}>
              {title}
            </Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className={`flex-row items-center p-4 rounded-2xl mb-2 ${selectedValue === item.value
                    ? isDarkMode
                      ? 'bg-teal-900/30'
                      : 'bg-teal-100'
                    : isDarkMode
                      ? 'bg-gray-700/30'
                      : 'bg-gray-50'
                    }`}
                  onPress={() => {
                    onSelect(item.value);
                    onClose();
                  }}
                >
                  <View className={`${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'} p-2 rounded-xl mr-3`}>
                    <Icon
                      name={item.icon}
                      size={20}
                      color={selectedValue === item.value ? '#14b8a6' : isDarkMode ? '#6b7280' : '#9ca3af'}
                    />
                  </View>
                  <Text
                    className={`flex-1 font-medium ${selectedValue === item.value
                      ? 'text-teal-600'
                      : isDarkMode
                        ? 'text-white'
                        : 'text-gray-900'
                      }`}
                  >
                    {item.label}
                  </Text>
                  {selectedValue === item.value && <Icon name="checkmark-circle" size={20} color="#14b8a6" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    ),
    [isDarkMode]
  );

  // Dropdown handlers
  const handleGenderSelect = useCallback(
    (value) => {
      handleInputChange('gender', value);
      setShowGenderDropdown(false);
    },
    [handleInputChange]
  );

  const handleIdTypeSelect = useCallback(
    (value) => {
      handleInputChange('identification_type', value);
      setShowIdTypeDropdown(false);
    },
    [handleInputChange]
  );

  // Memoized display values
  const genderDisplayValue = useMemo(
    () => genderOptions.find((g) => g.value === customerData.gender)?.label || 'Select Gender',
    [genderOptions, customerData.gender]
  );

  const idTypeDisplayValue = useMemo(
    () => identificationOptions.find((id) => id.value === customerData.identification_type)?.label || 'Select ID Type',
    [identificationOptions, customerData.identification_type]
  );

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <LinearGradient colors={['#1a9c94', '#14b8a6']} className="pt-12 pb-8 px-4 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="bg-white/20 p-2 rounded-xl mr-4">
              <Icon name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            <View>
              <Text className="text-white text-2xl font-bold">Edit Customer</Text>
              <Text className="text-teal-100 text-base mt-1">ID: {customerData.id}</Text>
            </View>
          </View>
          {!isEditing && (
            <TouchableOpacity
              onPress={() => setIsEditing(true)}
              className="bg-white/20 px-4 py-2 rounded-xl flex-row items-center"
            >
              <Icon name="create-outline" size={20} color="white" />
              <Text className="text-white font-medium ml-2">Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-row justify-between bg-white/10 p-4 rounded-2xl">
          <View>
            <Text className="text-teal-100 text-sm mb-2">Status</Text>
            {renderStatusBadge(customerData.status)}
          </View>
          <View>
            <Text className="text-teal-100 text-sm">Join Date</Text>
            <Text className="text-white text-lg font-semibold mt-1">{customerData.joinDate}</Text>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView className="flex-1 px-4 -mt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Personal Information */}
          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-sm mb-6`}>
            <FormSection title="Personal Information" isDarkMode={isDarkMode}>
              <FormInput
                label="Full Name *"
                icon="person-outline"
                value={customerData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                editable={isEditing}
                isDarkMode={isDarkMode}
                error={errors.name}
                placeholder="Enter full name"
              />
              <FormDropdown
                label="Gender *"
                icon={genderOptions.find((g) => g.value === customerData.gender)?.icon || 'people-outline'}
                value={customerData.gender}
                displayValue={genderDisplayValue}
                onPress={() => isEditing && setShowGenderDropdown(true)}
                editable={isEditing}
                isDarkMode={isDarkMode}
                error={errors.gender}
                placeholder="Select Gender"
              />
              <FormInput
                label="Date of Birth"
                icon="calendar-outline"
                value={formatDate(customerData.date_of_birth)}
                editable={false}
                isDarkMode={isDarkMode}
              />
            </FormSection>
          </View>

          {/* Contact Information */}
          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-sm mb-6`}>
            <FormSection title="Contact Information" isDarkMode={isDarkMode}>
              <FormInput
                label="Primary Phone *"
                icon="call-outline"
                value={customerData.phone_number}
                onChangeText={(text) => handleInputChange('phone_number', text)}
                editable={isEditing}
                keyboardType="phone-pad"
                isDarkMode={isDarkMode}
                error={errors.phone_number}
                placeholder="+91 Enter 10-digit phone number"
                maxLength={13}
              />
              <FormInput
                label="Alternate Mobile"
                icon="call-outline"
                value={customerData.alternate_mobile_number}
                onChangeText={(text) => handleInputChange('alternate_mobile_number', text)}
                editable={isEditing}
                keyboardType="phone-pad"
                isDarkMode={isDarkMode}
                error={errors.alternate_mobile_number}
                placeholder="+91 Enter 10-digit alternate number"
                maxLength={13}
              />
              <FormInput
                label="Email Address *"
                icon="mail-outline"
                value={customerData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                editable={isEditing}
                keyboardType="email-address"
                autoCapitalize="none"
                isDarkMode={isDarkMode}
                error={errors.email}
                placeholder="Enter email address"
              />
            </FormSection>
          </View>

          {/* Address Information */}
          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-sm mb-6`}>
            <FormSection title="Address Information" isDarkMode={isDarkMode}>
              <FormInput
                label="Address Line 1 *"
                icon="home-outline"
                value={customerData.address_line1}
                onChangeText={(text) => handleInputChange('address_line1', text)}
                editable={isEditing}
                isDarkMode={isDarkMode}
                error={errors.address_line1}
                placeholder="Enter address"
                multiline
              />
              <FormInput
                label="Place Name"
                icon="location-outline"
                value={customerData.place_name}
                onChangeText={(text) => handleInputChange('place_name', text)}
                editable={isEditing}
                isDarkMode={isDarkMode}
                error={errors.place_name}
                placeholder="Enter place name"
              />
              <View className="flex-row justify-between">
                <View className="flex-1 mr-2">
                  <FormInput
                    label="City *"
                    icon="business-outline"
                    value={customerData.city}
                    onChangeText={(text) => handleInputChange('city', text)}
                    editable={isEditing}
                    isDarkMode={isDarkMode}
                    error={errors.city}
                    placeholder="Enter city"
                  />
                </View>
                <View className="flex-1 ml-2">
                  <FormInput
                    label="Pincode *"
                    icon="pin-outline"
                    value={customerData.pincode}
                    onChangeText={(text) => handleInputChange('pincode', text.replace(/\D/g, ''))}
                    editable={isEditing}
                    keyboardType="numeric"
                    isDarkMode={isDarkMode}
                    error={errors.pincode}
                    placeholder="Enter pincode"
                    maxLength={6}
                  />
                </View>
              </View>
              <View className="flex-row justify-between">
                <View className="flex-1 mr-2">
                  <FormInput
                    label="District *"
                    icon="map-outline"
                    value={customerData.district}
                    onChangeText={(text) => handleInputChange('district', text)}
                    editable={isEditing}
                    isDarkMode={isDarkMode}
                    error={errors.district}
                    placeholder="Enter district"
                  />
                </View>
                <View className="flex-1 ml-2">
                  <FormInput
                    label="State *"
                    icon="flag-outline"
                    value={customerData.state}
                    onChangeText={(text) => handleInputChange('state', text)}
                    editable={isEditing}
                    isDarkMode={isDarkMode}
                    error={errors.state}
                    placeholder="Enter state"
                  />
                </View>
              </View>
            </FormSection>
          </View>

          {/* Identification Information */}
          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-sm mb-6`}>
            <FormSection title="Identification Information" isDarkMode={isDarkMode}>
              <FormDropdown
                label="ID Type *"
                icon={identificationOptions.find((id) => id.value === customerData.identification_type)?.icon || 'card-outline'}
                value={customerData.identification_type}
                displayValue={idTypeDisplayValue}
                onPress={() => isEditing && setShowIdTypeDropdown(true)}
                editable={isEditing}
                isDarkMode={isDarkMode}
                error={errors.identification_type}
                placeholder="Select ID Type"
              />
              <FormInput
                label="ID Number *"
                icon="card-outline"
                value={customerData.identification_number}
                onChangeText={(text) => handleInputChange('identification_number', text)}
                editable={isEditing}
                isDarkMode={isDarkMode}
                error={errors.identification_number}
                placeholder={
                  customerData.identification_type === 'AADHAR'
                    ? 'XXXX XXXX XXXX'
                    : customerData.identification_type === 'PAN'
                      ? 'ABCDE1234F'
                      : 'Enter ID number'
                }
              />
            </FormSection>
          </View>

          {/* Action Buttons */}
          {isEditing && (
            <Animated.View entering={FadeIn} exiting={FadeOut} className="p-6 shadow-sm">
              <View className="flex-row justify-between space-x-4">
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={!isFormValid || isloadingcustomer}
                  className={`flex-1 py-4 rounded-2xl flex-row items-center justify-center ${isFormValid && !isloadingcustomer
                    ? 'bg-teal-600'
                    : isDarkMode
                      ? 'bg-gray-700'
                      : 'bg-gray-300'
                    }`}
                >
                  <Icon
                    name="checkmark-outline"
                    size={20}
                    color={isFormValid && !isloadingcustomer ? 'white' : isDarkMode ? '#6b7280' : '#9ca3af'}
                  />
                  <Text
                    className={`font-semibold ml-2 ${isFormValid && !isloadingcustomer ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                  >
                    Save Changes
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Gender Dropdown Modal */}
      <DropdownModal
        visible={showGenderDropdown}
        onClose={() => setShowGenderDropdown(false)}
        options={genderOptions}
        selectedValue={customerData.gender}
        onSelect={handleGenderSelect}
        title="Select Gender"
      />

      {/* ID Type Dropdown Modal */}
      <DropdownModal
        visible={showIdTypeDropdown}
        onClose={() => setShowIdTypeDropdown(false)}
        options={identificationOptions}
        selectedValue={customerData.identification_type}
        onSelect={handleIdTypeSelect}
        title="Select ID Type"
      />

      {/* Save Confirmation Bottom Sheet */}
      {showAlert && (
        <View className="absolute inset-0" style={{ elevation: 1000, zIndex: 1000 }}>

          {showOverlay && (
            <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} className="absolute inset-0 bg-black/50">
              <TouchableOpacity
                className="flex-1"
                activeOpacity={1}
                onPress={() => {
                  hideSheet()
                  setShowAlert(false);
                  setShowOverlay(false);
                }}
              />
            </Animated.View>
          )}

          <Animated.View
            style={[styles.modalContent(isDarkMode), animatedStyles]}
            className={`absolute bottom-0 w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-t-3xl`}
          >
            <View className="p-6">
              <View className="items-center mb-6">
                <View className="w-12 h-1 bg-gray-200 rounded-full" />
              </View>
              <View className="items-center mb-6">
                <Icon name="alert-circle-outline" size={40} color="#1a9c94" />
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mt-4`}>
                  Save Changes?
                </Text>
                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-center mt-2 px-6`}>
                  Are you sure you want to save these changes?
                </Text>
              </View>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    hideSheet(() => {
                      setShowAlert(false);
                      setShowOverlay(false);
                    });
                  }}
                  className={`flex-1 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-4 rounded-2xl`}
                >
                  <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} font-medium text-center`}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirmSave} className="flex-1 bg-teal-500 p-4 rounded-2xl">
                  <Text className="text-white font-medium text-center">Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalContent: (isDarkMode) => ({
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: isDarkMode ? 0.45 : 0.25,
    shadowRadius: 4,
    elevation: 1000,
    zIndex: 1000,
    backgroundColor: isDarkMode ? '#1f2937' : 'white',
    minHeight: 250,
  }),
});

export default EditCustomerScreen;