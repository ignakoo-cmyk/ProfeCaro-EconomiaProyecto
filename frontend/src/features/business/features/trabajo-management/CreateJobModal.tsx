"use client";

import { useState } from "react";
import { AlertTriangle, X, CheckCircle, Clock, MapPin, FileText } from "lucide-react";
import { useAuthStore } from "@/features/auth/services/sessionStore";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateJobModal({ isOpen, onClose }: CreateJobModalProps) {
  const { token } = useAuthStore();
  const [title, setTitle] = useState("");
  const [netSalary, setNetSalary] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [complianceAgreed, setComplianceAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const platformFee = netSalary ? Math.round(parseInt(netSalary) * 0.10) : 0;
  const totalCost = netSalary ? parseInt(netSalary) + platformFee : 0;

  const applyTemplate = (type: "mesero" | "repartidor" | "inventario") => {
    if (type === "mesero") {
      setTitle("Mesero/a Extra para hora punta");
      setNetSalary("16200");
      setDescription("Se requiere apoyo en atención de mesas, servicio de bebidas y mantención del orden del área. El trabajador debe presentarse 10 min antes del inicio del turno con ropa oscura (no provista).");
    } else if (type === "repartidor") {
      setTitle("Repartidor/a de pedidos (Bicicleta propia)");
      setNetSalary("18000");
      setDescription("Retiro y entrega de pedidos a domicilio en radio de 3km. El trabajador debe contar con bicicleta propia y smartphone con datos. Se provee casco y bolsa térmica.");
    } else {
      setTitle("Ayudante de Inventario / Bodega");
      setNetSalary("10800");
      setDescription("Conteo, registro y organización de stock en bodega. Se requiere manejo básico de planillas. El trabajo es en interior, no se requiere esfuerzo físico mayor a 5kg.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complianceAgreed) return;
    setSubmitting(true);
    
    try {
      const sDate = new Date(`1970-01-01T${startTime}:00`);
      const eDate = new Date(`1970-01-01T${endTime}:00`);
      let duration = (eDate.getTime() - sDate.getTime()) / (1000 * 60 * 60);
      if (duration < 0) duration += 24;
      if (duration < 1.0) duration = 1.0;
      if (duration > 3.0) duration = 3.0; // constrained by schema

      const isoStartTime = new Date(`${startDate}T${startTime}:00`).toISOString();

      const response = await fetch("http://localhost:8009/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          price_clp: parseInt(netSalary),
          duration_hours: duration,
          start_time: isoStartTime,
          latitude: -33.444, // Default mock for location for now
          longitude: -70.655
        })
      });

      if (response.ok) {
        alert("✅ Trabajo verificado publicado con éxito. Los estudiantes cercanos serán notificados.");
        // Reset form
        setTitle(""); setNetSalary(""); setDescription(""); setStartDate(""); setStartTime(""); setEndTime(""); setLocation(""); setComplianceAgreed(false);
        onClose();
      } else {
        const err = await response.json();
        alert("Error al publicar el trabajo: " + JSON.stringify(err));
      }
    } catch (err) {
      alert("Error de conexión al publicar el trabajo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-7 pt-6 pb-5 border-b border-slate-100 flex items-start justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-orange-500 flex items-center justify-center shadow-md shadow-orange-200">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Publicar Oferta de Trabajo Verificada</h2>
              <p className="text-xs text-slate-500 mt-0.5">Complete todos los campos obligatorios con precisión legal</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">

          {/* Quick Templates */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Plantillas Rápidas Verificadas</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button type="button" onClick={() => applyTemplate("mesero")} className="shrink-0 px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-semibold text-sm hover:bg-orange-100 transition-colors">☕ Mesero/a</button>
              <button type="button" onClick={() => applyTemplate("repartidor")} className="shrink-0 px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-semibold text-sm hover:bg-orange-100 transition-colors">🚴 Repartidor/a</button>
              <button type="button" onClick={() => applyTemplate("inventario")} className="shrink-0 px-4 py-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-semibold text-sm hover:bg-orange-100 transition-colors">📦 Inventario</button>
            </div>
          </div>

          <form id="job-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Título del Puesto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Mesero/a de apoyo para turno de almuerzo"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-sm text-sm"
                required
              />
            </div>

            {/* Net Salary */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Sueldo Neto Ofrecido (CLP) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">$</span>
                <input
                  type="number"
                  value={netSalary}
                  onChange={(e) => setNetSalary(e.target.value)}
                  placeholder="16200"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-sm text-sm font-bold"
                  required
                />
              </div>
              {totalCost > 0 && (
                <div className="mt-2 bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex justify-between text-sm">
                  <div className="text-slate-600">
                    <span>Comisión plataforma (10%): </span>
                    <span className="font-semibold">${platformFee.toLocaleString("es-CL")}</span>
                  </div>
                  <div>
                    <span className="text-slate-700 font-semibold">Total a pagar: </span>
                    <span className="font-black text-slate-900">${totalCost.toLocaleString("es-CL")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Legal Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Descripción Legal y Obligaciones <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe con exactitud las tareas, condiciones de trabajo, materiales provistos y cualquier requisito específico (ej. ropa, herramientas, experiencia)..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-sm text-sm resize-none"
                required
                minLength={10}
              />
              <p className="text-xs text-slate-400 mt-1">{description.length} caracteres · Mínimo requerido: 10</p>
            </div>

            {/* Date & Time */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1 text-orange-500" />
                Horario Exacto <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1.5">Fecha</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-sm text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1.5">Hora Inicio</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-sm text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-medium block mb-1.5">Hora Fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-sm text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1 text-orange-500" />
                Ubicación Exacta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej. Av. Almirante Barroso 6, Santiago · Café Planta Baja"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all shadow-sm text-sm"
                required
              />
            </div>
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="px-7 py-5 border-t border-slate-100 bg-slate-50/80 shrink-0 space-y-4">
          {/* Compliance Notice */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Aviso de Cumplimiento:</strong> Al publicar, confirmas que este trabajo cumple con las normativas 
              locales vigentes y que la información proporcionada es veraz, precisa y <strong>vinculante</strong>. 
              La publicación de información falsa puede resultar en la suspensión de la cuenta.
            </p>
          </div>

          {/* Compliance Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={complianceAgreed}
              onChange={(e) => setComplianceAgreed(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
            />
            <span className="text-sm text-slate-700 font-medium">
              Confirmo el cumplimiento normativo y la veracidad de la información.
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            form="job-form"
            disabled={!complianceAgreed || submitting}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 ${
              complianceAgreed && !submitting
                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-200"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {submitting ? (
              <span className="animate-pulse">Publicando oferta verificada...</span>
            ) : (
              <><CheckCircle className="h-5 w-5" /> Publicar Oferta Verificada</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

