import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, ActivityIndicator, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppCard from '../components/ui/AppCard';
import AppButton from '../components/ui/AppButton';
import HeaderGradient from '../components/ui/HeaderGradient';
import { Ionicons } from '@expo/vector-icons';

const AdminSummaryScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { logout, userInfo } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            else setRefreshing(true);
            const res = await api.get('/prescriptions/analytics/');
            setStats(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        fetchAnalytics(true);
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const Bar = ({ label, value, max }) => {
        const widthPercent = max > 0 ? (value / max) * 100 : 0;
        return (
            <View style={styles.barItem}>
                <View style={styles.barHeader}>
                    <Text style={styles.barLabel}>{label}</Text>
                    <Text style={styles.barValue}>{value} High Risk</Text>
                </View>
                <View style={styles.barBackground}>
                    <View style={[styles.barFill, { width: `${widthPercent}%` }]} />
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            
            <HeaderGradient height={100}>
                <View style={[styles.header, { paddingTop: 0, justifyContent: 'space-between', flex: 1 }]}>
                    <TouchableOpacity 
                        style={styles.profileSection}
                        onPress={() => navigation.navigate('AdminProfile')}
                    >
                        <View style={styles.avatar}>
                            <Image 
                                source={require('../assets/images/Admin.png')} 
                                style={{ width: 28, height: 28, borderRadius: 14 }}
                            />
                        </View>
                        <View>
                            <Text style={styles.greeting}>Governance Portal</Text>
                            <Text style={styles.userName}>System Admin</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.notificationBtn}
                        onPress={() => navigation.navigate('AdminProfile')}
                    >
                        <View style={styles.iconCircle}>
                            <Ionicons name="settings-outline" size={22} color={Colors.white} />
                        </View>
                    </TouchableOpacity>
                </View>
            </HeaderGradient>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
                }
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.loadingText}>Fetching infrastructure data...</Text>
                    </View>
                ) : (
                    <>
                        <AppButton 
                            title="View Detailed Audit Logs" 
                            variant="primary"
                            icon={<Ionicons name="list" size={18} color={Colors.white} />}
                            onPress={() => navigation.navigate('AdminHistory')}
                            style={styles.auditBtn}
                        />

                        <View style={styles.statsGrid}>
                            <AppCard style={styles.statCard}>
                                <Ionicons name="document-text" size={20} color={Colors.primary} />
                                <Text style={styles.statNumber}>{stats?.total_prescriptions || 0}</Text>
                                <Text style={styles.statLabel}>Total Logs</Text>
                            </AppCard>
                            <AppCard style={styles.statCard}>
                                <Ionicons name="warning" size={20} color={Colors.danger} />
                                <Text style={styles.statNumber}>{Math.round(stats?.high_risk_rate || 0)}%</Text>
                                <Text style={styles.statLabel}>Risk Rate</Text>
                            </AppCard>
                        </View>

                        <View style={styles.statsGrid}>
                            <AppCard style={styles.statCard}>
                                <Ionicons name="flash" size={20} color={Colors.secondary} />
                                <Text style={styles.statNumber}>{stats?.emergency_frequency || 0}</Text>
                                <Text style={styles.statLabel}>Overrides</Text>
                            </AppCard>
                            <AppCard style={styles.statCard}>
                                <Ionicons name="timer" size={20} color={Colors.success} />
                                <Text style={styles.statNumber}>12m</Text>
                                <Text style={styles.statLabel}>Avg Review</Text>
                            </AppCard>
                        </View>

                        <AppCard style={styles.chartCard}>
                            <View style={styles.cardHeader}>
                                <Ionicons name="analytics" size={20} color={Colors.primary} />
                                <Text style={styles.cardTitle}>Risk Activity by Practitioner</Text>
                            </View>
                            <View style={styles.barList}>
                                {stats?.doctor_breakdown?.map((doc, idx) => (
                                    <Bar
                                        key={idx}
                                        label={`Dr. ${doc.doctor__username}`}
                                        value={doc.high_risk}
                                        max={stats.total_prescriptions}
                                    />
                                ))}
                                {(!stats?.doctor_breakdown || stats.doctor_breakdown.length === 0) && (
                                    <Text style={styles.emptyText}>No practitioner data available.</Text>
                                )}
                            </View>
                        </AppCard>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl, // Balanced padding
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
    userName: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.white,
    },
    notificationBtn: {
        padding: 4,
        marginLeft: Spacing.md, // Clear gap from heading
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl, // Synchronized with header
        paddingTop: 0,
        paddingBottom: 100,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    loadingText: {
        marginTop: Spacing.md,
        color: Colors.textSecondary,
        fontWeight: '700',
    },
    auditBtn: {
        marginTop: Spacing.xl,
        marginBottom: Spacing.xl,
        width: '100%',
        alignSelf: 'center',
        ...Shadow.medium,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.lg,
        gap: Spacing.md,
    },
    statCard: {
        flex: 1,
        padding: Spacing.lg,
        alignItems: 'center',
        ...Shadow.light,
        borderColor: Colors.border,
        borderWidth: 1,
    },
    statNumber: {
        fontSize: 32,
        fontWeight: '900',
        color: Colors.text,
        marginTop: Spacing.sm,
    },
    statLabel: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    chartCard: {
        marginTop: Spacing.sm,
        padding: Spacing.lg,
        ...Shadow.light,
        borderColor: Colors.border,
        borderWidth: 1,
        marginBottom: Spacing.xl,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.text,
        marginLeft: 8,
    },
    barList: {
        width: '100%',
    },
    barItem: {
        marginBottom: Spacing.lg,
    },
    barHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    barLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
    },
    barValue: {
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    barBackground: {
        height: 10,
        backgroundColor: '#F1F5F9', // Light slate
        borderRadius: 5,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: Colors.danger, // Distinct danger color for bars
        borderRadius: 5,
    },
    emptyText: {
        textAlign: 'center',
        color: Colors.textSecondary,
        opacity: 0.5,
        fontSize: 14,
        fontStyle: 'italic',
    }
});

export default AdminSummaryScreen;
