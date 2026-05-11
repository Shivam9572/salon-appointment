// controllers/appointment.controller.js

import { Sequelize, Op, where } from "sequelize";

import { Appointment, Provider, Service, Staff, Chair, User, ProviderService, Category } from "../models/association.js";



// controllers/appointmentController.js



export const getAvailableSlots = async (req, res) => {
  try {
    const customerId = req.user.id;
    let { staffId, serviceId, providerId, date } = req.body;

    // ─── 1. User check ───────────────────────────────────────
    const customer = await User.findOne({ where: { id: customerId } });
    if (!customer) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ─── 2. Provider check ───────────────────────────────────
    let provider = await Provider.findOne({
      where: { id: providerId, status: "approved" },
    });
    if (!provider) {
      return res.status(404).json({ success: false, message: "Provider not found" });
    }

    // ─── 3. Service check + duration lena ────────────────────
    const service = await Service.findOne({ where: { id: serviceId } });
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found" });
    }
    // Make sure this exists in your DB

    // ─── 4. Staff check ──────────────────────────────────────
    const staff = await Staff.findOne({
      where: { id: staffId, provider_id: providerId },
    });
    if (!staff) {
      return res.status(404).json({ success: false, message: "Staff not found" });
    }
    if (!staff.available) {
      return res.status(400).json({ success: false, message: "Staff is not available" });
    }
    let providerService = await ProviderService.findOne({ where: { provider_id: providerId, service_id: serviceId, staff_id: staffId } });
    if (!providerService) {
      return res.status(404).json({ success: false, message: "staff services not found" });
    }

    let duration = parseInt((providerService.toJSON()).custom_duration);
    if (!date) {
      date = new Date();
    } else {
      date = new Date(date);
      if (date.getDate() < (new Date).getDate()) {
        return res.status(409).json({ success: false, message: "Appoinment not allow previous date" });
      }
    }
    provider = provider.toJSON();
    let providerClosingTime = provider.closing_time.split(":");
    let providerOpeningTime = provider.opening_time.split(":");

    if (date.getHours() > providerClosingTime[0]) {
      return res.status(404).json({ success: false, message: "shop is now close" });
    }
    let starttime = date;
    starttime.setDate(starttime.getDate());
    starttime.setHours(providerOpeningTime[0], 0, 0, 0);
    let endTime = new Date();
    endTime.setDate(endTime.getDate() + 1);
    endTime.setHours(providerClosingTime[0], 0, 0, 0);

    // ─── 7. Get booked appointments for that date ─────────────
    let bookedAppointments = await Appointment.findAll({
      where: {
        staff_id: staffId,
        provider_id: providerId,
        status: { [Op.notIn]: ["cancelled", "completed"] },
        start_time: { [Op.between]: [date, endTime] }
      },
      attributes: ["start_time", "end_time"],
      order: [["start_time", "ASC"]]
    });


    bookedAppointments = JSON.parse(JSON.stringify(bookedAppointments));

    providerOpeningTime = providerOpeningTime.map((s) => {
      return parseInt(s);
    });
    providerClosingTime = providerClosingTime.map((s) => {
      return parseInt(s);
    });
    let timeSlots = [];
    let initTime = 8 * 60 + 0;

    bookedAppointments.map((t) => {
      let start_time = new Date(t.start_time.toString());
      let end_time = new Date(t.end_time.toString());
      let start_hour = start_time.getHours() - 5;
      let end_hour = end_time.getHours() - 5;
      let start_minute = start_time.getMinutes() - 30;
      let end_minute = end_time.getMinutes() - 30;

      if (start_hour * 60 + start_minute - duration > initTime) {

        timeSlots.push({
          start: [parseInt(initTime / 60), initTime % 60],
          end: [parseInt((start_hour * 60 + start_minute - duration) / 60), (start_hour * 60 + start_minute - duration) % 60]
        });

      }

      initTime = end_hour * 60 + end_minute;
    });
    if (initTime < (providerClosingTime[0] * 60) + providerClosingTime[1] - duration) {
      timeSlots.push({
        start: [parseInt(initTime / 60), initTime % 60],
        end: [parseInt(((providerClosingTime[0] * 60) + providerClosingTime[1] - duration) / 60), providerClosingTime[1]]
      });
    }

    return res.status(200).json({ success: true, timeSlots });

  } catch (error) {
    console.error("Error in getAvailableSlots:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available slots",
      error: error.message
    });
  }
};

// Helper function to format time to 12-hour format
function formatTimeTo12Hour(timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}


