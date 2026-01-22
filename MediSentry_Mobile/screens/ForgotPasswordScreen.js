import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, StatusBar } from 'react-native';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');

    const handleReset = () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }
        // In real app, call API. For now, simulate success.
        Alert.alert('Link Sent', `If an account exists for ${email}, a password reset link has been sent. Check your inbox.`);
        // Optional: Navigate to verification just to simulate flow
        // navigation.navigate('EmailVerification', { email });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.card}>
                <Text style={styles.title}>Reset Password</Text>
                <Text style={styles.instruction}>
                    Enter the email associated with your account and we'll send you a link to reset your password.
                </Text>

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

                <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                    <Text style={styles.resetBtnText}>Send Reset Link</Text>
                </TouchableOpacity>
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
