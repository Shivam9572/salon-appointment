"use client";
import React from "react";
import AuthLayout from "../../../../components/auth/AuthLayout";
import AuthForm from "../../../../components/auth/AuthForm";
import { AuthProvider } from "../../../../context/AuthContext";

export default function ProviderRegisterPage() {
  return (
    <AuthProvider>
      <AuthLayout role="Provider" title="Create provider account">
        <AuthForm role="Provider" mode="register" />
      </AuthLayout>
    </AuthProvider>
  );
}
