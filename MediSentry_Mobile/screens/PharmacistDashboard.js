import React, { useContext, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar, ActivityIndicator, RefreshControl } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const PharmacistDashboard = ({ navigation }) => {
    const { logout, userInfo } = useContext(AuthContext);
    const [prescriptions, setPrescriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchPrescriptions = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            else setRefreshing(true);
            const res = await api.get('/prescriptions/');
            // Filter for PENDING or just show all for pharmacist review
            const pending = res.data.filter(p => p.status === 'PENDING' || p.status === 'FLAGGED');
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
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('VerificationDetail', { prescription: item })}
        >
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.patientName}>{item.patient_name || `Patient #${item.patient}`}</Text>
                    <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <View style={[styles.badge, item.status === 'FLAGGED' && { backgroundColor: '#ffebee' }]}>
                    <Text style={[styles.badgeText, item.status === 'FLAGGED' && { color: '#d32f2f' }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.drugList}>
                {item.drugs && item.drugs.map((d, i) => (
                    <Text key={i} style={styles.drugText}>• {d.drug_name || d.drug}</Text>
                ))}
            </View>

            <View style={styles.footer}>
                <Text style={styles.doctorName}>Dr. {item.doctor_name || 'System'}</Text>
                <Text style={styles.actionText}>Review &rarr;</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#00695c" />

            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Pharmacy Portal</Text>
                    <Text style={styles.subTitle}>Welcome, {userInfo?.username || 'Pharmacist'}</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>{prescriptions.length}</Text>
                        <Text style={styles.statLabel}>Pending</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNum}>-{/* Real stats would need a report endpoint */}</Text>
                        <Text style={styles.statLabel}>Verified</Text>
                    </View>
                </View>

                <Text style={styles.sectionHeader}>Priority Queue</Text>
                {loading ? (
                    <ActivityIndicator size="large" color="#00695c" style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={prescriptions}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#999', marginTop: 20 }}>No pending prescriptions</Text>}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#00695c']} />
                        }
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    header: { backgroundColor: '#00695c', padding: 25, paddingTop: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    subTitle: { color: '#b2dfdb', fontSize: 13 },
    logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
    logoutText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    content: { flex: 1, padding: 20 },
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25, backgroundColor: '#fff', padding: 15, borderRadius: 15, elevation: 2 },
    statItem: { alignItems: 'center', flex: 1 },
    statNum: { fontSize: 24, fontWeight: 'bold', color: '#00695c' },
    statLabel: { fontSize: 12, color: '#666' },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    patientName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    timestamp: { fontSize: 12, color: '#888', marginTop: 2 },
    badge: { backgroundColor: '#fff3e0', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 10, fontWeight: 'bold', color: '#ef6c00' },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
    drugList: { marginBottom: 10 },
    drugText: { fontSize: 14, color: '#555', lineHeight: 20 },
    footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
    doctorName: { fontSize: 12, color: '#999', fontStyle: 'italic' },
    actionText: { fontSize: 14, fontWeight: 'bold', color: '#00695c' }
});

export default PharmacistDashboard;
