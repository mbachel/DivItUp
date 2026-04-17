"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginWithPassword } from "@/lib/authClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await loginWithPassword(email.trim(), password);
      router.replace("/");
      router.refresh();
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : "Unable to log in";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-slate-800">
        <img
          src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&auto=format&fit=crop&q=80"
          alt="A warm, harmonious living room"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 z-10">
            <img
                src="/DivItUpLogo.png"
                alt="DivItUp"
                className="w-24 object-contain"
            />
        </Link>

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

      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-20 bg-white">
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

          {error ? (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <form onSubmit={handleLogin} className="space-y-5">
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

            <div>
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold text-sm hover:bg-primary-container transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Logging In..." : "Log In"}
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-outline uppercase tracking-widest mt-12">
          © 2026 DivItUp
        </p>
      </div>
    </div>
  );
}
