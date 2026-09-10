# 🤖 Asistente AI Local con Memoria Episódica

Un asistente virtual de inteligencia artificial 100% local, privado y personalizado, impulsado por el motor **Ollama** y el modelo **Qwen2.5:7b**. Cuenta con una interfaz web oscura, limpia y moderna construida en HTML, CSS y JavaScript vainilla, e incluye un sistema de gestión de memoria episódica persistente en el navegador.

---

## 🚀 Características Principales

* **100% Local y Privado:** Sin llamadas a APIs externas ni suscripciones; todas las inferencias corren localmente en tu equipo.
* **Memoria Episódica Persistente:** Permite registrar eventos, fechas e información importante que el modelo toma en cuenta en cada interacción.
* **Personalización Dinámica:** Ajusta el nombre del usuario y adapta la bienvenida y respuestas en tiempo real.
* **UX/UI Optimizada:** Interfaz estilo chat con modo oscuro, soporte para `Enter` (enviar) y `Shift + Enter` (salto de línea), y ajuste dinámico de altura en el área de texto.
* **Sin Dependencias Complejas:** Funciona mediante un servidor HTTP nativo de Python y peticiones `fetch` a la API local de Ollama.

---

## 📋 Requisitos Previos

1. **[Ollama](https://ollama.com/):** Instalado y ejecutándose en tu sistema.
2. **[Python 3.x](https://www.python.org/):** Necesario para desplegar el servidor HTTP local en Windows/Linux/macOS.
3. **Modelo Base:** Haber descargado la versión de 7B parámetros de Qwen:
   ```bash
   ollama pull qwen2.5:7b


🛠️ Instalación y Configuración
1. Clonar o descargar el repositorio



Bash
git clone [https://github.com/TU_USUARIO/TU_REPOSITORIO.git](https://github.com/TU_USUARIO/TU_REPOSITORIO.git)
cd TU_REPOSITORIO


2. Crear el Modelfile Personalizado
Crea un archivo llamado Modelfile (sin extensión) en la raíz del proyecto con la siguiente estructura:



Dockerfile
FROM qwen2.5:7b

PARAMETER temperature 0.6
PARAMETER top_p 0.9

SYSTEM """
Eres un asistente personal inteligente, servicial y conciso que funciona de manera 100% local.

Pautas de comportamiento:
1. Nombre del usuario: Si el contexto incluye el nombre del usuario, dirígete a él de forma natural usando su nombre.
2. Manejo de memorias y eventos: Cuando en el contexto de la conversación se proporcionen Memorias Registradas o Eventos Importantes con sus respectivas fechas y detalles, utilízalos para dar respuestas personalizadas y precisas sobre la vida, planes y antecedentes del usuario.
3. Tono: Mantén una interacción amable, directa y estructurada. Evita rodeos innecesarios.
4. Formato: Utiliza formato Markdown cuando sea útil para estructurar listas, código o puntos clave.
"""

MESSAGE user "[Contexto - Usuario: Pablo]\nHola, ¿cómo estás?"
MESSAGE assistant "¡Hola, Pablo! Todo muy bien por aquí. ¿En qué te puedo ayudar hoy?"

MESSAGE user "[Contexto - Memorias: (2026-03-15: Lanzamiento del sitio web), (2026-04-10: Cita médica a las 15:00)]\n¿Recuerdas cuándo tengo que ir al médico?"
MESSAGE assistant "Sí, Pablo. Tienes tu cita médica registrada para el 10 de abril de 2026 a las 15:00."


3. Compilar el Modelo en Ollama
Abre tu terminal dentro de la carpeta del proyecto y ejecuta:



Bash
ollama create mi-asistente-local -f ./Modelfile


⚡ Ejecución en Windows (Scripts Automatizados)
Para mayor comodidad en Windows, puedes usar los scripts incluidos en la raíz del proyecto:
Opción A: Modo Consola (iniciar.bat)
Abre el servidor local de Python manteniendo visible la ventana de comandos para depuración o seguimiento:
Haz doble clic en iniciar.bat.



DOS
@echo off
title Asistente Local - Servidor
echo Iniciando Asistente Local...
start /b python -m http.server 8000
timeout /t 1 >nul
start http://localhost:8000


Opción B: Modo Silencioso / Segundo Plano (iniciar_oculto.vbs)
Ejecuta el servidor de forma totalmente invisible en segundo plano y abre la web en tu navegador predeterminado:
Haz doble clic en iniciar_oculto.vbs.



VBScript
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c python -m http.server 8000", 0, False
WScript.Sleep 1000
WshShell.Run "http://localhost:8000"


Detener el servidor en segundo plano (detener_servidor.bat)
Si iniciaste el servidor en modo oculto y deseas cerrarlo:
Haz doble clic en detener_servidor.bat.



DOS
@echo off
taskkill /f /im python.exe


💻 Ejecución Manual (Cualquier Sistema Operativo)
Abre la terminal en la carpeta del proyecto.
Inicia el servidor nativo de Python:
Bash
python -m http.server 8000


Abre tu navegador web e ingresa a:
http://localhost:8000


📁 Estructura del Proyecto



Plaintext
├── index.html            # Estructura principal e interfaz de usuario
├── style.css             # Estilos oscuros y diseño adaptativo
├── script.js            # Lógica de interacciones, llamadas a API y localStorage
├── Modelfile             # Prompt de sistema y Few-Shot examples para Ollama
├── favicon.png           # Icono de la pestaña del navegador
├── iniciar.bat           # Script de inicio rápido con consola visible (Windows)
├── iniciar_oculto.vbs    # Script de inicio en segundo plano sin consola (Windows)
├── detener_servidor.bat  # Script para finalizar el proceso del servidor
└── README.md             # Documentación general del proyecto


🔧 Solución de Problemas Frecuentes
Error de conexión con Ollama: Asegúrate de que Ollama se esté ejecutando en segundo plano en http://localhost:11434.
CORS / Bloqueo de origen: No abras el archivo index.html haciendo doble clic directo (file://), utiliza siempre el servidor web local (http://localhost:8000).
Cambios no visibles: Presiona Ctrl + F5 en el navegador para recargar la página limpiando la memoria caché.
