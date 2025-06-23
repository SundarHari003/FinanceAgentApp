// components/CustomerDetails/DocumentsContent.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import Animated, {
  withSpring,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
} from 'react-native-reanimated';
import DocumentCard from './DocumentCard';

const borrower = {
  documents: [
    { name: 'Identity Proof', status: 'Verified', type: 'id-card-outline' },
    { name: 'Address Proof', status: 'Pending', type: 'home-outline' },
    { name: 'Income Statement', status: 'Rejected', reason: 'Unclear image', type: 'document-text-outline' },
    { name: 'Bank Statement', status: 'Reuploaded', type: 'wallet-outline' },
  ],
};

const DocumentsContent = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const [showDocTypeDropdown, setShowDocTypeDropdown] = useState(false);

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

  const documentTypes = [
    { id: 'id_proof', label: 'ID Proof', icon: 'card-outline' },
    { id: 'address_proof', label: 'Address Proof', icon: 'home-outline' },
    { id: 'income_proof', label: 'Income Proof', icon: 'cash-outline' },
    { id: 'bank_statement', label: 'Bank Statement', icon: 'document-text-outline' },
    { id: 'photo', label: 'Photo', icon: 'image-outline' },
    { id: 'signature', label: 'Signature', icon: 'create-outline' },
  ];

  const handleUploadPress = () => {
    setShowUploadModal(true);
    requestAnimationFrame(showSheet);
  };

  const handleCloseModal = () => {
    hideSheet(() => {
      setShowUploadModal(false);
      setSelectedDocType(null);
      setShowDocTypeDropdown(false);
    });
  };

  return (
    <View className={`px-5 pb-5 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Documents Stats */}
      <View className="flex-row gap-3 mb-6">
        {[
          { label: 'Verified', count: borrower.documents.filter(d => d.status === 'Verified').length, color: 'green' },
          { label: 'Pending', count: borrower.documents.filter(d => d.status === 'Pending').length, color: 'yellow' },
          { label: 'Rejected', count: borrower.documents.filter(d => d.status === 'Rejected').length, color: 'red' },
        ].map((stat, index) => (
          <View key={index} className={`flex-1 bg-${stat.color}-50 p-4 rounded-2xl items-center`}>
            <Text className={`text-${stat.color}-600 text-lg font-bold`}>{stat.count}</Text>
            <Text className={`text-${stat.color}-600 text-sm`}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Documents List */}
      <View className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-3xl p-6`}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className={`text-xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Documents</Text>
          <TouchableOpacity
            className="bg-primary-100 px-4 py-2 rounded-xl"
            onPress={handleUploadPress}
          >
            <Text className="text-white font-medium">Upload New</Text>
          </TouchableOpacity>
        </View>

        {/* Document Cards */}
        <View className="flex flex-col gap-4">
          {borrower.documents.map((doc, index) => (
            <DocumentCard
              key={index}
              document={doc}
              isDarkMode={isDarkMode}
              onPreview={() => {
                setSelectedDocument(doc);
                setShowPreview(true);
              }}
            />
          ))}
        </View>
      </View>

      {/* Document Preview Modal */}
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
              <View className="bg-white/10 p-8 rounded-3xl items-center">
                <Icon name="document-text-outline" size={64} color="white" />
                <Text className="text-white mt-4 text-center">Document Preview</Text>
              </View>

              <View className="flex-row gap-4 mt-6">
                <TouchableOpacity
                  className="flex-1 bg-white/20 py-3 rounded-xl items-center"
                  onPress={() => console.log('Download document')}
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

      {/* Bottom Sheet Modal */}
      <Modal
        transparent={true}
        animationType="none"
        visible={showUploadModal}
        onRequestClose={handleCloseModal}
      >
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
              <Text className={`text-xl w-full font-bold text-center ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Upload New Document</Text>
            </View>

            {/* Document Type Dropdown */}
            <View className="mb-6">
              <Text className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Document Type</Text>
              <TouchableOpacity
                onPress={() => setShowDocTypeDropdown(!showDocTypeDropdown)}
                className={`flex-row items-center justify-between p-4 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'} rounded-xl border`}
              >
                {selectedDocType ? (
                  <View className="flex-row items-center">
                    <View className={`${isDarkMode ? 'bg-teal-900/30' : 'bg-primary-100/10'} p-2 rounded-lg`}>
                      <Icon
                        name={documentTypes.find(t => t.id === selectedDocType)?.icon}
                        size={20}
                        color={isDarkMode ? '#2dd4bf' : '#2ec4b6'}
                      />
                    </View>
                    <Text className={`ml-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                      {documentTypes.find(t => t.id === selectedDocType)?.label || 'Select document type'}
                    </Text>
                  </View>
                ) : (
                  <Text className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Select document type</Text>
                )}
                <Icon
                  name={showDocTypeDropdown ? "chevron-up" : "chevron-down"}
                  size={20}
                  color={isDarkMode ? '#9ca3af' : '#6b7280'}
                />
              </TouchableOpacity>

              {showDocTypeDropdown && (
                <View className={`absolute top-[90px] left-0 right-0 ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'} rounded-xl border shadow-xl z-50`}>
                  <ScrollView showsVerticalScrollIndicator={false} bounces={false} className="max-h-64">
                    {documentTypes.map((type) => (
                      <TouchableOpacity
                        key={type.id}
                        onPress={() => {
                          setSelectedDocType(type.id);
                          setShowDocTypeDropdown(false);
                        }}
                        className={`flex-row items-center p-4 border-b ${isDarkMode ? 'border-gray-600' : 'border-gray-50'}`}
                      >
                        <View className={`${isDarkMode ? 'bg-teal-900/30' : 'bg-primary-100/10'} p-2 rounded-lg`}>
                          <Icon name={type.icon} size={20} color={isDarkMode ? '#2dd4bf' : '#2ec4b6'} />
                        </View>
                        <Text className={`ml-3 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>{type.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Upload Section */}
            <View className="mb-6">
              <Text className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Upload Document</Text>
              <TouchableOpacity
                className={`border-2 border-dashed ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} rounded-xl p-6 items-center`}
                onPress={() => console.log('Pick document')}
              >
                <View className={`${isDarkMode ? 'bg-teal-900/30' : 'bg-primary-100/10'} p-4 rounded-full mb-3`}>
                  <Icon name="cloud-upload-outline" size={32} color={isDarkMode ? '#2dd4bf' : '#2ec4b6'} />
                </View>
                <Text className={`font-medium mb-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>Click to upload</Text>
                <Text className={`text-sm text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Support JPG, PNG or PDF files{'\n'}less than 10MB
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                onPress={handleCloseModal}
                className={`flex-1 py-3.5 rounded-xl ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
              >
                <Text className={`font-medium text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleCloseModal();
                  console.log('Upload document', selectedDocType);
                }}
                className="flex-1 py-3.5 rounded-xl bg-primary-100"
              >
                <Text className="text-white font-medium text-center">Upload</Text>
              </TouchableOpacity>
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