'use strict';

/** @type {import('sequelize-cli').Migration} */

export async function up(queryInterface, Sequelize) {

  // =========================
  // CATEGORIES → updatedAt add
  // =========================

  // Step 1: allow NULL
  await queryInterface.addColumn('Categories', 'updatedAt', {
    type: Sequelize.DATE,
    allowNull: true
  });

  // Step 2: fill existing rows
  await queryInterface.sequelize.query(`
    UPDATE Categories SET updatedAt = NOW() WHERE updatedAt IS NULL;
  `);

  // Step 3: make NOT NULL
  await queryInterface.changeColumn('Categories', 'updatedAt', {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  });


  // =========================
  // SERVICES → createdAt + updatedAt add
  // =========================

  // createdAt
  await queryInterface.addColumn('Services', 'createdAt', {
    type: Sequelize.DATE,
    allowNull: true
  });

  await queryInterface.sequelize.query(`
    UPDATE Services SET createdAt = NOW() WHERE createdAt IS NULL;
  `);

  await queryInterface.changeColumn('Services', 'createdAt', {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  });

  // updatedAt
  await queryInterface.addColumn('Services', 'updatedAt', {
    type: Sequelize.DATE,
    allowNull: true
  });

  await queryInterface.sequelize.query(`
    UPDATE Services SET updatedAt = NOW() WHERE updatedAt IS NULL;
  `);

  await queryInterface.changeColumn('Services', 'updatedAt', {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  });
}


export async function down(queryInterface) {

  await queryInterface.removeColumn('Categories', 'updatedAt');

  await queryInterface.removeColumn('Services', 'createdAt');
  await queryInterface.removeColumn('Services', 'updatedAt');
}