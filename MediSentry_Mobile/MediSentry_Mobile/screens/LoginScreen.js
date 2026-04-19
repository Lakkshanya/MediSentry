import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, StatusBar, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import { AuthContext } from '../context/AuthContext';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import HeaderGradient from '../components/ui/HeaderGradient';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { login, isLoading } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        const result = await login(username, password);
        if (!result) return;
        if (result.success) return;

        if (result.errorType === 'UNVERIFIED') {
            Alert.alert(
                'Email Not Verified',
                'Please verify your email with the OTP sent during registration.',
                [
                    { text: 'VERIFY NOW', onPress: () => navigation.navigate('EmailVerification', { email: username }) },
                    { text: 'CANCEL', style: 'cancel' },
                ]
            );
            return;
        }
        Alert.alert('Login Error', result.message);
    };

    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: "YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com",
        iosClientId: "YOUR_IOS_CLIENT_ID_HERE.apps.googleusercontent.com",
        androidClientId: "YOUR_ANDROID_CLIENT_ID_HERE.apps.googleusercontent.com",
        prompt: "select_account", 
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { authentication } = response;
            fetchUserInfo(authentication.accessToken);
        }
    }, [response]);

    const fetchUserInfo = async (token) => {
        try {
            const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const user = await res.json();
            if (user.email) setUsername(user.email);
        } catch (error) {
            Alert.alert("Error", "Could not fetch Google profile.");
        }
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <HeaderGradient height={160}>
                    <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
                        <Image source={require('../assets/images/Logo.png')} style={{ width: 40, height: 40, marginBottom: 8 }} resizeMode="contain" />
                        <Text style={styles.title}>Welcome back.</Text>
                        <Text style={styles.subtitle}>Sign in to continue to MediSentry AI</Text>
                    </View>
                </HeaderGradient>

                <View style={styles.form}>
                    <AppInput
                        label="Email Address"
                        placeholder="e.g. doctor@medisentry.ai"
                        value={username}
                        onChangeText={setUsername}
                        keyboardType="email-address"
                        icon={<Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />}
                    />

                    <AppInput
                        label="Password"
                        placeholder="Enter your password"
                        value={password}
                        onChangeText={setPassword}
                        isPassword
                        icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
                    />

                    <Text 
                        style={styles.forgotPassword} 
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        Forgot Password?
                    </Text>

                    <AppButton 
                        title="Login" 
                        onPress={handleLogin} 
                        loading={isLoading}
                        style={styles.loginBtn}
                    />

                    <View style={styles.divider}>
                        <View style={styles.line} />
                        <Text style={styles.dividerText}>or continue with</Text>
                        <View style={styles.line} />
                    </View>

                    <AppButton 
                        title="Google" 
                        variant="outline"
                        onPress={() => promptAsync()}
                        disabled={!request}
                        style={styles.googleBtn}
                        textStyle={styles.googleText}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>New to MediSentry? </Text>
                    <Text style={styles.signupLink} onPress={() => navigation.navigate('Signup')}>
                        Create Account
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: Spacing.xl,
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.white,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    form: {
        width: '100%',
        paddingHorizontal: Spacing.lg,
        marginTop: Spacing.lg,
    },
    passwordContainer: {
        position: 'relative',
    },
    eyeIcon: {
        position: 'absolute',
        right: Spacing.md,
        top: 38, // Centered vertically in the medium height input
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 14,
        marginBottom: Spacing.lg, // Increased from md
    },
    loginBtn: {
        marginBottom: Spacing.lg,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        paddingHorizontal: Spacing.md,
        color: Colors.textSecondary,
        fontSize: 13,
    },
    googleBtn: {
        marginBottom: Spacing.xl,
    },
    googleText: {
        color: Colors.text,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 'auto',
        paddingVertical: Spacing.lg,
    },
    footerText: {
        color: Colors.textSecondary,
        fontSize: 15,
    },
    signupLink: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 15,
    },
});

export default LoginScreen;
