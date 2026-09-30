# Mi progreso — Café SofIA

## Clase 5 · De un prompt a una app publicada en Internet (tramo final)
- [x] Etapa 0 · Punto de partida: llegaste a Claude Code — confirmado, proyecto abierto en VS Code con Claude Code respondiendo.
- [x] Etapa 1 · GitHub — repo: https://github.com/varrodas01-art/Cafe-SofIA (rama main subida, autenticado con Personal Access Token guardado en el equipo del alumno)
- [x] Etapa 2 · Vercel — URL pública: https://cafe-sof-ia.vercel.app/ (deploy automático desde GitHub)

## Clase 6 · Conectar con el mundo real
- [x] Etapa 3 · La arquitectura, como un restaurante — confirmó el concepto frontend/backend.
- [ ] Etapa 4 · Conectar el frontend con el backend
- [ ] Etapa 5 · Variables de entorno
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
- Pendiente: confirmar el checkpoint conceptual de la Etapa 3 (frontend vs. backend) antes de pasar a la Etapa 4.
