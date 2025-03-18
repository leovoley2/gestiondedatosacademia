// Primero, vamos a crear un archivo separado para los datos offline
// Crear un nuevo archivo: src/mocks/mockData.js

export const mockEstudiantes = [
    {
      id: 1,
      nombre: 'Ana García',
      email: 'ana.garcia@ejemplo.com',
      telefono: '611222333',
      curso: 'Inglés Avanzado',
      fechaInscripcion: '2023-12-01',
      ultimoPago: '2023-12-01',
      proximoPago: '2024-01-15',
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
      fechaInscripcion: '2023-12-15',
      ultimoPago: '2023-12-15',
      proximoPago: '2024-01-01',
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
      fechaInscripcion: '2024-01-05',
      ultimoPago: '2024-01-05',
      proximoPago: '2024-02-02',
      clasesPorPeriodo: 4,
      frecuenciaClases: 1,
      clasesRestantes: 4,
      estadoPago: 'Al día'
    }
  ];
  
  // Ahora, modifiquemos los servicios para usar estos datos en modo offline
  // Modificar el archivo services/estudianteService.js
  
  import { mockEstudiantes } from '../mocks/mockData';
  
  // Variable global para almacenar datos en modo offline
  let estudiantesOffline = [...mockEstudiantes];
  
  export const getEstudiantes = async () => {
    try {
      // Intentamos conectar con el backend
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
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
      console.log('Usando datos locales de estudiantes');
      
      // Devolvemos una copia de los datos offline para no modificar el original
      return [...estudiantesOffline];
    }
  };
  
  export const crearEstudiante = async (estudiante) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
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
      console.log('Creando estudiante en modo offline');
      
      // Crear nuevo estudiante con ID único en modo offline
      const nuevoId = estudiantesOffline.length > 0 
        ? Math.max(...estudiantesOffline.map(e => e.id)) + 1 
        : 1;
      
      const nuevoEstudiante = {
        ...estudiante,
        id: nuevoId
      };
      
      // Añadir a la colección offline
      estudiantesOffline.push(nuevoEstudiante);
      
      return nuevoEstudiante;
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
      console.log('Eliminando estudiante en modo offline');
      
      // Eliminar estudiante de la colección offline
      estudiantesOffline = estudiantesOffline.filter(est => est.id !== id);
      
      return true;
    }
  };
  
  // Similar para el servicio de pagos:
  // Modificar services/pagoService.js
  
  export const registrarPago = async (datosPago) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/pagos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosPago),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Error al registrar pago: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en registrarPago:', error);
      console.log('Registrando pago en modo offline');
      
      // En modo offline, simplemente devolvemos un objeto con los datos del pago
      // y un ID generado aleatoriamente
      return { 
        id: Math.floor(Math.random() * 10000) + 1,
        fecha: new Date().toISOString(),
        ...datosPago
      };
    }
  };