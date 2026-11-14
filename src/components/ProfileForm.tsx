import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import { ActionButton } from '@/components/ActionButton';
import { supabase } from '@/lib/supabase';

type Props = {
  userId: string;
  email: string;
};

export function ProfileForm({ userId, email }: Props) {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [contactEmail, setContactEmail] = useState(email);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,username,display_name,location,bio,contact_email')
        .eq('auth_user_id', userId)
        .maybeSingle();

      if (!active) {
        return;
      }
      if (error) {
        setMessage(error.message);
      }
      if (data) {
        setProfileId(data.id);
        setUsername(data.username);
        setDisplayName(data.display_name);
        setLocation(data.location);
        setBio(data.bio);
        setContactEmail(data.contact_email);
      }
      setLoading(false);
    }

    loadProfile();
    return () => {
      active = false;
    };
  }, [userId]);

  async function saveProfile() {
    const normalizedUsername = username.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]{2,31}$/.test(normalizedUsername)) {
      setMessage('El usuario debe tener 3 a 32 caracteres: letras minúsculas, números o guiones.');
      return;
    }
    if (!displayName.trim()) {
      setMessage('Escribe el nombre que aparecerá en tu colección.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(contactEmail.trim())) {
      setMessage('Escribe un correo de contacto válido.');
      return;
    }

    setSaving(true);
    setMessage(null);
    const payload = {
      auth_user_id: userId,
      username: normalizedUsername,
      display_name: displayName.trim(),
      location: location.trim(),
      bio: bio.trim(),
      contact_email: contactEmail.trim(),
    };

    if (profileId) {
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', profileId)
        .eq('auth_user_id', userId);
      if (error) {
        setMessage(error.code === '23505' ? 'Ese nombre de usuario ya está en uso.' : error.message);
      } else {
        setUsername(normalizedUsername);
        setMessage('Perfil actualizado. Tu catálogo público ya refleja los cambios.');
      }
    } else {
      const { data, error } = await supabase
        .from('profiles')
        .insert(payload)
        .select('id')
        .single();
      if (error) {
        setMessage(error.code === '23505' ? 'Ese nombre de usuario ya está en uso.' : error.message);
      } else {
        setProfileId(data.id);
        setUsername(normalizedUsername);
        setMessage('Perfil creado. Tu catálogo público ya está disponible.');
      }
    }
    setSaving(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return <ActivityIndicator color="#FFCB05" style={styles.loading} />;
  }

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Mi perfil público</Text>
      <Text style={styles.description}>
        Estos datos aparecerán en tu catálogo y en los mensajes de compradores.
      </Text>
      <Text style={styles.label}>Correo de la cuenta</Text>
      <Text style={styles.readonly}>{email}</Text>
      <Text style={styles.label}>Usuario único</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholder="mi-coleccion"
        placeholderTextColor="#71819B"
        style={styles.input}
      />
      <Text style={styles.label}>Nombre visible</Text>
      <TextInput
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Tu nombre"
        placeholderTextColor="#71819B"
        style={styles.input}
      />
      <Text style={styles.label}>Ubicación</Text>
      <TextInput
        value={location}
        onChangeText={setLocation}
        placeholder="Santiago, Chile"
        placeholderTextColor="#71819B"
        style={styles.input}
      />
      <Text style={styles.label}>Biografía</Text>
      <TextInput
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={4}
        placeholder="Describe tu colección, entregas o envíos"
        placeholderTextColor="#71819B"
        style={[styles.input, styles.textArea]}
      />
      <Text style={styles.label}>Correo de contacto público</Text>
      <TextInput
        value={contactEmail}
        onChangeText={setContactEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="contacto@correo.com"
        placeholderTextColor="#71819B"
        style={styles.input}
      />
      {username ? (
        <View style={styles.urlBox}>
          <Text style={styles.urlLabel}>Tu catálogo</Text>
          <Text style={styles.url}>virtual-binder.netlify.app/{username.trim().toLowerCase()}</Text>
        </View>
      ) : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <ActionButton
        label={profileId ? 'Guardar cambios' : 'Crear perfil'}
        onPress={saveProfile}
        loading={saving}
      />
      <ActionButton label="Cerrar sesión" onPress={signOut} variant="secondary" />
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    marginTop: 40,
  },
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
  readonly: {
    color: '#71819B',
    fontSize: 14,
    paddingBottom: 4,
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  urlBox: {
    borderRadius: 12,
    backgroundColor: '#0B1220',
    padding: 14,
    gap: 5,
  },
  urlLabel: {
    color: '#FFCB05',
    fontSize: 11,
    fontWeight: '700',
  },
  url: {
    color: '#A9B5C9',
    fontSize: 13,
    lineHeight: 19,
  },
  message: {
    color: '#FFE29A',
    fontSize: 13,
    lineHeight: 19,
  },
});
