import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import api from '../services/api';

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

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('DoctorPrescriptionDetail', { prescription: item })}
        >
            <View style={styles.header}>
                <Text style={styles.patient}>{item.patient_name || `Patient #${item.patient}`}</Text>
                <Text style={[
                    styles.badge,
                    {
                        backgroundColor: item.risk_level === 'HIGH' ? '#ffebee' : (item.risk_level === 'MEDIUM' ? '#fff3e0' : '#e8f5e9'),
                        color: item.risk_level === 'HIGH' ? '#c62828' : (item.risk_level === 'MEDIUM' ? '#ef6c00' : '#2e7d32')
                    }
                ]}>{item.risk_level}</Text>
            </View>
            <Text style={styles.statusLine}>STATUS: {item.status}</Text>
            <Text style={styles.details}>Rx #{item.id} • {new Date(item.created_at).toLocaleDateString()}</Text>
            <View style={styles.drugContainer}>
                {item.drugs && item.drugs.map((d, i) => (
                    <Text key={i} style={styles.drug}>• {(d.drug_details && d.drug_details.name) || d.drug_name}</Text>
                ))}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Prescription Logs</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#1a73e8" style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={history}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text style={styles.emptyText}>No prescriptions found.</Text>}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1a73e8']} />
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#1565c0' },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, shadowColor: '#000', elevation: 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    patient: { fontSize: 16, fontWeight: 'bold' },
    badge: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontWeight: 'bold' },
    details: { fontSize: 12, color: '#888', marginBottom: 5 },
    drug: { fontSize: 14, color: '#333' }
});

export default HistoryScreen;
