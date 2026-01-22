import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import api from '../services/api';

const EmailVerificationScreen = ({ route, navigation }) => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);

    // Email passed from Signup or ForgotPassword
    const email = route.params?.email || '';

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            Alert.alert('Invalid Input', 'Please enter the 6-digit valid OTP sent to your email.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/verify-email/', { email, otp });
            Alert.alert('Verified Successfully [Success]', 'Your account is now active.', [
                { text: 'Login Now', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (e) {
            const msg = e.response?.data?.error || 'Invalid OTP';
            Alert.alert('Verification Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f6f8" />

            <View style={styles.card}>
                <Text style={styles.icon}>🔐</Text>
                <Text style={styles.title}>Verify Email</Text>
                <Text style={styles.subtitle}>
                    Enter the 6-digit code sent to{"\n"}
                    <Text style={{ fontWeight: 'bold', color: '#333' }}>{email}</Text>
                </Text>

                <TextInput
                    style={styles.input}
                    placeholder="000000"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 10 }} />
                ) : (
                    <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify}>
                        <Text style={styles.verifyBtnText}>Verify Account</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={() => {
                        if (timeLeft === 0) {
                            setTimeLeft(60);
                            Alert.alert('Sent', 'OTP Resent!');
                            // Add Resend API Call here if implemented
                        }
                    }}
                    disabled={timeLeft > 0}
                    style={{ marginTop: 25 }}
                >
                    <Text style={[styles.resend, timeLeft > 0 && { color: '#999' }]}>
                        {timeLeft > 0 ? `Resend Code in ${timeLeft}s` : 'Resend Code'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8', justifyContent: 'center', padding: 25 },
    card: { backgroundColor: '#fff', borderRadius: 15, padding: 30, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1 },
    icon: { fontSize: 40, marginBottom: 15 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    subtitle: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center', lineHeight: 22 },
    input: { borderWidth: 2, borderColor: '#e0e0e0', padding: 15, width: '100%', marginBottom: 20, borderRadius: 12, textAlign: 'center', fontSize: 24, letterSpacing: 8, backgroundColor: '#fafafa', color: '#1a73e8', fontWeight: 'bold' },
    verifyBtn: { backgroundColor: '#1a73e8', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 10, width: '100%', alignItems: 'center', shadowColor: '#1a73e8', elevation: 4 },
    verifyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    resend: { fontSize: 14, color: '#1a73e8', fontWeight: '600' }
});

export default EmailVerificationScreen;
