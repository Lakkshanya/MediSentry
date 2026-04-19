import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Image, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppCard from '../components/ui/AppCard';
import AppButton from '../components/ui/AppButton';
import HeaderGradient from '../components/ui/HeaderGradient';
import { Ionicons } from '@expo/vector-icons';

const PharmacistDashboard = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { logout, userInfo } = useContext(AuthContext);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPrescriptions = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            else setRefreshing(true);
            const res = await api.get('/prescriptions/');
            // Filter for PENDING, FLAGGED, or UNDER_REVIEW (doctor responded)
            const pending = res.data.filter(p => ['PENDING', 'FLAGGED', 'UNDER_REVIEW'].includes(p.status));
            setPrescriptions(pending);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        fetchPrescriptions(true);
    };

    useEffect(() => {
        fetchPrescriptions();
        const unsubscribe = navigation.addListener('focus', () => {
            fetchPrescriptions();
        });
        return unsubscribe;
    }, [navigation]);

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('VerificationDetail', { prescription: item })}
            style={styles.cardWrapper}
        >
            <AppCard style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.patientInfo}>
                        <View style={styles.avatarMini}>
                           <Ionicons name="person" size={14} color={Colors.primary} />
                        </View>
                        <Text style={styles.patientName} numberOfLines={1}>{item.patient_name || `Patient #${item.patient}`}</Text>
                    </View>
                    <View style={[
                        styles.badge, 
                        item.status === 'FLAGGED' ? styles.badgeFlagged : 
                        item.status === 'UNDER_REVIEW' ? styles.badgeReview : styles.badgePending
                    ]}>
                        <Text style={[
                            styles.badgeText,
                            item.status === 'FLAGGED' ? styles.badgeTextFlagged : 
                            item.status === 'UNDER_REVIEW' ? styles.badgeTextReview : styles.badgeTextPending
                        ]}>{item.status.replace('_', ' ')}</Text>
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <View style={styles.metaRow}>
                        <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.metaText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                        <Ionicons name="time-outline" size={14} color={Colors.textSecondary} style={{ marginLeft: 10 }} />
                        <Text style={styles.metaText}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    
                    <View style={styles.doctorInfo}>
                        <Text style={styles.doctorLabel}>Prescribed by</Text>
                        <Text style={styles.doctorName}>Dr. {item.doctor_name || 'Clinician'}</Text>
                        <Text style={styles.specText}>{item.doctor_specialization || 'General Practice'}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.actionPrompt}>Review Details</Text>
                    <Ionicons name="chevron-forward" size={18} color={Colors.primary} />
                </View>
            </AppCard>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            <HeaderGradient height={100}>
                <View style={[styles.header, { paddingTop: 0, flex: 1 }]}>
                    <View style={styles.profileSection}>
                        <View style={styles.avatar}>
                            <Image 
                                source={require('../assets/images/Pharmassist.png')} 
                                style={{ width: 28, height: 28, borderRadius: 14 }}
                            />
                        </View>
                        <View>
                            <Text style={styles.greeting}>Pharmacy Portal</Text>
                            <Text style={styles.userName}>{userInfo?.username?.split(' ')[0] || 'Pharmacist'}</Text>
                        </View>
                    </View>
                </View>
            </HeaderGradient>

            <View style={styles.content}>
                <View style={styles.summaryContainer}>
                    <AppCard style={[styles.summaryItem, { borderLeftColor: Colors.warning, borderLeftWidth: 4 }]}>
                        <Text style={styles.summaryNum}>{prescriptions.length}</Text>
                        <Text style={styles.summaryLabel}>Pending Queue</Text>
                    </AppCard>
                    <AppCard style={[styles.summaryItem, { borderLeftColor: Colors.danger, borderLeftWidth: 4 }]}>
                        <Text style={styles.summaryNum}>{prescriptions.filter(p => p.status === 'FLAGGED').length}</Text>
                        <Text style={styles.summaryLabel}>Flagged Alerts</Text>
                    </AppCard>
                </View>

                <View style={styles.queueHeader}>
                    <Text style={styles.sectionTitle}>Prescription Queue</Text>
                    <TouchableOpacity onPress={onRefresh}>
                        <Ionicons name="refresh" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={prescriptions.slice(0, 5)}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="documents-outline" size={48} color={Colors.border} />
                                <Text style={styles.emptyText}>No pending prescriptions for review.</Text>
                            </View>
                        }
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
                        }
                    />
                )}
            </View>
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
    userName: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.white,
    },
    notificationBtn: {
        padding: 2,
    },
    content: {
        flex: 1,
    },
    summaryContainer: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        justifyContent: 'space-between',
        marginTop: Spacing.md, // Compact spacing
        marginBottom: Spacing.lg,
        gap: Spacing.md,
    },
    summaryItem: {
        flex: 1,
        padding: Spacing.md,
        alignItems: 'center',
        ...Shadow.medium,
        backgroundColor: Colors.white,
    },
    summaryNum: {
        fontSize: 28,
        fontWeight: '900',
        color: Colors.text,
    },
    summaryLabel: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 4,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    queueHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 100, // Account for Tab Bar
    },
    cardWrapper: {
        marginBottom: Spacing.md,
    },
    card: {
        padding: 0, // Inner elements handle padding
        overflow: 'hidden',
        borderRadius: Sizes.radiusMd,
        borderColor: Colors.border,
        borderWidth: 1,
        ...Shadow.light,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        backgroundColor: '#F8FAFC', // Distinct background
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    patientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: Spacing.sm,
    },
    avatarMini: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(86, 7, 119, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.xs,
    },
    patientName: {
        fontSize: 16, // Medium size
        fontWeight: '700',
        color: Colors.text,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20, // Pill shape
    },
    badgePending: { backgroundColor: 'rgba(86, 7, 119, 0.08)' },
    badgeFlagged: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    badgeReview: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    badgeTextPending: { color: Colors.primary },
    badgeTextFlagged: { color: Colors.danger },
    badgeTextReview: { color: Colors.secondary },
    cardBody: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    metaText: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginLeft: 4,
    },
    doctorInfo: {
        backgroundColor: Colors.offWhite,
        padding: Spacing.sm,
        borderRadius: 8,
    },
    doctorLabel: {
        fontSize: 10,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    doctorName: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
    },
    specText: {
        fontSize: 12,
        color: Colors.textSecondary,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        backgroundColor: 'rgba(86, 7, 119, 0.02)',
    },
    actionPrompt: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.primary,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: Spacing.md,
        textAlign: 'center',
    }
});

export default PharmacistDashboard;
