import React from 'react';
import { View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppButton from '../components/ui/AppButton';

const HomePage = ({ navigation }) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Image source={require('../assets/images/Logo.png')} style={styles.logo} resizeMode="contain" />
                        <Text style={styles.brandTitle}>MediSentry AI</Text>
                    </View>

                    {/* Center Image with subtle background */}
                    <View style={styles.illustrationContainer}>
                        <View style={styles.circleBg} />
                        <Image source={require('../assets/images/HomePage.png')} style={styles.illustration} resizeMode="contain" />
                    </View>

                    {/* Text Section */}
                    <View style={styles.textContainer}>
                        <Text style={styles.heading}>
                            Smarter Medication Safety {'\n'}
                            <Text style={styles.headingHighlight}>for Safer Healthcare</Text>
                        </Text>
                        <Text style={styles.subHeading}>
                            Advanced AI-driven prescription auditing for clinical precision and patient safety.
                        </Text>
                    </View>

                    {/* Button Section */}
                    <View style={styles.footer}>
                        <AppButton 
                            title="Get Started" 
                            onPress={() => navigation.navigate('Login')}
                        />
                        <Text style={styles.footerNote}>Smarter Decisions. Safer Prescriptions.</Text>
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 36,
        height: 36,
        marginRight: 10,
    },
    brandTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        letterSpacing: -0.5,
    },
    illustrationContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: Sizes.height * 0.4,
    },
    circleBg: {
        position: 'absolute',
        width: Sizes.width * 0.7,
        height: Sizes.width * 0.7,
        borderRadius: (Sizes.width * 0.7) / 2,
        backgroundColor: 'rgba(86, 7, 119, 0.05)',
    },
    illustration: {
        width: '90%',
        height: '90%',
    },
    textContainer: {
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
    },
    heading: {
        fontSize: 28,
        color: Colors.text,
        fontWeight: '800',
        textAlign: 'center',
        lineHeight: 36,
        marginBottom: Spacing.md,
    },
    headingHighlight: {
        color: Colors.primary,
    },
    subHeading: {
        fontSize: 16,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: Spacing.sm,
    },
    footer: {
        paddingBottom: Spacing.xl,
        alignItems: 'center',
    },
    footerNote: {
        marginTop: Spacing.md,
        fontSize: 12,
        color: Colors.textSecondary,
        fontWeight: '500',
        fontStyle: 'italic',
    },
});

export default HomePage;
