import React, { useState, useEffect } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView, Text, TouchableOpacity, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { useHideTabBar } from '../../hooks/useHideTabBar';
import { useNavigation } from '@react-navigation/native';
import { FormSection, FormInput, DocumentUploadButton } from './Components/FormComponents';
import { useToast } from '../../Context/ToastContext';
import { createCustomer } from '../../redux/Slices/customerSlice';
import moment from 'moment';

const CustomDropdown = ({ label, icon, options, value, onChange, isDarkMode, error }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Function to get the display label for the selected value
  const getDisplayLabel = (val) => {
    const selectedOption = options.find(option => option.value === val);
    return selectedOption ? selectedOption.label : 'Select an option';
  };

  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-1">
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
          {label}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setIsOpen(true)}
        className={`flex-row items-center rounded-xl border ${error
          ? 'bg-red-50 border-red-300'
          : isDarkMode
            ? 'bg-gray-700/50 border-gray-600'
            : 'bg-gray-50/80 border-gray-200'
          }`}
      >
        <View className="pl-4">
          <Icon name={icon} size={20} color={error ? '#ef4444' : '#2ec4b6'} />
        </View>
        <View className="flex-1 py-3.5 px-4 flex-row justify-between items-center">
          <Text className={`${error
            ? 'text-red-900'
            : isDarkMode ? 'text-gray-50' : 'text-gray-800'
            }`}>
            {getDisplayLabel(value)}
          </Text>
          <Icon name="chevron-down" size={24} color={
            error ? '#ef4444' : isDarkMode ? '#9ca3af' : '#6b7280'
          } />
        </View>
      </TouchableOpacity>
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
      )}

      {/* Dropdown Selection Modal */}
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setIsOpen(false)}
        >
          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} m-4 rounded-2xl p-4 w-4/5`}>
            <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} text-lg font-bold mb-4 text-center`}>
              Select {label}
            </Text>

            {options.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`p-4 rounded-xl mb-2 ${value === option.value
                  ? 'bg-teal-500'
                  : isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
              >
                <Text className={`text-center font-medium ${value === option.value
                  ? 'text-white'
                  : isDarkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              className={`mt-2 p-3 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
            >
              <Text className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const CreateCustomerScreen = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { isloadingcustomer } = useSelector((state) => state.customer);
  useHideTabBar(['Createcustomer']);
  const navigation = useNavigation();
  const { showToast } = useToast();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    alternate_mobile_number: '',
    gender: '',
    date_of_birth: '',
    address_line1: '',
    district: '',
    state: '',
    city: '',
    pincode: '',
    place_name: '',
    identification_type: 'AADHAR',
    identification_number: '',
    profession: '',
    bankAccountNumber: '',
    loanAmount: '',
    loanTerm: '',
    interestRate: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState({
    profile_photo: false,
    identification_photo: false,
    bankDocument: false,
    salarySlip: false,
    fingerprint: false,
  });

  const genderOptions = [
    { label: 'Male', value: 'MALE' },
    { label: 'Female', value: 'FEMALE' },
    { label: 'Other', value: 'OTHER' },
  ];

  const identificationOptions = [
    { label: 'Aadhar', value: 'AADHAR' },
    { label: 'PAN', value: 'PAN' },
    { label: 'Voter ID', value: 'VOTER_ID' },
    { label: 'Driving License', value: 'DRIVING_LICENSE' },
    { label: 'Passport', value: 'PASSPORT' },
  ];

  const validateField = (field, value) => {
    let error = '';

    switch (field) {
      case 'name':
        if (!value.trim()) error = 'Name is required';
        break;
      case 'phone_number':
        if (!value.match(/^\+91\d{10}$/)) error = 'Phone number must be +91 followed by 10 digits';
        break;
      case 'alternate_mobile_number':
        if (value && !value.match(/^\+91\d{10}$/)) error = 'Alternate number must be +91 followed by 10 digits';
        break;
      case 'email':
        if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) error = 'Invalid email format';
        break;
      case 'gender':
        if (!value) error = 'Gender is required';
        break;
      case 'date_of_birth':
        if (!value.match(/^\d{2}\-\d{2}\-\d{4}$/)) error = 'Date format: DD-MM-YYYY';
        break;
      case 'address_line1':
        if (!value.trim()) error = 'Address is required';
        break;
      case 'city':
        if (!value.trim()) error = 'City is required';
        break;
      case 'district':
        if (!value.trim()) error = 'District is required';
        break;
      case 'state':
        if (!value.trim()) error = 'State is required';
        break;
      case 'pincode':
        if (!value.match(/^\d{6}$/)) error = 'PIN code must be 6 digits';
        break;
      case 'identification_type':
        if (!value) error = 'Identification type is required';
        break;
      case 'identification_number':
        if (!value.trim()) error = 'Identification number is required';
        break;
      case 'profession':
        if (!value.trim()) error = 'Profession is required';
        break;
      case 'bankAccountNumber':
        if (!value.trim()) error = 'Bank account number is required';
        break;
    }

    return error;
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });

    const allDocumentsSelected = Object.values(selectedDocuments).every(doc => doc);
    if (!allDocumentsSelected) {
      isValid = false;
    }

    setFormErrors(errors);
    setIsFormValid(isValid && allDocumentsSelected);
  };


  const handleInputChange = (field, value) => {
    if (field === 'phone_number' || field === 'alternate_mobile_number') {
      if (!value.startsWith('+91') && value.length <= 10) {
        value = `+91${value.replace(/^\+91/, '')}`;
      }
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDocumentSelect = (type) => {
    setSelectedDocuments(prev => ({
      ...prev,
      [type]: true
    }));
  };

  const handleSubmit = () => {
    validateForm();
    if (!isFormValid) {
      const payload = {
        name: formData.name,
        phone_number: formData.phone_number,
        address_line1: formData.address_line1,
        district: formData.district,
        state: formData.date_of_birth,
        city: formData.city,
        pincode: formData.pincode,
        place_name: formData.place_name,
        identification_type: 'AADHAR',
        identification_number: formData.identification_number,
        email: formData.identification_number,
        alternate_mobile_number: formData.alternate_mobile_number,
        gender: formData.gender,
        date_of_birth: moment(formData.date_of_birth).format("YYYY-MM-DD")
      }

      dispatch(createCustomer(payload)).then((res) => {
        if (res.payload.success) {
          showToast({
            message: 'Customer created Succcessfully!',
            type: 'success',
            duration: 3000,
            position: 'top' // or 'bottom'
          })
          navigation.goBack();
        } else {
          showToast({
            message: res?.payload?.message || "Failed to update profile",
            type: 'error',
            duration: 3000,
            position: 'top' // or 'bottom'
          })
        }
      })

    }
  };

  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <View className="bg-primary-100 pt-10 pb-16 px-4 rounded-b-[32px]">
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Create Customer</Text>
        </View>
        <Text className="text-white/70">Enter customer details below to create a new customer profile and loan application.</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-4 -mt-10" showsVerticalScrollIndicator={false}>
          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-sm mb-6`}>
            <FormSection title="Personal Information" isDarkMode={isDarkMode}>
              <FormInput
                label="Full Name"
                icon="person-outline"
                placeholder="Enter full name"
                value={formData.name}
                onChangeText={(text) => handleInputChange('name', text)}
                isDarkMode={isDarkMode}
                error={formErrors.name}
              />
              <FormInput
                label="Phone Number"
                icon="call-outline"
                placeholder="+91 Enter phone number"
                keyboardType="phone-pad"
                value={formData.phone_number}
                onChangeText={(text) => handleInputChange('phone_number', text)}
                isDarkMode={isDarkMode}
                error={formErrors.phone_number}
              />
              <FormInput
                label="Email Address"
                icon="mail-outline"
                placeholder="Enter email address"
                keyboardType="email-address"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                isDarkMode={isDarkMode}
                error={formErrors.email}
              />
              <FormInput
                label="Alternate Mobile Number"
                icon="call-outline"
                placeholder="+91 Enter alternate mobile number"
                keyboardType="phone-pad"
                value={formData.alternate_mobile_number}
                onChangeText={(text) => handleInputChange('alternate_mobile_number', text)}
                isDarkMode={isDarkMode}
                error={formErrors.alternate_mobile_number}
              />
              <CustomDropdown
                label="Gender"
                icon="person-outline"
                options={genderOptions}
                value={formData.gender}
                onChange={(value) => handleInputChange('gender', value)}
                isDarkMode={isDarkMode}
                error={formErrors.gender}
              />
              <FormInput
                label="Date of Birth"
                icon="calendar-outline"
                placeholder="DD/MM/YYYY"
                value={formData.date_of_birth}
                onChangeText={(text) => handleInputChange('date_of_birth', text)}
                isDarkMode={isDarkMode}
                error={formErrors.date_of_birth}
              />
            </FormSection>
          </View>

          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-sm mb-6`}>
            <FormSection title="Address Information" isDarkMode={isDarkMode}>
              <FormInput
                label="Address Line 1"
                icon="home-outline"
                placeholder="Enter full address"
                multiline
                numberOfLines={2}
                value={formData.address_line1}
                onChangeText={(text) => handleInputChange('address_line1', text)}
                isDarkMode={isDarkMode}
                error={formErrors.address_line1}
              />
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <FormInput
                    label="City"
                    icon="location-outline"
                    placeholder="Enter city"
                    value={formData.city}
                    onChangeText={(text) => handleInputChange('city', text)}
                    isDarkMode={isDarkMode}
                    error={formErrors.city}
                  />
                </View>
                <View className="flex-1">
                  <FormInput
                    label="District"
                    icon="location-outline"
                    placeholder="Enter district"
                    value={formData.district}
                    onChangeText={(text) => handleInputChange('district', text)}
                    isDarkMode={isDarkMode}
                    error={formErrors.district}
                  />
                </View>
              </View>
              <View className="flex-row gap-4">
                <View className="flex-1">
                  <FormInput
                    label="State"
                    icon="map-outline"
                    placeholder="Enter state"
                    value={formData.state}
                    onChangeText={(text) => handleInputChange('state', text)}
                    isDarkMode={isDarkMode}
                    error={formErrors.state}
                  />
                </View>
                <View className="flex-1">
                  <FormInput
                    label="PIN Code"
                    icon="location-outline"
                    placeholder="Enter PIN code"
                    keyboardType="numeric"
                    maxLength={6}
                    value={formData.pincode}
                    onChangeText={(text) => handleInputChange('pincode', text)}
                    isDarkMode={isDarkMode}
                    error={formErrors.pincode}
                  />
                </View>
              </View>
              <FormInput
                label="Place Name"
                icon="pin-outline"
                placeholder="Enter place name"
                value={formData.place_name}
                onChangeText={(text) => handleInputChange('place_name', text)}
                isDarkMode={isDarkMode}
              />
            </FormSection>
          </View>

          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-sm mb-6`}>
            <FormSection title="Identification Details" isDarkMode={isDarkMode}>
              <CustomDropdown
                label="Identification Type"
                icon="card-outline"
                options={identificationOptions}
                value={formData.identification_type}
                onChange={(value) => handleInputChange('identification_type', value)}
                isDarkMode={isDarkMode}
                error={formErrors.identification_type}
              />
              <FormInput
                label="Identification Number"
                icon="keypad-outline"
                placeholder="Enter identification number"
                value={formData.identification_number}
                onChangeText={(text) => handleInputChange('identification_number', text)}
                isDarkMode={isDarkMode}
                error={formErrors.identification_number}
              />
            </FormSection>
          </View>

          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-sm mb-6`}>
            <FormSection title="Financial Information" isDarkMode={isDarkMode}>
              <FormInput
                label="Profession"
                icon="briefcase-outline"
                placeholder="Enter profession"
                value={formData.profession}
                onChangeText={(text) => handleInputChange('profession', text)}
                isDarkMode={isDarkMode}
                error={formErrors.profession}
              />
              <FormInput
                label="Bank Account Number"
                icon="card-outline"
                placeholder="Enter bank account number"
                value={formData.bankAccountNumber}
                onChangeText={(text) => handleInputChange('bankAccountNumber', text)}
                isDarkMode={isDarkMode}
                error={formErrors.bankAccountNumber}
              />
            </FormSection>
          </View>

          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-3xl p-6 shadow-sm mb-6`}>
            <FormSection title="Required Documents" isDarkMode={isDarkMode}>
              <DocumentUploadButton
                icon="person-outline"
                label="Profile Photo"
                selected={selectedDocuments.profile_photo}
                onPress={() => handleDocumentSelect('profile_photo')}
                isDarkMode={isDarkMode}
              />
              <DocumentUploadButton
                icon="card-outline"
                label="Identification Photo"
                selected={selectedDocuments.identification_photo}
                onPress={() => handleDocumentSelect('identification_photo')}
                isDarkMode={isDarkMode}
              />
              <DocumentUploadButton
                icon="document-text-outline"
                label="Bank Statement"
                selected={selectedDocuments.bankDocument}
                onPress={() => handleDocumentSelect('bankDocument')}
                isDarkMode={isDarkMode}
              />
              <DocumentUploadButton
                icon="receipt-outline"
                label="Salary Slip"
                selected={selectedDocuments.salarySlip}
                onPress={() => handleDocumentSelect('salarySlip')}
                isDarkMode={isDarkMode}
              />
              <DocumentUploadButton
                icon="finger-print-outline"
                label="Fingerprint"
                selected={selectedDocuments.fingerprint}
                onPress={() => handleDocumentSelect('fingerprint')}
                isDarkMode={isDarkMode}
              />
            </FormSection>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isloadingcustomer}
            className={`mx-4 my-6 py-4 rounded-xl shadow-lg ${!isloadingcustomer ? 'bg-primary-100' : 'bg-gray-500'}`}
          >
            <Text className={`text-center font-bold text-lg ${!isloadingcustomer ? 'text-white' : 'text-gray-400'}`}>
              Create Customer
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CreateCustomerScreen;