import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, Image } from 'react-native';

import { useAuth } from '../contexts/AuthContext';
import { BeeColors } from '../constants/Colors';
import eyeClosed from '../assets/eye_closed.png';
import eyeOpen from '../assets/eye_open.png';

const AuthScreen = () => {
  const { signIn, signUp, user } = useAuth();
  
  // Rensa formuläret när man loggas ut
  React.useEffect(() => {
    if (!user) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
    }
  }, [user]);
  
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Saknas uppgifter', 'Fyll i både e-post och lösenord.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('För kort lösenord', 'Lösenordet måste vara minst 8 tecken.');
      return;
    }

    setLoading(true);
    const { error } = mode === 'login'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);
    setLoading(false);

    if (error) {
      let errorMsg = error.message;
      if (error.message === 'Invalid login credentials') {
        errorMsg = 'Fel e-post eller lösenord.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMsg = 'Du måste bekräfta din e-post först. Kolla din inkorg!';
      }
      
      if (Platform.OS === 'web') {
        alert('⚠️ ' + errorMsg);
      } else {
        Alert.alert('Något gick fel', errorMsg);
      }
    } else if (mode === 'signup') {
      setMode('login'); // Växla till login-flik
      if (Platform.OS === 'web') {
        alert('📬 Konto skapat!\n\nVi har skickat ett bekräftelsemejl till ' + email + '\n\nKlicka på länken i mejlet, sedan kan du logga in här.');
      } else {
        Alert.alert(
          '📬 Bekräfta din e-post',
          'Vi har skickat en bekräftelsemejl till ' + email + '. Klicka på länken i mejlet och logga sedan in här.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <Text style={styles.logo}>🐝</Text>
        <Text style={styles.title}>Obzzerve</Text>
        <Text style={styles.subtitle}>Samla naturens nektar</Text>

        {/* Flikar */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, mode === 'login' && styles.tabActive]}
            onPress={() => setMode('login')}
          >
            <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Logga in</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'signup' && styles.tabActive]}
            onPress={() => setMode('signup')}
          >
            <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Skapa konto</Text>
          </TouchableOpacity>
        </View>

        {/* Formulär */}
        <View style={styles.form}>
          <Text style={styles.label}>E-post</Text>
          <TextInput
            style={styles.input}
            placeholder="dinepost@exempel.se"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>Lösenord</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Ditt lösenord"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Image 
                source={showPassword ? eyeOpen : eyeClosed} 
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? '...' : mode === 'login' ? '🍯 Logga in' : '🐝 Skapa konto'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BeeColors.honeycomb },
  inner: {
    flexGrow: 1, justifyContent: 'center',
    alignItems: 'center', padding: 24,
  },
  logo: { fontSize: 72, marginBottom: 8 },
  title: {
    fontSize: 32, fontWeight: 'bold',
    color: BeeColors.honey, marginBottom: 4,
  },
  subtitle: {
    fontSize: 16, color: BeeColors.honeyDark,
    fontStyle: 'italic', marginBottom: 36,
  },
  tabRow: {
    flexDirection: 'row', backgroundColor: BeeColors.white,
    borderRadius: 12, padding: 4, marginBottom: 24, width: '100%',
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
  },
  tabActive: { backgroundColor: BeeColors.honey },
  tabText: { fontSize: 15, fontWeight: '600', color: BeeColors.honeyDark },
  tabTextActive: { color: BeeColors.white },
  form: {
    width: '100%', backgroundColor: BeeColors.white,
    borderRadius: 16, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  label: {
    fontSize: 14, fontWeight: '600',
    color: BeeColors.honeyDark, marginBottom: 6,
  },
  input: {
    borderWidth: 2, borderColor: BeeColors.honeyLight,
    borderRadius: 10, padding: 12, fontSize: 16,
    backgroundColor: BeeColors.honeycomb, marginBottom: 16,
    color: '#333',
  },
  passwordContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 2, borderColor: BeeColors.honeyLight,
    borderRadius: 10, backgroundColor: BeeColors.honeycomb,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1, padding: 12, fontSize: 16, color: '#333',
  },
  eyeButton: {
    padding: 12,
  },
  eyeIcon: { width: 24, height: 24 },
  button: {
    backgroundColor: BeeColors.honey, padding: 16,
    borderRadius: 12, alignItems: 'center', marginTop: 4,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
  buttonDisabled: { backgroundColor: BeeColors.honeyLight },
  buttonText: { color: BeeColors.white, fontSize: 18, fontWeight: 'bold' },
});

export default AuthScreen;