import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, Image, ScrollView, StyleSheet, Animated, Easing, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useHideTabBar } from '../../hooks/useHideTabBar';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../Context/ToastContext';
import API_URL from '../../redux/BaseUrl/baseurl';
import profiledummy from '../../assests/agent-avatar.png';
import { getAgentuserData, updateAgentuserData } from '../../redux/AuthSlice/authslice';
import ImagePicker from 'react-native-image-crop-picker';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
const Editprofile = () => {
  const navigation = useNavigation();
  const { user, isLoading } = useSelector((state) => state.auth);
  useHideTabBar(['EditProfile']);
  const { showToast } = useToast();
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const userData = user?.data;
  const dispatch = useDispatch();

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(300))[0];

  // Form state
  const [formData, setFormData] = useState({
    fullName: userData?.full_name || '',
    email: userData?.email || '',
    phone: userData?.phone_number || '',
    address: userData?.address || '',
    state: userData?.region || '',
    district: userData?.territory || '',
    gender: userData?.gender || ''
  });

  const [errors, setErrors] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [showConfirmation, setShowConfirmation] = useState(false);


  const buttonWidth = useSharedValue('48%');

  // Animated style for Save Changes button
  const saveButtonAnimatedStyle = useAnimatedStyle(() => ({
    width: buttonWidth.value,
  }));

  // Animation effects
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const animateSectionChange = () => {
    slideAnim.setValue(300);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };

  // Validation functions
  const validateField = (field, value) => {
    let error = '';

    switch (field) {
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone number is required';
        else if (!/^[0-9]{10}$/.test(value.replace(/\s+/g, ''))) error = 'Invalid phone number';
        break;
      case 'fullName':
      case 'address':
      case 'state':
      case 'district':
        if (!value.trim()) error = 'This field is required';
        break;
      case 'gender':
        if (!value) error = 'Please select a gender';
        break;
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const validateForm = () => {
    let isValid = true;
    Object.keys(formData).forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });
    return isValid;
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) validateField(field, value);
  };

  const handleSave = () => {
    if (validateForm()) {
      buttonWidth.value = withTiming('100%', { duration: 300 });
      setShowConfirmation(true);
    }
  };

  const confirmSave = () => {
    const payload = {
      "full_name": formData.fullName,
      "email": formData.email,
      "phone_number": formData.phone,
      "manager_id": userData?.manager_id,
      "territory": formData.district,
      "region": formData.state,
      "is_active": true
    };

    dispatch(updateAgentuserData({ id: userData?.id, payloads: payload })).then((response) => {
      if (response?.payload?.success && response?.payload?.status_code == 200) {
        dispatch(getAgentuserData(userData?.id));
        buttonWidth.value = withTiming('48%', { duration: 300 });
        showToast({
          message: 'Profile updated successfully!',
          type: 'success',
          duration: 3000,
          position: 'top'
        });
        setIsEditMode(false);
      } else {
        showToast({
          message: response?.payload?.message || "Failed to update profile",
          type: 'error',
          duration: 3000,
          position: 'top'
        });
      }
    });
    setShowConfirmation(false);
  };

  const resetForm = () => {
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
    setIsEditMode(false);
  };

  const hasChanges = () => {
    return Object.keys(formData).some(key =>
      formData[key] !== (userData?.[key] || '')
    );
  };

  // UI Components
  const ProfileHeader = () => (
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
            <Text className="text-white text-2xl font-bold">My Profile</Text>
            <Text className="text-teal-100 text-base mt-1">@{userData?.username}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setIsEditMode(!isEditMode)}
          className="bg-white/20 p-2 rounded-xl"
        >
          <Icon name={isEditMode ? "close" : "edit"} size={22} color="white" />
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
  );

  const ProfileImage = () => {
    const [selectedImage, setSelectedImage] = useState(null);

    const pickImage = async () => {
      try {
        const image = await ImagePicker.openPicker({
          width: 300,
          height: 300,
          cropping: true,
          compressImageQuality: 0.8,
          mediaType: 'photo',
        });
        setSelectedImage({ uri: image.path });
      } catch (error) {
        if (error.code !== 'E_PICKER_CANCELLED') {
          Alert.alert('Error', 'Failed to pick image.');
          console.error(error);
        }
      }
    };
    return (
      <View className={`${isDarkMode ? 'bg-gray-800/90' : 'bg-gray-200'} p-6 rounded-2xl shadow-sm my-6 items-center`}>
        <TouchableOpacity>
          <Image
            source={selectedImage ? selectedImage : profiledummy}
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
          />
        </TouchableOpacity>

        {isEditMode && (
          <TouchableOpacity
            onPress={pickImage}
            className="flex-row items-center bg-primary-100/10 px-4 py-2 rounded-full mt-3"
          >
            <Icon name="photo-camera" size={18} color="#2ec4b6" />
            <Text className="text-primary-100 font-medium ml-2">Change Photo</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const SectionSelector = () => (
    <View className={`flex-row justify-between mb-6 p-1 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
      {['personal', 'professional', 'documents'].map((section) => (
        <TouchableOpacity
          key={section}
          onPress={() => {
            setActiveSection(section);
            animateSectionChange();
          }}
          className={`flex-1 py-2 px-1 rounded-lg ${activeSection === section ? (isDarkMode ? 'bg-gray-700' : 'bg-white') : ''}`}
        >
          <Text className={`text-center font-medium ${activeSection === section ? (isDarkMode ? 'text-white' : 'text-gray-800') : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`}>
            {section.charAt(0).toUpperCase() + section.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const InputField = ({ label, value, onChange, icon, type = 'text', error, required = false }) => {
    const inputProps = {
      value,
      onChangeText: onChange,
      placeholderTextColor: isDarkMode ? '#6b7280' : '#9ca3af',
      className: `flex-1 py-3 px-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`,
    };

    return (
      <View className="mb-5">
        <View className="flex-row items-center mb-1">
          <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
            {label}
          </Text>
          {required && <Text className="text-red-500 ml-1">*</Text>}
        </View>

        <View className={`flex-row items-center rounded-xl border ${error ? 'border-red-400' : (isDarkMode ? 'border-gray-600' : 'border-gray-200')} ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          {icon && (
            <View className="pl-4">
              <Icon name={icon} size={20} color={error ? '#ef4444' : '#2ec4b6'} />
            </View>
          )}

          {type === 'textarea' ? (
            <TextInput
              {...inputProps}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className={`${inputProps.className} h-20`}
            />
          ) : (
            <TextInput
              {...inputProps}
              keyboardType={type === 'email' ? 'email-address' : type === 'phone' ? 'phone-pad' : 'default'}
            />
          )}
        </View>

        {error && (
          <Text className="text-red-500 text-xs mt-1">{error}</Text>
        )}
      </View>
    );
  };

  const GenderSelector = ({ value, onChange, error }) => {
    const [showPicker, setShowPicker] = useState(false);
    const genderOptions = [
      { label: 'Male', value: 'MALE' },
      { label: 'Female', value: 'FEMALE' },
      { label: 'Other', value: 'other' },
      { label: 'Prefer not to say', value: 'prefer_not_to_say' }
    ];

    const selectedLabel = genderOptions.find(opt => opt.value === value)?.label || 'Select Gender';

    return (
      <View className="mb-5">
        <View className="flex-row items-center mb-1">
          <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
            Gender
          </Text>
          <Text className="text-red-500 ml-1">*</Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowPicker(true)}
          className={`flex-row items-center rounded-xl border ${error ? 'border-red-400' : (isDarkMode ? 'border-gray-600' : 'border-gray-200')} ${isDarkMode ? 'bg-gray-800' : 'bg-white'} py-3 px-4`}
        >
          <Icon name="person" size={20} color={error ? '#ef4444' : '#2ec4b6'} />
          <Text className={`flex-1 ml-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {selectedLabel}
          </Text>
          <Icon name="arrow-drop-down" size={24} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
        </TouchableOpacity>

        {error && (
          <Text className="text-red-500 text-xs mt-1">{error}</Text>
        )}

        <Modal
          visible={showPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPicker(false)}
        >
          <TouchableOpacity
            className="flex-1 bg-black/50 justify-center items-center"
            activeOpacity={1}
            onPress={() => setShowPicker(false)}
          >
            <View className={`w-4/5 rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <Text className={`text-lg font-bold p-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Select Gender
              </Text>

              {genderOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setShowPicker(false);
                  }}
                  className={`p-4 ${value === option.value ? (isDarkMode ? 'bg-teal-900/50' : 'bg-teal-100') : ''}`}
                >
                  <Text className={`${value === option.value ? 'text-teal-500 font-bold' : (isDarkMode ? 'text-gray-300' : 'text-gray-700')}`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  const PersonalInfoSection = () => (
    <Animated.View
      // style={{ transform: [{ translateX: slideAnim }] }}
      className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
    >
      <Text className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Personal Information
      </Text>

      {isEditMode ? (
        <>
          <InputField
            label="Full Name"
            value={formData.fullName}
            onChange={(text) => handleFieldChange('fullName', text)}
            icon="person-outline"
            error={errors.fullName}
            required
          />

          <InputField
            label="Email"
            value={formData.email}
            onChange={(text) => handleFieldChange('email', text)}
            icon="email"
            type="email"
            error={errors.email}
            required
          />

          <InputField
            label="Phone Number"
            value={formData.phone}
            onChange={(text) => handleFieldChange('phone', text)}
            icon="phone"
            type="phone"
            error={errors.phone}
            required
          />

          <InputField
            label="Address"
            value={formData.address}
            onChange={(text) => handleFieldChange('address', text)}
            icon="home"
            type="textarea"
            error={errors.address}
            required
          />

          <InputField
            label="State"
            value={formData.state}
            onChange={(text) => handleFieldChange('state', text)}
            icon="location-on"
            error={errors.state}
            required
          />

          <InputField
            label="District"
            value={formData.district}
            onChange={(text) => handleFieldChange('district', text)}
            icon="location-on"
            error={errors.district}
            required
          />

          <GenderSelector
            value={formData.gender}
            onChange={(value) => handleFieldChange('gender', value)}
            error={errors.gender}
          />
        </>
      ) : (
        <>
          <View className="mb-5">
            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>Full Name</Text>
            <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-base`}>{formData.fullName}</Text>
          </View>

          <View className="mb-5">
            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>Email</Text>
            <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-base`}>{formData.email}</Text>
          </View>

          <View className="mb-5">
            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>Phone Number</Text>
            <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-base`}>{formData.phone}</Text>
          </View>

          <View className="mb-5">
            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>Address</Text>
            <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-base`}>{formData.address}</Text>
          </View>

          <View className="mb-5">
            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>State</Text>
            <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-base`}>{formData.state}</Text>
          </View>

          <View className="mb-5">
            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>District</Text>
            <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-base`}>{formData.district}</Text>
          </View>

          <View className="mb-5">
            <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>Gender</Text>
            <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-base`}>
              {formData.gender ? formData.gender.charAt(0).toUpperCase() + formData.gender.slice(1).toLowerCase() : 'Not specified'}
            </Text>
          </View>
        </>
      )}
    </Animated.View>
  );

  const ProfessionalInfoSection = () => (
    <Animated.View
      // style={{ transform: [{ translateX: slideAnim }] }}
      className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
    >
      <Text className={`text-lg font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
        Professional Information
      </Text>

      <View className="mb-5">
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>Username</Text>
        <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-base`}>{userData?.username}</Text>
      </View>

      <View className="mb-5">
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>Role</Text>
        <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-base`}>{userData?.role}</Text>
      </View>

      <View className="mb-5">
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>Department</Text>
        <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-base`}>
          {userData?.department || "Field operations"}
        </Text>
      </View>

      <View className="mb-5">
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>Branch</Text>
        <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-base`}>
          {userData?.branch || "Anna angar"}
        </Text>
      </View>

      <View className="mb-5">
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>Join Date</Text>
        <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-base`}>
          {userData?.joinDate || "15 Jan 2023"}
        </Text>
      </View>

      <View className="mb-5">
        <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mb-1`}>Assigned Manager</Text>
        <Text className={`${isDarkMode ? 'text-white' : 'text-gray-800'} text-base`}>
          {userData?.manager?.full_name || "Not assigned"}
        </Text>
      </View>
    </Animated.View>
  );

  const DocumentsSection = () => {
    const documents = [
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
      }
    ];

    return (
      <Animated.View
        // style={{ transform: [{ translateX: slideAnim }] }}
        className={`p-6 rounded-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <View className="flex-row justify-between items-center mb-6">
          <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Documents
          </Text>
          {isEditMode && (
            <TouchableOpacity className="flex-row items-center bg-primary-100/10 px-3 py-1.5 rounded-lg">
              <Icon name="add" size={18} color="#2ec4b6" />
              <Text className="text-primary-100 text-sm font-medium ml-1">Upload New</Text>
            </TouchableOpacity>
          )}
        </View>

        {documents.map(doc => (
          <View key={doc.id} className={`mb-4 p-4 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <View className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <Icon name={doc.icon} size={20} color="#2ec4b6" />
                </View>
                <View className="ml-3">
                  <Text className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {doc.type}
                  </Text>
                  <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {doc.number}
                  </Text>
                </View>
              </View>
              <View className={`px-2 py-1 rounded-full ${doc.status === 'verified' ?
                (isDarkMode ? 'bg-green-900/30' : 'bg-green-100') :
                (isDarkMode ? 'bg-yellow-900/30' : 'bg-yellow-100')}`}>
                <Text className={`text-xs ${doc.status === 'verified' ?
                  (isDarkMode ? 'text-green-400' : 'text-green-700') :
                  (isDarkMode ? 'text-yellow-400' : 'text-yellow-700')}`}>
                  {doc.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View className={`flex-row justify-between items-center pt-3 mt-2 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
              <Text className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Uploaded: {doc.uploadDate}
              </Text>
              <View className="flex-row">
                <TouchableOpacity className={`px-3 py-1 rounded-lg mr-2 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'}`}>
                  <Text className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity className={`px-3 py-1 rounded-lg ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-100'}`}>
                  <Text className={`text-sm ${isDarkMode ? 'text-teal-400' : 'text-teal-700'}`}>Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </Animated.View>
    );
  };

  const ConfirmationModal = () => (
    <Modal
      visible={showConfirmation}
      transparent
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={() => setShowConfirmation(false)}
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className={`w-4/5 rounded-2xl p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <View className="items-center mb-6">
            <Icons name="checkmark-circle" size={48} color="#2ec4b6" />
            <Text className={`text-xl font-bold mt-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              Confirm Changes
            </Text>
            <Text className={`text-center mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to save these changes to your profile?
            </Text>
          </View>

          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => setShowConfirmation(false)}
              className={`flex-1 py-3 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
            >
              <Text className={`text-center font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={confirmSave}
              className="flex-1 bg-teal-600 py-3 rounded-xl"
            >
              <Text className="text-white text-center font-medium">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <Animated.View style={{ opacity: fadeAnim }} className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <ProfileHeader />

      <ScrollView className="flex-1 px-4 mb-4" showsVerticalScrollIndicator={false}>
        <ProfileImage />
        <SectionSelector />

        {activeSection === 'personal' && <PersonalInfoSection />}
        {activeSection === 'professional' && <ProfessionalInfoSection />}
        {activeSection === 'documents' && <DocumentsSection />}

        {isEditMode && (
          <View className="flex-row justify-center gap-4 my-6">
            {!isLoading && (<TouchableOpacity
              onPress={resetForm}
              className={`flex-1 py-3 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-300'}`}
            >
              <Text className={`text-center font-medium ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                Discard
              </Text>
            </TouchableOpacity>)}

            <Animated.View style={[saveButtonAnimatedStyle, { alignSelf: 'stretch' }]}
              className={` flex-1`}
            >
              <TouchableOpacity
                onPress={handleSave}
                disabled={!hasChanges()}
                className={`flex-1 py-3 rounded-xl ${hasChanges() ? 'bg-teal-600' : 'bg-gray-400'}`}
              >
                {
                  isLoading ?
                    (<ActivityIndicator color={isDarkMode ? '#fff' : '#14b8a6'} />) :
                    (
                      <Text className="text-white text-center font-medium">
                        Save Changes
                      </Text>
                    )
                }
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </ScrollView>

      <ConfirmationModal />
    </Animated.View>
  );
};

export default Editprofile;