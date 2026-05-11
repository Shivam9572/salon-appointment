// models/Appointment.js

import { DataTypes } from "sequelize";
import sequelize from "../config/DB.js";

const Appointment = sequelize.define("Appointment", {

  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  provider_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  staff_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  service_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  chair_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },

  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },

  status: {
    type: DataTypes.ENUM(
      "pending",
      "confirmed",
      "completed",
      "cancelled",
      "rejected"
    ),
    defaultValue: "pending",
  },

}, {
  tableName: "Appointments",
  timestamps: true,
});

export default Appointment;