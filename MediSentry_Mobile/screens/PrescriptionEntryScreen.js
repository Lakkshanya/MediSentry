import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../services/api';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppCard from '../components/ui/AppCard';
import AppButton from '../components/ui/AppButton';
import AppInput from '../components/ui/AppInput';
import HeaderGradient from '../components/ui/HeaderGradient';
import { Ionicons } from '@expo/vector-icons';

const MultiSelect = ({ label, options, selected, onToggle, icon }) => (
    <View style={styles.multiSelectSection}>
        <View style={styles.sectionHeaderRow}>
            {icon}
            <Text style={styles.sectionLabel}>{label}</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {options.map((opt) => {
                const isSelected = selected.includes(opt);
                return (
                    <TouchableOpacity
                        key={opt}
                        activeOpacity={0.7}
                        style={[styles.chip, isSelected && styles.chipActive]}
                        onPress={() => onToggle(opt)}
                    >
                        <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    </View>
);

const PrescriptionEntryScreen = ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const [patientName, setPatientName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');

    const [allergies, setAllergies] = useState([]);
    const [conditions, setConditions] = useState([]);

    const [drugInput, setDrugInput] = useState('');
    const [customAllergy, setCustomAllergy] = useState('');
    const [customCondition, setCustomCondition] = useState('');
    const [drugs, setDrugs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (route.params?.existingRx) {
            const rx = route.params.existingRx;
            setPatientName(rx.patient_details?.name || rx.patient_name || '');
            setAge(String(rx.patient_details?.age || ''));
            setGender(rx.patient_details?.gender || 'Male');
            setConditions(rx.patient_details?.medical_conditions || []);
            setAllergies(rx.patient_details?.allergies || []);
            setDrugs(rx.drugs.map(d => ({
                drug_name: d.drug_details?.name || d.drug_name,
                dosage: d.dosage || '10mg',
                frequency: d.frequency || 'Daily'
            })));
        }
    }, [route.params?.existingRx]);

    const allergyOptions = ['Penicillin', 'Sulfa', 'Peanuts', 'Latex', 'Aspirin'];
    const conditionOptions = ['Diabetes', 'Hypertension', 'Pregnant', 'Asthma', 'Kidney Disease'];

    const toggleSelection = (list, setList, item) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const addDrug = () => {
        if (!drugInput.trim()) return;
        setDrugs([...drugs, { drug_name: drugInput, dosage: '10mg', frequency: 'Daily' }]);
        setDrugInput('');
    };

    const removeDrug = (index) => {
        const newDrugs = [...drugs];
        newDrugs.splice(index, 1);
        setDrugs(newDrugs);
    };

    const handleAnalyze = async () => {
        if (!patientName || !age || drugs.length < 1) {
            Alert.alert('Incomplete Data', 'Please provide Patient Name, Age, and at least one Drug.');
            return;
        }

        setLoading(true);
        try {
            const patientRes = await api.post('/patients/', {
                name: patientName,
                age: parseInt(age),
                gender: gender,
                medical_conditions: conditions,
                allergies: allergies
            });
            const pid = patientRes.data.id;

            const prescriptionData = {
                patient: pid,
                drugs: drugs
            };
            const presRes = await api.post('/prescriptions/', prescriptionData);

            const analysisRes = await api.post('/analytics/predict/', {
                drugs: drugs.map(d => d.drug_name),
                medical_conditions: conditions,
                allergies: allergies
            });

            // Silently sync the correct risk level — if this fails, handleConfirm will fix it
            const correctRiskLevel = analysisRes.data.risk_level;
            try {
                await api.patch(`/prescriptions/${presRes.data.id}/`, {
                    risk_level: correctRiskLevel
                });
            } catch (patchErr) {
                console.log('[PrescriptionEntry] risk_level sync PATCH failed silently:', patchErr?.message);
            }

            setLoading(false);
            navigation.navigate('RiskResult', {
                prescription: { ...presRes.data, risk_level: correctRiskLevel },
                analysis: analysisRes.data,
                patientName: patientName
            });

        } catch (error) {
            setLoading(false);
            console.log(error);
            Alert.alert('Analysis Failed', 'Could not process prescription. Check network or inputs.');
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
                    <View style={styles.headerText}>
                        <Text style={styles.title}>Prescription Analysis</Text>
                        <Text style={styles.subtitle}>Fill in details for AI safety screening</Text>
                    </View>
                </View>
            </HeaderGradient>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[]}
            >

                <AppCard style={styles.card}>
                    <Text style={styles.cardLabel}>Patient Information</Text>
                    
                    <AppInput
                        label="Full Name"
                        placeholder="John Doe"
                        value={patientName}
                        onChangeText={setPatientName}
                        icon={<Ionicons name="person-outline" size={20} color={Colors.textSecondary} />}
                    />

                    <AppInput
                        label="Age"
                        placeholder="35"
                        value={age}
                        onChangeText={setAge}
                        keyboardType="numeric"
                        icon={<Ionicons name="calendar-outline" size={20} color={Colors.textSecondary} />}
                    />
                    
                    <View style={{ marginBottom: Spacing.md }}>
                        <Text style={styles.fieldLabel}>Gender</Text>
                        <View style={styles.genderContainer}>
                            <TouchableOpacity 
                                onPress={() => setGender('Male')} 
                                style={[styles.genderBtn, gender === 'Male' && styles.genderBtnActive]}
                            >
                                <Ionicons name="male" size={14} color={gender === 'Male' ? Colors.white : Colors.textSecondary} />
                                <Text style={[styles.genderBtnText, gender === 'Male' && styles.genderBtnTextActive]}>MALE</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setGender('Female')} 
                                style={[styles.genderBtn, gender === 'Female' && styles.genderBtnActive]}
                            >
                                <Ionicons name="female" size={14} color={gender === 'Female' ? Colors.white : Colors.textSecondary} />
                                <Text style={[styles.genderBtnText, gender === 'Female' && styles.genderBtnTextActive]}>FEMALE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <MultiSelect
                        label="Medical Conditions"
                        icon={<Ionicons name="pulse" size={18} color={Colors.primary} style={{ marginRight: 6 }} />}
                        options={[...new Set([...conditionOptions, ...conditions])]}
                        selected={conditions}
                        onToggle={(item) => toggleSelection(conditions, setConditions, item)}
                    />

                    <View style={styles.inlineAdd}>
                        <TextInput
                            style={styles.inlineInput}
                            placeholder="Add other condition..."
                            value={customCondition}
                            onChangeText={setCustomCondition}
                        />
                        <TouchableOpacity
                            style={styles.inlineAddBtn}
                            onPress={() => {
                                if (customCondition.trim() && !conditions.includes(customCondition.trim())) {
                                    setConditions([...conditions, customCondition.trim()]);
                                    setCustomCondition('');
                                }
                            }}
                        >
                            <Ionicons name="add" size={24} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <MultiSelect
                        label="Known Allergies"
                        icon={<Ionicons name="alert-circle" size={18} color={Colors.danger} style={{ marginRight: 6 }} />}
                        options={[...new Set([...allergyOptions, ...allergies])]}
                        selected={allergies}
                        onToggle={(item) => toggleSelection(allergies, setAllergies, item)}
                    />

                    <View style={styles.inlineAdd}>
                        <TextInput
                            style={styles.inlineInput}
                            placeholder="Add other allergy..."
                            value={customAllergy}
                            onChangeText={setCustomAllergy}
                        />
                        <TouchableOpacity
                            style={styles.inlineAddBtn}
                            onPress={() => {
                                if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
                                    setAllergies([...allergies, customAllergy.trim()]);
                                    setCustomAllergy('');
                                }
                            }}
                        >
                            <Ionicons name="add" size={24} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                </AppCard>

                <AppCard style={styles.drugCard}>
                    <Text style={styles.cardLabel}>Medications</Text>
                    
                    <View style={styles.addDrugRow}>
                        <View style={{ flex: 1 }}>
                             <AppInput
                                placeholder="Drug name (e.g. Warfarin)"
                                value={drugInput}
                                onChangeText={setDrugInput}
                                icon={<Ionicons name="medkit-outline" size={20} color={Colors.textSecondary} />}
                            />
                        </View>
                        <TouchableOpacity 
                            style={styles.addDrugBtn} 
                            onPress={addDrug}
                        >
                            <Ionicons name="add" size={28} color={Colors.white} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.drugsList}>
                        {drugs.map((d, index) => (
                            <View key={index} style={styles.drugItem}>
                                <View style={styles.drugMain}>
                                    <Text style={styles.drugName}>{d.drug_name}</Text>
                                    <Text style={styles.drugMeta}>{d.dosage} • {d.frequency}</Text>
                                </View>
                                <TouchableOpacity onPress={() => removeDrug(index)} style={styles.removeBtn}>
                                    <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {drugs.length === 0 && (
                            <View style={styles.emptyDrugs}>
                                <Ionicons name="flask-outline" size={32} color={Colors.border} />
                                <Text style={styles.emptyText}>Add at least one drug to analyze.</Text>
                            </View>
                        )}
                    </View>
                </AppCard>

                <View style={styles.actionContainer}>
                    <AppButton 
                        title="Analyse" 
                        onPress={handleAnalyze}
                        loading={loading}
                        icon={<Ionicons name="shield-checkmark" size={20} color={Colors.white} />}
                    />
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
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: 0, // Content overlaps using negative margin
        paddingBottom: Spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    backBtn: {
        marginRight: Spacing.md,
    },
    headerText: {
        flex: 1,
        marginLeft: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.white,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    card: {
        padding: Spacing.lg,
        paddingTop: Spacing.lg,
        marginTop: Spacing.md, 
        marginBottom: Spacing.lg,
        borderRadius: Sizes.radiusMd,
        backgroundColor: Colors.white,
        borderColor: Colors.border,
        borderWidth: 1,
        ...Shadow.light,
    },
    cardLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.lg,
    },
    row: {
        flexDirection: 'row',
    },
    fieldLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.text,
        marginBottom: Spacing.xs,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    genderContainer: {
        flexDirection: 'row',
        height: 50,
        backgroundColor: '#F8FAFC', // Slate 50
        borderRadius: Sizes.radiusMd,
        padding: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    genderBtn: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Sizes.radiusMd - 4,
        gap: 6,
    },
    genderBtnActive: {
        backgroundColor: Colors.primary,
        ...Shadow.light,
    },
    genderBtnText: {
        fontSize: 12,
        fontWeight: '800',
        color: Colors.textSecondary,
    },
    genderBtnTextActive: {
        color: Colors.white,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginVertical: Spacing.xl,
    },
    multiSelectSection: {
        marginBottom: Spacing.md,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        color: Colors.text,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    chipScroll: {
        paddingVertical: 4,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.offWhite,
        marginRight: 8,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    chipActive: {
        backgroundColor: 'rgba(86, 7, 119, 0.1)',
        borderColor: Colors.primary,
    },
    chipText: {
        fontSize: 13,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    chipTextActive: {
        color: Colors.primary,
        fontWeight: '700',
    },
    inlineAdd: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.sm,
        backgroundColor: Colors.offWhite,
        borderRadius: Sizes.radius,
        paddingHorizontal: Spacing.md,
        height: 48,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    inlineInput: {
        flex: 1,
        fontSize: 14,
        color: Colors.text,
        height: '100%',
    },
    inlineAddBtn: {
        padding: 4,
    },
    drugCard: {
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        borderRadius: Sizes.radiusMd,
        backgroundColor: Colors.white,
        borderColor: Colors.border,
        borderWidth: 1,
        ...Shadow.light,
    },
    addDrugRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    addDrugBtn: {
        width: 48,
        height: 48,
        backgroundColor: Colors.primary,
        borderRadius: Sizes.radiusMd,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.sm,
        marginTop: 6, // Align with input
    },
    drugsList: {
        marginTop: Spacing.sm,
    },
    drugItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.offWhite,
        padding: Spacing.md,
        borderRadius: Sizes.radiusMd,
        marginBottom: Spacing.sm,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    drugMain: {
        flex: 1,
    },
    drugName: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.text,
    },
    drugMeta: {
        fontSize: 12,
        color: Colors.textSecondary,
        marginTop: 2,
    },
    removeBtn: {
        padding: Spacing.xs,
    },
    emptyDrugs: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 13,
        color: Colors.textSecondary,
        marginTop: Spacing.sm,
    },
    actionContainer: {
        marginTop: Spacing.md,
    }
});

export default PrescriptionEntryScreen;
