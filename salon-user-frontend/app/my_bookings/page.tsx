// app/my-bookings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Scissors,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  ArrowLeft,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { apiFetch } from "../../lib/api";
import Link from "next/link";

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
  Provider: {
    id: string;
    salonName: string;
    salonAddress: string;
    salonContact: string;
  };
  Service: {
    id: string;
    name: string;
    price: string;
    duration: number;
  };
  Staff: {
    id: string;
    name: string;
    phone: string;
  };
  Chair?: {
    id: string;
    name: string;
  };
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { isLoggedIn, user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/");
      return;
    }
    fetchAppointments();
  }, [isLoggedIn, currentPage]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/appointments?page=${currentPage}&limit=10`);
      const data = await response.json();

      if (data.success) {
        setAppointments(data.appointments);
        setPagination(data.pagination);
      } else {
        setError(data.message || "Failed to fetch appointments");
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const response = await apiFetch(`/appointment/${appointmentId}/cancel`, {
        method: "PUT",
      });
      const data = await response.json();

      if (data.success) {
        alert("Appointment cancelled successfully");
        fetchAppointments();
      } else {
        alert(data.message || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleReschedule = (appointmentId: string) => {
    router.push(`/reschedule/${appointmentId}`);
  };

  const viewDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-white/10 text-white/60 border-white/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <ClockIcon className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-[72px] pb-12">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-[#c9a96e] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white">My Bookings</h1>
          <p className="text-white/60 mt-2">View and manage your appointments</p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-3 border-[#c9a96e] border-t-transparent rounded-full"
            />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Bookings</h3>
            <p className="text-white/60 mb-6">{error}</p>
            <button
              onClick={fetchAppointments}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Calendar className="w-20 h-20 text-white/20 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Bookings Yet</h3>
            <p className="text-white/60 mb-6">You haven't made any appointments yet</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] font-semibold"
            >
              Browse Salons
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Appointments List */}
            <div className="space-y-4">
              {appointments.map((appointment, index) => (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-[#12121a] to-[#1a1a24] rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left Section - Salon Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c9a96e]/20 to-[#e8c88a]/20 flex items-center justify-center shrink-0">
                          <Scissors className="w-6 h-6 text-[#c9a96e]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-2">
                            <h3 className="text-lg font-semibold text-white">
                              {appointment.Provider.salonName}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(appointment.status)}`}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(appointment.status)}
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                            </span>
                          </div>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2 text-white/60">
                              <CalendarIcon className="w-3.5 h-3.5" />
                              <span>{formatDate(appointment.start_time)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                              <Clock className="w-3.5 h-3.5" />
                              <span>
                                {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                              </span>
                              <span className="text-white/40">
                                ({appointment.Service.duration} min)
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{appointment.Provider.salonAddress}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Center Section - Service & Staff */}
                    <div className="flex flex-col sm:flex-row gap-4 px-0 lg:px-6 py-4 lg:py-0 border-y lg:border-y-0 border-white/10">
                      <div>
                        <p className="text-white/40 text-xs mb-1">Service</p>
                        <p className="text-white font-medium">{appointment.Service.name}</p>
                        <p className="text-[#c9a96e] text-sm">₹{parseFloat(appointment.Service.price).toFixed(0)}</p>
                      </div>
                      <div>
                        <p className="text-white/40 text-xs mb-1">Stylist</p>
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-[#c9a96e]" />
                          <p className="text-white font-medium">{appointment.Staff.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Actions */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => viewDetails(appointment)}
                        className="px-4 py-2 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all text-sm"
                      >
                        View Details
                      </button>
                      {appointment.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => handleReschedule(appointment.id)}
                            className="px-4 py-2 rounded-xl border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e]/10 transition-all text-sm"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="px-4 py-2 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 mx-auto" />
                </button>
                
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl transition-all ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] font-semibold"
                            : "border border-white/20 text-white hover:bg-white/5"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={currentPage === pagination.totalPages}
                  className="w-10 h-10 rounded-xl border border-white/20 text-white hover:bg-white/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 mx-auto" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedAppointment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-2xl w-full bg-gradient-to-br from-[#12121a] to-[#1a1a24] rounded-2xl border border-white/10 p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-white">Appointment Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Salon Info */}
                <div className="pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Scissors className="w-5 h-5 text-[#c9a96e]" />
                    <h3 className="text-xl font-semibold text-white">
                      {selectedAppointment.Provider.salonName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm ml-8">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{selectedAppointment.Provider.salonAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60 text-sm ml-8 mt-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{selectedAppointment.Provider.salonContact}</span>
                  </div>
                </div>

                {/* Appointment Info */}
                <div className="grid md:grid-cols-2 gap-4 pb-4 border-b border-white/10">
                  <div>
                    <p className="text-white/40 text-xs mb-1">Date & Time</p>
                    <p className="text-white font-medium">
                      {formatDate(selectedAppointment.start_time)}
                    </p>
                    <p className="text-[#c9a96e] text-sm">
                      {formatTime(selectedAppointment.start_time)} - {formatTime(selectedAppointment.end_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs mb-1">Status</p>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(selectedAppointment.status)}`}>
                      {getStatusIcon(selectedAppointment.status)}
                      {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Service Details */}
                <div className="pb-4 border-b border-white/10">
                  <p className="text-white/40 text-xs mb-2">Service Details</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-medium">{selectedAppointment.Service.name}</p>
                      <p className="text-white/60 text-sm">Duration: {selectedAppointment.Service.duration} minutes</p>
                    </div>
                    <p className="text-[#c9a96e] text-xl font-bold">
                      ₹{parseFloat(selectedAppointment.Service.price).toFixed(0)}
                    </p>
                  </div>
                </div>

                {/* Staff Info */}
                <div className="pb-4 border-b border-white/10">
                  <p className="text-white/40 text-xs mb-2">Stylist</p>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#c9a96e]" />
                    <div>
                      <p className="text-white font-medium">{selectedAppointment.Staff.name}</p>
                      <p className="text-white/60 text-sm">{selectedAppointment.Staff.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Info */}
                <div>
                  <p className="text-white/40 text-xs mb-2">Booking Information</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-white/60">
                      <span className="text-white/40">Booked on:</span> {new Date(selectedAppointment.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-white/60">
                      <span className="text-white/40">Booking ID:</span> {selectedAppointment.id}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedAppointment.status === "confirmed" && (
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleReschedule(selectedAppointment.id);
                      }}
                      className="flex-1 px-4 py-2 rounded-xl border border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e]/10 transition-all"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleCancelAppointment(selectedAppointment.id);
                      }}
                      className="flex-1 px-4 py-2 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      Cancel Appointment
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}