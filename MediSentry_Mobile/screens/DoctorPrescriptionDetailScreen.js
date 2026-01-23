import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, StatusBar } from 'react-native';
import api from '../services/api';

const DoctorPrescriptionDetailScreen = ({ route, navigation }) => {
    const { prescription } = route.params;
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAction = async (actionType) => {
        setLoading(true);
        try {
            if (actionType === 'SUBMIT_RESPONSE') {
                await api.patch(`/prescriptions/${prescription.id}/`, {
                    doctor_response: response,
                    status: 'UNDER_REVIEW' // Move back to pharmacist review
                });
                Alert.alert('Response Submitted', 'The pharmacist has been notified of your response.');
            } else if (actionType === 'CANCEL') {
                await api.patch(`/prescriptions/${prescription.id}/`, { status: 'REJECTED' });
                Alert.alert('Cancelled', 'Prescription has been cancelled.');
            }
            navigation.goBack();
        } catch (e) {
            Alert.alert('Error', 'Failed to update prescription status.');
        } finally {
            setLoading(false);
        }
    };

    const riskColor = prescription.risk_level === 'HIGH' ? '#d32f2f' : (prescription.risk_level === 'MEDIUM' ? '#f57c00' : '#2e7d32');

    return (
        <ScrollView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            <View style={styles.card}>
                <Text style={styles.label}>PATIENT</Text>
                <Text style={styles.value}>{prescription.patient_name || `Patient #${prescription.patient}`}</Text>

                <View style={styles.badgeRow}>
                    <Text style={[styles.badge, { backgroundColor: riskColor + '22', color: riskColor }]}>
                        {prescription.risk_level} RISK
                    </Text>
                    <Text style={[styles.badge, { backgroundColor: '#1a73e822', color: '#1a73e8' }]}>
                        STATUS: {prescription.status}
                    </Text>
                </View>
            </View>

            {prescription.pharmacist_comment && (
                <View style={styles.pharmacistNote}>
                    <Text style={styles.noteLabel}>💊 PHARMACIST FEEDBACK</Text>
                    <Text style={styles.noteText}>{prescription.pharmacist_comment}</Text>
                </View>
            )}

            <View style={styles.card}>
                <Text style={styles.label}>MEDICATIONS</Text>
                {prescription.drugs.map((d, i) => (
                    <View key={i} style={styles.drugRow}>
                        <Text style={styles.drugName}>{(d.drug_details && d.drug_details.name) || d.drug_name}</Text>
                        <Text style={styles.dosage}>{d.dosage}, {d.frequency}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.actionBlock}>
                <Text style={styles.label}>ADD RESPONSE / JUSTIFICATION</Text>
                <TextInput
                    style={styles.textArea}
                    multiline
                    placeholder="Enter support or modification details..."
                    value={response}
                    onChangeText={setResponse}
                />

                {loading ? (
                    <ActivityIndicator size="large" color="#1a73e8" />
                ) : (
                    <View style={styles.btnRow}>
                        <TouchableOpacity
                            style={[styles.btn, { borderColor: '#d32f2f', borderWidth: 1 }]}
                            onPress={() => handleAction('CANCEL')}
                        >
                            <Text style={{ color: '#d32f2f', fontWeight: 'bold' }}>CANCEL RX</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, { backgroundColor: '#1a73e8' }]}
                            onPress={() => handleAction('SUBMIT_RESPONSE')}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>SUBMIT RESPONSE</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <TouchableOpacity
                    style={[styles.btn, { width: '100%', marginTop: 15, backgroundColor: '#f0f0f0' }]}
                    onPress={() => navigation.navigate('PrescriptionEntry', { existingRx: prescription })}
                >
                    <Text style={{ color: '#333', fontWeight: 'bold' }}>🔄 MODIFY PRESCRIPTION</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    card: { backgroundColor: '#fff', margin: 15, padding: 20, borderRadius: 15, elevation: 2 },
    label: { fontSize: 10, fontWeight: 'bold', color: '#999', letterSpacing: 1, marginBottom: 5 },
    value: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    badgeRow: { flexDirection: 'row', marginTop: 10 },
    badge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5, marginRight: 10 },
    pharmacistNote: { backgroundColor: '#fff8e1', margin: 15, marginTop: 0, padding: 20, borderRadius: 15, borderLeftWidth: 5, borderLeftColor: '#ffb300' },
    noteLabel: { fontSize: 11, fontWeight: 'bold', color: '#ff8f00', marginBottom: 5 },
    noteText: { fontSize: 15, color: '#444', fontStyle: 'italic' },
    drugRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    drugName: { fontSize: 15, fontWeight: '500' },
    dosage: { color: '#666', fontSize: 13 },
    actionBlock: { margin: 15, marginTop: 0 },
    textArea: { backgroundColor: '#fff', borderRadius: 12, padding: 15, height: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: '#eee' },
    btnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    btn: { width: '48%', padding: 16, borderRadius: 12, alignItems: 'center' }
});

export default DoctorPrescriptionDetailScreen;
