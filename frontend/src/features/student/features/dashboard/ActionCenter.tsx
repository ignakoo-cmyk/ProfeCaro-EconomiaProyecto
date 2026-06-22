"use client";

import { Zap, Wallet } from "lucide-react";
import ActiveJobView from "@/features/student/features/active-job/ActiveJobView";
import { useState } from "react";

interface ActionCenterProps {
  balance: number;
}

export default function ActionCenter({ balance }: ActionCenterProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(balance);

  const handleWithdraw = () => {
    setIsWithdrawing(true);
    setTimeout(() => {
      setCurrentBalance(0);
      setIsWithdrawing(false);
      alert("Transferencia Flash a tu CuentaRUT realizada con éxito 💸");
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 sticky top-24">
      
      {/* Wallet Module */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-slate-900/20 border border-slate-800">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-400" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Saldo Disponible</p>
            </div>
          </div>
          
          <h2 className="text-4xl font-black tracking-tight">${currentBalance.toLocaleString("es-CL")}</h2>
          
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing || currentBalance === 0}
            className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 shadow-lg shadow-emerald-500/30 text-white mt-2"
          >
            {isWithdrawing ? (
              <span className="animate-pulse">Transfiriendo...</span>
            ) : (
              <><Zap className="h-4 w-4 fill-white" /> Retiro Flash</>
            )}
          </button>
        </div>
      </div>

      {/* Monitor de Turno (Active Job) */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 px-1">
          Monitor de Turno
        </h3>
        
        {/* Usamos el ActiveJobView existente que ya tiene el mapa y el WebSocket */}
        {/* Le aplicamos una envoltura para asegurar bordes redondeados y sombra suave */}
        <div className="shadow-sm rounded-3xl overflow-hidden border border-slate-200 bg-white">
          <ActiveJobView />
        </div>
      </div>

    </div>
  );
}

