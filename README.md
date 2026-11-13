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

La cámara requiere un dispositivo físico o un emulador con cámara configurada. La galería funciona con Expo Go.

Para iniciar Expo junto con Next.js, la API y PostgreSQL, ejecuta `make dev` desde el repositorio hermano `virtual-binder-infra`.

## Comprobaciones

```bash
npm run typecheck
npm run lint
npx expo-doctor
```
