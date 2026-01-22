import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { mockHistory } from '../services/mockData';

const HistoryScreen = () => {
    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.patient}>{item.patient}</Text>
                <Text style={[
                    styles.badge,
                    { backgroundColor: item.risk === 'HIGH' ? '#ffebee' : '#e8f5e9', color: item.risk === 'HIGH' ? '#c62828' : '#2e7d32' }
                ]}>{item.risk}</Text>
            </View>
            <Text style={styles.details}>Rx #{item.id} • {item.date}</Text>
            <Text style={styles.drug}>{item.drug}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Patient History</Text>
            <FlatList
                data={mockHistory}
                keyExtractor={item => item.id.toString()}
                renderItem={renderItem}
            />
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
