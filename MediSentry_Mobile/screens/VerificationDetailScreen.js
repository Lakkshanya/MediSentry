import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';

const VerificationDetailScreen = ({ route, navigation }) => {
    const { prescription } = route.params;
    const [comment, setComment] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [flagReason, setFlagReason] = useState('Drug–drug interaction');
    const [showFlagOptions, setShowFlagOptions] = useState(false);
    const [showSuggestOptions, setShowSuggestOptions] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleAction = async (actionType) => {
        setLoading(true);
        try {
            const data = {
                action: actionType,
                comment: actionType === 'SUGGEST' ? suggestion : comment,
                reason: actionType === 'FLAG' ? flagReason : ''
            };

            await api.post(`/prescriptions/${prescription.id}/verify/`, data);

            Alert.alert(
                'Status Updated',
                `Prescription status set to: ${actionType}`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (e) {
            Alert.alert('Error', 'Failed to update prescription.');
        } finally {
            setLoading(false);
        }
    };

    const riskColor = prescription.risk_level === 'HIGH' ? '#d32f2f' : (prescription.risk_level === 'MEDIUM' ? '#f57c00' : '#2e7d32');
    const riskBg = prescription.risk_level === 'HIGH' ? '#ffebee' : (prescription.risk_level === 'MEDIUM' ? '#fff3e0' : '#e8f5e9');

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />

                <View style={[styles.statusBox, { backgroundColor: riskBg, borderColor: riskColor, margin: 20 }]}>
                    <Text style={[styles.statusTitle, { color: riskColor }]}>🤖 AI Risk Level: {prescription.risk_level}</Text>

                    {prescription.risk_analysis_result && (
                        <View style={styles.aiBox}>
                            <Text style={styles.aiLabel}>AI CLINICAL EVIDENCE:</Text>
                            {(prescription.risk_analysis_result.explanations || []).map((exp, idx) => (
                                <View key={idx} style={styles.explanationItem}>
                                    <Text style={styles.aiTextBold}>{exp.pair}</Text>
                                    <Text style={styles.aiText}>Mechanism: {exp.mechanism}</Text>
                                    <Text style={styles.aiRecommendation}>💡 {exp.recommendation}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {prescription.risk_level === 'HIGH' && (
                        <View style={styles.justificationBox}>
                            <Text style={styles.label}>DOCTOR'S JUSTIFICATION:</Text>
                            <Text style={styles.justText}>{prescription.clinical_justification || "No justification provided."}</Text>
                            {prescription.is_emergency_override && (
                                <Text style={styles.emergencyLabel}>🚨 EMERGENCY OVERRIDE: {prescription.emergency_reason}</Text>
                            )}
                        </View>
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.label}>PATIENT</Text>
                    <Text style={styles.value}>{prescription.patient_name || `Patient #${prescription.patient}`}</Text>
                    <View style={styles.divider} />
                    <Text style={styles.label}>MEDICATIONS</Text>
                    {prescription.drugs.map((d, i) => (
                        <View key={i} style={styles.drugRow}>
                            <Text style={styles.drugName}>{(d.drug_details && d.drug_details.name) || d.drug_name}</Text>
                            <Text style={styles.dosage}>{d.dosage}, {d.frequency}</Text>
                        </View>
                    ))}
                </View>

                {showFlagOptions && (
                    <View style={styles.actionBlock}>
                        <Text style={styles.label}>FLAG REASON</Text>
                        <Picker
                            selectedValue={flagReason}
                            onValueChange={(itemValue) => setFlagReason(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Drug–drug interaction" value="Drug–drug interaction" />
                            <Picker.Item label="Allergy conflict" value="Allergy conflict" />
                            <Picker.Item label="Dose exceeds limit" value="Dose exceeds limit" />
                            <Picker.Item label="Better alternative exists" value="Better alternative exists" />
                        </Picker>
                        <TextInput
                            style={styles.input}
                            placeholder="Add notes..."
                            value={comment}
                            onChangeText={setComment}
                        />
                        <TouchableOpacity style={styles.submitBtn} onPress={() => handleAction('FLAG')}>
                            <Text style={styles.btnTextWhite}>Confirm Flag 🚩</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {showSuggestOptions && (
                    <View style={styles.actionBlock}>
                        <Text style={styles.label}>SUGGEST MODIFICATION</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Recommend alternative drug or dose adjustment..."
                            multiline
                            value={suggestion}
                            onChangeText={setSuggestion}
                        />
                        <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#1a73e8' }]} onPress={() => handleAction('SUGGEST')}>
                            <Text style={styles.btnTextWhite}>Send Suggestion 💡</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={{ height: 120 }} />
            </ScrollView>

            <View style={styles.footerActions}>
                {!showFlagOptions && !showSuggestOptions && (
                    <>
                        <TouchableOpacity style={[styles.btnSmall, { backgroundColor: '#ffebee' }]} onPress={() => setShowFlagOptions(true)}>
                            <Text style={{ color: '#d32f2f', fontWeight: 'bold' }}>🚩 FLAG</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnSmall, { backgroundColor: '#e3f2fd' }]} onPress={() => setShowSuggestOptions(true)}>
                            <Text style={{ color: '#1a73e8', fontWeight: 'bold' }}>💡 SUGGEST</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnSmall, { backgroundColor: '#00695c' }]} onPress={() => handleAction('APPROVE')}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>✅ APPROVE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btnSmall, { backgroundColor: '#333' }]} onPress={() => handleAction('REJECT')}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>❌ REJECT</Text>
                        </TouchableOpacity>
                    </>
                )}
                {(showFlagOptions || showSuggestOptions) && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowFlagOptions(false); setShowSuggestOptions(false); }}>
                        <Text style={{ color: '#666', fontWeight: 'bold' }}>CANCEL</Text>
                    </TouchableOpacity>
                )}
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    statusBox: { padding: 15, borderRadius: 10, borderWidth: 1 },
    statusTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
    justificationBox: { backgroundColor: 'rgba(255,255,255,0.5)', padding: 10, borderRadius: 5 },
    aiBox: { marginBottom: 10, padding: 8, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 5 },
    aiLabel: { fontSize: 10, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    explanationItem: { marginBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)', paddingBottom: 10 },
    aiTextBold: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 2 },
    aiText: { fontSize: 13, color: '#444', lineHeight: 18 },
    aiRecommendation: { fontSize: 12, color: '#1a73e8', fontWeight: '500', marginTop: 5 },
    justText: { fontStyle: 'italic', color: '#333', marginBottom: 5 },
    emergencyLabel: { fontWeight: 'bold', color: '#d32f2f', fontSize: 12 },
    card: { backgroundColor: '#fff', margin: 20, padding: 20, borderRadius: 15, elevation: 3 },
    label: { fontSize: 10, fontWeight: 'bold', color: '#999', letterSpacing: 1, marginBottom: 5 },
    value: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    drugRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    drugName: { fontSize: 15, fontWeight: '500' },
    dosage: { color: '#666', fontSize: 13 },
    actionBlock: { margin: 20, padding: 20, backgroundColor: '#fff', borderRadius: 15, elevation: 4 },
    picker: { height: 50, marginBottom: 15 },
    input: { borderBottomWidth: 1, borderBottomColor: '#ddd', marginBottom: 20, padding: 10 },
    submitBtn: { backgroundColor: '#d32f2f', padding: 15, borderRadius: 10, alignItems: 'center' },
    btnTextWhite: { color: '#fff', fontWeight: 'bold' },
    footerActions: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', padding: 15, flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#eee' },
    btnSmall: { paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, alignItems: 'center', minWidth: 80 },
    cancelBtn: { padding: 15, width: '100%', alignItems: 'center' }
});

export default VerificationDetailScreen;
