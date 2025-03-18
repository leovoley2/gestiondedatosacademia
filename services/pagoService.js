// services/pagoService.js

// Función para registrar un pago
export const registrarPago = async (pago) => {
  const res = await fetch('/api/pagos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(pago)
  });
  
  if (!res.ok) {
    throw new Error('Error al registrar el pago');
  }
  
  return await res.json();
};