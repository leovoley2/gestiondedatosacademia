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

// GET - Obtener todos los estudiantes
export async function GET() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [estudiantes] = await connection.execute(
      'SELECT * FROM estudiantes ORDER BY nombre ASC'
    );
    
    return NextResponse.json(estudiantes);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// POST - Crear un nuevo estudiante
export async function POST(request) {
  let connection;
  try {
    const data = await request.json();
    
    // Crear la fecha de proximo pago basada en clases
    const fechaInscripcion = data.fechaInscripcion || new Date().toISOString().split('T')[0];
    const ultimoPago = data.ultimoPago || fechaInscripcion;
    const clasesPorPeriodo = data.clasesPorPeriodo || 8;
    const frecuenciaClases = data.frecuenciaClases || 2;
    
    // Calcular próximo pago: fechaActual + (clases/frecuencia) * 7 días
    const semanas = clasesPorPeriodo / frecuenciaClases;
    const dias = Math.ceil(semanas * 7);
    
    const fechaUltimoPago = new Date(ultimoPago);
    const proximoPago = new Date(fechaUltimoPago);
    proximoPago.setDate(proximoPago.getDate() + dias);
    
    const proximoPagoStr = proximoPago.toISOString().split('T')[0];
    
    connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(
      `INSERT INTO estudiantes 
      (nombre, email, telefono, curso, fecha_inscripcion, ultimo_pago, proximo_pago, 
       clases_por_periodo, frecuencia_clases, clases_restantes, estado_pago)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.nombre,
        data.email,
        data.telefono,
        data.curso,
        fechaInscripcion,
        ultimoPago,
        proximoPagoStr,
        clasesPorPeriodo,
        frecuenciaClases,
        clasesPorPeriodo,
        'Al día'
      ]
    );
    
    const [nuevoEstudiante] = await connection.execute(
      'SELECT * FROM estudiantes WHERE id = ?',
      [result.insertId]
    );
    
    return NextResponse.json(nuevoEstudiante[0], { status: 201 });
  } catch (error) {
    console.error('Error al crear estudiante:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}