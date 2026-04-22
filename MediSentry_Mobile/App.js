import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ActivityIndicator, View, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Colors, Shadow, Sizes } from './constants/theme';

import HomePage from './screens/HomePage';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import RoleSelectionScreen from './screens/RoleSelectionScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import DoctorHomeScreen from './screens/DoctorHomeScreen';
import PrescriptionEntryScreen from './screens/PrescriptionEntryScreen';
import RiskResultScreen from './screens/RiskResultScreen';
import ExplanationScreen from './screens/ExplanationScreen'; // Renamed
import AlternativeSuggestionScreen from './screens/AlternativeSuggestionScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import HistoryScreen from './screens/HistoryScreen';
import PharmacistDashboard from './screens/PharmacistDashboard'; // Renamed
import PharmacistQueueScreen from './screens/PharmacistQueueScreen';
import VerificationDetailScreen from './screens/VerificationDetailScreen';
import AdminSummaryScreen from './screens/AdminSummaryScreen';
import DoctorPrescriptionDetailScreen from './screens/DoctorPrescriptionDetailScreen';
import AdminAuditTimelineScreen from './screens/AdminAuditTimelineScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- Tab Navigators for Each Role ---

const DoctorTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
                position: 'absolute',
                bottom: Platform.OS === 'ios' ? 12 : 8,
                left: 20,
                right: 20,
                height: 60,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 30,
                borderTopWidth: 0,
                ...Shadow.medium,
                elevation: 10,
                paddingBottom: 5,
            },
            tabBarShowLabel: true,
            tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: 'rgba(0, 0, 0, 0.3)',
            tabBarIcon: ({ focused, color }) => {
                let iconName;
                if (route.name === 'DoctorDashboard' || route.name === 'PharmacistDashboard' || route.name === 'AdminDashboard') iconName = focused ? 'home' : 'home-outline';
                else if (route.name === 'DoctorHistory') iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
                else if (route.name === 'DoctorNotifications' || route.name === 'PharmacistNotifications') iconName = focused ? 'notifications' : 'notifications-outline';
                else if (route.name === 'PharmacistQueue') iconName = focused ? 'list' : 'list-outline';
                else if (route.name === 'AdminAuditTimeline') iconName = focused ? 'list' : 'list-outline';
                else if (route.name.includes('Profile')) iconName = focused ? 'person' : 'person-outline';
                
                return (
                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 4 }}>
                        <Ionicons name={iconName} size={24} color={color} />
                        {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary, marginTop: 3 }} />}
                    </View>
                );
            },
        })}
    >
        <Tab.Screen name="DoctorDashboard" component={DoctorHomeScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="DoctorHistory" component={HistoryScreen} options={{ title: 'History' }} />
        <Tab.Screen name="DoctorProfile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
);

const PharmacistTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
                position: 'absolute',
                bottom: Platform.OS === 'ios' ? 12 : 8,
                left: 20,
                right: 20,
                height: 60,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 30,
                borderTopWidth: 0,
                ...Shadow.medium,
                elevation: 10,
                paddingBottom: 5,
            },
            tabBarShowLabel: true,
            tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: 'rgba(0, 0, 0, 0.3)',
            tabBarIcon: ({ focused, color }) => {
                let iconName;
                if (route.name === 'DoctorDashboard' || route.name === 'PharmacistDashboard' || route.name === 'AdminDashboard') iconName = focused ? 'home' : 'home-outline';
                else if (route.name.includes('Notifications')) iconName = focused ? 'notifications' : 'notifications-outline';
                else if (route.name.includes('History')) iconName = focused ? 'file-tray-full' : 'file-tray-full-outline';
                else if (route.name.includes('Profile')) iconName = focused ? 'person' : 'person-outline';
                
                return (
                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 4 }}>
                        <Ionicons name={iconName} size={24} color={color} />
                        {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary, marginTop: 3 }} />}
                    </View>
                );
            },
        })}
    >
        <Tab.Screen name="PharmacistDashboard" component={PharmacistDashboard} options={{ title: 'Home' }} />
        <Tab.Screen name="PharmacistHistory" component={PharmacistQueueScreen} options={{ title: 'History' }} />
        <Tab.Screen name="PharmacistProfile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
);

const AdminTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
                position: 'absolute',
                bottom: Platform.OS === 'ios' ? 12 : 8,
                left: 20,
                right: 20,
                height: 60,
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: 30,
                borderTopWidth: 0,
                ...Shadow.medium,
                elevation: 10,
                paddingBottom: 5,
            },
            tabBarShowLabel: true,
            tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
            tabBarActiveTintColor: Colors.primary,
            tabBarInactiveTintColor: 'rgba(0, 0, 0, 0.3)',
            tabBarIcon: ({ focused, color }) => {
                let iconName;
                if (route.name === 'DoctorDashboard' || route.name === 'PharmacistDashboard' || route.name === 'AdminDashboard') iconName = focused ? 'home' : 'home-outline';
                else if (route.name === 'AdminHistory') iconName = focused ? 'list' : 'list-outline';
                else if (route.name.includes('Profile')) iconName = focused ? 'person' : 'person-outline';
                
                return (
                    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 4 }}>
                        <Ionicons name={iconName} size={24} color={color} />
                        {focused && <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary, marginTop: 3 }} />}
                    </View>
                );
            },
        })}
    >
        <Tab.Screen name="AdminDashboard" component={AdminSummaryScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="AdminHistory" component={AdminAuditTimelineScreen} options={{ title: 'History' }} />
        <Tab.Screen name="AdminProfile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
);

const AuthNavigator = () => (
    <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{ 
            headerStyle: { backgroundColor: Colors.white, ...Shadow.light }, 
            headerTintColor: Colors.primary, 
            headerTitleStyle: { fontWeight: '800', color: Colors.text, fontSize: 18 },
            headerBackTitleVisible: false,
        }}
    >
        <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
);

const AppNav = () => {
    const { isLoading, userToken, userInfo } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    const userRole = userInfo?.role;

    return (
        <NavigationContainer>
            <Stack.Navigator 
                screenOptions={{ 
                    headerStyle: { backgroundColor: Colors.white, ...Shadow.light }, 
                    headerTintColor: Colors.primary, 
                    headerTitleStyle: { fontWeight: '800', color: Colors.text, fontSize: 18 },
                    headerBackTitleVisible: false,
                }}
            >
                {userToken === null ? (
                    <Stack.Screen name="Auth" component={AuthNavigator} options={{ headerShown: false }} />
                ) : (
                    <>
                        {/* Role-Based Conditional Stacks */}
                    <>
                        {userRole === 'DOCTOR' && (
                            <>
                                <Stack.Screen name="DoctorHome" component={DoctorTabs} options={{ headerShown: false }} />
                                <Stack.Screen name="PrescriptionEntry" component={PrescriptionEntryScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="RiskResult" component={RiskResultScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="Explanation" component={ExplanationScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="AlternativeSuggestion" component={AlternativeSuggestionScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="DoctorPrescriptionDetail" component={DoctorPrescriptionDetailScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="DoctorNotifications" component={NotificationsScreen} options={{ headerShown: false }} />
                            </>
                        )}

                        {userRole === 'PHARMACIST' && (
                            <>
                                <Stack.Screen name="PharmacistHome" component={PharmacistTabs} options={{ headerShown: false }} />
                                <Stack.Screen name="VerificationDetail" component={VerificationDetailScreen} options={{ headerShown: false }} />
                                <Stack.Screen name="PharmacistNotifications" component={NotificationsScreen} options={{ headerShown: false }} />
                            </>
                        )}

                        {userRole === 'ADMIN' && (
                            <>
                                <Stack.Screen name="AdminSummary" component={AdminTabs} options={{ headerShown: false }} />
                            </>
                        )}
                    </>
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <AppNav />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
