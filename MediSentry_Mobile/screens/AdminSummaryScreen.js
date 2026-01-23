import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, StatusBar, ActivityIndicator, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const AdminSummaryScreen = ({ navigation }) => {
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

    const Bar = ({ label, value, color, max }) => {
        const widthPercent = max > 0 ? (value / max) * 100 : 0;
        return (
            <View style={{ marginBottom: 15 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#444' }}>{label}</Text>
                    <Text style={{ fontSize: 12, color: '#666' }}>{value} Risk Rx</Text>
                </View>
                <View style={{ height: 10, backgroundColor: '#eee', borderRadius: 5, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${widthPercent}%`, backgroundColor: color, borderRadius: 5 }} />
                </View>
            </View>
        );
    };

    if (loading) return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color="#1a73e8" />
            <Text style={{ marginTop: 10, color: '#666' }}>Loading Hospital Data...</Text>
        </View>
    );

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a73e8']} />
            }
        >
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.header}>Hospital Governance</Text>
                    <Text style={styles.subtitle}>Welcome, Admin {userInfo?.username}</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.auditTrigger}
                onPress={() => navigation.navigate('AdminAuditTimeline')}
            >
                <Text style={styles.auditTriggerText}>📜 View Detailed Audit Logs</Text>
            </TouchableOpacity>

            <View style={styles.grid}>
                <View style={styles.card}>
                    <Text style={styles.statNumber}>{stats?.total_prescriptions || 0}</Text>
                    <Text style={styles.statLabel}>Total Logs</Text>
                </View>
                <View style={[styles.card, { backgroundColor: '#ffebee' }]}>
                    <Text style={[styles.statNumber, { color: '#c62828' }]}>{Math.round(stats?.high_risk_rate || 0)}%</Text>
                    <Text style={styles.statLabel}>High Risk Rate</Text>
                </View>
            </View>

            <View style={styles.grid}>
                <View style={[styles.card, { backgroundColor: '#e3f2fd' }]}>
                    <Text style={[styles.statNumber, { color: '#1565c0' }]}>{stats?.emergency_frequency || 0}</Text>
                    <Text style={styles.statLabel}>Emergency Overrides</Text>
                </View>
                <View style={[styles.card, { backgroundColor: '#e8f5e9' }]}>
                    <Text style={[styles.statNumber, { color: '#2e7d32' }]}>12m</Text>
                    <Text style={styles.statLabel}>Avg. Resolution</Text>
                </View>
            </View>

            <View style={styles.chartCard}>
                <Text style={styles.cardTitle}>Risk Activity by Doctor</Text>
                {stats?.doctor_breakdown?.map((doc, idx) => (
                    <Bar
                        key={idx}
                        label={`Dr. ${doc.doctor__username}`}
                        value={doc.high_risk}
                        max={stats.total_prescriptions}
                        color={doc.high_risk > 5 ? '#d32f2f' : '#1a73e8'}
                    />
                ))}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff', padding: 20 },
    headerRow: { marginTop: 40, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    header: { fontSize: 26, fontWeight: 'bold', color: '#1b5e20' },
    subtitle: { fontSize: 13, color: '#666' },
    logoutBtn: { backgroundColor: '#ffebee', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
    logoutText: { color: '#c62828', fontWeight: 'bold', fontSize: 12 },
    auditTrigger: { backgroundColor: '#e3f2fd', padding: 15, borderRadius: 12, marginBottom: 20, alignItems: 'center', borderContent: '#1565c0', borderWidth: 1, borderStyle: 'dashed' },
    auditTriggerText: { color: '#1565c0', fontWeight: 'bold' },
    grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    card: { width: '48%', backgroundColor: '#f9f9f9', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05 },
    statNumber: { fontSize: 32, fontWeight: '800', color: '#333' },
    statLabel: { color: '#888', fontSize: 11, marginTop: 5, fontWeight: 'bold', textTransform: 'uppercase' },
    chartCard: { backgroundColor: '#f9f9f9', padding: 25, borderRadius: 20, marginBottom: 20, elevation: 2 },
    cardTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 20, color: '#333' }
});

export default AdminSummaryScreen;
