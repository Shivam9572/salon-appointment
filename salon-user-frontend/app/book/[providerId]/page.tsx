// app/book/[providerId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Scissors,
  MapPin,
  Phone,
  Clock,
  User,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Clock as ClockIcon,
  Loader2,
  Edit2,
  Save,
} from "lucide-react";
import { useAuth } from "../../../hooks/useAuth";
import { apiFetch } from "../../../lib/api";
import Link from "next/link";
import { Provider } from "../../../lib/type";

interface Staff {
  id: string;
  name: string;
  phone: string;
  available: boolean;
}

interface Service {
  service_id: string;
  service_name: string;
  custom_price: string;
  custom_duration: number;
  custom_description: string;
  category: {
    id: string;
    name: string;
  };
  staff: Staff[];
}

interface ApiResponse {
  success: boolean;
  provider: Provider;
  services: Service[];
}

interface TimeSlot {
  start_time: string;
  end_time: string;
  display_time?: string;
  start_time_minutes?: number;
  end_time_minutes?: number;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const providerId = params.providerId as string;
  const { isLoggedIn, user } = useAuth();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingDetails, setBookingDetails] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Auto-fill user details when available
  useEffect(() => {
    if (user && isLoggedIn) {
      setBookingDetails(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user, isLoggedIn]);

  useEffect(() => {
    // Check if user is logged in
    if (!isLoggedIn) {
      setShowAuthAlert(true);
      setLoading(false);
      return;
    }
    fetchProviderDetails();
  }, [providerId, isLoggedIn]);

  // Fetch time slots when entering step 3 or when staff/service/date changes
  useEffect(() => {
    if (bookingStep === 3 && selectedStaff && selectedService) {
      // If no date is selected, set to today's date
      if (!selectedDate) {
        const todayDate = getTodayDate();
        setSelectedDate(todayDate);
        // Fetch slots with today's date
        fetchAvailableSlots(todayDate);
      } else if (selectedDate) {
        fetchAvailableSlots(selectedDate);
      }
    }
  }, [bookingStep, selectedStaff, selectedService, selectedDate]);

  const formatTimeForDisplay = (timeInMinutes: number) => {
    if (!timeInMinutes || timeInMinutes < 0) return 'Invalid Time';
   
    const hours = Math.floor(timeInMinutes / 60);
    const minutes = timeInMinutes % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hour12}:${minutesStr} ${ampm}`;
  };

  // Convert time string "08:00" to minutes
  const convertTimeStringToMinutes = (timeString: string): number => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert time array [8,0] to minutes
  const convertTimeArrayToMinutes = (timeArray: number[]): number => {
    if (!timeArray || timeArray.length < 2) return 0;
    return timeArray[0] * 60 + timeArray[1];
  };

  // Convert minutes to time string "08:00"
  const convertMinutesToTimeString = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Create full datetime for API
  const createDateTime = (date: string, timeMinutes: number): string => {
    const [year, month, day] = date.split('-');
    const hours = Math.floor(timeMinutes / 60);
    const minutes = timeMinutes % 60;
    // Create datetime in ISO format
    const datetime = new Date(Date.UTC(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      hours,
      minutes,
      0
    ));
    return datetime.toISOString();
  };

  const fetchProviderDetails = async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/provider/${providerId}`);
      const data: ApiResponse = await response.json();

      if (data.success) {
        setProvider(data.provider);
        setServices(data.services || []);

        if (data.services && data.services.length > 0) {
          const firstService = data.services[0];
          setSelectedService(firstService);

          const availableStaff = firstService.staff.filter(s => s.available);
          if (availableStaff.length > 0) {
            setSelectedStaff(availableStaff[0]);
          } else if (firstService.staff.length > 0) {
            setSelectedStaff(firstService.staff[0]);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching provider details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date?: string) => {
    if (!selectedStaff || !selectedService) return;

    const slotDate = date || selectedDate || getTodayDate();

    setSlotsLoading(true);
    setSlotsError(null);
    setSelectedTime(null);
    setSelectedSlot(null);

    try {
      const requestBody = {
        staffId: selectedStaff.id,
        serviceId: selectedService.service_id,
        providerId: providerId,
        date: slotDate,
      };

      console.log("Fetching slots with:", requestBody);

      const response = await apiFetch("/appointment/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success && data.timeSlots) {
        // Handle different slot formats
        let formattedSlots: TimeSlot[] = [];

        if (data.timeSlots.length > 0) {
          // Check if slots are in array format [start, end] with nested arrays
          if (data.timeSlots[0].start && Array.isArray(data.timeSlots[0].start)) {
            // Format: [{ start: [8,0], end: [9,45] }]
            formattedSlots = data.timeSlots.map((slot: any) => {
              const startMinutes = convertTimeArrayToMinutes(slot.start);
              const endMinutes = convertTimeArrayToMinutes(slot.end);
              const startTimeStr = `${slot.start[0].toString().padStart(2, '0')}:${slot.start[1].toString().padStart(2, '0')}`;
              const endTimeStr = `${slot.end[0].toString().padStart(2, '0')}:${slot.end[1].toString().padStart(2, '0')}`;
              return {
                start_time: startTimeStr,
                end_time: endTimeStr,
                start_time_minutes: startMinutes,
                end_time_minutes: endMinutes,
                display_time: `${formatTimeForDisplay(startMinutes)} - ${formatTimeForDisplay(endMinutes)}`
              };
            });
          } else if (data.timeSlots[0].start_time) {
            // Format: [{ start_time: "08:00", end_time: "09:45" }]
            formattedSlots = data.timeSlots.map((slot: any) => {
              const startMinutes = convertTimeStringToMinutes(slot.start_time);
              const endMinutes = convertTimeStringToMinutes(slot.end_time);
              return {
                ...slot,
                start_time_minutes: startMinutes,
                end_time_minutes: endMinutes,
                display_time: `${formatTimeForDisplay(startMinutes)} - ${formatTimeForDisplay(endMinutes)}`
              };
            });
          }
        }

        setAvailableSlots(formattedSlots);
      } else {
        setAvailableSlots([]);
        setSlotsError(data.message || "No available slots for this date");
      }
    } catch (error) {
      console.error("Error fetching slots:", error);
      setAvailableSlots([]);
      setSlotsError("Failed to load available slots. Please try again.");
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setSelectedSlot(null);
    setAvailableSlots([]);

    if (selectedStaff && selectedService) {
      fetchAvailableSlots(date);
    }
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    if (!selectedService) return;
    
    setSelectedSlot(slot);
    const startMinutes = slot.start_time_minutes || convertTimeStringToMinutes(slot.start_time);
    const endMinutes = slot.end_time_minutes || convertTimeStringToMinutes(slot.end_time);
    
    setSelectedTime(startMinutes);
    setStartTime(startMinutes);
    setEndTime(endMinutes);
  };

  const adjustTime = (increment: boolean) => {
    if (!selectedTime || !selectedService || !endTime || !startTime) return;
    
    const duration = selectedService.custom_duration;
    let newTime;
    
    if (increment) {
      newTime = selectedTime + duration;
      // Check if new time + duration exceeds the end time
      if (newTime + duration > endTime) {
        return;
      }
    } else {
      newTime = selectedTime - duration;
      // Check if new time is before start time
      if (newTime < startTime) {
        return;
      }
    }
    
    setSelectedTime(newTime);
  };

  const handleServiceChange = (service: Service) => {
    setSelectedService(service);
    const availableStaff = service.staff.filter(s => s.available);
    if (availableStaff.length > 0) {
      setSelectedStaff(availableStaff[0]);
    } else if (service.staff.length > 0) {
      setSelectedStaff(service.staff[0]);
    } else {
      setSelectedStaff(null);
    }
    setSelectedDate("");
    setSelectedTime(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  const handleStaffChange = (staff: Staff) => {
    setSelectedStaff(staff);
    setSelectedDate("");
    setSelectedTime(null);
    setSelectedSlot(null);
    setAvailableSlots([]);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedService || !selectedStaff || !selectedDate || !selectedTime) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      // Calculate end time based on selected start time and service duration
      const endTimeMinutes = selectedTime + selectedService.custom_duration;
      
      // Create full datetime objects for start and end times
      const startDateTime = createDateTime(selectedDate, selectedTime);
      const endDateTime = createDateTime(selectedDate, endTimeMinutes);
      
      console.log("Booking data:", {
        provider_id: providerId,
        service_id: selectedService.service_id,
        staff_id: selectedStaff.id,
        start_time: startDateTime,
        end_time: endDateTime,
        customerName: bookingDetails.name || user?.name,
        customerEmail: bookingDetails.email || user?.email,
        customerPhone: bookingDetails.phone,
        notes: bookingDetails.notes,
        price: selectedService.custom_price,
        duration: selectedService.custom_duration
      });

      const bookingData = {
        provider_id: providerId,
        service_id: selectedService.service_id,
        staff_id: selectedStaff.id,
        start_time: startDateTime,
        end_time: endDateTime,
        customerName: bookingDetails.name || user?.name,
        customerEmail: bookingDetails.email || user?.email,
        customerPhone: bookingDetails.phone,
        notes: bookingDetails.notes,
        price: selectedService.custom_price,
        duration: selectedService.custom_duration
      };

      const response = await apiFetch("/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Booking confirmed successfully!");
        router.push("/my-bookings");
      } else {
        alert(data.message || "Booking failed. Please try again.");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      alert("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getMinDate = () => {
    return getTodayDate();
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    return maxDate.toISOString().split("T")[0];
  };

  if (showAuthAlert) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-gradient-to-br from-[#12121a] to-[#1a1a24] rounded-2xl border border-white/10 p-8 text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Login Required</h2>
          <p className="text-white/60 mb-6">
            Please login to your account to book an appointment
          </p>
          <div className="flex gap-3">
            <Link
              href="/"
              className="flex-1 px-4 py-2 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all"
            >
              Go Back
            </Link>
            <Link
              href="/"
              className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] font-semibold"
            >
              Login / Sign Up
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-3 border-[#c9a96e] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Salon Not Found</h2>
          <p className="text-white/60 mb-6">The salon you're looking for doesn't exist</p>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Services Available</h2>
          <p className="text-white/60 mb-6">This salon currently has no services listed</p>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] font-semibold"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-[72px] pb-12">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${bookingStep >= step
                    ? "bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f]"
                    : "bg-white/10 text-white/40"
                    }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-px ${bookingStep > step ? "bg-[#c9a96e]" : "bg-white/10"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-16 mt-2">
            <span className="text-white/60 text-sm">Select Service</span>
            <span className="text-white/60 text-sm">Choose Staff</span>
            <span className="text-white/60 text-sm">Confirm Booking</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Provider Info & Service Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Provider Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-[#12121a] to-[#1a1a24] rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#c9a96e]/20 to-[#e8c88a]/20 flex items-center justify-center">
                  <Scissors className="w-10 h-10 text-[#c9a96e]" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-white mb-2">{provider.salonName}</h1>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-1 text-white/40">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{provider.salonAddress}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/40">
                      <Phone className="w-3 h-3" />
                      <span>{provider.salonContact}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/40">
                      <Clock className="w-3 h-3" />
                      <span>{provider.opening_time?.slice(0, 5)} - {provider.closing_time?.slice(0, 5)}</span>
                    </div>
                  </div>
                  {provider.servicesOffered && (
                    <p className="text-[#c9a96e] text-sm mt-2">{provider.servicesOffered}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Service Selection */}
            {bookingStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#12121a] rounded-2xl border border-white/10 p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4">Select Service</h2>
                <div className="space-y-3">
                  {services.map((service) => (
                    <motion.button
                      key={service.service_id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleServiceChange(service)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${selectedService?.service_id === service.service_id
                        ? "border-[#c9a96e] bg-[#c9a96e]/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{service.service_name}</h3>
                          <p className="text-white/40 text-sm">{service.custom_description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-white/60 text-xs flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {service.custom_duration} min
                            </span>
                            <span className="text-[#c9a96e] text-sm font-semibold">
                              ₹{parseFloat(service.custom_price).toFixed(0)}
                            </span>
                            <span className="text-white/40 text-xs">
                              {service.staff.filter(s => s.available).length} staff available
                            </span>
                          </div>
                        </div>
                        {selectedService?.service_id === service.service_id && (
                          <CheckCircle className="w-5 h-5 text-[#c9a96e] ml-2 shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="flex justify-end mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setBookingStep(2)}
                    disabled={!selectedService}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 inline ml-1" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Staff Selection */}
            {bookingStep === 2 && selectedService && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#12121a] rounded-2xl border border-white/10 p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4">Choose Staff Member</h2>
                <div className="space-y-3">
                  {selectedService.staff.map((staff) => (
                    <motion.button
                      key={staff.id}
                      whileHover={staff.available ? { scale: 1.01 } : {}}
                      whileTap={staff.available ? { scale: 0.99 } : {}}
                      onClick={() => staff.available && handleStaffChange(staff)}
                      disabled={!staff.available}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${!staff.available
                        ? "border-red-500/30 bg-red-500/5 opacity-60 cursor-not-allowed"
                        : selectedStaff?.id === staff.id
                          ? "border-[#c9a96e] bg-[#c9a96e]/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-[#c9a96e]" />
                            <h3 className="text-white font-semibold">{staff.name}</h3>
                            {!staff.available && (
                              <span className="text-xs text-red-400 bg-red-500/20 px-2 py-0.5 rounded-full">
                                Unavailable
                              </span>
                            )}
                            {staff.available && (
                              <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">
                                Available
                              </span>
                            )}
                          </div>
                          <p className="text-white/40 text-sm mt-1">📞 {staff.phone}</p>
                        </div>
                        {staff.available && selectedStaff?.id === staff.id && (
                          <CheckCircle className="w-5 h-5 text-[#c9a96e]" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                <div className="flex justify-between mt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setBookingStep(1)}
                    className="px-6 py-2 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setBookingStep(3)}
                    disabled={!selectedStaff || !selectedStaff.available}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ChevronRight className="w-4 h-4 inline ml-1" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Booking Details Form */}
            {bookingStep === 3 && selectedService && selectedStaff && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#12121a] rounded-2xl border border-white/10 p-6"
              >
                <h2 className="text-xl font-bold text-white mb-4">Booking Details</h2>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/60 text-sm mb-1.5">Full Name</label>
                      <input
                        type="text"
                        value={bookingDetails.name}
                        onChange={(e) => setBookingDetails({ ...bookingDetails, name: e.target.value })}
                        placeholder={user?.name || "Your name"}
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#c9a96e]/50 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/60 text-sm mb-1.5">
                        Email
                        <span className="text-xs text-white/40 ml-2">(Auto-filled from account)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={bookingDetails.email}
                          onChange={(e) => setBookingDetails({ ...bookingDetails, email: e.target.value })}
                          disabled={!isEditingEmail}
                          className={`w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#c9a96e]/50 transition-colors ${!isEditingEmail ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setIsEditingEmail(!isEditingEmail)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#c9a96e] transition-colors"
                        >
                          {isEditingEmail ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        </button>
                      </div>
                      {!isEditingEmail && (
                        <p className="text-xs text-white/30 mt-1">Click edit icon to change email if needed</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-white/60 text-sm mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        value={bookingDetails.phone}
                        onChange={(e) => setBookingDetails({ ...bookingDetails, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#c9a96e]/50 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white/60 text-sm mb-1.5">Select Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        min={getMinDate()}
                        max={getMaxDate()}
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#c9a96e]/50 transition-colors [color-scheme:dark]"
                        required
                      />
                    </div>

                    {/* Time Slot Selection Section */}
                    <div className="md:col-span-2">
                      <label className="block text-white/60 text-sm mb-1.5">
                        Select Time Slot <span className="text-red-400">*</span>
                      </label>

                      {slotsLoading ? (
                        <div className="flex items-center justify-center py-8 bg-white/5 rounded-xl border border-white/10">
                          <Loader2 className="w-6 h-6 text-[#c9a96e] animate-spin" />
                          <span className="ml-2 text-white/60">Loading available slots...</span>
                        </div>
                      ) : slotsError ? (
                        <div className="text-center py-8 bg-red-500/5 rounded-xl border border-red-500/20">
                          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                          <p className="text-red-400 text-sm">{slotsError}</p>
                          <button
                            type="button"
                            onClick={() => fetchAvailableSlots(selectedDate)}
                            className="mt-3 text-sm text-[#c9a96e] hover:text-[#e8c88a] transition-colors"
                          >
                            Try Again
                          </button>
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="text-center py-8 bg-white/5 rounded-xl border border-white/10">
                          <ClockIcon className="w-8 h-8 text-white/20 mx-auto mb-2" />
                          <p className="text-white/40 text-sm">No available slots for {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric'
                          }) : 'this date'}</p>
                          <p className="text-white/30 text-xs mt-1">Please try another date</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-sm text-white/40 mb-2">
                            Showing slots for {new Date(selectedDate).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {availableSlots.map((slot, index) => {
                              const isSelected = selectedTime === (slot.start_time_minutes || convertTimeStringToMinutes(slot.start_time));
                              const displayText = slot.display_time || `${formatTimeForDisplay(slot.start_time_minutes || convertTimeStringToMinutes(slot.start_time))} - ${formatTimeForDisplay(slot.end_time_minutes || convertTimeStringToMinutes(slot.end_time))}`;

                              return (
                                <motion.button
                                  key={index}
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => handleTimeSlotSelect(slot)}
                                  className={`px-4 py-3 rounded-xl text-center font-medium transition-all ${isSelected
                                    ? "bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] shadow-lg shadow-[#c9a96e]/25"
                                    : "bg-white/5 border border-white/10 text-white hover:border-white/20 hover:bg-white/10"
                                    }`}
                                >
                                  <div className="text-sm font-semibold">{displayText}</div>
                                </motion.button>
                              );
                            })}
                          </div>

                          {selectedTime && selectedSlot && (
                            <div className="mt-3 p-3 bg-[#c9a96e]/10 rounded-lg border border-[#c9a96e]/20">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-[#c9a96e]" />
                                <span className="text-white text-sm">
                                  Selected: {formatTimeForDisplay(selectedTime)}
                                </span>
                              </div>
                              
                              {/* Time adjustment controls */}
                              <div className="flex items-center gap-3 pt-2 border-t border-[#c9a96e]/20">
                                <button
                                  type="button"
                                  onClick={() => adjustTime(false)}
                                  disabled={selectedTime <= (startTime || 0)}
                                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  −
                                </button>
                                <div className="flex-1 text-center">
                                  <span className="text-white/60 text-xs">Duration</span>
                                  <p className="text-white font-semibold">{selectedService.custom_duration} minutes</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => adjustTime(true)}
                                  disabled={selectedTime + selectedService.custom_duration >= (endTime || 0)}
                                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  +
                                </button>
                              </div>
                              
                              <div className="mt-2 text-center">
                                <span className="text-white/40 text-xs">
                                  Available from {formatTimeForDisplay(startTime || 0)} to {formatTimeForDisplay(endTime || 0)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-white/60 text-sm mb-1.5">Special Notes (Optional)</label>
                      <textarea
                        value={bookingDetails.notes}
                        onChange={(e) => setBookingDetails({ ...bookingDetails, notes: e.target.value })}
                        placeholder="Any special requests?"
                        rows={2}
                        className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#c9a96e]/50 transition-colors resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setBookingStep(2)}
                      className="px-6 py-2 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={submitting || !selectedTime || slotsLoading}
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] font-semibold flex items-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                      {submitting ? "Processing..." : "Confirm Booking"}
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>

          {/* Right Column - Booking Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 bg-gradient-to-br from-[#12121a] to-[#1a1a24] rounded-2xl border border-white/10 p-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Booking Summary</h3>

              {selectedService && (
                <div className="space-y-4">
                  <div className="pb-3 border-b border-white/10">
                    <p className="text-white/40 text-xs mb-1">Selected Service</p>
                    <p className="text-white font-semibold">{selectedService.service_name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-white/60 text-xs flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {selectedService.custom_duration} min
                      </span>
                      <span className="text-[#c9a96e] font-bold">
                        ₹{parseFloat(selectedService.custom_price).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {selectedStaff && (
                    <div className="pb-3 border-b border-white/10">
                      <p className="text-white/40 text-xs mb-1">Selected Staff</p>
                      <p className="text-white font-semibold">{selectedStaff.name}</p>
                      <p className="text-white/40 text-xs">📞 {selectedStaff.phone}</p>
                      {selectedStaff.available && (
                        <span className="text-xs text-green-400 mt-1 inline-block">Available</span>
                      )}
                    </div>
                  )}

                  {selectedDate && selectedTime && (
                    <div className="pb-3 border-b border-white/10">
                      <p className="text-white/40 text-xs mb-1">Appointment Date & Time</p>
                      <p className="text-white font-semibold">
                        {new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-[#c9a96e] text-sm mt-1">
                        {formatTimeForDisplay(selectedTime)} - {formatTimeForDisplay(selectedTime + selectedService.custom_duration)}
                      </p>
                      {selectedTime && selectedService && (
                        <p className="text-white/40 text-xs mt-1">
                          Duration: {selectedService.custom_duration} minutes
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <div className="flex justify-between text-white font-semibold">
                      <span>Total Amount</span>
                      <span className="text-[#c9a96e] text-xl">
                        ₹{selectedService ? parseFloat(selectedService.custom_price).toFixed(0) : "0"}
                      </span>
                    </div>
                    <p className="text-white/40 text-xs mt-2 text-center">
                      Taxes and fees included
                    </p>
                  </div>
                </div>
              )}

              {!selectedService && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-2" />
                  <p className="text-white/40 text-sm">Select a service to see summary</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}