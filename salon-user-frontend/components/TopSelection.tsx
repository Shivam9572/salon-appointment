"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Provider } from "../lib/type";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Search as SearchIcon,
  X
} from "lucide-react";
import { apiFetch } from "../lib/api";

interface TopSalonsSectionProps {
  refreshTrigger?: number;
  selectedCategory?: string | null;
  nearbyProviders?: Provider[];
  isLoading?: boolean;
  searchResults?: Provider[];
  searchQuery?: string;
  searchLocation?: string;
  onClearSearch?: () => void;
}

export default function TopSalonsSection({ 
  refreshTrigger = 0, 
  selectedCategory = null,
  nearbyProviders = [],
  isLoading = false,
  searchResults = [],
  searchQuery = "",
  searchLocation = "",
  onClearSearch
}: TopSalonsSectionProps) {
  const [topSalons, setTopSalons] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"top" | "nearby" | "search">("top");
  const router=useRouter();

  useEffect(() => {
    fetchTopSalons();
  }, [refreshTrigger]);

  // Update active filter when search results come in
  useEffect(() => {
    if (searchResults.length > 0) {
      setActiveFilter("search");
    }
  }, [searchResults]);

  const fetchTopSalons = async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/customer/providers/top");
      const data = await response.json();
      if (data.success && data.providers) {
        setTopSalons(data.providers);
      }
    } catch (error) {
      console.error("Error fetching top salons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filter: "top" | "nearby" | "search") => {
    setActiveFilter(filter);
  };

  const handleClearSearch = () => {
    if (onClearSearch) {
      onClearSearch();
    }
    setActiveFilter("top");
  };

  // Determine which salons to display
  let displaySalons: Provider[] = [];
  let isDisplayLoading = false;

  if (activeFilter === "top") {
    displaySalons = topSalons;
    isDisplayLoading = loading;
  } else if (activeFilter === "nearby") {
    displaySalons = nearbyProviders;
    isDisplayLoading = isLoading;
  } else if (activeFilter === "search") {
    displaySalons = searchResults;
    isDisplayLoading = isLoading;
  }

  // Get title based on active filter
  const getTitle = () => {
    if (activeFilter === "top") return "Top Rated Salons";
    if (activeFilter === "nearby") return "Salons Near You";
    if (activeFilter === "search") return "Search Results";
    return "Salons";
  };

  const getSubtitle = () => {
    if (activeFilter === "top") {
      return "Discover the best salons in your area, rated by thousands of happy customers";
    }
    if (activeFilter === "nearby") {
      return selectedCategory 
        ? `Showing salons offering ${selectedCategory} services near your location`
        : "Showing salons near your current location";
    }
    if (activeFilter === "search") {
      if (searchQuery && searchLocation) {
        return `Showing results for "${searchQuery}" in ${searchLocation}`;
      }
      if (searchQuery) {
        return `Showing results for "${searchQuery}"`;
      }
      if (searchLocation) {
        return `Showing results in ${searchLocation}`;
      }
      return `Showing ${displaySalons.length} salons matching your search`;
    }
    return "";
  };

  return (
    <section id="salons-section" className="py-20 bg-[#0a0a0f] scroll-mt-20">
      <div className="max-w-7xl mx-auto px-5 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {getTitle()}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c9a96e] to-[#e8c88a]">
              {activeFilter === "top" ? " Near You" : ""}
            </span>
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            {getSubtitle()}
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleFilterChange("top")}
            className={`px-6 py-2 rounded-xl font-semibold transition-all ${
              activeFilter === "top"
                ? "bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f]"
                : "bg-white/5 text-white/60 hover:text-white border border-white/10"
            }`}
          >
            Top Rated
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleFilterChange("nearby")}
            className={`px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${
              activeFilter === "nearby"
                ? "bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f]"
                : "bg-white/5 text-white/60 hover:text-white border border-white/10"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Nearby Salons
          </motion.button>
        </div>

        {/* Search Results Badge */}
        {activeFilter === "search" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a96e]/20 border border-[#c9a96e]/30">
              <SearchIcon className="w-4 h-4 text-[#c9a96e]" />
              <span className="text-[#c9a96e] text-sm font-medium">
                {displaySalons.length} results found
              </span>
              <button
                onClick={handleClearSearch}
                className="text-white/50 hover:text-white ml-2"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Selected Category Badge */}
        {activeFilter === "nearby" && selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c9a96e]/20 border border-[#c9a96e]/30">
              <span className="text-[#c9a96e] text-sm font-medium">
                Category: {selectedCategory}
              </span>
            </div>
          </motion.div>
        )}

        {isDisplayLoading ? (
          <div className="flex justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-3 border-[#c9a96e] border-t-transparent rounded-full"
            />
          </div>
        ) : displaySalons.length === 0 ? (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/60">No salons found matching your search</p>
            <button
              onClick={() => handleFilterChange("top")}
              className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] font-semibold"
            >
              View Top Rated Salons
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displaySalons.map((salon, index) => (
              <motion.div
                key={salon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-[#12121a] to-[#1a1a24] rounded-2xl border border-white/10 overflow-hidden hover:border-[#c9a96e]/30 transition-all duration-300"
              >
                <div className="relative h-48 bg-gradient-to-br from-[#c9a96e]/20 to-[#e8c88a]/20">
                  <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <Star className="w-3 h-3 fill-[#c9a96e] text-[#c9a96e]" />
                    <span className="text-white text-xs">
                      {salon.rating || "4.9"}
                    </span>
                  </div>
                  {(activeFilter === "nearby" || activeFilter === "search") && salon.distance && (
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                      <span className="text-[#c9a96e] text-xs">
                        {salon.distance.toFixed(1)} km away
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-white text-xl font-semibold mb-2">
                    {salon.salonName}
                  </h3>
                  <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{salon.salonAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-sm mb-4">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span>
                      {salon.opening_time?.slice(0, 5)} - {salon.closing_time?.slice(0, 5)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#c9a96e]" />
                      <span className="text-white/60 text-xs">{salon.salonContact}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                       onClick={() => router.push(`/book/${salon.id}`)}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] text-sm font-semibold"
                    >
                      Book Now
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}