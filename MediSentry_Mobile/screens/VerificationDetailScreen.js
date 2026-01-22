import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';

const VerificationDetailScreen = ({ route, navigation }) => {
    const { prescription } = route.params;
    const [comment, setComment] = useState('');

    const handleAction = (action) => {
        Alert.alert(
            action === 'APPROVE' ? 'Approved' : 'Flagged',
            `Prescription has been ${action === 'APPROVE' ? 'verified & approved' : 'flagged for doctor review'}.`,
            [{ text: 'Return to Dashboard', onPress: () => navigation.goBack() }]
        );
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />

                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Review Application</Text>
                    <Text style={styles.headerSub}>Rx ID: #{prescription.id} • Dr. Smith</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>PATIENT</Text>
                    <Text style={styles.value}>{prescription.patient}</Text>
                    <View style={styles.divider} />

                    <Text style={styles.label}>MEDICATIONS</Text>
                    {prescription.drugs.map((d, i) => (
                        <View key={i} style={styles.drugRow}>
                            <Text style={styles.drugName}>{d}</Text>
                            <Text style={styles.dosage}>10mg, Daily</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.statusBox}>
                    <Text style={styles.statusTitle}>🤖 AI Risk Analysis</Text>
                    <Text style={styles.statusText}>
                        <Text style={{ fontWeight: 'bold', color: '#2e7d32' }}>CLEARED</Text> - No major interactions detected.
                    </Text>
                </View>

                <View style={styles.inputSection}>
                    <Text style={styles.label}>PHARMACIST NOTES</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Add notes for internal record..."
                        multiline
                        value={comment}
                        onChangeText={setComment}
                    />
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.actionFooter}>
                <TouchableOpacity style={[styles.btn, styles.flagBtn]} onPress={() => handleAction('FLAG')}>
                    <Text style={styles.btnText}>🚩 Flag Issue</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.approveBtn]} onPress={() => handleAction('APPROVE')}>
                    <Text style={styles.btnText}>✅ Approve Rx</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    headerSub: { color: '#888', fontSize: 13, marginTop: 4 },
    card: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 12, elevation: 2 },
    label: { color: '#999', fontSize: 11, fontWeight: 'bold', marginBottom: 8, letterSpacing: 1 },
    value: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 15 },
    drugRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    drugName: { fontSize: 16, color: '#333', fontWeight: '500' },
    dosage: { color: '#666' },
    statusBox: { marginHorizontal: 20, backgroundColor: '#e8f5e9', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#c8e6c9' },
    statusTitle: { fontWeight: 'bold', color: '#2e7d32', marginBottom: 5 },
    statusText: { color: '#1b5e20', fontSize: 14 },
    inputSection: { padding: 20 },
    input: { backgroundColor: '#fff', padding: 15, borderRadius: 10, height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: '#ddd', fontSize: 16 },
    actionFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 20, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', elevation: 10 },
    btn: { width: '48%', padding: 16, borderRadius: 12, alignItems: 'center' },
    flagBtn: { backgroundColor: '#ffebee' },
    approveBtn: { backgroundColor: '#00695c' },
    btnText: { fontWeight: 'bold', fontSize: 16, color: '#333' }
});

export default VerificationDetailScreen;
