'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     await queryInterface.addColumn('Providers', 'otp', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Providers', 'otpExpiry', {
      type: Sequelize.DATE,
      allowNull: true
    });
     await queryInterface.addColumn('Admins', 'otp', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Admins', 'otpExpiry', {
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
      await queryInterface.removeColumn('Providers', 'otp');
    await queryInterface.removeColumn('Providers', 'otpExpiry');
    await queryInterface.removeColumn('Admins', 'otp');
    await queryInterface.removeColumn('Admins', 'otpExpiry');
  }
