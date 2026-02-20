import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';import { BeeColors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
  const confirmed = Platform.OS === 'web' 
    ? window.confirm('Är du säker på att du vill logga ut?')
    : await new Promise(resolve => {
        Alert.alert(
          'Logga ut',
          'Är du säker på att du vill logga ut?',
          [
            { text: 'Avbryt', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Logga ut', onPress: () => resolve(true), style: 'destructive' },
          ]
        );
      });
  
  if (confirmed) signOut();
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      <Text style={styles.label}>E-post:</Text>
      <Text style={styles.value}>{user?.email || 'Ej inloggad'}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>🔓 Logga ut</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: BeeColors.honeycomb,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BeeColors.honeyDark,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 18,
    color: '#333',
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#DC3545',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: BeeColors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;