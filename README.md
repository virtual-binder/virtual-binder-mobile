# App móvil

App Expo/React Native para fotografiar cartas Pokémon, enviarlas a la API del repositorio y revisar sus fichas y precios.

## Configuración

```bash
npm install
cp .env.example .env
```

En `.env`, reemplaza `EXPO_PUBLIC_API_URL` por la URL donde se ejecuta la API. En un dispositivo físico usa la IP local del equipo; no uses `localhost`.

## Desarrollo

```bash
npm start
npm run android
npm run ios
npm run web
```

La cámara guiada permite fotografiar una carta o una página 3×3, con marco de encuadre, flash desactivado y luz opcional. Requiere un dispositivo físico o un emulador con cámara configurada; `expo-camera` está incluido en Expo Go.

Para iniciar Expo junto con Next.js, la API y PostgreSQL, ejecuta `make dev` desde el repositorio hermano `virtual-binder-infra`.

## Comprobaciones

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Perfil y autenticación

La ruta `/profile` permite crear una cuenta, iniciar sesión y configurar el perfil público en Supabase. Configura `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY`; la clave anónima puede incluirse en la app porque RLS restringe las operaciones. Nunca uses una clave `service_role`.

## Compilar Android con EAS

EAS Build compila en la nube, sin Android SDK local. El perfil `preview` genera un APK instalable y `production` genera un AAB para Google Play. Ambos incluyen las variables públicas de Lambda y Supabase definidas en `eas.json`.

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

El primer build local inicializa el proyecto Expo y las credenciales Android. Después, `.github/workflows/eas-build.yml` permite disparar builds manuales desde GitHub Actions. Crea un token de acceso personal en Expo y guárdalo como secreto `EXPO_TOKEN` del repositorio.

Para publicar en Google Play se necesita una cuenta de desarrollador; el APK de prueba no la requiere.
