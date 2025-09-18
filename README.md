#  YouTube Downloader v1.0.0

Un descargador de videos de YouTube simple y eficiente para **Windows** usando `yt-dlp` y `ffmpeg`. Permite descargar videos en diferentes calidades o solo el audio en formato MP3/M4A.

##  Características

-  **Descarga de video**: Múltiples resoluciones disponibles (480p, 720p, 1080p, etc.)
-  **Solo audio**: Extrae audio en MP3 o M4A con diferentes bitrates
-  **Mezcla automática**: Combina video y audio de alta calidad usando ffmpeg
-  **Soporte de cookies**: Maneja videos privados o con restricciones
-  **Organización automática**: Guarda archivos en carpeta `downloads/`
-  **Interfaz interactiva**: Menús fáciles de usar en la terminal
-  **Optimizado para Windows**: Funciona en PowerShell y CMD

## 📋 Requisitos del Sistema

- **Windows 11** 
- **Python 3.7+** para Windows
- **ffmpeg** (para mezclar video y audio)
- **yt-dlp**
- Esta probado en el navegador de Firefox  
- Conexión a internet

## 🚀 Instalación

### 1. Descargar Python para Windows

1. Ir la pagina oficial de Python 
2. Descargar **Python 3.11.x** (última versión estable)
3. **IMPORTANTE**: Durante la instalación marcar "Add Python to PATH" y ejecutar como admin
4. Reiniciar la computadora

### 2. Verificar instalación de Python

#### En PowerShell (recomendado)
```powershell
# Verificar Python
python --version
# Debería mostrar: Python 3.11.x

# Verificar pip
pip --version
```

### 3. Clonar o descargar el proyecto

**Opción A: Con Git**
```powershell
git clone https://github.com/tu-usuario/youtube-downloader.git
cd youtube-downloader
```

**Opción B: Descarga directa**
1. Descargar ZIP desde GitHub
2. Extraer en una carpeta (ej: `C:\youtube-downloader\`)
3. Abrir PowerShell/CMD en esa carpeta

### 4. Crear entorno virtual (recomendado)


#### En CMD
```cmd
# Crear entorno virtual
python -m venv youtube_env

# Activar entorno virtual
youtube_env\Scripts\activate

# Verificar que está activo (debería aparecer (youtube_env) al inicio)
```

### 5. Instalar dependencias de Python

```powershell
# Con el entorno virtual activado, instalar yt-dlp
pip install yt-dlp

#puedes ejecutar con cualquier gestor de paquetes pip o chose 

# Verificar instalación
yt-dlp --version
```

### 6. Instalar FFmpeg para Windows

#### Opción B: Usando winget (Windows 10/11)
```powershell
# Abrir PowerShell como Administrador
winget install ffmpeg

# Verificar instalación
ffmpeg -version
```

### 7. Verificar instalación completa

```powershell
# Verificar Python
python --version

# Verificar yt-dlp
yt-dlp --version

# Verificar ffmpeg
ffmpeg -version

# Probar importación de Python
python -c "import yt_dlp; print('yt-dlp instalado correctamente')"
```

Si todos los comandos funcionan, ¡la instalación está completa!

## 🎯 Uso

### Ejecutar el programa

#### En CMD
```cmd
# 1. Navegar a la carpeta del proyecto
cd C:\ruta\a\youtube-downloader

# 2. Activar entorno virtual (si no está activo) y (Opcional)
youtube_env\Scripts\activate

# 3. Ejecutar el programa
python youtube_downloader.py
```

### Ejemplo de uso completo

```
PS C:\youtube-downloader> python youtube_downloader.py

=== YouTube descargador (yt-dlp + ffmpeg) ===
Pega la URL del video de YouTube: https://www.youtube.com/watch?v=dQw4w9WgXcQ

Título: Rick Astley - Never Gonna Give You Up (Official Video)
Duración: 3m 33s

¿Qué deseas descargar?
------------------------
1) Video (elige resolución)
2) Solo audio (MP3/M4A)
Elige una opción (número): 1

Elige la calidad de video
-------------------------
1) 1080p (mezcla video+audio)
2) 720p (mezcla video+audio)
3) 480p (progresivo, mp4, ~25.3 MB)
4) 360p (progresivo, mp4, ~15.7 MB)
Elige una opción (número): 2

Descargando: 720p (mezcla video+audio)
Descargando: 85.3%  Vel: 2.1MB/s  ETA: 00:08
Descarga terminada. Procesando...

✔ Listo. Archivo guardado en: downloads
```

### Para descargar solo audio

```
¿Qué deseas descargar?
------------------------
1) Video (elige resolución)  
2) Solo audio (MP3/M4A)
Elige una opción (número): 2

