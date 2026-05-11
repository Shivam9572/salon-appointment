'use strict';
import { randomUUID } from "crypto";
/** @type {import('sequelize-cli').Migration} */

export async function up(queryInterface, Sequelize) {

  // Providers columns
  await queryInterface.addColumn("Providers", "available", {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  });

  await queryInterface.addColumn("Providers", "opening_time", {
    type: Sequelize.TIME,
    defaultValue: "09:00:00",
    allowNull: false
  });

  await queryInterface.addColumn("Providers", "closing_time", {
    type: Sequelize.TIME,
    defaultValue: "20:00:00",
    allowNull: false
  });

  // Staff available
  await queryInterface.addColumn("Staffs", "available", {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
    allowNull: false
  });

  // Chairs table
  await queryInterface.createTable("Chairs", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
      primaryKey: true
    },

    provider_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "Providers",
        key: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },

    number: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    },

    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },

    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  });

  // Default chair insert
  const providers = await queryInterface.sequelize.query(
    'SELECT id FROM Providers',
    {
      type: Sequelize.QueryTypes.SELECT
    }
  );

  const chairs = providers.map((p) => ({
    id: randomUUID(),
    provider_id: p.id,
    number: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  if (chairs.length > 0) {
    await queryInterface.bulkInsert("Chairs", chairs);
  }

  // Appointments table
  await queryInterface.createTable('Appointments', {

    id: {
      type: Sequelize.UUID,
      primaryKey: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: false,
    },

    customer_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id"
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE"
    },

    provider_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Providers',
        key: 'id',
      },
      onDelete: "CASCADE",
      onUpdate: 'CASCADE',
    },

    staff_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Staffs',
        key: 'id',
      },
      onDelete: "SET NULL",
      onUpdate: 'CASCADE',
    },

    service_id: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Services',
        key: 'id',
      },
      onDelete: "CASCADE",
      onUpdate: 'CASCADE',
    },

    chair_id: {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Chairs',
        key: 'id',
      },
      onDelete: "SET NULL",
      onUpdate: 'CASCADE',
    },

    start_time: {
      type: Sequelize.DATE,
      allowNull: false,
    },

    end_time: {
      type: Sequelize.DATE,
      allowNull: false,
    },

    status: {
      type: Sequelize.ENUM(
        'pending',
        'confirmed',
        'completed',
        'cancelled'
      ),
      defaultValue: 'pending',
    },

    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },

    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    },
  });
}

export async function down(queryInterface, Sequelize) {

  await queryInterface.dropTable("Appointments");

  await queryInterface.dropTable("Chairs");

  await queryInterface.removeColumn("Providers", "available");
  await queryInterface.removeColumn("Providers", "opening_time");
  await queryInterface.removeColumn("Providers", "closing_time");

  await queryInterface.removeColumn("Staffs", "available");

  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_Appointments_status";'
  );
}