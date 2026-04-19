import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppCard from '../components/ui/AppCard';
import { registerUser } from '../services/api';
import HeaderGradient from '../components/ui/HeaderGradient';
import { Ionicons } from '@expo/vector-icons';

const RoleSelectionScreen = ({ route, navigation }) => {
    const params = route.params || {};
    const { fullName = '', email = '', password = '' } = params;
    const [isLoading, setIsLoading] = useState(false);

    const handleRoleSelect = async (role) => {
        setIsLoading(true);
        try {
            await registerUser({ username: fullName, email, password, role });
            navigation.navigate('EmailVerification', { email });
        } catch (e) {
            let msg = e.message || 'Registration failed. Try again.';
            if (msg.toLowerCase().includes('username')) {
                msg = msg.replace('username: ', '').replace('username:', '');
            }
            Alert.alert('Signup Failed', msg);
        } finally {
            setIsLoading(false);
        }
    };

    const RoleItem = ({ title, role, image, isDoctor = false }) => (
        <TouchableOpacity 
            onPress={() => handleRoleSelect(role)} 
            disabled={isLoading}
            activeOpacity={0.7}
        >
            <AppCard style={styles.roleCard}>
                <View style={styles.roleInfo}>
                    <Text style={styles.roleTitle}>{title}</Text>
                    <Text style={styles.roleSubtitle}>Tap to join as {title.toLowerCase()}</Text>
                </View>
                <View style={styles.imageWrapper}>
                    <Image 
                        source={image} 
                        style={isDoctor ? styles.cardImageDoctor : styles.cardImage} 
                        resizeMode="contain" 
                    />
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
            </AppCard>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            <HeaderGradient height={140}>
                <View style={styles.header}>
                    <Text style={styles.title}>MediSentry AI</Text>
                    <Text style={styles.subtitle}>Select your professional role</Text>
                </View>
            </HeaderGradient>

            <View style={styles.content}>

                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.loadingText}>Creating your account...</Text>
                    </View>
                )}

                <View style={styles.rolesList}>
                    <RoleItem 
                        title="Doctor" 
                        role="DOCTOR" 
                        image={require('../assets/images/Doctor.png')} 
                        isDoctor 
                    />
                    <RoleItem 
                        title="Pharmacist" 
                        role="PHARMACIST" 
                        image={require('../assets/images/Pharmassist.png')} 
                    />
                    <RoleItem 
                        title="System Admin" 
                        role="ADMIN" 
                        image={require('../assets/images/Admin.png')} 
                    />
                </View>

                <TouchableOpacity 
                    style={styles.backLink} 
                    onPress={() => navigation.goBack()}
                    disabled={isLoading}
                >
                    <Text style={styles.backLinkText}>Change Registration Details</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.white,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        lineHeight: 22,
        textAlign: 'center',
    },
    loadingOverlay: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    loadingText: {
        marginTop: Spacing.sm,
        color: Colors.primary,
        fontWeight: '600',
    },
    rolesList: {
        marginTop: Spacing.lg,
    },
    roleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    roleInfo: {
        flex: 1,
    },
    roleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 2,
    },
    roleSubtitle: {
        fontSize: 13,
        color: Colors.textSecondary,
    },
    imageWrapper: {
        width: 60,
        height: 60,
        backgroundColor: 'rgba(86, 7, 119, 0.05)',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: Spacing.md,
    },
    cardImage: {
        width: 36,
        height: 36,
    },
    cardImageDoctor: {
        width: 42,
        height: 42,
    },
    backLink: {
        marginTop: 'auto',
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    backLinkText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 15,
        textDecorationLine: 'underline',
    },
});

export default RoleSelectionScreen;
