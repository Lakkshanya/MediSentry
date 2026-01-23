import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, StatusBar, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import api from '../services/api';

const AdminAuditTimelineScreen = ({ navigation }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchLogs = async (isRefresh = false) => {
        try {
            if (!isRefresh) setLoading(true);
            else setRefreshing(true);
            const res = await api.get('/prescriptions/audit/');
            setLogs(res.data);
            setError(null);
        } catch (e) {
            console.error(e);
            setError(e.message || "Failed to fetch logs");
            Alert.alert("Network Error", "Could not connect to the audit API. Check if server is running on 0.0.0.0:8000");
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

    const renderLog = ({ item }) => {
        const isActionDoctor = item.action.includes('DOCTOR') || item.action.includes('SUBMITTED');
        const isActionPharmacist = item.action.includes('PHARMACIST');
        const icon = isActionDoctor ? '🩺' : (isActionPharmacist ? '💊' : '⚙️');
        const color = isActionDoctor ? '#1a73e8' : (isActionPharmacist ? '#d32f2f' : '#666');

        return (
            <View style={styles.logCard}>
                <View style={[styles.timelineLine, { backgroundColor: color + '22' }]} />
                <View style={[styles.iconDot, { backgroundColor: color }]}>
                    <Text style={{ fontSize: 12 }}>{icon}</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.logHeader}>
                        <Text style={styles.actor}>{item.actor}</Text>
                        <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <Text style={[styles.action, { color }]}>{item.action.replace(/_/g, ' ')}</Text>
                    <Text style={styles.rxId}>Prescription ID: #{item.rx_id}</Text>

                    {item.details && (
                        <View style={styles.detailsBox}>
                            {Object.entries(item.details).map(([key, val]) => (
                                <Text key={key} style={styles.detailText}>
                                    <Text style={{ fontWeight: 'bold' }}>{key}:</Text> {String(val)}
                                </Text>
                            ))}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View style={styles.headerBox}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Audit Timeline</Text>
                <Text style={styles.subtitle}>Hospital Governance & Accountability</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 20 }} />
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={fetchLogs} style={styles.retryBtn}>
                        <Text style={{ color: '#fff' }}>Retry</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={logs}
                    renderItem={renderLog}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    ListEmptyComponent={<Text style={styles.empty}>No audit logs available.</Text>}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a73e8']} />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    headerBox: { padding: 25, paddingTop: 40, backgroundColor: '#fff', elevation: 2, borderBottomWidth: 1, borderBottomColor: '#eee' },
    backBtn: { marginBottom: 10 },
    backText: { color: '#1a73e8', fontWeight: 'bold' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    subtitle: { fontSize: 13, color: '#666', marginTop: 4 },
    logCard: { flexDirection: 'row', marginBottom: 25, paddingLeft: 10 },
    timelineLine: { position: 'absolute', left: 24, top: 40, bottom: -25, width: 2 },
    iconDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', zIndex: 1, elevation: 2 },
    content: { flex: 1, marginLeft: 15, backgroundColor: '#f9f9f9', padding: 15, borderRadius: 15, borderWidth: 1, borderColor: '#eee' },
    logHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    actor: { fontWeight: 'bold', color: '#333', fontSize: 14 },
    time: { fontSize: 11, color: '#999' },
    action: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
    rxId: { fontSize: 11, color: '#666', marginTop: 2 },
    detailsBox: { marginTop: 10, padding: 8, backgroundColor: '#fff', borderRadius: 5, borderWidth: 1, borderColor: '#eee' },
    detailText: { fontSize: 11, color: '#444' },
    empty: { textAlign: 'center', marginTop: 50, color: '#999', fontStyle: 'italic' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: '#d32f2f', marginBottom: 15 },
    retryBtn: { backgroundColor: '#1a73e8', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }
});

export default AdminAuditTimelineScreen;
