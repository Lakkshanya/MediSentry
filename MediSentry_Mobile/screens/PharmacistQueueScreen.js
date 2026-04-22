import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppCard from '../components/ui/AppCard';
import HeaderGradient from '../components/ui/HeaderGradient';
import { Ionicons } from '@expo/vector-icons';

const PharmacistQueueScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const { userInfo } = useContext(AuthContext);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPrescriptions = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            else setRefreshing(true);
            const res = await api.get('/prescriptions/');
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

            <HeaderGradient height={110}>
                <View style={[styles.header, { paddingTop: Spacing.sm }]}>
                    <Text style={styles.headerTitle}>Full Prescription Queue</Text>
                    <TouchableOpacity onPress={onRefresh}>
                        <Ionicons name="refresh" size={20} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </HeaderGradient>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        data={prescriptions}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="documents-outline" size={48} color={Colors.border} />
                                <Text style={styles.emptyText}>No pending prescriptions in the entire queue.</Text>
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.white,
    },
    content: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: 100,
    },
    cardWrapper: {
        marginBottom: Spacing.md,
    },
    card: {
        padding: 0,
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
        backgroundColor: '#F8FAFC',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    patientInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
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
        fontSize: 15,
        fontWeight: '700',
        color: Colors.text,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
    },
    badgePending: { backgroundColor: 'rgba(86, 7, 119, 0.08)' },
    badgeFlagged: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    badgeReview: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
    badgeText: {
        fontSize: 9,
        fontWeight: '900',
        textTransform: 'uppercase',
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
        fontSize: 9,
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    doctorName: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.text,
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
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: Spacing.md,
        textAlign: 'center',
    }
});

export default PharmacistQueueScreen;
