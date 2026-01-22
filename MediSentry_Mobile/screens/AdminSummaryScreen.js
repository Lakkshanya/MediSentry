import React from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, StatusBar } from 'react-native';

const AdminSummaryScreen = () => {
    // Simple bar chart component
    const Bar = ({ label, value, color, max }) => {
        const width = (value / max) * 100 + '%';
        return (
            <View style={{ marginBottom: 15 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#555' }}>{label}</Text>
                    <Text style={{ fontSize: 12, color: '#888' }}>{value}</Text>
                </View>
                <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: width, backgroundColor: color, borderRadius: 4 }} />
                </View>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f0f4c3" />

            <Text style={styles.header}>Hospital Analytics</Text>

            <View style={styles.grid}>
                <View style={styles.card}>
                    <Text style={styles.statNumber}>1,240</Text>
                    <Text style={styles.statLabel}>Total Prescriptions</Text>
                </View>
                <View style={[styles.card, { backgroundColor: '#ffebee' }]}>
                    <Text style={[styles.statNumber, { color: '#c62828' }]}>15%</Text>
                    <Text style={styles.statLabel}>High Risk Rate</Text>
                </View>
            </View>

            <View style={styles.chartCard}>
                <Text style={styles.cardTitle}>Departmental Risk Profile</Text>
                <Bar label="Cardiology" value={85} color="#d32f2f" max={100} />
                <Bar label="Oncology" value={60} color="#f57c00" max={100} />
                <Bar label="Pediatrics" value={20} color="#388e3c" max={100} />
                <Bar label="General" value={45} color="#1976d2" max={100} />
            </View>

            <View style={styles.chartCard}>
                <Text style={styles.cardTitle}>Antibiotic Usage</Text>
                <Bar label="Amoxicillin" value={430} color="#00acc1" max={500} />
                <Bar label="Ciprofloxacin" value={210} color="#00acc1" max={500} />
                <Bar label="Azithromycin" value={180} color="#00acc1" max={500} />
            </View>

            <View style={{ height: 20 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4c3', padding: 20 },
    header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#33691e', marginTop: 10 },
    grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    card: { width: '48%', backgroundColor: '#fff', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2 },
    statNumber: { fontSize: 32, fontWeight: 'bold', color: '#333' },
    statLabel: { color: '#666', fontSize: 12, marginTop: 5 },
    chartCard: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 20, elevation: 2 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20, color: '#333' }
});

export default AdminSummaryScreen;
