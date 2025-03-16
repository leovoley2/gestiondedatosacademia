import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CreditCard, Search, Trash2, UserPlus, Users } from 'lucide-react';
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
        
        // Actualizar estados de pago
        const hoy = new Date();
        const estudiantesActualizados = data.map(est => {
          const fechaProximoPago = new Date(est.proximoPago);
          return {
            ...est,
            estadoPago: isBefore(fechaProximoPago, hoy) ? 'Atrasado' : 'Al día'
          };
        });
        
        setEstudiantes(estudiantesActualizados);
        setError(null);
      } catch (err) {
        setError('Error al cargar los estudiantes. Por favor, intente de nuevo.');
        console.error(err);
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
    try {
      setCargando(true);
      
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
      
      const estudiante = await crearEstudiante(estudianteData);
      
      setEstudiantes([...estudiantes, {
        ...estudiante,
        estadoPago: 'Al día'
      }]);
      
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
      setError('Error al crear el estudiante. Por favor, intente de nuevo.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  // Registrar pago
  const procesarPago = async () => {
    if (!estudianteActual) return;
    
    try {
      setCargando(true);
      
      const fechaActual = new Date();
      const proximoPago = calcularProximoPago(
        fechaActual,
        datosPago.clasesPorPeriodo,
        datosPago.frecuenciaClases
      );
      
      // Registrar el pago
      await registrarPago({
        estudiante: estudianteActual.id,
        monto: 0, // Establecer el monto según tus necesidades
        descripcion: `Pago por ${datosPago.clasesPorPeriodo} clases`,
        clasesPorPeriodo: datosPago.clasesPorPeriodo,
        frecuenciaClases: datosPago.frecuenciaClases
      });
      
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
      setError('Error al registrar el pago. Por favor, intente de nuevo.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  // Eliminar estudiante
  const eliminarEstudianteHandler = async (id) => {
    try {
      setCargando(true);
      await eliminarEstudiante(id);
      setEstudiantes(estudiantes.filter(est => est.id !== id));
      setError(null);
    } catch (err) {
      setError('Error al eliminar el estudiante. Por favor, intente de nuevo.');
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  if (cargando && estudiantes.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="app-header">
        <h1>Sistema de Gestión Académica</h1>
        <p>Control de estudiantes y pagos</p>
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
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3">
                <div className="card">
                  <div className="card-header">
                    <h3><Users size={18} /> Total Estudiantes</h3>
                  </div>
                  <div className="card-content">
                    <div className="stat-number" style={{ color: 'var(--primary-color)' }}>{estudiantes.length}</div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3><CreditCard size={18} /> Pagos al Día</h3>
                  </div>
                  <div className="card-content">
                    <div className="stat-number" style={{ color: 'var(--success-color)' }}>
                      {estudiantes.filter(e => e.estadoPago === 'Al día').length}
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3><Clock size={18} /> Pagos Atrasados</h3>
                  </div>
                  <div className="card-content">
                    <div className="stat-number" style={{ color: 'var(--danger-color)' }}>
                      {pagosAtrasados.length}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md-grid-cols-2">
                <div className="card">
                  <div className="card-header">
                    <h3><Calendar size={18} /> Próximos Pagos</h3>
                  </div>
                  <div className="card-content">
                    {proximosPagos.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {proximosPagos.map(est => (
                          <div key={`proximo-${est.id}`} className="flex justify-between items-center p-3 bg-light rounded">
                            <div>
                              <p className="font-medium">{est.nombre}</p>
                              <p className="text-sm" style={{ color: 'var(--text-light)' }}>{est.curso}</p>
                              <p className="text-sm" style={{ color: 'var(--primary-color)' }}>
                                Clases restantes: {est.clasesRestantes || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium" style={{ color: 'var(--primary-color)' }}>
                                {formatLocalDate(est.proximoPago)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center p-4" style={{ color: 'var(--text-light)' }}>No hay próximos pagos pendientes</p>
                    )}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3><Clock size={18} /> Pagos Atrasados</h3>
                  </div>
                  <div className="card-content">
                    {pagosAtrasados.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {pagosAtrasados.map(est => (
                          <div key={`atrasado-${est.id}`} className="flex flex-col sm-flex-row sm-justify-between p-3 bg-light rounded gap-2">
                            <div>
                              <p className="font-medium">{est.nombre}</p>
                              <p className="text-sm" style={{ color: 'var(--text-light)' }}>{est.curso}</p>
                              <p className="text-sm" style={{ color: 'var(--danger-color)' }}>
                                Desde: {formatLocalDate(est.proximoPago)}
                              </p>
                            </div>
                            <div>
                              <button
                                className="button button-primary w-full"
                                onClick={() => {
                                  setEstudianteActual(est);
                                  setDatosPago({
                                    clasesPorPeriodo: est.clasesPorPeriodo || 8,
                                    frecuenciaClases: est.frecuenciaClases || 2
                                  });
                                  setMostrarFormularioPago(true);
                                }}
                              >
                                Registrar Pago
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center p-4" style={{ color: 'var(--text-light)' }}>No hay pagos atrasados</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Estudiantes */}
          {activeTab === 'estudiantes' && (
            <div>
              <div className="flex flex-col sm-flex-row gap-2 justify-between mb-4">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={16} style={{ color: 'var(--text-light)' }} />
                  <input
                    type="text"
                    className="form-control pl-10"
                    placeholder="Buscar estudiantes..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setMostrarFormulario(true)}
                  className="button button-primary flex items-center"
                  disabled={cargando}
                >
                  <UserPlus size={16} className="mr-2" /> Nuevo Estudiante
                </button>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Curso</th>
                      <th>Clases</th>
                      <th>Último Pago</th>
                      <th>Próximo Pago</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cargando && estudiantes.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center p-8">
                          <div className="spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                        </td>
                      </tr>
                    ) : estudiantesFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center p-8" style={{ color: 'var(--text-light)' }}>
                          No se encontraron estudiantes con ese criterio de búsqueda
                        </td>
                      </tr>
                    ) : (
                      estudiantesFiltrados.map(est => (
                        <tr key={`estudiante-${est.id}`}>
                          <td>
                            <div>
                              <p className="font-medium">{est.nombre}</p>
                              <p className="text-sm" style={{ color: 'var(--text-light)' }}>{est.email}</p>
                            </div>
                          </td>
                          <td>{est.curso}</td>
                          <td>
                            <div>
                              <p>{est.clasesPorPeriodo || 'N/A'} clases</p>
                              <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                                {est.clasesRestantes || 'N/A'} restantes
                              </p>
                            </div>
                          </td>
                          <td>{formatLocalDate(est.ultimoPago)}</td>
                          <td>{formatLocalDate(est.proximoPago)}</td>
                          <td>
                            <span className={`badge ${est.estadoPago === 'Al día' ? 'badge-success' : 'badge-danger'}`}>
                              {est.estadoPago}
                            </span>
                          </td>
                          <td>
                            <div className="flex gap-2">
                              <button 
                                className="button button-primary button-icon"
                                onClick={() => {
                                  setEstudianteActual(est);
                                  setDatosPago({
                                    clasesPorPeriodo: est.clasesPorPeriodo || 8,
                                    frecuenciaClases: est.frecuenciaClases || 2
                                  });
                                  setMostrarFormularioPago(true);
                                }}
                                disabled={cargando}
                              >
                                <CreditCard size={16} />
                              </button>
                              <button 
                                className="button button-danger button-icon"
                                onClick={() => eliminarEstudianteHandler(est.id)}
                                disabled={cargando}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagos */}
          {activeTab === 'pagos' && (
            <div>
              <div className="mb-4">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={16} style={{ color: 'var(--text-light)' }} />
                  <input
                    type="text"
                    className="form-control pl-10"
                    placeholder="Buscar pagos..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                  />
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Historial de Pagos</h3>
                  <p>Registro de todos los pagos realizados</p>
                </div>
                <div className="card-content">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Estudiante</th>
                          <th>Curso</th>
                          <th>Clases</th>
                          <th>Último Pago</th>
                          <th>Próximo Pago</th>
                          <th>Estado</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cargando && estudiantes.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center p-8">
                              <div className="spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                            </td>
                          </tr>
                        ) : estudiantesFiltrados.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="text-center p-8" style={{ color: 'var(--text-light)' }}>
                              No se encontraron registros con ese criterio de búsqueda
                            </td>
                          </tr>
                        ) : (
                          estudiantesFiltrados.map(est => (
                            <tr key={`pago-${est.id}`}>
                              <td className="font-medium">{est.nombre}</td>
                              <td>{est.curso}</td>
                              <td>
                                <div>
                                  <p>{est.clasesPorPeriodo || 'N/A'} clases</p>
                                  <p className="text-sm" style={{ color: 'var(--text-light)' }}>
                                    {est.clasesRestantes || 'N/A'} restantes
                                  </p>
                                </div>
                              </td>
                              <td>{formatLocalDate(est.ultimoPago)}</td>
                              <td>{formatLocalDate(est.proximoPago)}</td>
                              <td>
                                <span className={`badge ${est.estadoPago === 'Al día' ? 'badge-success' : 'badge-danger'}`}>
                                  {est.estadoPago}
                                </span>
                              </td>
                              <td>
                                <button 
                                  className="button button-primary"
                                  onClick={() => {
                                    setEstudianteActual(est);
                                    setDatosPago({
                                      clasesPorPeriodo: est.clasesPorPeriodo || 8,
                                      frecuenciaClases: est.frecuenciaClases || 2
                                    });
                                    setMostrarFormularioPago(true);
                                  }}
                                  disabled={cargando}
                                >
                                  <CreditCard size={16} className="mr-1" /> Registrar Pago
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Nuevo Estudiante */}
      {mostrarFormulario && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Nuevo Estudiante</h3>
              <p style={{ color: 'var(--text-light)' }}>Complete los datos del estudiante</p>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input 
                  type="text"
                  className="form-control"
                  value={nuevoEstudiante.nombre}
                  onChange={(e) => setNuevoEstudiante({...nuevoEstudiante, nombre: e.target.value})}
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
                <label className="form-label">Curso</label>
                <input 
                  type="text"
                  className="form-control"
                  value={nuevoEstudiante.curso}
                  onChange={(e) => setNuevoEstudiante({...nuevoEstudiante, curso: e.target.value})}
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
                  onChange={(e) => setNuevoEstudiante({...nuevoEstudiante, fechaInscripcion: e.target.value})}/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Próximo Pago (calculado)</label>
                    <input 
                      type="date"
                      className="form-control bg-light"
                      value={nuevoEstudiante.proximoPago}
                      readOnly
                    />
                    <p className="text-sm mt-2" style={{ color: 'var(--text-light)' }}>
                      Calculado automáticamente según el número de clases y frecuencia
                    </p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="button button-secondary"
                    onClick={() => setMostrarFormulario(false)} 
                    disabled={cargando}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="button button-primary"
                    onClick={agregarEstudiante} 
                    disabled={cargando}
                  >
                    {cargando ? (
                      <>
                        <div className="spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Guardando...
                      </>
                    ) : (
                      'Guardar'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
    
          {/* Modal para Registrar Pago */}
          {mostrarFormularioPago && estudianteActual && (
            <div className="modal-overlay">
              <div className="modal">
                <div className="modal-header">
                  <h3>Registrar Pago</h3>
                  <p style={{ color: 'var(--text-light)' }}>Estudiante: {estudianteActual.nombre}</p>
                </div>
                <div className="modal-body">
                  <div className="p-3 mb-4 bg-light rounded">
                    <p className="mb-2"><strong>Curso:</strong> <span>{estudianteActual.curso}</span></p>
                    <p className="mb-2"><strong>Último pago:</strong> <span>{formatLocalDate(estudianteActual.ultimoPago)}</span></p>
                    <p className="mb-2"><strong>Clases contratadas:</strong> <span>{estudianteActual.clasesPorPeriodo || 'N/A'}</span></p>
                    <p className="mb-2"><strong>Clases restantes:</strong> <span>{estudianteActual.clasesRestantes || 'N/A'}</span></p>
                    <p><strong>Estado:</strong> 
                      <span className={`badge ml-2 ${estudianteActual.estadoPago === 'Al día' ? 'badge-success' : 'badge-danger'}`}>
                        {estudianteActual.estadoPago}
                      </span>
                    </p>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Número de Clases a Contratar</label>
                    <select 
                      className="form-control"
                      value={datosPago.clasesPorPeriodo}
                      onChange={(e) => setDatosPago({
                        ...datosPago, 
                        clasesPorPeriodo: parseInt(e.target.value)
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
                      value={datosPago.frecuenciaClases}
                      onChange={(e) => setDatosPago({
                        ...datosPago, 
                        frecuenciaClases: parseInt(e.target.value)
                      })}
                    >
                      <option value={1}>1 clase por semana</option>
                      <option value={2}>2 clases por semana</option>
                      <option value={3}>3 clases por semana</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Fecha de Pago</label>
                    <input 
                      type="date" 
                      className="form-control bg-light"
                      value={formatDate(new Date())} 
                      readOnly 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Próximo Pago (calculado)</label>
                    <input 
                      type="date" 
                      className="form-control bg-light"
                      value={formatDate(
                        calcularProximoPago(
                          new Date(),
                          datosPago.clasesPorPeriodo,
                          datosPago.frecuenciaClases
                        )
                      )} 
                      readOnly 
                    />
                    <p className="text-sm mt-2" style={{ color: 'var(--text-light)' }}>
                      Calculado automáticamente según el número de clases y frecuencia.
                      <br />
                      {Math.ceil(datosPago.clasesPorPeriodo / datosPago.frecuenciaClases)} semanas ({datosPago.clasesPorPeriodo} clases, {datosPago.frecuenciaClases} por semana)
                    </p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    className="button button-secondary"
                    onClick={() => {
                      setEstudianteActual(null);
                      setMostrarFormularioPago(false);
                    }}
                    disabled={cargando}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="button button-primary"
                    onClick={procesarPago} 
                    disabled={cargando}
                  >
                    {cargando ? (
                      <>
                        <div className="spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      'Confirmar Pago'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };
    
    export default GestionAcademia;