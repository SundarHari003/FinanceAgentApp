import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Image, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useHideTabBar } from '../../hooks/useHideTabBar';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeIn,
  FadeOut,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  runOnJS
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../Context/ToastContext';
import API_URL from '../../redux/BaseUrl/baseurl';
import profiledummy from '../../assests/agent-avatar.png'
import { getAgentuserData, updateAgentuserData } from '../../redux/AuthSlice/authslice';

const agentDocuments = [
  {
    id: '1',
    type: 'Aadhaar Card',
    number: '1234-5678-9012',
    status: 'verified',
    url: 'https://example.com/aadhar.pdf',
    icon: 'credit-card',
    uploadDate: '10 Jan 2023'
  },
  {
    id: '2',
    type: 'PAN Card',
    number: 'ABCDE1234F',
    status: 'verified',
    url: 'https://example.com/pan.pdf',
    icon: 'badge',
    uploadDate: '11 Jan 2023'
  },
  {
    id: '3',
    type: 'Degree Certificate',
    number: 'UNIV2020ABC',
    status: 'verified',
    url: 'https://example.com/degree.pdf',
    icon: 'school',
    uploadDate: '12 Jan 2023'
  },
  {
    id: '4',
    type: 'License',
    number: 'LIC123456789',
    status: 'pending',
    url: 'https://example.com/license.pdf',
    icon: 'workspace-premium',
    uploadDate: '13 Jan 2023'
  }
];

// Gender options
const genderOptions = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
  { label: 'Prefer not to say', value: 'prefer_not_to_say' }
];

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

