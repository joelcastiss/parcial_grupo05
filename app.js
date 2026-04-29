/* =========================================
   CLÍNICA SALUD+ — LÓGICA GLOBAL (app.js)
   ========================================= */

// =====================
// STORAGE HELPERS
// =====================
const Storage = {
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch { return []; }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch { return false; }
  },
  getOne(key, id, field = 'id') {
    return this.get(key).find(item => item[field] === id) || null;
  },
  save(key, item, idField = 'id') {
    const list = this.get(key);
    const idx = list.findIndex(i => i[idField] === item[idField]);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    return this.set(key, list);
  },
  delete(key, id, idField = 'id') {
    const list = this.get(key).filter(i => i[idField] !== id);
    return this.set(key, list);
  }
};

// =====================
// ID GENERATOR
// =====================
function generateId(prefix = '') {
  return prefix + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

// =====================
// DATE HELPERS
// =====================
function today() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function formatDateTime(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  return d.toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function isFutureDate(dateStr) {
  return dateStr > today();
}

function isPastOrToday(dateStr) {
  return dateStr <= today();
}

// =====================
// VALIDATION HELPERS
// =====================
const Validators = {
  required: (val) => val !== undefined && val !== null && String(val).trim().length > 0,
  minLength: (val, min) => String(val).trim().length >= min,
  maxLength: (val, max) => String(val).trim().length <= max,
  minValue: (val, min) => parseFloat(val) >= min,
  noFuture: (dateStr) => dateStr <= today(),
  isFuture: (dateStr) => dateStr > today(),
  dniFormat: (val) => /^\d{8}$/.test(String(val).trim()),
  emailFormat: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val).trim()),
  phoneFormat: (val) => /^[\d\s\+\-]{7,15}$/.test(String(val).trim()),
  notTooShort: (val) => {
    const blocked = ['bien', 'mal', 'ok', 'nada', 'si', 'no', 'bueno'];
    return !blocked.includes(String(val).trim().toLowerCase());
  }
};

function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.add('error');
  field.classList.remove('success');
  let errEl = field.parentElement.querySelector('.field-error');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'field-error';
    field.parentElement.appendChild(errEl);
  }
  errEl.innerHTML = `⚠ ${message}`;
}

function clearFieldError(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.classList.remove('error');
  field.classList.add('success');
  const errEl = field.parentElement.querySelector('.field-error');
  if (errEl) errEl.innerHTML = '';
}

function clearAllErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll('.error').forEach(el => { el.classList.remove('error'); el.classList.remove('success'); });
  form.querySelectorAll('.field-error').forEach(el => el.innerHTML = '');
}

// =====================
// TOAST NOTIFICATIONS
// =====================
function showToast(message, type = 'info', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || 'ℹ'}</span>
    <span style="flex:1">${message}</span>
    <span class="toast-close" onclick="this.parentElement.remove()">✕</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// =====================
// MODAL HELPERS
// =====================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// Close modal on overlay click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.add('hidden');
    document.body.style.overflow = '';
  }
});

// =====================
// NAVBAR ACTIVE STATE
// =====================
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    } else {
      a.classList.remove('active');
    }
  });
}

// =====================
// CHAR COUNTER
// =====================
function setupCharCounter(inputId, counterId, max) {
  const input = document.getElementById(inputId);
  const counter = document.getElementById(counterId);
  if (!input || !counter) return;

  function update() {
    const len = input.value.length;
    counter.textContent = `${len}/${max}`;
    counter.className = 'char-counter';
    if (len > max * 0.9) counter.classList.add('danger');
    else if (len > max * 0.75) counter.classList.add('warning');
  }
  input.addEventListener('input', update);
  update();
}

// =====================
// DATA KEYS
// =====================
const KEYS = {
  PACIENTES: 'clinica_pacientes',
  CITAS: 'clinica_citas',
  HISTORIAL: 'clinica_historial',
  COUNTER: 'clinica_counters'
};

