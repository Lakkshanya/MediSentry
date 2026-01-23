import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';

const RiskResultScreen = ({ route, navigation }) => {
    const { prescription, analysis, patientName } = route.params;
    const { risk_level, interactions, explanations } = analysis;

    const [isAcknowledged, setIsAcknowledged] = useState(false);
    const [justification, setJustification] = useState('');
    const [isEmergency, setIsEmergency] = useState(false);
    const [emergencyReason, setEmergencyReason] = useState('');
    const [selectedAlternative, setSelectedAlternative] = useState(null);
    const [loading, setLoading] = useState(false);

    const isHighRisk = risk_level === 'HIGH';
    const isModerate = risk_level === 'MEDIUM';

    const themeColor = isHighRisk ? '#d32f2f' : (isModerate ? '#f57c00' : '#388e3c');
    const bgHeader = isHighRisk ? '#ffebee' : (isModerate ? '#fff3e0' : '#e8f5e9');

    const alternatives = [
        { id: 1, name: 'Clopidogrel', reason: 'Better gastrointestinal profile' },
        { id: 2, name: 'Apixiban', reason: 'Lower bleeding risk' },
        { id: 3, name: 'Paracetamol', reason: 'Non-NSAID alternative' }
    ];

    const handleConfirm = async () => {
        if (isHighRisk) {
            if (!isAcknowledged) {
                Alert.alert('Acknowledgement Required', 'Please acknowledge clinical responsibility for this high-risk prescription.');
                return;
            }
            if (!justification || justification.length < 50) {
                Alert.alert('Incomplete Justification', 'Please provide a clinical justification (min 50 characters).');
                return;
            }
            if (isEmergency && !emergencyReason) {
                Alert.alert('Emergency Reason Required', 'Please provide a reason for the emergency override.');
                return;
            }
        }

        setLoading(true);
        try {
            await api.patch(`/prescriptions/${prescription.id}/`, {
                status: isHighRisk ? 'PENDING' : 'APPROVED',
                is_high_risk_acknowledged: isAcknowledged,
                clinical_justification: justification,
                is_emergency_override: isEmergency,
                emergency_reason: emergencyReason,
                chosen_alternative: selectedAlternative?.name
            });

            Alert.alert(
                'Success',
                isHighRisk ? 'High-risk prescription submitted for review.' : 'Prescription approved and logged.',
                [{ text: 'OK', onPress: () => navigation.navigate('DoctorHome') }]
            );
        } catch (e) {
            Alert.alert('Error', 'Failed to save final prescription details.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={themeColor} />

            <View style={[styles.header, { backgroundColor: themeColor }]}>
                <Text style={styles.headerTitle}>Safety Analysis Result</Text>
                <Text style={styles.patientName}>Patient: {patientName || 'Priya'}</Text>
            </View>

            <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>SAFETY SCORE</Text>
                <Text style={[styles.scoreValue, { color: themeColor }]}>{risk_level}</Text>
                <View style={styles.meterContainer}>
                    <View style={[styles.meterSegment, { backgroundColor: '#388e3c', opacity: risk_level === 'SAFE' ? 1 : 0.2 }]} />
                    <View style={[styles.meterSegment, { backgroundColor: '#f57c00', opacity: risk_level === 'MEDIUM' ? 1 : 0.2 }]} />
                    <View style={[styles.meterSegment, { backgroundColor: '#d32f2f', opacity: risk_level === 'HIGH' ? 1 : 0.2 }]} />
                </View>
                <Text style={styles.scoreDesc}>
                    {isHighRisk ? 'High clinical risk detected. Special protocol required.' : (isModerate ? 'Moderate risk. Proceed with caution.' : 'Prescription appears safe.')}
                </Text>
            </View>

            {isHighRisk && (
                <View style={styles.highRiskForm}>
                    <Text style={styles.sectionHeader}>🛡️ High Risk Protocol</Text>

                    <View style={styles.protocolBlock}>
                        <TouchableOpacity
                            style={styles.checkboxContainer}
                            onPress={() => setIsAcknowledged(!isAcknowledged)}
                        >
                            <View style={[styles.checkbox, isAcknowledged && styles.checkboxActive]}>
                                {isAcknowledged && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
                            </View>
                            <Text style={styles.checkboxLabel}>I acknowledge this is a HIGH-RISK prescription and take clinical responsibility.</Text>
                        </TouchableOpacity>

                        <Text style={styles.inputLabel}>Clinical Justification (Min 50 chars)</Text>
                        <TextInput
                            style={styles.textArea}
                            multiline
                            placeholder="Explain why this combination is necessary..."
                            value={justification}
                            onChangeText={setJustification}
                        />
                        <Text style={{ fontSize: 10, alignSelf: 'flex-end', color: justification.length >= 50 ? 'green' : 'red' }}>
                            {justification.length}/50
                        </Text>
                    </View>

                    <View style={styles.protocolBlock}>
                        <View style={styles.switchRow}>
                            <Text style={styles.inputLabel}>🚨 Emergency Override (Optional)</Text>
                            <Switch value={isEmergency} onValueChange={setIsEmergency} />
                        </View>
                        {isEmergency && (
                            <TextInput
                                style={styles.input}
                                placeholder="State emergency reason (e.g. Life threatening)"
                                value={emergencyReason}
                                onChangeText={setEmergencyReason}
                            />
                        )}
                    </View>

                    <Text style={styles.inputLabel}>Auto-Generated Safer Alternatives</Text>
                    {alternatives.map((alt) => (
                        <TouchableOpacity
                            key={alt.id}
                            style={[styles.altCard, selectedAlternative?.id === alt.id && styles.altCardSelected]}
                            onPress={() => setSelectedAlternative(alt)}
                        >
                            <Text style={styles.altName}>{alt.name}</Text>
                            <Text style={styles.altDesc}>{alt.reason}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                        style={[styles.altCard, selectedAlternative === 'REJECTED' && styles.altCardSelected]}
                        onPress={() => setSelectedAlternative('REJECTED')}
                    >
                        <Text style={styles.altName}>Reject All Alternatives</Text>
                        <Text style={styles.altDesc}>Proceed with original prescription</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detected Interactions ({interactions.length})</Text>
                {interactions.map((inter, i) => (
                    <View key={i} style={[styles.interactionCard, { borderLeftColor: themeColor }]}>
                        <Text style={styles.drugPair}>{inter.drug_a} + {inter.drug_b}</Text>
                        <Text style={styles.interactionDesc}>{inter.description}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.footer}>
                {loading ? (
                    <ActivityIndicator size="large" color={themeColor} />
                ) : (
                    <View style={styles.actionRow}>
                        <TouchableOpacity style={[styles.btn, { borderColor: themeColor, borderWidth: 1 }]} onPress={() => navigation.goBack()}>
                            <Text style={[styles.btnText, { color: themeColor }]}>Modify Drugs</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.btn, { backgroundColor: themeColor }]} onPress={handleConfirm}>
                            <Text style={[styles.btnText, { color: '#fff' }]}>Submit Rx</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    header: { padding: 25, paddingBottom: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    patientName: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 5 },
    scoreCard: { backgroundColor: '#fff', marginHorizontal: 20, marginTop: -30, borderRadius: 15, padding: 25, alignItems: 'center', elevation: 4 },
    scoreLabel: { fontSize: 12, color: '#666', fontWeight: 'bold' },
    scoreValue: { fontSize: 42, fontWeight: 'bold', marginVertical: 10 },
    meterContainer: { flexDirection: 'row', width: '100%', height: 10, borderRadius: 5, backgroundColor: '#eee', marginBottom: 15 },
    meterSegment: { flex: 1, marginHorizontal: 1 },
    scoreDesc: { color: '#666', fontSize: 13, textAlign: 'center' },
    section: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    highRiskForm: { padding: 20, backgroundColor: '#fff', margin: 20, borderRadius: 15, elevation: 3 },
    sectionHeader: { fontSize: 17, fontWeight: 'bold', color: '#d32f2f', marginBottom: 15 },
    protocolBlock: { marginBottom: 20 },
    checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: '#d32f2f', marginRight: 10, alignItems: 'center', justifyContent: 'center' },
    checkboxActive: { backgroundColor: '#d32f2f' },
    checkboxLabel: { flex: 1, fontSize: 14, color: '#333' },
    inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#666', marginBottom: 8 },
    textArea: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, height: 100, textAlignVertical: 'top', backgroundColor: '#fafafa' },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, backgroundColor: '#fafafa' },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    altCard: { padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginBottom: 10 },
    altCardSelected: { borderColor: '#d32f2f', backgroundColor: '#fff8f1' },
    altName: { fontWeight: 'bold', color: '#333' },
    altDesc: { fontSize: 12, color: '#666' },
    interactionCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderLeftWidth: 5 },
    drugPair: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 5 },
    interactionDesc: { fontSize: 14, color: '#666' },
    footer: { padding: 20 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
    btn: { width: '48%', padding: 16, borderRadius: 12, alignItems: 'center' },
    btnText: { fontWeight: 'bold', fontSize: 16 }
});

export default RiskResultScreen;
