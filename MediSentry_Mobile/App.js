import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
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
import VerificationDetailScreen from './screens/VerificationDetailScreen';
import AdminSummaryScreen from './screens/AdminSummaryScreen';
import DoctorPrescriptionDetailScreen from './screens/DoctorPrescriptionDetailScreen';
import AdminAuditTimelineScreen from './screens/AdminAuditTimelineScreen';

const Stack = createStackNavigator();

const AppNav = () => {
    const { isLoading, userToken, userInfo } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' }}>
                <ActivityIndicator size="large" color="#1a73e8" />
            </View>
        );
    }

    const userRole = userInfo?.role;

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1a73e8' }, headerTintColor: '#fff', headerTitleStyle: { fontWeight: 'bold' } }}>
                {userToken === null ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
                        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} options={{ title: 'Verify OTP' }} />
                    </>
                ) : (
                    <>
                        {/* Role-Based Conditional Stacks */}
                        {userRole === 'DOCTOR' && (
                            <>
                                <Stack.Screen name="DoctorHome" component={DoctorHomeScreen} options={{ title: 'Doctor Dashboard' }} />
                                <Stack.Screen name="PrescriptionEntry" component={PrescriptionEntryScreen} options={{ title: 'New Prescription' }} />
                                <Stack.Screen name="RiskResult" component={RiskResultScreen} options={{ title: 'Analysis Result' }} />
                                <Stack.Screen name="Explanation" component={ExplanationScreen} options={{ title: 'Clinical Explanation' }} />
                                <Stack.Screen name="AlternativeSuggestion" component={AlternativeSuggestionScreen} options={{ title: 'Safer Alternatives' }} />
                                <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Patient History' }} />
                                <Stack.Screen name="DoctorPrescriptionDetail" component={DoctorPrescriptionDetailScreen} options={{ title: 'Prescription Feedback' }} />
                            </>
                        )}

                        {userRole === 'PHARMACIST' && (
                            <>
                                <Stack.Screen name="PharmacistHome" component={PharmacistDashboard} options={{ title: 'Pharmacist Dashboard' }} />
                                <Stack.Screen name="VerificationDetail" component={VerificationDetailScreen} options={{ title: 'Verify Prescription' }} />
                            </>
                        )}

                        {userRole === 'ADMIN' && (
                            <>
                                <Stack.Screen name="AdminSummary" component={AdminSummaryScreen} options={{ title: 'Hospital Analytics' }} />
                                <Stack.Screen name="AdminAuditTimeline" component={AdminAuditTimelineScreen} options={{ title: 'Audit Logs' }} />
                            </>
                        )}

                        {/* Universal Routes */}
                        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <AppNav />
        </AuthProvider>
    );
}
