import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppCard from '../components/ui/AppCard';
import AppButton from '../components/ui/AppButton';
import HeaderGradient from '../components/ui/HeaderGradient';
import { Ionicons } from '@expo/vector-icons';

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
                    status: 'UNDER_REVIEW'
                });
                Alert.alert('Analysis Synchronized', 'Your justification has been submitted for pharmacological review.');
            } else if (actionType === 'CANCEL') {
                await api.patch(`/prescriptions/${prescription.id}/`, { status: 'REJECTED' });
                Alert.alert('Clinical Void', 'The prescription has been formally revoked.');
            }
            navigation.goBack();
        } catch (e) {
            Alert.alert('System Error', 'Failed to update prescription status in the clinical registry.');
        } finally {
            setLoading(false);
        }
    };

    const riskLevel = prescription.risk_level ? prescription.risk_level.toUpperCase() : 'SAFE';
    const riskColor = riskLevel === 'HIGH' ? Colors.danger : Colors.success;

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            
            <HeaderGradient height={110}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Prescription Review</Text>
                    <View style={{ width: 40 }} />
                </View>
            </HeaderGradient>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <AppCard style={styles.patientCard}>
                    <View style={styles.cardHeader}>
                        <View style={styles.patientIcon}>
                            <Ionicons name="person-outline" size={20} color={Colors.primary} />
                        </View>
                        <View>
                            <Text style={styles.label}>PATIENT PROFILE</Text>
                            <Text style={styles.patientName}>{prescription.patient_name || `Patient #${prescription.patient}`}</Text>
                        </View>
                    </View>
                    
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: riskColor + '10', borderColor: riskColor, borderWidth: 1 }]}>
                            <Text style={[styles.badgeText, { color: riskColor }]}>{riskLevel} RISK</Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: Colors.offWhite, borderColor: Colors.border, borderWidth: 1 }]}>
                            <Text style={[styles.badgeText, { color: Colors.textSecondary }]}>{prescription.status}</Text>
                        </View>
                    </View>
                </AppCard>

                {prescription.pharmacist_comment && (
                    <AppCard style={styles.feedbackCard}>
                        <View style={styles.feedbackHeader}>
                            <Ionicons name="chatbubble-ellipses" size={20} color={Colors.warning} />
                            <Text style={styles.feedbackTitle}>Pharmacist Feedback</Text>
                        </View>
                        <Text style={styles.feedbackText}>"{prescription.pharmacist_comment}"</Text>
                    </AppCard>
                )}

                {riskLevel === 'HIGH' && (
                    <AppCard style={styles.justificationCard}>
                        <Text style={styles.justificationLabel}>PHYSICIAN JUSTIFICATION</Text>
                        <Text style={styles.justificationText}>"{prescription.clinical_justification || 'No clinical justification provided.'}"</Text>
                        
                        {prescription.is_emergency_override && (
                            <View style={styles.emergencyAlert}>
                                <Ionicons name="warning" size={18} color="#B91C1C" />
                                <Text style={styles.emergencyText}><Text style={{fontWeight: '800'}}>EMERGENCY OVERRIDE:</Text> {prescription.emergency_reason}</Text>
                            </View>
                        )}
                    </AppCard>
                )}

                <AppCard style={styles.medsCard}>
                    <Text style={styles.sectionLabel}>PRESCRIBED DRUGS</Text>
                    {(prescription.drugs || []).map((d, i) => (
                        <View key={i} style={styles.drugItem}>
                            <View style={styles.drugInfo}>
                                <Text style={styles.drugName}>{(d.drug_details && d.drug_details.name) || d.drug_name}</Text>
                                <Text style={styles.drugDosage}>{d.dosage} • {d.frequency}</Text>
                            </View>
                            <Ionicons name="medkit-outline" size={18} color={Colors.border} />
                        </View>
                    ))}
                </AppCard>

                {prescription.risk_analysis_result && (
                    <AppCard style={[styles.safetyCard, { borderColor: riskColor + '40' }]}>
                        <View style={styles.safetyHeader}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={riskColor} />
                            <Text style={[styles.safetyTitle, { color: riskColor }]}>AI Safety Evaluation</Text>
                        </View>

                        {/* Interactions Section */}
                        {prescription.risk_analysis_result.interactions?.length > 0 && (
                            <View style={styles.safetySection}>
                                <Text style={styles.safetyLabel}>IDENTIFIED INTERACTIONS</Text>
                                {prescription.risk_analysis_result.interactions.map((int, idx) => (
                                    <View key={idx} style={styles.interactionRow}>
                                        <Text style={styles.interactionText}>
                                            <Text style={{fontWeight:'700'}}>{int.drug_a}</Text> + <Text style={{fontWeight:'700'}}>{int.drug_b}</Text>
                                        </Text>
                                        <Text style={styles.riskDesc}>{int.description || 'Possible adverse interaction detected.'}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {prescription.risk_analysis_result.explanations?.length > 0 && (
                            <View style={styles.safetySection}>
                                <Text style={styles.safetyLabel}>CLINICAL RATIONALE</Text>
                                {prescription.risk_analysis_result.explanations.map((exp, idx) => (
                                    <View key={idx} style={styles.bulletItem}>
                                        <View style={[styles.bullet, { backgroundColor: riskColor }]} />
                                        <Text style={styles.bulletText}>
                                            {typeof exp === 'string' ? exp : (exp.recommendation || exp.mechanism || JSON.stringify(exp))}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Alternatives Section */}
                        {prescription.risk_analysis_result.alternatives?.length > 0 && (
                            <View style={styles.safetySection}>
                                <Text style={[styles.safetyLabel, { color: Colors.success }]}>CLINICAL ALTERNATIVES</Text>
                                {prescription.risk_analysis_result.alternatives.map((alt, idx) => (
                                    <View key={idx} style={styles.altItem}>
                                        <View style={styles.altBadge}>
                                            <Text style={styles.altBadgeText}>SUGGESTED</Text>
                                        </View>
                                        <Text style={styles.altName}>{alt.name || (typeof alt === 'string' ? alt : 'Alternative Medication')}</Text>
                                        {alt.reason && <Text style={styles.altReason}>{alt.reason}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}
                    </AppCard>
                )}

                <AppCard style={styles.clinicalStatusCard}>
                    <View style={styles.statusBlockHeader}>
                        <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
                        <Text style={styles.statusBlockTitle}>Clinical Status</Text>
                    </View>
                    <Text style={styles.statusBlockText}>
                        This prescription is currently <Text style={{fontWeight: '800', color: Colors.text}}>{prescription.status}</Text>. 
                        Review actions are restricted to pharmacy clinical staff to ensure medication safety compliance.
                    </Text>
                </AppCard>

                {prescription.status !== 'APPROVED' && prescription.status !== 'REJECTED' && (
                    <View style={styles.standaloneActions}>
                        <AppButton
                            variant="danger"
                            title="Revoke RX"
                            style={styles.actionBtnFull}
                            onPress={() => handleAction('CANCEL')}
                            loading={loading}
                        />
                    </View>
                )}

                    <AppButton
                        variant="secondary"
                        title="Modify Manually"
                        icon={<Ionicons name="create-outline" size={18} color={Colors.primary} />}
                        style={styles.modifyBtn}
                        onPress={() => navigation.navigate('PrescriptionEntry', { existingRx: prescription })}
                    />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
    },
    backBtn: {
        padding: Spacing.xs,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.white,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: 0,
        marginTop: -10,
        paddingBottom: Spacing.xxl,
    },
    patientCard: {
        padding: Spacing.lg,
        borderRadius: Sizes.radiusMd,
        borderColor: Colors.border,
        borderWidth: 1,
        ...Shadow.light,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    patientIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.offWhite,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    label: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.textSecondary,
        letterSpacing: 0.5,
    },
    patientName: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
    },
    badgeRow: {
        flexDirection: 'row',
        marginTop: Spacing.lg,
        gap: 8,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    feedbackCard: {
        marginTop: Spacing.md,
        padding: Spacing.md,
        backgroundColor: '#FFF8E1',
        borderColor: '#FFECB3',
        borderWidth: 1,
    },
    feedbackHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    feedbackTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.warning,
        marginLeft: 8,
    },
    feedbackText: {
        fontSize: 14,
        color: Colors.text,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    medsCard: {
        marginTop: Spacing.md,
        padding: Spacing.lg,
    },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.textSecondary,
        marginBottom: Spacing.md,
        letterSpacing: 0.5,
    },
    drugItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.offWhite,
    },
    drugInfo: {
        flex: 1,
    },
    drugName: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.text,
    },
    drugDosage: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    clinicalStatusCard: {
        marginTop: Spacing.xl,
        padding: Spacing.lg,
        borderColor: Colors.border,
        borderWidth: 1,
    },
    statusBlockHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        gap: 8,
    },
    statusBlockTitle: {
        fontSize: 14,
        fontWeight: '800',
        color: Colors.text,
    },
    statusBlockText: {
        fontSize: 14,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    standaloneActions: {
        marginTop: Spacing.lg,
    },
    actionBtnFull: {
        width: '100%',
    },
    modifyBtn: {
        marginTop: Spacing.md,
    },
    justificationCard: {
        marginTop: Spacing.md,
        padding: Spacing.lg,
    },
    justificationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        gap: 6,
    },
    justificationLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.textSecondary,
        letterSpacing: 0.5,
    },
    justificationText: {
        fontSize: 14,
        color: Colors.text,
        fontStyle: 'italic',
        lineHeight: 20,
    },
    emergencyAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEE2E2',
        padding: Spacing.sm,
        borderRadius: Sizes.radiusSm,
        gap: 6,
        marginTop: Spacing.md,
    },
    emergencyText: {
        fontSize: 12,
        color: '#B91C1C',
        flex: 1,
    },
    modifyBtn: {
        marginTop: Spacing.md,
    },
    safetyCard: {
        marginTop: Spacing.md,
        padding: Spacing.lg,
        borderWidth: 1.5,
    },
    safetyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        gap: 10,
    },
    safetyTitle: {
        fontSize: 16,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    safetySection: {
        marginTop: Spacing.md,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.offWhite,
    },
    safetyLabel: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.textSecondary,
        marginBottom: Spacing.sm,
        letterSpacing: 1,
    },
    interactionRow: {
        marginBottom: 8,
    },
    interactionText: {
        fontSize: 14,
        color: Colors.text,
    },
    riskDesc: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 6,
        gap: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 6,
    },
    bulletText: {
        flex: 1,
        fontSize: 13,
        color: Colors.text,
        lineHeight: 18,
    },
    altItem: {
        backgroundColor: Colors.offWhite,
        padding: Spacing.md,
        borderRadius: Sizes.radiusSm,
        marginTop: Spacing.xs,
    },
    altBadge: {
        backgroundColor: Colors.success,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 4,
    },
    altBadgeText: {
        color: Colors.white,
        fontSize: 8,
        fontWeight: '900',
    },
    altName: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.text,
    },
    altReason: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
        fontStyle: 'italic',
    }
});

export default DoctorPrescriptionDetailScreen;
