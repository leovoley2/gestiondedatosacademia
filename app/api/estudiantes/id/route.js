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

// GET - Obtener un estudiante específico
export async function GET(request, { params }) {
  let connection;
  try {
    const { id } = params;
    
    connection = await mysql.createConnection(dbConfig);
    
    const [estudiantes] = await connection.execute(
      'SELECT * FROM estudiantes WHERE id = ?',
      [id]
    );
    
    if (estudiantes.length === 0) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }
    
    return NextResponse.json(estudiantes[0]);
  } catch (error) {
    console.error('Error al obtener estudiante:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// PUT - Actualizar un estudiante
export async function PUT(request, { params }) {
  let connection;
  try {
    const { id } = params;
    const data = await request.json();
    
    connection = await mysql.createConnection(dbConfig);
    
    // Verificar si el estudiante existe
    const [estudiantes] = await connection.execute(
      'SELECT * FROM estudiantes WHERE id = ?',
      [id]
    );
    
    if (estudiantes.length === 0) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }
    
    const estudiante = estudiantes[0];
    
    // Actualizar el estudiante
    await connection.execute(
      `UPDATE estudiantes 
      SET nombre = ?, email = ?, telefono = ?, curso = ?, 
          fecha_inscripcion = ?, ultimo_pago = ?, proximo_pago = ?,
          clases_por_periodo = ?, frecuencia_clases = ?, 
          clases_restantes = ?, estado_pago = ?
      WHERE id = ?`,
      [
        data.nombre || estudiante.nombre,
        data.email || estudiante.email,
        data.telefono || estudiante.telefono,
        data.curso || estudiante.curso,
        data.fechaInscripcion || estudiante.fecha_inscripcion,
        data.ultimoPago || estudiante.ultimo_pago,
        data.proximoPago || estudiante.proximo_pago,
        data.clasesPorPeriodo || estudiante.clases_por_periodo,
        data.frecuenciaClases || estudiante.frecuencia_clases,
        data.clasesRestantes || estudiante.clases_restantes,
        data.estadoPago || estudiante.estado_pago,
        id
      ]
    );
    
    // Obtener el estudiante actualizado
    const [estudianteActualizado] = await connection.execute(
      'SELECT * FROM estudiantes WHERE id = ?',
      [id]
    );
    
    return NextResponse.json(estudianteActualizado[0]);
  } catch (error) {
    console.error('Error al actualizar estudiante:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// DELETE - Eliminar un estudiante
export async function DELETE(request, { params }) {
  let connection;
  try {
    const { id } = params;
    
    connection = await mysql.createConnection(dbConfig);
    
    // Verificar si el estudiante existe
    const [estudiantes] = await connection.execute(
      'SELECT * FROM estudiantes WHERE id = ?',
      [id]
    );
    
    if (estudiantes.length === 0) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }
    
    // Eliminar el estudiante
    await connection.execute(
      'DELETE FROM estudiantes WHERE id = ?',
      [id]
    );
    
    return NextResponse.json({ message: 'Estudiante eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar estudiante:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}