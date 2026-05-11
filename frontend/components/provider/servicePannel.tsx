"use client";
import React, { useState } from "react";
import { apiFetch } from "@/lib/api";
import AddServiceModal from "./AddServiceModal";

export interface Service {
    id: string;
    categoryName: string;
    serviceName: string;
    price: string;
    duration: number;
    description: string;
    staffName: string;
    staffPhone: string;
}

interface ServicePanelProps {
    services: Service[];
    onService: (service: Service) => void;
    categories: Array<{ id: number; name: string }>;
    staff: Array<{ id: string; name: string, phone: string }>;
    onUnauthorized: () => void;
    onDelete:(id:string)=>void
}


export default function ServicePanel({
    services, onService, categories, staff, onUnauthorized,onDelete
}: ServicePanelProps) {
    const [serviceModel, setServiceModel] = useState(false);
    function onClose() {
        setServiceModel(false);
    }

    async function handleDelete(id: string) {
        const confirmDelete = confirm("Are you sure you want to delete this service?");
        if (!confirmDelete) return;
            
        onDelete(id);
            

       
    }

    return (

        <div>
            {
                (serviceModel && <AddServiceModal onClose={onClose} category={categories} staff={staff} onUnauthorized={onUnauthorized} onService={onService} />)
            }

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>

                <h2 style={{ marginBottom: 16 }}>Services</h2>
                <button
                    onClick={() => setServiceModel(true)}
                    style={{
                        background: "var(--gold, #f59e0b)", border: "none",
                        padding: "7px 14px", borderRadius: 8,
                        fontWeight: 600, fontSize: 13, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                    }}
                >
                    <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Service
                </button> </div>
            {services.length === 0 ? (
                <p>No services added yet.</p>
            ) : (
                <div style={{ display: "grid", gap: 12, maxHeight: 360, overflowY: "auto" }}>
                    {services.map((s) => (
                        <div
                            key={s.id}
                            style={{
                                border: "1px solid #e5e7eb",
                                borderRadius: 12,
                                padding: 16,
                                position: "relative",
                                background: "#fff",
                            }}
                        >
                            {/* Delete Button */}
                            <button
                                onClick={() => handleDelete(s.id)}
                                style={{
                                    position: "absolute",
                                    top: 10,
                                    right: 10,
                                    border: "none",
                                    background: "#fee2e2",
                                    color: "#dc2626",
                                    borderRadius: "50%",
                                    width: 32,
                                    height: 32,
                                    cursor: "pointer",
                                    fontSize: 16,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#fecaca")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "#fee2e2")}
                            >
                                🗑
                            </button>

                            <h3 style={{ margin: 0 }}>{s.serviceName}</h3>

                            <p><b>Category:</b> {s.categoryName}</p>
                            <p><b>Price:</b> ₹{s.price}</p>
                            <p><b>Duration:</b> {s.duration} min</p>
                            <p><b>Description:</b> {s.description}</p>

                            <hr />

                            <p><b>Staff:</b> {s.staffName}</p>
                            <p><b>Phone:</b> {s.staffPhone}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}