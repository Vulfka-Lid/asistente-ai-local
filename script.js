/* ==========================================================================
   CONFIGURACIÓN GLOBAL DEL ASISTENTE LOCAL
   ========================================================================== */
const CONFIG = {
    nombreAsistente: "mi-asistente-local",
    puertoOllama: "http://localhost:11434",
    modeloDefecto: "qwen2.5:7b", // Cambia según el modelo que tengas en Ollama
    promptSistema: "Eres un asistente virtual empático, cercano y atento. Tu objetivo es mantener conversaciones naturales, brindar apoyo conversacional y recordar siempre los eventos importantes compartidos por el usuario."
};

/* ==========================================================================
   ESTADO GLOBAL Y PERSISTENCIA (localStorage)
   ========================================================================== */
// Inicializar usuario desde localStorage o dejarlo nulo para solicitarlo
let usuarioNombre = localStorage.getItem('usuario_nombre') || null;
let historialChat = JSON.parse(localStorage.getItem('historial_chat')) || [];
let eventosImportantes = JSON.parse(localStorage.getItem('eventos_memoria')) || [];

/* ==========================================================================
   INICIALIZACIÓN AL CARGAR LA PÁGINA
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Si no existe un nombre guardado, lo solicitamos al abrir la app por primera vez
    if (!usuarioNombre) {
        solicitarNombreInicial();
    }

    renderizarHistorial();
    configurarAutoCrecimientoInput();
});

// Función para solicitar el nombre por primera vez
function solicitarNombreInicial() {
    let entrada = prompt("¡Bienvenido/a! ¿Cómo te gustaría que te llame el asistente?", "Usuario");
    
    if (entrada && entrada.trim() !== "") {
        usuarioNombre = entrada.trim();
    } else {
        usuarioNombre = "Usuario"; // Valor por defecto en caso de cancelar o dejar vacío
    }
    
    localStorage.setItem('usuario_nombre', usuarioNombre);
}

// Función para cambiar el nombre desde el botón de la cabecera (👤 Nombre)
function cambiarNombreUsuario() {
    const nuevoNombre = prompt("Ingresa tu nuevo nombre:", usuarioNombre || "Usuario");
    if (nuevoNombre && nuevoNombre.trim() !== "") {
        usuarioNombre = nuevoNombre.trim();
        localStorage.setItem('usuario_nombre', usuarioNombre);
        
        // Volvemos a renderizar para que el mensaje de bienvenida y los mensajes actualicen el nombre
        renderizarHistorial();
    }
}
/* ==========================================================================
   CONTROL DE MENÚS DESPLEGABLES (DROPDOWNS)
   ========================================================================== */
function toggleMenuMemoria(event) {
    event.stopPropagation();
    cerrarTodosLosMenus();
    const menu = document.getElementById('menu-memoria');
    if (menu) menu.classList.toggle('show');
}

function toggleMenuRespaldos(event) {
    event.stopPropagation();
    cerrarTodosLosMenus();
    const menu = document.getElementById('menu-respaldos');
    if (menu) menu.classList.toggle('show');
}

function cerrarTodosLosMenus() {
    const menuMemoria = document.getElementById('menu-memoria');
    const menuRespaldos = document.getElementById('menu-respaldos');
    if (menuMemoria) menuMemoria.classList.remove('show');
    if (menuRespaldos) menuRespaldos.classList.remove('show');
}

// Clic fuera de los menús para cerrarlos
window.addEventListener('click', cerrarTodosLosMenus);

/* ==========================================================================
   INTERACCIÓN CON OLLAMA (ENVÍO Y RECEPCIÓN DE MENSAJES)
   ========================================================================== */
