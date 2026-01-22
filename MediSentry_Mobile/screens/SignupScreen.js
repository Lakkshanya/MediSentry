import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { registerUser } from '../services/api';

const SignupScreen = ({ navigation }) => {
    // Adding Full Name state as requested, though backend currently uses username. 
    // We will concatenate or store it if backend supported, for now binding to username/profile logic if needed or just UI.
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('DOCTOR');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async () => {
        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert('Missing Fields', 'Please fill all fields to proceed.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match.');
            return;
        }

        setIsLoading(true);
        try {
            // Using fullName as part of username logic or just passing it if backend updated. 
            // For now, mapping fullName -> username for simple registration compatibility with existing backend
            await registerUser({ username: fullName, email, password, role });
            Alert.alert('Success', 'Account created! Please check your email for OTP.', [
                { text: 'Verify Now', onPress: () => navigation.navigate('EmailVerification', { email }) }
            ]);
        } catch (e) {
            const msg = e.error || 'Registration failed. Try again.';
            Alert.alert('Signup Failed', msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join MediSentry Network</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        placeholder="Dr. Rajesh Koothrappali"
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        placeholder="doctor@hospital.com"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        placeholder="••••••••"
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        placeholder="••••••••"
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />
                </View>

                <Text style={styles.helper}>Must be 8+ chars, 1 Uppercase, 1 Number</Text>

                <View style={styles.roleContainer}>
                    <Text style={styles.label}>Select Role:</Text>
                    <View style={styles.roleRow}>
                        <TouchableOpacity
                            style={[styles.roleBtn, role === 'DOCTOR' && styles.roleActive]}
                            onPress={() => setRole('DOCTOR')}
                        >
                            <Text style={[styles.roleText, role === 'DOCTOR' && styles.textActive]}>Doctor</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.roleBtn, role === 'PHARMACIST' && styles.roleActive]}
                            onPress={() => setRole('PHARMACIST')}
                        >
                            <Text style={[styles.roleText, role === 'PHARMACIST' && styles.textActive]}>Pharmacist</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.roleBtn, role === 'ADMIN' && styles.roleActive]}
                            onPress={() => setRole('ADMIN')}
                        >
                            <Text style={[styles.roleText, role === 'ADMIN' && styles.textActive]}>Admin</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#1a73e8" />
                ) : (
                    <TouchableOpacity style={styles.signupBtn} onPress={handleSignup}>
                        <Text style={styles.signupBtnText}>Create Account</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.footerLink}>
                <Text style={styles.footerText}>Already have an account? <Text style={styles.loginLink}>Login</Text></Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#f4f6f8', padding: 20, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 30 },
    title: { fontSize: 26, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
    card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1 },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#e0e0e0', padding: 12, borderRadius: 8, fontSize: 16, backgroundColor: '#fafafa' },
    helper: { fontSize: 11, color: '#888', fontStyle: 'italic', marginBottom: 20, marginTop: -10 },
    roleContainer: { marginBottom: 25 },
    roleRow: { flexDirection: 'row', justifyContent: 'space-between' },
    roleBtn: { flex: 0.3, paddingVertical: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, alignItems: 'center', backgroundColor: '#fff' },
    roleActive: { backgroundColor: '#1a73e8', borderColor: '#1a73e8' },
    roleText: { color: '#555', fontWeight: '500' },
    textActive: { color: '#fff', fontWeight: 'bold' },
    signupBtn: { backgroundColor: '#1a73e8', padding: 15, borderRadius: 10, alignItems: 'center', shadowColor: '#1a73e8', elevation: 4 },
    signupBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    footerLink: { marginTop: 25, alignSelf: 'center' },
    footerText: { fontSize: 14, color: '#666' },
    loginLink: { color: '#1a73e8', fontWeight: 'bold' }
});

export default SignupScreen;
