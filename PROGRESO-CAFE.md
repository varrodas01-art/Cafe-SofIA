# Mi progreso — Café SofIA

## Clase 5 · De un prompt a una app publicada en Internet (tramo final)
- [x] Etapa 0 · Punto de partida: llegaste a Claude Code — confirmado, proyecto abierto en VS Code con Claude Code respondiendo.
- [x] Etapa 1 · GitHub — repo: https://github.com/varrodas01-art/Cafe-SofIA (rama main subida, autenticado con Personal Access Token guardado en el equipo del alumno)
- [x] Etapa 2 · Vercel — URL pública: https://cafe-sof-ia.vercel.app/ (deploy automático desde GitHub)

## Clase 6 · Conectar con el mundo real
- [x] Etapa 3 · La arquitectura, como un restaurante — confirmó el concepto frontend/backend.
- [x] Etapa 4 · Conectar el frontend con el backend — compra PED-1001 (espresso + capuchino + latte) registrada en `ventas` desde la tienda publicada.
- [x] Etapa 5 · Variables de entorno — entiende el cajón con etiqueta, que los nombres deben coincidir y que hay que hacer Redeploy al cambiar un valor.
- [ ] Etapa 6 · El token entre servidores — HITO 2
- [ ] Etapa 7 · Los métodos de pago
- [ ] Etapa 8 · El panel de administración: la trastienda
- [ ] Etapa 9 · Usar el panel: carta, insumos, stock y transferencias
- [ ] Etapa 10 · SofIA en modo real

## Notas de contexto
_(Lo importante para retomar. Sin claves ni contraseñas.)_
- El proyecto de código vive en la subcarpeta `sofia-cafe/` (no en la raíz `sofia-cafe/` que abrió en VS Code); ahí están `package.json`, `src/App.jsx`, etc.
- Sistema operativo: Windows.
- Git configurado con nombre "Cafe SofIA ADEN" y correo adencafesofia@gmail.com (cuenta de ADEN).
- El 19/09 se reemplazó el código del prototipo por una versión nueva/corregida ("cafecr", antes en Descargas), copiada dentro de la misma carpeta `sofia-cafe/sofia-cafe`. El package.json interno del proyecto quedó con "name": "cafe-cr".
- El 20/09 la alumna iteró el prototipo (mejora de colores) desde el chat de Claude en el navegador, que le dio instrucciones para crear un repo nuevo ("repositorio-de-Sofia") sin saber que ya existía Cafe-SofIA conectado acá. Se corrigió: solo se copió el `src/App.jsx` actualizado al proyecto y se subió al repo existente (Cafe-SofIA). Importante para el futuro: pedirle las mejoras directamente a Claude Code (acá), no volver al chat del navegador, para evitar este tipo de confusión.
- Autenticación de git push resuelta con un Personal Access Token de GitHub, guardado en el Administrador de Credenciales de Windows (no en el repositorio). Funciona tanto desde la terminal de Claude Code como desde la propia terminal de VS Code de la alumna.
- La alumna ya trae su backend de Apps Script de la Clase 3 (memoria, herramientas, cerebro, chat y autonomía en modo simulador, con el correo de reposición ya configurado). Copiado como espejo de referencia a `sofia-cafe/apps-script/Codigo.gs` e `Index.html`, y agregado `apps-script/` al `.gitignore`.
- Nombre de la variable de entorno en Vercel para la URL del Apps Script: `URLscript`. Redeploy ya confirmado (30/09).
- Etapa 4 (30/09): la carta de la tienda se recortó a los 3 cafés del backend (espresso, capuchino, latte). Se creó `api/registrar-venta.js` (función serverless que reenvía el pedido a `URLscript`), `confirmOrder()` la llama, y se agregaron `doPost` + `registrarVentaDesdeEcommerce_` al Apps Script. La alumna pegó el código y publicó "Nueva versión".
- Resuelto (02/10): la venta no llegaba porque `URLscript` en Vercel tenía una URL inválida, y además la implementación de Apps Script pedía login y servía una versión vieja sin `doPost`. Se creó una implementación NUEVA (acceso "Cualquier usuario", ejecutar como "Yo") y se cargó su URL /exec en `URLscript` con Redeploy. Prueba Vercel → Apps Script OK (fila PRUEBA-CLAUDE con monto 0 en `pedidos_online`; se puede borrar). Ojo: la URL del backend cambió; las implementaciones viejas siguen existiendo.
- Voz de SofIA sin responder (02/10): NO estaba relacionado con la Etapa 4. Error de n8n: "OpenAI: Rate limit reached — project has reached its configured enforced spend limit". Hay que subir el límite y/o cargar créditos en platform.openai.com (lo hace la alumna). Probable causa del gasto: el simulador (trigger `tick` cada minuto) llama a OpenAI aunque nadie use a SofIA; se sugirió pausarlo con `borrarTriggerTick` y reactivarlo con `crearTriggerTick`. La alumna creó una clave nueva de OpenAI y una credencial nueva en n8n ("OpenAI account 10"), y la asignó al workflow: el AI Agent volvió a responder.
- Segundo problema de la voz (02/10): la credencial "Google Sheets" de n8n venció ("refresh token expired"), así que SofIA no podía leer la planilla "Scrip tablas memoria de Sofia". Solución: reconectar la credencial desde el lápiz del nodo (Sign in with Google con la cuenta dueña de la planilla). Si vuelve a vencer cada ~7 días, es porque la app OAuth de Google Cloud está en modo "Testing".
- Voz (02/10): se corrigió el prompt del AI Agent (hablaba de una herramienta "consultar_hoja" inexistente; ahora usa los nombres reales). Las llamadas de Retell no llegaban a n8n por un bloqueo de Cloudflare (403) causado por un mantenimiento de los servidores de ADEN; ADEN avisó que lo restaura. Si sigue fallando después, revisar.
- Precios: la tienda muestra USD desde `src/data.js` ($1.50 / $2.75 / $3.00) y el backend registra los de su hoja carta (2000 / 3000 / 3500). Se unifican en la Etapa 8, cuando la carta de la tienda se lea de la planilla.
