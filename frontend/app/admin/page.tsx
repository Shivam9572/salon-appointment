"use client";
import { useState } from "react";

import AdminLayout from "../../components/admin/layout";
import CategoriesTab from "../../components/admin/Categories";
import ProvidersTab from "../../components/admin/Providers";
import UsersTab from "../../components/admin/Users";

type Tab = "categories" | "providers" | "users";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>("categories");

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "categories" && <CategoriesTab />}
      {activeTab === "providers" && <ProvidersTab />}
      {activeTab === "users" && <UsersTab />}
    </AdminLayout>
  );
}
