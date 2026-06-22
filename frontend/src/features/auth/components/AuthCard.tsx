"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, GraduationCap, Store, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../services/sessionStore';

interface AuthCardProps {
  type: 'login' | 'register';
}

export const AuthCard = ({ type }: AuthCardProps) => {
  const router = useRouter();
  const { login, register, isLoading, error, clearError } = useAuthStore();
  
  const [viewMode, setViewMode] = useState<'login' | 'register'>(type);
  const [role, setRole] = useState<'STUDENT' | 'PYME'>('STUDENT');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Nuevo estado unificado para campos dinámicos
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    rut: '',
    address: '',
    university: '',
    birthDate: '',
    businessName: '',
    category: ''
  });

  const [localError, setLocalError] = useState<string | null>(null);

  const isLogin = viewMode === 'login';

  const updateForm = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    setViewMode(type);
  }, [type]);

  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [viewMode, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (!isLogin) {
      if (role === 'STUDENT' && (!formData.firstName || !formData.lastName || !formData.rut)) {
        setLocalError('Por favor completa tu nombre, apellidos y RUT.');
        return;
      }
      if (role === 'PYME' && (!formData.businessName || !formData.rut)) {
        setLocalError('Por favor completa el nombre del local y su RUT.');
        return;
      }
    }

    try {
      if (isLogin) {
        // Usa el rol retornado por el backend
        const result = await login(email, password);
        if (result.success && result.role) {
          redirectUser(result.role as 'STUDENT' | 'PYME' | 'ADMIN');
        }
      } else {
        const registerRole = role === 'STUDENT' ? 'student' : 'business';
        const finalName = role === 'STUDENT' 
          ? `${formData.firstName} ${formData.lastName}`
          : formData.businessName;

        // Aquí enviaríamos todos los datos adicionales al backend real
        // register({ email, password, name: finalName, role: registerRole, ...formData })
        
        const result = await register({
          email,
          password,
          name: finalName,
          role: registerRole,
        });
        
        if (result.success && result.role) {
          redirectUser(result.role as 'STUDENT' | 'PYME' | 'ADMIN');
        }
      }
    } catch {
      setLocalError('Ocurrió un error inesperado. Por favor intenta de nuevo.');
    }
  };

  const redirectUser = (userRole: 'STUDENT' | 'PYME' | 'ADMIN') => {
    if (userRole === 'ADMIN') {
      router.push('/admin');
    } else if (userRole === 'PYME') {
      router.push('/negocio/panel');
    } else {
      router.push('/estudiante/trabajos');
    }
  };

  const handleSSOClick = (provider: string) => {
    alert(`El inicio de sesión con ${provider} estará disponible próximamente.`);
  };

  const handleTabChange = (newMode: 'login' | 'register') => {
    setViewMode(newMode);
    window.history.pushState(null, '', `/${newMode}`);
  };

  return (
    <div className="w-full bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 transition-all duration-300">
      
      {/* Tabs / Toggle Animado para Login/Registro */}
      <div className="flex p-1 bg-slate-100/80 backdrop-blur rounded-2xl mb-8 relative">
        <button
          type="button"
          onClick={() => handleTabChange('login')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${
            viewMode === 'login' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('register')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 z-10 ${
            viewMode === 'register' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Crear Cuenta
        </button>
        
        {/* Animated Background Pill para los Tabs */}
        <div 
          className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-sm transition-transform duration-300 ease-spring z-0 ${
            viewMode === 'login' ? 'translate-x-0' : 'translate-x-[calc(100%+8px)]'
          }`}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight transition-all duration-300">
          {isLogin ? '¡Hola de nuevo!' : 'Únete a VentanaWork'}
        </h2>
        <p className="text-slate-500 mt-2 transition-all duration-300">
          {isLogin 
            ? 'Ingresa tus credenciales para continuar.' 
            : 'Crea tu perfil y empieza a conectar con tu entorno local.'}
        </p>
      </div>

      {/* Role Selector para Estudiante o Negocio */}
      <div className="flex p-1 bg-slate-50 border border-slate-100 rounded-2xl mb-8 animate-fade-in">
        <button
          type="button"
          onClick={() => setRole('STUDENT')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
            role === 'STUDENT' 
              ? 'bg-white text-blue-600 shadow-sm border border-slate-100' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Soy Estudiante
        </button>
        <button
          type="button"
          onClick={() => setRole('PYME')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 ${
            role === 'PYME' 
              ? 'bg-white text-orange-600 shadow-sm border border-slate-100' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Store className="w-4 h-4" />
          Tengo un Negocio
        </button>
      </div>

      {/* Error messages */}
      {(error || localError) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error detectado</p>
            <p className="text-red-500/90">{error || localError}</p>
          </div>
        </div>
      )}

      {/* Formulario Dinámico */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* CAMPOS DE REGISTRO CONDICIONALES */}
        {!isLogin && (
          <div className="animate-fade-in space-y-5">
            {role === 'STUDENT' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Nombres</label>
                    <input type="text" placeholder="Ej: Juan Diego" value={formData.firstName} onChange={(e) => updateForm('firstName', e.target.value)} disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 disabled:opacity-60 hover:bg-slate-100 focus:hover:bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Apellidos</label>
                    <input type="text" placeholder="Ej: Pérez Silva" value={formData.lastName} onChange={(e) => updateForm('lastName', e.target.value)} disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 disabled:opacity-60 hover:bg-slate-100 focus:hover:bg-white" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">RUT</label>
                    <input type="text" placeholder="Ej: 12345678-9" value={formData.rut} onChange={(e) => updateForm('rut', e.target.value)} disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 disabled:opacity-60 hover:bg-slate-100 focus:hover:bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Fecha de Nacimiento</label>
                    <input type="date" value={formData.birthDate} onChange={(e) => updateForm('birthDate', e.target.value)} disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 disabled:opacity-60 hover:bg-slate-100 focus:hover:bg-white text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Dirección</label>
                  <input type="text" placeholder="Ej: Av. Alameda 123, Santiago Centro" value={formData.address} onChange={(e) => updateForm('address', e.target.value)} disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 disabled:opacity-60 hover:bg-slate-100 focus:hover:bg-white" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Universidad</label>
                  <input type="text" placeholder="Ej: Universidad Alberto Hurtado" value={formData.university} onChange={(e) => updateForm('university', e.target.value)} disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 disabled:opacity-60 hover:bg-slate-100 focus:hover:bg-white" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nombre del local o empresa</label>
                  <input type="text" placeholder="Ej: Minimarket Los Pepes" value={formData.businessName} onChange={(e) => updateForm('businessName', e.target.value)} disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 disabled:opacity-60 hover:bg-slate-100 focus:hover:bg-white" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">RUT del local / Empresa</label>
                    <input type="text" placeholder="Ej: 76.123.456-7" value={formData.rut} onChange={(e) => updateForm('rut', e.target.value)} disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 disabled:opacity-60 hover:bg-slate-100 focus:hover:bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Categoría del negocio</label>
                    <select value={formData.category} onChange={(e) => updateForm('category', e.target.value)} disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 disabled:opacity-60 hover:bg-slate-100 focus:hover:bg-white appearance-none">
                      <option value="">Selecciona una opción</option>
                      <option value="Minimarket">Minimarket</option>
                      <option value="Cafetería">Cafetería / Restaurante</option>
                      <option value="Librería">Librería</option>
                      <option value="Retail">Retail / Tienda</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Dirección del local</label>
                  <input type="text" placeholder="Ej: Av. Brasil 456, Santiago Centro" value={formData.address} onChange={(e) => updateForm('address', e.target.value)} disabled={isLoading} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 disabled:opacity-60 hover:bg-slate-100 focus:hover:bg-white" />
                </div>
              </>
            )}
          </div>
        )}

        {/* CAMPOS COMUNES: EMAIL Y PASSWORD */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            {!isLogin && role === 'PYME' ? 'Correo electrónico del responsable' : 'Correo electrónico'}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Mail className="w-5 h-5" />
            </div>
            <input 
              type="email" 
              placeholder={(!isLogin && role === 'PYME') ? 'contacto@minegocio.cl' : 'nombre@correo.cl'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 disabled:opacity-60 hover:bg-slate-100 focus:hover:bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Contraseña</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-slate-900 disabled:opacity-60 hover:bg-slate-100 focus:hover:bg-white"
            />
          </div>
        </div>

        {isLogin && (
          <div className="flex justify-end">
            <Link href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        )}

        <button 
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 active:translate-y-0 active:shadow-blue-200 disabled:opacity-75 disabled:pointer-events-none focus:ring-4 focus:ring-blue-500/20 outline-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <span>{isLogin ? 'Ingresar a mi cuenta' : 'Crear mi cuenta'}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* SSO Divider */}
      <div className="mt-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-200"></div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">O continúa con</span>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      {/* SSO Buttons */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <button 
          onClick={() => handleSSOClick('Google')}
          type="button"
          className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all hover:-translate-y-0.5 focus:ring-4 focus:ring-slate-100 outline-none"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-sm font-bold text-slate-700">Google</span>
        </button>
        <button 
          onClick={() => handleSSOClick('Microsoft')}
          type="button"
          className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all hover:-translate-y-0.5 focus:ring-4 focus:ring-slate-100 outline-none"
        >
          <svg viewBox="0 0 23 23" className="w-5 h-5">
            <path fill="#f35325" d="M1 1h10v10H1z"/>
            <path fill="#81bc06" d="M12 1h10v10H12z"/>
            <path fill="#05a6f0" d="M1 12h10v10H1z"/>
            <path fill="#ffba08" d="M12 12h10v10H12z"/>
          </svg>
          <span className="text-sm font-bold text-slate-700">Microsoft</span>
        </button>
      </div>

    </div>
  );
};



