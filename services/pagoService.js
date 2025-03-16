// services/pagoService.js

// Función para registrar un pago
export const registrarPago = (pago) => {
  // En una aplicación real, aquí se registraría en la base de datos
  return Promise.resolve({
    id: Date.now(),
    estudiante: pago.estudiante,
    fecha: new Date(),
    monto: pago.monto || 0,
    descripcion: pago.descripcion || 'Pago mensual',
    clasesPorPeriodo: pago.clasesPorPeriodo,
    frecuenciaClases: pago.frecuenciaClases
  });
};