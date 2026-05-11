"use client";
import React from "react";
import AuthLayout from "../../../../components/auth/AuthLayout";
import AuthForm from "../../../../components/auth/AuthForm";
import { AuthProvider } from "../../../../context/AuthContext";

export default function CustomerRegisterPage() {
  return (
    <AuthProvider>
      <AuthLayout role="Customer" title="Create customer account">
        <AuthForm role="Customer" mode="register" />
      </AuthLayout>
    </AuthProvider>
  );
}
