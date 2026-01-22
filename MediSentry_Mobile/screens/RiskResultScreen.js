import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';

const RiskResultScreen = ({ route, navigation }) => {
    const { prescription, analysis, patientName } = route.params;
    const { risk_level, interactions } = analysis;

    const isHighRisk = risk_level === 'HIGH';
    const isModerate = risk_level === 'MEDIUM';

    // Theme Colors based on Risk
    const themeColor = isHighRisk ? '#d32f2f' : (isModerate ? '#f57c00' : '#388e3c');
    const bgHeader = isHighRisk ? '#feaeb9' : (isModerate ? '#ffe0b2' : '#c8e6c9');

    // Simple Risk Meter Visualization (3 segments)
    const Meter = () => (
        <View style={styles.meterContainer}>
            <View style={[styles.meterSegment, { backgroundColor: '#388e3c', opacity: risk_level === 'SAFE' ? 1 : 0.2 }]} />
            <View style={[styles.meterSegment, { backgroundColor: '#f57c00', opacity: risk_level === 'MEDIUM' ? 1 : 0.2 }]} />
            <View style={[styles.meterSegment, { backgroundColor: '#d32f2f', opacity: risk_level === 'HIGH' ? 1 : 0.2 }]} />
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={themeColor} />

            <View style={[styles.header, { backgroundColor: themeColor }]}>
                <Text style={styles.headerTitle}>Risk Analysis Result</Text>
                <Text style={styles.patientName}>Patient: {patientName || 'Unknown'}</Text>
            </View>

            <View style={styles.scoreCard}>
                <Text style={styles.scoreLabel}>SAFETY SCORE</Text>
                <Text style={[styles.scoreValue, { color: themeColor }]}>{risk_level}</Text>
                <Meter />
                <Text style={styles.scoreDesc}>
                    {isHighRisk ? 'Immediate intervention recommended.' : (isModerate ? 'Monitor patient closely.' : 'Prescription appears safe.')}
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detected Interactions ({interactions.length})</Text>
                {interactions.length > 0 ? (
                    interactions.map((inter, i) => (
                        <View key={i} style={[styles.interactionCard, { borderLeftColor: themeColor }]}>
                            <View style={styles.interactionHeader}>
                                <Text style={styles.drugPair}>{inter.drug_a} + {inter.drug_b}</Text>
                                <Text style={[styles.severityBadge, { color: themeColor, backgroundColor: bgHeader }]}>{inter.severity}</Text>
                            </View>
                            <Text style={styles.interactionDesc}>{inter.description}</Text>
                            <TouchableOpacity
                                style={styles.explainBtn}
                                onPress={() => navigation.navigate('Explanation', { interaction: inter })}
                            >
                                <Text style={styles.explainBtnText}>View Explanation &rarr;</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                ) : (
                    <View style={styles.safeCard}>
                        <Text style={styles.safeText}>✅ No known interactions detected.</Text>
                    </View>
                )}
            </View>

            <View style={styles.actionContainer}>
                <TouchableOpacity
                    style={[styles.btn, { borderColor: themeColor, borderWidth: 1 }]}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={[styles.btnText, { color: themeColor }]}>Modify Drugs</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: themeColor }]}
                    onPress={() => navigation.navigate('DoctorHome')}
                >
                    <Text style={[styles.btnText, { color: '#fff' }]}>Confirm & Save</Text>
                </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    header: { padding: 25, paddingBottom: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
    headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
    patientName: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
    scoreCard: { backgroundColor: '#fff', marginHorizontal: 20, marginTop: -30, borderRadius: 15, padding: 25, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1 },
    scoreLabel: { fontSize: 13, color: '#666', letterSpacing: 1, fontWeight: 'bold', marginBottom: 10 },
    scoreValue: { fontSize: 40, fontWeight: 'bold', marginBottom: 15 },
    meterContainer: { flexDirection: 'row', width: '100%', height: 12, borderRadius: 6, overflow: 'hidden', backgroundColor: '#eee', marginBottom: 15 },
    meterSegment: { flex: 1, marginHorizontal: 1 },
    scoreDesc: { color: '#555', fontSize: 14, textAlign: 'center' },
    section: { padding: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    interactionCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 15, borderLeftWidth: 5, elevation: 2 },
    interactionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    drugPair: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    severityBadge: { fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
    interactionDesc: { color: '#666', fontSize: 14, lineHeight: 20, marginBottom: 15 },
    explainBtn: { alignSelf: 'flex-end' },
    explainBtnText: { color: '#1565c0', fontWeight: 'bold', fontSize: 14 },
    safeCard: { padding: 20, backgroundColor: '#e8f5e9', borderRadius: 10, alignItems: 'center' },
    safeText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 16 },
    actionContainer: { padding: 20, flexDirection: 'row', justifyContent: 'space-between' },
    btn: { width: '48%', paddingVertical: 15, borderRadius: 12, alignItems: 'center', elevation: 2 },
    btnText: { fontWeight: 'bold', fontSize: 16 }
});

export default RiskResultScreen;
