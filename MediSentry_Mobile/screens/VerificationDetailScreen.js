import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppCard from '../components/ui/AppCard';
import AppButton from '../components/ui/AppButton';
import HeaderGradient from '../components/ui/HeaderGradient';
import { Ionicons } from '@expo/vector-icons';

const VerificationDetailScreen = ({ route, navigation }) => {
    const insets = useSafeAreaInsets();
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
                'Verification Complete',
                `The prescription has been successfully ${actionType.toLowerCase()}ed.`,
                [{ text: 'Return to Dashboard', onPress: () => navigation.goBack() }]
            );
        } catch (e) {
            Alert.alert('System Error', 'Failed to synchronize verification action with the server.');
        } finally {
            setLoading(false);
        }
    };

    const isFlagged = prescription.status === 'FLAGGED';
    const riskColor = (isFlagged || prescription.risk_level === 'HIGH') ? Colors.danger : (prescription.risk_level === 'MEDIUM' ? Colors.warning : Colors.success);
    const riskBg = (isFlagged || prescription.risk_level === 'HIGH') ? 'rgba(211, 47, 47, 0.05)' : (prescription.risk_level === 'MEDIUM' ? 'rgba(245, 124, 0, 0.05)' : 'rgba(46, 125, 50, 0.05)');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                
                <HeaderGradient height={100}>
                        <View style={[styles.header, { flex: 1 }]}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                                <Ionicons name="arrow-back" size={24} color={Colors.white} />
                            </TouchableOpacity>
                            <Text style={styles.headerTitle}>Review Details</Text>
                            <View style={{ width: 40 }} />
                        </View>
                </HeaderGradient>

                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <AppCard style={[styles.riskCard, { borderColor: riskColor }]}>
                        <View style={styles.riskHeader}>
                            <Ionicons name={isFlagged ? "flag" : "shield-checkmark"} size={20} color={riskColor} />
                            <Text style={[styles.riskTitle, { color: riskColor }]}>
                                {isFlagged ? 'PHARMACIST FLAG ACTIVE' : `AI Safety Score: ${prescription.risk_level}`}
                            </Text>
                        </View>

                        {prescription.risk_level === 'HIGH' && (
                            <View style={styles.justificationBlock}>
                                <Text style={styles.labelDark}>DOCTOR'S JUSTIFICATION</Text>
                                <Text style={styles.justText}>{prescription.clinical_justification || "No clinical justification provided by prescriber."}</Text>
                                
                                {prescription.is_emergency_override && (
                                    <View style={styles.emergencyBadge}>
                                        <Ionicons name="flash" size={14} color={Colors.danger} />
                                        <Text style={styles.emergencyLabel}>EMERGENCY OVERRIDE: {prescription.emergency_reason}</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </AppCard>

                    <AppCard style={styles.detailsCard}>
                        <View style={styles.row}>
                             <View style={styles.infoGroup}>
                                <Text style={styles.label}>PRESCRIBER</Text>
                                <Text style={styles.primaryName}>Dr. {prescription.doctor_name || 'Anonymous'}</Text>
                                <Text style={styles.secondaryName}>{prescription.doctor_specialization || 'General Practitioner'}</Text>
                             </View>
                             <View style={styles.statusGroup}>
                                <Text style={styles.label}>CURRENT STATUS</Text>
                                <View style={[styles.statusBadge, { backgroundColor: riskBg }]}>
                                    <Text style={[styles.statusText, { color: riskColor }]}>{prescription.status}</Text>
                                </View>
                             </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.infoGroup}>
                            <Text style={styles.label}>PATIENT</Text>
                            <Text style={styles.primaryName}>{prescription.patient_name || `ID: #${prescription.patient}`}</Text>
                        </View>
                    </AppCard>

                    {showFlagOptions && (
                        <AppCard style={styles.actionCard}>
                            <Text style={styles.cardSectionLabel}>SET FLAG PARAMETERS</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={flagReason}
                                    onValueChange={(val) => setFlagReason(val)}
                                    style={styles.picker}
                                >
                                    <Picker.Item label="Drug–Drug Interaction" value="Drug–drug interaction" />
                                    <Picker.Item label="Allergy Conflict" value="Allergy conflict" />
                                    <Picker.Item label="Dosage Threshold Exceeded" value="Dose exceeds limit" />
                                    <Picker.Item label="Superior Alternative Recommended" value="Better alternative exists" />
                                </Picker>
                            </View>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Details for flagging..."
                                placeholderTextColor={Colors.border}
                                value={comment}
                                onChangeText={setComment}
                            />
                            <AppButton 
                                title="Confirm Safety Flag" 
                                onPress={() => handleAction('FLAG')}
                                loading={loading}
                            />
                        </AppCard>
                    )}

                    {showSuggestOptions && (
                        <AppCard style={styles.actionCard}>
                            <Text style={styles.cardSectionLabel}>CLINICAL RECOMMENDATION</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="State recommended alternative therapy or dosage adjustment..."
                                placeholderTextColor={Colors.border}
                                multiline
                                value={suggestion}
                                onChangeText={setSuggestion}
                            />
                            <AppButton 
                                title="Transmit Suggestion" 
                                onPress={() => handleAction('SUGGEST')}
                                loading={loading}
                            />
                        </AppCard>
                    )}
                </ScrollView>

                <View style={[styles.actionToolbar, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
                    {!showFlagOptions && !showSuggestOptions ? (
                        <View style={styles.toolbarInner}>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => setShowFlagOptions(true)}>
                                <Ionicons name="flag-outline" size={20} color={Colors.danger} />
                                <Text style={[styles.toolLabel, { color: Colors.danger }]}>FLAG</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => setShowSuggestOptions(true)}>
                                <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
                                <Text style={[styles.toolLabel, { color: Colors.primary }]}>SUGGEST</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => handleAction('APPROVE')}>
                                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.success} />
                                <Text style={[styles.toolLabel, { color: Colors.success }]}>APPROVE</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.toolBtn} onPress={() => handleAction('REJECT')}>
                                <Ionicons name="close-circle-outline" size={20} color={Colors.text} />
                                <Text style={[styles.toolLabel, { color: Colors.text }]}>REJECT</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity 
                            style={styles.cancelAction} 
                            onPress={() => { setShowFlagOptions(false); setShowSuggestOptions(false); }}
                        >
                            <Ionicons name="close" size={20} color={Colors.white} />
                            <Text style={styles.cancelActionText}>ABORT ACTION</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
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
        fontSize: 18, // Medium/Standard size
        fontWeight: '800',
        color: Colors.white,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: 0, // Content overlaps using negative margin
        paddingBottom: 140, // More space for floating toolbar
    },
    riskCard: {
        marginTop: Spacing.md, 
        padding: Spacing.lg,
        borderLeftWidth: 4,
        borderRadius: Sizes.radiusMd,
        backgroundColor: Colors.white,
        ...Shadow.medium,
    },
    riskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    riskTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginLeft: 10,
    },
    justificationBlock: {
        backgroundColor: Colors.offWhite,
        padding: Spacing.md,
        borderRadius: Sizes.radiusMd,
    },
    labelDark: {
        fontSize: 10,
        fontWeight: '800',
        color: Colors.textSecondary,
        letterSpacing: 0.5,
        marginBottom: 6,
    },
    justText: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
        fontStyle: 'italic',
        marginBottom: Spacing.md,
    },
    emergencyBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: Spacing.sm,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(211, 47, 47, 0.1)',
    },
    emergencyLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.danger,
        marginLeft: 6,
    },
    detailsCard: {
        marginTop: Spacing.lg,
        padding: Spacing.lg,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoGroup: {
        flex:1,
    },
    statusGroup: {
        alignItems: 'flex-end',
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.textSecondary,
        letterSpacing: 1,
        marginBottom: 4,
    },
    primaryName: {
        fontSize: 16, // Medium size for clarity
        fontWeight: '800',
        color: Colors.text,
    },
    secondaryName: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 20,
        marginTop: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.xl,
    },
    actionCard: {
        marginTop: Spacing.lg,
        padding: Spacing.lg,
    },
    cardSectionLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: Colors.text,
        letterSpacing: 0.5,
        marginBottom: Spacing.md,
    },
    pickerContainer: {
        backgroundColor: Colors.offWhite,
        borderRadius: Sizes.radiusMd,
        overflow: 'hidden',
        marginBottom: Spacing.md,
    },
    picker: {
        height: 50,
    },
    commentInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: Sizes.radiusMd,
        padding: Spacing.md,
        fontSize: 14,
        color: Colors.text,
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    textArea: {
        backgroundColor: '#F8FAFC',
        borderRadius: Sizes.radiusMd,
        padding: Spacing.md,
        fontSize: 14,
        color: Colors.text,
        height: 120,
        textAlignVertical: 'top',
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    actionToolbar: {
        position: 'absolute',
        bottom: 30, // Floating effect pushed up
        left: 20,
        right: 20,
        backgroundColor: Colors.white,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: Sizes.radiusFull, // Capsule shape
        ...Shadow.heavy,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    toolbarInner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toolBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 2,
        flex: 1,
    },
    toolLabel: {
        fontSize: 10,
        fontWeight: '900',
        marginTop: 4,
        letterSpacing: 0.5,
    },
    cancelAction: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: Sizes.radiusMd,
        marginBottom: Spacing.sm,
        gap: 8,
    },
    cancelActionText: {
        color: Colors.white,
        fontWeight: '800',
        fontSize: 14,
    }
});

export default VerificationDetailScreen;