Elige códec de audio
--------------------
1) MP3
2) M4A (AAC)
Elige una opción (número): 1

Elige bitrate (kbps)
--------------------
1) 128
2) 192
3) 256
4) 320
Elige una opción (número): 3

Descargando audio: MP3 a 256 kbps
```

## 🍪 Configuración de Cookies (Opcional)

Las cookies **NO son necesarias** para la mayoría de videos de YouTube. Solo las necesitas para:

- ✅ Videos **públicos normales** → **NO necesitas cookies**
- ❌ Videos **privados** → Necesitas cookies
- ❌ Videos con **restricción de edad** → Necesitas cookies  
- ❌ Videos con **restricciones geográficas** → Necesitas cookies
- ❌ **Contenido premium/membresías** → Necesitas cookies
- ❌ **Bot de autenticacion que coloco YT hace poco** → Necesitas cookies

### Configurar cookies (si es necesario)

#### Método 1: Archivo cookies.txt
1. Instalar la extensión "Get cookies.txt LOCALLY" en Chrome/Edge/Firefox
2. Ir a YouTube y hacer login
3. Usar la extensión para exportar cookies
4. Guardar el archivo como `cookies.txt` en la carpeta del proyecto

#### Método 2: Cookies automáticas de Firefox
El script usa automáticamente las cookies de Firefox si está instalado y has iniciado sesión en YouTube.

## 📁 Estructura del proyecto

```
youtube-downloader/
├── youtube_downloader.py    # Script principal v1.0.0
├── README.md               # Este archivo
├── youtube_env/            # Entorno virtual de Python
├── downloads/              # Carpeta de descargas (se crea automáticamente)
└── cookies.txt            # Archivo de cookies (opcional)
```

## ⚠️ Solución de problemas comunes en Windows

### Error: "Python no se reconoce como comando"
**Causa**: Python no está en el PATH de Windows  
**Solución**:
1. Reinstalar Python desde python.org
2. Marcar "Add Python to PATH" durante la instalación
3. Reiniciar la computadora
4. O usar `py` en lugar de `python`

### Error: "no se puede cargar... ejecución de scripts deshabilitada"
**Causa**: Restricciones de PowerShell  
**Solución**:
```powershell
# Ejecutar como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error: "pip no se reconoce como comando"
**Causa**: pip no está instalado o no está en el PATH  
**Solución**:
```powershell
# Reinstalar pip
python -m ensurepip --upgrade
```

### Error: "ffmpeg not found"
**Causa**: ffmpeg no está instalado o no está en el PATH  
**Solución**:
1. Seguir las instrucciones de instalación de ffmpeg
2. Verificar que `C:\ffmpeg\bin` está en el PATH
3. Reiniciar PowerShell/CMD

### Error: "Video unavailable" o "Private video"
**Causa**: Video privado, restringido por edad o geográficamente  
**Solución**: Configurar cookies (ver sección de cookies arriba)

### Downloads muy lentas
**Causa**: YouTube está limitando la velocidad  
**Solución**: 
1. Usar cookies para evitar throttling
2. Probar en diferentes horarios
3. Usar VPN si hay restricciones geográficas

### Error: "Access denied" o permisos
**Causa**: Windows está bloqueando la escritura de archivos  
**Solución**:
1. Ejecutar PowerShell como Administrador
2. Cambiar la carpeta de descarga a una ubicación sin restricciones
3. Deshabilitar temporalmente el antivirus


### ATENCION: El proyecto se elaboro sin error con lo siguiente:
**Caso de prueba**:
1. Deberas de instalar primero
   1.1 Python
   1.2 ffmpeg
   1.3 yt-dlp
2. Se descargo FireFox y se inicio sesion
3. Se trabajo en VS Code y se instalo todo ahi menos el Firefox
4. Verificar la version del punto 1.
5. Descargue la extencion de Python en VS code
6. Abre la terminal y ejecuta el git clone [URL] o solamente descarga el .zip
7. Abre el archivo de **yt_downloader.py** y click derecho **Run Python** -> **Run Python File in terminal**
8. Y ya te sale lo mismo que **🎯 Uso**

## 🚀 Crear acceso directo (opcional)

Para ejecutar fácilmente desde cualquier lugar:

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## ⚖️ Disclaimer

Este software es solo para uso educativo y personal en Windows. Respeta los términos de servicio de YouTube y las leyes de copyright. Los usuarios son responsables del uso apropiado de esta herramienta.


⭐ **¡Si te gusta el proyecto, dale una estrella!** ⭐

**Versión actual**: v1.0.0 | **Compatible y funcional en **: Windows 11 | **Última actualización**: Septiembre/2025
