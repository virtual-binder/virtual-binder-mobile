import { Platform } from 'react-native';
import type { ImagePickerAsset } from 'expo-image-picker';

import type { RecognitionResponse } from '@/types/card';

const MAX_WAIT_MS = 180_000;

function apiUrl(): string {
  const value = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '');

  if (!value) {
    throw new Error(
      'Configura EXPO_PUBLIC_API_URL en mobile/.env y reinicia Expo.',
    );
  }

  return value;
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === 'string') {
      return body.detail;
    }
  } catch {
    return `El servicio respondió con un error (${response.status}).`;
  }

  return `El servicio respondió con un error (${response.status}).`;
}

export async function identifyCards(
  image: ImagePickerAsset,
): Promise<RecognitionResponse> {
  const form = new FormData();
  const name = image.fileName ?? `carta.${image.mimeType === 'image/png' ? 'png' : 'jpg'}`;
  const type = image.mimeType ?? 'image/jpeg';

  if (Platform.OS === 'web' && image.file) {
    form.append('archivo', image.file, name);
  } else {
    form.append('archivo', { uri: image.uri, name, type } as unknown as Blob);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MAX_WAIT_MS);

  try {
    const response = await fetch(
      `${apiUrl()}/identificar?incluir_recortes=true`,
      {
        method: 'POST',
        body: form,
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(await errorMessage(response));
    }

    return (await response.json()) as RecognitionResponse;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('La identificación tardó demasiado. Inténtalo de nuevo.');
    }
    if (error instanceof TypeError) {
      throw new Error(
        'No se pudo conectar con la API. Revisa que esté activa y que la URL sea accesible desde el teléfono.',
      );
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
