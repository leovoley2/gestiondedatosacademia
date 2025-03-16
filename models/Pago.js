import { DataTypes } from 'sequelize';
import sequelize from '@/lib/db';
import Estudiante from './Estudiante';

const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  estudiante_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'estudiantes',
      key: 'id'
    }
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(255),
    defaultValue: 'Pago mensual'
  }
}, {
  tableName: 'pagos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Definir relaciones
Pago.belongsTo(Estudiante, { foreignKey: 'estudiante_id' });
Estudiante.hasMany(Pago, { foreignKey: 'estudiante_id' });

export default Pago;