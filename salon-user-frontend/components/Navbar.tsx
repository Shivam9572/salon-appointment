// components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Menu, X, Sparkles, User, LogOut, LogIn, UserPlus, ChevronDown, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import { useNearMe } from "../context/NearMeContext";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Near Me", href: "#nearby", action: "nearby" },
];



export default function Navbar() {
  const { 
    isLoggedIn, 
    user, 
    login, 
    initiateRegistration, 
    verifyOtp, 
    logout, 
    loading: authLoading, 
    otpLoading,
    registrationData,
    clearRegistrationData
  } = useAuth();
  
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
const { handleNearMeClick } = useNearMe();
  
  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showUserMenu && !(e.target as Element).closest(".user-menu-container")) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showUserMenu]);

  const handleNearMe = (e: React.MouseEvent) => {
    e.preventDefault();
    if (handleNearMeClick) {
       handleNearMeClick ();
    }
    // Scroll to salons section
    const salonsSection = document.getElementById("salons-section");
    if (salonsSection) {
      salonsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const result = await login(loginEmail, loginPassword);
    
    if (result.success) {
      setShowAuthModal(false);
      setLoginEmail("");
      setLoginPassword("");
    } else {
      setError(result.message || "Login failed. Please try again.");
    }
    setLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (registerPassword !== registerConfirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    
    const result = await initiateRegistration(registerName, registerEmail, registerPassword);
    
    if (result.success && result.otpSent) {
      setShowOtpModal(true);
      setError("");
      setRegisterName("");
      setRegisterEmail("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
    } else {
      setError(result.message || "Registration failed. Please try again.");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const otpString = otpCode.join("");
    if (otpString.length !== 6) {
      setError("Please enter the 6-digit OTP");
      setLoading(false);
      return;
    }
    
    const result = await verifyOtp(registerEmail || registrationData?.email || "", otpString);
    
    if (result.success) {
      setShowOtpModal(false);
      setOtpCode(["", "", "", "", "", ""]);
      setShowAuthModal(true);
    } else {
      setError(result.message || "Invalid OTP. Please try again.");
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    setError("");
    
    const email = registerEmail || registrationData?.email || "";
    if (!email) {
      setError("Email not found. Please restart registration.");
      setLoading(false);
      return;
    }
    
    const result = await initiateRegistration(
      registrationData?.name || registerName, 
      email, 
      registrationData?.password || registerPassword
    );
    
    if (result.success) {
      setResendCooldown(60);
      setError("");
    } else {
      setError(result.message || "Failed to resend OTP");
    }
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    setError("");
    setLoginEmail("");
    setLoginPassword("");
    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setRegisterConfirmPassword("");
  };

  const closeOtpModal = () => {
    setShowOtpModal(false);
    setOtpCode(["", "", "", "", "", ""]);
    setError("");
    clearRegistrationData();
  };

  if (authLoading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-2xl border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#e8c88a] flex items-center justify-center">
              <Scissors className="w-4.5 h-4.5 text-[#0a0a0f]" />
            </div>
            <span className="text-white font-semibold text-lg">Apna<span className="text-[#c9a96e]">Salon</span></span>
          </div>
          <div className="w-20 h-8 rounded-xl bg-white/5 animate-pulse"></div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-2xl bg-[#0a0a0f]/80 border-b border-white/[0.06] shadow-2xl shadow-black/40"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-[72px] flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#e8c88a] flex items-center justify-center shadow-lg shadow-amber-500/20 transition-transform duration-200"
            >
              <Scissors className="w-4.5 h-4.5 text-[#0a0a0f]" strokeWidth={2.5} />
            </motion.div>
            <span className="text-white font-semibold text-lg tracking-tight">
              Apna<span className="text-[#c9a96e]">Salon</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.label === "Near Me" ? (
                <button
                  key={link.label}
                  onClick={handleNearMe}
                  className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-200 hover:text-[#c9a96e]"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-white/60 hover:text-white text-sm font-medium transition-colors duration-200 hover:text-[#c9a96e]"
                >
                  {link.label}
                </Link>
              )
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative user-menu-container">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-[#c9a96e]/40 transition-all duration-200"
                >
                  <motion.div 
                    whileHover={{ rotate: 5 }}
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-[#c9a96e] to-[#e8c88a] flex items-center justify-center"
                  >
                    <User className="w-3.5 h-3.5 text-[#0a0a0f]" />
                  </motion.div>
                  <span className="text-white/80 text-sm font-medium">
                    {user?.name?.split(" ")[0] || "User"}
                  </span>
                  <motion.div animate={{ rotate: showUserMenu ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-3.5 h-3.5 text-white/50" />
                  </motion.div>
                </motion.button>
                
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 rounded-xl bg-[#12121a]/95 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden"
                    >
                      <div className="py-2">
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="px-4 py-3 border-b border-white/10"
                        >
                          <p className="text-white/90 text-sm font-medium">{user?.name}</p>
                          <p className="text-white/40 text-xs truncate">{user?.email}</p>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 }}
                        >
                          <Link
                            href="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-white/70 hover:text-white hover:bg-white/5 text-sm transition-colors"
                          >
                            <User className="w-3.5 h-3.5" />
                            My Profile
                          </Link>
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 }}
                        >
                          <button
                            onClick={logout}
                            className="flex items-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full text-sm transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Logout
                          </button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsLoginMode(true);
                    setShowAuthModal(true);
                    setError("");
                  }}
                  className="px-4 py-2 rounded-xl text-white/70 hover:text-white text-sm font-medium transition-all duration-200 hover:bg-white/5"
                >
                  Login
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsLoginMode(false);
                    setShowAuthModal(true);
                    setError("");
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-200"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Sign Up
                </motion.button>
              </>
            )}
            <Link
              href="/book"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Book Now
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-white/20 transition-all"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={menuOpen ? "close" : "menu"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden backdrop-blur-2xl bg-[#0a0a0f]/95 border-t border-white/[0.06]"
            >
              <div className="px-5 py-6 flex flex-col gap-4">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {link.label === "Near Me" ? (
                      <button
                        onClick={(e) => {
                          handleNearMeClick(e);
                          setMenuOpen(false);
                        }}
                        className="text-white/70 hover:text-[#c9a96e] text-base font-medium block transition-colors w-full text-left"
                      >
                        {link.label}
                      </button>
                    ) : (
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="text-white/70 hover:text-[#c9a96e] text-base font-medium block transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </motion.div>
                ))}
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="pt-2 border-t border-white/10"
                >
                  {isLoggedIn ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 px-2 py-2 bg-white/5 rounded-xl">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c9a96e] to-[#e8c88a] flex items-center justify-center">
                          <User className="w-4 h-4 text-[#0a0a0f]" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{user?.name}</p>
                          <p className="text-white/40 text-xs">{user?.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                        }}
                        className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl border border-red-500/30 text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-all"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          setIsLoginMode(true);
                          setShowAuthModal(true);
                          setMenuOpen(false);
                        }}
                        className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/5 transition-all"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        Login
                      </button>
                      <button
                        onClick={() => {
                          setIsLoginMode(false);
                          setShowAuthModal(true);
                          setMenuOpen(false);
                        }}
                        className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] text-sm font-semibold"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        Sign Up
                      </button>
                    </div>
                  )}
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Link
                    href="/book"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-center gap-2 mt-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] text-sm font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Book Appointment
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Auth Modal (Login/Register) */}
      <AnimatePresence>
        {showAuthModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeAuthModal}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="mx-4 rounded-2xl bg-[#12121a] border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                      {isLoginMode ? "Welcome Back" : "Create Account"}
                    </h2>
                    <button
                      onClick={closeAuthModal}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="space-y-4">
                    {!isLoginMode && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <label className="block text-white/60 text-sm mb-1.5">Full Name</label>
                        <input
                          type="text"
                          value={registerName}
                          onChange={(e) => setRegisterName(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a96e]/50 transition-colors"
                          placeholder="John Doe"
                          required
                        />
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <label className="block text-white/60 text-sm mb-1.5">Email</label>
                      <input
                        type="email"
                        value={isLoginMode ? loginEmail : registerEmail}
                        onChange={(e) => isLoginMode ? setLoginEmail(e.target.value) : setRegisterEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a96e]/50 transition-colors"
                        placeholder="you@example.com"
                        required
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="block text-white/60 text-sm mb-1.5">Password</label>
                      <input
                        type="password"
                        value={isLoginMode ? loginPassword : registerPassword}
                        onChange={(e) => isLoginMode ? setLoginPassword(e.target.value) : setRegisterPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a96e]/50 transition-colors"
                        placeholder="••••••••"
                        required
                      />
                    </motion.div>

                    {!isLoginMode && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <label className="block text-white/60 text-sm mb-1.5">Confirm Password</label>
                        <input
                          type="password"
                          value={registerConfirmPassword}
                          onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a96e]/50 transition-colors"
                          placeholder="••••••••"
                          required
                        />
                      </motion.div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading || otpLoading}
                      className="w-full mt-6 py-3 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading || otpLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-[#0a0a0f] border-t-transparent rounded-full mx-auto"
                        />
                      ) : (
                        isLoginMode ? "Login" : "Continue"
                      )}
                    </motion.button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => {
                        setIsLoginMode(!isLoginMode);
                        setError("");
                      }}
                      className="text-white/50 hover:text-[#c9a96e] text-sm transition-colors"
                    >
                      {isLoginMode ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* OTP Verification Modal */}
      <AnimatePresence>
        {showOtpModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOtpModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
            >
              <div className="mx-4 rounded-2xl bg-[#12121a] border border-white/10 shadow-2xl overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={closeOtpModal}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-white">Verify Email</h2>
                    <button
                      onClick={closeOtpModal}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#c9a96e]/20 to-[#e8c88a]/20 flex items-center justify-center">
                      <Mail className="w-8 h-8 text-[#c9a96e]" />
                    </div>
                    <p className="text-white/60 text-sm">
                      We've sent a 6-digit verification code to
                    </p>
                    <p className="text-white font-medium mt-1">
                      {registerEmail || registrationData?.email}
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                    >
                      {error}
                    </motion.div>
                  )}

                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="flex justify-center gap-3">
                      {otpCode.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-input-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleKeyDown(index, e)}
                          className="w-12 h-12 text-center text-xl font-bold rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#c9a96e]/50 focus:ring-1 focus:ring-[#c9a96e]/50 transition-all"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="submit"
                      disabled={loading || otpLoading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#e8c88a] text-[#0a0a0f] font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading || otpLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-[#0a0a0f] border-t-transparent rounded-full mx-auto"
                        />
                      ) : (
                        "Verify & Register"
                      )}
                    </motion.button>
                  </form>

                  <div className="mt-6 text-center">
                    <p className="text-white/40 text-sm">
                      Didn't receive the code?{" "}
                      <button
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0}
                        className="text-[#c9a96e] hover:text-[#e8c88a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}