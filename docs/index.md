# VictorIA - Digital Care

Bienvenido a la página pública de **VictorIA**, tu compañera digital de nutrición y bienestar.

---

## ¿Qué es VictorIA?

VictorIA es un asistente de bienestar que acompaña a las personas a través de **WhatsApp** y una **app móvil** para:

- **Entender su contexto personal y emocional** mediante una fase de _perfilamiento_ conversacional.
- **Acompañar el día a día** con check-ins breves, recordatorios y micro-hábitos realistas.
- **Registrar información nutricional** (comidas, síntomas, emociones) para apoyar a profesionales de la salud.

La idea nace para brindar un soporte continuo y empático, especialmente a personas con enfermedades crónicas o procesos de cambio de hábitos, sin reemplazar al profesional de salud, sino complementándolo.

---

## Flujo de la experiencia

1. **Registro inicial en la app móvil**
   - El usuario crea su perfil con datos básicos (nombre, edad, género), información clínica (enfermedades, alergias), medidas antropométricas y consentimiento.
   - Estos datos se almacenan en el backend (Flask + PostgreSQL).

2. **Conexión por WhatsApp**
   - El usuario comienza a escribirle a VictorIA a un número de WhatsApp configurado con **WhatsApp Cloud API**.
   - Los mensajes entran a un webhook en el backend, se guardan en la base de datos y se procesan con la capa de IA.

3. **Fase 1 – Perfilamiento de personalidad y hábitos**
   - VictorIA hace preguntas breves y empáticas para entender:
     - Estado de ánimo.
     - Gustos y antojos.
     - Rutinas y nivel de actividad.
     - Contenido que consume (redes, TV, etc.).
   - Con un número mínimo de mensajes, se genera un **perfil de personalidad** estructurado usando **LangChain + Gemini**.

4. **Fase 2 – Seguimiento diario**
   - Con el perfil ya aprendido, VictorIA acompaña día a día al usuario:
     - Pregunta por comidas, energía, sueño y emociones.
     - Sugiere micro-hábitos personalizados.
     - Mantiene una conversación breve y sostenible en el tiempo.

---

## Arquitectura resumida

- **Frontend**
  - App móvil con **React Native (Expo, TypeScript)**.
  - Pantallas para registro de datos personales, condiciones clínicas y seguimiento.

- **Backend**
  - API en **Python + Flask**.
  - Persistencia con **SQLAlchemy + PostgreSQL**.
  - Integración con **WhatsApp Cloud API** como canal principal de conversación.
  - Capa de IA con **LangChain + Google Gemini**.
  - Memoria estructurada de personalidad almacenada en la base de datos.

- **Infraestructura**
  - Contenedores con **Docker** y orquestación simple con **docker-compose**.
  - Despliegue en una **VM de Google Cloud Platform (GCP)**.

---

## Diagrama de alto nivel

Puedes ver los diagramas técnicos completos en el README principal del proyecto, pero a alto nivel:

- La **app móvil** se comunica con el backend por **HTTP/HTTPS**.
- **WhatsApp Cloud API** envía mensajes entrantes al backend mediante un **webhook HTTPS**.
- El backend decide qué fase de conversación usar (perfilamiento o seguimiento diario) y construye el prompt adecuado para Gemini.
- Las respuestas se envían de vuelta al usuario por WhatsApp y se guardan en la base de datos junto con los mensajes entrantes.

Más detalle en los diagramas del README:

- Diagrama de base de datos.
- Diagrama de tecnologías y protocolos de comunicación.
- Diagrama de flujo conversacional.

---

## Enlaces útiles del repositorio

- **Repositorio principal**: <https://github.com/Hackaton-YoungAI-Leaders-Nutri-Scan/victoria>
- **README general** (arquitectura + diagramas):
  - <https://github.com/Hackaton-YoungAI-Leaders-Nutri-Scan/victoria/blob/main/README.md>
- **Backend (Flask)**:
  - <https://github.com/Hackaton-YoungAI-Leaders-Nutri-Scan/victoria/tree/main/backend>
- **Frontend (React Native/Expo)**:
  - <https://github.com/Hackaton-YoungAI-Leaders-Nutri-Scan/victoria/tree/main/frontend>

---

## Cómo usar esta GitHub Page

Esta página está pensada como una **landing técnica ligera** para:

- Presentar la idea de VictorIA a jurados, mentores o colaboradores.
- Apuntar rápidamente a la documentación técnica (READMEs, diagramas, CI).
- Servir como entrada pública al proyecto sin requerir clonar el repositorio.

Puedes extender esta página añadiendo más secciones en `docs/index.md` (por ejemplo casos de uso, roadmap, métricas esperadas, etc.).
