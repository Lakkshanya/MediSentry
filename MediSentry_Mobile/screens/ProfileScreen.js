import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    TouchableOpacity,
    Image
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppCard from '../components/ui/AppCard';
import AppInput from '../components/ui/AppInput';
import AppButton from '../components/ui/AppButton';
import HeaderGradient from '../components/ui/HeaderGradient';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
    const { userInfo, setUserInfo, logout } = useContext(AuthContext);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        specialization: '',
        phone_number: '',
        bio: '',
        hospital_id: ''
    });

    useEffect(() => {
        if (userInfo) {
            setProfile({
                username: userInfo.username || '',
                email: userInfo.email || '',
                specialization: userInfo.specialization || '',
                phone_number: userInfo.phone_number || '',
                bio: userInfo.bio || '',
                hospital_id: userInfo.hospital_id || ''
            });
        }
    }, [userInfo]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = { ...profile };
            if (!payload.hospital_id || payload.hospital_id.trim() === '') {
                payload.hospital_id = null;
            }

            const res = await api.put('/users/profile/', payload);
            if (res.data) {
                setUserInfo(res.data);
                await AsyncStorage.setItem('userInfo', JSON.stringify(res.data));
                Alert.alert('Analysis Synchronized', 'Registry records updated successfully.');
            }
        } catch (e) {
            console.error("Profile save error:", e);
            Alert.alert('Protocol Error', 'Failed to update credentials in the clinical registry.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            "System Logout",
            "Terminate active clinical session?",
            [
                { text: "Continue Session", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: () => logout()
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView 
                    contentContainerStyle={styles.scrollContent} 
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <HeaderGradient height={100}>
                        <View style={styles.headerContent}>
                            <View style={styles.profileRow}>
                                <View style={styles.avatarCircle}>
                                    <Image 
                                        source={
                                            userInfo?.role === 'DOCTOR' ? require('../assets/images/Doctor.png') :
                                            userInfo?.role === 'PHARMACIST' ? require('../assets/images/Pharmassist.png') :
                                            require('../assets/images/Admin.png')
                                        } 
                                        style={{ width: 24, height: 24, borderRadius: 12 }}
                                    />
                                </View>
                                
                                <Text style={styles.headerName}>
                                    {userInfo?.role === 'DOCTOR' ? 'Dr. ' : ''}{profile.username?.split(' ')[0] || 'User'}
                                </Text>

                                <View style={styles.rolePill}>
                                    <Text style={styles.rolePillText}>{userInfo?.role}</Text>
                                </View>
                            </View>
                        </View>
                    </HeaderGradient>

                    <View style={styles.mainContent}>
                        <AppCard style={styles.compactCard}>
                            <View style={styles.fields}>
                                <AppInput
                                    label="CLINICAL IDENTITY (FULL NAME)"
                                    value={profile.username}
                                    onChangeText={(t) => setProfile({ ...profile, username: t })}
                                    icon={<Ionicons name="person-outline" size={18} color={Colors.primary} />}
                                    style={styles.inputField}
                                />
                                <AppInput
                                    label="INSTITUTIONAL EMAIL"
                                    value={profile.email}
                                    editable={false}
                                    icon={<Ionicons name="mail-outline" size={18} color={Colors.primary} />}
                                    style={styles.disabledInput}
                                />
                                {userInfo?.role === 'DOCTOR' && (
                                    <AppInput
                                        label="MEDICAL SPECIALIZATION"
                                        placeholder="e.g. Clinical Pharmacist / MD"
                                        value={profile.specialization}
                                        onChangeText={(t) => setProfile({ ...profile, specialization: t })}
                                        icon={<Ionicons name="medical-outline" size={18} color={Colors.primary} />}
                                        style={styles.inputField}
                                    />
                                )}
                                <AppInput
                                    label="EMERGENCY CONTACT / PHONE"
                                    placeholder="Direct connectivity line"
                                    value={profile.phone_number}
                                    keyboardType="phone-pad"
                                    onChangeText={(t) => setProfile({ ...profile, phone_number: t })}
                                    icon={<Ionicons name="call-outline" size={18} color={Colors.primary} />}
                                    style={styles.inputField}
                                />
                                <AppInput
                                    label="CLINICAL PORTFOLIO / BIO"
                                    placeholder="Brief professional summary..."
                                    value={profile.bio}
                                    multiline={true}
                                    numberOfLines={3}
                                    onChangeText={(t) => setProfile({ ...profile, bio: t })}
                                    icon={<Ionicons name="document-text-outline" size={18} color={Colors.primary} />}
                                    style={styles.inputField}
                                />
                            </View>

                            <View style={styles.actions}>
                                <AppButton
                                    title="Update Profile"
                                    onPress={handleSave}
                                    loading={saving}
                                    style={styles.saveButton}
                                />
                                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                                    <Ionicons name="log-out" size={18} color={Colors.danger} />
                                    <Text style={styles.logoutButtonText}>Logout</Text>
                                </TouchableOpacity>
                            </View>
                        </AppCard>
                    </View>
                    
                    <Text style={styles.versionTag}>MediSentry Secure Protocol v2.5.4</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12, // Necessary gap between elements
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: Colors.white,
    },
    headerName: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.white,
    },
    rolePill: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    rolePillText: {
        fontSize: 10,
        fontWeight: '900',
        color: Colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cameraBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mainContent: {
        paddingHorizontal: Spacing.md,
        marginTop: Spacing.sm,
    },
    compactCard: {
        padding: Spacing.md,
        borderRadius: Sizes.radiusMd,
    },
    fields: {
        gap: 0,
    },
    inputField: {
        marginBottom: 6,
    },
    disabledInput: {
        backgroundColor: '#F1F5F9',
        marginBottom: 6,
    },
    actions: {
        marginTop: Spacing.md,
    },
    saveButton: {
        borderRadius: Sizes.radiusMd,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        marginTop: 6,
    },
    logoutButtonText: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.danger,
        marginLeft: 8,
    },
    versionTag: {
        textAlign: 'center',
        fontSize: 9,
        color: Colors.textSecondary,
        marginTop: 10,
        marginBottom: 20,
        fontWeight: '600',
    }
});

export default ProfileScreen;
