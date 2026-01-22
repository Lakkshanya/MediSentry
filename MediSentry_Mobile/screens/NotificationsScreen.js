import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import api from '../services/api';

const NotificationsScreen = () => {
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

    useEffect(() => {
        loadNotifications();
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNotifications} />}
                ListEmptyComponent={<Text style={styles.empty}>No new notifications.</Text>}
                renderItem={({ item }) => (
                    <TouchableOpacity style={[styles.card, !item.read && styles.unread]}>
                        <View style={styles.row}>
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.time}>{item.time}</Text>
                        </View>
                        <Text style={styles.msg}>{item.message}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    card: { backgroundColor: '#fff', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
    unread: { backgroundColor: '#e3f2fd' },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    title: { fontWeight: 'bold', fontSize: 16, color: '#333' },
    time: { fontSize: 12, color: '#888' },
    msg: { color: '#555' },
    empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default NotificationsScreen;
