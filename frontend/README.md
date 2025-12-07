<img width="1196" height="177" alt="image" src="https://github.com/user-attachments/assets/4ae95e5e-4135-4a6d-8600-9281e29320a8" />

# VictorIA (React Native + TypeScript)

Aplicación móvil en **React Native (Expo) con TypeScript** que permite:

- Registrar un **perfil de usuario** (edad, género, tipo de sangre, RH, peso, enfermedades y alergias).
- Tomar una **foto de un alimento**.
- Enviar la foto + perfil al backend Flask (`/api/recommendation`).
- Mostrar la recomendación en un semáforo **VERDE / AMARILLO / ROJO**.

---

## 1. Requisitos

- Node.js (recomendado LTS)
- `npm` o `yarn`
- Expo CLI (opcional, se puede usar `npx expo`)
- Emulador Android/iOS o dispositivo físico

---

## 2. Instalación de dependencias

Desde la carpeta `frontend`:

```bash
cd frontend
npm install
# o
# yarn
```

---

## 3. Configurar la URL del backend

Edita el archivo:

```text
frontend/src/config/api.ts
```

Dentro encontrarás:

```ts
// Cambia esta constante por la IP/puerto reales de tu backend Flask
// Ejemplo: 'http://192.168.0.10:5000' o 'http://10.0.2.2:5000' según tu entorno
export const BACKEND_BASE_URL = 'http://192.168.0.10:5000';
```

Cámbialo según tu entorno:

- **Emulador Android** (backend en tu PC):
  ```ts
  export const BACKEND_BASE_URL = 'http://10.0.2.2:5000';
  ```

- **Dispositivo físico en la misma red**:
  ```ts
  export const BACKEND_BASE_URL = 'http://TU_IP_LOCAL:5000';
  // Ejemplo: 'http://192.168.1.50:5000'
  ```

Asegúrate de que el backend Flask esté ejecutándose y sea accesible desde el dispositivo.

---

## 4. Ejecutar la app

Desde la carpeta `frontend`:

```bash
npm start
# o
# yarn start
```

Se abrirá la interfaz de Expo. Desde ahí puedes:

- Ejecutar en un **emulador Android/iOS**.
- Abrir en un **dispositivo físico** mediante la app de Expo Go o una build nativa.

---

## 5. Navegación y pantallas

La app usa **React Navigation** con un stack simple:

- **`ProfileScreen`** (`src/screens/ProfileScreen.tsx`)
  - Formulario con campos:
    - Edad (número)
    - Género (selector: F/M/O)
    - Tipo de sangre (selector: A/B/O/AB)
    - RH (selector: + / -)
    - Peso (número)
    - Enfermedades (texto multi-línea, separadas por comas)
    - Alergias (texto multi-línea, separadas por comas)
  - Guarda los datos en **AsyncStorage** (`key: 'user_profile'`).
  - Botón **"Guardar y continuar"** → navega a `CameraScreen`.

- **`CameraScreen`** (`src/screens/CameraScreen.tsx`)
  - Botón **"Tomar foto"** usando `react-native-image-picker` (cámara trasera).
  - Muestra **previsualización** de la imagen tomada.
  - Botón **"Analizar comida"**:
    - Lee el perfil guardado desde AsyncStorage.
    - Crea un `FormData` con:
      - `photo`: archivo `{ uri, name, type }`.
      - `user_data`: JSON stringify del perfil.
    - Envía `POST` con **Axios** a:
      - `BACKEND_BASE_URL + '/api/recommendation'`.
  - Muestra la respuesta de la API:
    - `food_name` (nombre del alimento).
    - `recommendation` en un badge coloreado:
      - VERDE → #2ecc71
      - AMARILLO → #f1c40f
      - ROJO → #e74c3c
    - `details` en texto.

La navegación está definida en:

- `src/navigation/RootNavigator.tsx`
- `App.tsx` envuelve el `RootNavigator` en `NavigationContainer`.

---

## 6. Notas sobre permisos y cámara

- En dispositivos físicos / emuladores reales, `react-native-image-picker` gestionará los permisos de cámara automáticamente (según la configuración nativa de tu proyecto Expo/React Native).
- Si tu plataforma requiere pasos adicionales (por ejemplo, configuración específica en AndroidManifest o Info.plist en proyectos bare), revisa la documentación oficial de `react-native-image-picker`.

---

## 7. Flujo típico de uso

1. Abrir la app → Pantalla **Perfil**.
2. Rellenar campos y pulsar **"Guardar y continuar"**.
3. Llegar a **CameraScreen**.
4. Pulsar **"Tomar foto"** y aceptar la foto.
5. Pulsar **"Analizar comida"**.
6. Ver el resultado con el color del semáforo y los detalles devueltos por el backend.
