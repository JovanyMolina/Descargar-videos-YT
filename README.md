# YT Downloader - Frontend

## 📋 ¿Qué es este proyecto?

Este es el **frontend** de un descargador de videos de YouTube. La aplicación web permite a los usuarios descargar videos de YouTube de manera sencilla a través de una interfaz moderna y fácil de usar.

> **Nota:** Este repositorio contiene únicamente el frontend. El backend/API se encuentra en un repositorio separado.

## 🛠️ Tecnologías utilizadas

| Tecnología       | Versión | Descripción                                   |
| ---------------- | ------- | --------------------------------------------- |
| **Next.js**      | 16.1.6  | Framework de React para aplicaciones web      |
| **React**        | 18.2.0  | Librería para construir interfaces de usuario |
| **TypeScript**   | 5.0.0   | Superset de JavaScript con tipado estático    |
| **Tailwind CSS** | 3.4.1   | Framework de CSS utilitario                   |
| **Lucide React** | 0.400.0 | Librería de iconos                            |
| **SweetAlert2**  | 11.10.0 | Librería para alertas y modales               |

## 🚀 Instalación

1. Clona el repositorio:

```bash
git clone <url-del-repositorio>
cd yt/web
```

2. Instala las dependencias:

```bash
npm install
```

3. Inicia el servidor de desarrollo:

```bash
npm run dev
```

## 🔄 Cómo mantener actualizado el proyecto

### Actualizar dependencias

1. **Ver dependencias desactualizadas:**

```bash
npm outdated
```

2. **Actualizar todas las dependencias a la última versión compatible:**

```bash
npm update
```

3. **Actualizar a las últimas versiones (puede incluir breaking changes):**

```bash
npm install <paquete>@latest
```

### Actualizar desde el repositorio remoto

```bash
git pull origin main
npm install
```

## 📜 Scripts disponibles

| Comando         | Descripción                                |
| --------------- | ------------------------------------------ |
| `npm run dev`   | Inicia el servidor de desarrollo           |
| `npm run build` | Compila la aplicación para producción      |
| `npm run start` | Inicia el servidor de producción           |
| `npm run lint`  | Ejecuta el linter para verificar el código |
