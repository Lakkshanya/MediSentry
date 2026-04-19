import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, StatusBar, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppCard from '../components/ui/AppCard';
import HeaderGradient from '../components/ui/HeaderGradient';
import { Ionicons } from '@expo/vector-icons';

const HistoryScreen = ({ navigation }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchHistory = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            else setRefreshing(true);
            const res = await api.get('/prescriptions/');
            // Sort by Date (newest first)
            const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setHistory(sorted);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        fetchHistory(true);
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const renderItem = ({ item }) => {
        const displayRisk = item.risk_level ? item.risk_level.toUpperCase() : 'SAFE';
        const riskColor = displayRisk === 'HIGH' ? Colors.danger : Colors.success;
        
        return (
            <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => navigation.navigate('DoctorPrescriptionDetail', { prescription: item })}
            >
                <AppCard style={styles.historyCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.patientInfo}>
                            <Text style={styles.patientName}>{item.patient_name || `Patient #${item.patient}`}</Text>
                            <Text style={styles.rxDate}>{new Date(item.created_at).toLocaleDateString()} • Rx #{item.id}</Text>
                        </View>
                        <View style={[styles.riskBadge, { backgroundColor: riskColor + '10', borderColor: riskColor, borderWidth: 1 }]}>
                            <Text style={[styles.riskText, { color: riskColor }]}>{displayRisk}</Text>
                        </View>
                    </View>

                    <View style={styles.statusRow}>
                        <Ionicons name="layers-outline" size={14} color={Colors.textSecondary} />
                        <Text style={styles.statusLabel}>STATUS: <Text style={styles.statusValue}>{item.status}</Text></Text>
                    </View>

                    <View style={styles.drugList}>
                        {item.drugs && item.drugs.slice(0, 3).map((d, i) => (
                            <View key={i} style={styles.drugItem}>
                                <Ionicons name="medical-outline" size={12} color={Colors.border} />
                                <Text style={styles.drugName} numberOfLines={1}>
                                    {(d.drug_details && d.drug_details.name) || d.drug_name}
                                </Text>
                            </View>
                        ))}
                        {item.drugs && item.drugs.length > 3 && (
                            <Text style={styles.moreDrugs}>+ {item.drugs.length - 3} more medications</Text>
                        )}
                    </View>

                    <View style={styles.tapIndicator}>
                        <Text style={styles.tapText}>View Analysis</Text>
                        <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
                    </View>
                </AppCard>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            
            <HeaderGradient height={110}>
                <View style={styles.header}>
                    <Text style={styles.title}>History</Text>
                    <Text style={styles.subtitle}>Historical Prescription Records</Text>
                </View>
            </HeaderGradient>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.loaderText}>Accessing medical archives...</Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    contentContainerStyle={styles.listContent}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="archive-outline" size={64} color={Colors.border} />
                            <Text style={styles.emptyTitle}>Registry Empty</Text>
                            <Text style={styles.emptyText}>No submitted prescriptions found in your account history.</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={onRefresh} 
                            tintColor={Colors.primary}
                        />
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
        paddingHorizontal: Spacing.lg,
        justifyContent: 'center',
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.white,
    },
    subtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
        marginTop: 2,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    historyCard: {
        marginBottom: Spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    patientInfo: {
        flex: 1,
    },
    patientName: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.text,
    },
    rxDate: {
        fontSize: 11,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    riskBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    riskText: {
        fontSize: 9,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    statusLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textSecondary,
    },
    statusValue: {
        color: Colors.primary,
        fontWeight: '800',
    },
    drugList: {
        marginTop: Spacing.md,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.offWhite,
    },
    drugItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    drugName: {
        fontSize: 13,
        color: Colors.text,
        marginLeft: 8,
        fontWeight: '500',
    },
    moreDrugs: {
        fontSize: 11,
        color: Colors.textSecondary,
        fontStyle: 'italic',
        marginTop: 2,
    },
    tapIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: Spacing.sm,
    },
    tapText: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.primary,
        marginRight: 4,
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
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
        marginTop: Spacing.lg,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    }
});

export default HistoryScreen;
