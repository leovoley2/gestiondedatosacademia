import sequelize from '@/lib/db';
import Estudiante from './Estudiante';
import Pago from './Pago';

// Función para sincronizar modelos con la base de datos
export const sincronizarModelos = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySQL establecida correctamente.');
    
    // Sincronizar modelos (solo en desarrollo)
    // En producción, usa migraciones en lugar de sync
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Modelos sincronizados con la base de datos.');
    }
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
  }
};

export { Estudiante, Pago };