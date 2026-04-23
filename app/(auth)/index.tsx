import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../lib/auth';

const RED = '#E2231A';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) return;
    if (mode === 'signup' && !username.trim()) return;
    setLoading(true);
    const error =
      mode === 'signin'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password, username.trim());
    setLoading(false);
    if (error) Alert.alert('Erreur', error);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.emoji}>🍽️</Text>
        <Text style={styles.title}>Michelin Quest</Text>
        <Text style={styles.sub}>
          {mode === 'signin' ? 'Connectez-vous pour continuer' : 'Créez votre compte'}
        </Text>

        {mode === 'signup' && (
          <TextInput
            style={styles.input}
            placeholder="Nom d'utilisateur"
            placeholderTextColor="#9B9B9B"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            returnKeyType="next"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#9B9B9B"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="next"
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          placeholderTextColor="#9B9B9B"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>
            {loading
              ? 'Chargement...'
              : mode === 'signin'
                ? 'Se connecter'
                : 'Créer un compte'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
          <Text style={styles.toggle}>
            {mode === 'signin'
              ? "Pas encore de compte ? S'inscrire"
              : 'Déjà un compte ? Se connecter'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  inner: { flex: 1, paddingHorizontal: 32, justifyContent: 'center' },
  emoji: { fontSize: 56, textAlign: 'center', marginBottom: 12 },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 6,
  },
  sub: { fontSize: 14, color: '#9B9B9B', textAlign: 'center', marginBottom: 32 },
  input: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: '#1A1A1A',
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  btn: {
    backgroundColor: RED,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  toggle: { textAlign: 'center', color: RED, fontWeight: '600', fontSize: 14 },
});
