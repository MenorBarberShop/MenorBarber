// Configuración de barberos
const barberos = {
    'el_menor': {
        nombre: 'El Menor',
        telefono: '+5411123191879' // Número de WhatsApp del barbero
    },
    'jhonathan': {
        nombre: 'Jhonathan',
        telefono: '+5411123191879' // Mismo número para ambos barberos
    }
};

// Servicios disponibles (duración en minutos)
const servicios = {
    'corte': {
        nombre: 'Corte de pelo',
        duracion: 35,
        precio: 12000
    },
    'corte_barba': {
        nombre: 'Corte + Barba',
        duracion: 35,
        precio: 15000
    }
};

// Generar horarios disponibles (10:00 AM a 9:00 PM, intervalos de 35 minutos)
function generarHorarios() {
    const horarios = [];
    let hora = 10; // 10:00 AM
    let minutos = 0;

    while (hora < 21 || (hora === 21 && minutos === 0)) { // Hasta 9:00 PM
        const horaStr = hora.toString().padStart(2, '0');
        const minutosStr = minutos.toString().padStart(2, '0');
        horarios.push(`${horaStr}:${minutosStr}`);

        // Agregar 35 minutos
        minutos += 35;
        if (minutos >= 60) {
            hora += Math.floor(minutos / 60);
            minutos = minutos % 60;
        }
    }

    return horarios;
}

const horariosDisponibles = generarHorarios();

// Turnos ya reservados (simulación - en una app real vendría de una base de datos)
let turnosReservados = JSON.parse(localStorage.getItem('turnosReservados')) || [];

// Elementos del DOM
const fechaInput = document.getElementById('fecha');
const barberoSelect = document.getElementById('barbero');
const horaSelect = document.getElementById('hora');
const reservaForm = document.getElementById('reservaForm');
const confirmacionDiv = document.getElementById('confirmacion');

// Configurar fecha mínima (hoy)
const hoy = new Date();
fechaInput.min = hoy.toISOString().split('T')[0];

// Configurar fecha máxima (30 días desde hoy)
const fechaMaxima = new Date();
fechaMaxima.setDate(hoy.getDate() + 30);
fechaInput.max = fechaMaxima.toISOString().split('T')[0];

// Función para verificar si una fecha es domingo
function esDomingo(fecha) {
    const date = new Date(fecha + 'T00:00:00');
    return date.getDay() === 0; // 0 = domingo
}

// Bloquear domingos en el input de fecha
fechaInput.addEventListener('input', function () {
    if (esDomingo(this.value)) {
        alert('Los domingos no trabajamos. Por favor selecciona otro día.');
        this.value = '';
        horaSelect.innerHTML = '<option value="">Selecciona una hora</option>';
    }
});

// Event listeners
barberoSelect.addEventListener('change', actualizarHorarios);
fechaInput.addEventListener('change', actualizarHorarios);

function actualizarHorarios() {
    const barberoSeleccionado = barberoSelect.value;
    const fechaSeleccionada = fechaInput.value;

    // Limpiar opciones de hora
    horaSelect.innerHTML = '<option value="">Selecciona una hora</option>';

    if (!barberoSeleccionado || !fechaSeleccionada) {
        return;
    }

    // Verificar si es domingo
    if (esDomingo(fechaSeleccionada)) {
        const option = document.createElement('option');
        option.textContent = 'Los domingos no trabajamos';
        option.disabled = true;
        horaSelect.appendChild(option);
        return;
    }

    // Filtrar horarios ya reservados para esta fecha y barbero
    const horariosLibres = horariosDisponibles.filter(hora => {
        const turnoExiste = turnosReservados.some(turno =>
            turno.barbero === barberoSeleccionado &&
            turno.fecha === fechaSeleccionada &&
            turno.hora === hora
        );
        return !turnoExiste;
    });

    // Agregar horarios disponibles al select
    horariosLibres.forEach(hora => {
        const option = document.createElement('option');
        option.value = hora;
        option.textContent = hora;
        horaSelect.appendChild(option);
    });

    if (horariosLibres.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'No hay horarios disponibles';
        option.disabled = true;
        horaSelect.appendChild(option);
    }
}

// Manejar envío del formulario
reservaForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(reservaForm);
    const turno = {
        id: Date.now(), // ID único simple
        nombre: formData.get('nombre'),
        telefono: formData.get('telefono'),
        servicio: formData.get('servicio'),
        barbero: formData.get('barbero'),
        fecha: formData.get('fecha'),
        hora: formData.get('hora'),
        fechaReserva: new Date().toLocaleString('es-ES')
    };

    // Validar que no exista el turno
    const turnoExiste = turnosReservados.some(t =>
        t.barbero === turno.barbero &&
        t.fecha === turno.fecha &&
        t.hora === turno.hora
    );

    if (turnoExiste) {
        alert('Este horario ya no está disponible. Por favor selecciona otro.');
        actualizarHorarios();
        return;
    }

    // Guardar turno
    turnosReservados.push(turno);
    localStorage.setItem('turnosReservados', JSON.stringify(turnosReservados));

    // Enviar mensaje de WhatsApp al barbero
    enviarWhatsAppBarbero(turno);

    // Mostrar confirmación
    mostrarConfirmacion(turno);
});

