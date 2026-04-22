import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, StatusBar, ActivityIndicator, Image, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import api from '../services/api';
import HeaderGradient from '../components/ui/HeaderGradient';
import OTPInputField from '../components/ui/OTPInputField';
import { Ionicons } from '@expo/vector-icons';

const ForgotPasswordScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Password
    const [loading, setLoading] = useState(false);

    const handleRequestOtp = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }
        setLoading(true);
        try {
            await api.post('/users/forgot-password/', { email });
            Alert.alert('OTP Sent', 'Check your email for the verification code.');
            setStep(2);
        } catch (e) {
            Alert.alert('Failed', e.message || 'Could not send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = () => {
        if (otp.length < 4) {
            Alert.alert('Error', 'Please enter the verification code');
            return;
        }
        setStep(3);
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please enter and confirm your password');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await api.post('/users/reset-password/', { email, otp, new_password: newPassword });
            Alert.alert('Success', 'Password has been reset successfully.');
            navigation.navigate('Login');
        } catch (e) {
            Alert.alert('Failed', e.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const getHeaderContent = () => {
        switch(step) {
            case 1: return { title: 'Forgot Password', subtitle: 'Enter your email to receive a reset code.' };
            case 2: return { title: 'Verify OTP', subtitle: 'Enter the code sent to your email.' };
            case 3: return { title: 'Set New Password', subtitle: 'Create a secure new password.' };
            default: return { title: '', subtitle: '' };
        }
    };

    const { title, subtitle } = getHeaderContent();

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            <HeaderGradient height={200}>
                <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
                    <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>
            </HeaderGradient>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.form}>
                    <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
                         <Image 
                            source={
                                step === 1 ? require('../assets/images/ForgetPassword.png') :
                                step === 2 ? require('../assets/images/ForgetVerfication.png') :
                                require('../assets/images/ForgetPasswordForCreatingPassword.png')
                            } 
                            style={{ width: 120, height: 120 }} 
                            resizeMode="contain" 
                        />
                    </View>
                    {step === 1 && (
                        <>
                            <AppInput
                                label="Email Address"
                                placeholder="doctor@medisentry.ai"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                icon={<Ionicons name="mail-outline" size={20} color={Colors.textSecondary} />}
                            />
                            <AppButton 
                                title="Send Reset Code" 
                                onPress={handleRequestOtp} 
                                loading={loading}
                                style={styles.actionBtn}
                            />
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <Text style={styles.label}>Verification Code</Text>
                            <OTPInputField onOtpChange={setOtp} />
                            <AppButton 
                                title="Verify Code" 
                                onPress={handleVerifyOtp} 
                                style={styles.actionBtn}
                            />
                            <AppButton 
                                title="Resend Code" 
                                variant="outline"
                                onPress={handleRequestOtp} 
                                loading={loading}
                                style={styles.secondaryBtn}
                            />
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <AppInput
                                label="New Password"
                                placeholder="Min 8 characters"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                isPassword
                                icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
                            />
                            <AppInput
                                label="Confirm Password"
                                placeholder="Repeat new password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                isPassword
                                icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} />}
                            />
                            <AppButton 
                                title="Reset Password" 
                                onPress={handleResetPassword} 
                                loading={loading}
                                style={styles.actionBtn}
                            />
                        </>
                    )}
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
    navHeader: {
        paddingTop: Spacing.xl,
        marginBottom: Spacing.md,
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    backBtn: {
        alignSelf: 'flex-start',
        padding: Spacing.xs,
        marginTop: -Spacing.xs,
        marginBottom: Spacing.xs,
    },
    title: {
        fontSize: 26, // Increased slightly to match Signup
        fontWeight: '800',
        color: Colors.white,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 15,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.lg, // More space at bottom of header
    },
    form: {
        width: '100%',
    },
    actionBtn: {
        marginTop: Spacing.md,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
});

export default ForgotPasswordScreen;
