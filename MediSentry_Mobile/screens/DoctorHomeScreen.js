import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppCard from '../components/ui/AppCard';
import AppButton from '../components/ui/AppButton';
import HeaderGradient from '../components/ui/HeaderGradient';
import { Ionicons } from '@expo/vector-icons';

const DoctorHomeScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { logout, userInfo } = useContext(AuthContext);
    const [stats, setStats] = useState({ highRisk: 0, pending: 0 });
    const [notificationCount, setNotificationCount] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            const [statsRes, notificationsRes] = await Promise.all([
                api.get('/prescriptions/summary/'),
                api.get('/users/notifications/')
            ]);

            setStats({
                highRisk: statsRes.data.high_risk || 0,
                pending: statsRes.data.pending || 0
            });

            if (notificationsRes.data) {
                const unread = notificationsRes.data.filter(n => !n.is_read).length;
                setNotificationCount(unread);
            }
        } catch (e) {
            console.error("Dashboard Fetch Error:", e);
        } finally {
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            <ScrollView
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={() => fetchStats(true)} 
                        colors={[Colors.primary]} 
                        tintColor={Colors.primary} 
                    />
                }
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header Section */}
                <HeaderGradient height={100}>
                    <View style={[styles.header, { paddingTop: 0, justifyContent: 'space-between', flex: 1 }]}>
                        <TouchableOpacity 
                            style={styles.profileSection} 
                            onPress={() => navigation.navigate('DoctorProfile')}
                        >
                            <View style={styles.avatar}>
                                <Image 
                                    source={require('../assets/images/Doctor.png')} 
                                    style={{ width: 28, height: 28, borderRadius: 14 }}
                                />
                            </View>
                            <View>
                                <Text style={styles.greeting}>Welcome back,</Text>
                                <Text style={styles.doctorName}>Dr. {userInfo?.username?.split(' ')[0] || 'Clinician'}</Text>
                            </View>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.notificationBtn}
                            onPress={() => navigation.navigate('DoctorNotifications')}
                        >
                            <View style={styles.iconCircle}>
                                <Ionicons name="notifications-outline" size={22} color={Colors.white} />
                                {notificationCount > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </HeaderGradient>

                {/* Focus Cards */}
                <View style={styles.focusContainer}>
                    <AppCard style={[styles.focusCard, { borderColor: Colors.danger, borderWidth: 1, backgroundColor: Colors.white }]}>
                        <View style={styles.focusHeader}>
                            <View style={[styles.focusIconBg, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                <Ionicons name="warning" size={18} color={Colors.danger} />
                            </View>
                            <Text style={[styles.focusLabel, { color: Colors.danger }]}>High Risk</Text>
                        </View>
                        <Text style={styles.focusNumber}>{stats.highRisk}</Text>
                        <Text style={styles.focusSubtitle}>Critical Prescriptions</Text>
                    </AppCard>

                    <AppCard style={[styles.focusCard, { borderColor: Colors.secondary || Colors.warning, borderWidth: 1, backgroundColor: Colors.white }]}>
                        <View style={styles.focusHeader}>
                            <View style={[styles.focusIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                                <Ionicons name="time" size={18} color={Colors.warning} />
                            </View>
                            <Text style={[styles.focusLabel, { color: Colors.warning }]}>Pending</Text>
                        </View>
                        <Text style={styles.focusNumber}>{stats.pending}</Text>
                        <Text style={styles.focusSubtitle}>Awaiting Review</Text>
                    </AppCard>
                </View>

                {/* Dashboard Menu */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Dashboard Menu</Text>
                    
                    <TouchableOpacity 
                        style={styles.menuTile}
                        onPress={() => navigation.navigate('PrescriptionEntry')}
                        activeOpacity={0.7}
                    >
                        <AppCard style={styles.tileContent}>
                            <View style={[styles.tileIconWrapper, { backgroundColor: 'rgba(86, 7, 119, 0.1)' }]}>
                                <Ionicons name="analytics" size={24} color={Colors.primary} />
                            </View>
                            <View style={styles.tileInfo}>
                                <Text style={styles.tileTitle}>AI Risk Analysis</Text>
                                <Text style={styles.tileSubtitle}>Validate new prescriptions</Text>
                            </View>
                            <View style={styles.chevronWrapper}>
                                <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                            </View>
                        </AppCard>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuTile}
                        onPress={() => navigation.navigate('DoctorHistory')}
                        activeOpacity={0.7}
                    >
                        <AppCard style={styles.tileContent}>
                            <View style={[styles.tileIconWrapper, { backgroundColor: 'rgba(40, 0, 92, 0.1)' }]}>
                                <Ionicons name="folder-open" size={24} color={Colors.secondary || Colors.primaryDark} />
                            </View>
                            <View style={styles.tileInfo}>
                                <Text style={styles.tileTitle}>Patient History</Text>
                                <Text style={styles.tileSubtitle}>Access clinical records</Text>
                            </View>
                            <View style={styles.chevronWrapper}>
                                <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                            </View>
                        </AppCard>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuTile}
                        onPress={() => navigation.navigate('DoctorNotifications')}
                        activeOpacity={0.7}
                    >
                        <AppCard style={styles.tileContent}>
                            <View style={[styles.tileIconWrapper, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                <Ionicons name="alert-circle" size={24} color={Colors.danger} />
                            </View>
                            <View style={styles.tileInfo}>
                                <Text style={styles.tileTitle}>Alert Center</Text>
                                <Text style={styles.tileSubtitle}>Pharmacist feedbacks</Text>
                            </View>
                            <View style={styles.chevronWrapper}>
                                <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                            </View>
                        </AppCard>
                    </TouchableOpacity>
                </View>
                
                <View style={styles.infoBanner}>
                    <View style={styles.infoIconBg}>
                        <Ionicons name="shield-checkmark" size={18} color={Colors.success} />
                    </View>
                    <Text style={styles.infoText}>MediSentry AI is currently monitoring patient safety.</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingBottom: 100, // Account for Tab Bar
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
        borderWidth: 1.5,
        borderColor: Colors.white,
    },
    iconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    greeting: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    doctorName: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.white,
    },
    notificationBtn: {
        padding: 2,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: Colors.danger,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.white,
    },
    badgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: 'bold',
    },
    focusContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        justifyContent: 'space-between',
        marginTop: Spacing.md, // Compact spacing
        marginBottom: Spacing.lg,
        gap: Spacing.md,
    },
    focusCard: {
        flex: 1,
        padding: Spacing.md,
        alignItems: 'flex-start',
        ...Shadow.medium,
    },
    focusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    focusIconBg: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    focusLabel: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    focusNumber: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.text,
    },
    focusSubtitle: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '600',
        marginTop: 2,
    },
    menuSection: {
        paddingHorizontal: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    menuTile: {
        marginBottom: Spacing.md,
    },
    tileContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        ...Shadow.light,
    },
    tileIconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 25, // Circular
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    tileInfo: {
        flex: 1,
    },
    tileTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 4,
    },
    tileSubtitle: {
        fontSize: 13,
        fontWeight: '500',
        color: Colors.textSecondary,
    },
    chevronWrapper: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoBanner: {
        flexDirection: 'row',
        backgroundColor: '#F0FDF4', // Very light green
        marginHorizontal: Spacing.lg,
        padding: Spacing.md,
        borderRadius: Sizes.radiusMd,
        alignItems: 'center',
        marginTop: Spacing.sm,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: '#DCFCE7',
    },
    infoIconBg: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#DCFCE7',
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: 12,
        color: '#166534',
        fontWeight: '700',
        lineHeight: 18,
    }
});

export default DoctorHomeScreen;
