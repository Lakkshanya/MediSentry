import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, StatusBar, Image } from 'react-native';
import api from '../services/api';

// Simple MultiSelect Component (Mock for now, can be expanded)
const MultiSelect = ({ label, options, selected, onToggle }) => (
    <View style={styles.multiSelectContainer}>
        <Text style={styles.label}>{label}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
            {options.map((opt) => {
                const isSelected = selected.includes(opt);
                return (
                    <TouchableOpacity
                        key={opt}
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

const PrescriptionEntryScreen = ({ navigation }) => {
    const [patientName, setPatientName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('Male');

    // MultiSelect States
    const [allergies, setAllergies] = useState([]);
    const [conditions, setConditions] = useState([]);

    const [drugInput, setDrugInput] = useState('');
    const [drugs, setDrugs] = useState([]);
    const [loading, setLoading] = useState(false);

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
        setDrugs([...drugs, { drug_name: drugInput, dosage: '10mg', frequency: 'Daily' }]); // Default dosage for demo
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
            // 1. Create Patient (or Update)
            const patientRes = await api.post('/patients/', {
                name: patientName,
                age: parseInt(age),
                gender: gender,
                medical_conditions: conditions,
                allergies: allergies
            });
            const pid = patientRes.data.id;

            // 2. Create Prescription
            const prescriptionData = {
                patient: pid,
                drugs: drugs
            };
            const presRes = await api.post('/prescriptions/', prescriptionData);

            // 3. Analyze
            const analysisRes = await api.post('/analytics/predict/', {
                drugs: drugs.map(d => d.drug_name)
            });

            setLoading(false);
            navigation.navigate('RiskResult', {
                prescription: presRes.data,
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
        <ScrollView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>New Prescription</Text>
                <Text style={styles.headerSub}>Enter patient details for analysis</Text>
            </View>

            <View style={styles.card}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Patient Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Ramesh Kumar"
                        value={patientName}
                        onChangeText={setPatientName}
                    />
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={[styles.inputGroup, { width: '48%' }]}>
                        <Text style={styles.label}>Age</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="65"
                            value={age}
                            onChangeText={setAge}
                            keyboardType="numeric"
                        />
                    </View>
                    <View style={[styles.inputGroup, { width: '48%' }]}>
                        <Text style={styles.label}>Gender</Text>
                        <View style={{ flexDirection: 'row', marginTop: 5 }}>
                            <TouchableOpacity onPress={() => setGender('Male')} style={[styles.genderBtn, gender === 'Male' && styles.genderActive]}>
                                <Text style={[styles.genderText, gender === 'Male' && { color: '#fff' }]}>M</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setGender('Female')} style={[styles.genderBtn, gender === 'Female' && styles.genderActive]}>
                                <Text style={[styles.genderText, gender === 'Female' && { color: '#fff' }]}>F</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View style={styles.divider} />

                <MultiSelect
                    label="Allergies (Select if any)"
                    options={allergyOptions}
                    selected={allergies}
                    onToggle={(item) => toggleSelection(allergies, setAllergies, item)}
                />

                <MultiSelect
                    label="Medical Conditions"
                    options={conditionOptions}
                    selected={conditions}
                    onToggle={(item) => toggleSelection(conditions, setConditions, item)}
                />

                <View style={styles.divider} />

                <Text style={styles.sectionHeader}>Prescribed Drugs</Text>
                <View style={styles.addDrugRow}>
                    <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        placeholder="Drug Name (e.g. Warfarin)"
                        value={drugInput}
                        onChangeText={setDrugInput}
                    />
                    <TouchableOpacity style={styles.addBtn} onPress={addDrug}>
                        <Text style={styles.addBtnText}>+ ADD</Text>
                    </TouchableOpacity>
                </View>

                {drugs.map((d, index) => (
                    <View key={index} style={styles.drugItem}>
                        <Text style={styles.drugName}>{d.drug_name}</Text>
                        <TouchableOpacity onPress={() => removeDrug(index)}>
                            <Text style={styles.removeText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                {drugs.length === 0 && <Text style={styles.emptyText}>No drugs added yet.</Text>}

            </View>

            <View style={styles.footer}>
                {loading ? (
                    <ActivityIndicator size="large" color="#1a73e8" />
                ) : (
                    <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze}>
                        <Text style={styles.analyzeBtnText}>Analyze Risk ⚡</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    header: { backgroundColor: '#1a73e8', padding: 20, paddingTop: 40, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginBottom: 20 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
    headerSub: { fontSize: 13, color: '#bbdefb' },
    card: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 15, padding: 20, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1 },
    inputGroup: { marginBottom: 15 },
    label: { fontSize: 12, fontWeight: '600', color: '#666', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, padding: 10, fontSize: 16, backgroundColor: '#fafafa' },
    genderBtn: { borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 5, marginRight: 10 },
    genderActive: { backgroundColor: '#1a73e8', borderColor: '#1a73e8' },
    genderText: { fontWeight: 'bold', color: '#666' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 15 },
    multiSelectContainer: { marginBottom: 15 },
    chip: { backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8 },
    chipActive: { backgroundColor: '#e3f2fd', borderWidth: 1, borderColor: '#1a73e8' },
    chipText: { fontSize: 13, color: '#333' },
    chipTextActive: { color: '#1a73e8', fontWeight: 'bold' },
    sectionHeader: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    addDrugRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    addBtn: { backgroundColor: '#2e7d32', padding: 12, borderRadius: 8, marginLeft: 10 },
    addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    drugItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8, marginBottom: 5, borderLeftWidth: 3, borderLeftColor: '#1a73e8' },
    drugName: { fontWeight: 'bold', fontSize: 15, color: '#333' },
    removeText: { color: '#d32f2f', fontWeight: 'bold', fontSize: 16 },
    emptyText: { textAlign: 'center', color: '#999', fontStyle: 'italic', marginVertical: 10 },
    footer: { padding: 20 },
    analyzeBtn: { backgroundColor: '#d32f2f', padding: 18, borderRadius: 12, alignItems: 'center', shadowColor: '#d32f2f', elevation: 5 },
    analyzeBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});

export default PrescriptionEntryScreen;
