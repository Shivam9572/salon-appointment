"use client";

// Hero Section Component
import { Provider } from "../lib/type";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  Calendar,
  Star,
  Sparkles,
  ArrowRight,
  Scissors,
  Award,
  Shield,
  Heart
} from "lucide-react";

interface HeroSectionProps {
  onSearchResults?: (providers: Provider[], searchQuery: string,location:string) => void;
  setSearchLoading?: (loading: boolean) => void;
}

export default function HeroSection({ onSearchResults, setSearchLoading }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  
  const [nearbySalons, setNearbySalons] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);

  // Get user's current location


  

  const handleSearch = async () => {
    if (!searchQuery && !location) return;

    if (setSearchLoading) setSearchLoading(true);

    try {
      // Search by keyword
      const searchResponse = await apiFetch(`/customer/providers/search?keyword=${searchQuery}&location=${location || ""}`);
      const searchData = await searchResponse.json();
      
      let searchResults: Provider[] = [];
      if (searchData.success && searchData.providers) {
        searchResults = searchData.providers;
      }

      // If location is provided, also fetch nearby providers
      
      
      // Pass results to parent component
      if (onSearchResults) {
        onSearchResults(searchResults,searchQuery,location);
      }
      
      // Scroll to salons section
      const salonsSection = document.getElementById("salons-section");
      if (salonsSection) {
        salonsSection.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error searching salons:", error);
      if (onSearchResults) {
        onSearchResults([], searchQuery,location);
      }
    } finally {
      if (setSearchLoading) setSearchLoading(false);
    }
  };

  const scrollToServices = () => {
    const servicesSection = document.getElementById("services");
    if (servicesSection) {
      servicesSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#0a0a0f]" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c9a96e]/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#e8c88a]/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#c9a96e]/5 to-transparent rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#c9a96e]/20 to-[#e8c88a]/20 border border-[#c9a96e]/30 mb-6"
            >
              <Sparkles className="w-4 h-4 text-[#c9a96e]" />
              <span className="text-[#c9a96e] text-sm font-medium">Premium Salon Booking</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Book Salon Appointments
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a96e] to-[#e8c88a]">
                {" "}Instantly
              </span>
            </h1>

            <p className="text-white/50 text-lg mb-8 max-w-lg">
              Discover top-rated salons, expert stylists, and premium services at your fingertips. Book appointments in seconds.
            </p>

            {/* Search Bar - Fixed Layout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#12121a]/80 backdrop-blur-xl rounded-2xl border border-white/10 p-3 md:p-2 mb-6"
            >
              <div className="flex flex-col gap-3">
                {/* Row 1: Search and Location */}
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5">
                    <Search className="w-5 h-5 text-[#c9a96e] shrink-0" />
                    <input
                      type="text"
                      placeholder="Search for service or salon..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="bg-transparent text-white placeholder-white/40 focus:outline-none flex-1 min-w-0"
                    />
                  </div>

                  <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5">
                    <MapPin className="w-5 h-5 text-[#c9a96e] shrink-0" />
                    <input
                      type="text"
                      placeholder="Select location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="bg-transparent text-white placeholder-white/40 focus:outline-none flex-1 min-w-0"
                    />
                  </div>
                </div>

                {/* Row 2: Date and Search Button */}
                <div className="flex flex-col md:flex-row gap-2">
                 

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSearch}
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] font-semibold whitespace-nowrap"
                  >
                    Search
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* CTA Buttons - Removed Book Appointment, only Explore Services */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToServices}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] font-semibold flex items-center justify-center gap-2"
              >
                Explore Services
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center gap-6 text-white/40 text-sm">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#c9a96e]" />
                <span>100+ Expert Stylists</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#c9a96e]" />
                <span>Secure Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#c9a96e]" />
                <span>10K+ Happy Customers</span>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Hero Image with Floating Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-amber-500/20">
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent z-10" />
              <Image
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=600&fit=crop"
                alt="Salon Stylist"
                width={600}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            {/* Floating Appointment Card */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.4 }}
              className="absolute top-10 -right-5 md:right-10 bg-[#12121a]/95 backdrop-blur-xl rounded-xl border border-white/10 p-3 shadow-xl z-20"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#c9a96e] to-[#e8c88a] flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-[#0a0a0f]" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Next Appointment</p>
                  <p className="text-white/40 text-xs">Today, 3:00 PM</p>
                </div>
              </div>
            </motion.div>

            {/* Floating Ratings Badge */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-10 -left-5 md:left-10 bg-[#12121a]/95 backdrop-blur-xl rounded-xl border border-white/10 p-3 shadow-xl z-20"
            >
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-[#c9a96e] text-[#c9a96e]" />
                  ))}
                </div>
                <span className="text-white text-sm font-semibold">4.9</span>
                <span className="text-white/40 text-xs">(2.5k reviews)</span>
              </div>
            </motion.div>

            {/* Nearby Salons Mini List */}
            {nearbySalons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-[90%] bg-[#12121a]/95 backdrop-blur-xl rounded-xl border border-white/10 p-3 shadow-xl z-20"
              >
                <p className="text-white/60 text-xs mb-2">Nearby Salons</p>
                <div className="flex gap-2 overflow-x-auto">
                  {nearbySalons.map((salon) => (
                    <div key={salon.id} className="flex-shrink-0 flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5">
                      <MapPin className="w-3 h-3 text-[#c9a96e]" />
                      <span className="text-white text-xs">{salon.salonName}</span>
                      <span className="text-white/40 text-xs">{salon.distance?.toFixed(1)} km</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}