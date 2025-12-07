<img width="1196" height="177" alt="image" src="https://github.com/user-attachments/assets/4ae95e5e-4135-4a6d-8600-9281e29320a8" />

# VictorIA Backend (Flask)

Backend en **Python + Flask** para analizar una foto de alimento y devolver una **recomendación nutricional simulada** (VERDE / AMARILLO / ROJO) basada en el nombre del archivo de la imagen y en algunos datos del usuario.

---

## 1. Requisitos

- Python **3.10+**
- `pip` para instalar dependencias

---

## 2. Instalación de dependencias

Desde la carpeta raíz del proyecto (`nutri-scan`):

```bash
pip install -r backend/requirements.txt
```

> Ajusta la ruta si tu `requirements.txt` está en otro lugar.

---

## 3. Ejecutar el servidor Flask

Desde la carpeta raíz del proyecto (`nutri-scan`):

```bash
cd backend  # (si lo haces desde la terminal, NO dentro del código)
python app.py
```

Por defecto se levanta en:

```text
http://127.0.0.1:5000
```

El endpoint disponible es:

```text
POST /api/recommendation
```

---

## 4. Endpoint `/api/recommendation`

- **Método:** `POST`
- **Ruta:** `/api/recommendation`
- **Tipo de contenido:** `multipart/form-data`

### Parámetros esperados

- **`photo`** (file)
  - Archivo de imagen (por ejemplo `.jpg`, `.png`).
- **`user_data`** (text)
  - Cadena **JSON** con la siguiente estructura:

```json
{
  "edad": 30,
  "genero": "F",
  "tipo_sangre": "O",
  "rh": "+",
  "peso": 65,
  "enfermedades": ["hipertension"],
  "alergias": ["gluten"]
}
```

### Lógica del "modelo" (simulado)

Se analiza **solo el nombre del archivo** de la imagen:

- Si contiene: `manzana`, `zanahoria` o `vegetal` → **VERDE**
- Si contiene: `hamburguesa`, `frito` o `pizza` → **ROJO**
- En cualquier otro caso → **AMARILLO**

La API responde con:

```json
{
  "food_name": "Nombre del alimento detectado",
  "recommendation": "VERDE | AMARILLO | ROJO",
  "details": "Explicacin breve de la recomendación basada en los datos del usuario y el alimento."
}
```

---

## 5. Ejemplo de petición con `curl`

```bash
curl -X POST http://127.0.0.1:5000/api/recommendation \
  -F "photo=@/ruta/a/tu/imagen_manzana.jpg" \
  -F 'user_data={
    "edad": 30,
    "genero": "F",
    "tipo_sangre": "O",
    "rh": "+",
    "peso": 65,
    "enfermedades": ["hipertension"],
    "alergias": ["gluten"]
  }'
```

Asegúrate de cambiar `/ruta/a/tu/imagen_manzana.jpg` por la ruta real de tu archivo.

---

## 6. Ejemplo de uso desde React Native

```javascript
const sendRecommendationRequest = async (image) => {
  const formData = new FormData();

  formData.append('photo', {
    uri: image.uri,          // p.ej. "file:///.../image.jpg"
    name: 'foto_manzana.jpg', // el nombre afecta la recomendación
    type: 'image/jpeg',
  });

  const userData = {
    edad: 30,
    genero: 'F',
    tipo_sangre: 'O',
    rh: '+',
    peso: 65,
    enfermedades: ['hipertension'],
    alergias: ['gluten'],
  };

  formData.append('user_data', JSON.stringify(userData));

  const response = await fetch('http://10.0.2.2:5000/api/recommendation', {
    method: 'POST',
    body: formData,
    headers: {
      // No establecer manualmente 'Content-Type': 'multipart/form-data'
      // fetch lo maneja automáticamente junto con el boundary
    },
  });

  const data = await response.json();
  console.log(data);
};
```

> Nota:
> - En **emulador Android**, usa `http://10.0.2.2:5000` para apuntar al servidor de tu PC.
> - En **dispositivo físico**, usa la IP local de tu PC (por ejemplo `http://192.168.1.100:5000`).

---

## 7. CORS

El backend utiliza `flask-cors` para habilitar **CORS básico**, permitiendo que tu app de React Native pueda llamar al endpoint sin problemas de origen cruzado.

Si deseas restringirlo a un origen específico, puedes modificar la configuración de `CORS(app)` en `backend/app.py`.
