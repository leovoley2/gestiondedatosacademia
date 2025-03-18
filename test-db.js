// test-db.js
const mysql = require('mysql2/promise');

async function testConnection() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Italia_15', // Tu contraseña
    database: 'academia_app'
  });
  
  try {
    console.log('Conectado a MySQL');
    
    // Probar consulta simple
    const [rows] = await connection.execute('SELECT 1 + 1 AS result');
    console.log('Consulta de prueba:', rows[0].result);
    
    // Revisar si la tabla estudiantes existe
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Tablas en la base de datos:', tables.map(t => Object.values(t)[0]));
    
    // Contar estudiantes
    const [estudiantes] = await connection.execute('SELECT COUNT(*) AS count FROM estudiantes');
    console.log('Número de estudiantes:', estudiantes[0].count);
    
  } catch (error) {
    console.error('Error en la prueba:', error);
  } finally {
    await connection.end();
  }
}

testConnection();