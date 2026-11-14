import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { supabase } from '@/lib/supabase';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setMessage(error.message);
    }
    setLoading(false);
  }

  async function signUp() {
    if (password.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        data.session
          ? 'Cuenta creada. Ya puedes configurar tu perfil.'
          : 'Cuenta creada. Revisa tu correo para confirmarla y luego inicia sesión.',
      );
    }
    setLoading(false);
  }

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Accede a tu colección</Text>
      <Text style={styles.description}>
        Usa tu correo y una contraseña para configurar tu perfil público.
      </Text>
      <Text style={styles.label}>Correo</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        placeholder="tu@correo.com"
        placeholderTextColor="#71819B"
        style={styles.input}
      />
      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoComplete="password"
        secureTextEntry
        placeholder="Mínimo 6 caracteres"
        placeholderTextColor="#71819B"
        style={styles.input}
      />
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <ActionButton label="Iniciar sesión" onPress={signIn} loading={loading} />
      <ActionButton
        label="Crear cuenta"
        onPress={signUp}
        variant="secondary"
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27364F',
    backgroundColor: '#111D31',
    padding: 20,
  },
  title: {
    color: '#F5F7FB',
    fontSize: 24,
    fontWeight: '800',
  },
  description: {
    color: '#A9B5C9',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 4,
  },
  label: {
    color: '#D9E0EC',
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#34445F',
    borderRadius: 12,
    backgroundColor: '#0B1220',
    color: '#F5F7FB',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  message: {
    color: '#FFE29A',
    fontSize: 13,
    lineHeight: 19,
  },
});
