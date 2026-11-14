import { useState } from 'react';
import type { CameraCapturedPicture } from 'expo-camera';
import { Link } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActionButton } from '@/components/ActionButton';
import { CaptureCamera } from '@/components/CaptureCamera';
import { CardResult } from '@/components/CardResult';
import { identifyCards } from '@/services/pokemonApi';
import type { RecognitionResponse } from '@/types/card';

export default function HomeScreen() {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [result, setResult] = useState<RecognitionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);

  function applyPickedImage(pickerResult: ImagePicker.ImagePickerResult) {
    const selected = pickerResult.assets?.[0];
    if (!pickerResult.canceled && selected) {
      setImage(selected);
      setResult(null);
      setError(null);
    }
  }

  function applyCapturedImage(photo: CameraCapturedPicture) {
    const extension = photo.format === 'png' ? 'png' : 'jpg';
    applyPickedImage({
      canceled: false,
      assets: [{
        uri: photo.uri,
        width: photo.width,
        height: photo.height,
        fileName: `captura-${Date.now()}.${extension}`,
        mimeType: photo.format === 'png' ? 'image/png' : 'image/jpeg',
        type: 'image',
      }],
    });
    setCameraVisible(false);
  }

  async function pickImage() {
    try {
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });
      applyPickedImage(pickerResult);
    } catch {
      Alert.alert('No se pudo abrir la galería', 'Inténtalo nuevamente.');
    }
  }

  async function takePhoto() {
    if (Platform.OS !== 'web') {
      setCameraVisible(true);
      return;
    }

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Permiso necesario',
          'Autoriza el uso de la cámara para fotografiar tus cartas.',
        );
        return;
      }

      const pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });
      applyPickedImage(pickerResult);
    } catch {
      Alert.alert('No se pudo abrir la cámara', 'Inténtalo nuevamente.');
    }
  }

  async function analyze() {
    if (!image) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      setResult(await identifyCards(image));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Ocurrió un error inesperado al identificar la foto.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.brandBadge}>
              <View style={styles.brandDot} />
              <Text style={styles.brand}>VIRTUAL BINDER</Text>
            </View>
            <Link href="/profile" style={styles.profileLink}>Mi perfil</Link>
          </View>
          <Text style={styles.title}>Descubre qué cartas tienes.</Text>
          <Text style={styles.subtitle}>
            Fotografía una carta o una página completa. Detectaremos las cartas y
            consultaremos sus precios.
          </Text>
        </View>

        <View style={styles.captureTips}>
          <Text style={styles.tipsTitle}>Antes de fotografiar</Text>
          <Text style={styles.tip}>· Usa luz indirecta y evita el flash directo.</Text>
          <Text style={styles.tip}>· Mantén el teléfono paralelo a las cartas.</Text>
          <Text style={styles.tip}>· Comprueba que el nombre y el número se vean nítidos.</Text>
        </View>

        <View style={styles.preview}>
          {image ? (
            <Image
              source={{ uri: image.uri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.emptyPreview}>
              <View style={styles.cardOutline}>
                <View style={styles.cardOutlineInner} />
              </View>
              <Text style={styles.emptyTitle}>Tu foto aparecerá aquí</Text>
              <Text style={styles.emptyText}>Puedes incluir una o varias cartas</Text>
            </View>
          )}
        </View>

        {image ? (
          <Text style={styles.previewHint}>
            Revisa la foto: si hay reflejos sobre el texto, vuelve a tomarla desde
            un ángulo ligeramente distinto.
          </Text>
        ) : null}

        <View style={styles.actionsRow}>
          <ActionButton
            label="Abrir cámara guiada"
            onPress={takePhoto}
            disabled={loading}
          />
          <ActionButton
            label="Elegir de galería"
            onPress={pickImage}
            variant="secondary"
            disabled={loading}
          />
        </View>

        <ActionButton
          label={result ? 'Analizar de nuevo' : 'Identificar cartas'}
          onPress={analyze}
          disabled={!image}
          loading={loading}
        />

        {loading ? (
          <Text style={styles.loadingText}>
            Recortando, leyendo y buscando precios…{'\n'}Puede tardar unos segundos.
          </Text>
        ) : null}

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>No pudimos completar la búsqueda</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {result ? (
          <View style={styles.results}>
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsKicker}>RESULTADOS</Text>
              <Text style={styles.resultsTitle}>
                {result.total === 1
                  ? '1 carta detectada'
                  : `${result.total} cartas detectadas`}
              </Text>
            </View>
            {result.aviso ? <Text style={styles.globalWarning}>{result.aviso}</Text> : null}
            {result.cartas.map((card, index) => (
              <CardResult
                card={card}
                index={index}
                key={`${card.carta?.id ?? 'sin-identificar'}-${index}`}
              />
            ))}
          </View>
        ) : null}

        <Text style={styles.footer}>
          Precios referenciales de TCGplayer y Cardmarket. Revisa siempre la
          expansión y el número de coleccionista.
        </Text>
      </ScrollView>

      <Modal
        visible={cameraVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setCameraVisible(false)}
      >
        <CaptureCamera
          onCapture={applyCapturedImage}
          onClose={() => setCameraVisible(false)}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  scrollContent: {
    padding: 22,
    paddingBottom: 36,
    gap: 18,
  },
  header: {
    gap: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileLink: {
    color: '#D9E0EC',
    fontSize: 13,
    fontWeight: '700',
    paddingVertical: 6,
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
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.8,
    maxWidth: 340,
  },
  subtitle: {
    color: '#A9B5C9',
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 420,
  },
  captureTips: {
    gap: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#27364F',
    backgroundColor: '#111D31',
    padding: 16,
  },
  tipsTitle: {
    color: '#F5F7FB',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  tip: {
    color: '#A9B5C9',
    fontSize: 13,
    lineHeight: 19,
  },
  preview: {
    height: 250,
    backgroundColor: '#111D31',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#27364F',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewHint: {
    color: '#A9B5C9',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  emptyPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardOutline: {
    width: 52,
    height: 72,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#536580',
    padding: 5,
    marginBottom: 6,
    transform: [{ rotate: '-8deg' }],
  },
  cardOutlineInner: {
    flex: 1,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#34445F',
    backgroundColor: '#18253B',
  },
  emptyTitle: {
    color: '#D9E0EC',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyText: {
    color: '#71819B',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  loadingText: {
    color: '#A9B5C9',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  errorBox: {
    backgroundColor: '#351E29',
    borderColor: '#6D3343',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  errorTitle: {
    color: '#FFB4C1',
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: '#F1CCD3',
    fontSize: 13,
    lineHeight: 19,
  },
  results: {
    gap: 14,
    paddingTop: 8,
  },
  resultsHeader: {
    gap: 4,
  },
  resultsKicker: {
    color: '#FFCB05',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  resultsTitle: {
    color: '#F5F7FB',
    fontSize: 24,
    fontWeight: '800',
  },
  globalWarning: {
    color: '#FFE29A',
    backgroundColor: '#302A1B',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    lineHeight: 19,
    overflow: 'hidden',
  },
  footer: {
    color: '#71819B',
    fontSize: 11,
    lineHeight: 17,
    textAlign: 'center',
    paddingHorizontal: 10,
    paddingTop: 6,
  },
});
