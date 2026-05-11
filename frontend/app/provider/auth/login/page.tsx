"use client";
import React from "react";
import AuthLayout from "../../../../components/auth/AuthLayout";
import AuthForm from "../../../../components/auth/AuthForm";
import { AuthProvider } from "../../../../context/AuthContext";

export default function ProviderLoginPage() {
  return (
    <AuthProvider>
      <AuthLayout role="Provider" title="Provider sign in">
        <AuthForm role="Provider" mode="login" />
      </AuthLayout>
    </AuthProvider>
  );
}