// Update ReadOnlyField component with dark mode
const ReadOnlyField = ({ label, value, icon, isDarkMode }) => (
  <View className="mb-4">
    <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm mb-1`}>{label}</Text>
    <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} p-4 rounded-xl flex-row items-center`}>
      {icon && <Icon name={icon} size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} className="mr-3" />}
      <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-medium`}>{value}</Text>
    </View>
  </View>
);

// Enhanced EditableField component with validation
const EditableField = ({
  label,
  value,
  onChangeText,
  icon,
  keyboardType = 'default',
  isDarkMode,
  multiline = false,
  error = null,
  required = false
}) => (
  <View className="mb-4">
    <View className="flex-row items-center mb-1">
      <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
        {label}
      </Text>
      {required && <Text className="text-red-500 ml-1">*</Text>}
    </View>
    <View className={`flex-row items-center rounded-xl border ${error
      ? 'bg-red-50 border-red-300'
      : isDarkMode
        ? 'bg-gray-700/50 border-gray-600'
        : 'bg-gray-50/80 border-gray-200'
      }`}>
      {icon && (
        <View className="pl-4">
          <Icon name={icon} size={20} color={error ? '#ef4444' : '#2ec4b6'} />
        </View>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        className={`flex-1 py-3.5 px-4 ${error
          ? 'text-red-900'
          : isDarkMode ? 'text-gray-50' : 'text-gray-800'
          }`}
        placeholderTextColor={error ? '#ef4444' : isDarkMode ? '#9ca3af' : '#6b7280'}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
    </View>
    {error && (
      <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
    )}
  </View>
);

// Enhanced Gender Dropdown Component with validation
const GenderDropdown = ({ label, value, onSelect, isDarkMode, error = null, required = false }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const getGenderLabel = (value) => {
    const option = genderOptions.find(opt => opt.value === value);
    return option ? option.label : 'Select Gender';
  };

  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-1">
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
          {label}
        </Text>
        {required && <Text className="text-red-500 ml-1">*</Text>}
      </View>
      <TouchableOpacity
        onPress={() => setShowDropdown(true)}
        className={`flex-row items-center rounded-xl border ${error
          ? 'bg-red-50 border-red-300'
          : isDarkMode
            ? 'bg-gray-700/50 border-gray-600'
            : 'bg-gray-50/80 border-gray-200'
          }`}
      >
        <View className="pl-4">
          <Icon name="person" size={20} color={error ? '#ef4444' : '#2ec4b6'} />
        </View>
        <View className="flex-1 py-3.5 px-4 flex-row justify-between items-center">
          <Text className={`${error
            ? 'text-red-900'
            : isDarkMode ? 'text-gray-50' : 'text-gray-800'
            }`}>
            {getGenderLabel(value)}
          </Text>
          <Icon name="arrow-drop-down" size={24} color={
            error ? '#ef4444' : isDarkMode ? '#9ca3af' : '#6b7280'
          } />
        </View>
      </TouchableOpacity>
      {error && (
        <Text className="text-red-500 text-xs mt-1 ml-1">{error}</Text>
      )}

      {/* Gender Selection Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          className="flex-1 bg-black/50 justify-center items-center"
          onPress={() => setShowDropdown(false)}
        >
          <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} m-4 rounded-2xl p-4 w-4/5`}>
            <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} text-lg font-bold mb-4 text-center`}>
              Select Gender
            </Text>

            {genderOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                  setShowDropdown(false);
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
              onPress={() => setShowDropdown(false)}
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

// Update DocumentCard component with transparent status badges
const DocumentCard = ({ document, onView, onDownload, isDarkMode }) => (
  <View className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
    } p-4 rounded-xl mb-3 border`}>
    <View className="flex-row justify-between items-center">
      <View className="flex-row items-center flex-1">
        <View className={`${isDarkMode ? 'bg-gray-700' : 'bg-primary-100/10'} p-2 rounded-lg`}>
          <Icon
            name={document.icon}
            size={24}
            color={'#2ec4b6'}
          />
        </View>
        <View className="ml-3 flex-1">
          <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'
            } font-medium`}>
            {document.type}
          </Text>
          <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'
            } text-sm mt-0.5`}>
            {document.number}
          </Text>
        </View>
      </View>
      <View className={`px-2 py-1 rounded-full ${document.status === 'verified'
        ? isDarkMode ? 'bg-green-900/30' : 'bg-green-100'
        : isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100'
        }`}>
        <Text className={`text-xs font-medium ${document.status === 'verified'
          ? isDarkMode ? 'text-green-400' : 'text-green-700'
          : isDarkMode ? 'text-yellow-400' : 'text-yellow-700'
          }`}>
          {document.status.toUpperCase()}
        </Text>
      </View>
    </View>

    <View className={`flex-row mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-100'
      }`}>
      <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'
        } text-sm flex-1`}>
        Uploaded: {document.uploadDate}
      </Text>
      <TouchableOpacity
        onPress={() => onView(document)}
        className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
          } px-3 py-1 rounded-full mr-2`}
      >
        <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'
          } text-sm`}>
          View
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onDownload(document)}
        className={`${isDarkMode ? 'bg-teal-900/30' : 'bg-primary-100/10'
          } px-3 py-1 rounded-full`}
      >
        <Text className={`${isDarkMode ? 'text-teal-400' : 'text-primary-100'
          } text-sm`}>
          Download
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

const useBottomSheetAnimation = () => {
  const translateY = useSharedValue(1000);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }]
  }));

  const showSheet = () => {
    translateY.value = withSpring(0, {
      damping: 20,
      stiffness: 90,
      mass: 0.8,
    });
  };

  const hideSheet = () => {
    translateY.value = withSpring(1000, {
      damping: 20,
      stiffness: 120,
      mass: 0.8,
    });
  };

  return { animatedStyles, showSheet, hideSheet };
};

const Editprofile = () => {
  const navigation = useNavigation();
  const { user } = useSelector((state) => state.auth)
  useHideTabBar(['EditProfile']);
  const { showToast } = useToast();
  const [showAlert, setShowAlert] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const { animatedStyles, showSheet, hideSheet } = useBottomSheetAnimation();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const userData = user?.data;
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    fullName: userData?.full_name || '',
    email: userData?.email || '',
    phone: userData?.phone_number || '',
    address: userData?.address || '',
    state: userData?.region || '',
    district: userData?.territory || '',
    gender: userData?.gender || ''
  });

  // Validation errors state
  const [errors, setErrors] = useState({});

  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid phone number (10 digits required)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if form has changes
  const hasFormChanges = () => {
    return (
      formData.fullName !== (userData?.full_name || '') ||
      formData.email !== (userData?.email || '') ||
      formData.phone !== (userData?.phone_number || '') ||
      formData.address !== (userData?.address || '') ||
      formData.state !== (userData?.region || '') ||
      formData.district !== (userData?.territory || '') ||
      formData.gender !== (userData?.gender || '')
    );
  };

  // Check if save button should be enabled
  const isSaveEnabled = () => {
    return hasFormChanges() && Object.keys(errors).length === 0;
  };

  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setShowDocumentPreview(true);
  };

  const handleDownloadDocument = (document) => {
    // Implement document download logic
    console.log('Downloading:', document.type);
  };

  const handleSave = () => {
    if (validateForm()) {
      setShowAlert(true);
      setShowOverlay(true);
      requestAnimationFrame(showSheet);
    } else {
      showToast({
        message: 'Please fix all errors before saving',
        type: 'error',
        duration: 3000,
        position: 'top'
      });
    }
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Reset form data when exiting edit mode
      setFormData({
        fullName: userData?.full_name || '',
        email: userData?.email || '',
        phone: userData?.phone_number || '',
        address: userData?.address || '',
        state: userData?.region || '',
        district: userData?.territory || '',
        gender: userData?.gender || ''
      });
      setErrors({});
    }
    setIsEditMode(!isEditMode);
  };

  // Handle field changes with real-time validation
  const handleFieldChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Clear error for this field when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };
  const handleupdatesvedchange = () => {
    const payloads = {
      "full_name": formData.fullName,
      "email": formData.email,
      "phone_number": formData.phone,
      "manager_id": userData?.manager_id,
      "territory": formData.district,
      "region": formData.state,
      "is_active": true
    }
    console.log(payloads,"csd");
    
    dispatch(updateAgentuserData({ "id": userData?.id, "payloads": payloads })).then((response) => {
      if (response?.payload?.success && response?.payload?.status_code == 200) {
        dispatch(getAgentuserData(userData?.id));
        showToast({
          message: 'Updated Profile Successfully!',
          type: 'success',
          duration: 3000,
          position: 'top' // or 'bottom'
        })
        setIsEditMode(false);
      }
      else {
        showToast({
          message: response?.payload?.message || "Failed to update profile",
          type: 'error',
          duration: 3000,
          position: 'top' // or 'bottom'
        })
      }
    })
    hideSheet();
    setShowAlert(false);
    setShowOverlay(false);
  }
  return (
    <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <LinearGradient
        colors={['#1a9c94', '#14b8a6']}
        className="pt-12 pb-8 px-4 rounded-b-3xl"
      >
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="bg-white/20 p-2 rounded-xl mr-4"
            >
              <Icon name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            <View>
              <Text className="text-white text-2xl font-bold">Edit Profile</Text>
              <Text className="text-teal-100 text-base mt-1">@{userData?.username}</Text>
            </View>
          </View>

          {/* Edit Button */}
          <TouchableOpacity
            onPress={handleEditToggle}
            className="bg-white/20 p-2 rounded-xl"
          >
            <Icon name={isEditMode ? "visibility" : "edit"} size={22} color="white" />
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between bg-white/10 p-4 rounded-2xl">
          <View className='border-r border-r-gray-300/40 pr-12'>
            <Text className="text-teal-100 text-sm">Role</Text>
            <Text className="text-white text-lg font-semibold mt-1">
              {userData?.role}
            </Text>
          </View>
          <View>
            <Text className="text-teal-100 text-sm">Join Date</Text>
            <Text className="text-white text-lg font-semibold mt-1">
              {userData?.joinDate ?? "15 Jan 2023"}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-4">
          {/* Profile Image Section */}
          <View className={`${isDarkMode ? 'bg-gray-800/90' : 'bg-gray-200'} backdrop-blur-lg p-6 rounded-2xl shadow-sm mb-6 items-center`}>
            <TouchableOpacity onPress={() => setShowImagePreview(true)}>
              <Image
                source={profiledummy}
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
              />
            </TouchableOpacity>
            {isEditMode && (
              <TouchableOpacity
                className="bg-primary-100/10 px-4 py-2 rounded-full mt-3"
              >
                <Text className="text-primary-100 font-medium">Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Agent Information */}
          <View className={`${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-lg p-6 rounded-2xl shadow-sm mb-6`}>
            <Text className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Agent Information</Text>

            {/* Non-editable Fields */}
            <ReadOnlyField label="User Name" value={userData?.username} icon="badge" isDarkMode={isDarkMode} />
            <ReadOnlyField label="Role" value={userData?.role} icon="work" isDarkMode={isDarkMode} />
            <ReadOnlyField label="Department" value={userData?.department ?? "Field operations"} icon="business" isDarkMode={isDarkMode} />
            <ReadOnlyField label="Branch" value={userData?.branch ?? "Anna angar"} icon="location-on" isDarkMode={isDarkMode} />
            <ReadOnlyField label="Join Date" value={userData?.joinDate ?? "15 Jan 2023"} icon="event" isDarkMode={isDarkMode} />
            <ReadOnlyField label="Assigned Manager" value={userData?.manager?.full_name} icon="account-circle" isDarkMode={isDarkMode} />
          </View>

          {/* Personal Information */}
          <View className={`${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-lg p-6 rounded-2xl shadow-sm mb-6`}>
            <Text className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'} mb-4`}>Personal Information</Text>

            {isEditMode ? (
              // Editable Fields with validation
              <>
                <EditableField
                  label="Full Name"
                  value={formData.fullName}
                  onChangeText={(text) => handleFieldChange('fullName', text)}
                  icon="person-outline"
                  isDarkMode={isDarkMode}
                  error={errors.fullName}
                  required
                />
                <EditableField
                  label="Email"
                  value={formData.email}
                  onChangeText={(text) => handleFieldChange('email', text)}
                  icon="email"
                  keyboardType="email-address"
                  isDarkMode={isDarkMode}
                  error={errors.email}
                  required
                />
                <EditableField
                  label="Phone Number"
                  value={formData.phone}
                  onChangeText={(text) => handleFieldChange('phone', text)}
                  icon="phone"
                  keyboardType="phone-pad"
                  isDarkMode={isDarkMode}
                  error={errors.phone}
                  required
                />
                <EditableField
                  label="Address"
                  value={formData.address}
                  onChangeText={(text) => handleFieldChange('address', text)}
                  icon="home"
                  multiline
                  isDarkMode={isDarkMode}
                  error={errors.address}
                  required
                />
                <EditableField
                  label="State"
                  value={formData.state}
                  onChangeText={(text) => handleFieldChange('state', text)}
                  icon="location-city"
                  isDarkMode={isDarkMode}
                  error={errors.state}
                  required
                />
                <EditableField
                  label="District"
                  value={formData.district}
                  onChangeText={(text) => handleFieldChange('district', text)}
                  icon="location-city"
                  isDarkMode={isDarkMode}
                  error={errors.district}
                  required
                />
                <GenderDropdown
                  label="Gender"
                  value={formData.gender}
                  onSelect={(value) => handleFieldChange('gender', value)}
                  isDarkMode={isDarkMode}
                  error={errors.gender}
                  required
                />
              </>
            ) : (
              // Read-only Fields
              <>
                <ReadOnlyField label="Full Name" value={formData.fullName} icon="person-outline" isDarkMode={isDarkMode} />
                <ReadOnlyField label="Email" value={formData.email} icon="email" isDarkMode={isDarkMode} />
                <ReadOnlyField label="Phone Number" value={formData.phone} icon="phone" isDarkMode={isDarkMode} />
                <ReadOnlyField label="Address" value={formData.address} icon="home" isDarkMode={isDarkMode} />
                <ReadOnlyField label="State" value={formData.state} icon="location-city" isDarkMode={isDarkMode} />
                <ReadOnlyField label="District" value={formData.district} icon="location-city" isDarkMode={isDarkMode} />
                <ReadOnlyField
                  label="Gender"
                  value={genderOptions.find(opt => opt.value === formData.gender)?.label || 'Not specified'}
                  icon="person"
                  isDarkMode={isDarkMode}
                />
              </>
            )}
          </View>

          {/* Documents Section */}
          <View className={`${isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-lg p-6 rounded-2xl shadow-sm mb-6`}>
            <View className="flex-row justify-between items-center mb-4">
              <Text className={`text-lg font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Documents</Text>
              {isEditMode && (
                <TouchableOpacity
                  className="bg-primary-100/10 px-3 py-1 rounded-full"
                  onPress={() => console.log('Add new document')}
                >
                  <Text className="text-primary-100 text-sm font-medium">Upload New</Text>
                </TouchableOpacity>
              )}
            </View>

            {agentDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onView={handleViewDocument}
                onDownload={handleDownloadDocument}
                isDarkMode={isDarkMode}
              />
            ))}
          </View>

          {/* Save Button - only show in edit mode */}
          {isEditMode && (
            <View className="mx-4 my-6">
              <TouchableOpacity
                className={`p-4 rounded-2xl shadow-lg ${isSaveEnabled()
                  ? 'bg-primary-100 shadow-teal-200'
                  : 'bg-gray-400'
                  }`}
                onPress={handleSave}
                disabled={!isSaveEnabled()}
              >
                <View className="flex-row items-center justify-center">
                  <Icon name="save" size={20} color="white" />
                  <Text className="text-white text-lg font-bold ml-2">
                    Save Changes
                  </Text>
                </View>
              </TouchableOpacity>
              {!hasFormChanges() && (
                <Text className="text-gray-500 text-xs text-center mt-2">
                  No changes to save
                </Text>
              )}
              {hasFormChanges() && Object.keys(errors).length > 0 && (
                <Text className="text-red-500 text-xs text-center mt-2">
                  Please fix all errors to enable save
                </Text>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        visible={showImagePreview}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePreview(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          className={`flex-1 ${isDarkMode ? 'bg-black/90' : 'bg-black/80'} justify-center items-center`}
          onPress={() => setShowImagePreview(false)}
        >
          <Image
            source={{ uri: `${API_URL}${userData?.profilepath}??${profiledummy}` }}
            className="w-64 h-64 rounded-lg"
          />
          <TouchableOpacity
            className="mt-4 p-3 bg-primary-100 rounded-lg"
            onPress={() => setShowImagePreview(false)}
          >
            <Text className="text-white font-medium">Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Document Preview Modal */}
      <Modal
        visible={showDocumentPreview}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDocumentPreview(false)}
      >
        <View className="flex-1 bg-black/90">
          <View className="flex-1 pt-12">
            <View className="flex-row items-center justify-between px-4 mb-4">
              <View>
                <Text className="text-white text-lg font-bold">
                  {selectedDocument?.type}
                </Text>
                <Text className="text-white/70 text-sm">
                  {selectedDocument?.number}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDocumentPreview(false)}
                className="bg-white/20 p-2 rounded-full"
              >
                <Icon name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Document Preview Placeholder */}
            <View className="flex-1 items-center justify-center px-4">
              <Icon name="description" size={64} color="white" />
              <Text className="text-white mt-4">
                Document Preview
              </Text>
              <TouchableOpacity
                className="mt-6 bg-primary-100 px-6 py-3 rounded-xl"
                onPress={() => handleDownloadDocument(selectedDocument)}
              >
                <Text className="text-white font-medium">Download Document</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add the bottom sheet */}
      {showAlert && (
        <View className="absolute inset-0" style={{ elevation: 1000, zIndex: 1000 }}>
          {showOverlay && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              className="absolute inset-0 bg-black/30"
            >
              <TouchableOpacity
                className="flex-1"
                activeOpacity={1}
                onPress={() => {
                  hideSheet();
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
                <Icons name="alert-circle-outline" size={40} color="#1a9c94" />
                <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'
                  } mt-4`}>
                  Save Changes?
                </Text>
                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  } text-center mt-2 px-6`}>
                  Are you sure you want to save these changes?
                </Text>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    hideSheet();
                    setShowAlert(false);
                    setShowOverlay(false);
                  }}
                  className={`flex-1 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                    } p-4 rounded-2xl`}
                >
                  <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    } font-medium text-center`}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleupdatesvedchange}
                  className="flex-1 bg-teal-500 p-4 rounded-2xl"
                >
                  <Text className="text-white font-medium text-center">
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Editprofile;

// Update styles with dark mode
const styles = StyleSheet.create({
  modalContent: (isDarkMode) => ({
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: isDarkMode ? 0.45 : 0.25,
    shadowRadius: 4,
    elevation: 1000,
    zIndex: 1000,
    backgroundColor: isDarkMode ? '#1f2937' : 'white',
    minHeight: 250,
  }),
});