// ======================================
// CREATE APPOINTMENT
// ======================================
// Backend controller (updated)
export const createAppointment = async (req, res) => {
  try {
    const customer_id = req.user.id; // Get from auth middleware

    const {
      provider_id,
      service_id,
      staff_id,
      start_time,
      end_time,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      price,
      duration
    } = req.body;

    if (
      !provider_id ||
      !service_id ||
      !staff_id ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // CHECK OVERLAPPING APPOINTMENTS
    const existingAppointment = await Appointment.findOne({
      where: {
        staff_id,
        status: {
          [Op.notIn]: ["cancelled", "completed"],
        },

        [Op.and]: [
          { start_time: { [Op.lt]: end_time } },   // existing starts before new ends
          { end_time: { [Op.gt]: start_time } },  // existing ends after new starts
        ],
      },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "Selected time slot already booked",
      });
    }

    const appointment = await Appointment.create({
      customer_id,
      provider_id,
      service_id,
      staff_id,
      start_time,
      end_time,
      status: "pending"
    });

    // Optionally store customer details and notes in a separate table
    // or update the appointment with additional info

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to create appointment",
    });
  }
};




// ======================================
// GET USER APPOINTMENTS
// ======================================

export const getUserAppointments = async (req, res) => {
  try {
    const id = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const user = await User.findOne({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: "user not found" });
    }

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where: {
        customer_id: id,
      },
      include: [
        {
          model: Provider,
          attributes: [
            "id",
            "salonName",
            "salonAddress",
            "salonContact",
          ],
          as: "provider"
        },
        {
          model: ProviderService,
          attributes: [
            "custom_price",
            "custom_duration",
            "custom_description",
          ],
          on: {
            service_id: { [Op.col]: 'appointment.service_id' },
            staff_id: { [Op.col]: 'appointment.staff_id' }
          },
          required: true,
          include: [{
            model: Service,
            attributes: ["name"]
          }]
        },

        {
          model: Staff,
          attributes: [
            "id",
            "name",
            "phone",
          ],
          as: "staff"
        }
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return res.status(200).json({
      success: true,
      appointments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointments",
    });
  }
};




// ======================================
// GET SINGLE APPOINTMENT
// ======================================

export const getAppointmentDetails = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const customer_id = req.user.id;

    const appointment = await Appointment.findOne({
      where: {
        id: appointmentId,
        customer_id,
      },
      include: [
        {
          model: Provider,
          attributes: [
            "id",
            "salonName",
            "salonAddress",
            "salonContact",
          ],
        },
        {
          model: Service,
          attributes: [
            "id",
            "name",
            "price",
            "duration",
          ],
        },
        {
          model: Staff,
          attributes: [
            "id",
            "name",
            "phone",
          ],
        },
        {
          model: Chair,
          attributes: [
            "id",
            "name",
          ],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch appointment",
    });
  }
};




// ======================================
// CANCEL APPOINTMENT
// ======================================

export const cancelAppointment = async (req, res) => {
    
  try {

    const { appointmentId } = req.params;

    const customer_id = req.user.id;



    const appointment = await Appointment.findOne({

      where: {
        id: appointmentId,
        customer_id,
      },

    });



    if (!appointment) {

      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });

    }



    if (appointment.status === "completed") {

      return res.status(400).json({
        success: false,
        message: "Completed appointment cannot be cancelled",
      });

    }



    appointment.status = "cancelled";

    await appointment.save();



    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
    });

  }

  catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel appointment",
    });

  }

};

export const getProviderAppointment = async (req, res) => {
  const id = req.user.id;
     const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
  try {
    const provider = await Provider.findOne({ where: { id } });
    if (!provider) {
      return res.status(404).json({ success: false, message: "provider is not found" });
    }
    const  { count, rows: appointments } = await Appointment.findAndCountAll({
      where: { provider_id: id },
      attributes:["id","start_time","end_time","status","createdAt"],
      include: [{
        model: Staff,
        attributes:["name","phone","available"],
        as:"staff"
      }, {
        model: User,
        attributes:["name","email","address","mobile"],
        as:"customer"
        
      },{
        model: ProviderService,
        attributes: [
          "custom_price",
          "custom_duration",
          "custom_description",
        ],
        on: {
          service_id: { [Op.col]: 'appointment.service_id' },
          staff_id: { [Op.col]: 'appointment.staff_id' }
        },
        required: true,
        include: [{
          model: Service,
          attributes: ["name"]
        },{
          model:Category,
          attributes:["name"]
        }]
      }
      ],
      limit,
      offset,
      order:[["createdAt","DESC"]]
    }
    );
    return res.status(200).json({ success: true, message: appointments, pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit,
      }, });

  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export const setAppointmentStatus=async(req,res)=>{
     const id=req.user.id;
          try {
     const {appointmentId}=req.params;
     const {status}=req.query;
       if(status!="rejected" || status==="comfirmed" || "competed"){
         const provider=await Provider.findOne({where:{id}});
        if(!provider){
          return res.status(404).json({success:false,message:"provider not found"});
        }
        const  appointment=await Appointment.findOne({where:{id:appointmentId,provider_id:id}});
        if(!appointment){
         return res.status(404).json({success:false,message:"appointment not found"});
 
        }
        appointment.status=status;
        await appointment.save();
       return  res.status(200).json({success:true,message:"status changed successfull"})
       }
       res.status(429).json({success:false,messgae:"invalid status"});
       
     } catch (error) {
      console.log(error);
      res.status(500).json({success:"false",message:error.message});
     }
}