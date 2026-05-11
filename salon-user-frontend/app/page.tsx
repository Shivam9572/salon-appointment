// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import HeroSection from "../components/HeroSection";
import ServicesSection from "../components/ServiceSection";
import TopSalonsSection from "../components/TopSelection";
import WhyChooseUs from "../components/WhyChooseMe";
import { Provider } from "@/lib/type";



export default function HomePage() {
  const [nearbyProviders, setNearbyProviders] = useState<Provider[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [searchResults, setSearchResults] = useState<Provider[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [nearMeTrigger, setNearMeTrigger] = useState(0);

  const handleBookNow = (categoryName: string, providers: Provider[]) => {
    setSelectedCategory(categoryName);
    setNearbyProviders(providers);
  };

  const handleSearchResults = (providers: Provider[], query: string, location: string) => {
    setSearchResults(providers);
    setSearchQuery(query);
    setSearchLocation(location);
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setSearchQuery("");
    setSearchLocation("");
  };

  const handleNearMe = async () => {
    setNearMeTrigger(prev => prev + 1);
  };

  // This effect will be triggered from layout
  useEffect(() => {
    const handleNearMeFromNav = () => {
      // Get user location and fetch nearby salons
      if (navigator.geolocation) {
        setIsLoadingNearby(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const { apiFetch } = await import("../lib/api");
              const response = await apiFetch(
                `/customer/providers/nearby?latitude=${latitude}&longitude=${longitude}`
              );
              const data = await response.json();
              if (data.success && data.providers) {
                setNearbyProviders(data.providers);
                setSearchResults([]); // Clear search results
                setSelectedCategory(null);
              }
            } catch (error) {
              console.error("Error fetching nearby salons:", error);
            } finally {
              setIsLoadingNearby(false);
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            setIsLoadingNearby(false);
          }
        );
      }
    };

    // Listen for custom event from Navbar
    window.addEventListener("nearMeClick", handleNearMeFromNav);
    return () => window.removeEventListener("nearMeClick", handleNearMeFromNav);
  }, []);

  return (
    <main className="bg-[#0a0a0f] min-h-screen">
      <div className="pt-[72px]">
        <HeroSection 
          onSearchResults={handleSearchResults}
          setSearchLoading={setIsSearchLoading}
        />
        <ServicesSection 
          onBookNow={handleBookNow}
          setNearbyProviders={setNearbyProviders}
          setSelectedCategory={setSelectedCategory}
          setIsLoading={setIsLoadingNearby}
        />
        <TopSalonsSection 
          refreshTrigger={nearMeTrigger}
          selectedCategory={selectedCategory}
          nearbyProviders={nearbyProviders}
          isLoading={isLoadingNearby}
          searchResults={searchResults}
          searchQuery={searchQuery}
          searchLocation={searchLocation}
          onClearSearch={handleClearSearch}
        />
        <WhyChooseUs />
      </div>
    </main>
  );
}