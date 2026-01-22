import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const DoctorHomeScreen = ({ navigation }) => {
    const { logout, userInfo } = useContext(AuthContext);
    const [stats, setStats] = useState({ highRisk: 0, pending: 0 });

    useEffect(() => {
        // Mock stats or fetch real ones
        // In real app: const res = await api.get('/analytics/stats');
        setStats({ highRisk: 2, pending: 5 });
    }, []);

    return (
        <ScrollView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />

            {/* Header Section */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hello,</Text>
                    <Text style={styles.doctorName}>Dr. {userInfo?.username || 'Clinician'} 👋</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.highRisk}</Text>
                    <Text style={styles.statLabel}>High Risk Alerts</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.pending}</Text>
                    <Text style={styles.statLabel}>Pending Reviews</Text>
                </View>
            </View>

            {/* Main Action */}
            <View style={styles.actionSection}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <TouchableOpacity
                    style={styles.mainActionBtn}
                    onPress={() => navigation.navigate('PrescriptionEntry')}
                >
                    <Text style={styles.actionIcon}>📝</Text>
                    <View>
                        <Text style={styles.actionTitle}>New Prescription Analysis</Text>
                        <Text style={styles.actionDesc}>Check interactions & risks</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.mainActionBtn, { marginTop: 15, backgroundColor: '#fff' }]}
                    onPress={() => navigation.navigate('History')}
                >
                    <Text style={styles.actionIcon}>📂</Text>
                    <View>
                        <Text style={[styles.actionTitle, { color: '#333' }]}>Patient History</Text>
                        <Text style={styles.actionDesc}>Review past logs</Text>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Recent Alerts */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Today's Alerts</Text>
                <View style={[styles.alertCard, { borderLeftColor: '#d32f2f' }]}>
                    <View style={styles.alertHeader}>
                        <Text style={[styles.alertBadge, { backgroundColor: '#ffebee', color: '#d32f2f' }]}>HIGH RISK</Text>
                        <Text style={styles.alertTime}>10:45 AM</Text>
                    </View>
                    <Text style={styles.alertMsg}>Patient: Ramesh Kumar</Text>
                    <Text style={styles.alertDesc}>Interaction: Warfarin + Ibuprofen</Text>
                </View>

                <View style={[styles.alertCard, { borderLeftColor: '#fbc02d' }]}>
                    <View style={styles.alertHeader}>
                        <Text style={styles.alertBadge}>MODERATE</Text>
                        <Text style={styles.alertTime}>09:30 AM</Text>
                    </View>
                    <Text style={styles.alertMsg}>Patient: Sarah Jones</Text>
                    <Text style={styles.alertDesc}>Allergy Warning: Penicillin</Text>
                </View>
            </View>

            {/* Role Switcher (Hidden in Prod) */}
            <View style={styles.footer}>
                <Text style={styles.footerTitle}>Switch Role (Demo)</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => navigation.navigate('PharmacistHome')} style={styles.roleLink}><Text style={styles.linkText}>Pharmacist</Text></TouchableOpacity>
                    <Text> | </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('AdminSummary')} style={styles.roleLink}><Text style={styles.linkText}>Admin</Text></TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f8' },
    header: { backgroundColor: '#1a73e8', padding: 25, paddingTop: 50, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    greeting: { color: '#bbdefb', fontSize: 16 },
    doctorName: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
    logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    statsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: -30, marginHorizontal: 20 },
    statCard: { backgroundColor: '#fff', width: '45%', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1 },
    statNumber: { fontSize: 28, fontWeight: 'bold', color: '#1a73e8' },
    statLabel: { fontSize: 12, color: '#666', marginTop: 5 },
    section: { padding: 20 },
    actionSection: { padding: 20, paddingBottom: 0 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    mainActionBtn: { backgroundColor: '#1a73e8', padding: 20, borderRadius: 15, flexDirection: 'row', alignItems: 'center', elevation: 3 },
    actionIcon: { fontSize: 24, marginRight: 15 },
    actionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    actionDesc: { color: '#bbdefb', fontSize: 13 },
    alertCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10, borderLeftWidth: 5, borderLeftColor: '#fbc02d', marginBottom: 10, elevation: 2 },
    alertHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    alertBadge: { backgroundColor: '#fff9c4', color: '#fbc02d', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, fontSize: 10, fontWeight: 'bold' },
    alertTime: { color: '#999', fontSize: 12 },
    alertMsg: { fontWeight: 'bold', fontSize: 15, color: '#333' },
    alertDesc: { fontSize: 13, color: '#666' },
    footer: { padding: 20, alignItems: 'center', opacity: 0.5 },
    footerTitle: { fontSize: 12, marginBottom: 5 },
    linkText: { color: 'blue', marginHorizontal: 5 }
});

export default DoctorHomeScreen;
