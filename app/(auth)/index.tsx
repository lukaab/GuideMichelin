import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../lib/auth';

const MICHELIN_RED = '#E2231A';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!email || !password) { setError('Email et mot de passe requis'); return; }
    if (mode === 'signup' && !username) { setError('Nom d\'utilisateur requis'); return; }
    if (password.length < 6) { setError('Mot de passe : 6 caractères minimum'); return; }

    setLoading(true);
    const err = mode === 'login'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password, username.trim());
    setLoading(false);

    if (err) setError(err);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🍽️</Text>
          <Text style={styles.heroTitle}>MICHELIN QUEST</Text>
          <Text style={styles.heroSub}>Explorez · Collectionnez · Progressez</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Mode toggle */}
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'login' && styles.toggleActive]}
              onPress={() => { setMode('login'); setError(null); }}
            >
              <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>
                Connexion
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, mode === 'signup' && styles.toggleActive]}
              onPress={() => { setMode('signup'); setError(null); }}
            >
              <Text style={[styles.toggleText, mode === 'signup' && styles.toggleTextActive]}>
                Créer un compte
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cardTitle}>
            {mode === 'login' ? 'Bon retour 👋' : 'Rejoignez l\'aventure 🚀'}
          </Text>

          {mode === 'signup' && (
            <View style={styles.field}>
              <Text style={styles.label}>Nom d'utilisateur</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: GourmetExplorer"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="vous@exemple.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="6 caractères minimum"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </View>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitText}>
                {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.switchText}>
            {mode === 'login' ? 'Pas encore de compte ? ' : 'Déjà inscrit ? '}
            <Text
              style={styles.switchLink}
              onPress={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
            >
              {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
            </Text>
          </Text>
        </View>

        {/* Badges preview */}
        <View style={styles.preview}>
          {['⭐', '😊', '🏙️', '🔥', '👨‍🍳'].map((e) => (
            <Text key={e} style={styles.previewEmoji}>{e}</Text>
          ))}
          <Text style={styles.previewText}>5 badges à débloquer</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 48,
    paddingBottom: 40,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 36,
  },
  heroEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 4,
  },
  heroSub: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 6,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 3,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  toggleActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#111827',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
  },
  submitBtn: {
    backgroundColor: MICHELIN_RED,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 16,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  switchText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B7280',
  },
  switchLink: {
    color: MICHELIN_RED,
    fontWeight: '700',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  previewEmoji: {
    fontSize: 22,
  },
  previewText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
});
