import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Icons from 'react-native-vector-icons/FontAwesome5';
import { useDispatch, useSelector } from 'react-redux';
import Animated, {
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withTiming,
} from 'react-native-reanimated';
import DocumentCard from './DocumentCard';
import ImagePicker from 'react-native-image-crop-picker';
import { pick, types } from '@react-native-documents/picker'
import { viewDocument } from '@react-native-documents/viewer'
import { request, PERMISSIONS, RESULTS, check } from 'react-native-permissions';
import { customeruploadFiles, getCustomerFiles } from '../../../redux/Slices/fileSlice';
import { useToast } from '../../../Context/ToastContext';

// Document types configuration
const DOCUMENT_TYPES = {
  PROFILE_PHOTO: {
    id: 'profile_photo',
    label: 'Profile Photo',
    icon: 'image-outline',
    picker: 'image',
  },
  ID_DOCUMENT: {
    id: 'id_document',
    label: 'ID Document Front',
    icon: 'card-outline',
    picker: 'image',
  },
  DOCUMENT: {
    id: 'document',
    label: 'Document',
    icon: 'document-text-outline',
    picker: 'file',
  },
};

const DocumentsContent = ({ customer_id }) => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [showDocTypeDropdown, setShowDocTypeDropdown] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [Uploadedfiledata, setUploadedfiledata] = useState(null)
  const buttonWidth = useSharedValue('48%'); // Start at 48% width

  const { isCustomerfileloading, customerfileerror, customerfiles, uploadingErrors, uploadLoading } = useSelector(state => state.filedata)
  // Filter available document types that haven't been uploaded yet
  const availableDocumentTypes = Object.values(DOCUMENT_TYPES).filter(
    (docType) => !customerfiles?.some((doc) => doc?.file_type?.toLowerCase() === docType.id)
  );
  console.log('availableDocumentTypes:', availableDocumentTypes);
  console.log('customerfiles:', customerfiles);


  const saveButtonAnimatedStyle = useAnimatedStyle(() => ({
    width: buttonWidth.value,
  }));

  const useBottomSheetAnimation = () => {
    const translateY = useSharedValue(1000);

    const animatedStyles = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    const showSheet = () => {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 90,
        mass: 0.8,
      });
    };

    const hideSheet = (callback) => {
      translateY.value = withSpring(1000, {
        damping: 15,
        stiffness: 120,
        duration: 200,
      }, () => {
        if (callback) {
          runOnJS(callback)();
        }
      });
    };

    return { animatedStyles, showSheet, hideSheet };
  };

  const { animatedStyles, showSheet, hideSheet } = useBottomSheetAnimation();

  // Enhanced permission handling
  const requestStoragePermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        // For iOS, check photo library permission
        const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
        console.log('iOS Photo Library Permission:', result);
        return result === RESULTS.GRANTED;
      } else {
        // For Android, handle different versions
        if (Platform.Version >= 33) {
          // Android 13+ - Use granular permissions
          const readMediaImages = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
          const readMediaVideo = await request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
          console.log('Android 13+ Media Permissions:', { readMediaImages, readMediaVideo });
          return readMediaImages === RESULTS.GRANTED || readMediaVideo === RESULTS.GRANTED;
        } else {
          // Android 12 and below - Use legacy permission
          const result = await request(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
          console.log('Android Legacy Storage Permission:', result);
          return result === RESULTS.GRANTED;
        }
      }
    } catch (err) {
      console.error('Permission request error:', err);
      return false;
    }
  };

  // Alternative Android permission method using PermissionsAndroid
  const requestAndroidPermissions = async () => {
    try {
      if (Platform.OS !== 'android') return true;

      if (Platform.Version >= 33) {
        // Android 13+
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        ];

        const results = await PermissionsAndroid.requestMultiple(permissions);
        console.log('Android 13+ Permission Results:', results);

        return Object.values(results).some(result => result === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        // Android 12 and below
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to storage to upload documents.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        console.log('Android Legacy Permission Result:', granted);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error('Android permission error:', err);
      return false;
    }
  };

  // Check current permission status
  const checkPermissionStatus = async () => {
    try {
      if (Platform.OS === 'ios') {
        const status = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);
        console.log('iOS Permission Status:', status);
        return status;
      } else {
        if (Platform.Version >= 33) {
          const imageStatus = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
          console.log('Android 13+ Image Permission Status:', imageStatus);
          return imageStatus;
        } else {
          const status = await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE);
          console.log('Android Legacy Permission Status:', status);
          return status;
        }
      }
    } catch (err) {
      console.error('Permission check error:', err);
      return RESULTS.DENIED;
    }
  };

  const handleUploadPress = () => {
    if (availableDocumentTypes.length === 0) {
      Alert.alert('All documents uploaded', 'You have already uploaded all required documents.');
      return;
    }
    setShowUploadModal(true);
    setSelectedDocType(null);
    requestAnimationFrame(showSheet);
  };

  const handleCloseModal = () => {
    hideSheet(() => {
      setShowUploadModal(false);
      setShowDocTypeDropdown(false);
      setUploadedFile(null);
    });
  };

  const pickFile = async () => {
    try {
      console.log('Selected doc type:', selectedDocType);

      if (!selectedDocType) {
        Alert.alert('Error', 'Please select a document type first');
        return;
      }

      // Find the document type configuration
      const docTypeConfig = Object.values(DOCUMENT_TYPES).find(
        type => type.id === selectedDocType
      );

      console.log('Doc type config:', docTypeConfig);

      if (!docTypeConfig) {
        // Alert.alert('Error', 'Invalid document type selected');
        return;
      }

      if (docTypeConfig.picker === 'image') {
        // First check current permission status for images
        const currentStatus = await checkPermissionStatus();
        console.log('Current permission status:', currentStatus);

        let hasPermission = currentStatus === RESULTS.GRANTED;

        // If not granted, request permission
        if (!hasPermission) {
          hasPermission = await requestStoragePermission();

          if (!hasPermission && Platform.OS === 'android') {
            hasPermission = await requestAndroidPermissions();
          }
        }

        if (!hasPermission) {
          Alert.alert(
            'Permission Required',
            'Storage permission is required to access photos. Please enable it in your device settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'OK' }
            ]
          );
          return;
        }

        // For image picker
        const image = await ImagePicker.openPicker({
          width: 800,
          height: 800,
          cropping: true,
          cropperCircleOverlay: docTypeConfig.id === 'profile_photo',
          compressImageQuality: 0.8,
          mediaType: 'photo',
          includeBase64: false,
          includeExif: false,
        });

        console.log('Image picker result:', image);
        setUploadedfiledata(image);
        setUploadedFile({
          uri: image.path,
          name: image.filename || `image_${Date.now()}.jpg`,
          type: image.mime,
          isImage: true,
        });
      } else if (docTypeConfig.picker === 'file') {
        // For document picker, we usually don't need storage permission
        console.log('Opening document picker...');

        await pick({
          allowMultiSelection: false,
          type: [types.pdf, types.docx],
        })
          .then((res) => {
            const allFilesArePdfOrDocx = res.every((file) => file.hasRequestedType)
            console.log('All files are pdf or docx:', allFilesArePdfOrDocx);
            console.log('File picker result:', res);
            if (!res || res.length === 0) {
              console.log('No document selected');
              return;
            }

            const pickedFile = res[0];
            console.log('Picked file details:', pickedFile);

            setUploadedFile({
              uri: pickedFile.uri,
              name: pickedFile.name || `doc_${Date.now()}.pdf`,
              type: pickedFile.type || 'application/pdf',
              size: pickedFile.size,
              isImage: false,
            });

          })
          .catch((err) => {
            console.log('File picker error:', err);

          })

      }
    } catch (err) {
      // console.error('File picker error:', err);

      // Handle user cancellation
      if (err.code === 'DOCUMENT_PICKER_CANCELED' ||
        err.code === 'E_PICKER_CANCELLED' ||
        err.message === 'User cancelled image selection' ||
        err.message?.includes('cancelled') ||
        err.message?.includes('canceled')) {
        console.log('User cancelled file selection');
        return;
      }

      // Show error for actual failures
      // Alert.alert('Error', `Failed to pick file: ${err.message || 'Unknown error occurred'}`);
    }
  };

  const handlePreview = async (document) => {
    try {
      let fileUri = document.file.uri;
      await viewDocument({ uri: fileUri, fileName: document.file.name, fileType: document.file.type }).catch((err) => {
        // console.error('DocumentViewer error:', err);
      })
    } catch (error) {
      // console.error('DocumentViewer error:', error);
    }
  };

  const handleUploadDocument = () => {
    if (!selectedDocType || !uploadedFile) {
      return;
    }
    buttonWidth.value = withTiming('100%', { duration: 300 });
    const newDocument = {
      id: Date.now().toString(),
      name: DOCUMENT_TYPES[selectedDocType?.toUpperCase()]?.label,
      type: selectedDocType,
      status: 'Pending',
      file: uploadedFile,
      isImage: uploadedFile.isImage,
      uploadedAt: new Date().toISOString(),
    };
    console.log(Uploadedfiledata);

    const formdata = new FormData();
    if (Uploadedfiledata?.path) {
      formdata.append("file", {
        uri: Uploadedfiledata.path,
        type: Uploadedfiledata.mime,
        name: Uploadedfiledata.filename, // fallback name
      });
    } else {
      formdata.append("file", {
        uri: uploadedFile.uri,
        type: uploadedFile.type,
        name: uploadedFile.name, // fallback name
      });

    }
    formdata.append("customer_id", customer_id);
    formdata.append("file_type", selectedDocType?.toUpperCase());
    formdata.append("category", "CUSTOMER");
    dispatch(customeruploadFiles(formdata)).then((res) => {
      console.log(res, "res");
      handleCloseModal();
      if (res.payload.success) {
        showToast({
          message: 'Document uploaded successfully!',
          type: 'success',
          duration: 3000,
          position: 'top',
        });
        buttonWidth.value = withTiming('48%', { duration: 300 });
        dispatch(getCustomerFiles({ id: customer_id, file_type: '' }));

      }
      else {
        showToast({
          message: res.payload || "Failed to upload document",
          type: 'error',
          duration: 3000,
          position: 'top',
        });
        buttonWidth.value = withTiming('48%', { duration: 300 });
      }
    })

    setDocuments([...documents, newDocument]);
  };


  return (
    <View className={`px-5 pb-5 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <View className="flex-row gap-3 mb-6">
        {[
          { label: 'Verified', count: documents.filter((d) => d.status === 'Verified').length, color: 'green' },
          { label: 'Pending', count: documents.filter((d) => d.status === 'Pending').length, color: 'yellow' },
          { label: 'Rejected', count: documents.filter((d) => d.status === 'Rejected').length, color: 'red' },
        ].map((stat, index) => (
          <View key={index} className={`flex-1 bg-${stat.color}-50 p-4 rounded-2xl items-center`}>
            <Text className={`text-${stat.color}-600 text-lg font-bold`}>{stat.count}</Text>
            <Text className={`text-${stat.color}-600 text-sm`}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'} rounded-3xl p-6 mb-5`}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Documents</Text>
          {availableDocumentTypes.length > 0 && (
            <TouchableOpacity
              className="bg-primary-100 px-4 py-2 rounded-xl"
              onPress={handleUploadPress}
            >
              <Text className="text-white font-medium">Upload New</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="flex flex-col gap-4">
          {customerfiles?.length > 0 ? (
            customerfiles?.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                isDarkMode={isDarkMode}
              />
            ))
          ) : (
            <View className="items-center py-8">
              <Icon name="document-outline" size={40} color={isDarkMode ? '#4b5563' : '#9ca3af'} />
              <Text className={`mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No documents uploaded yet</Text>
            </View>
          )}
        </View>
      </View>

      <Modal
        visible={showPreview}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <View className="flex-1 bg-black/95">
          <SafeAreaView className="flex-1">
            <View className="flex-row justify-between items-center p-4">
              <View>
                <Text className="text-white text-lg font-bold">{selectedDocument?.name}</Text>
                <Text className="text-white/70">Document Preview</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPreview(false)}
                className="bg-white/20 p-2 rounded-full"
              >
                <Icon name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View className="flex-1 items-center justify-center p-4">
              <View className="w-full h-64 rounded-2xl overflow-hidden mb-4">
                <Image
                  source={{ uri: selectedDocument?.file?.uri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="contain"
                />
              </View>

              <View className="flex-row gap-4 mt-6 w-full">
                <TouchableOpacity
                  className="flex-1 bg-white/20 py-3 rounded-xl items-center"
                  onPress={() => {
                    Alert.alert('Download', 'Document downloaded successfully');
                  }}
                >
                  <Text className="text-white font-medium">Download</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-primary-100 py-3 rounded-xl items-center"
                  onPress={() => setShowPreview(false)}
                >
                  <Text className="text-white font-medium">Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal
        transparent={true}
        animationType="none"
        visible={showUploadModal}
        statusBarTranslucent={true}
        onRequestClose={handleCloseModal}
      >
        <StatusBar hidden={true} />
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        />
        <Animated.View
          style={[styles.modalContent(isDarkMode), animatedStyles]}
          className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          <View className="p-6">
            <View className="items-center mb-6">
              <View className={`w-12 h-1 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} rounded-full`} />
            </View>

            <View className="flex-row justify-between items-center mb-6">
              <Text className={`text-xl w-full font-bold text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Upload New Document
              </Text>
            </View>

            <View className="mb-6">
              <Text className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Document Type</Text>
              <TouchableOpacity
                onPress={() => availableDocumentTypes.length > 0 && setShowDocTypeDropdown(!showDocTypeDropdown)}
                className={`flex-row items-center justify-between p-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'} rounded-xl border ${availableDocumentTypes.length === 0 ? 'opacity-50' : ''}`}
                disabled={availableDocumentTypes.length === 0}
              >
                <View className="flex-row items-center">
                  {selectedDocType && DOCUMENT_TYPES[selectedDocType?.toUpperCase()] ? (
                    <>
                      <View className={`${isDarkMode ? 'bg-teal-900/30' : 'bg-primary-100/10'} p-2 rounded-lg`}>
                        <Icon
                          name={DOCUMENT_TYPES[selectedDocType?.toUpperCase()].icon}
                          size={20}
                          color={isDarkMode ? '#2dd4bf' : '#2ec4b6'}
                        />
                      </View>
                      <Text className={`ml-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                        {DOCUMENT_TYPES[selectedDocType?.toUpperCase()].label}
                      </Text>
                    </>
                  ) : (
                    <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      {availableDocumentTypes.length === 0 ? 'No document types available' : 'Select document type'}
                    </Text>
                  )}
                </View>
                {availableDocumentTypes.length > 0 && (
                  <Icon
                    name={showDocTypeDropdown ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={isDarkMode ? '#9ca3af' : '#6b7280'}
                  />
                )}
              </TouchableOpacity>

              {showDocTypeDropdown && availableDocumentTypes.length > 0 && (
                <View className={`absolute top-[90px] left-0 right-0 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'} rounded-xl border shadow-xl z-50`}>
                  <ScrollView showsVerticalScrollIndicator={false} bounces={false} className="max-h-64">
                    {availableDocumentTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        onPress={() => {
                          setSelectedDocType(type.id);
                          setShowDocTypeDropdown(false);
                          setUploadedFile(null);
                        }}
                        className={`${selectedDocType === type.id ? `${isDarkMode ? 'bg-teal-900/30' : 'bg-primary-100/10'}` : ''} flex-row items-center p-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-50'}`}
                      >
                        <View className={`${isDarkMode ? 'bg-teal-900/30' : 'bg-primary-100/10'} p-2 rounded-lg`}>
                          <Icon name={type.icon} size={20} color={isDarkMode ? '#2dd4bf' : '#2ec4b6'} />
                        </View>
                        <Text className={`ml-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{type.label}</Text>
                        {selectedDocType === type.id && (
                          <View className="ml-auto">
                            <Icon name="checkmark-circle" size={20} color={isDarkMode ? '#2dd4bf' : '#2ec4b6'} />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            <View className="mb-6">
              <Text className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Upload Document</Text>
              {uploadedFile ? (
                <View className={`border ${isDarkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'} rounded-xl p-4`}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      {uploadedFile.isImage ?
                        <Icon
                          name='image-outline'
                          size={24}
                          color={isDarkMode ? '#9ca3af' : '#6b7280'}
                        /> :
                        <Icons
                          name="file-pdf"
                          size={24}
                          color={isDarkMode ? '#dc2626' : '#f87171'}
                        />
                      }
                      <Text className={`ml-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`} numberOfLines={1}>
                        {uploadedFile.name}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setUploadedFile(null)}>
                      <Icon name="close" size={20} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
                    </TouchableOpacity>
                  </View>
                  {uploadedFile.isImage && (
                    <Image
                      source={{ uri: uploadedFile.uri }}
                      style={{ width: '100%', height: 150, marginTop: 10, borderRadius: 8 }}
                      resizeMode="contain"
                    />
                  )}
                  <TouchableOpacity
                    className="mt-4 py-2 rounded-lg bg-primary-100 items-center"
                    onPress={() => handlePreview({ file: uploadedFile, isImage: uploadedFile.isImage })}
                  >
                    <Text className="text-white font-medium">Preview</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  className={`border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} rounded-xl p-6 items-center`}
                  onPress={pickFile}
                  disabled={!selectedDocType}
                >
                  <View className={`${isDarkMode ? 'bg-teal-900/30' : 'bg-primary-100/10'} p-4 rounded-full mb-3`}>
                    <Icon name="cloud-upload-outline" size={32} color={isDarkMode ? '#2dd4bf' : '#2ec4b6'} />
                  </View>
                  <Text className={`font-medium mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    {selectedDocType ? 'Click to upload' : 'Select document type first'}
                  </Text>
                  <Text className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Support JPG, PNG or PDF files{'\n'}less than 10MB
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View className="flex-row gap-3 mt-6">
              {!uploadLoading && <TouchableOpacity
                onPress={handleCloseModal}
                className={`flex-1 py-3.5 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                <Text className={`font-medium text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cancel</Text>
              </TouchableOpacity>}
              <Animated.View style={[saveButtonAnimatedStyle, { alignSelf: 'stretch' }]}>
                <TouchableOpacity
                  onPress={handleUploadDocument}
                  disabled={uploadLoading || !uploadedFile}
                  className={`py-4 rounded-2xl flex-row items-center justify-center ${uploadedFile ? 'bg-teal-600' : isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                    }`}
                  style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}
                >
                  {uploadLoading ? (
                    <ActivityIndicator color={isDarkMode ? '#fff' : '#14b8a6'} />
                  ) : (
                    <>
                      <Icon
                        name="checkmark-outline"
                        size={20}
                        color={uploadedFile ? 'white' : isDarkMode ? '#6b7280' : '#9ca3af'}
                      />
                      <Text
                        className={`font-semibold ml-2 ${uploadedFile
                          ? 'text-white'
                          : isDarkMode
                            ? 'text-gray-400'
                            : 'text-gray-500'
                          }`}
                      >
                        Upload
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    elevation: 1000,
    height: '100%',
    zIndex: 9999,
  },
  modalContent: (isDarkMode) => ({
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: isDarkMode ? '#1f2937' : 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: isDarkMode ? 0.45 : 0.25,
    shadowRadius: 4,
    elevation: 1001,
    zIndex: 10000,
    minHeight: 500,
  }),
});

export default DocumentsContent;