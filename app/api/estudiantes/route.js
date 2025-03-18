// POST - Crear un nuevo estudiante
export async function POST(request) {
  let connection;
  try {
    const data = await request.json();
    console.log('Datos recibidos para crear estudiante:', data);
    
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
    
    console.log('Conectando a la base de datos...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Conexión exitosa');
    
    console.log('Ejecutando consulta INSERT...');
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
    console.log('Resultado INSERT:', result);
    
    if (result.affectedRows === 0) {
      throw new Error('No se pudo insertar el estudiante');
    }
    
    const [nuevoEstudiante] = await connection.execute(
      'SELECT * FROM estudiantes WHERE id = ?',
      [result.insertId]
    );
    console.log('Estudiante creado:', nuevoEstudiante[0]);
    
    return NextResponse.json(nuevoEstudiante[0], { status: 201 });
  } catch (error) {
    console.error('Error detallado al crear estudiante:', error);
    return NextResponse.json({ 
      error: error.message,
      sqlState: error.sqlState,
      sqlCode: error.code,
      sqlMessage: error.sqlMessage 
    }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión a la base de datos cerrada');
    }
  }
}