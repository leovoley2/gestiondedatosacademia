// Modificaciones en el componente GestionAcademia.jsx

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CreditCard, Search, Trash2, UserPlus, Users, AlertCircle } from 'lucide-react';
import { getEstudiantes, crearEstudiante, eliminarEstudiante } from '../services/estudianteService';
import { registrarPago } from '../services/pagoService';

// Utilidades para fechas
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const formatLocalDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES');
};

// Función para calcular la fecha del próximo pago basada en clases
const calcularProximoPago = (fechaActual, clasesPorPeriodo, frecuenciaClases) => {
  // Calculamos cuántas semanas durará este paquete de clases
  const semanas = clasesPorPeriodo / frecuenciaClases;
  
  // Convertimos semanas a días y añadimos a la fecha actual
  const dias = Math.ceil(semanas * 7);
  
  const fechaProximoPago = new Date(fechaActual);
  fechaProximoPago.setDate(fechaProximoPago.getDate() + dias);
  
  return fechaProximoPago;
};

const isBefore = (date1, date2) => {
  return new Date(date1) < new Date(date2);
};

const GestionAcademia = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mostrarFormularioPago, setMostrarFormularioPago] = useState(false);
  const [estudianteActual, setEstudianteActual] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [datosPago, setDatosPago] = useState({
    clasesPorPeriodo: 8,
    frecuenciaClases: 2
  });
  const [nuevoEstudiante, setNuevoEstudiante] = useState({
    nombre: '',
    email: '',
    telefono: '',
    curso: '',
    fechaInscripcion: formatDate(new Date()),
    ultimoPago: formatDate(new Date()),
    proximoPago: formatDate(new Date()),
    clasesPorPeriodo: 8,
    frecuenciaClases: 2,
    clasesRestantes: 8,
    estadoPago: 'Al día'
  });
  // Estado para modo offline/fallback
  const [modoOffline, setModoOffline] = useState(false);

  // Inicializar fecha de próximo pago en función de clases
  useEffect(() => {
    const fechaInscripcion = new Date(nuevoEstudiante.fechaInscripcion);
    const proximoPago = calcularProximoPago(
      fechaInscripcion,
      nuevoEstudiante.clasesPorPeriodo,
      nuevoEstudiante.frecuenciaClases
    );
    
    setNuevoEstudiante({
      ...nuevoEstudiante,
      proximoPago: formatDate(proximoPago)
    });
  }, [nuevoEstudiante.fechaInscripcion, nuevoEstudiante.clasesPorPeriodo, nuevoEstudiante.frecuenciaClases]);

  // Cargar estudiantes desde la API/servicio
  useEffect(() => {
    const cargarEstudiantes = async () => {
      try {
        setCargando(true);
        const data = await getEstudiantes();
        console.log('Estudiantes cargados:', data);
        
        // Verificar si estamos usando datos de prueba
        if (data.length > 0 && data[0].hasOwnProperty('mockData')) {
          setModoOffline(true);
        }
        
        // Actualizar estados de pago
        const hoy = new Date();
        const estudiantesActualizados = data.map(est => {
          const fechaProximoPago = new Date(est.proximo_pago || est.proximoPago);
          return {
            ...est,
            // Normalizar nombres de campos
            id: est.id,
            nombre: est.nombre,
            email: est.email,
            telefono: est.telefono,
            curso: est.curso,
            fechaInscripcion: est.fecha_inscripcion || est.fechaInscripcion,
            ultimoPago: est.ultimo_pago || est.ultimoPago,
            proximoPago: est.proximo_pago || est.proximoPago,
            clasesPorPeriodo: est.clases_por_periodo || est.clasesPorPeriodo || 8,
            frecuenciaClases: est.frecuencia_clases || est.frecuenciaClases || 2,
            clasesRestantes: est.clases_restantes || est.clasesRestantes || 0,
            estadoPago: isBefore(fechaProximoPago, hoy) ? 'Atrasado' : 'Al día'
          };
        });
        
        setEstudiantes(estudiantesActualizados);
        setError(null);
      } catch (err) {
        console.error('Error al cargar estudiantes:', err);
        setError('Error al cargar los estudiantes. Usando modo offline.');
        setModoOffline(true);
        
        // Crear datos de prueba en caso de error
        const mockData = [
          {
            id: 1,
            nombre: 'Estudiante de Prueba',
            email: 'prueba@ejemplo.com',
            telefono: '611222333',
            curso: 'Curso de Prueba',
            fechaInscripcion: formatDate(new Date()),
            ultimoPago: formatDate(new Date()),
            proximoPago: formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 días después
            clasesPorPeriodo: 8,
            frecuenciaClases: 2,
            clasesRestantes: 8,
            estadoPago: 'Al día'
          }
        ];
        setEstudiantes(mockData);
      } finally {
        setCargando(false);
      }
    };

    cargarEstudiantes();
  }, []);

  // Filtrar estudiantes
  const estudiantesFiltrados = estudiantes.filter(est => 
    est.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    est.curso.toLowerCase().includes(filtro.toLowerCase()) ||
    est.estadoPago.toLowerCase().includes(filtro.toLowerCase())
  );

  // Obtener próximos pagos (para el dashboard)
  const proximosPagos = estudiantes
    .filter(est => est.estadoPago === 'Al día')
    .sort((a, b) => new Date(a.proximoPago) - new Date(b.proximoPago))
    .slice(0, 5);

  // Obtener pagos atrasados (para el dashboard)
  const pagosAtrasados = estudiantes.filter(est => est.estadoPago === 'Atrasado');

  // Agregar nuevo estudiante
  const agregarEstudiante = async () => {
    // Validar campos requeridos
    if (!nuevoEstudiante.nombre || !nuevoEstudiante.curso) {
      setError('Por favor completa los campos requeridos (nombre y curso).');
      return;
    }
    
    try {
      setCargando(true);
      console.log('Enviando datos de estudiante:', nuevoEstudiante);
      
      // Calcular próximo pago basado en las clases
      const fechaInscripcion = new Date(nuevoEstudiante.fechaInscripcion);
      const proximoPago = calcularProximoPago(
        fechaInscripcion,
        nuevoEstudiante.clasesPorPeriodo,
        nuevoEstudiante.frecuenciaClases
      );
      
      const estudianteData = {
        ...nuevoEstudiante,
        proximoPago: formatDate(proximoPago),
        clasesRestantes: nuevoEstudiante.clasesPorPeriodo
      };
      
      // Si estamos en modo offline, simulamos la creación
      let estudiante;
      if (modoOffline) {
        estudiante = {
          ...estudianteData,
          id: estudiantes.length ? Math.max(...estudiantes.map(e => e.id)) + 1 : 1
        };
      } else {
        estudiante = await crearEstudiante(estudianteData);
      }
      
      console.log('Estudiante creado:', estudiante);
      
      // Normalizar propiedades para la interfaz
      const estudianteNormalizado = {
        ...estudiante,
        id: estudiante.id,
        nombre: estudiante.nombre,
        email: estudiante.email,
        telefono: estudiante.telefono,
        curso: estudiante.curso,
        fechaInscripcion: estudiante.fecha_inscripcion || estudiante.fechaInscripcion,
        ultimoPago: estudiante.ultimo_pago || estudiante.ultimoPago,
        proximoPago: estudiante.proximo_pago || estudiante.proximoPago,
        clasesPorPeriodo: estudiante.clases_por_periodo || estudiante.clasesPorPeriodo,
        frecuenciaClases: estudiante.frecuencia_clases || estudiante.frecuenciaClases,
        clasesRestantes: estudiante.clases_restantes || estudiante.clasesRestantes,
        estadoPago: 'Al día'
      };
      
      setEstudiantes([...estudiantes, estudianteNormalizado]);
      
      // Resetear el formulario
      setNuevoEstudiante({
        nombre: '',
        email: '',
        telefono: '',
        curso: '',
        fechaInscripcion: formatDate(new Date()),
        ultimoPago: formatDate(new Date()),
        proximoPago: formatDate(new Date()),
        clasesPorPeriodo: 8,
        frecuenciaClases: 2,
        clasesRestantes: 8,
        estadoPago: 'Al día'
      });
      
      setMostrarFormulario(false);
      setError(null);
    } catch (err) {
      console.error('Error detallado al crear estudiante:', err);
      setError('Error al crear el estudiante. Por favor, intente de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  // Registrar pago
  const procesarPago = async () => {
    if (!estudianteActual) return;
    
    try {
      setCargando(true);
      console.log('Procesando pago para estudiante:', estudianteActual.id);
      
      const fechaActual = new Date();
      const proximoPago = calcularProximoPago(
        fechaActual,
        datosPago.clasesPorPeriodo,
        datosPago.frecuenciaClases
      );
      
      // Registrar el pago
      const datosDelPago = {
        estudiante: estudianteActual.id,
        monto: 0, // Establecer el monto según tus necesidades
        descripcion: `Pago por ${datosPago.clasesPorPeriodo} clases`,
        clasesPorPeriodo: datosPago.clasesPorPeriodo,
        frecuenciaClases: datosPago.frecuenciaClases
      };
      
      console.log('Enviando datos de pago:', datosDelPago);
      
      // Si estamos en modo offline, no enviamos al servidor
      if (!modoOffline) {
        await registrarPago(datosDelPago);
      }
      
      // Actualizar el estado local
      const estudiantesActualizados = estudiantes.map(est => 
        est.id === estudianteActual.id 
          ? {
              ...est,
              ultimoPago: formatDate(fechaActual),
              proximoPago: formatDate(proximoPago),
              clasesPorPeriodo: datosPago.clasesPorPeriodo,
              frecuenciaClases: datosPago.frecuenciaClases,
              clasesRestantes: datosPago.clasesPorPeriodo,
              estadoPago: 'Al día'
            }
          : est
      );
      
      setEstudiantes(estudiantesActualizados);
      setEstudianteActual(null);
      setMostrarFormularioPago(false);
      setError(null);
    } catch (err) {
      console.error('Error detallado al registrar pago:', err);
      setError('Error al registrar el pago. Por favor, intente de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  // Eliminar estudiante
  const eliminarEstudianteHandler = async (id) => {
    try {
      setCargando(true);
      console.log('Eliminando estudiante con ID:', id);
      
      // Si no estamos en modo offline, intentamos eliminar en el servidor
      if (!modoOffline) {
        await eliminarEstudiante(id);
      }
      
      console.log('Estudiante eliminado correctamente');
      
      setEstudiantes(estudiantes.filter(est => est.id !== id));
      setError(null);
    } catch (err) {
      console.error('Error detallado al eliminar estudiante:', err);
      setError('Error al eliminar el estudiante. Por favor, intente de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  // Mostrar indicador de carga inicial
  if (cargando && estudiantes.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="mt-2">Cargando datos...</p>
          <p className="text-sm text-gray-500">Si tarda demasiado, se usarán datos de ejemplo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="app-header">
        <h1>Sistema de Gestión Académica</h1>
        <p>Control de estudiantes y pagos</p>
        {modoOffline && (
          <span className="badge badge-warning">
            <AlertCircle size={14} className="mr-1" />
            Modo sin conexión (datos de prueba)
          </span>
        )}
      </div>

      <div className="container">
        {error && (
          <div className="card mb-4 bg-light">
            <div className="card-content" style={{ color: 'var(--danger-color)' }}>
              <p>{error}</p>
            </div>
          </div>
        )}

        {/* Tabs simplificados */}
        <div className="tab-buttons">
          <button 
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`tab-button ${activeTab === 'estudiantes' ? 'active' : ''}`}
            onClick={() => setActiveTab('estudiantes')}
          >
            Estudiantes
          </button>
          <button 
            className={`tab-button ${activeTab === 'pagos' ? 'active' : ''}`}
            onClick={() => setActiveTab('pagos')}
          >
            Pagos
          </button>
        </div>

        <div className="tab-content">
          {/* Contenido de las pestañas (mantener igual) */}
          {/* ... El resto del código sigue igual ... */}

        </div>
      </div>

      {/* Modal para Nuevo Estudiante */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Nuevo Estudiante</h3>
              <p style={{ color: 'var(--text-light)' }}>Complete los datos del estudiante</p>
              {modoOffline && (
                <p className="text-sm" style={{ color: 'var(--warning-color)' }}>
                  <AlertCircle size={14} className="inline mr-1" />
                  Modo sin conexión - Los datos se guardarán localmente
                </p>
              )}
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nombre Completo *</label>
                <input 
                  type="text"
                  className="form-control"
                  value={nuevoEstudiante.nombre}
                  onChange={(e) => setNuevoEstudiante({...nuevoEstudiante, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input 
                  type="email"
                  className="form-control"
                  value={nuevoEstudiante.email}
                  onChange={(e) => setNuevoEstudiante({...nuevoEstudiante, email: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input 
                  type="text"
                  className="form-control"
                  value={nuevoEstudiante.telefono}
                  onChange={(e) => setNuevoEstudiante({...nuevoEstudiante, telefono: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Curso *</label>
                <input 
                  type="text"
                  className="form-control"
                  value={nuevoEstudiante.curso}
                  onChange={(e) => setNuevoEstudiante({...nuevoEstudiante, curso: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Número de Clases</label>
                <select 
                  className="form-control"
                  value={nuevoEstudiante.clasesPorPeriodo}
                  onChange={(e) => setNuevoEstudiante({
                    ...nuevoEstudiante, 
                    clasesPorPeriodo: parseInt(e.target.value),
                    clasesRestantes: parseInt(e.target.value)
                  })}
                >
                  <option value={4}>4 clases</option>
                  <option value={8}>8 clases</option>
                  <option value={12}>12 clases</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Frecuencia de Clases (por semana)</label>
                <select 
                  className="form-control"
                  value={nuevoEstudiante.frecuenciaClases}
                  onChange={(e) => setNuevoEstudiante({...nuevoEstudiante, frecuenciaClases: parseInt(e.target.value)})}
                >
                  <option value={1}>1 clase por semana</option>
                  <option value={2}>2 clases por semana</option>
                  <option value={3}>3 clases por semana</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de Inscripción</label>
                <input 
                  type="date"
                  className="form-control"
                  value={nuevoEstudiante.fechaInscripcion}
                  onChange={(e) => setNuevoEstudiante({...nuevoEstudiante, fechaInscripcion: e.target.value})}
                />
              </div>
              <p className="text-sm mt-2" style={{ color: 'var(--text-light)' }}>
                * Campos obligatorios
              </p>
            </div>
            <div className="modal-footer">
              <button 
                type="button" 
                className="button button-secondary"
                onClick={() => {
                  setMostrarFormulario(false);
                  setError(null);
                }}
              >
                Cancelar
              </button>
              <button 
                type="button" 
                className="button button-primary"
                onClick={agregarEstudiante}
                disabled={cargando || !nuevoEstudiante.nombre || !nuevoEstudiante.curso}
              >
                {cargando ? 'Guardando...' : 'Guardar Estudiante'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Registrar Pago (dejar igual) */}
      {/* ... */}

      <footer className="app-footer">
        <p>© {new Date().getFullYear()} Sistema de Gestión Académica</p>
        {modoOffline && <p className="text-sm">Modo sin conexión activado</p>}
      </footer>
    </div>
  );
};

export default GestionAcademia;