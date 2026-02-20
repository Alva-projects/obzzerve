import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';



const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup } = useAuth();

  const PASSWORD_REGEX = /^(?=.*[A-Z]).{8,}$/;

const hasMinLength = password.length >= 8;
const hasUppercase = /[A-Z]/.test(password);
const isPasswordValid = hasMinLength && hasUppercase;
    
const handleSubmit = async () => {
  if (!email || !password) {
    Alert.alert('Fel', 'Fyll i alla fält');
    return;
  }

  if (isSignup && !isPasswordValid) {
    Alert.alert(
      'Fel',
      'Lösenordet måste vara minst 8 tecken långt och innehålla minst en stor bokstav'
    );
    return;
  }

  setLoading(true);

  try {
    if (isSignup) {
      await signup(email, password);
      Alert.alert(
        'Välkommen!', 
        'Kolla din e-post för att bekräfta ditt konto.'
      );
    } else {
      await login(email, password);
      Alert.alert('Välkommen tillbaka!', 'Du är nu inloggad');
    }
  } catch (error) {
    console.error(error);
    let message = 'Ett fel uppstod';

    if (error.message.includes('Email not confirmed')) {
      message = 'Du måste bekräfta din e-postadress först';
    } else if (error.message.includes('Invalid login credentials')) {
      message = 'Fel e-post eller lösenord';
    } else if (error.message.includes('User already registered')) {
      message = 'E-postadressen används redan';
    } else {
      message = error.message;
    }

    Alert.alert('Fel', message);
  } finally {
    setLoading(false);
  }
};


  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>🌿</Text>
        <Text style={styles.title}>Obzzserve</Text>
        <Text style={styles.subtitle}>
          {isSignup ? 'Skapa ett konto' : 'Logga in'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="E-postadress"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <TextInput
  style={styles.input}
  placeholder={isSignup ? "Lösenord (minst 8 tecken, en stor bokstav)" : "Lösenord"}
  value={password}
  onChangeText={setPassword}
  secureTextEntry={!showPassword}
  autoCapitalize="none"
  autoComplete="password"
/>
<TouchableOpacity
  style={styles.showPasswordButton}
  onPress={() => setShowPassword(!showPassword)}
>
  <Text style={styles.showPasswordText}>
    {showPassword ? 'Dölj' : 'Visa'}
  </Text>
  </TouchableOpacity>


{isSignup && (
  <View style={styles.passwordHelp}>
    <Text style={styles.passwordTip}>
      💡 Tips: Skriv en mening du minns
    </Text>
    <Text style={[styles.passwordRule, hasMinLength && styles.passwordRuleValid]}>
      {hasMinLength ? '✔' : '•'} Minst 8 tecken
    </Text>
    <Text style={[styles.passwordRule, hasUppercase && styles.passwordRuleValid]}>
      {hasUppercase ? '✔' : '•'} Minst en stor bokstav
    </Text>
  </View>
)}


        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Laddar...' : (isSignup ? 'Skapa konto' : 'Logga in')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.switchButton}
          onPress={() => setIsSignup(!isSignup)}
        >
          <Text style={styles.switchText}>
            {isSignup 
              ? 'Har du redan ett konto? Logga in' 
              : 'Inget konto? Skapa ett'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.privacyText}>
          🇪🇺 Din data lagras säkert i EU
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2d5016',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 20,
    padding: 10,
  },
  switchText: {
    textAlign: 'center',
    color: '#4CAF50',
    fontSize: 16,
  },
  privacyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 20,
  },
  passwordHelp: {
  marginTop: 10,
  padding: 12,
  backgroundColor: '#FFF9E6',
  borderRadius: 8,
},

passwordTip: {
  fontSize: 13,
  marginBottom: 6,
  color: '#666',
},

passwordRule: {
  fontSize: 14,
  color: '#999',
  marginBottom: 2,
},

passwordRuleValid: {
  color: '#2E7D32',
  fontWeight: '600',
},
showPasswordButton: {
  position: 'absolute',
  right: 15,
  top: 18,
},

showPasswordText: {
  color: '#4CAF50',
  fontWeight: '600',
},
});

export default LoginScreen;