async function enviarMensaje() {
    const inputMensaje = document.getElementById('input-mensaje');
    const textoMensaje = inputMensaje.value.trim();

    if (textoMensaje === "") return;

    // 1. Agregar mensaje del usuario al historial
    const mensajeUsuario = { role: "user", content: textoMensaje };
    historialChat.push(mensajeUsuario);
    guardarHistorialLocalStorage();
    renderizarHistorial();

    // Limpiar input y resetear su altura
    inputMensaje.value = '';
    inputMensaje.style.height = 'auto';

    // 2. Construir el contexto de la memoria episódica
    let contextoMemoria = "";
    if (eventosImportantes.length > 0) {
        contextoMemoria = "\n\nMEMORIA DE EVENTOS IMPORTANTES DEL USUARIO:\n" + 
            eventosImportantes.map(ev => `- [${ev.fecha}]: ${ev.detalle}`).join('\n');
    }

    // 3. Preparar el arreglo de mensajes enviando el Prompt de Sistema
    const mensajesParaOllama = [
        { 
            role: "system", 
            content: `${CONFIG.promptSistema} El nombre del usuario es ${usuarioNombre}.${contextoMemoria}` 
        },
        ...historialChat
    ];

    // 4. Mostrar indicador visual de "pensando..."
    mostrarIndicadorCargando(true);

    try {
        const respuesta = await fetch(`${CONFIG.puertoOllama}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: CONFIG.modeloDefecto,
                messages: mensajesParaOllama,
                stream: false
            })
        });

        if (!respuesta.ok) throw new Error("Error en la respuesta de Ollama");

        const data = await respuesta.json();
        const mensajeAsistente = { role: "assistant", content: data.message.content };
        
        historialChat.push(mensajeAsistente);
        guardarHistorialLocalStorage();
        renderizarHistorial();

    } catch (error) {
        console.error("Error al conectar con Ollama:", error);
        alert("No se pudo conectar con el servidor local de Ollama. Asegúrate de que esté ejecutándose.");
    } finally {
        mostrarIndicadorCargando(false);
    }
}

/* ==========================================================================
   RENDERIZADO Y CONTROL DE LA INTERFAZ
   ========================================================================== */
function renderizarHistorial() {
    const contenedorChat = document.getElementById('contenedor-chat');
    if (!contenedorChat) return;

    contenedorChat.innerHTML = '';

    // Si no hay mensajes guardados, mostrar mensaje de bienvenida
    if (historialChat.length === 0) {
        const divBienvenida = document.createElement('div');
        divBienvenida.classList.add('mensaje', 'asistente', 'mensaje-bienvenida');

        const etiquetaNombre = document.createElement('div');
        etiquetaNombre.classList.add('nombre-remitente');
        etiquetaNombre.innerText = CONFIG.nombreAsistente;

        const cuerpoTexto = document.createElement('span');
        cuerpoTexto.innerText = `¡Hola, ${usuarioNombre}! 👋 Soy tu asistente local. ¿En qué te puedo ayudar hoy?`;

        divBienvenida.appendChild(etiquetaNombre);
        divBienvenida.appendChild(cuerpoTexto);
        contenedorChat.appendChild(divBienvenida);
        return;
    }

    // Renderizado normal de mensajes guardados
    historialChat.forEach(msg => {
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('mensaje', msg.role === 'user' ? 'usuario' : 'asistente');

        const etiquetaNombre = document.createElement('div');
        etiquetaNombre.classList.add('nombre-remitente');
        etiquetaNombre.innerText = msg.role === 'user' ? usuarioNombre : CONFIG.nombreAsistente;

        const cuerpoTexto = document.createElement('span');
        cuerpoTexto.innerText = msg.content;

        divMensaje.appendChild(etiquetaNombre);
        divMensaje.appendChild(cuerpoTexto);
        contenedorChat.appendChild(divMensaje);
    });

    // Auto-scroll al último mensaje
    contenedorChat.scrollTop = contenedorChat.scrollHeight;
}

function mostrarIndicadorCargando(activo) {
    const indicador = document.getElementById('indicador-cargando');
    if (indicador) {
        indicador.style.display = activo ? 'block' : 'none';
    }
}

function cambiarNombreUsuario() {
    const nuevoNombre = prompt("Ingresa tu nombre:", usuarioNombre);
    if (nuevoNombre && nuevoNombre.trim() !== "") {
        usuarioNombre = nuevoNombre.trim();
        localStorage.setItem('usuario_nombre', usuarioNombre);
        renderizarHistorial();
    }
}

function borrarHistorial() {
    if (confirm("¿Estás seguro de que deseas borrar todo el historial del chat? Esto no afectará las memorias guardadas.")) {
        historialChat = [];
        localStorage.removeItem('historial_chat');
        renderizarHistorial();
    }
}

function guardarHistorialLocalStorage() {
    localStorage.setItem('historial_chat', JSON.stringify(historialChat));
}

/* ==========================================================================
   MEMORIA EPISÓDICA (REGISTRO, VER, EDITAR Y ELIMINAR)
   ========================================================================== */
function agregarEventoImportante() {
    cerrarTodosLosMenus();
    document.getElementById('titulo-modal-evento').innerText = '✨ Nueva Memoria';
    document.getElementById('index-evento-editar').value = '-1';

    const fechaHoy = new Date().toISOString().split('T')[0];
    document.getElementById('input-fecha-evento').value = fechaHoy;
    document.getElementById('input-detalle-evento').value = '';

    document.getElementById('modal-agregar-evento').style.display = 'flex';
}

function editarEvento(index) {
    cerrarModalEventos();
    const evento = eventosImportantes[index];

    document.getElementById('titulo-modal-evento').innerText = '✏️ Editar Memoria';
    document.getElementById('index-evento-editar').value = index;

    document.getElementById('input-fecha-evento').value = evento.fecha;
    document.getElementById('input-detalle-evento').value = evento.detalle;

    document.getElementById('modal-agregar-evento').style.display = 'flex';
}

function guardarNuevoEvento() {
    const index = parseInt(document.getElementById('index-evento-editar').value);
    const fecha = document.getElementById('input-fecha-evento').value;
    const detalle = document.getElementById('input-detalle-evento').value.trim();

    if (!fecha || !detalle) {
        alert("Por favor completa la fecha y el detalle del evento.");
        return;
    }

    if (index === -1) {
        eventosImportantes.push({ fecha, detalle });
    } else {
        eventosImportantes[index] = { fecha, detalle };
    }

    localStorage.setItem('eventos_memoria', JSON.stringify(eventosImportantes));
    cerrarModalAgregarEvento();

    if (index !== -1) {
        verEventosImportantes();
    }
}

function verEventosImportantes() {
    cerrarTodosLosMenus();
    const modal = document.getElementById('modal-eventos');
    const contenedorLista = document.getElementById('lista-eventos');
    contenedorLista.innerHTML = '';

    if (eventosImportantes.length === 0) {
        contenedorLista.innerHTML = '<p style="color: #a1a1aa; padding: 10px 0;">No hay memorias registradas.</p>';
    } else {
        eventosImportantes.forEach((evento, index) => {
            const divItem = document.createElement('div');
            divItem.classList.add('item-evento');
            divItem.innerHTML = `
                <div class="info-evento">
                    <strong>[${evento.fecha}]</strong>
                    <p>${evento.detalle}</p>
                </div>
                <div class="acciones-evento">
                    <button class="btn-accion-evento" onclick="editarEvento(${index})">✏️</button>
                    <button class="btn-accion-evento" onclick="eliminarEvento(${index})">🗑️</button>
                </div>
            `;
            contenedorLista.appendChild(divItem);
        });
    }

    modal.style.display = 'flex';
}

function eliminarEvento(index) {
    if (confirm("¿Deseas eliminar este registro de la memoria?")) {
        eventosImportantes.splice(index, 1);
        localStorage.setItem('eventos_memoria', JSON.stringify(eventosImportantes));
        verEventosImportantes();
    }
}

function cerrarModalAgregarEvento() {
    document.getElementById('modal-agregar-evento').style.display = 'none';
}

function cerrarModalEventos() {
    document.getElementById('modal-eventos').style.display = 'none';
}

/* ==========================================================================
   EXPORTACIÓN Y RESPALDOS (TXT Y JSON)
   ========================================================================== */
async function exportarHistorialTxt() {
    cerrarTodosLosMenus();
    if (historialChat.length === 0 && eventosImportantes.length === 0) {
        alert("No hay información registrada para exportar.");
        return;
    }

    let textoCompleto = "========================================\n";
    textoCompleto += ` HISTORIAL Y MEMORIAS DEL ASISTENTE\n`;
    textoCompleto += ` Fecha de exportación: ${new Date().toLocaleString()}\n`;
    textoCompleto += "========================================\n\n";

    textoCompleto += "----------------------------------------\n";
    textoCompleto += " 📌 EVENTOS IMPORTANTES (MEMORIA)\n";
    textoCompleto += "----------------------------------------\n";

    if (eventosImportantes.length === 0) {
        textoCompleto += "(Sin eventos registrados)\n\n";
    } else {
        eventosImportantes.forEach(ev => {
            textoCompleto += `[${ev.fecha}] ${ev.detalle}\n`;
        });
        textoCompleto += "\n";
    }

    textoCompleto += "----------------------------------------\n";
    textoCompleto += " 💬 CONVERSACIÓN\n";
    textoCompleto += "----------------------------------------\n\n";

    if (historialChat.length === 0) {
        textoCompleto += "(Sin historial de conversación)\n";
    } else {
        historialChat.forEach(msg => {
            const emisor = msg.role === 'user' ? usuarioNombre : CONFIG.nombreAsistente;
            textoCompleto += `${emisor}:\n${msg.content}\n\n`;
        });
    }

    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Historial_Chat_${fecha}.txt`;

    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: nombreArchivo,
                types: [{ description: 'Archivo de texto', accept: { 'text/plain': ['.txt'] } }],
            });
            const writable = await handle.createWritable();
            await writable.write(textoCompleto);
            await writable.close();
        } catch (err) {
            console.log('Guardado cancelado por el usuario');
        }
    } else {
        guardarPorDescargaTradicional(textoCompleto, nombreArchivo, 'text/plain;charset=utf-8');
    }
}

