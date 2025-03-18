// services/estudianteService.js

// Función para obtener todos los estudiantes
export const getEstudiantes = async () => {
  const res = await fetch('/api/estudiantes', {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Error al obtener estudiantes');
  }
  
  return await res.json();
};

// Función para crear un nuevo estudiante
export const crearEstudiante = async (estudiante) => {
  const res = await fetch('/api/estudiantes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(estudiante)
  });
  
  if (!res.ok) {
    throw new Error('Error al crear el estudiante');
  }
  
  return await res.json();
};

// Función para eliminar un estudiante
export const eliminarEstudiante = async (id) => {
  const res = await fetch(`/api/estudiantes/${id}`, {
    method: 'DELETE'
  });
  
  if (!res.ok) {
    throw new Error('Error al eliminar el estudiante');
  }
  
  return await res.json();
};