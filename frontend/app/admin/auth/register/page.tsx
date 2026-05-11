"use client";
import React from "react";
import AuthLayout from "../../../../components/auth/AuthLayout";
import AuthForm from "../../../../components/auth/AuthForm";
import { AuthProvider } from "../../../../context/AuthContext";

export default function AdminRegisterPage() {
  return (
    <AuthProvider>
      <AuthLayout role="Admin" title="Create admin account">
        <AuthForm role="Admin" mode="register" />
      </AuthLayout>
    </AuthProvider>
  );
}