async function descargarRespaldoJSON() {
    cerrarTodosLosMenus();
    if (historialChat.length === 0 && eventosImportantes.length === 0) {
        alert("No hay datos para respaldar.");
        return;
    }

    const paqueteRespaldo = {
        usuario: usuarioNombre,
        eventos: eventosImportantes,
        historial: historialChat
    };

    const datosJSON = JSON.stringify(paqueteRespaldo, null, 2);
    const fecha = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Respaldo_Chat_${fecha}.json`;

    if ('showSaveFilePicker' in window) {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: nombreArchivo,
                types: [{ description: 'Archivo JSON', accept: { 'application/json': ['.json'] } }],
            });
            const writable = await handle.createWritable();
            await writable.write(datosJSON);
            await writable.close();
        } catch (err) {
            console.log('Guardado cancelado por el usuario');
        }
    } else {
        guardarPorDescargaTradicional(datosJSON, nombreArchivo, 'application/json;charset=utf-8');
    }
}

function cargarRespaldoJSON(event) {
    cerrarTodosLosMenus();
    const archivo = event.target.files[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onload = function(e) {
        try {
            const datos = JSON.parse(e.target.result);
            if (datos.historial || datos.eventos) {
                historialChat = datos.historial || [];
                eventosImportantes = datos.eventos || [];
                if (datos.usuario) usuarioNombre = datos.usuario;

                guardarHistorialLocalStorage();
                localStorage.setItem('eventos_memoria', JSON.stringify(eventosImportantes));
                localStorage.setItem('usuario_nombre', usuarioNombre);

                renderizarHistorial();
                alert("Respaldo cargado con éxito.");
            } else {
                alert("El archivo JSON no tiene la estructura correcta.");
            }
        } catch (err) {
            alert("Error al leer el archivo JSON.");
        }
    };
    lector.readAsText(archivo);
}

// Fallback de descarga mediante etiqueta <a>
function guardarPorDescargaTradicional(contenido, nombreArchivo, tipoMime) {
    const blob = new Blob([contenido], { type: tipoMime });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(enlace.href);
}
/* ==========================================================================
   CONFIGURACIÓN Y MANEJO DEL TEXTAREA (ENTER Y AUTO-CRECIMIENTO)
   ========================================================================== */
function configurarAutoCrecimientoInput() {
    const inputMensaje = document.getElementById('input-mensaje');
    if (!inputMensaje) return;

    // Ajustar altura automáticamente al escribir
    inputMensaje.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';
    });

    // Enviar con Enter (y permitir salto de línea con Shift + Enter)
    inputMensaje.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Evita el salto de línea por defecto
            enviarMensaje();        // Llama a tu función de envío
        }
    });
}