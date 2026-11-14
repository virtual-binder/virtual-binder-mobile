import type { Session } from '@supabase/supabase-js';
import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthForm } from '@/components/AuthForm';
import { ProfileForm } from '@/components/ProfileForm';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Link href="/" style={styles.back}>← Volver al escáner</Link>
          <View style={styles.brandBadge}>
            <View style={styles.brandDot} />
            <Text style={styles.brand}>VIRTUAL BINDER</Text>
          </View>
          <Text style={styles.title}>Tu perfil, tu colección.</Text>
          <Text style={styles.subtitle}>
            Configura cómo te verán otras personas y dónde contactarte.
          </Text>
        </View>
        {loading ? <ActivityIndicator color="#FFCB05" style={styles.loading} /> : null}
        {!loading && !session ? <AuthForm /> : null}
        {!loading && session ? (
          <ProfileForm
            key={session.user.id}
            userId={session.user.id}
            email={session.user.email ?? ''}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  content: {
    padding: 22,
    paddingBottom: 36,
    gap: 22,
  },
  header: {
    gap: 12,
    paddingTop: 10,
  },
  back: {
    color: '#A9B5C9',
    fontSize: 13,
    marginBottom: 8,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFCB05',
  },
  brand: {
    color: '#FFCB05',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  title: {
    color: '#F5F7FB',
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    color: '#A9B5C9',
    fontSize: 15,
    lineHeight: 23,
  },
  loading: {
    marginTop: 40,
  },
});
