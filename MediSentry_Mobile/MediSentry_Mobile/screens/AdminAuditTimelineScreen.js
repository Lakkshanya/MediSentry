import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, StatusBar, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppCard from '../components/ui/AppCard';
import AppButton from '../components/ui/AppButton';
import HeaderGradient from '../components/ui/HeaderGradient';
import { Ionicons } from '@expo/vector-icons';

const AdminAuditTimelineScreen = ({ navigation }) => {
    const insets = useSafeAreaInsets();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [prescriptionMap, setPrescriptionMap] = useState({});

    const fetchLogs = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            else setRefreshing(true);
            
            // Fetch both logs and prescriptions to ensure "proper retrieval"
            const [logsRes, rxRes] = await Promise.all([
                api.get('/prescriptions/audit/'),
                api.get('/prescriptions/')
            ]);

            // Create a mapping: ID -> Current Risk Level
            const rxMap = {};
            rxRes.data.forEach(rx => {
                rxMap[rx.id] = rx.risk_level;
            });
            setPrescriptionMap(rxMap);
            setLogs(logsRes.data);
            setError(null);
        } catch (e) {
            console.error(e);
            setError(e.message || "Failed to fetch logs");
            Alert.alert("Analytics Error", "Timed out while connecting to the audit API. Please verify governance services status.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        fetchLogs(true);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const renderLog = ({ item, index }) => {
        const isActionDoctor = item.action.includes('DOCTOR') || item.action.includes('SUBMITTED');
        const isActionPharmacist = item.action.includes('PHARMACIST');
        const iconName = isActionDoctor ? 'medical-outline' : (isActionPharmacist ? 'medkit-outline' : 'shield-outline');
        const actionColor = isActionDoctor ? Colors.primary : (isActionPharmacist ? Colors.danger : Colors.textSecondary);

        // Proper retrieval from live prescription data
        const currentRiskLevel = prescriptionMap[item.rx_id] || item.details?.risk_level || 'SAFE';

        return (
            <View style={styles.logWrapper}>
                <View style={styles.timelineContainer}>
                    <View style={[styles.timelineIcon, { borderColor: actionColor }]}>
                        <Ionicons name={iconName} size={14} color={actionColor} />
                    </View>
                    {index !== logs.length - 1 && <View style={styles.timelineConnector} />}
                </View>

                <AppCard style={styles.logCard}>
                    <View style={styles.logHeader}>
                        <View style={styles.actorInfo}>
                            <Text style={styles.actorName}>{item.actor}</Text>
                            <Text style={styles.timestamp}>
                                {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                        <View style={styles.actionBadgeGroup}>
                             <View style={[styles.actionBadge, { backgroundColor: actionColor + '15' }]}>
                                  <Text style={[styles.actionText, { color: actionColor }]}>{item.action.split('_')[0]}</Text>
                             </View>
                             {currentRiskLevel && (
                                 <View style={[styles.riskBadge, { 
                                     backgroundColor: currentRiskLevel === 'HIGH' ? Colors.danger + '15' : 
                                                     (currentRiskLevel === 'MEDIUM' ? Colors.warning + '15' : Colors.success + '15'),
                                     borderColor: currentRiskLevel === 'HIGH' ? Colors.danger : 
                                                 (currentRiskLevel === 'MEDIUM' ? Colors.warning : Colors.success)
                                 }]}>
                                     <Text style={[styles.riskText, { 
                                         color: currentRiskLevel === 'HIGH' ? Colors.danger : 
                                                (currentRiskLevel === 'MEDIUM' ? Colors.warning : Colors.success)
                                     }]}>{currentRiskLevel}</Text>
                                 </View>
                             )}
                        </View>
                    </View>

                    <Text style={styles.actionDetail}>{item.action.replace(/_/g, ' ')}</Text>
                    <View style={styles.rxRef}>
                        <Ionicons name="receipt-outline" size={12} color={Colors.textSecondary} />
                        <Text style={styles.rxId}>RX-ID: {item.rx_id}</Text>
                    </View>

                    {item.details && Object.keys(item.details).length > 0 && (
                        <View style={styles.detailsContainer}>
                            {Object.entries(item.details).filter(([k]) => k !== 'risk_level').map(([key, val]) => (
                                <View key={key} style={styles.detailRow}>
                                    <Text style={styles.detailKey}>{key}:</Text>
                                    <Text style={styles.detailVal}>{String(val)}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </AppCard>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            
            <HeaderGradient height={110}>
                <View style={[styles.header, { paddingTop: Spacing.sm }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <View style={styles.titleGroup}>
                        <Text style={styles.title}>Audit Timeline</Text>
                        <Text style={styles.subtitle}>Hospital Governance Protocol</Text>
                    </View>
                    <TouchableOpacity onPress={() => fetchLogs()} style={styles.refreshBtn}>
                        <Ionicons name="refresh" size={20} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </HeaderGradient>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loaderText}>Retrieving clinical audit logs...</Text>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Ionicons name="cloud-offline-outline" size={64} color={Colors.border} />
                    <Text style={styles.errorTitle}>System Disconnected</Text>
                    <Text style={styles.errorText}>{error}</Text>
                    <AppButton 
                        title="Retry Connection" 
                        onPress={fetchLogs} 
                        style={styles.retryBtn} 
                    />
                </View>
            ) : (
                <FlatList
                    data={logs}
                    renderItem={renderLog}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={<View style={{ height: 10 }} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="documents-outline" size={48} color={Colors.border} />
                            <Text style={styles.emptyText}>No audit activity recorded.</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
                    }
                />
            )}
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.xl,
    },
    backBtn: {
        padding: Spacing.xs,
    },
    titleGroup: {
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.white,
    },
    subtitle: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
        marginTop: 2,
    },
    refreshBtn: {
        padding: Spacing.xs,
    },
    listContent: {
        paddingHorizontal: Spacing.xl,
        paddingTop: 0, 
        marginTop: Spacing.md, // Move below header with clean gap
        paddingBottom: Spacing.xxl,
    },
    logWrapper: {
        flexDirection: 'row',
        marginBottom: Spacing.lg,
    },
    timelineContainer: {
        width: 36,
        alignItems: 'center',
        marginRight: 10,
    },
    timelineIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    timelineConnector: {
        width: 2,
        flex: 1,
        backgroundColor: '#E2E8F0', // Slate 200
        position: 'absolute',
        top: 32,
        bottom: -Spacing.lg - 4,
        zIndex: 1,
    },
    logCard: {
        flex: 1,
        padding: Spacing.lg,
        marginBottom: 8,
        borderRadius: Sizes.radiusMd,
        borderColor: Colors.border,
        borderWidth: 1,
        ...Shadow.light,
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    actorInfo: {
        flex: 1,
    },
    actorName: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.text,
    },
    timestamp: {
        fontSize: 10,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    actionBadgeGroup: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 4,
    },
    actionBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    riskBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
    },
    riskText: {
        fontSize: 9,
        fontWeight: '900',
    },
    actionText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    actionDetail: {
        fontSize: 13,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 4,
    },
    rxRef: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    rxId: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontWeight: '700',
    },
    detailsContainer: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        backgroundColor: '#F8FAFC',
        padding: Spacing.sm,
        borderRadius: Sizes.radiusMd,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    detailRow: {
        flexDirection: 'row',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    detailKey: {
        fontSize: 12,
        fontWeight: '800',
        color: Colors.textSecondary,
        width: 80,
    },
    detailVal: {
        fontSize: 12,
        color: Colors.text,
        fontWeight: '500',
        flex: 1,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderText: {
        marginTop: Spacing.md,
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: Colors.text,
        marginTop: Spacing.lg,
        marginBottom: 4,
    },
    errorText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    retryBtn: {
        minWidth: 180,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        marginTop: Spacing.md,
        fontStyle: 'italic',
    }
});

export default AdminAuditTimelineScreen;
