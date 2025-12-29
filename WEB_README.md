# YouTube Downloader Web

Aplicación web para descargar videos de YouTube con interfaz moderna usando Next.js, React, Tailwind CSS y SweetAlert2.

## Estructura del Proyecto

```
yt/
├── api/                    # Backend FastAPI
│   ├── main.py            # API principal
│   └── requirements.txt   # Dependencias Python
├── web/                    # Frontend Next.js
│   ├── src/
│   │   ├── app/           # Páginas de la aplicación
│   │   └── components/    # Componentes React
│   ├── package.json       # Dependencias Node.js
│   └── tailwind.config.js # Configuración Tailwind
├── downloads/              # Carpeta de descargas
├── cookies.txt            # Cookies para autenticación (opcional)
└── yt_downloader.py       # Script CLI original
```

## Requisitos

- **Python 3.9+**
- **Node.js 18+**
- **FFmpeg** (para conversión de audio/video)

## Instalación

### 1. Backend (API)

```bash
# Navegar a la carpeta api
cd api

# Crear entorno virtual (opcional pero recomendado)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Frontend (Web)

```bash
# Navegar a la carpeta web
cd web

# Instalar dependencias
npm install
```

## Ejecución

### Iniciar el Backend

```bash
cd api
python main.py
```

El servidor API se iniciará en `http://localhost:8000`

### Iniciar el Frontend

```bash
cd web
npm run dev
```

La aplicación web estará disponible en `http://localhost:3000`

## Características

- 🎬 **Descarga de videos** en múltiples resoluciones (1080p, 720p, 480p, etc.)
- 🎵 **Extracción de audio** en MP3 o M4A con diferentes bitrates
- 📱 **Interfaz responsive** que funciona en móviles y escritorio
- 🔄 **Progreso en tiempo real** de las descargas
- 📂 **Gestor de descargas** para ver y acceder a archivos descargados
- 🍪 **Soporte de cookies** para videos con restricciones de edad
- 🎨 **Tema oscuro** estilo YouTube

## Tecnologías

### Backend

- **FastAPI** - Framework web asíncrono
- **yt-dlp** - Descarga de videos
- **uvicorn** - Servidor ASGI

### Frontend

- **Next.js 14** - Framework React
- **React 18** - Librería UI
- **Tailwind CSS** - Estilos utilitarios
- **SweetAlert2** - Alertas elegantes
- **Lucide React** - Iconos

## Uso de Cookies

Para videos con restricciones de edad o contenido privado, coloca un archivo `cookies.txt` en la raíz del proyecto. Puedes exportar las cookies usando extensiones del navegador como "Get cookies.txt".

## Scripts Disponibles

### API

- `python main.py` - Inicia el servidor de desarrollo

### Web

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run start` - Inicia el servidor de producción

## Notas

- El archivo `yt_downloader.py` en la raíz es el script CLI original y se mantiene como referencia
- Las descargas se guardan en la carpeta `downloads/`
- Asegúrate de tener FFmpeg instalado y en el PATH para la conversión de formatos

## Licencia

MIT
