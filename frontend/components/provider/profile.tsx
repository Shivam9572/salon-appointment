"use client";
import { useState, useEffect } from "react";

export interface ProviderProfileType {
  email: string;
  salonName: string;
  salonAddress: string;
  salonContact: string;
  status: string;
  servicesOffered: string;
  role: string;
  longitude: number;
  latitude: number;
  opening_time?: string;  // ✅ add
  closing_time?: string;
}

export default function ProviderProfile({
  data,
  onUpdate,
}: {
  data: ProviderProfileType;
  onUpdate: (data: ProviderProfileType) => void;
  onUnauthorized: () => void;
}) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState<ProviderProfileType>({ ...data });

  useEffect(() => {
    if (data) setForm({ ...data });
  }, [data]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    // sirf wo fields bhejo jo changed hain
    const changed: Partial<ProviderProfileType> = {};

    if (form.salonName !== data.salonName) changed.salonName = form.salonName;
    if (form.salonAddress !== data.salonAddress) changed.salonAddress = form.salonAddress;
    if (form.salonContact !== data.salonContact) changed.salonContact = form.salonContact;
    if (form.servicesOffered !== data.servicesOffered) changed.servicesOffered = form.servicesOffered;
    if (form.opening_time !== data.opening_time) changed.opening_time = form.opening_time;
    if (form.closing_time !== data.closing_time) changed.closing_time = form.closing_time;

    if (Object.keys(changed).length === 0) {
      setEdit(false);
      return; // kuch change nahi hua toh API call mat karo
    }

    onUpdate(changed);
    setEdit(false);
  };

  const handleCancel = () => {
    setForm({ ...data });
    setEdit(false);
  };

  const initials = data.salonName
    ?.split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActive = data.status?.toLowerCase() === "active";
  const isApproved = data.status?.toLowerCase() === "approved";
  const statusGreen = isActive || isApproved;

  return (
    <div className="max-w-2xl mx-auto mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
      style={{
        padding: "1rem",
        marginInline: "auto"
      }}>

      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-5 border-b border-gray-200 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xl font-semibold flex-shrink-0">
          {initials}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{data.salonName}</h2>
          <p className="text-sm text-gray-500">{data.email}</p>
          <div className="flex gap-2 mt-1.5">
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full ${statusGreen
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
                }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${statusGreen ? "bg-green-500" : "bg-red-500"
                  }`}
              />
              {data.status}
            </span>
            <span className="inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
              {data.role}
            </span>
          </div>
        </div>
      </div>

      {/* Fields Section */}
      <div className="px-6 py-5 space-y-4">

        {/* Email — always disabled */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Email{" "}
            <span className="normal-case font-normal text-gray-400">(cannot edit)</span>
          </label>
          <input
            type="email"
            value={form.email}
            disabled
            className="w-full px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
          />
        </div>

        {/* Salon Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Salon Name
          </label>
          {edit ? (
            <input
              type="text"
              name="salonName"
              value={form.salonName}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          ) : (
            <p className="text-sm text-gray-800 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
              {data.salonName || "—"}
            </p>
          )}
        </div>

        {/* Salon Address */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Salon Address
          </label>
          {edit ? (
            <input
              type="text"
              name="salonAddress"
              value={form.salonAddress}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          ) : (
            <p className="text-sm text-gray-800 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
              {data.salonAddress || "—"}
            </p>
          )}
        </div>

        {/* Contact */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Contact
          </label>
          {edit ? (
            <input
              type="text"
              name="salonContact"
              value={form.salonContact}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          ) : (
            <p className="text-sm text-gray-800 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
              {data.salonContact || "—"}
            </p>
          )}
        </div>

        {/* Services Offered */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Services Offered
          </label>
          {edit ? (
            <textarea
              name="servicesOffered"
              value={form.servicesOffered}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. Haircut, Facial, Waxing..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none"
            />
          ) : (
            <p className="text-sm text-gray-800 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 min-h-[44px]">
              {data.servicesOffered || "—"}
            </p>
          )}
        </div>

        {/*openin closing time*/}

        {/* Opening Time */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Opening Time
          </label>
          {edit ? (
            <input
              type="time"
              name="opening_time"
              value={form.opening_time?.slice(0, 5) ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          ) : (
            <p className="text-sm text-gray-800 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
              {data.opening_time?.slice(0, 5) || "—"}
            </p>
          )}
        </div>

        {/* Closing Time */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Closing Time
          </label>
          {edit ? (
            <input
              type="time"
              name="closing_time"
              value={form.closing_time?.slice(0, 5) ?? ""}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          ) : (
            <p className="text-sm text-gray-800 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
              {data.closing_time?.slice(0, 5) || "—"}
            </p>
          )}
        </div>

        {/* Status + Role — view only */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Status
            </label>
            <p className="text-sm text-gray-800 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
              {data.status || "—"}
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Role
            </label>
            <p className="text-sm text-gray-800 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
              {data.role || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
        {!edit ? (
          <button
            onClick={() => setEdit(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}