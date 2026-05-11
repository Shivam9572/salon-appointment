"use client";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});


function ChangeView({ center }: any) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center]);
  return null;
}

function LocationMarker({ setCoords, setAddress, coords }: any) {
  const [position, setPosition] = useState<any>(coords);

  useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      setCoords({ lat, lng });

      // reverse geocoding
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      setAddress(data.display_name);
    },
  });

  return position ? <Marker position={position} /> : null;
}

export default function MapModal({
  onClose,
  onSelect,
  initialCoords,
}: {
  onClose: () => void;
  onSelect: (data: any) => void;
  initialCoords?: { lat: number; lng: number };
}) {
  const defaultCenter = initialCoords || { lat: 20.5937, lng: 78.9629 }; // India

  const [search, setSearch] = useState("");
  const [coords, setCoords] = useState<any>(initialCoords || null);
  const [address, setAddress] = useState("");

  // 🔍 Search
  async function handleSearch() {
    if (!search) return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${search}`
    );
    const data = await res.json();

    if (data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);

      setCoords({ lat, lng: lon });
      setAddress(data[0].display_name);
    } else {
      alert("Location not found");
    }
  }

  function handleSave() {
    if (!coords) return alert("Select location");

    onSelect({
      latitude: coords.lat,
      longitude: coords.lng,
      address,
    });

    onClose();
  }

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>Select Location</h3>

        {/* 🔍 Search */}
        <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search location..."
            style={{ flex: 1, padding: 8 }}
          />
          <button onClick={handleSearch}>Search</button>
        </div>

        {/* 🗺️ Map */}
        <MapContainer
          center={[defaultCenter.lat, defaultCenter.lng]}
          zoom={coords ? 13 : 5}
          style={{ height: 300, width: "100%" }}
        >
          <ChangeView
            center={
              coords
                ? [coords.lat, coords.lng]
                : [defaultCenter.lat, defaultCenter.lng]
            }
          />

          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          <LocationMarker
            coords={coords}
            setCoords={setCoords}
            setAddress={setAddress}
          />
        </MapContainer>

        {/* 📍 Info */}
        <p><b>Lat:</b> {coords?.lat}</p>
        <p><b>Lng:</b> {coords?.lng}</p>
        <p><b>Address:</b> {address}</p>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSave}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const overlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "white",
  padding: 20,
  borderRadius: 10,
  width: 500,
};