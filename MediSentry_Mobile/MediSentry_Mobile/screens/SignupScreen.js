import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, StatusBar, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import HeaderGradient from '../components/ui/HeaderGradient';
import { Ionicons } from '@expo/vector-icons';

const SignupScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleNext = () => {
        if (!fullName || !email || !password || !confirmPassword) {
            Alert.alert('Missing Fields', 'Please fill all fields to proceed.');
            return;
        }
        if (password.length < 8) {
            Alert.alert('Insecure Password', 'Password must be at least 8 characters long.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Password Mismatch', 'Passwords do not match.');
            return;
        }
        navigation.navigate('RoleSelection', { fullName, email, password });
    };

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            <HeaderGradient height={200}>
                <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
                    <Image source={require('../assets/images/Logo.png')} style={{ width: 40, height: 40, marginBottom: 8 }} resizeMode="contain" />
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join MediSentry AI for safe healthcare.</Text>
                </View>
            </HeaderGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.form}>
                    <AppInput
                        label="Full Name"
                        placeholder="e.g. Dr. Jane Smith"
                        value={fullName}
                        onChangeText={setFullName}
                        icon={<Ionicons name="person-outline" size={20} color={Colors.textSecondary} />}
                    />

                    <AppInput
                        label="Email Address"
                        placeholder="e.g. doctor@medisentry.ai"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        icon={<Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />}
                    />

                    <AppInput
                        label="Password"
                        placeholder="Create a strong password"
                        value={password}
                        onChangeText={setPassword}
                        isPassword
                        icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
                    />
                    <AppInput
                        label="Confirm Password"
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        isPassword
                        icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
                    />

                    <AppButton 
                        title="Next" 
                        onPress={handleNext} 
                        style={styles.signupBtn}
                    />

                    <View style={styles.divider}>
                        <View style={styles.line} />
                        <Text style={styles.dividerText}>already have an account?</Text>
                        <View style={styles.line} />
                    </View>

                    <AppButton 
                        title="Sign In" 
                        variant="outline"
                        onPress={() => navigation.navigate('Login')}
                        style={styles.loginBtn}
                    />
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
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.xl,
    },
    header: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl, // Increased padding to prevent edge hitting
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: Colors.white,
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        alignSelf: 'center',
        maxWidth: '80%', 
        lineHeight: 22,
        marginBottom: Spacing.md,
    },
    form: {
        width: '100%',
    },
    signupBtn: {
        marginTop: Spacing.md,
        marginBottom: Spacing.lg,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.xl,
        paddingVertical: Spacing.lg,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
    },
    dividerText: {
        paddingHorizontal: Spacing.md,
        color: Colors.textSecondary,
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    loginBtn: {
        marginBottom: Spacing.xl,
    },
});

export default SignupScreen;
