import { View, Text } from 'react-native';
import React from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from './Components/Auth/LoginScreen';
import DashboardScreen from './Components/Dashboard/DashboardScreen';
import CustomersScreen from './Components/Customers/CustomersScreen';
import PendingDuesScreen from './Components/PedningDues/PendingScreen';
import PaymentsScreen from './Components/Payments/PaymentsScreen';
import ProfileScreen from './Components/Profile/ProfileScreen';
import Editprofile from './Components/Profile/Editprofile';
import HelpScreen from './Components/Profile/HelpScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';
import './global.css'; // Ensure you have a global CSS file for styles
import SupportScreen from './Components/Profile/SupportScreen';
import ChatScreen from './Components/Profile/ChartScreen';
import Createcustomer from './Components/Customers/Createcustomer';
import Customerdetails from './Components/Customers/Customerdetails';
import CustomerDetails from './Components/Customers/Customerdetails';
import LoanDetails from './Components/Customers/LoanDetails';
import PaymentDetails from './Components/Payments/PaymentDetails';
import AddLoan from './Components/Loan/AddLoan';
import NotificationScreen from './Components/Notification';
import EditCustomerScreen from './Components/Customers/EditCustomer';
import { useSelector } from 'react-redux';
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Create custom themes
const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#1a9c94',
    background: '#111827',
    card: '#1f2937',
    text: '#f3f4f6',
    border: '#374151',
  },
};

const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1a9c94',
    background: '#f3f4f6',
    card: '#ffffff',
    text: '#1f2937',
    border: '#e5e7eb',
  },
};

// Create Stack navigators for each tab
const HomeStack = createNativeStackNavigator();
const CustomersStack = createNativeStackNavigator();
const PendingStack = createNativeStackNavigator();
const PaymentsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Create Stack Screen components
const HomeStackScreen = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  return (
    <HomeStack.Navigator screenOptions={{
      headerShown: false,
      contentStyle: {
        backgroundColor: isDarkMode ? '#111827' : '#f3f4f6'
      }
    }}>
      <HomeStack.Screen name="DashboardScreen" component={DashboardScreen} />
      <HomeStack.Screen name='addloan' component={AddLoan}
        options={{
          tabBarStyle: { display: 'none' },
          headerShown: true,
          headerTitle: 'Add Loan',
          headerStyle: {
            backgroundColor: isDarkMode ? '#1f2937' : '#1a9c94'
          },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <HomeStack.Screen name='notifications' component={NotificationScreen}
        options={
          {
            tabBarStyle: { display: 'none' },
          }
        }
      />
      {/* Add more screens for Home stack */}
    </HomeStack.Navigator>
  );
};

const CustomersStackScreen = () => (
  <CustomersStack.Navigator screenOptions={{ headerShown: false }}>
    <CustomersStack.Screen name="CustomersMain" component={CustomersScreen} />
    <CustomersStack.Screen name="Createcustomer" component={Createcustomer}
      options={{
        tabBarStyle: { display: 'none' }
      }}
    />
    <CustomersStack.Screen name="Customerdetails" component={CustomerDetails}
      options={{
        tabBarStyle: { display: 'none' },
        headerShown: true,
        headerTitle: 'Customer Details',
        headerStyle: { backgroundColor: '#1a9c94' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    <CustomersStack.Screen name="Loandetails" component={LoanDetails}
      options={{
        tabBarStyle: { display: 'none' },
      }}
    />
    <CustomersStack.Screen name="editcustomer" component={EditCustomerScreen}
      options={{
        tabBarStyle: { display: 'none' },
      }}
    />
    <CustomersStack.Screen name='addloan' component={AddLoan}
      options={{
        tabBarStyle: { display: 'none' },
      }}
    />
  </CustomersStack.Navigator>
);

const PendingStackScreen = () => (
  <PendingStack.Navigator screenOptions={{ headerShown: false }}>
    <PendingStack.Screen name="PendingMain" component={PendingDuesScreen} />
    <ProfileStack.Screen name="Paymentdetails" component={PaymentDetails}
      options={{
        tabBarStyle: { display: 'none' },
        headerShown: true,
        headerTitle: 'Payment Details',
        headerStyle: { backgroundColor: '#1a9c94' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    {/* Add more screens for Pending stack */}
  </PendingStack.Navigator>
);

const PaymentsStackScreen = () => (
  <PaymentsStack.Navigator screenOptions={{ headerShown: false }}>
    <PaymentsStack.Screen name="PaymentsMain" component={PaymentsScreen} />
    <ProfileStack.Screen name="Paymentdetails" component={PaymentDetails}
      options={{
        tabBarStyle: { display: 'none' },
        headerShown: true,
        headerTitle: 'Payment Details',
        headerStyle: { backgroundColor: '#1a9c94' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
  </PaymentsStack.Navigator>
);

const ProfileStackScreen = () => (
  <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    <ProfileStack.Screen name="EditProfile" component={Editprofile}
      options={{
        tabBarStyle: { display: 'none' } // Set header title style
      }}
    />
    <ProfileStack.Screen name="HelpScreen" component={HelpScreen}
      options={{
        tabBarStyle: { display: 'none' },
        headerShown: true,
        headerTitle: 'Help & Support',
        headerStyle: { backgroundColor: '#1a9c94' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    <ProfileStack.Screen name="SupportScreen" component={SupportScreen}
      options={{
        tabBarStyle: { display: 'none' },
        headerShown: true,
        headerTitle: 'Help & Support',
        headerStyle: { backgroundColor: '#1a9c94' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    <ProfileStack.Screen name="ChatScreen" component={ChatScreen}
      options={{
        tabBarStyle: { display: 'none' },
        headerShown: true,
        headerTitle: 'Help & Support',
        headerStyle: { backgroundColor: '#1a9c94' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    />
    {/* Add more screens for Profile stack */}
  </ProfileStack.Navigator>
);

const MainApp = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Customers') {
            iconName = 'people';
          } else if (route.name === 'Pending') {
            iconName = 'access-time';
          } else if (route.name === 'Payments') {
            iconName = 'payments';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: '#1a9c94',
        tabBarInactiveTintColor: isDarkMode ? '#9ca3af' : '#6b7280',
        headerShown: false,
        tabBarStyle: {
          padding:'10px',
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          borderTopColor: isDarkMode ? '#374151' : '#e5e7eb',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Customers" component={CustomersStackScreen} />
      <Tab.Screen name="Pending" component={PendingStackScreen} />
      <Tab.Screen name="Payments" component={PaymentsStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  const isDarkMode = useSelector((state) => state.theme.isDarkMode);
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    // <Provider store={store}>
    <NavigationContainer theme={isDarkMode ? customDarkTheme : customLightTheme}>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'MainApp' : 'Login'}
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: isDarkMode ? '#111827' : '#f3f4f6'
          }
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        {isAuthenticated && <Stack.Screen name="MainApp" component={MainApp} />}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
