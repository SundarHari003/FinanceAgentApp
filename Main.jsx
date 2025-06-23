import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Provider } from 'react-redux'
import { persistor, store } from './redux/store'
import App from './App'
import { ToastProvider } from './Context/ToastContext'
import { PersistGate } from 'redux-persist/integration/react'

const Main = () => {
    return (
        <Provider store={store}>
            <PersistGate loading={<ActivityIndicator/>} persistor={persistor}>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </PersistGate>
        </Provider>
    )
}

export default Main

const styles = StyleSheet.create({})