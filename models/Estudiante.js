import { DataTypes } from 'sequelize';
import sequelize from '@/lib/db';
const mysql = require('mysql2/promise');

const Estudiante = sequelize.define('Estudiante', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  curso: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  fecha_inscripcion: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  ultimo_pago: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  proximo_pago: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  estado_pago: {
    type: DataTypes.ENUM('Al día', 'Atrasado'),
    defaultValue: 'Al día'
  }
}, {
  tableName: 'estudiantes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Estudiante;