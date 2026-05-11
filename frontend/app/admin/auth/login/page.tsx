"use client";
import React from "react";
import AuthLayout from "../../../../components/auth/AuthLayout";
import AuthForm from "../../../../components/auth/AuthForm";
import { AuthProvider } from "../../../../context/AuthContext";

export default function AdminLoginPage() {
  return (
    <AuthProvider>
      <AuthLayout role="Admin" title="Admin sign in">
        <AuthForm role="Admin" mode="login" />
      </AuthLayout>
    </AuthProvider>
  );
}
