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

const Stack = createStackNavigator();

const AppNav = () => {
    const { isLoading, userToken } = useContext(AuthContext);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {userToken === null ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
                        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} options={{ title: 'Verify OTP' }} />
                    </>
                ) : (
                    <>
                        {/* Doctor Routes */}
                        <Stack.Screen name="DoctorHome" component={DoctorHomeScreen} options={{ title: 'Doctor Dashboard' }} />
                        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
                        <Stack.Screen name="PrescriptionEntry" component={PrescriptionEntryScreen} options={{ title: 'New Prescription' }} />
                        <Stack.Screen name="RiskResult" component={RiskResultScreen} options={{ title: 'Analysis Result' }} />
                        <Stack.Screen name="Explanation" component={ExplanationScreen} options={{ title: 'Clinical Explanation' }} />
                        <Stack.Screen name="AlternativeSuggestion" component={AlternativeSuggestionScreen} options={{ title: 'Better Alternatives' }} />
                        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Patient History' }} />

                        {/* Pharmacist Routes */}
                        <Stack.Screen name="PharmacistHome" component={PharmacistDashboard} options={{ title: 'Pharmacist Dashboard' }} />
                        <Stack.Screen name="VerificationDetail" component={VerificationDetailScreen} options={{ title: 'Verify Prescription' }} />

                        {/* Admin Routes */}
                        <Stack.Screen name="AdminSummary" component={AdminSummaryScreen} options={{ title: 'Hospital Analytics' }} />
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
