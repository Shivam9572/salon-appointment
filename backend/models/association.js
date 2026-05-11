import User from "../models/user.js";
import Admin from "../models/admin.js";
import Provider from "../models/provider.js";
import Category from "./category.js";
import Service from "./service.js";
import Staff from "./staff.js";
import ProviderCategory from "./providerCategory.js";
import ProviderService from "./providerService.js";
import StaffSkill from "./staffSkill.js";
import Chair from "./chair.js";
import Appointment from "./appointment.js";

// Category → Service
Category.hasMany(Service, { foreignKey: "category_id" ,  onDelete: "CASCADE",
  hooks: true,});
Service.belongsTo(Category, { foreignKey: "category_id" });

// Provider → Staff
Provider.hasMany(Staff, { foreignKey: "provider_id" });
Staff.belongsTo(Provider, { foreignKey: "provider_id" });

Provider.hasOne(Chair, {
  foreignKey: "provider_id",
  onDelete: "CASCADE",
});

Chair.belongsTo(Provider, {
  foreignKey: "provider_id",
});

// Provider ↔ Category
Provider.belongsToMany(Category, {
  through: ProviderCategory,
  foreignKey: "provider_id"
});
Category.belongsToMany(Provider, {
  through: ProviderCategory,
  foreignKey: "category_id"
   
});

Category.hasMany(ProviderCategory, { foreignKey: 'category_id' ,  onDelete: "CASCADE",
  hooks: true,});
  Provider.hasMany(ProviderCategory, { foreignKey: 'category_id' ,  onDelete: "CASCADE",
  hooks: true,});
ProviderCategory.belongsTo(Category, { foreignKey: 'category_id' });
ProviderCategory.belongsTo(Provider, { foreignKey: 'category_id' });

// Provider ↔ Service
Provider.belongsToMany(Service, {
  through: ProviderService,
  foreignKey: "provider_id"
});
Service.belongsToMany(Provider, {
  through: ProviderService,
  foreignKey: "service_id"
});

// Staff ↔ Service
Staff.belongsToMany(Service, {
  through: StaffSkill,
  foreignKey: "staff_id"
});
Service.belongsToMany(Staff, {
  through: StaffSkill,
  foreignKey: "service_id"
});

// 🔥 Important joins
ProviderService.belongsTo(Provider, { foreignKey: "provider_id" });
ProviderService.belongsTo(Service, { foreignKey: "service_id" });
ProviderService.belongsTo(Category, { foreignKey: "category_id" });
ProviderService.belongsTo(Staff, { foreignKey: "staff_id" });

Provider.hasMany(ProviderService, { foreignKey: "provider_id" });
Service.hasMany(ProviderService, { foreignKey: "service_id" ,  onDelete: "CASCADE",
  hooks: true,});
Category.hasMany(ProviderService, { foreignKey: "category_id" ,  onDelete: "CASCADE",
  hooks: true,});
Staff.hasMany(ProviderService, { foreignKey: "staff_id" });

// ======================================================
// USER ↔ APPOINTMENT
// ======================================================

User.hasMany(Appointment, {
  foreignKey: "customer_id",
  as: "appointments",
  onDelete: "CASCADE",
});

Appointment.belongsTo(User, {
  foreignKey: "customer_id",
  as: "customer",
});



// ======================================================
// PROVIDER ↔ APPOINTMENT
// ======================================================

Provider.hasMany(Appointment, {
  foreignKey: "provider_id",
  as: "appointments",
  onDelete: "CASCADE",
});

 Appointment.belongsTo(Provider, {
    foreignKey: 'provider_id',
    as: 'provider' // This is the alias you need to use in includes
  });



// ======================================================
// STAFF ↔ APPOINTMENT
// ======================================================

Staff.hasMany(Appointment, {
  foreignKey: "staff_id",
  as: "appointments",
  onDelete: "CASCADE",
});

Appointment.belongsTo(Staff, {
  foreignKey: "staff_id",
  as: "staff",
});



// ======================================================
// SERVICE ↔ APPOINTMENT
// ======================================================

Service.hasMany(Appointment, {
  foreignKey: "service_id",
  as: "appointments",
  onDelete: "CASCADE",
});

Appointment.belongsTo(Service, {
  foreignKey: "service_id",
  as: "service",
});



// ======================================================
// CHAIR ↔ APPOINTMENT
// ======================================================

Chair.hasMany(Appointment, {
  foreignKey: "chair_id",
  as: "appointments",
  onDelete: "SET NULL",
});

Appointment.belongsTo(Chair, {
  foreignKey: "chair_id",
  as: "chair",
});


export    {User, Admin, Provider, Category, Service, Staff, ProviderCategory, ProviderService, StaffSkill,Chair,Appointment};