// Función para enviar WhatsApp al barbero
function enviarWhatsAppBarbero(turno) {
    const barbero = barberos[turno.barbero];
    const servicio = servicios[turno.servicio];

    // Formatear fecha para el mensaje (formato simple)
    const fechaFormateada = new Date(turno.fecha + 'T00:00:00').toLocaleDateString('es-ES');

    // Crear mensaje de WhatsApp simple con solo la información solicitada
    const mensaje = `Nuevo turno reservado:

Nombre: ${turno.nombre}
Servicio: ${servicio.nombre}
Fecha: ${fechaFormateada}
Hora: ${turno.hora}`;

    // Crear URL de WhatsApp
    const whatsappUrl = `https://wa.me/${barbero.telefono}?text=${encodeURIComponent(mensaje)}`;

    // Abrir WhatsApp en una nueva ventana (simulación)
    console.log('Enviando WhatsApp a:', barbero.nombre);
    console.log('Mensaje:', mensaje);
    console.log('URL:', whatsappUrl);

    // En una implementación real, aquí se haría la llamada a la API de WhatsApp
    // window.open(whatsappUrl, '_blank');
}

function mostrarConfirmacion(turno) {
    // Ocultar formulario
    reservaForm.style.display = 'none';

    // Obtener datos del servicio y barbero
    const servicio = servicios[turno.servicio];
    const barbero = barberos[turno.barbero];

    // Formatear fecha
    const fechaFormateada = new Date(turno.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Mostrar detalles del turno
    document.getElementById('detalles-turno').innerHTML = `
        <p><strong>Cliente:</strong> ${turno.nombre}</p>
        <p><strong>Teléfono:</strong> ${turno.telefono}</p>
        <p><strong>Servicio:</strong> ${servicio.nombre} - $${servicio.precio}</p>
        <p><strong>Duración:</strong> ${servicio.duracion} minutos</p>
        <p><strong>Barbero:</strong> ${barbero.nombre}</p>
        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
        <p><strong>Hora:</strong> ${turno.hora}</p>
        <p><strong>Número de turno:</strong> #${turno.id}</p>
        <div class="whatsapp-info">
            <p>✅ Se ha enviado un mensaje de WhatsApp a ${barbero.nombre} con los detalles de tu turno.</p>
        </div>
    `;

    // Mostrar confirmación
    confirmacionDiv.style.display = 'block';
}

function nuevaReserva() {
    // Resetear formulario
    reservaForm.reset();

    // Mostrar formulario y ocultar confirmación
    reservaForm.style.display = 'flex';
    confirmacionDiv.style.display = 'none';

    // Limpiar horarios
    horaSelect.innerHTML = '<option value="">Selecciona una hora</option>';
}

// Función para ver todos los turnos (para administración)
function verTurnos() {
    console.log('Turnos reservados:', turnosReservados);
    return turnosReservados;
}

// Función para cancelar un turno
function cancelarTurno(id) {
    turnosReservados = turnosReservados.filter(turno => turno.id !== id);
    localStorage.setItem('turnosReservados', JSON.stringify(turnosReservados));
    console.log('Turno cancelado');
}
// ===== FUNCIONES DEL PANEL DEL BARBERO =====

// Contraseña para acceder al panel del barbero
const CONTRASENA_PANEL = "barbero123";

function abrirPanelBarbero() {
    // Solicitar contraseña
    const contrasenaIngresada = prompt("Ingresa la contraseña para acceder al panel del barbero:");

    // Verificar contraseña
    if (contrasenaIngresada !== CONTRASENA_PANEL) {
        alert("Contraseña incorrecta. Acceso denegado.");
        return;
    }

    // Si la contraseña es correcta, mostrar el panel
    confirmacionDiv.style.display = 'none';
    document.getElementById('panel-barbero').style.display = 'block';

    // Configurar fecha de hoy por defecto
    document.getElementById('filtro-fecha').value = hoy.toISOString().split('T')[0];

    // Mostrar todos los turnos
    mostrarTurnos();
}

function cerrarPanelBarbero() {
    // Ocultar panel y mostrar formulario
    document.getElementById('panel-barbero').style.display = 'none';
    reservaForm.style.display = 'flex';
}

function filtrarTurnos() {
    mostrarTurnos();
}

function mostrarTurnos() {
    const filtroBarbero = document.getElementById('filtro-barbero').value;
    const filtroFecha = document.getElementById('filtro-fecha').value;
    const listaTurnos = document.getElementById('lista-turnos');

    // Filtrar turnos según los criterios
    let turnosFiltrados = turnosReservados.filter(turno => {
        let cumpleFiltros = true;

        if (filtroBarbero && turno.barbero !== filtroBarbero) {
            cumpleFiltros = false;
        }

        if (filtroFecha && turno.fecha !== filtroFecha) {
            cumpleFiltros = false;
        }

        return cumpleFiltros;
    });

    // Ordenar por fecha y hora
    turnosFiltrados.sort((a, b) => {
        if (a.fecha !== b.fecha) {
            return new Date(a.fecha) - new Date(b.fecha);
        }
        return a.hora.localeCompare(b.hora);
    });

    // Mostrar turnos
    if (turnosFiltrados.length === 0) {
        listaTurnos.innerHTML = '<div class="no-turnos">No hay turnos para los filtros seleccionados</div>';
        return;
    }

    let html = '';
    turnosFiltrados.forEach(turno => {
        const servicio = servicios[turno.servicio];
        const barbero = barberos[turno.barbero];

        // Formatear fecha
        const fechaFormateada = new Date(turno.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });

        html += `
            <div class="turno-card" data-id="${turno.id}">
                <div class="turno-info">
                    <div class="turno-header">
                        <span class="turno-id">#${turno.id}</span>
                        <span class="turno-fecha">${fechaFormateada} - ${turno.hora}</span>
                    </div>
                    <div class="turno-detalles">
                        <p><strong>Cliente:</strong> ${turno.nombre}</p>
                        <p><strong>Teléfono:</strong> ${turno.telefono}</p>
                        <p><strong>Servicio:</strong> ${servicio.nombre} ($${servicio.precio})</p>
                        <p><strong>Barbero:</strong> ${barbero.nombre}</p>
                        <p><strong>Duración:</strong> ${servicio.duracion} min</p>
                    </div>
                </div>
                <div class="turno-acciones">
                    <button onclick="editarTurno(${turno.id})" class="btn-editar">Editar</button>
                    <button onclick="cancelarTurnoPanel(${turno.id})" class="btn-cancelar">Cancelar</button>
                </div>
            </div>
        `;
    });

    listaTurnos.innerHTML = html;
}

