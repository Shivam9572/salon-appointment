export type Role = "admin" | "provider" | "customer";

export interface Category {
  id: number;
  name: string;
  icon: string;
  serviceCount: number;
}

export interface Service {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  defaultDuration: number; // minutes
  defaultPrice: number;
}

export interface Provider {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
  appointmentsToday: number;
}

export interface Staff {
  id: number;
  providerId: number;
  name: string;
  role: string;
  avatar: string;
  skills: number[]; // service IDs
  isAvailable: boolean;
}

export interface Appointment {
  id: number;
  customerId: number;
  providerId: number;
  staffId: number;
  serviceId: number;
  serviceName: string;
  customerName: string;
  staffName: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: "confirmed" | "pending" | "completed" | "cancelled";
}

export const categories: Category[] = [
  { id: 1, name: "Hair", icon: "✂️", serviceCount: 12 },
  { id: 2, name: "Skin", icon: "✨", serviceCount: 8 },
  { id: 3, name: "Nails", icon: "💅", serviceCount: 6 },
  { id: 4, name: "Makeup", icon: "💄", serviceCount: 5 },
  { id: 5, name: "Massage", icon: "🌿", serviceCount: 7 },
  { id: 6, name: "Eyebrows", icon: "👁️", serviceCount: 4 },
];

export const services: Service[] = [
  { id: 1, categoryId: 1, name: "Classic Haircut", description: "Precision cut tailored to your face shape", defaultDuration: 45, defaultPrice: 850 },
  { id: 2, categoryId: 1, name: "Balayage", description: "Hand-painted highlights for natural sun-kissed look", defaultDuration: 180, defaultPrice: 4500 },
  { id: 3, categoryId: 1, name: "Keratin Treatment", description: "Smooth and frizz-free for 3 months", defaultDuration: 120, defaultPrice: 3200 },
  { id: 4, categoryId: 1, name: "Hair Coloring", description: "Full head color with premium products", defaultDuration: 90, defaultPrice: 2200 },
  { id: 5, categoryId: 2, name: "Hydra Facial", description: "Deep cleansing and hydration infusion", defaultDuration: 60, defaultPrice: 2500 },
  { id: 6, categoryId: 2, name: "Chemical Peel", description: "Resurface and renew with AHA/BHA", defaultDuration: 45, defaultPrice: 1800 },
  { id: 7, categoryId: 3, name: "Gel Manicure", description: "Long-lasting gel polish with nail art options", defaultDuration: 60, defaultPrice: 800 },
  { id: 8, categoryId: 3, name: "Pedicure Deluxe", description: "Foot spa, scrub, and polish treatment", defaultDuration: 75, defaultPrice: 1200 },
  { id: 9, categoryId: 4, name: "Bridal Makeup", description: "Full glam for your special day", defaultDuration: 120, defaultPrice: 5500 },
  { id: 10, categoryId: 5, name: "Swedish Massage", description: "Full body relaxation massage", defaultDuration: 60, defaultPrice: 1500 },
  { id: 11, categoryId: 6, name: "Eyebrow Threading", description: "Precise shaping with thread technique", defaultDuration: 20, defaultPrice: 350 },
  { id: 12, categoryId: 6, name: "Lash Extensions", description: "Volume lash set for stunning eyes", defaultDuration: 90, defaultPrice: 2800 },
];

export const providers: Provider[] = [
  {
    id: 1,
    name: "Aura Beauty Studio",
    email: "hello@aurabeauty.in",
    phone: "+91 98765 43210",
    avatar: "AB",
    specialties: ["Hair", "Skin", "Makeup"],
    rating: 4.8,
    reviewCount: 312,
    appointmentsToday: 11,
  },
  {
    id: 2,
    name: "Bliss Wellness Spa",
    email: "bookings@blissspa.in",
    phone: "+91 98123 45678",
    avatar: "BW",
    specialties: ["Massage", "Skin"],
    rating: 4.9,
    reviewCount: 187,
    appointmentsToday: 7,
  },
  {
    id: 3,
    name: "Glamour Lane",
    email: "glam@glamourlane.in",
    phone: "+91 97654 32100",
    avatar: "GL",
    specialties: ["Nails", "Makeup", "Eyebrows"],
    rating: 4.7,
    reviewCount: 241,
    appointmentsToday: 9,
  },
];

export const staff: Staff[] = [
  { id: 1, providerId: 1, name: "Priya Sharma", role: "Senior Stylist", avatar: "PS", skills: [1, 2, 3, 4], isAvailable: true },
  { id: 2, providerId: 1, name: "Kavya Reddy", role: "Skin Specialist", avatar: "KR", skills: [5, 6], isAvailable: true },
  { id: 3, providerId: 1, name: "Ananya Singh", role: "Makeup Artist", avatar: "AS", skills: [9], isAvailable: false },
  { id: 4, providerId: 2, name: "Rohan Mehta", role: "Massage Therapist", avatar: "RM", skills: [10], isAvailable: true },
  { id: 5, providerId: 3, name: "Divya Patel", role: "Nail Technician", avatar: "DP", skills: [7, 8], isAvailable: true },
];

export const appointments: Appointment[] = [
  { id: 1, customerId: 1, providerId: 1, staffId: 1, serviceId: 2, serviceName: "Balayage", customerName: "Meera Joshi", staffName: "Priya Sharma", date: "2026-05-04", time: "10:00", duration: 180, price: 4500, status: "confirmed" },
  { id: 2, customerId: 2, providerId: 1, staffId: 2, serviceId: 5, serviceName: "Hydra Facial", customerName: "Sneha Kulkarni", staffName: "Kavya Reddy", date: "2026-05-04", time: "11:30", duration: 60, price: 2500, status: "confirmed" },
  { id: 3, customerId: 3, providerId: 1, staffId: 1, serviceId: 1, serviceName: "Classic Haircut", customerName: "Ritu Verma", staffName: "Priya Sharma", date: "2026-05-04", time: "14:00", duration: 45, price: 850, status: "pending" },
  { id: 4, customerId: 4, providerId: 1, staffId: 2, serviceId: 6, serviceName: "Chemical Peel", customerName: "Pooja Nair", staffName: "Kavya Reddy", date: "2026-05-04", time: "15:00", duration: 45, price: 1800, status: "confirmed" },
  { id: 5, customerId: 5, providerId: 1, staffId: 3, serviceId: 9, serviceName: "Bridal Makeup", customerName: "Anjali Desai", staffName: "Ananya Singh", date: "2026-05-05", time: "09:00", duration: 120, price: 5500, status: "confirmed" },
  { id: 6, customerId: 6, providerId: 1, staffId: 1, serviceId: 3, serviceName: "Keratin Treatment", customerName: "Sunita Rao", staffName: "Priya Sharma", date: "2026-05-03", time: "10:30", duration: 120, price: 3200, status: "completed" },
];

export const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00"
];

export const stats = {
  totalAppointmentsToday: 11,
  totalRevenue: 48500,
  newCustomers: 4,
  avgRating: 4.8,
  upcomingAppointments: 5,
  completedThisMonth: 187,
};
