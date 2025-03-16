import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

// Configuración de la conexión a la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'academia_app',
  port: parseInt(process.env.DB_PORT || '3306')
};

// Función para calcular próximo pago
function calcularProximoPago(fechaActual, clasesPorPeriodo, frecuenciaClases) {
  // Semanas = clases / frecuencia
  const semanas = clasesPorPeriodo / frecuenciaClases;
  // Días = semanas * 7
  const dias = Math.ceil(semanas * 7);
  
  // Crear nueva fecha
  const proximoPago = new Date(fechaActual);
  proximoPago.setDate(proximoPago.getDate() + dias);
  
  return proximoPago.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

// GET - Obtener todos los pagos
export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [pagos] = await connection.execute(`
      SELECT p.*, e.nombre as estudiante_nombre, e.curso
      FROM pagos p
      JOIN estudiantes e ON p.estudiante_id = e.id
      ORDER BY p.fecha DESC
    `);
    
    return NextResponse.json(pagos);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST - Registrar un nuevo pago
export async function POST(request) {
  let connection;
  try {
    const data = await request.json();
    
    // Valores por defecto
    const estudianteId = data.estudiante;
    const monto = data.monto || 0;
    const descripcion = data.descripcion || 'Pago mensual';
    const clasesPorPeriodo = data.clasesPorPeriodo || 8;
    const frecuenciaClases = data.frecuenciaClases || 2;
    
    // Fecha actual y cálculo de próximo pago
    const fechaActual = new Date().toISOString().split('T')[0];
    const proximoPago = calcularProximoPago(fechaActual, clasesPorPeriodo, frecuenciaClases);
    
    connection = await mysql.createConnection(dbConfig);
    
    // Iniciar transacción
    await connection.beginTransaction();
    
    try {
      // Registrar el pago
      const [resultPago] = await connection.execute(
        `INSERT INTO pagos 
        (estudiante_id, fecha, monto, descripcion, clases_por_periodo, frecuencia_clases)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [estudianteId, fechaActual, monto, descripcion, clasesPorPeriodo, frecuenciaClases]
      );
      
      // Actualizar el estudiante
      await connection.execute(
        `UPDATE estudiantes
        SET ultimo_pago = ?,
            proximo_pago = ?,
            clases_por_periodo = ?,
            frecuencia_clases = ?,
            clases_restantes = ?,
            estado_pago = ?
        WHERE id = ?`,
        [fechaActual, proximoPago, clasesPorPeriodo, frecuenciaClases, clasesPorPeriodo, 'Al día', estudianteId]
      );
      
      // Confirmar transacción
      await connection.commit();
      
      // Obtener el pago registrado
      const [pagos] = await connection.execute(
        'SELECT * FROM pagos WHERE id = ?',
        [resultPago.insertId]
      );
      
      return NextResponse.json(pagos[0], { status: 201 });
    } catch (error) {
      // Revertir transacción en caso de error
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error al registrar pago:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}