"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire up to auth API
    console.log("Login:", { email, password, remember });
  };
  {/*Adding comments for clarity*/}
  return (
    <div className="min-h-screen flex">

      {/* Left — hero image panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-800">
        <img
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=80"
          alt="A warm, harmonious living room"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Top logo */}
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 z-10">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-lg">home</span>
            </div>
            <span className="text-white font-extrabold text-lg font-headline">DivItUp</span>
        </Link>
        
        {/* Bottom text card */}
        <div className="absolute bottom-10 left-8 right-8 z-10">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-3xl font-extrabold text-white font-headline mb-3 leading-tight">
              A more harmonious way<br />to live together.
            </h2>
            <p className="text-white/80 font-medium text-sm leading-relaxed">
              Organize your home life with ease. From shared chores to
              household finances, DivItUp keeps your sanctuary in sync.
            </p>
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">home</span>
          </div>
          <span className="text-on-surface font-extrabold text-lg font-headline">DivItUp</span>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-4xl font-extrabold text-on-surface font-headline mb-2">
            Welcome Home
          </h1>
          <p className="text-outline font-medium mb-8">
            Please enter your details to access your sanctuary.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-bold text-on-surface block mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-base">
                  mail
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@household.com"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-11 pr-4 py-3.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-on-surface">Password</label>
                <button
                  type="button"
                  className="text-sm font-bold text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-base">
                  lock
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-11 pr-12 py-3.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <span className="material-symbols-outlined text-outline text-base">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRemember(!remember)}
                className={`w-10 h-6 rounded-full transition-all flex items-center px-1 ${
                  remember ? "bg-primary" : "bg-outline-variant"
                }`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  remember ? "translate-x-4" : "translate-x-0"
                }`} />
              </button>
              <span className="text-sm text-outline font-medium">Remember me for 30 days</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Log In
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </form>

          {/* Sign up link */}
          <p className="text-center text-sm text-outline mt-8">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-bold text-primary hover:underline">
              Join your household
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-outline uppercase tracking-widest mt-12">
          © 2024 DivItUp • Privacy • Terms
        </p>
      </div>
    </div>
  );
}
