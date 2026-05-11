'use strict';

/** @type {import('sequelize-cli').Migration} */

  export async function up(queryInterface, Sequelize) {
    
    // 🔗 Category → Service
    await queryInterface.addConstraint("Services", {
      fields: ["category_id"],
      type: "foreign key",
      name: "fk_services_category",
      references: {
        table: "Categories",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // 🔗 Service → ProviderServices
    await queryInterface.addConstraint("ProviderServices", {
      fields: ["service_id"],
      type: "foreign key",
      name: "fk_provider_services_service",
      references: {
        table: "Services",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // 🔗 Service → StaffSkill
    await queryInterface.addConstraint("StaffSkills", {
      fields: ["service_id"],
      type: "foreign key",
      name: "fk_staffskills_service",
      references: {
        table: "Services",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("ProviderCategories", {
      fields: ["category_id"],
      type: "foreign key",
      name: "fk_provider_catrgories",
      references: {
        table: "Categories",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }

 export async function down(queryInterface, Sequelize) {
    
    await queryInterface.removeConstraint("Services", "fk_services_category");
    await queryInterface.removeConstraint("ProviderServices", "fk_provider_services_service");
    await queryInterface.removeConstraint("StaffSkills", "fk_staffskills_service");
    await queryInterface.removeConstraint("ProviderCategories", "fk_provider_categories");
  }
