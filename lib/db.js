import mysql from 'mysql2/promise';

export async function getConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Italia_15',
      database: process.env.DB_NAME || 'academia_app',
      port: process.env.DB_PORT || 3306
    });
    
    return connection;
  } catch (error) {
    console.error('Error connecting to the database:', error);
    throw error;
  }
}