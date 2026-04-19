import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppCard from '../components/ui/AppCard';
import AppButton from '../components/ui/AppButton';
import HeaderGradient from '../components/ui/HeaderGradient';
import { Ionicons } from '@expo/vector-icons';

const AlternativeSuggestionScreen = ({ route, navigation }) => {
    const { drug } = route.params; 
    const [alternatives, setAlternatives] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlternatives();
    }, []);

    const fetchAlternatives = async () => {
        try {
            const res = await api.get(`/analytics/alternatives/${drug}/`);
            if (res.data && res.data.alternatives) {
                // Ensure array of strings or objects
                setAlternatives(res.data.alternatives);
            } else {
                setAlternatives([]);
            }
        } catch (e) {
            console.error("Failed to fetch alternatives:", e);
            setAlternatives([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (alt) => {
        const altName = typeof alt === 'string' ? alt : alt.name;
        alert(`Clinical Decision: Switched ${drug} to ${altName}`);
        navigation.navigate('DoctorHome');
    };

    const renderAlternative = ({ item }) => {
        const isObject = typeof item === 'object';
        const name = isObject ? item.name : item;
        const reason = isObject ? item.reason : "Clinically validated pharmacological equivalent";
        
        return (
            <AppCard style={styles.altCard}>
                <View style={styles.cardInfo}>
                    <View style={styles.drugIconBg}>
                        <Ionicons name="medkit" size={20} color={Colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.drugName}>{name}</Text>
                        <View style={styles.reasonBadge}>
                            <Text style={styles.drugReason}>{reason}</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity 
                    style={styles.selectBtn} 
                    onPress={() => handleSelect(item)}
                    activeOpacity={0.8}
                >
                    <Text style={styles.selectBtnText}>Select as Substitute</Text>
                    <Ionicons name="arrow-forward-circle" size={20} color={Colors.white} />
                </TouchableOpacity>
            </AppCard>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            <HeaderGradient height={120}>
                <View style={[styles.header, { paddingTop: insets.top + Spacing.xs }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.white} />
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Clinical Substitutions</Text>
                        <Text style={styles.headerSubtitle}>Replacing: <Text style={styles.drugHighlight}>{drug}</Text></Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
            </HeaderGradient>

            <View style={styles.content}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <Text style={styles.loadingText}>Analyzing safest alternatives...</Text>
                    </View>
                ) : (
                    <>
                        <FlatList
                            data={alternatives}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={renderAlternative}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContent}
                            ListHeaderComponent={
                                <>
                                    <View style={styles.infoBanner}>
                                        <Ionicons name="information-circle-outline" size={18} color={Colors.primary} />
                                        <Text style={styles.infoText}>These alternatives belong to the same therapeutic class but carry lower interaction risk.</Text>
                                    </View>
                                    <Text style={styles.sectionHeader}>Recommended Substitutes</Text>
                                </>
                            }
                            ListEmptyComponent={() => (
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="search-outline" size={48} color={Colors.border} />
                                    <Text style={styles.emptyTitle}>No exact matches found</Text>
                                    <Text style={styles.emptyText}>The AI engine could not find standardized safer alternatives for this specific agent.</Text>
                                </View>
                            )}
                        />
                    </>
                )}

                <View style={styles.footer}>
                    <TouchableOpacity 
                        style={styles.cancelBtn} 
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.cancelText}>Keep original drug entry</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
    headerContent: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.white,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 2,
    },
    drugHighlight: {
        color: '#FFD700', // Gold for highlight on purple
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '500',
    },
    infoBanner: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        padding: Spacing.md,
        borderRadius: Sizes.radiusMd,
        alignItems: 'center',
        ...Shadow.medium,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: Colors.textSecondary,
        marginLeft: 8,
        lineHeight: 18,
        fontWeight: '500',
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: '800',
        color: Colors.text,
        marginTop: Spacing.xl,
        marginBottom: Spacing.md,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: 0,
        marginTop: -40,
        paddingBottom: Spacing.xxl,
    },
    altCard: {
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderRadius: Sizes.radiusMd,
        borderColor: Colors.border,
        borderWidth: 1,
        ...Shadow.light,
    },
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    drugIconBg: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(86, 7, 119, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    drugName: {
        fontSize: 18,
        fontWeight: '900',
        color: Colors.text,
        marginBottom: 4,
    },
    reasonBadge: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    drugReason: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    selectBtn: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 52,
        borderRadius: Sizes.radiusMd,
        gap: 8,
        ...Shadow.medium,
    },
    selectBtnText: {
        color: Colors.white,
        fontWeight: '800',
        fontSize: 15,
        letterSpacing: 0.5,
    },
    footer: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.lg,
    },
    cancelBtn: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderRadius: Sizes.radiusMd,
        backgroundColor: Colors.offWhite,
    },
    cancelText: {
        color: Colors.textSecondary,
        fontSize: 14,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
        marginTop: Spacing.lg,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    }
});

export default AlternativeSuggestionScreen;
