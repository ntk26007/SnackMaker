# 🍿 SnackMaker — Instalación

## 🖥️ Instalación de la aplicación de escritorio

### Paso 1 — Instalar dependencias

Abre el **cmd** dentro de la carpeta raíz del proyecto (donde está el `package.json`) y ejecuta:

```bash
npm install electron --save-dev
npm install electron-builder --save-dev
npm install cross-env --save-dev
```

### Paso 2 — Ejecutar en modo desarrollo

```bash
npm run electron
```

> Lanza la aplicación Electron en modo desarrollo.

### Paso 3 — Generar instalador para Windows

```bash
npm run dist:win
```

> Genera el instalador `.exe` dentro de la carpeta `/release`, listo para distribuir.

---

## 🌐 Aplicación web

Accede directamente desde el navegador sin ninguna instalación:

🔗 [https://snackmacker.netlify.app/](https://snackmacker.netlify.app/)
