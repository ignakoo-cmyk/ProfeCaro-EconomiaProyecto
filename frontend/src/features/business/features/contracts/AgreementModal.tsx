"use client";

import { useState } from "react";
import { ShieldCheck, MapPin, Clock, X, CheckSquare, Square, FileText } from "lucide-react";

interface AgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  job: {
    title: string;
    price_clp: number;
    duration_hours: number;
    start_time: string;
    location?: string;
    tasks?: string[];
    employer_name?: string;
  };
}

export default function AgreementModal({ isOpen, onClose, onAccept, job }: AgreementModalProps) {
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const platformFee = Math.round(job.price_clp * 0.1);
  const netAmount = job.price_clp - platformFee;

  const startDate = new Date(job.start_time);
  const endDate = new Date(startDate.getTime() + job.duration_hours * 60 * 60 * 1000);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (d: Date) =>
    d.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" });

  const tasks = job.tasks || [
    "Apoyar en atención de mesas durante hora punta.",
    "Manejo de bandeja y servicio de bebidas.",
    "Mantener el orden del área asignada.",
    "Reportarse con el encargado de turno al llegar.",
  ];

  const handleConfirm = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onAccept();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-200">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Acuerdo Formal de Micro-empleo</h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Documento vinculante · VentanaWork</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">

          {/* Job Title Banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Posición Ofrecida</p>
            <p className="text-base font-black text-slate-900">{job.title}</p>
            <p className="text-xs text-slate-500 mt-1">Empleador: {job.employer_name || "Cafetería Central UAH"}</p>
          </div>

          {/* Task List */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
              <CheckSquare className="h-4 w-4 text-blue-600" />
              Detalle de Tareas y Obligaciones
            </h3>
            <ul className="space-y-2">
              {tasks.map((task, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">{i + 1}</span>
                  {task}
                </li>
              ))}
            </ul>
          </div>

          {/* Conditions: Time & Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-slate-600">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Horario Exacto</span>
              </div>
              <p className="text-xs text-slate-500 capitalize mb-1">{formatDate(startDate)}</p>
              <p className="text-base font-black text-slate-900">{formatTime(startDate)} → {formatTime(endDate)}</p>
              <p className="text-xs text-slate-500 mt-1">{job.duration_hours} hora(s) de trabajo</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-slate-600">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-bold uppercase tracking-wider">Ubicación</span>
              </div>
              <p className="text-base font-black text-slate-900">{job.location || "Cafetería Central"}</p>
              <p className="text-xs text-slate-500 mt-1">Campus UAHurtado · Av. Almirante Barroso 6</p>
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Desglose de Remuneración
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Pago bruto acordado</span>
                <span className="font-semibold">${job.price_clp.toLocaleString("es-CL")}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Comisión plataforma (10%)</span>
                <span>-${platformFee.toLocaleString("es-CL")}</span>
              </div>
              <div className="border-t border-emerald-200 pt-2 flex justify-between font-black text-base text-slate-900">
                <span>Sueldo Líquido a Recibir</span>
                <span className="text-emerald-700 text-xl">${netAmount.toLocaleString("es-CL")}</span>
              </div>
            </div>
            <p className="text-xs text-emerald-700 mt-3 bg-emerald-100 rounded-lg px-3 py-2 font-medium">
              💳 El pago se libera automáticamente al completar el turno y confirmar el empleador.
            </p>
          </div>

          {/* Legal Clauses */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-2">Cláusulas y Marco Legal</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 h-28 overflow-y-auto text-xs text-slate-500 leading-relaxed space-y-2">
              <p><strong className="text-slate-700">1. Naturaleza del Servicio:</strong> Esta contratación se enmarca como un servicio de micro-empleo por horas a través de la plataforma VentanaWork, no constituyendo relación laboral indefinida.</p>
              <p><strong className="text-slate-700">2. Responsabilidades:</strong> El prestador se compromete a cumplir puntualmente con el horario y las tareas especificadas. El incumplimiento injustificado puede resultar en penalización del nivel de prestigio.</p>
              <p><strong className="text-slate-700">3. Seguridad:</strong> El empleador declara cumplir con las condiciones mínimas de seguridad e higiene. Ante cualquier incidencia, el estudiante puede reportarla a través del Centro de Soporte de VentanaWork.</p>
              <p><strong className="text-slate-700">4. Pago:</strong> El monto líquido especificado es el monto neto garantizado. La plataforma actúa como intermediario en custodia (escrow) del pago.</p>
              <p><strong className="text-slate-700">5. Confidencialidad:</strong> Cualquier información del negocio a la que se tenga acceso durante el turno debe ser tratada con total confidencialidad.</p>
            </div>
          </div>

        </div>

        {/* Fixed Footer: Checkbox + Button */}
        <div className="px-7 py-5 border-t border-slate-100 bg-white shrink-0 space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <button
              type="button"
              onClick={() => setAccepted(!accepted)}
              className="mt-0.5 shrink-0 transition-colors"
            >
              {accepted
                ? <CheckSquare className="h-5 w-5 text-blue-600" />
                : <Square className="h-5 w-5 text-slate-400 group-hover:text-blue-400" />
              }
            </button>
            <span className="text-sm text-slate-700 leading-snug">
              He leído, comprendo y acepto las condiciones formales del trabajo.
              Entiendo que este acuerdo es <strong className="text-slate-900">vinculante</strong>.
            </span>
          </label>

          <button
            onClick={handleConfirm}
            disabled={!accepted || submitting}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
              accepted && !submitting
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <span className="animate-pulse">Confirmando compromiso...</span>
            ) : (
              <>
                <ShieldCheck className="h-5 w-5" />
                Aceptar y Confirmar Compromiso
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
