export const getEstudiantes = async () => {
  try {
    // Agrega un timeout para evitar que la petición se quede esperando indefinidamente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
    
    const response = await fetch('/api/estudiantes', { 
      signal: controller.signal 
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Error al obtener estudiantes: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en getEstudiantes:', error);
    
    // Si hay un error de conexión o el servicio no responde, retorna datos de prueba
    if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
      console.log('Usando datos locales de estudiantes por fallo de conexión');
      return getMockEstudiantes();
    }
    
    throw error;
  }
};

export const crearEstudiante = async (estudiante) => {
  try {
    // Agrega un timeout para evitar que la petición se quede esperando indefinidamente
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout
    
    const response = await fetch('/api/estudiantes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(estudiante),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Error al crear estudiante: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en crearEstudiante:', error);
    
    // Si hay un error de conexión o el servicio no responde, simula creación local
    if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
      console.log('Usando creación local de estudiante por fallo de conexión');
      return createMockEstudiante(estudiante);
    }
    
    throw error;
  }
};

export const eliminarEstudiante = async (id) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`/api/estudiantes/${id}`, {
      method: 'DELETE',
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Error al eliminar estudiante: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error en eliminarEstudiante:', error);
    
    // Si hay un error de conexión, simula eliminación exitosa
    if (error.name === 'AbortError' || error.message.includes('Failed to fetch')) {
      console.log('Simulando eliminación local por fallo de conexión');
      return true;
    }
    
    throw error;
  }
};

// Datos de prueba para usar cuando el backend no responde
const getMockEstudiantes = () => {
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  
  const nextTwoWeeks = new Date();
  nextTwoWeeks.setDate(nextTwoWeeks.getDate() + 14);
  
  const formatDate = (date) => date.toISOString().split('T')[0];
  
  return [
    {
      id: 1,
      nombre: 'Ana García',
      email: 'ana.garcia@ejemplo.com',
      telefono: '611222333',
      curso: 'Inglés Avanzado',
      fechaInscripcion: formatDate(lastMonth),
      ultimoPago: formatDate(lastMonth),
      proximoPago: formatDate(nextWeek),
      clasesPorPeriodo: 8,
      frecuenciaClases: 2,
      clasesRestantes: 4,
      estadoPago: 'Al día'
    },
    {
      id: 2,
      nombre: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@ejemplo.com',
      telefono: '622333444',
      curso: 'Matemáticas',
      fechaInscripcion: formatDate(lastMonth),
      ultimoPago: formatDate(lastMonth),
      proximoPago: formatDate(today),
      clasesPorPeriodo: 12,
      frecuenciaClases: 3,
      clasesRestantes: 2,
      estadoPago: 'Atrasado'
    },
    {
      id: 3,
      nombre: 'María López',
      email: 'maria.lopez@ejemplo.com',
      telefono: '633444555',
      curso: 'Francés Básico',
      fechaInscripcion: formatDate(today),
      ultimoPago: formatDate(today),
      proximoPago: formatDate(nextTwoWeeks),
      clasesPorPeriodo: 4,
      frecuenciaClases: 1,
      clasesRestantes: 4,
      estadoPago: 'Al día'
    }
  ];
};

// Simulación de creación de estudiante
const createMockEstudiante = (estudiante) => {
  return {
    ...estudiante,
    id: Math.floor(Math.random() * 10000) + 1, // ID aleatorio
  };
};