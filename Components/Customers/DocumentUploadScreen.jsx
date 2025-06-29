import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image, Alert, Platform, PermissionsAndroid } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import customFetch from '../../Utils/customFetch';

const FILE_TYPES = [
  { label: 'ID Document', value: 'ID_DOCUMENT' },
  { label: 'Profile Photo', value: 'PROFILE_PHOTO' },
  { label: 'Other Document', value: 'DOCUMENT' },
];
const CATEGORIES = [
  { label: 'Customer', value: 'CUSTOMER' },
  { label: 'Field Agent', value: 'FIELD_AGENT' },
];

const DocumentUploadScreen = ({ customer_id, navigation }) => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(FILE_TYPES[0].value);
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const theme = {
    background: isDarkMode ? 'bg-primary-950' : 'bg-primary-50',
    card: isDarkMode ? 'bg-primary-900 border border-primary-800' : 'bg-white border border-primary-200',
    text: isDarkMode ? 'text-primary-100' : 'text-primary-900',
    subtext: isDarkMode ? 'text-primary-300' : 'text-primary-700',
    button: isDarkMode ? 'bg-primary-700' : 'bg-primary-500',
    buttonText: 'text-white',
    border: isDarkMode ? 'border-primary-800' : 'border-primary-200',
    icon: isDarkMode ? '#38bdf8' : '#0e7490',
  };

  const requestAndroidPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      if (Platform.Version >= 33) {
        // Android 13+
        const readImages = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Media Permission',
            message: 'App needs access to your media to upload documents.',
            buttonPositive: 'OK',
          }
        );
        const readVideo = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
          {
            title: 'Media Permission',
            message: 'App needs access to your media to upload documents.',
            buttonPositive: 'OK',
          }
        );
        return (
          readImages === PermissionsAndroid.RESULTS.GRANTED ||
          readVideo === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        // Android 12 and below
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'App needs access to your storage to upload documents.',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      Alert.alert('Permission Error', 'Failed to request permission.');
      return false;
    }
  };

  const pickFile = async () => {
    const hasPermission = await requestAndroidPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage/media permission is required to pick a file.');
      return;
    }
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
      });
      setFile(res);
      setStatus('');
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        Alert.alert('Error', 'Failed to pick file.');
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setStatus('');
  };

  const uploadFile = async () => {
    if (!file) {
      setStatus('Please select a file.');
      return;
    }
    setUploading(true);
    setStatus('');
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.type,
        name: file.name,
      });
      formData.append('customer_id', customer_id);
      formData.append('file_type', fileType);
      formData.append('category', category);

      // Use XMLHttpRequest for progress (customFetch can be swapped if it supports progress)
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${process.env.BASE_URL || ''}/files/customers/upload`);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(event.loaded / event.total);
        }
      };
      xhr.onload = () => {
        setUploading(false);
        if (xhr.status === 200 || xhr.status === 201) {
          setStatus('Upload successful!');
          setFile(null);
        } else {
          setStatus('Upload failed.');
        }
      };
      xhr.onerror = () => {
        setUploading(false);
        setStatus('Upload failed.');
      };
      xhr.send(formData);
    } catch (err) {
      setUploading(false);
      setStatus('Upload failed.');
    }
  };

  return (
    <View className={`flex-1 ${theme.background} p-4`}>  
      <View className={`${theme.card} rounded-2xl p-6`}>  
        <Text className={`text-2xl font-bold mb-4 ${theme.text}`}>Upload Document</Text>
        <Text className={`mb-2 ${theme.subtext}`}>Select a file to upload for this customer.</Text>

        {/* File Picker */}
        <TouchableOpacity
          onPress={pickFile}
          className={`flex-row items-center p-4 rounded-xl border-2 ${theme.background} ${theme.border} mb-4`}
          disabled={uploading}
        >
          <Icon name="cloud-upload-outline" size={22} color={theme.icon} />
          <Text className={`ml-3 ${theme.text} text-base font-medium`}>
            {file ? file.name : 'Choose File'}
          </Text>
        </TouchableOpacity>
        {file && (
          <View className="flex-row items-center mb-4">
            {file.type && file.type.startsWith('image') ? (
              <Image source={{ uri: file.uri }} style={{ width: 48, height: 48, borderRadius: 8, marginRight: 12 }} />
            ) : (
              <Icon name="document-outline" size={40} color={theme.icon} style={{ marginRight: 12 }} />
            )}
            <View className="flex-1">
              <Text className={`${theme.text} font-semibold`}>{file.name}</Text>
              <Text className={`${theme.subtext} text-xs`}>{file.type}</Text>
            </View>
            <TouchableOpacity onPress={removeFile} disabled={uploading}>
              <Icon name="close-circle" size={24} color="#ef4444" />
            </TouchableOpacity>
          </View>
        )}

        {/* File Type Dropdown */}
        <Text className={`mb-1 mt-2 ${theme.subtext}`}>File Type</Text>
        <View className="flex-row mb-4">
          {FILE_TYPES.map((type) => (
            <TouchableOpacity
              key={type.value}
              onPress={() => setFileType(type.value)}
              className={`px-4 py-2 mr-2 rounded-lg border ${fileType === type.value ? theme.button : theme.background} ${fileType === type.value ? '' : theme.border}`}
              disabled={uploading}
            >
              <Text className={`${fileType === type.value ? theme.buttonText : theme.text} font-medium`}>{type.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category Dropdown */}
        <Text className={`mb-1 ${theme.subtext}`}>Category</Text>
        <View className="flex-row mb-4">
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              onPress={() => setCategory(cat.value)}
              className={`px-4 py-2 mr-2 rounded-lg border ${category === cat.value ? theme.button : theme.background} ${category === cat.value ? '' : theme.border}`}
              disabled={uploading}
            >
              <Text className={`${category === cat.value ? theme.buttonText : theme.text} font-medium`}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          onPress={uploadFile}
          className={`mt-2 py-3 rounded-xl items-center ${theme.button}`}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-white font-bold text-base">Upload</Text>
          )}
        </TouchableOpacity>

        {/* Progress Bar */}
        {uploading && (
          <View className="mt-4 w-full h-2 bg-primary-100 rounded-full overflow-hidden">
            <View style={{ width: `${Math.round(progress * 100)}%` }} className="h-2 bg-primary-500" />
          </View>
        )}

        {/* Status Message */}
        {status ? (
          <Text className={`mt-4 text-center ${status.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{status}</Text>
        ) : null}
      </View>
    </View>
  );
};

export default DocumentUploadScreen; 