"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/services/sessionStore";
import { Navbar } from "@/features/landing/layout/Navbar";
import { Hero } from "@/features/landing/features/hero/Hero";
import { HowItWorks } from "@/features/landing/features/value-props/HowItWorks";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.userType === "ADMIN") router.push("/admin");
      else if (user.userType === "STUDENT") router.push("/dashboard/estudiante");
      else router.push("/dashboard/negocio");
    }
  }, [isAuthenticated, user, router]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-grid-pattern">
      <Navbar />
      
      <main className="flex-1 flex flex-col w-full">
        <Hero />
        <HowItWorks />
      </main>

      {/* Simple Footer para completar la vista */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-black text-slate-900">
              Ventana<span className="text-blue-600">Work</span>
            </span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-blue-600 transition-colors">Términos</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-blue-600 transition-colors">Soporte</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

