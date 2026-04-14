"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [householdName, setHouseholdName] = useState("");
  const [groupSize, setGroupSize] = useState("");

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const passwordsMismatch = password && confirmPassword && password !== confirmPassword;

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordsMismatch) return;
    // TODO: wire up to auth API
    console.log("Signup:", { firstName, lastName, email, password, householdName, groupSize });
  };

  return (
    <div className="min-h-screen flex">

      {/* Left — hero image panel */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-800">
        <img
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&auto=format&fit=crop&q=80"
          alt="A bright modern kitchen shared by housemates"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Top logo */}
        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 z-10">
            <img
                src="/DivItUpLogo.png"
                alt="DivItUp"
                className="w-24 object-contain"
            />
        </Link>

        {/* Bottom text card */}
        <div className="absolute bottom-10 left-8 right-8 z-10">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h2 className="text-3xl font-extrabold text-white font-headline mb-3 leading-tight">
              Set up your household<br />in minutes.
            </h2>
            <p className="text-white/80 font-medium text-sm leading-relaxed">
              Create your household, invite your roommates, and start
              splitting expenses and chores fairly from day one.
            </p>
          </div>
        </div>
      </div>

      {/* Right — signup form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20 bg-white overflow-y-auto py-10">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-lg">home</span>
          </div>
          <span className="text-on-surface font-extrabold text-lg font-headline">DivItUp</span>
        </div>

        <div className="max-w-sm w-full mx-auto">
          <h1 className="text-4xl font-extrabold text-on-surface font-headline mb-2">
            Join Your Household
          </h1>
          <p className="text-outline font-medium mb-8">
            Create your account and set up your shared home.
          </p>

          <form onSubmit={handleSignup} className="space-y-5">

            {/* First + Last name */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-bold text-on-surface block mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Alex"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-on-surface block mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Rivera"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

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
              <label className="text-sm font-bold text-on-surface block mb-2">
                Password
              </label>
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

            {/* Confirm password */}
            <div>
              <label className="text-sm font-bold text-on-surface block mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-base">
                  lock
                </span>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`w-full bg-surface-container-low border rounded-xl pl-11 pr-12 py-3.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 transition-all ${
                    passwordsMismatch
                      ? "border-error focus:ring-error/30 focus:border-error"
                      : passwordsMatch
                      ? "border-primary focus:ring-primary/30 focus:border-primary"
                      : "border-outline-variant focus:ring-primary/30 focus:border-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <span className="material-symbols-outlined text-outline text-base">
                    {showConfirm ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
              {passwordsMismatch && (
                <p className="text-xs text-error font-medium mt-1">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-primary font-medium mt-1">Passwords match</p>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-outline-variant" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                Household Details
              </span>
              <div className="flex-1 h-px bg-outline-variant" />
            </div>

            {/* Household name */}
            <div>
              <label className="text-sm font-bold text-on-surface block mb-2">
                Household Name
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-base">
                  cottage
                </span>
                <input
                  type="text"
                  value={householdName}
                  onChange={(e) => setHouseholdName(e.target.value)}
                  placeholder="e.g. The Maple Street House"
                  required
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-11 pr-4 py-3.5 text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Group size */}
            <div>
              <label className="text-sm font-bold text-on-surface block mb-2">
                Number of Roommates
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-base">
                  group
                </span>
                <select
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  required
                  className="w-full bg-surface-container-low border border-outline-variant rounded-xl pl-11 pr-4 py-3.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all appearance-none"
                >
                  <option value="" disabled>Select group size</option>
                  <option value="2">2 people</option>
                  <option value="3">3 people</option>
                  <option value="4">4 people</option>
                  <option value="5">5 people</option>
                  <option value="6">6+ people</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!!passwordsMismatch}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm hover:bg-primary-container transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Create Account
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-outline mt-8">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-outline uppercase tracking-widest mt-12">
          © 2026 DivItUp • Privacy • Terms
        </p>
      </div>
    </div>
  );
}
