// components/CustomerDetails/DocumentCard.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import CustomAlert from '../../Common/CustomAlert';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '../../../Context/ToastContext';
import {
  getsinglefileDownlaod,
  clearSingleFileData,
  deleteCustomerFile,
  getCustomerFiles
} from '../../../redux/Slices/fileSlice';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DocumentCard = ({ document, isDarkMode }) => {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isdeleting, setIsDeleting] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const [selectedDocType, setSelectedDocType] = useState(null);
  const {
    getsinglefile,
    getsinglefileDownlaoderror,
    getsinglefileDownlaodloading,
  } = useSelector(state => state.filedata);

  const { showToast } = useToast();
  const dispatch = useDispatch();



  // Helper function to get document type icon
  const getDocumentIcon = (fileType) => {
    switch (fileType) {
      case 'PROFILE_PHOTO':
        return 'person-outline';
      case 'ID_DOCUMENT':
        return 'card-outline';
      case 'DOCUMENT':
        return 'document-text-outline';
      default:
        return 'document-outline';
    }
  };

  // Helper function to get document display name
  const getDocumentDisplayName = (fileType, originalName) => {
    switch (fileType) {
      case 'PROFILE_PHOTO':
        return 'Profile Photo';
      case 'ID_DOCUMENT':
        return 'ID Document';
      case 'DOCUMENT':
        return 'Document';
      default:
        return originalName || 'Unknown Document';
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check if file is an image
  const isImageFile = (fileName) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext =>
      fileName?.toLowerCase().includes(ext) ||
      document.file_type === 'PROFILE_PHOTO'
    );
  };

  // Check if file is a PDF
  const isPdfFile = (fileName) => {
    return fileName?.toLowerCase().includes('.pdf') ||
      document.content_type?.includes('pdf');
  };

  // Handle file preview
  const handleFilePreview = async (isRetry = false) => {
    if (isRetry) {
      setIsRetrying(true);
    }

    setSelectedDocType(document?.id);
    setIsDeleting(false);
    setPreviewError(false);

    try {
      const response = await dispatch(getsinglefileDownlaod(document.id));

      if (response?.payload?.success && response?.payload?.data) {
        if (!showPreviewModal) {
          setShowPreviewModal(true);
        }
      } else {
        setPreviewError(true);
        if (!showPreviewModal) {
          showToast({
            message: response?.payload?.message || `Can't Preview File`,
            type: 'error',
            duration: 3000,
            position: 'top'
          });
        }
      }
    } catch (error) {
      console.error('Preview error:', error);
      setPreviewError(true);
      if (!showPreviewModal) {
        showToast({
          message: 'Failed to load file preview',
          type: 'error',
          duration: 3000,
          position: 'top'
        });
      }
    } finally {
      if (isRetry) {
        setIsRetrying(false);
      }
    }
  };

  // Handle retry from preview modal
  const handleRetryPreview = () => {
    handleFilePreview(true);
  };

  // Handle file download
  const handleFileDownload = async () => {
    try {
      const response = await dispatch(getsinglefileDownlaod(document.id));

      if (response?.payload?.success) {
        // Here you would typically save the file to device storage
        // For now, just show success message
        showToast({
          message: 'File Downloaded successfully',
          type: 'success',
          duration: 3000,
          position: 'top'
        });
      } else {
        showToast({
          message: response?.payload?.message || `Can't Download File`,
          type: 'error',
          duration: 3000,
          position: 'top'
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      showToast({
        message: 'Failed to download file',
        type: 'error',
        duration: 3000,
        position: 'top'
      });
    }
  };

  // Handle delete confirmation
  const handleDelete = () => {
    setShowDeleteAlert(true);
  };

  const cancelDelete = () => {
    setShowDeleteAlert(false);
  };

  // Handle file deletion
  const handleFileDeleted = async () => {
    setShowDeleteAlert(false);
    setIsDeleting(true);
    setSelectedDocType(document?.id);
    try {
      // Assuming you have a deleteFile action
      const response = await dispatch(deleteCustomerFile(document.id));

      if (response?.payload?.success) {
        showToast({
          message: 'File deleted successfully',
          type: 'success',
          duration: 3000,
          position: 'top'
        });
        setIsDeleting(false);
        dispatch(getCustomerFiles({ id: document.entity_id, file_type: '' }));
      } else {
        showToast({
          message: response?.payload?.message || `Can't delete file`,
          type: 'error',
          duration: 3000,
          position: 'top'
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      showToast({
        message: 'Failed to delete file',
        type: 'error',
        duration: 3000,
        position: 'top'
      });
    }
  };

  // Close preview modal
  const closePreviewModal = () => {
    setShowPreviewModal(false);
    setPreviewError(false);
    setIsRetrying(false);
    setWebViewLoading(true);
    dispatch(clearSingleFileData());
  };

  // Generate PDF HTML for WebView
  const generatePdfHtml = (fileUrl) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
          <title>PDF Viewer</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              background-color: ${isDarkMode ? '#1f2937' : '#f9fafb'};
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .pdf-container {
              width: 100%;
              height: 100vh;
              overflow: auto;
            }
            iframe {
              width: 100%;
              height: 100%;
              border: none;
            }
            .error-container {
              text-align: center;
              padding: 20px;
              color: ${isDarkMode ? '#e5e7eb' : '#374151'};
            }
            .loading {
              text-align: center;
              padding: 50px 20px;
              color: ${isDarkMode ? '#9ca3af' : '#6b7280'};
            }
          </style>
        </head>
        <body>
          <div class="pdf-container">
            <iframe 
              src="${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=FitH" 
              type="application/pdf"
              onload="this.style.opacity='1';"
              onerror="document.querySelector('.pdf-container').innerHTML='<div class=\\"error-container\\"><h3>Cannot display PDF</h3><p>Unable to load the PDF file. Please try downloading it instead.</p></div>';">
              <div class="error-container">
                <h3>PDF Viewer Not Supported</h3>
                <p>Your browser doesn't support embedded PDFs. Please download the file to view it.</p>
              </div>
            </iframe>
          </div>
        </body>
      </html>
    `;
  };

  // Render preview content
  const renderPreviewContent = () => {
    // Show loading state when initially loading or retrying
    if (getsinglefileDownlaodloading || isRetrying) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={isDarkMode ? '#60a5fa' : '#2563eb'} />
          <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-4 text-lg`}>
            {isRetrying ? 'Retrying...' : 'Loading preview...'}
          </Text>
        </View>
      );
    }

    // Show error state with retry button
    if (previewError || !getsinglefile?.data) {
      return (
        <View className="flex-1 justify-center items-center p-6">
          <Icon name="alert-circle-outline" size={64} color={isDarkMode ? '#f87171' : '#dc2626'} />
          <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'} text-lg font-semibold mt-4 text-center`}>
            Cannot preview this file
          </Text>
          <Text className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'} text-sm mt-2 text-center`}>
            {getsinglefileDownlaoderror ?
              'Failed to load the file. Please check your connection and try again.' :
              'The file format may not be supported for preview'
            }
          </Text>

          <View className="flex-row gap-3 mt-6">
            <TouchableOpacity
              className={`px-6 py-3 rounded-xl ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}
              onPress={handleRetryPreview}
              disabled={isRetrying}
            >
              <View className="flex-row items-center">
                {isRetrying ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Icon name="refresh-outline" size={18} color="white" />
                )}
                <Text className="text-white font-medium ml-2">
                  {isRetrying ? 'Retrying...' : 'Try Again'}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className={`px-6 py-3 rounded-xl ${isDarkMode ? 'bg-gray-600' : 'bg-gray-500'}`}
              onPress={handleFileDownload}
            >
              <View className="flex-row items-center">
                <Icon name="download-outline" size={18} color="white" />
                <Text className="text-white font-medium ml-2">Download</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    const fileUrl = getsinglefile.data.file_url || getsinglefile.data.url;
    const fileName = document.original_name || document.file_name || '';

    // Image preview
    if (isImageFile(fileName)) {
      return (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          maximumZoomScale={3}
          minimumZoomScale={1}
        >
          <Image
            source={{ uri: fileUrl }}
            style={{
              width: screenWidth - 32,
              height: screenHeight - 200,
              borderRadius: 12
            }}
            resizeMode="contain"
            onError={() => setPreviewError(true)}
          />
        </ScrollView>
      );
    }

    // PDF preview using WebView
    if (isPdfFile(fileName)) {
      return (
        <View style={{ flex: 1, position: 'relative' }}>
          {webViewLoading && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb',
                zIndex: 1
              }}
            >
              <ActivityIndicator size="large" color={isDarkMode ? '#60a5fa' : '#2563eb'} />
              <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-4 text-base`}>
                Loading PDF...
              </Text>
            </View>
          )}

          <WebView
            source={{ html: generatePdfHtml(fileUrl) }}
            style={{ flex: 1 }}
            onLoadStart={() => setWebViewLoading(true)}
            onLoadEnd={() => setWebViewLoading(false)}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
              setPreviewError(true);
              setWebViewLoading(false);
            }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            scalesPageToFit={true}
            mixedContentMode="compatibility"
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
          />
        </View>
      );
    }

    // Unsupported file type
    return (
      <View className="flex-1 justify-center items-center p-6">
        <Icon name="document-outline" size={64} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
        <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-800'} text-lg font-semibold mt-4 text-center`}>
          Preview not available
        </Text>
        <Text className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'} text-sm mt-2 text-center`}>
          This file type cannot be previewed. You can download it to view.
        </Text>
        <TouchableOpacity
          className={`mt-6 px-6 py-3 rounded-xl ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'}`}
          onPress={handleFileDownload}
        >
          <Text className="text-white font-medium">Download File</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const documentName = getDocumentDisplayName(document.file_type, document.original_name);
  const documentIcon = getDocumentIcon(document.file_type);
  const uploadDate = new Date(document.created_at).toLocaleDateString();
  const fileSize = formatFileSize(document.file_size);
  const uploaderName = document.uploaded_by_user?.full_name || 'Unknown';

  return (
    <>
      <View className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-100'} rounded-2xl shadow-sm border`}>
        <View className="p-4">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center flex-1">
              <View className={`p-3 rounded-xl ${isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                <Icon
                  name={documentIcon}
                  size={24}
                  color={isDarkMode ? '#60a5fa' : '#2563eb'}
                />
              </View>
              <View className="ml-3 flex-1">
                <Text className={`${isDarkMode ? 'text-gray-100' : 'text-gray-800'} font-semibold text-base`}>
                  {documentName}
                </Text>
                <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm mt-0.5`}>
                  {fileSize} • Uploaded: {uploadDate}
                </Text>
                <Text className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} text-xs mt-0.5`}>
                  By: {uploaderName}
                </Text>
              </View>
            </View>

            <View className={`px-3 py-1 rounded-full ${isDarkMode ? 'bg-green-900/30' : 'bg-green-100'}`}>
              <Text className={`text-xs font-medium ${isDarkMode ? 'text-green-400' : 'text-green-700'}`}>
                UPLOADED
              </Text>
            </View>
          </View>

          {/* Document Type Badge */}
          <View className="mb-3">
            <View className={`inline-flex px-2 py-1 rounded-md ${isDarkMode ? 'bg-gray-600' : 'bg-gray-100'}`}>
              <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-xs font-medium`}>
                {/* {document.file_type.replace('_', ' ')} */}
                {document.original_name}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className={`flex-row gap-2 mt-3 pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-100'}`}>
            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${getsinglefileDownlaodloading && document?.id === selectedDocType
                ? (isDarkMode ? 'bg-gray-800' : 'bg-gray-200')
                : (isDarkMode ? 'bg-gray-600' : 'bg-gray-50')
                }`}
              onPress={() => handleFilePreview(false)}
              disabled={getsinglefileDownlaodloading}
            >
              {getsinglefileDownlaodloading && document?.id === selectedDocType && !isdeleting ? (
                <ActivityIndicator size="small" color={isDarkMode ? '#9ca3af' : '#6b7280'} />
              ) : (
                <Icon name="eye-outline" size={18} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
              )}
              <Text className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} font-medium ml-2 text-sm`}>
                Preview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${isDarkMode ? 'bg-teal-900/30' : 'bg-teal-50'}`}
              onPress={handleFileDownload}
              disabled={getsinglefileDownlaodloading}
            >
              <Icon name="download-outline" size={18} color={isDarkMode ? '#2dd4bf' : '#0d9488'} />
              <Text className={`${isDarkMode ? 'text-teal-400' : 'text-teal-700'} font-medium ml-2 text-sm`}>
                Download
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`flex-row items-center justify-center py-2.5 px-3 rounded-xl ${isDarkMode ? 'bg-red-900/30' : 'bg-red-50'}`}
              onPress={handleDelete}
              disabled={getsinglefileDownlaodloading}
            >
              {getsinglefileDownlaodloading && document?.id === selectedDocType && isdeleting ? (
                <ActivityIndicator size="small" color={isDarkMode ? '#f87171' : '#dc2626'} />
              ) : (
                <Icon name="trash-outline" size={18} color={isDarkMode ? '#f87171' : '#dc2626'} />
              )}
              <Text className={`${isDarkMode ? 'text-red-400' : 'text-red-600'} font-medium ml-1 text-sm`}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Preview Modal */}
      <Modal
        visible={showPreviewModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closePreviewModal}
      >
        <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
          {/* Modal Header */}
          <View className={`flex-row items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <View className="flex-1">
              <Text className={`${isDarkMode ? 'text-white' : 'text-gray-900'} text-lg font-semibold`}>
                {documentName}
              </Text>
              <Text className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                {fileSize}
              </Text>
            </View>
            <TouchableOpacity
              onPress={closePreviewModal}
              className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
            >
              <Icon name="close" size={24} color={isDarkMode ? '#ffffff' : '#000000'} />
            </TouchableOpacity>
          </View>

          {/* Preview Content */}
          <View className="flex-1 p-4">
            {renderPreviewContent()}
          </View>
        </View>
      </Modal>

      {/* Custom Delete Alert */}
      <CustomAlert
        visible={showDeleteAlert}
        type="error"
        title="Delete Document"
        message={`Are you sure you want to delete "${documentName}"? This action cannot be undone.`}
        isDarkMode={isDarkMode}
        buttons={[
          {
            text: "Cancel",
            style: "cancel",
            onPress: cancelDelete
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: handleFileDeleted
          }
        ]}
        onClose={cancelDelete}
      />
    </>
  );
};

export default DocumentCard;