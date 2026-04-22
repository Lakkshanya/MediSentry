import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, StatusBar, ActivityIndicator, Image, KeyboardAvoidingView, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import api from '../services/api';
import HeaderGradient from '../components/ui/HeaderGradient';
import OTPInputField from '../components/ui/OTPInputField';
import { Ionicons } from '@expo/vector-icons';

const EmailVerificationScreen = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);

    const email = route.params?.email || '';

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleVerify = async () => {
        if (otp.length !== 6) {
            Alert.alert('Invalid Code', 'Please enter the 6-digit verification code.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/users/verify-email/', { email, otp });
            Alert.alert('Success', 'Your account has been verified.', [
                { text: 'Login Now', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (e) {
            Alert.alert('Verification Failed', e.message || 'The code entered is invalid.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            <KeyboardAvoidingView 
                style={{ flex: 1 }} 
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <HeaderGradient height={200}>
                    <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Ionicons name="arrow-back" size={24} color={Colors.white} />
                        </TouchableOpacity>
                        <Text style={styles.title}>Verify Email</Text>
                        <Text style={styles.subtitle}>
                            We've sent a code to {'\n'}
                            <Text style={styles.emailTextWhite}>{email}</Text>
                        </Text>
                    </View>
                </HeaderGradient>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={{ alignItems: 'center', marginVertical: Spacing.lg }}>
                        <Image source={require('../assets/images/ForgetVerfication.png')} style={{ width: 140, height: 140 }} resizeMode="contain" />
                    </View>
                    <View style={styles.form}>
                        <Text style={styles.label}>Verification Code</Text>
                        <OTPInputField onOtpChange={setOtp} />

                        <AppButton 
                            title="Verify Account" 
                            onPress={handleVerify} 
                            loading={loading}
                            style={styles.verifyBtn}
                        />

                        <View style={styles.resendContainer}>
                            <Text style={styles.resendText}>Didn't receive the code? </Text>
                            <TouchableOpacity 
                                disabled={timeLeft > 0} 
                                onPress={() => {
                                    setTimeLeft(60);
                                    Alert.alert('Success', 'A new code has been sent.');
                                }}
                            >
                                <Text style={[styles.resendLink, timeLeft > 0 && styles.disabledResend]}>
                                    {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend Now'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
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
        paddingTop: Spacing.md,
        marginBottom: Spacing.xl,
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
        fontSize: 24,
        fontWeight: '800',
        color: Colors.white,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'center',
        lineHeight: 20,
    },
    emailTextWhite: {
        color: Colors.white,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    verifyBtn: {
        marginTop: Spacing.md,
    },
    resendContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    resendText: {
        color: Colors.textSecondary,
        fontSize: 14,
    },
    resendLink: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    disabledResend: {
        color: Colors.textSecondary,
        opacity: 0.5,
    },
});

export default EmailVerificationScreen;
