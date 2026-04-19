import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../services/api';
import { Colors, Sizes, Spacing, Shadow } from '../constants/theme';
import AppCard from '../components/ui/AppCard';
import HeaderGradient from '../components/ui/HeaderGradient';
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const loadNotifications = async () => {
        setRefreshing(true);
        try {
            const res = await api.get('/users/notifications/');
            setNotifications(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setRefreshing(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            // Optimistic Update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            // API call would go here
        } catch (e) {
            console.error("Failed to mark as read", e);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const formatTime = (timeStr) => {
        const date = new Date(timeStr);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + date.toLocaleDateString();
    };

    const renderItem = ({ item }) => (
        <AppCard
            style={[styles.notificationCard, !item.is_read && styles.unreadCard]}
            onPress={() => handleMarkRead(item.id)}
        >
            <View style={styles.cardHeader}>
                <View style={[styles.iconContainer, !item.is_read && styles.unreadIcon]}>
                    <Ionicons 
                        name={item.is_read ? "notifications-outline" : "notifications"} 
                        size={20} 
                        color={item.is_read ? Colors.textSecondary : Colors.primary} 
                    />
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.row}>
                        <Text style={[styles.title, !item.is_read && styles.unreadTitle]}>{item.title}</Text>
                        <Text style={styles.time}>{formatTime(item.created_at)}</Text>
                    </View>
                    <Text style={styles.message}>{item.message}</Text>
                </View>
            </View>
            {!item.is_read && <View style={styles.unreadDot} />}
        </AppCard>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            
            <HeaderGradient height={110}>
                <View style={[styles.header, { paddingTop: Spacing.sm }]}>
                    <Text style={styles.headerTitle}>Notifications</Text>
                    <Text style={styles.subtitle}>Real-time system updates and logs</Text>
                </View>
            </HeaderGradient>

            <FlatList
                contentContainerStyle={styles.listContent}
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={loadNotifications} 
                        tintColor={Colors.primary} 
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <View style={styles.emptyCircle}>
                            <Ionicons name="notifications-off-outline" size={48} color={Colors.border} />
                        </View>
                        <Text style={styles.emptyTitle}>All caught up!</Text>
                        <Text style={styles.emptyText}>You don't have any new clinical alerts at the moment.</Text>
                    </View>
                }
                renderItem={renderItem}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: Spacing.lg,
        justifyContent: 'center',
        flex: 1,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: Colors.white,
    },
    subtitle: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '600',
        marginTop: 2,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    notificationCard: {
        marginBottom: Spacing.md,
        padding: Spacing.md,
        position: 'relative',
    },
    unreadCard: {
        backgroundColor: Colors.white,
        borderColor: Colors.primary + '30',
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.offWhite,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    unreadIcon: {
        backgroundColor: Colors.primary + '10',
    },
    contentContainer: {
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.text,
        flex: 1,
        marginRight: 8,
    },
    unreadTitle: {
        color: Colors.primary,
        fontWeight: '800',
    },
    time: {
        fontSize: 9,
        color: Colors.textSecondary,
        fontWeight: '600',
    },
    message: {
        fontSize: 13,
        color: Colors.textSecondary,
        lineHeight: 18,
    },
    unreadDot: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    emptyCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.offWhite,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: Colors.text,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    }
});

export default NotificationsScreen;
