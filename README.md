# Alejandro Estévez — Independent Digital Studio

Portfolio estático en HTML, CSS y JavaScript, con una función serverless opcional para analizar presupuestos con IA.

## Despliegue recomendado: Vercel

1. Importa este repositorio en Vercel.
2. En Settings → Environment Variables, añade OPENAI_API_KEY con una clave nueva.
3. Opcional: define OPENAI_MODEL para seleccionar otro modelo compatible con Responses API.
4. Despliega el proyecto.

La función /api/estimate utiliza la Responses API desde el servidor. La clave nunca se incluye en el HTML ni en el JavaScript del navegador. Si no está configurada, el presupuesto automático continúa funcionando y el análisis IA informa de que no está disponible.

GitHub Pages puede alojar la parte estática, pero no ejecuta api/estimate.js. Para que funcione el análisis IA, despliega el repositorio en Vercel u otro hosting compatible con funciones serverless.

## Portfolio y transparencia

- Mica Estética: demostración web.
- Zampa Pizzería y Hong Kong: conceptos/demostraciones.
- ChillFrog, HOA Office y AeroWash Vision: proyectos propios en desarrollo o experimentación.

Los estados se muestran explícitamente para no presentar prototipos como encargos comerciales finalizados.

## Seguridad

No subir claves, tokens ni ficheros .env al repositorio. Si una clave se comparte accidentalmente, revócala y genera una nueva.