import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppCard from '../components/ui/AppCard';
import AppButton from '../components/ui/AppButton';
import HeaderGradient from '../components/ui/HeaderGradient';
import { Ionicons } from '@expo/vector-icons';

const RiskResultScreen = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
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
    const safetyColor = isHighRisk ? Colors.danger : (isModerate ? Colors.warning : Colors.success);

    const [alternatives, setAlternatives] = useState(analysis.alternatives || []);
    const [loadingAlt, setLoadingAlt] = useState(false);

    useEffect(() => {
        const fetchAlternatives = async () => {
            if (isHighRisk && alternatives.length === 0) {
                setLoadingAlt(true);
                try {
                    let target = interactions.length > 0 ? interactions[0].drug_a : null;
                    
                    if (!target && prescription.drugs && prescription.drugs.length > 0) {
                        const firstDrug = prescription.drugs[0];
                        target = firstDrug.drug_name || 
                                 (firstDrug.drug_details && firstDrug.drug_details.name) || 
                                 (typeof firstDrug === 'string' ? firstDrug : null);
                    }

                    if (target && typeof target === 'string') {
                        const res = await api.get(`/analytics/alternatives/${target}/`, {
                            params: { others: interactions.map(i => i.drug_b).join(',') }
                        });
                        setAlternatives(res.data.alternatives || []);
                    }
                } catch (e) {
                    console.error("Failed to fetch second-tier alternatives", e);
                } finally {
                    setLoadingAlt(false);
                }
            }
        };
        fetchAlternatives();
    }, [isHighRisk]);

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
                risk_level: risk_level,
                risk_analysis_result: analysis,
                is_high_risk_acknowledged: isAcknowledged,
                clinical_justification: justification,
                is_emergency_override: isEmergency,
                emergency_reason: emergencyReason,
                chosen_alternative: selectedAlternative?.name
            });

            Alert.alert(
                'Assessment Logged',
                isHighRisk ? 'High-risk prescription submitted for clinical review.' : 'Prescription approved and logged in system.',
                [{ text: 'Return to Home', onPress: () => navigation.navigate('DoctorHome') }]
            );
        } catch (e) {
            Alert.alert('System Error', 'Failed to synchronize assessment with server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            
            <HeaderGradient height={100}>
                <View style={[styles.header, { flex: 1 }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <View style={styles.headerInfo}>
                        <Text style={styles.headerTitle}>Safety Profile</Text>
                        <Text style={styles.patientBadge}>PATIENT • {patientName || 'ANONYMOUS'}</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
            </HeaderGradient>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <AppCard style={styles.scoreCard}>
                    <Text style={styles.cardSectionLabel}>OVERALL ASSESSMENT</Text>
                    <View style={styles.scoreRow}>
                         <View style={[styles.indicator, { backgroundColor: safetyColor }]} />
                         <Text style={[styles.scoreText, { color: safetyColor }]}>{risk_level} RISK</Text>
                    </View>
                    
                    <View style={styles.meterContainer}>
                        <View style={[styles.meterSegment, { backgroundColor: Colors.success, opacity: risk_level === 'SAFE' ? 1 : 0.15 }]} />
                        <View style={[styles.meterSegment, { backgroundColor: Colors.warning, opacity: risk_level === 'MEDIUM' ? 1 : 0.15 }]} />
                        <View style={[styles.meterSegment, { backgroundColor: Colors.danger, opacity: risk_level === 'HIGH' ? 1 : 0.15 }]} />
                    </View>

                    <Text style={styles.assessmentDesc}>
                        {isHighRisk 
                          ? 'This combination presents severe safety concerns and requires immediate clinical justification or modification.' 
                          : (isModerate ? 'Potential interactions detected. Review dosage and patient history carefully.' : 'AI screening suggests this prescription is within safety bounds.')
                        }
                    </Text>
                </AppCard>

                {isHighRisk && (
                    <View style={styles.protocolContainer}>
                        <Text style={styles.sectionTitle}>Safety Protocol (Required)</Text>
                        
                        <AppCard style={styles.formCard}>
                            <TouchableOpacity 
                                activeOpacity={0.8}
                                style={styles.acknowledgeRow}
                                onPress={() => setIsAcknowledged(!isAcknowledged)}
                            >
                                <View style={[styles.checkbox, isAcknowledged && styles.checkboxActive]}>
                                    {isAcknowledged && <Ionicons name="checkmark" size={16} color={Colors.white} />}
                                </View>
                                <Text style={styles.acknowledgeText}>I confirm I have reviewed the risks and take full clinical responsibility.</Text>
                            </TouchableOpacity>

                            <View style={styles.divider} />

                            <View style={styles.inputSection}>
                                <Text style={styles.inputLabel}>Clinical Justification</Text>
                                <TextInput
                                    style={styles.textArea}
                                    multiline
                                    placeholder="Provide detailed clinical rationale for this combination..."
                                    placeholderTextColor={Colors.placeholder}
                                    value={justification}
                                    onChangeText={setJustification}
                                />
                                <View style={styles.charCount}>
                                    <Text style={[styles.countText, justification.length >= 50 ? styles.countValid : styles.countInvalid]}>
                                        {justification.length}/50 min characters
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.emergencyRow}>
                                <View style={styles.emergencyInfo}>
                                    <Ionicons name="flash-outline" size={18} color={isEmergency ? Colors.danger : Colors.textSecondary} />
                                    <Text style={[styles.emergencyLabel, isEmergency && { color: Colors.danger }]}>Emergency Override</Text>
                                </View>
                                <Switch 
                                    value={isEmergency} 
                                    onValueChange={setIsEmergency}
                                    trackColor={{ false: Colors.border, true: Colors.danger }}
                                    thumbColor={Colors.white}
                                />
                            </View>

                            {isEmergency && (
                                <View style={styles.emergencyInputFade}>
                                    <TextInput
                                        style={styles.emergencyInput}
                                        placeholder="Reason for emergency bypass..."
                                        placeholderTextColor={Colors.placeholder}
                                        value={emergencyReason}
                                        onChangeText={setEmergencyReason}
                                    />
                                </View>
                            )}
                        </AppCard>

                        <Text style={styles.sectionTitle}>Safer Alternatives (Recommended)</Text>
                        {loadingAlt ? (
                            <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 20 }} />
                        ) : (
                            <View style={styles.alternativesList}>
                                {alternatives.map((alt, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        activeOpacity={0.9}
                                        style={[styles.altItem, selectedAlternative?.name === alt.name && styles.altItemSelected]}
                                        onPress={() => setSelectedAlternative(alt)}
                                    >
                                        <View style={styles.altMain}>
                                            <Text style={[styles.altName, selectedAlternative?.name === alt.name && { color: Colors.primary }]}>{alt.name}</Text>
                                            <Text style={styles.altReason}>{alt.reason}</Text>
                                        </View>
                                        {selectedAlternative?.name === alt.name && <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />}
                                    </TouchableOpacity>
                                ))}
                                
                                <TouchableOpacity
                                    activeOpacity={0.9}
                                    style={[styles.altItem, selectedAlternative === 'REJECTED' && styles.altItemSelected]}
                                    onPress={() => setSelectedAlternative('REJECTED')}
                                >
                                    <View style={styles.altMain}>
                                        <Text style={[styles.altName, selectedAlternative === 'REJECTED' && { color: Colors.primary }]}>Proceed with Original</Text>
                                        <Text style={styles.altReason}>Maintain current drug combination despite risks</Text>
                                    </View>
                                    {selectedAlternative === 'REJECTED' && <Ionicons name="alert-circle" size={20} color={Colors.primary} />}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                <View style={styles.footerActions}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.backButtonText}>Modify Entry</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                        <AppButton 
                            title="Submit" 
                            onPress={handleConfirm}
                            loading={loading}
                        />
                    </View>
                </View>

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
    headerInfo: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.white,
    },
    patientBadge: {
        fontSize: 10,
        fontWeight: '700',
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
        letterSpacing: 0.5,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: 0, // Content overlaps
        paddingBottom: Spacing.xl,
    },
    scoreCard: {
        padding: Spacing.lg,
        marginTop: Spacing.md, 
        alignItems: 'center',
        borderRadius: Sizes.radiusMd,
    },
    cardSectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: Colors.textSecondary,
        letterSpacing: 1,
        marginBottom: Spacing.sm,
    },
    scoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.sm,
    },
    indicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 8,
    },
    scoreText: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    meterContainer: {
        flexDirection: 'row',
        width: '100%',
        height: 6,
        backgroundColor: Colors.offWhite,
        borderRadius: 3,
        overflow: 'hidden',
        marginVertical: Spacing.lg,
    },
    meterSegment: {
        flex: 1,
    },
    assessmentDesc: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    protocolContainer: {
        marginTop: Spacing.xl,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.md,
    },
    formCard: {
        padding: Spacing.md,
        backgroundColor: Colors.white,
        marginBottom: Spacing.xl,
    },
    acknowledgeRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 4,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.border,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    acknowledgeText: {
        flex: 1,
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
        fontWeight: '500',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.lg,
    },
    inputSection: {
        width: '100%',
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 8,
    },
    textArea: {
        backgroundColor: Colors.offWhite,
        borderRadius: Sizes.radiusMd,
        padding: Spacing.md,
        height: 120,
        textAlignVertical: 'top',
        fontSize: 14,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    charCount: {
        alignItems: 'flex-end',
        marginTop: 6,
    },
    countText: {
        fontSize: 11,
        fontWeight: '600',
    },
    countValid: { color: Colors.success },
    countInvalid: { color: Colors.border },
    emergencyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    emergencyInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    emergencyLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginLeft: 8,
    },
    emergencyInputFade: {
        marginTop: Spacing.md,
    },
    emergencyInput: {
        backgroundColor: 'rgba(255, 82, 82, 0.05)',
        borderRadius: Sizes.radiusMd,
        padding: Spacing.md,
        fontSize: 14,
        color: Colors.danger,
        borderWidth: 1,
        borderColor: 'rgba(255, 82, 82, 0.1)',
    },
    alternativesList: {
        marginBottom: Spacing.xl,
    },
    altItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: Spacing.lg,
        borderRadius: Sizes.radiusMd,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        ...Shadow.light,
    },
    altItemSelected: {
        borderColor: Colors.primary,
        backgroundColor: 'rgba(86, 7, 119, 0.02)',
        borderWidth: 2,
    },
    altMain: {
        flex: 1,
    },
    altName: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: 4,
    },
    altReason: {
        fontSize: 12,
        color: Colors.textSecondary,
        lineHeight: 16,
    },
    footerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.lg,
    },
    backButton: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        marginRight: Spacing.md,
    },
    backButtonText: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.textSecondary,
    }
});

export default RiskResultScreen;
