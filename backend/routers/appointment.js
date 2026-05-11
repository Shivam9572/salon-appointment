// routes/appointment.routes.js

import express from "express";

import {
  createAppointment,
  getUserAppointments,
  getAppointmentDetails,
  cancelAppointment,getAvailableSlots
} from "../controllers/appointment.js";

import { validUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", validUser,createAppointment);

router.get("/", validUser, getUserAppointments);

router.get("/:appointmentId", validUser, getAppointmentDetails);

router.patch("/:appointmentId/cancel", validUser, cancelAppointment);
router.post("/slots", validUser, getAvailableSlots);

export default router;