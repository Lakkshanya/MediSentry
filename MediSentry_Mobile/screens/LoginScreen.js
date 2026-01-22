import React, { useContext, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Image, StatusBar } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
    const { login, isLoading } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f6f8" />
            <View style={styles.header}>
                <Text style={styles.logo}>MediSentry AI</Text>
                <Text style={styles.subtitle}>Secure Clinical Decision Support</Text>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email / Username</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="doctor@hospital.com"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        value={password}
                        secureTextEntry
                        onChangeText={setPassword}
                    />
                </View>

                <TouchableOpacity
                    style={styles.forgotBtn}
                    onPress={() => navigation.navigate('ForgotPassword')}
                >
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 20 }} />
                ) : (
                    <TouchableOpacity style={styles.loginBtn} onPress={() => login(username, password)}>
                        <Text style={styles.loginBtnText}>Login</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.signupText}>Create Account</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8', justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: 40 },
    logo: { fontSize: 32, fontWeight: 'bold', color: '#1a73e8', letterSpacing: 1 },
    subtitle: { fontSize: 14, color: '#666', marginTop: 5 },
    formContainer: { marginHorizontal: 30, backgroundColor: '#fff', padding: 25, borderRadius: 15, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 10 },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: 12, color: '#555', marginBottom: 5, fontWeight: '600' },
    input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#fafafa', color: '#333' },
    forgotBtn: { alignSelf: 'flex-end', marginBottom: 20 },
    forgotText: { color: '#1a73e8', fontSize: 13, fontWeight: '500' },
    loginBtn: { backgroundColor: '#1a73e8', paddingVertical: 15, borderRadius: 8, alignItems: 'center', shadowColor: '#1a73e8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
    loginBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footerText: { color: '#666', fontSize: 14 },
    signupText: { color: '#1a73e8', fontWeight: 'bold', marginLeft: 5, fontSize: 14 }
});

export default LoginScreen;
