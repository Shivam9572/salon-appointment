'use strict';

/** @type {import('sequelize-cli').Migration} */

 
  export async function up(queryInterface, Sequelize) {

    // 1. Categories insert
    const categories = [
      {
        id: Sequelize.literal('UUID()'),
        name: 'Hair Services',
        description: 'Hair cutting, styling, coloring and treatments',
        created_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        name: 'Nail Services',
        description: 'Manicure, pedicure and nail art services',
        created_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        name: 'Skin & Face',
        description: 'Facials, skin treatments and care',
        created_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        name: 'Beauty Services',
        description: 'Threading, waxing and grooming',
        created_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        name: 'Wellness',
        description: 'Relaxation and therapy services',
        created_at: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        name: 'Mens / Barbershop',
        description: 'Men grooming and beard services',
        created_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('Categories', categories);

    // 2. Fetch category IDs (important for UUID)
    const insertedCategories = await queryInterface.sequelize.query(
      `SELECT id, name FROM Categories;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const getId = (name) =>
      insertedCategories.find(c => c.name === name)?.id;

    // 3. Services insert
    const services = [
      {
        id: Sequelize.literal('UUID()'),
        category_id: getId('Hair Services'),
        name: 'Haircut & Styling',
        description: 'Professional haircut and styling',
        default_price: 500,
        default_duration: 45
      },
      {
        id: Sequelize.literal('UUID()'),
        category_id: getId('Hair Services'),
        name: 'Hair Coloring',
        description: 'Full hair coloring and highlights',
        default_price: 1200,
        default_duration: 90
      },
      {
        id: Sequelize.literal('UUID()'),
        category_id: getId('Hair Services'),
        name: 'Keratin Treatment',
        description: 'Smoothening and keratin treatment',
        default_price: 2000,
        default_duration: 120
      },
      {
        id: Sequelize.literal('UUID()'),
        category_id: getId('Nail Services'),
        name: 'Manicure',
        description: 'Basic hand care and nail cleaning',
        default_price: 300,
        default_duration: 30
      },
      {
        id: Sequelize.literal('UUID()'),
        category_id: getId('Nail Services'),
        name: 'Pedicure',
        description: 'Foot care and relaxation treatment',
        default_price: 400,
        default_duration: 45
      },
      {
        id: Sequelize.literal('UUID()'),
        category_id: getId('Skin & Face'),
        name: 'Hydration Facial',
        description: 'Deep skin hydration facial',
        default_price: 900,
        default_duration: 60
      },
      {
        id: Sequelize.literal('UUID()'),
        category_id: getId('Beauty Services'),
        name: 'Eyebrow Threading',
        description: 'Precision eyebrow shaping',
        default_price: 150,
        default_duration: 15
      },
      {
        id: Sequelize.literal('UUID()'),
        category_id: getId('Wellness'),
        name: 'Aromatherapy',
        description: 'Relaxing essential oil therapy',
        default_price: 700,
        default_duration: 60
      },
      {
        id: Sequelize.literal('UUID()'),
        category_id: getId('Mens / Barbershop'),
        name: 'Beard Grooming',
        description: 'Beard trimming and styling',
        default_price: 400,
        default_duration: 30
      }
    ];

    await queryInterface.bulkInsert('Services', services);
  }


 export async function down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Services', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
  }
