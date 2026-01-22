import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Image } from 'react-native';
import api from '../services/api';

const AlternativeSuggestionScreen = ({ route, navigation }) => {
    const { drug } = route.params; // Drug causing interaction
    const [alternatives, setAlternatives] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlternatives();
    }, []);

    const fetchAlternatives = async () => {
        try {
            // Real Endpoint Connection
            const res = await api.get(`/analytics/alternatives/${drug}/`);
            if (res.data && res.data.alternatives) {
                setAlternatives(res.data.alternatives);
            } else {
                setAlternatives(['No specific alternatives found in database.']);
            }
        } catch (e) {
            console.error("Failed to fetch alternatives:", e);
            // Fallback for demo if offline
            setAlternatives(['Consult Pharmacist (Offline Mode)']);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (alt) => {
        // In real app, this would update the prescription context
        alert(`Switched ${drug} to ${alt}`);
        navigation.navigate('DoctorHome');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Safer Alternatives</Text>
                <Text style={styles.subTitle}>Replacing: <Text style={{ fontWeight: 'bold' }}>{drug}</Text></Text>
            </View>

            <View style={styles.content}>
                {loading ? <ActivityIndicator size="large" color="#2e7d32" style={{ marginTop: 50 }} /> : (
                    <>
                        <Text style={styles.sectionHeader}>Recommended Substitutes</Text>
                        <FlatList
                            data={alternatives}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <View style={styles.card}>
                                    <View style={styles.cardLeft}>
                                        <View style={styles.iconBox}>
                                            <Text style={{ fontSize: 20 }}>💊</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.drugName}>{item}</Text>
                                            <Text style={styles.drugMeta}>Class: Anticoagulant</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity style={styles.btn} onPress={() => handleSelect(item)}>
                                        <Text style={styles.btnText}>Select</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />
                    </>
                )}

                <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelText}>Keep Original (Not Recommended)</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    header: { backgroundColor: '#2e7d32', padding: 25, paddingTop: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, alignItems: 'center' },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    subTitle: { color: '#c8e6c9', fontSize: 16, marginTop: 5 },
    content: { flex: 1, padding: 20 },
    sectionHeader: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15, marginLeft: 5 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1 },
    cardLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBox: { width: 45, height: 45, borderRadius: 25, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    drugName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    drugMeta: { fontSize: 12, color: '#888' },
    btn: { backgroundColor: '#2e7d32', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
    cancelBtn: { marginTop: 20, alignItems: 'center', padding: 15 },
    cancelText: { color: '#999', fontSize: 14, textDecorationLine: 'underline' }
});

export default AlternativeSuggestionScreen;
