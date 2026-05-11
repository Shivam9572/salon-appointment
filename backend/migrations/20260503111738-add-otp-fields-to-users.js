'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     await queryInterface.addColumn('Users', 'otp', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'otpExpiry', {
      type: Sequelize.DATE,
      allowNull: true
    });
  }

  export async function down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
      await queryInterface.removeColumn('Users', 'otp');
    await queryInterface.removeColumn('Users', 'otpExpiry');
  }
