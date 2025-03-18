// DELETE - Eliminar un estudiante
export async function DELETE(request, { params }) {
  let connection;
  try {
    const { id } = params;
    console.log('Intentando eliminar estudiante con ID:', id);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('Conexión exitosa');
    
    // Verificar si el estudiante existe
    console.log('Verificando existencia del estudiante...');
    const [estudiantes] = await connection.execute(
      'SELECT * FROM estudiantes WHERE id = ?',
      [id]
    );
    
    if (estudiantes.length === 0) {
      console.log('Estudiante no encontrado');
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    }
    
    console.log('Estudiante encontrado, procediendo a eliminar...');
    
    // Eliminar el estudiante
    const [result] = await connection.execute(
      'DELETE FROM estudiantes WHERE id = ?',
      [id]
    );
    
    console.log('Resultado DELETE:', result);
    
    if (result.affectedRows === 0) {
      throw new Error('No se pudo eliminar el estudiante');
    }
    
    return NextResponse.json({ message: 'Estudiante eliminado correctamente' });
  } catch (error) {
    console.error('Error detallado al eliminar estudiante:', error);
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