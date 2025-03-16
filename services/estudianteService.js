// services/estudianteService.js

// Datos iniciales para pruebas
const datosIniciales = [
  { 
    id: 1, 
    nombre: 'María García', 
    email: 'maria@ejemplo.com', 
    telefono: '555-123-4567', 
    curso: 'Inglés Avanzado', 
    fechaInscripcion: '2025-01-15', 
    ultimoPago: '2025-01-15', 
    proximoPago: '2025-02-15', 
    clasesPorPeriodo: 8,
    frecuenciaClases: 2,
    clasesRestantes: 6,
    estadoPago: 'Al día' 
  },
  { 
    id: 2, 
    nombre: 'Carlos López', 
    email: 'carlos@ejemplo.com', 
    telefono: '555-987-6543', 
    curso: 'Francés Básico', 
    fechaInscripcion: '2025-01-05', 
    ultimoPago: '2025-01-05', 
    proximoPago: '2025-02-05', 
    clasesPorPeriodo: 12,
    frecuenciaClases: 3,
    clasesRestantes: 8,
    estadoPago: 'Al día' 
  },
  { 
    id: 3, 
    nombre: 'Ana Martínez', 
    email: 'ana@ejemplo.com', 
    telefono: '555-456-7890', 
    curso: 'Matemáticas', 
    fechaInscripcion: '2024-12-10', 
    ultimoPago: '2024-12-10', 
    proximoPago: '2025-01-10', 
    clasesPorPeriodo: 4,
    frecuenciaClases: 1,
    clasesRestantes: 0,
    estadoPago: 'Atrasado' 
  }
];

// Función para obtener todos los estudiantes
export const getEstudiantes = () => {
  return Promise.resolve([...datosIniciales]);
};

// Función para crear un nuevo estudiante
export const crearEstudiante = (estudiante) => {
  const id = datosIniciales.length ? Math.max(...datosIniciales.map(e => e.id)) + 1 : 1;
  const nuevoEstudiante = { id, ...estudiante };
  datosIniciales.push(nuevoEstudiante);
  return Promise.resolve(nuevoEstudiante);
};

// Función para eliminar un estudiante
export const eliminarEstudiante = (id) => {
  const index = datosIniciales.findIndex(est => est.id === id);
  if (index !== -1) {
    datosIniciales.splice(index, 1);
  }
  return Promise.resolve({ success: true });
};