// =====================
// SEED DATA (demo)
// =====================
function seedDemoData() {
  const pacientes = Storage.get(KEYS.PACIENTES);
  if (pacientes.length > 0) return; // ya hay datos

  const demoPacientes = [
    {
      id: 'PAC001',
      dni: '45678901',
      nombres: 'María Elena',
      apellidos: 'Torres Quispe',
      fechaNacimiento: '1985-03-15',
      genero: 'F',
      telefono: '987654321',
      email: 'maria.torres@email.com',
      direccion: 'Av. Arequipa 1234, Lima',
      tipoSangre: 'O+',
      alergias: 'Penicilina, mariscos',
      antecedentes: 'Hipertensión leve',
      fechaRegistro: '2024-01-10'
    },
    {
      id: 'PAC002',
      dni: '32156789',
      nombres: 'Carlos Alberto',
      apellidos: 'Mendoza Paredes',
      fechaNacimiento: '1972-07-22',
      genero: 'M',
      telefono: '956789012',
      email: 'carlos.mendoza@email.com',
      direccion: 'Jr. Cusco 567, Miraflores',
      tipoSangre: 'A+',
      alergias: 'Ninguna conocida',
      antecedentes: 'Diabetes tipo 2',
      fechaRegistro: '2024-02-05'
    },
    {
      id: 'PAC003',
      dni: '76543210',
      nombres: 'Lucía Fernanda',
      apellidos: 'Vargas Huanca',
      fechaNacimiento: '1995-11-08',
      genero: 'F',
      telefono: '912345678',
      email: 'lucia.vargas@email.com',
      direccion: 'Calle Los Pinos 890, San Isidro',
      tipoSangre: 'B-',
      alergias: 'Ibuprofeno',
      antecedentes: 'Asma leve',
      fechaRegistro: '2024-03-20'
    }
  ];

  Storage.set(KEYS.PACIENTES, demoPacientes);

  const demoCitas = [
    {
      id: 'CIT001',
      pacienteId: 'PAC001',
      pacienteNombre: 'María Elena Torres Quispe',
      pacienteDni: '45678901',
      medico: 'Dr. Roberto Sánchez',
      especialidad: 'Medicina General',
      fecha: today(),
      hora: '09:00',
      motivo: 'Control de presión arterial y chequeo general',
      estado: 'confirmada',
      fechaRegistro: '2024-06-01'
    },
    {
      id: 'CIT002',
      pacienteId: 'PAC002',
      pacienteNombre: 'Carlos Alberto Mendoza Paredes',
      pacienteDni: '32156789',
      medico: 'Dra. Carmen López',
      especialidad: 'Endocrinología',
      fecha: today(),
      hora: '10:30',
      motivo: 'Revisión de niveles de glucosa',
      estado: 'confirmada',
      fechaRegistro: '2024-06-01'
    },
    {
      id: 'CIT003',
      pacienteId: 'PAC003',
      pacienteNombre: 'Lucía Fernanda Vargas Huanca',
      pacienteDni: '76543210',
      medico: 'Dr. Jorge Pinto',
      especialidad: 'Neumología',
      fecha: today(),
      hora: '11:00',
      motivo: 'Episodios de dificultad respiratoria',
      estado: 'atendida',
      fechaRegistro: '2024-06-01'
    }
  ];

  Storage.set(KEYS.CITAS, demoCitas);
}

// Run on load
document.addEventListener('DOMContentLoaded', function() {
  setActiveNav();
  seedDemoData();
});

// =====================
// SPECIALTIES LIST
// =====================
const ESPECIALIDADES = [
  'Medicina General',
  'Cardiología',
  'Dermatología',
  'Endocrinología',
  'Gastroenterología',
  'Ginecología',
  'Neumología',
  'Neurología',
  'Oftalmología',
  'Ortopedia y Traumatología',
  'Otorrinolaringología',
  'Pediatría',
  'Psiquiatría',
  'Reumatología',
  'Urología'
];

const MEDICOS = [
  { nombre: 'Dr. Roberto Sánchez', especialidad: 'Medicina General' },
  { nombre: 'Dra. Carmen López', especialidad: 'Endocrinología' },
  { nombre: 'Dr. Jorge Pinto', especialidad: 'Neumología' },
  { nombre: 'Dra. Ana Flores', especialidad: 'Cardiología' },
  { nombre: 'Dr. Luis Herrera', especialidad: 'Neurología' },
  { nombre: 'Dra. Patricia Morales', especialidad: 'Pediatría' },
  { nombre: 'Dr. Miguel Castillo', especialidad: 'Ortopedia y Traumatología' },
  { nombre: 'Dra. Sandra Ruiz', especialidad: 'Ginecología' }
];

// =====================
// ESTADO LABELS
// =====================
function estadoBadge(estado) {
  const map = {
    'confirmada': '<span class="badge badge-blue">Confirmada</span>',
    'pendiente': '<span class="badge badge-amber">Pendiente</span>',
    'atendida': '<span class="badge badge-green">Atendida</span>',
    'cancelada': '<span class="badge badge-red">Cancelada</span>',
    'no_asistio': '<span class="badge badge-gray">No asistió</span>'
  };
  return map[estado] || `<span class="badge badge-gray">${estado}</span>`;
}

function generoBadge(gen) {
  return gen === 'M' ? '👨 Masculino' : gen === 'F' ? '👩 Femenino' : gen;
}
