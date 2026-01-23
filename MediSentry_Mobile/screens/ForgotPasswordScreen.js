import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, StatusBar, ActivityIndicator } from 'react-native';
import api from '../services/api';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
    const [loading, setLoading] = useState(false);

    const handleRequestOtp = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }
        setLoading(true);
        try {
            await api.post('/users/forgot-password/', { email });
            Alert.alert('OTP Sent', 'Please check your email for the 6-digit reset code.');
            setStep(2);
        } catch (e) {
            Alert.alert('Failed', e.response?.data?.error || 'Could not send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!otp || !newPassword) {
            Alert.alert('Error', 'Please enter the OTP and new password');
            return;
        }
        setLoading(true);
        try {
            await api.post('/users/reset-password/', { email, otp, new_password: newPassword });
            Alert.alert('Success', 'Password has been reset. You can now login.', [
                { text: 'Login', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (e) {
            Alert.alert('Failed', e.response?.data?.error || 'Invalid OTP or request failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.card}>
                <Text style={styles.title}>{step === 1 ? 'Reset Password' : 'Set New Password'}</Text>
                <Text style={styles.instruction}>
                    {step === 1
                        ? "Enter the email associated with your account and we'll send you a code to reset your password."
                        : "Enter the 6-digit code sent to your email and your new password."}
                </Text>

                {step === 1 ? (
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email Address</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="doctor@hospital.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                ) : (
                    <>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>6-Digit OTP Code</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="123456"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="numeric"
                                maxLength={6}
                            />
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                            />
                        </View>
                    </>
                )}

                <TouchableOpacity
                    style={[styles.resetBtn, loading && { opacity: 0.7 }]}
                    onPress={step === 1 ? handleRequestOtp : handleResetPassword}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.resetBtnText}>
                            {step === 1 ? 'Send Reset Code' : 'Update Password'}
                        </Text>
                    )}
                </TouchableOpacity>

                {step === 2 && (
                    <TouchableOpacity onPress={() => setStep(1)} style={{ marginTop: 15, alignItems: 'center' }}>
                        <Text style={{ color: '#666', fontSize: 13 }}>Change Email</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8', padding: 25, justifyContent: 'center' },
    backBtn: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
    backText: { fontSize: 16, color: '#1a73e8', fontWeight: 'bold' },
    card: { backgroundColor: '#fff', borderRadius: 15, padding: 25, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333', textAlign: 'center' },
    instruction: { fontSize: 14, color: '#666', marginBottom: 30, textAlign: 'center', lineHeight: 20 },
    inputGroup: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
    input: { borderWidth: 1, borderColor: '#e0e0e0', padding: 12, borderRadius: 8, fontSize: 16, backgroundColor: '#fafafa' },
    resetBtn: { backgroundColor: '#1a73e8', padding: 15, borderRadius: 10, alignItems: 'center', shadowColor: '#1a73e8', elevation: 4 },
    resetBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default ForgotPasswordScreen;
