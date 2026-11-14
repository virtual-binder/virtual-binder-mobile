import { useRef, useState } from 'react';
import {
  CameraView,
  useCameraPermissions,
  type CameraCapturedPicture,
} from 'expo-camera';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type CaptureMode = 'single' | 'page';

type Props = {
  onCapture: (photo: CameraCapturedPicture) => void;
  onClose: () => void;
};

export function CaptureCamera({ onCapture, onClose }: Props) {
  const camera = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<CaptureMode>('single');
  const [torch, setTorch] = useState(false);
  const [ready, setReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  async function takePicture() {
    if (!camera.current || !ready || capturing) {
      return;
    }

    setCapturing(true);
    setCameraError(null);
    try {
      const photo = await camera.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: false,
      });
      onCapture(photo);
    } catch {
      setCameraError('No se pudo tomar la foto. Inténtalo nuevamente.');
    } finally {
      setCapturing(false);
    }
  }

  if (!permission) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator color="#FFCB05" size="large" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionScreen}>
        <View style={styles.permissionContent}>
          <Text style={styles.permissionTitle}>Necesitamos acceso a la cámara</Text>
          <Text style={styles.permissionText}>
            Solo se utilizará cuando fotografíes tus cartas. También puedes elegir
            una imagen de la galería sin abrir esta vista.
          </Text>
          {!permission.canAskAgain ? (
            <Text style={styles.permissionWarning}>
              El permiso está bloqueado. Debes habilitar la cámara desde los
              ajustes del dispositivo.
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            onPress={requestPermission}
            style={styles.permissionButton}
          >
            <Text style={styles.permissionButtonLabel}>Permitir cámara</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onClose}>
            <Text style={styles.closeText}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar cámara"
          disabled={capturing}
          onPress={onClose}
        >
          <Text style={styles.closeText}>Cerrar</Text>
        </Pressable>
        <Text style={styles.title}>Escaneo guiado</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.cameraContainer}>
        <CameraView
          ref={camera}
          style={StyleSheet.absoluteFill}
          facing="back"
          mode="picture"
          flash="off"
          enableTorch={torch}
          onCameraReady={() => setReady(true)}
          onMountError={() =>
            setCameraError('No se pudo iniciar la cámara en este dispositivo.')
          }
        />

        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.instructionBox}>
            <Text style={styles.instruction}>
              {mode === 'single'
                ? 'Centra una carta dentro del marco'
                : 'Incluye la página completa, sin cortar los bordes'}
            </Text>
          </View>

          <View style={styles.guideArea}>
            <View
              style={[
                styles.guide,
                mode === 'single' ? styles.singleGuide : styles.pageGuide,
              ]}
            >
              {mode === 'page' ? (
                <>
                  <View style={[styles.verticalLine, { left: '33.33%' }]} />
                  <View style={[styles.verticalLine, { left: '66.66%' }]} />
                  <View style={[styles.horizontalLine, { top: '33.33%' }]} />
                  <View style={[styles.horizontalLine, { top: '66.66%' }]} />
                </>
              ) : null}
            </View>
          </View>

          <Text style={styles.captureHint}>
            Teléfono paralelo · Luz indirecta · Evita reflejos
          </Text>
        </View>
      </View>

      <View style={styles.controls}>
        {cameraError ? <Text style={styles.errorText}>{cameraError}</Text> : null}

        <View style={styles.modeSelector}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'single' }}
            onPress={() => setMode('single')}
            style={[styles.modeButton, mode === 'single' && styles.activeMode]}
          >
            <Text
              style={[styles.modeText, mode === 'single' && styles.activeModeText]}
            >
              Una carta
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'page' }}
            onPress={() => setMode('page')}
            style={[styles.modeButton, mode === 'page' && styles.activeMode]}
          >
            <Text
              style={[styles.modeText, mode === 'page' && styles.activeModeText]}
            >
              Página 3×3
            </Text>
          </Pressable>
        </View>

        <View style={styles.shutterRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: torch }}
            onPress={() => setTorch((current) => !current)}
            style={styles.torchButton}
          >
            <Text style={styles.torchText}>{torch ? 'Apagar luz' : 'Encender luz'}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tomar foto"
            accessibilityState={{ disabled: !ready || capturing, busy: capturing }}
            disabled={!ready || capturing}
            onPress={takePicture}
            style={({ pressed }) => [
              styles.shutter,
              pressed && styles.shutterPressed,
              (!ready || capturing) && styles.shutterDisabled,
            ]}
          >
            {capturing ? (
              <ActivityIndicator color="#0B1220" />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </Pressable>

          <View style={styles.controlSpacer} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B1220',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B1220',
  },
  permissionScreen: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#0B1220',
    padding: 28,
  },
  permissionContent: {
    gap: 20,
  },
  permissionTitle: {
    color: '#F5F7FB',
    fontSize: 28,
    lineHeight: 35,
    fontWeight: '800',
  },
  permissionText: {
    color: '#A9B5C9',
    fontSize: 16,
    lineHeight: 24,
  },
  permissionWarning: {
    color: '#FFE29A',
    fontSize: 14,
    lineHeight: 21,
  },
  permissionButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FFCB05',
  },
  permissionButtonLabel: {
    color: '#10213D',
    fontSize: 15,
    fontWeight: '700',
  },
  header: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  headerSpacer: {
    width: 50,
  },
  closeText: {
    color: '#D9E0EC',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  title: {
    color: '#F5F7FB',
    fontSize: 17,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#05080E',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 22,
  },
  instructionBox: {
    maxWidth: '90%',
    borderRadius: 14,
    backgroundColor: 'rgba(11, 18, 32, 0.82)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  instruction: {
    color: '#F5F7FB',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  guideArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guide: {
    borderWidth: 2,
    borderColor: '#FFCB05',
    borderRadius: 14,
    overflow: 'hidden',
  },
  singleGuide: {
    width: '55%',
    aspectRatio: 63 / 88,
  },
  pageGuide: {
    width: '88%',
    aspectRatio: 0.75,
  },
  verticalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  horizontalLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
  },
  captureHint: {
    color: '#F5F7FB',
    backgroundColor: 'rgba(11, 18, 32, 0.82)',
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 12,
    textAlign: 'center',
  },
  controls: {
    gap: 18,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 12,
  },
  modeSelector: {
    flexDirection: 'row',
    borderRadius: 14,
    backgroundColor: '#18253B',
    padding: 4,
  },
  modeButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  activeMode: {
    backgroundColor: '#FFCB05',
  },
  modeText: {
    color: '#A9B5C9',
    fontSize: 14,
    fontWeight: '700',
  },
  activeModeText: {
    color: '#10213D',
  },
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  torchButton: {
    width: 92,
    minHeight: 44,
    justifyContent: 'center',
  },
  torchText: {
    color: '#D9E0EC',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  shutter: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#F5F7FB',
    backgroundColor: '#FFCB05',
  },
  shutterInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#F5F7FB',
  },
  shutterPressed: {
    opacity: 0.75,
  },
  shutterDisabled: {
    opacity: 0.45,
  },
  controlSpacer: {
    width: 92,
  },
  errorText: {
    color: '#FFB4C1',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
