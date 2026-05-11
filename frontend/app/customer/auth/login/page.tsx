"use client";
import React from "react";
import AuthLayout from "../../../../components/auth/AuthLayout";
import AuthForm from "../../../../components/auth/AuthForm";
import { AuthProvider } from "../../../../context/AuthContext";

export default function CustomerLoginPage() {
  return (
    <AuthProvider>
      <AuthLayout role="Customer" title="Customer sign in">
        <AuthForm role="Customer" mode="login" />
      </AuthLayout>
    </AuthProvider>
  );
}
