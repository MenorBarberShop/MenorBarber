# Turnos — Barbería Menor

Este proyecto fue modificado el 2025-08-11 para agregar la sección **“Reservá tu turno”** sin cambiar el diseño existente.

## ¿Qué hace?
- Genera horarios entre **11:00 y 21:00** (Lunes a Sábado). Domingos cerrado.
- Aplica la regla de **2 barberos de Lunes a Viernes** y **3 barberos los Sábados** (la UI habilita/describe la capacidad y muestra el Barbero 3 solo los sábados).
- Duración por defecto: **30 min** (Corte / Barba). **Corte + Barba** usa **60 min**.
- Al confirmar, abre **WhatsApp** con el mensaje de reserva listo para enviar. Si no se configuró número, usa **mailto** por defecto.

## Configuración rápida
1. Abrí `index.html` y buscá este bloque al final (antes del cierre de `</body>`):
   ```js
   const WHATSAPP_NUMERO = ''; // <-- PONER AQUÍ EL NÚMERO, ej: '54911xxxxxxxx'
   ```
2. Reemplazá comillas vacías por el número con prefijo de país y área **sin signos**. Ejemplo para CABA:
   ```js
   const WHATSAPP_NUMERO = '54911XXXXXXXX';
   ```

## Cambiar horarios o duración
- Editá estas constantes en el mismo bloque de `<script>`:
  ```js
  const HORA_APERTURA = 11;
  const HORA_CIERRE = 21;
  const DURACION_MIN = 30;
  ```

## Servicios y barberos
- Ajustá el `<select id="servicio">` para agregar/renombrar servicios y sus duraciones (si agregás uno de 60 min, actualizá la lógica en `generarSlots`).
- En el `<select id="barbero">` el **Barbero 3** está marcado con `data-solo-sabado="true"` y solo se habilita los sábados.

## Limitaciones (GitHub Pages es estático)
- No bloquea turnos en tiempo real (no hay base de datos). Recomendación: confirmar manualmente por WhatsApp/Instagram.
- Si más adelante quieren **bloqueo real** + recordatorios, sugerido: Vercel/Netlify (serverless) + Supabase/Firestore. La UI ya está: habría que conectar el endpoint.

Cualquier duda, me decís y lo adapto.