function editarTurno(id) {
    const turno = turnosReservados.find(t => t.id === id);
    if (!turno) return;

    // Llenar formulario con datos del turno
    document.getElementById('nombre').value = turno.nombre;
    document.getElementById('telefono').value = turno.telefono;
    document.getElementById('barbero').value = turno.barbero;
    document.getElementById('servicio').value = turno.servicio;
    document.getElementById('fecha').value = turno.fecha;

    // Actualizar horarios y seleccionar el actual
    actualizarHorarios();
    setTimeout(() => {
        document.getElementById('hora').value = turno.hora;
    }, 100);

    // Eliminar turno actual (se creará uno nuevo al guardar)
    cancelarTurno(id);

    // Volver al formulario
    cerrarPanelBarbero();

    alert('Turno cargado para edición. Modifica los datos y guarda nuevamente.');
}

function cancelarTurnoPanel(id) {
    if (confirm('¿Estás seguro de que quieres cancelar este turno?')) {
        const turno = turnosReservados.find(t => t.id === id);

        // Enviar notificación de cancelación por WhatsApp
        if (turno) {
            enviarCancelacionWhatsApp(turno);
        }

        // Cancelar turno
        cancelarTurno(id);

        // Actualizar vista
        mostrarTurnos();

        alert('Turno cancelado exitosamente.');
    }
}

function enviarCancelacionWhatsApp(turno) {
    const barbero = barberos[turno.barbero];
    const servicio = servicios[turno.servicio];

    // Formatear fecha para el mensaje
    const fechaFormateada = new Date(turno.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    // Crear mensaje de cancelación
    const mensaje = `❌ Turno cancelado
    
Cliente: ${turno.nombre}
Servicio: ${servicio.nombre}
Fecha: ${fechaFormateada}
Hora: ${turno.hora}
Número de turno: #${turno.id}

El turno ha sido cancelado.`;

    console.log('Enviando cancelación por WhatsApp a:', barbero.nombre);
    console.log('Mensaje:', mensaje);
}

// Inicializar panel con fecha de hoy
document.addEventListener('DOMContentLoaded', function () {
    const filtroFecha = document.getElementById('filtro-fecha');
    if (filtroFecha) {
        filtroFecha.value = hoy.toISOString().split('T')[0];
    }
});