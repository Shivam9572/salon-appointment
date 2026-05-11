'use strict';

/** @type {import('sequelize-cli').Migration} */


 



 export async function up(queryInterface, Sequelize) {

    // 1. Categories
    await queryInterface.createTable('Categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      image: { type: Sequelize.STRING, allowNull: true },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // 2. Services
    await queryInterface.createTable('Services', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Categories',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: { type: Sequelize.STRING, allowNull: false },
      description: {  type: Sequelize.TEXT, allowNull: true },
      default_price: { type: Sequelize.DECIMAL(10,2), allowNull: false },
      default_duration: { type: Sequelize.INTEGER, allowNull: false }
    });

    // 3. Staff
    await queryInterface.createTable('Staff', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      provider_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Providers', // already exist hona chahiye
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      name: { type: Sequelize.STRING, allowNull: false },
      phone: {  type: Sequelize.STRING, allowNull: false },
    });

    // 4. ProviderCategories
    await queryInterface.createTable('ProviderCategories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      provider_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Providers',
          key: 'id'
        }
      },
      category_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Categories',
          key: 'id'
        }
      }
    });

    // 5. ProviderServices
    await queryInterface.createTable('ProviderServices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      provider_id: {
        type: Sequelize.UUID,
        references: { model: 'Providers', key: 'id' }
      },
      category_id: {
        type: Sequelize.UUID,
        references: { model: 'Categories', key: 'id' }
      },
      service_id: {
        type: Sequelize.UUID,
        references: { model: 'Services', key: 'id' }
      },
      staff_id: {
        type: Sequelize.UUID,
        references: { model: 'Staff', key: 'id' }
      },
      custom_price: Sequelize.DECIMAL(10,2),
      custom_duration: Sequelize.INTEGER,
      custom_description: Sequelize.TEXT
    });

    // 6. StaffSkills
    await queryInterface.createTable('StaffSkills', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      staff_id: {
        type: Sequelize.UUID,
        references: { model: 'Staff', key: 'id' }
      },
      service_id: {
        type: Sequelize.UUID,
        references: { model: 'Services', key: 'id' }
      }
    });
  }   
 

  export async function down(queryInterface) {
    await queryInterface.dropTable('StaffSkills');
    await queryInterface.dropTable('ProviderServices');
    await queryInterface.dropTable('ProviderCategories');
    await queryInterface.dropTable('Staff');
    await queryInterface.dropTable('Services');
    await queryInterface.dropTable('Categories');
  }

