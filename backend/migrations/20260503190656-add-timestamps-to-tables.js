'use strict';

/** @type {import('sequelize-cli').Migration} */


 export async function up(queryInterface, Sequelize) {

    const tables = [
      'ProviderCategories',
      'Staff',
      'ProviderServices',
      'StaffSkills'
    ];

    for (const table of tables) {

      // createdAt
      await queryInterface.addColumn(table, 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      });

      // updatedAt
      await queryInterface.addColumn(table, 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      });
    }
  }

 export  async function down(queryInterface) {

    const tables = [
      'ProviderCategories',
      'Staff',
      'ProviderServices',
      'StaffSkills'
    ];

    for (const table of tables) {
      await queryInterface.removeColumn(table, 'createdAt');
      await queryInterface.removeColumn(table, 'updatedAt');
    }
  }
