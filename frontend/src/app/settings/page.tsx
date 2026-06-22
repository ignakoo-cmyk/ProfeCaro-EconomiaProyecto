"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/features/auth/services/sessionStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  User, 
  Camera, 
  CreditCard, 
  Banknote, 
  Receipt, 
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Zap,
  Lock
} from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "wallet" | "billing">("profile");
  const [name, setName] = useState(user?.fullName || "");
  const [bio, setBio] = useState("Estudiante de Ingeniería Civil · UAHurtado · Disponible tardes.");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const isPyme = user?.userType === "PYME";

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-grid-pattern">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href={isPyme ? "/negocio/panel" : "/estudiante/trabajos"}
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm">
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-slate-900">Ajustes de Cuenta</span>
          </div>
          <button onClick={logout} className="ml-auto text-sm font-semibold text-slate-400 hover:text-slate-700 transition-colors">
            Salir
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Nav */}
          <aside className="w-full md:w-56 shrink-0">
            <nav className="glass-panel bg-white rounded-2xl overflow-hidden">
              {[
                { key: "profile", label: "Perfil e Identidad", icon: User },
                { key: "wallet", label: "Medios de Pago", icon: CreditCard },
                ...(isPyme ? [{ key: "billing", label: "Facturación", icon: Receipt }] : []),
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold transition-colors border-l-2 ${
                    activeTab === item.key
                      ? "bg-blue-50 text-blue-700 border-blue-600"
                      : "text-slate-600 hover:bg-slate-50 border-transparent"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${activeTab === item.key ? "text-blue-600" : "text-slate-300"}`} />
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <div className="flex-1">

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="glass-panel bg-white rounded-2xl p-8 space-y-8">
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-1">Perfil e Identidad</h2>
                  <p className="text-sm text-slate-500">Tu información pública y datos de verificación.</p>
                </div>

                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 border-4 border-white shadow-lg overflow-hidden">
                      <img
                        src="https://i.pravatar.cc/150?img=11"
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <button className="absolute -bottom-1 -right-1 h-8 w-8 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md">
                      <Camera className="h-4 w-4 text-white" />
                    </button>
                  </div>
                  <div>
                    <button className="text-sm font-bold text-blue-600 hover:text-blue-800 border border-blue-200 bg-blue-50 px-4 py-2 rounded-xl transition-colors hover:bg-blue-100">
                      Subir nueva imagen
                    </button>
                    <p className="text-xs text-slate-400 mt-2">JPG, PNG o GIF · Máx. 2MB</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Biografía / Descripción</label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-sm text-sm resize-none"
                    />
                    <p className="text-xs text-slate-400 mt-1.5">{bio.length}/160 caracteres</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Registrado</label>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 shadow-sm">
                      <Lock className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-500 flex-1">{user?.email || "usuario@correo.com"}</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Verificado
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-200 text-sm"
                >
                  {saved ? <><CheckCircle2 className="h-4 w-4" /> ¡Guardado!</> : "Guardar Cambios"}
                </button>
              </div>
            )}

            {/* Wallet Tab */}
            {activeTab === "wallet" && (
              <div className="glass-panel bg-white rounded-2xl p-8 space-y-8">
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-1">Medios de Pago y Retiro</h2>
                  <p className="text-sm text-slate-500">Gestiona tu cuenta bancaria para recibir tus pagos.</p>
                </div>

                {/* Connected Bank Card */}
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white overflow-hidden shadow-xl">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Cuenta Vinculada</p>
                        <p className="text-sm font-bold text-white">Banco Estado · CuentaRUT</p>
                      </div>
                      <Banknote className="h-7 w-7 text-slate-400" />
                    </div>
                    <p className="text-2xl font-black tracking-[0.15em] mb-6">**** **** **** 1234</p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-500 mb-0.5">Titular</p>
                        <p className="text-sm font-bold">{user?.fullName || "Estudiante Demo"}</p>
                      </div>
                      <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Activa
                      </span>
                    </div>
                  </div>
                </div>

                {/* Update Button */}
                <button className="w-full flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-600 hover:text-blue-700 font-semibold rounded-xl transition-all text-sm group">
                  <CreditCard className="h-4 w-4 group-hover:text-blue-600" />
                  Actualizar cuenta de retiro
                </button>

                {/* Info Box */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <span className="text-amber-500 text-lg shrink-0">⚠️</span>
                  <div>
                    <p className="text-sm font-bold text-amber-800 mb-1">Pagos manuales (etapa MVP)</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      En esta etapa, los pagos se confirman mediante comprobante de transferencia bancaria. 
                      El negocio sube la foto del comprobante y tú confirmas la recepción desde tu panel.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab (Pyme only) */}
            {activeTab === "billing" && isPyme && (
              <div className="glass-panel bg-white rounded-2xl p-8 space-y-8">
                <div>
                  <h2 className="text-xl font-black text-slate-900 mb-1">Métodos de Facturación</h2>
                  <p className="text-sm text-slate-500">Configura cómo pagas por los trabajos publicados.</p>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                  <Receipt className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600 mb-1">Facturación integrada próximamente</p>
                  <p className="text-xs text-slate-400">MercadoPago / Stripe Connect en la próxima versión.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}


