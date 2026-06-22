"use client";

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        
        {/* Logo */}
        <Link href="/" className="group">
          <Logo size="md" />
        </Link>

        {/* CTA Buttons */}
        <div className="flex items-center gap-4">
          <Link 
            href="/login" 
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 bg-transparent px-4 py-2 rounded-xl transition-colors hidden sm:block"
          >
            Iniciar Sesión
          </Link>
          <Link 
            href="/register" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-200"
          >
            Unirse Gratis
          </Link>
        </div>
        
      </div>
    </nav>
  );
};

